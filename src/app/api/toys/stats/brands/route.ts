import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/toys/stats/brands - Return counts of toys grouped by brand
// Optional query params:
//   - status: filter by status value (e.g., 'active'); default: active records (IsActive=1)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereConds: string[] = [];
    const params: Record<string, any> = {};

    // soft-active by default
    whereConds.push('t.IsActive = 1');

    if (status && status !== 'all') {
      whereConds.push('t.Status = @Status');
      params.Status = status;
    }

    const whereClause = whereConds.length ? `WHERE ${whereConds.join(' AND ')}` : '';

    const sql = `
      SELECT
        ISNULL(b.Name, '') AS name,
        COUNT(*) AS count
      FROM zen50558_ManagementStore.dbo.Toys t
      LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
      ${whereClause}
      GROUP BY b.Name
      ORDER BY COUNT(*) DESC
    `;

    const rows = await executeQuery(sql, params);

    // Color mapping for known brands; fallback to a neutral color
    const colorMap: Record<string, string> = {
      'LEGO': '#ffcb05',
      'Mattel': '#e91e63',
      'Hasbro': '#2196f3',
      'Fisher-Price': '#4caf50',
    };

    const brands = (rows || []).map((r: any) => ({
      name: r.name || 'Khác',
      count: Number(r.count || 0),
      color: colorMap[r.name] || '#9e9e9e',
    }));

    return NextResponse.json({ success: true, brands }, { status: 200 });
  } catch (error) {
    console.error('❌ Failed to get brand stats:', error);
    return NextResponse.json({ success: false, brands: [], error: 'Failed to get brand stats' }, { status: 500 });
  }
}

