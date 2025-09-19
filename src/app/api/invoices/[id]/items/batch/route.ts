import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/database';
import sql from 'mssql';

// Batch update items: { adds: [{itemName, unitPrice, units}], updates: [{itemId, itemName, unitPrice, units}], deletes: [itemId] }
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const { adds = [], updates = [], deletes = [] } = body || {};

    // Adds
    for (const it of adds) {
      await executeStoredProcedure('sp_AddInvoiceItemFromFrontend', {
        InvoiceId: { type: sql.Int, value: id },
        ItemName: { type: sql.NVarChar, value: it.itemName },
        UnitPrice: { type: sql.Decimal, value: Number(it.unitPrice) || 0 },
        Units: { type: sql.Int, value: Number(it.units) || 0 },
      });
    }

    // Updates
    for (const it of updates) {
      await executeStoredProcedure('sp_UpdateInvoiceItemFromFrontend', {
        ItemId: { type: sql.Int, value: it.itemId },
        ItemName: { type: sql.NVarChar, value: it.itemName },
        UnitPrice: { type: sql.Decimal, value: Number(it.unitPrice) || 0 },
        Units: { type: sql.Int, value: Number(it.units) || 0 },
      });
    }

    // Deletes
    for (const itemId of deletes) {
      await executeStoredProcedure('sp_DeleteInvoiceItemFromFrontend', { ItemId: { type: sql.Int, value: itemId } });
    }

    // Return header re-calculated
    const rows = await executeStoredProcedure('sp_GetInvoiceByIdForFrontend', { Id: { type: sql.Int, value: id } });
    return NextResponse.json({ success: true, data: rows?.[0] || null }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Failed batch update invoice items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed batch update invoice items', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
