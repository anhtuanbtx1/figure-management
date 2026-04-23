import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

// GET: Lấy danh sách teams
export async function GET() {
  try {
    const rows = await executeQuery(`
      SELECT id, name, league, logo_url
      FROM ManagementStore.dbo.teams
      ORDER BY name ASC
    `);
    return NextResponse.json({ success: true, categories: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, categories: [] }, { status: 500 });
  }
}

// POST: Tạo team mới
export async function POST(req: NextRequest) {
  try {
    const { name, league, logo_url } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Tên đội là bắt buộc' }, { status: 400 });
    }

    const result = await executeQuery<{ id: number }>(
      `INSERT INTO ManagementStore.dbo.teams (name, league, logo_url)
       OUTPUT INSERTED.id
       VALUES (@name, @league, @logo_url)`,
      {
        name: { type: sql.NVarChar, value: name.trim() },
        league: { type: sql.NVarChar, value: league?.trim() || '' },
        logo_url: { type: sql.NVarChar, value: logo_url?.trim() || '' },
      }
    );

    return NextResponse.json({ success: true, id: result[0]?.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật team
export async function PUT(req: NextRequest) {
  try {
    const { id, name, league, logo_url } = await req.json();
    if (!id || !name?.trim()) {
      return NextResponse.json({ success: false, error: 'ID và tên là bắt buộc' }, { status: 400 });
    }

    await executeQuery(
      `UPDATE ManagementStore.dbo.teams
       SET name = @name, league = @league, logo_url = @logo_url
       WHERE id = @id`,
      {
        id: { type: sql.Int, value: id },
        name: { type: sql.NVarChar, value: name.trim() },
        league: { type: sql.NVarChar, value: league?.trim() || '' },
        logo_url: { type: sql.NVarChar, value: logo_url?.trim() || '' },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Xóa team
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID là bắt buộc' }, { status: 400 });
    }

    await executeQuery(
      `DELETE FROM ManagementStore.dbo.teams WHERE id = @id`,
      { id: { type: sql.Int, value: id } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
