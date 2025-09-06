import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/toys/count - Return total number of toys (active by default)
// Optional query params:
//   - status: filter by status value (e.g., 'active', 'inactive', 'out_of_stock', 'discontinued')
//              If omitted, counts all active toys (IsActive = 1)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereConds: string[] = [];
    const params: Record<string, any> = {};

    // By default, count only active records (soft-delete aware)
    whereConds.push('t.IsActive = 1');

    if (status && status !== 'all') {
      whereConds.push('t.Status = @Status');
      params.Status = status;
    }

    const whereClause = whereConds.length ? `WHERE ${whereConds.join(' AND ')}` : '';

    const sql = `
      SELECT COUNT(*) AS total
      FROM zen50558_ManagementStore.dbo.Toys t
      ${whereClause}
    `;

    const rows = await executeQuery(sql, params);
    const total = Number(rows?.[0]?.total || 0);

    return NextResponse.json({ success: true, total }, { status: 200 });
  } catch (error) {
    console.error('❌ Failed to get toys count:', error);
    return NextResponse.json({ success: false, total: 0, error: 'Failed to get toys count' }, { status: 500 });
  }
}

