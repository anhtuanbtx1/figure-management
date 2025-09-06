import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/kanban/columns - fetch all columns for a board
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId') || 'board-1';

    const query = `
      SELECT 
        Id as id,
        BoardId as boardId,
        TenCot as name,
        MaCot as code,
        ThuTu as orderIndex,
        NgayTao as createdAt,
        NgayCapNhat as updatedAt,
        IsActive as isActive
      FROM zen50558_ManagementStore.dbo.KanbanColumns
      WHERE BoardId = @boardId AND IsActive = 1
      ORDER BY ThuTu ASC
    `;

    const rows = await executeQuery(query, { boardId });

    // Check if we have all 4 expected columns, create missing ones
    const expectedColumns = [
      { id: 'col-todo', name: 'Cần làm', code: 'todo', order: 1 },
      { id: 'col-progress', name: 'Đang thực hiện', code: 'progress', order: 2 },
      { id: 'col-pending', name: 'Chờ xử lý', code: 'pending', order: 3 },
      { id: 'col-done', name: 'Hoàn thành', code: 'done', order: 4 },
    ];

    const existingIds = new Set(rows.map(r => r.id));
    const missingColumns = expectedColumns.filter(col => !existingIds.has(col.id));

    if (missingColumns.length > 0) {
      console.log(`🔧 Creating ${missingColumns.length} missing columns...`);

      for (const col of missingColumns) {
        await executeQuery(`
          INSERT INTO zen50558_ManagementStore.dbo.KanbanColumns
          (Id, BoardId, TenCot, MaCot, ThuTu, NgayTao, NgayCapNhat, IsActive)
          VALUES (@id, @boardId, @name, @code, @order, SYSUTCDATETIME(), SYSUTCDATETIME(), 1)
        `, {
          id: col.id,
          boardId,
          name: col.name,
          code: col.code,
          order: col.order,
        });
      }

      // Fetch all columns again (existing + newly created)
      const allRows = await executeQuery(query, { boardId });
      return NextResponse.json({
        success: true,
        message: `Columns fetched successfully (${missingColumns.length} created)`,
        data: allRows,
        count: allRows.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Columns fetched successfully',
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('❌ Error fetching kanban columns:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch columns', 
      data: [], 
      count: 0 
    }, { status: 500 });
  }
}
