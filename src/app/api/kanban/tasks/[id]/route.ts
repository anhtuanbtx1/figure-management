import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

// PUT /api/kanban/tasks/[id] - update a task
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { title, description, priority, assignee, columnId, startDate, endDate, orderIndex, metadata } = body || {};

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
          NgayBatDau = CASE WHEN @updateDates = 1 THEN @startDate ELSE NgayBatDau END,
          NgayKetThuc = CASE WHEN @updateDates = 1 THEN @endDate ELSE NgayKetThuc END,
          ThuTu = ISNULL(@orderIndex, ThuTu),
          Metadata = ISNULL(@metadata, Metadata),
          NgayCapNhat = SYSUTCDATETIME()
      WHERE Id=@id AND IsActive=1
    `;

    // We pass a flag to tell the query whether to update dates since we might explicitly want to set them to null.
    // If startDate/endDate properties are completely undefined in the payload, don't update them.
    const updateDates = (startDate !== undefined || endDate !== undefined) ? 1 : 0;

    await executeQuery(updateQuery, {
      id: { type: sql.NVarChar, value: id },
      title: { type: sql.NVarChar, value: title ?? null },
      description: { type: sql.NVarChar, value: description ?? null },
      priority: { type: sql.NVarChar, value: priority ?? null },
      assignee: { type: sql.NVarChar, value: assignee ?? null },
      columnId: { type: sql.NVarChar, value: columnId ?? null },
      updateDates: { type: sql.Bit, value: updateDates },
      startDate: { type: sql.DateTime, value: startDate ? new Date(startDate) : null },
      endDate: { type: sql.DateTime, value: endDate ? new Date(endDate) : null },
      orderIndex: { type: sql.Int, value: orderIndex ?? null },
      metadata: { type: sql.NVarChar, value: metadata ?? null },
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
