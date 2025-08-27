import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/database';

// GET /api/invoices - list invoices with filters/pagination/sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || null;
    const status = searchParams.get('status') || null;
    const dateFrom = searchParams.get('dateFrom') || null;
    const dateTo = searchParams.get('dateTo') || null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sortField = searchParams.get('sortField') || 'CreatedAt';
    const sortDirection = (searchParams.get('sortDirection') || 'DESC').toUpperCase();

    const params: Record<string, any> = {
      Page: page,
      PageSize: pageSize,
      SortField: sortField,
      SortDirection: sortDirection,
    };
    if (search) params.Search = search;
    if (status) params.Status = status;
    if (dateFrom) params.DateFrom = dateFrom;
    if (dateTo) params.DateTo = dateTo;

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
    console.error('❌ Failed to fetch invoices:', error);
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
      SubTotal: typeof subTotal === 'number' ? subTotal : 0,
      VAT: typeof vat === 'number' ? vat : 0,
      GrandTotal: typeof grandTotal === 'number' ? grandTotal : (typeof subTotal === 'number' ? subTotal : 0) + (typeof vat === 'number' ? vat : 0),
      Status: status || 'Pending',
      Notes: notes,
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

