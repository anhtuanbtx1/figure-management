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
    console.log(`Attempting to resolve slug: "${idOrSlug}" for items via direct query.`);
    
    const query = `SELECT Id FROM dbo.InvoiceHeaders WHERE InvoiceNumber = @InvoiceNumber`;
    const params = { InvoiceNumber: { type: sql.NVarChar, value: idOrSlug } };

    const result = await executeQuery<{ Id: number }>(query, params);

    if (result && result.length > 0 && result[0].Id) {
      const numericId = result[0].Id;
      console.log(`✅ Successfully resolved slug "${idOrSlug}" to ID: ${numericId} for items.`);
      return { numericId, errorResponse: null };
    }

    console.warn(`Could not find an invoice with the number: "${idOrSlug}" for items.`);
    return {
      numericId: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Invoice Not Found', message: `No invoice found with the number "${idOrSlug}".` },
        { status: 404 }
      ),
    };
  } catch (error: any) {
    console.error(`❌ Database error while resolving slug "${idOrSlug}" for items:`, error);
    return {
      numericId: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Database Error', message: 'Failed to resolve invoice number for items.' },
        { status: 500 }
      ),
    };
  }
}


// GET /api/invoices/[id]/items - get items for a given invoice id or slug
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { id: idOrSlug } = context.params;
  
  const { numericId, errorResponse } = await resolveInvoiceId(idOrSlug);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    if (numericId === null) {
       return NextResponse.json(
        { success: false, error: 'Invalid Invoice ID', message: 'Could not resolve the provided invoice identifier to a numeric ID.' },
        { status: 400 }
      );
    }

    // Use the stored procedure with the correct INT type for the ID
    const params = { InvoiceId: { type: sql.Int, value: numericId } };
    const rows = await executeStoredProcedure('sp_GetInvoiceItemsByInvoiceIdForFrontend', params);
    
    return NextResponse.json({ success: true, data: rows || [] }, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Failed to get invoice items for resolved ID ${numericId}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to get invoice items', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
