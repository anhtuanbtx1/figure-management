import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/database';
import sql from 'mssql';

// PUT /api/kanban/tasks/[id]/move - move task between columns and reorder
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { boardId = 'board-1', fromColumnId, toColumnId, toPosition } = body || {};

    if (!toColumnId || typeof toPosition !== 'number') {
      return NextResponse.json({ success: false, message: 'toColumnId and toPosition are required' }, { status: 400 });
    }

    // Get current column of the task
    const [task] = await executeQuery<any>(
      `SELECT ColumnId FROM zen50558_ManagementStore.dbo.KanbanTasks WHERE Id=@id`,
      { id: { type: sql.NVarChar, value: id } }
    );

    const sourceColumnId = fromColumnId || task?.ColumnId;

    // Shift tasks in destination column to make room
    await executeQuery(
      `UPDATE zen50558_ManagementStore.dbo.KanbanTasks
       SET ThuTu = ThuTu + 1
       WHERE BoardId=@boardId AND ColumnId=@toColumnId AND IsActive=1 AND ThuTu >= @toPosition`,
      {
        boardId: { type: sql.NVarChar, value: boardId },
        toColumnId: { type: sql.NVarChar, value: toColumnId },
        toPosition: { type: sql.Int, value: toPosition },
      }
    );

    // Move the task
    await executeQuery(
      `UPDATE zen50558_ManagementStore.dbo.KanbanTasks
       SET ColumnId=@toColumnId, ThuTu=@toPosition, NgayCapNhat=SYSUTCDATETIME()
       WHERE Id=@id`,
      {
        id: { type: sql.NVarChar, value: id },
        toColumnId: { type: sql.NVarChar, value: toColumnId },
        toPosition: { type: sql.Int, value: toPosition },
      }
    );

    // Reindex both columns to keep order sequential
    const reindexColumn = async (colId: string) => {
      await executeStoredProcedure('zen50558_ManagementStore.dbo.sp_Kanban_ReindexColumn', {
        BoardId: { type: sql.NVarChar, value: boardId },
        ColumnId: { type: sql.NVarChar, value: colId },
      });
    };

    // Reindex source and destination columns
    if (sourceColumnId) {
      await reindexColumn(sourceColumnId);
    }
    await reindexColumn(toColumnId);

    return NextResponse.json({ success: true, message: 'Task moved' });
  } catch (error) {
    console.error('❌ Error moving task:', error);
    return NextResponse.json({ success: false, message: 'Failed to move task' }, { status: 500 });
  }
}
