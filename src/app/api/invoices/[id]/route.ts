import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/database';
import sql from 'mssql';

// A centralized function to resolve an invoice slug (e.g., "inv-xyz") to its numeric ID.
async function resolveInvoiceId(idOrSlug: string): Promise<{ numericId: number | null; errorResponse: NextResponse | null }> {
  // If it's a valid number, assume it's the ID and return it directly.
  if (/^\d+$/.test(idOrSlug)) {
    const numericId = parseInt(idOrSlug, 10);
    if (!isNaN(numericId)) {
      return { numericId, errorResponse: null };
    }
  }

  // If it's not a number, it's a slug. Query the database directly to find its ID.
  try {
    console.log(`Attempting to resolve slug: "${idOrSlug}" to a numeric ID via direct query.`);
    
    const query = `SELECT Id FROM dbo.InvoiceHeaders WHERE InvoiceNumber = @InvoiceNumber`;
    const params = { InvoiceNumber: { type: sql.NVarChar, value: idOrSlug } };

    const result = await executeQuery<{ Id: number }>(query, params);

    if (result && result.length > 0 && result[0].Id) {
      const numericId = result[0].Id;
      console.log(`✅ Successfully resolved slug "${idOrSlug}" to ID: ${numericId}`);
      return { numericId, errorResponse: null };
    }

    console.warn(`Could not find an invoice with the number: "${idOrSlug}"`);
    return {
      numericId: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Invoice Not Found', message: `No invoice found with the number "${idOrSlug}".` },
        { status: 404 }
      ),
    };
  } catch (error: any) {
    console.error(`❌ Database error while resolving slug "${idOrSlug}":`, error);
    return {
      numericId: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Database Error', message: 'An internal error occurred while trying to resolve the invoice number.' },
        { status: 500 }
      ),
    };
  }
}


// GET /api/invoices/[id] - get invoice header by id or invoiceNumber
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { id: idOrSlug } = context.params;
  console.log(`⚠️ Handling GET /api/invoices/[id] with identifier: "${idOrSlug}"`);

  const { numericId, errorResponse } = await resolveInvoiceId(idOrSlug);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const params = { Id: { type: sql.Int, value: numericId } };
    const rows = await executeStoredProcedure('sp_GetInvoiceByIdForFrontend', params);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice Not Found', message: `No invoice found with the resolved ID ${numericId}.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Failed to get invoice with resolved ID ${numericId}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to get invoice', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - update invoice by id or invoiceNumber
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const { id: idOrSlug } = context.params;
  const { numericId, errorResponse } = await resolveInvoiceId(idOrSlug);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    const { invoiceNumber, billFrom, billTo, ...rest } = body || {};

    if (!invoiceNumber || !billFrom || !billTo) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: invoiceNumber, billFrom, billTo' },
        { status: 400 }
      );
    }

    const params = {
      Id: { type: sql.Int, value: numericId },
      InvoiceNumber: { type: sql.NVarChar, value: invoiceNumber },
      BillFrom: { type: sql.NVarChar, value: billFrom },
      BillTo: { type: sql.NVarChar, value: billTo },
      BillFromEmail: { type: sql.NVarChar, value: rest.billFromEmail },
      BillFromAddress: { type: sql.NVarChar, value: rest.billFromAddress },
      BillFromPhone: { type: sql.NVarChar, value: rest.billFromPhone },
      BillFromFax: { type: sql.NVarChar, value: rest.billFromFax },
      BillToEmail: { type: sql.NVarChar, value: rest.billToEmail },
      BillToAddress: { type: sql.NVarChar, value: rest.billToAddress },
      BillToPhone: { type: sql.NVarChar, value: rest.billToPhone },
      BillToFax: { type: sql.NVarChar, value: rest.billToFax },
      OrderDate: { type: sql.Date, value: rest.orderDate },
      VAT: { type: sql.Decimal, value: rest.vat ?? 0 },
      Status: { type: sql.NVarChar, value: rest.status || 'Pending' },
      Notes: { type: sql.NVarChar, value: rest.notes },
    };

    const rows = await executeStoredProcedure('sp_UpdateInvoiceFromFrontend', params);

    return NextResponse.json({ success: true, data: rows?.[0] || null }, { status: 200 });

  } catch (error: any) {
    console.error(`❌ Failed to update invoice with resolved ID ${numericId}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - soft delete invoice by id or invoiceNumber
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const { id: idOrSlug } = context.params;
  const { numericId, errorResponse } = await resolveInvoiceId(idOrSlug);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const params = { Id: { type: sql.Int, value: numericId } };
    const rows = await executeStoredProcedure('sp_DeleteInvoiceFromFrontend', params);

    return NextResponse.json({ success: true, data: rows?.[0] || { deletedId: numericId } }, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Failed to delete invoice with resolved ID ${numericId}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
