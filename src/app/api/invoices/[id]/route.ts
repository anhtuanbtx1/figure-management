import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure, executeQuery } from '@/lib/database';
import sql from 'mssql';

// Helper function to parse and validate the ID from the URL
function getNumericId(id: string): { numericId: number | null; errorResponse: NextResponse | null } {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || !Number.isInteger(numericId)) {
        return {
            numericId: null,
            errorResponse: NextResponse.json(
                { success: false, error: 'Invalid ID Format', message: `The provided invoice ID "${id}" is not a valid integer.` },
                { status: 400 } // Bad Request
            ),
        };
    }
    return { numericId, errorResponse: null };
}

// GET /api/invoices/[id] - get invoice header by id
export async function GET(request: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;
    console.log(`Handling GET /api/invoices/[id] with ID: "${id}"`);

    const { numericId, errorResponse } = getNumericId(id);
    if (errorResponse) {
        return errorResponse;
    }

    try {
        const params = { Id: { type: sql.Int, value: numericId } };
        const rows = await executeStoredProcedure('sp_GetInvoiceByIdForFrontend', params);

        if (!rows || rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Invoice Not Found', message: `No invoice found with ID ${numericId}.` },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
    } catch (error: any) {
        console.error(`Failed to get invoice with ID ${numericId}:`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to get invoice', message: error?.message || 'Unknown error' },
            { status: 500 }
        );
    }
}

// PUT /api/invoices/[id] - update invoice by id using a direct SQL query
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;
    const { numericId, errorResponse } = getNumericId(id);
    if (errorResponse) {
        return errorResponse;
    }

    try {
        const body = await request.json();
        const {
            invoiceNumber, billFrom, billTo, status, orderDate, notes, 
            billFromEmail, billFromAddress, billFromPhone, billFromFax,
            billToEmail, billToAddress, billToPhone, billToFax, vat
        } = body || {};

        if (!numericId) {
            return NextResponse.json({ success: false, error: 'Invalid ID provided.' }, { status: 400 });
        }

        if (!invoiceNumber || !billFrom || !billTo) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: invoiceNumber, billFrom, billTo' },
                { status: 400 }
            );
        }

        let query = 'UPDATE dbo.Invoices SET ';
        const params: any = { Id: { type: sql.Int, value: numericId } };
        const setClauses: string[] = [];

        const fieldsToUpdate = {
            InvoiceNumber: { value: invoiceNumber, type: sql.NVarChar },
            BillFrom: { value: billFrom, type: sql.NVarChar },
            BillTo: { value: billTo, type: sql.NVarChar },
            Status: { value: status, type: sql.NVarChar },
            OrderDate: { value: orderDate, type: sql.Date },
            Notes: { value: notes, type: sql.NVarChar },
            BillFromEmail: { value: billFromEmail, type: sql.NVarChar },
            BillFromAddress: { value: billFromAddress, type: sql.NVarChar },
            BillFromPhone: { value: billFromPhone, type: sql.NVarChar },
            BillFromFax: { value: billFromFax, type: sql.NVarChar },
            BillToEmail: { value: billToEmail, type: sql.NVarChar },
            BillToAddress: { value: billToAddress, type: sql.NVarChar },
            BillToPhone: { value: billToPhone, type: sql.NVarChar },
            BillToFax: { value: billToFax, type: sql.NVarChar },
            VAT: { value: vat, type: sql.Decimal }
        };

        for (const [key, field] of Object.entries(fieldsToUpdate)) {
            if (field.value !== undefined && field.value !== null) {
                const paramName = key;
                setClauses.push(`${key} = @${paramName}`);
                params[paramName] = { type: field.type, value: field.value };
            }
        }

        if (setClauses.length === 0) {
            return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
        }

        query += setClauses.join(', ') + ' WHERE Id = @Id;';

        // Execute the dynamically constructed query
        await executeQuery(query, params);

        // After updating, fetch the updated record to return it.
        const updatedInvoice = await executeStoredProcedure('sp_GetInvoiceByIdForFrontend', { Id: { type: sql.Int, value: numericId } });

        return NextResponse.json({ success: true, data: updatedInvoice?.[0] || null }, { status: 200 });

    } catch (error: any) {
        console.error(`Failed to update invoice with ID ${numericId}:`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to update invoice', message: error?.message || 'Unknown error' },
            { status: 500 }
        );
    }
}


// DELETE /api/invoices/[id] - soft delete invoice by id
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;
    const { numericId, errorResponse } = getNumericId(id);
    if (errorResponse) {
        return errorResponse;
    }

    try {
        const params = { Id: { type: sql.Int, value: numericId } };
        await executeStoredProcedure('sp_DeleteInvoiceFromFrontend', params);

        return NextResponse.json({ success: true, data: { deletedId: numericId } }, { status: 200 });
    } catch (error: any) {
        console.error(`Failed to delete invoice with ID ${numericId}:`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete invoice', message: error?.message || 'Unknown error' },
            { status: 500 }
        );
    }
}
