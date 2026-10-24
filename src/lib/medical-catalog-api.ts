import { NextRequest, NextResponse } from 'next/server';

export class CatalogError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// Follow the application's existing session cookie format.
export function checkCatalogSession(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = JSON.parse(Buffer.from(token || '', 'base64').toString('utf8'));
    if (!session.username || !['admin', 'user'].includes(session.role)) throw new Error();
  } catch {
    throw new CatalogError('Vui lòng đăng nhập để quản lý danh mục.', 401);
  }
  if (request.method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && origin !== request.nextUrl.origin) {
      throw new CatalogError('Yêu cầu không hợp lệ.', 403);
    }
  }
}

export function catalogId(value: string): number {
  if (!/^[1-9]\d*$/.test(value) || Number(value) > 2147483647) {
    throw new CatalogError('Mã dữ liệu không hợp lệ.', 400);
  }
  return Number(value);
}

export async function catalogBody(request: NextRequest, medication = false) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw new CatalogError('Dữ liệu gửi lên không hợp lệ.', 400);
  }
  if (!body || typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 200) {
    throw new CatalogError('Tên phải có từ 1 đến 200 ký tự.', 400);
  }
  if (medication && (typeof body.description !== 'string' || !body.description.trim() || body.description.trim().length > 2000)) {
    throw new CatalogError('Mô tả công dụng phải có từ 1 đến 2.000 ký tự.', 400);
  }
  return { name: body.name.trim(), description: medication ? body.description.trim() : '' };
}

export function catalogFailure(error: unknown) {
  if (error instanceof CatalogError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }
  const number = (error as { number?: number })?.number;
  if (number === 2601 || number === 2627) {
    return NextResponse.json({ success: false, error: 'Tên này đã tồn tại trong danh mục. Vui lòng chọn tên khác.' }, { status: 409 });
  }
  if (number === 547) {
    return NextResponse.json({ success: false, error: 'Bệnh không còn tồn tại. Vui lòng tải lại danh sách.' }, { status: 409 });
  }
  console.error('[medical-catalog]', error);
  return NextResponse.json({ success: false, error: 'Không thể lưu hoặc tải dữ liệu. Vui lòng thử lại.' }, { status: 500 });
}
