import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/database';
import sql from 'mssql';

// GET /api/invoices/[id] - get invoice header by id
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  console.log(`⚠️ Handling GET /api/invoices/[id] with id: "${id}"`);

  // Validate that the ID is a number. This is crucial because this dynamic route might
  // incorrectly catch other sub-paths like '/api/invoices/create'.
  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid Route or Invoice ID',
        message: `The path segment "${id}" is not a valid numerical invoice ID. This endpoint should be called with a number, e.g., /api/invoices/123. Please check if you are trying to access a different endpoint.`,
      },
      { status: 400 }
    );
  }

  try {
    const rows = await executeStoredProcedure('sp_GetInvoiceByIdForFrontend', { Id: { type: sql.Int, value: id } });

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice Not Found', message: `No invoice found with ID ${id}.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Failed to get invoice with ID ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to get invoice', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - update invoice
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ success: false, error: 'Invalid Invoice ID' }, { status: 400 });
  }

  try {
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

    const params = {
      Id: { type: sql.Int, value: id },
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
      VAT: { type: sql.Decimal, value: vat ?? 0 },
      Status: { type: sql.NVarChar, value: status || 'Pending' },
      Notes: { type: sql.NVarChar, value: notes },
    };

    const rows = await executeStoredProcedure('sp_UpdateInvoiceFromFrontend', params);

    return NextResponse.json({ success: true, data: rows?.[0] || null }, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Failed to update invoice ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - soft delete invoice
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ success: false, error: 'Invalid Invoice ID' }, { status: 400 });
  }

  try {
    const rows = await executeStoredProcedure('sp_DeleteInvoiceFromFrontend', { Id: { type: sql.Int, value: id } });

    return NextResponse.json({ success: true, data: rows?.[0] || { deletedId: id } }, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Failed to delete invoice ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
