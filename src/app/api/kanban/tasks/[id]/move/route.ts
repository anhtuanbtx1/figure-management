import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
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
    const taskResult = await executeQuery<any>(
      `SELECT ColumnId FROM zen50558_ManagementStore.dbo.KanbanTasks WHERE Id=@id`,
      { id: { type: sql.NVarChar, value: id } }
    );
    const task = taskResult[0];
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

    // Reindex both columns to keep order sequential using a CTE
    const reindexColumn = async (colId: string) => {
      await executeQuery(
        `WITH IndexedTasks AS (
            SELECT Id, ROW_NUMBER() OVER(ORDER BY ThuTu ASC, NgayCapNhat DESC, NgayTao ASC) as RowNum
            FROM zen50558_ManagementStore.dbo.KanbanTasks
            WHERE BoardId=@boardId AND ColumnId=@colId AND IsActive=1
         )
         UPDATE T
         SET T.ThuTu = I.RowNum
         FROM zen50558_ManagementStore.dbo.KanbanTasks T
         INNER JOIN IndexedTasks I ON T.Id = I.Id`,
        {
          boardId: { type: sql.NVarChar, value: boardId },
          colId: { type: sql.NVarChar, value: colId },
        }
      );
    };

    // Reindex source and destination columns
    if (sourceColumnId && sourceColumnId !== toColumnId) {
      await reindexColumn(sourceColumnId);
    }
    await reindexColumn(toColumnId);

    return NextResponse.json({ success: true, message: 'Task moved' });
  } catch (error) {
    console.error('❌ Error moving task:', error);
    return NextResponse.json({ success: false, message: 'Failed to move task' }, { status: 500 });
  }
}
