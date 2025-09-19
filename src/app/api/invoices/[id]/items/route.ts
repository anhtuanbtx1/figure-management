import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/database';
import sql from 'mssql';

// GET /api/invoices/[id]/items - get items for invoice
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const rows = await executeStoredProcedure('sp_GetInvoiceItemsByInvoiceIdForFrontend', { InvoiceId: { type: sql.Int, value: id } });
    return NextResponse.json({ success: true, data: rows || [] }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Failed to get invoice items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get invoice items', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
