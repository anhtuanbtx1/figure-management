import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import { getDbPool } from '@/lib/database';

const CONFIG_DIR = path.join(process.cwd(), 'src', 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'menu-config.json');

// --- Auth helper ---
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

// --- Load allowedRoles from DB for all menu items ---
async function loadPermissionsFromDB(): Promise<Record<string, string[]>> {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(
      'SELECT MenuId, RoleName FROM MenuPermissions ORDER BY MenuId'
    );
    const map: Record<string, string[]> = {};
    for (const row of result.recordset) {
      if (!map[row.MenuId]) map[row.MenuId] = [];
      map[row.MenuId].push(row.RoleName);
    }
    return map;
  } catch (err) {
    console.error('[menu-config] Failed to load permissions from DB:', err);
    return {};
  }
}

// --- Recursively merge allowedRoles into menu tree ---
function mergePermissions(items: any[], permMap: Record<string, string[]>): any[] {
  return items.map((item) => {
    const merged = { ...item };
    if (item.id && permMap[item.id]) {
      merged.allowedRoles = permMap[item.id];
    } else if (item.id) {
      merged.allowedRoles = [];  // empty = all roles can see
    }
    if (Array.isArray(item.children)) {
      merged.children = mergePermissions(item.children, permMap);
    }
    return merged;
  });
}

// --- Extract (MenuId, RoleName) pairs from menu tree ---
function extractPermissions(items: any[]): Array<{ menuId: string; roleName: string }> {
  const pairs: Array<{ menuId: string; roleName: string }> = [];
  for (const item of items) {
    if (item.id && Array.isArray(item.allowedRoles) && item.allowedRoles.length > 0) {
      for (const role of item.allowedRoles) {
        pairs.push({ menuId: item.id, roleName: role });
      }
    }
    if (Array.isArray(item.children)) {
      pairs.push(...extractPermissions(item.children));
    }
  }
  return pairs;
}

// --- Strip allowedRoles before saving to JSON (keep JSON clean) ---
function stripPermissions(items: any[]): any[] {
  return items.map((item) => {
    const { allowedRoles, ...rest } = item;
    if (Array.isArray(rest.children)) {
      rest.children = stripPermissions(rest.children);
    }
    return rest;
  });
}

// =============================================
// GET /api/menu-config
// =============================================
export async function GET() {
  try {
    let menu: any[] = [];
    if (fs.existsSync(CONFIG_FILE)) {
      const data = await fs.promises.readFile(CONFIG_FILE, 'utf-8');
      menu = JSON.parse(data);
    }

    // Merge quyền từ DB vào cây menu
    const permMap = await loadPermissionsFromDB();
    const menuWithPerms = mergePermissions(menu, permMap);

    return NextResponse.json({ success: true, menu: menuWithPerms });
  } catch (error) {
    console.error('Error reading menu config:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// =============================================
// POST /api/menu-config
// =============================================
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Quyền truy cập bị từ chối' }, { status: 403 });
    }

    const { menu } = await req.json();
    if (!Array.isArray(menu)) {
      return NextResponse.json({ success: false, error: 'Dữ liệu menu không hợp lệ' }, { status: 400 });
    }

    // 1. Tách các cặp phân quyền (MenuId, RoleName) từ menu gửi lên
    const permPairs = extractPermissions(menu);

    // 2. Lưu cấu trúc menu (không có allowedRoles) vào JSON
    const cleanMenu = stripPermissions(menu);
    if (!fs.existsSync(CONFIG_DIR)) {
      await fs.promises.mkdir(CONFIG_DIR, { recursive: true });
    }
    await fs.promises.writeFile(CONFIG_FILE, JSON.stringify(cleanMenu, null, 2), 'utf-8');

    // 3. Đồng bộ phân quyền vào DB trong transaction
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      // Xóa toàn bộ quyền cũ
      await new sql.Request(transaction).query('DELETE FROM MenuPermissions');

      // Insert quyền mới
      if (permPairs.length > 0) {
        for (const pair of permPairs) {
          await new sql.Request(transaction)
            .input('menuId', sql.VarChar(100), pair.menuId)
            .input('roleName', sql.VarChar(50), pair.roleName)
            .query('INSERT INTO MenuPermissions (MenuId, RoleName) VALUES (@menuId, @roleName)');
        }
      }

      await transaction.commit();
    } catch (dbErr) {
      await transaction.rollback();
      throw dbErr;
    }

    return NextResponse.json({
      success: true,
      message: 'Lưu cấu hình menu và phân quyền thành công',
      permissionsUpdated: permPairs.length,
    });
  } catch (error) {
    console.error('Error writing menu config:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
