import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/database';
import sql from 'mssql';

// POST /api/invoices/create-with-items
// Body: { invoiceHeader: {...}, items: [{ itemName, unitPrice, units } ...] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceHeader, items } = body || {};

    if (!invoiceHeader || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const {
      invoiceNumber,
      billFrom,
      billFromEmail,
      billFromAddress,
      billFromPhone,
      billFromFax,
      billTo,
      billToEmail,
      billToAddress,
      billToPhone,
      billToFax,
      orderDate,
      status,
      notes,
    } = invoiceHeader;

    if (!invoiceNumber || !billFrom || !billTo) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: invoiceNumber, billFrom, billTo' },
        { status: 400 }
      );
    }

    const itemsJson = JSON.stringify(
      items.map((it: any) => ({
        itemName: it.itemName,
        unitPrice: Number(it.unitPrice) || 0,
        units: Number(it.units) || 0,
      }))
    );

    const params = {
      InvoiceNumber: { type: sql.NVarChar, value: invoiceNumber },
      BillFrom: { type: sql.NVarChar, value: billFrom },
      BillFromEmail: { type: sql.NVarChar, value: billFromEmail },
      BillFromAddress: { type: sql.NVarChar, value: billFromAddress },
      BillFromPhone: { type: sql.NVarChar, value: billFromPhone },
      BillFromFax: { type: sql.NVarChar, value: billFromFax },
      BillTo: { type: sql.NVarChar, value: billTo },
      BillToEmail: { type: sql.NVarChar, value: billToEmail },
      BillToAddress: { type: sql.NVarChar, value: billToAddress },
      BillToPhone: { type: sql.NVarChar, value: billToPhone },
      BillToFax: { type: sql.NVarChar, value: billToFax },
      OrderDate: { type: sql.Date, value: orderDate },
      Status: { type: sql.NVarChar, value: status || 'Pending' },
      Notes: { type: sql.NVarChar, value: notes },
      Items: { type: sql.NVarChar(sql.MAX), value: itemsJson },
    };

    const rows = await executeStoredProcedure('sp_CreateInvoiceWithItemsFromFrontend', params);

    return NextResponse.json({ success: true, data: rows?.[0] || null }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Failed to create invoice with items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice with items', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
