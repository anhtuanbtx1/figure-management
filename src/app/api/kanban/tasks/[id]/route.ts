import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

export const dynamic = 'force-dynamic';


// PUT /api/kanban/tasks/[id] - update a task
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { title, description, priority, assignee, columnId, startDate, endDate, orderIndex, metadata } = body || {};

    const checkQuery = `SELECT Id, ColumnId FROM ManagementStore.dbo.KanbanTasks WHERE Id=@id AND IsActive=1`;
    const checkResult = await executeQuery<any>(checkQuery, { id: { type: sql.NVarChar(50), value: id } });
    if (checkResult.length === 0) {
      return NextResponse.json({ success: false, message: 'Task not found', data: null }, { status: 404 });
    }
    const currentTask = checkResult[0];

    const updateFields: string[] = [];
    const queryParams: Record<string, any> = {
      id: { type: sql.NVarChar(50), value: id }
    };

    if (title !== undefined) {
      updateFields.push('TieuDe = @title');
      queryParams.title = { type: sql.NVarChar(255), value: title };
    }
    if (description !== undefined) {
      updateFields.push('MoTa = @description');
      queryParams.description = { type: sql.NVarChar(sql.MAX), value: description };
    }
    if (priority !== undefined) {
      updateFields.push('DoUuTien = @priority');
      queryParams.priority = { type: sql.NVarChar(20), value: priority };
    }
    if (assignee !== undefined) {
      updateFields.push('NguoiDuocGan = @assignee');
      queryParams.assignee = { type: sql.NVarChar(255), value: assignee };
    }
    if (columnId !== undefined) {
      updateFields.push('ColumnId = @columnId');
      queryParams.columnId = { type: sql.NVarChar(50), value: columnId };

      // If column changes and no orderIndex is provided, put it at the end of the new column
      if (columnId !== currentTask.ColumnId && orderIndex === undefined) {
        const nextOrderQuery = `
          SELECT ISNULL(MAX(ThuTu), 0) + 1 AS nextOrder
          FROM ManagementStore.dbo.KanbanTasks
          WHERE ColumnId = @toColId AND IsActive = 1
        `;
        const [{ nextOrder }] = await executeQuery<any>(nextOrderQuery, { toColId: { type: sql.NVarChar(50), value: columnId } });
        updateFields.push('ThuTu = @autoOrderIndex');
        queryParams.autoOrderIndex = { type: sql.Int, value: nextOrder };
      }
    }
    if (startDate !== undefined) {
      updateFields.push('NgayBatDau = @startDate');
      queryParams.startDate = { type: sql.DateTime, value: startDate ? new Date(startDate) : null };
    }
    if (endDate !== undefined) {
      updateFields.push('NgayKetThuc = @endDate');
      queryParams.endDate = { type: sql.DateTime, value: endDate ? new Date(endDate) : null };
    }
    if (orderIndex !== undefined) {
      updateFields.push('ThuTu = @orderIndex');
      queryParams.orderIndex = { type: sql.Int, value: orderIndex };
    }
    if (metadata !== undefined) {
      updateFields.push('Metadata = @metadata');
      queryParams.metadata = { type: sql.NVarChar(200), value: metadata };
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: true, message: 'No changes provided', data: { id } });
    }

    updateFields.push('NgayCapNhat = SYSUTCDATETIME()');

    const updateQuery = `
      UPDATE ManagementStore.dbo.KanbanTasks
      SET ${updateFields.join(', ')}
      WHERE Id=@id AND IsActive=1
    `;

    await executeQuery(updateQuery, queryParams);

    return NextResponse.json({ success: true, message: 'Task updated', data: { id } });
  } catch (error) {
    console.error('❌ Error updating task:', error);
    return NextResponse.json({ success: false, message: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/kanban/tasks/[id] - soft delete
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const deleteQuery = `UPDATE ManagementStore.dbo.KanbanTasks SET IsActive=0, NgayCapNhat=SYSUTCDATETIME() WHERE Id=@id`;
    await executeQuery(deleteQuery, { id: { type: sql.NVarChar, value: id } });
    return NextResponse.json({ success: true, message: 'Task deleted', data: { id } });
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete task' }, { status: 500 });
  }
}
