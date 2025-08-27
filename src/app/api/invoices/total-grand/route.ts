import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/database';

// GET /api/invoices/total-grand
export async function GET(_request: NextRequest) {
  try {
    const rows = await executeStoredProcedure('sp_GetInvoiceGrandTotalSum');
    const total = rows?.[0]?.TotalGrandTotal ?? 0;
    return NextResponse.json({ success: true, data: { total } }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Failed to get invoice grand total sum:', error);
    return NextResponse.json({ success: false, error: 'Failed to get total' }, { status: 500 });
  }
}

