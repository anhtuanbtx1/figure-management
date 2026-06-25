import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return NextResponse.json({
      success: true,
      user: {
        username: decoded.username,
        role: decoded.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 400 });
  }
}
