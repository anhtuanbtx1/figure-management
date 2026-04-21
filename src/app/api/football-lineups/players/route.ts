import { NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';
import sql from 'mssql';

// POST: Tạo mới cầu thủ
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { team_id, full_name, short_name, position, rating, jersey_number, avatar_url } = body;

    if (!team_id || !full_name || !short_name || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const res = await executeQuery(`
      INSERT INTO ManagementStore.dbo.players (team_id, full_name, short_name, position, rating, jersey_number, avatar_url)
      OUTPUT INSERTED.id
      VALUES (@team_id, @full_name, @short_name, @position, @rating, @jersey_number, @avatar_url)
    `, {
      team_id: { type: sql.Int, value: parseInt(team_id) },
      full_name: { type: sql.VarChar, value: full_name },
      short_name: { type: sql.VarChar, value: short_name },
      position: { type: sql.VarChar, value: position },
      rating: { type: sql.Int, value: parseInt(rating) || 70 },
      jersey_number: { type: sql.Int, value: parseInt(jersey_number) || null },
      avatar_url: { type: sql.VarChar, value: avatar_url || null }
    });

    return NextResponse.json({ id: res[0].id, message: 'Created successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật thông tin cầu thủ
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, full_name, short_name, position, rating, jersey_number, avatar_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await executeQuery(`
      UPDATE ManagementStore.dbo.players 
      SET full_name = @full_name, 
          short_name = @short_name, 
          position = @position, 
          rating = @rating, 
          jersey_number = @jersey_number, 
          avatar_url = @avatar_url
      WHERE id = @id
    `, {
      id: { type: sql.Int, value: parseInt(id) },
      full_name: { type: sql.VarChar, value: full_name },
      short_name: { type: sql.VarChar, value: short_name },
      position: { type: sql.VarChar, value: position },
      rating: { type: sql.Int, value: parseInt(rating) || 70 },
      jersey_number: { type: sql.Int, value: parseInt(jersey_number) || null },
      avatar_url: { type: sql.VarChar, value: avatar_url || null }
    });

    return NextResponse.json({ message: 'Updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Xóa cầu thủ
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Gỡ cầu thủ khỏi các vị trí trong line-up trước khi xóa để tránh lỗi ràng buộc (Foreign Key)
    await executeQuery(`
      UPDATE ManagementStore.dbo.lineup_slots SET player_id = NULL WHERE player_id = @id
    `, {
      id: { type: sql.Int, value: parseInt(id) }
    });

    await executeQuery(`
      DELETE FROM ManagementStore.dbo.players WHERE id = @id
    `, {
      id: { type: sql.Int, value: parseInt(id) }
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

