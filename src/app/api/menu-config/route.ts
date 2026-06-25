import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_DIR = path.join(process.cwd(), 'src', 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'menu-config.json');

// Check if user is an admin by parsing the auth_token cookie
function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return false;
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

// GET /api/menu-config - Fetch the custom menu configuration
export async function GET() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return NextResponse.json({ success: true, menu: [] });
    }

    const data = await fs.promises.readFile(CONFIG_FILE, 'utf-8');
    const menu = JSON.parse(data);
    return NextResponse.json({ success: true, menu });
  } catch (error) {
    console.error('Error reading menu config:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/menu-config - Save the custom menu configuration (Admin only)
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Quyền truy cập bị từ chối' }, { status: 403 });
    }

    const { menu } = await req.json();
    if (!Array.isArray(menu)) {
      return NextResponse.json({ success: false, error: 'Dữ liệu menu không hợp lệ' }, { status: 400 });
    }

    // Ensure config directory exists
    if (!fs.existsSync(CONFIG_DIR)) {
      await fs.promises.mkdir(CONFIG_DIR, { recursive: true });
    }

    // Write to config file
    await fs.promises.writeFile(CONFIG_FILE, JSON.stringify(menu, null, 2), 'utf-8');
    return NextResponse.json({ success: true, message: 'Lưu cấu hình menu thành công' });
  } catch (error) {
    console.error('Error writing menu config:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
