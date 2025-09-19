import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

// PUT /api/kanban/tasks/[id] - update a task
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { title, description, priority, assignee, columnId, orderIndex, metadata } = body || {};

    const checkQuery = `SELECT Id FROM zen50558_ManagementStore.dbo.KanbanTasks WHERE Id=@id AND IsActive=1`;
    const exists = await executeQuery(checkQuery, { id: { type: sql.NVarChar, value: id } });
    if (exists.length === 0) {
      return NextResponse.json({ success: false, message: 'Task not found', data: null }, { status: 404 });
    }

    const updateQuery = `
      UPDATE zen50558_ManagementStore.dbo.KanbanTasks
      SET TieuDe = ISNULL(@title, TieuDe),
          MoTa = ISNULL(@description, MoTa),
          DoUuTien = ISNULL(@priority, DoUuTien),
          NguoiDuocGan = ISNULL(@assignee, NguoiDuocGan),
          ColumnId = ISNULL(@columnId, ColumnId),
          ThuTu = ISNULL(@orderIndex, ThuTu),
          Metadata = ISNULL(@metadata, Metadata),
          NgayCapNhat = SYSUTCDATETIME()
      WHERE Id=@id AND IsActive=1
    `;
    await executeQuery(updateQuery, {
      id: { type: sql.NVarChar, value: id },
      title: { type: sql.NVarChar, value: title },
      description: { type: sql.NVarChar, value: description },
      priority: { type: sql.NVarChar, value: priority },
      assignee: { type: sql.NVarChar, value: assignee },
      columnId: { type: sql.NVarChar, value: columnId },
      orderIndex: { type: sql.Int, value: orderIndex },
      metadata: { type: sql.NVarChar, value: metadata },
    });

    return NextResponse.json({ success: true, message: 'Task updated', data: { id } });
  } catch (error) {
    console.error('❌ Error updating task:', error);
    return NextResponse.json({ success: false, message: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/kanban/tasks/[id] - soft delete
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const deleteQuery = `UPDATE zen50558_ManagementStore.dbo.KanbanTasks SET IsActive=0, NgayCapNhat=SYSUTCDATETIME() WHERE Id=@id`;
    await executeQuery(deleteQuery, { id: { type: sql.NVarChar, value: id } });
    return NextResponse.json({ success: true, message: 'Task deleted', data: { id } });
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete task' }, { status: 500 });
  }
}
