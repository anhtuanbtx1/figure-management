import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/database';
import sql from 'mssql';

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'Array of IDs is required for deletion' }, { status: 400 });
    }

    const pool = await getDbPool();
    const req = pool.request();

    // Create a list of parameters to avoid SQL injection
    const paramNames = ids.map((_, index) => `@id${index}`);
    
    ids.forEach((id, index) => {
        req.input(`id${index}`, sql.Int, id);
    });

    const query = `DELETE FROM dbo.Reminders WHERE id IN (${paramNames.join(',')})`;

    const result = await req.query(query);
    
    const rowsAffected = result.rowsAffected[0] || 0;

    return NextResponse.json({ success: true, message: `Successfully deleted ${rowsAffected} reminder(s).` });

  } catch (error) {
    console.error('Error bulk deleting reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Failed to bulk delete reminders', error: errorMessage }, { status: 500 });
  }
}
