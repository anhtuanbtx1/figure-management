import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/database';
import sql from 'mssql';

// GET /api/invoices - list invoices with filters/pagination/sorting
export async function GET(request: NextRequest) {
  console.log('✅ Handling GET /api/invoices - Fetching list of invoices...');
  try {
    // Use request.nextUrl for parsing search parameters, which is the idiomatic Next.js way.
    const { searchParams } = request.nextUrl;

    const search = searchParams.get('search') || null;
    const status = searchParams.get('status') || null;
    const dateFrom = searchParams.get('dateFrom') || null;
    const dateTo = searchParams.get('dateTo') || null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sortField = searchParams.get('sortField') || 'CreatedAt';
    const sortDirection = (searchParams.get('sortDirection') || 'DESC').toUpperCase();

    const params: Record<string, any> = {
      Page: { type: sql.Int, value: page },
      PageSize: { type: sql.Int, value: pageSize },
      SortField: { type: sql.NVarChar, value: sortField },
      SortDirection: { type: sql.NVarChar, value: sortDirection },
    };
    if (search) params.Search = { type: sql.NVarChar, value: search };
    if (status) params.Status = { type: sql.NVarChar, value: status };
    if (dateFrom) params.DateFrom = { type: sql.Date, value: dateFrom };
    if (dateTo) params.DateTo = { type: sql.Date, value: dateTo };

    const rows = await executeStoredProcedure('sp_GetInvoicesForFrontend', params);

    const totalItems = rows?.[0]?.TotalCount ? parseInt(rows[0].TotalCount, 10) : 0;

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0,
      },
      filters: { search, status, dateFrom, dateTo },
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch invoices from /api/invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - create invoice header (items can be added via separate endpoint in future)
export async function POST(request: NextRequest) {
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
      subTotal,
      grandTotal,
      vat,
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
      SubTotal: { type: sql.Decimal, value: typeof subTotal === 'number' ? subTotal : 0 },
      VAT: { type: sql.Decimal, value: typeof vat === 'number' ? vat : 0 },
      GrandTotal: {
        type: sql.Decimal,
        value: typeof grandTotal === 'number' ? grandTotal : (typeof subTotal === 'number' ? subTotal : 0) + (typeof vat === 'number' ? vat : 0),
      },
      Status: { type: sql.NVarChar, value: status || 'Pending' },
      Notes: { type: sql.NVarChar, value: notes },
    };

    const rows = await executeStoredProcedure('sp_CreateInvoiceFromFrontend', params);

    return NextResponse.json({ success: true, data: rows?.[0] || null }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Failed to create invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
