import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/database';

// PUT /api/kanban/tasks/[id]/move - move task between columns and reorder
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { boardId = 'board-1', fromColumnId, toColumnId, toPosition } = body || {};

    if (!toColumnId || typeof toPosition !== 'number') {
      return NextResponse.json({ success: false, message: 'toColumnId và toPosition là bắt buộc' }, { status: 400 });
    }

    // Get current column of the task
    const [task] = await executeQuery<any>(
      `SELECT ColumnId FROM zen50558_ManagementStore.dbo.KanbanTasks WHERE Id=@id`,
      { id }
    );

    const sourceColumnId = fromColumnId || task?.ColumnId;

    // Shift tasks in destination column to make room
    await executeQuery(
      `UPDATE zen50558_ManagementStore.dbo.KanbanTasks
       SET ThuTu = ThuTu + 1
       WHERE BoardId=@boardId AND ColumnId=@toColumnId AND IsActive=1 AND ThuTu >= @toPosition`,
      { boardId, toColumnId, toPosition }
    );

    // Move the task
    await executeQuery(
      `UPDATE zen50558_ManagementStore.dbo.KanbanTasks
       SET ColumnId=@toColumnId, ThuTu=@toPosition, NgayCapNhat=SYSUTCDATETIME()
       WHERE Id=@id`,
      { id, toColumnId, toPosition }
    );

    // Reindex both columns to keep order sequential (use SP if available, fallback to inline SQL)
    const reindexInline = async (colId: string) => {
      const sql = `WITH Ordered AS (
        SELECT Id, ROW_NUMBER() OVER (ORDER BY ThuTu, NgayCapNhat) AS rn
        FROM zen50558_ManagementStore.dbo.KanbanTasks
        WHERE BoardId = @boardId AND ColumnId = @colId AND IsActive = 1
      )
      UPDATE t SET ThuTu = o.rn
      FROM zen50558_ManagementStore.dbo.KanbanTasks t
      JOIN Ordered o ON t.Id = o.Id`;
      await executeQuery(sql, { boardId, colId });
    };

    try {
      await executeStoredProcedure('zen50558_ManagementStore.dbo.sp_Kanban_ReindexColumn', { BoardId: boardId, ColumnId: sourceColumnId });
      await executeStoredProcedure('zen50558_ManagementStore.dbo.sp_Kanban_ReindexColumn', { BoardId: boardId, ColumnId: toColumnId });
    } catch (e) {
      await reindexInline(sourceColumnId);
      await reindexInline(toColumnId);
    }

    return NextResponse.json({ success: true, message: 'Task moved' });
  } catch (error) {
    console.error('❌ Error moving task:', error);
    return NextResponse.json({ success: false, message: 'Failed to move task' }, { status: 500 });
  }
}

