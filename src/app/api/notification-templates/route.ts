import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const query = "SELECT id, name, content FROM dbo.NotificationTemplates";
    const data = await executeQuery(query);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Failed to fetch notification templates', error: errorMessage }, { status: 500 });
  }
}
