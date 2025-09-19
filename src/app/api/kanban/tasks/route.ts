import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

// GET /api/kanban/tasks - list tasks (optionally by boardId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId') || 'board-1';

    const query = `
      SELECT 
        t.Id as id,
        t.BoardId as boardId,
        t.ColumnId as columnId,
        c.TenCot as columnName,
        c.ThuTu as columnOrder,
        t.TieuDe as title,
        t.MoTa as description,
        t.DoUuTien as priority,
        t.ThuTu as orderIndex,
        t.NguoiDuocGan as assignee,
        t.Metadata as metadata,
        t.NgayTao as createdAt,
        t.NgayCapNhat as updatedAt,
        t.IsActive as isActive
      FROM zen50558_ManagementStore.dbo.KanbanTasks t
      LEFT JOIN zen50558_ManagementStore.dbo.KanbanColumns c ON c.Id = t.ColumnId AND c.IsActive = 1
      WHERE t.IsActive = 1 AND t.BoardId = @boardId
      ORDER BY c.ThuTu ASC, t.ThuTu ASC
    `;

    const rows = await executeQuery(query, { boardId: { type: sql.NVarChar, value: boardId } });

    return NextResponse.json({
      success: true,
      message: 'Tasks fetched successfully',
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('❌ Error fetching kanban tasks:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch tasks', data: [], count: 0 }, { status: 500 });
  }
}

// POST /api/kanban/tasks - create new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      boardId = 'board-1',
      columnId,
      title,
      description = '',
      priority = 'Trung bình',
      assignee = null,
      metadata = null,
    } = body || {};

    if (!columnId || !title) {
      return NextResponse.json({ success: false, message: 'columnId and title are required', data: null }, { status: 400 });
    }

    const id = `task-${Date.now()}`;

    // Determine next order index in the column
    const nextOrderQuery = `
      SELECT ISNULL(MAX(ThuTu), 0) + 1 AS nextOrder
      FROM zen50558_ManagementStore.dbo.KanbanTasks
      WHERE BoardId = @boardId AND ColumnId = @columnId AND IsActive = 1
    `;
    const [{ nextOrder }] = await executeQuery(nextOrderQuery, {
      boardId: { type: sql.NVarChar, value: boardId },
      columnId: { type: sql.NVarChar, value: columnId },
    });

    const insertQuery = `
      INSERT INTO zen50558_ManagementStore.dbo.KanbanTasks
      (Id, BoardId, ColumnId, TieuDe, MoTa, DoUuTien, ThuTu, NguoiDuocGan, Metadata)
      VALUES (@id, @boardId, @columnId, @title, @description, @priority, @orderIndex, @assignee, @metadata)
    `;

    await executeQuery(insertQuery, {
      id: { type: sql.NVarChar, value: id },
      boardId: { type: sql.NVarChar, value: boardId },
      columnId: { type: sql.NVarChar, value: columnId },
      title: { type: sql.NVarChar, value: title },
      description: { type: sql.NVarChar, value: description },
      priority: { type: sql.NVarChar, value: priority },
      orderIndex: { type: sql.Int, value: nextOrder },
      assignee: { type: sql.NVarChar, value: assignee },
      metadata: { type: sql.NVarChar, value: metadata },
    });

    const fetchQuery = `
      SELECT t.Id as id, t.BoardId as boardId, t.ColumnId as columnId, c.TenCot as columnName, c.ThuTu as columnOrder,
             t.TieuDe as title, t.MoTa as description, t.DoUuTien as priority, t.ThuTu as orderIndex,
             t.NguoiDuocGan as assignee, t.Metadata as metadata, t.NgayTao as createdAt, t.NgayCapNhat as updatedAt
      FROM zen50558_ManagementStore.dbo.KanbanTasks t
      LEFT JOIN zen50558_ManagementStore.dbo.KanbanColumns c ON c.Id = t.ColumnId
      WHERE t.Id = @id
    `;

    const [created] = await executeQuery(fetchQuery, { id: { type: sql.NVarChar, value: id } });

    return NextResponse.json({ success: true, message: 'Task created', data: created });
  } catch (error) {
    console.error('❌ Error creating task:', error);
    return NextResponse.json({ success: false, message: 'Failed to create task', data: null }, { status: 500 });
  }
}
