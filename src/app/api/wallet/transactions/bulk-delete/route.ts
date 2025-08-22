import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// POST /api/wallet/transactions/bulk-delete
// Body: { ids: string[] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = body?.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'ids must be a non-empty array' }, { status: 400 });
    }

    // Soft delete: set IsActive = 0 for matching IDs
    // Build parameterized IN clause safely
    const params: Record<string, any> = {};
    const placeholders = ids.map((id, idx) => {
      const key = `id${idx}`;
      params[key] = id;
      return `@${key}`;
    }).join(', ');

    const sql = `
      UPDATE zen50558_ManagementStore.dbo.WalletTransactions
      SET IsActive = 0
      WHERE Id IN (${placeholders})
    `;

    await executeQuery(sql, params);

    return NextResponse.json({ success: true, message: `Deleted ${ids.length} transactions` });
  } catch (error) {
    console.error('❌ Error bulk deleting wallet transactions:', error);
    return NextResponse.json({ success: false, message: 'Failed to bulk delete transactions' }, { status: 500 });
  }
}

