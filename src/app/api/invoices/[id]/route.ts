import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/database';

// GET /api/invoices/[id] - get invoice header by id
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const rows = await executeStoredProcedure('sp_GetInvoiceByIdForFrontend', { Id: id });
    return NextResponse.json({ success: true, data: rows?.[0] || null }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Failed to get invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get invoice', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - update invoice
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = await request.json();
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
      vat,
      subTotal,
      grandTotal,
      status,
      notes,
    } = body || {};

    if (!invoiceNumber || !billFrom || !billTo) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: invoiceNumber, billFrom, billTo' },
        { status: 400 }
      );
    }

    const params: Record<string, any> = {
      Id: id,
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
      VAT: vat ?? 0,
      Status: status || 'Pending',
      Notes: notes,
    };

    const rows = await executeStoredProcedure('sp_UpdateInvoiceFromFrontend', params);

    return NextResponse.json({ success: true, data: rows?.[0] || null }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Failed to update invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - soft delete invoice
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;

    const rows = await executeStoredProcedure('sp_DeleteInvoiceFromFrontend', { Id: id });

    return NextResponse.json({ success: true, data: rows?.[0] || { deletedId: id } }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Failed to delete invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

