import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction } from '@/lib/database';
import sql from 'mssql';

// POST /api/invoices/create-with-items
export async function POST(request: NextRequest) {
  console.log('✅ Handling POST /api/invoices/create-with-items - Creating invoice with items...');
  try {
    const body = await request.json();
    const { invoiceHeader, items } = body;

    const { billFrom, billTo, ...rest } = invoiceHeader || {};

    // Validate required header fields
    if (!billFrom || !billTo) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: billFrom, billTo' },
        { status: 400 }
      );
    }

    const result = await executeTransaction(async (transaction) => {
      // 1. Create the invoice header and get the new ID.
      // The InvoiceNumber parameter is removed, assuming the stored procedure
      // now handles generating it or it's no longer needed for creation because Id is IDENTITY.
      const headerParams = {
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
        OrderDate: { type: sql.Date, value: rest.orderDate || new Date() },
        VAT: { type: sql.Decimal, value: rest.vat ?? 0 },
        Status: { type: sql.NVarChar, value: rest.status || 'Pending' },
        Notes: { type: sql.NVarChar, value: rest.notes },
      };

      const headerRequest = new sql.Request(transaction);
      Object.entries(headerParams).forEach(([key, value]) => headerRequest.input(key, value.type, value.value));
      const headerResult = await headerRequest.execute('sp_CreateInvoiceFromFrontend');
      
      const newInvoiceRecord = headerResult.recordset[0];
      const newInvoiceId = newInvoiceRecord?.Id;
      const newInvoiceNumber = newInvoiceRecord?.InvoiceNumber; // Assuming the SP returns the generated InvoiceNumber

      if (!newInvoiceId) {
        throw new Error('Failed to create invoice header or retrieve its new ID.');
      }

      // 2. Create invoice items
      if (items && items.length > 0) {
        for (const item of items) {
          const itemParams = {
            InvoiceId: { type: sql.Int, value: newInvoiceId },
            ItemName: { type: sql.NVarChar, value: item.itemName },
            ItemDescription: { type: sql.NVarChar, value: item.itemDescription },
            UnitPrice: { type: sql.Decimal, value: item.unitPrice },
            Units: { type: sql.Int, value: item.units },
          };
          
          const itemRequest = new sql.Request(transaction);
          Object.entries(itemParams).forEach(([key, value]) => itemRequest.input(key, value.type, value.value));
          await itemRequest.execute('sp_CreateInvoiceItem');
        }
      }

      return { id: newInvoiceId, invoiceNumber: newInvoiceNumber };
    });

    // After the transaction is successful
    return NextResponse.json(
      {
        success: true,
        message: 'Invoice and items created successfully!',
        data: result,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Failed to create invoice with items:', error);

    const errorMessage = error.message || 'An unknown error occurred during the transaction.';
    return NextResponse.json(
      { success: false, error: 'Transaction Failed', message: errorMessage },
      { status: 500 }
    );
  }
}
