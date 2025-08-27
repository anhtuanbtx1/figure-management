import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/database';

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

    const params: Record<string, any> = {
      InvoiceNumber: invoiceNumber,
      BillFrom: billFrom,
      BillFromEmail: billFromEmail,
      BillFromAddress: billFromAddress,
      BillFromPhone: billFromPhone,
      BillFromFax: billFromFax,
      BillTo: billTo,
      BillToEmail: billToEmail,
      BillToAddress: billToAddress,
      BillToPhone: billToPhone,
      BillToFax: billToFax,
      OrderDate: orderDate,
      Status: status || 'Pending',
      Notes: notes,
      Items: itemsJson,
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

