import { NextRequest, NextResponse } from 'next/server';

const USERS = [
  { username: 'admin', password: '123456', displayName: 'Administrator', role: 'admin' },
  { username: 'user', password: '123456', displayName: 'Regular User', role: 'user' },
  { username: 'default', password: '123456', displayName: 'Default User', role: 'default' },
];

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const user = USERS.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: { username: user.username, displayName: user.displayName, role: user.role },
    });

    // Set auth cookie (7 days)
    response.cookies.set('auth_token', Buffer.from(JSON.stringify({ username: user.username, role: user.role })).toString('base64'), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Lỗi server' }, { status: 500 });
  }
}
