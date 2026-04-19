import { NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';
import sql from 'mssql';

// GET: Lấy thông tin đội bóng, danh sách cầu thủ và đội hình đã lưu.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamIdStr = searchParams.get('teamId');

    // Nếu không truyền teamId, trả về danh sách tất cả Teams
    if (!teamIdStr) {
      const teams = await executeQuery('SELECT * FROM zen50558_ManagementStore.teams');
      return NextResponse.json({ teams });
    }

    const teamId = parseInt(teamIdStr);
    
    // Nếu truyền teamId, lấy players và lineups của team đó
    const players = await executeQuery('SELECT * FROM zen50558_ManagementStore.players WHERE team_id = @teamId', {
      teamId: { type: sql.Int, value: teamId }
    });

    const lineups = await executeQuery('SELECT * FROM zen50558_ManagementStore.lineups WHERE team_id = @teamId', {
      teamId: { type: sql.Int, value: teamId }
    });

    // Lấy slots của lineup được đánh dấu là default hoặc lineup đầu tiên
    let slots: any[] = [];
    if (lineups.length > 0) {
      const defaultLineup = lineups.find(l => l.is_default) || lineups[0];
      slots = await executeQuery('SELECT * FROM zen50558_ManagementStore.lineup_slots WHERE lineup_id = @lineupId', {
        lineupId: { type: sql.Int, value: defaultLineup.id }
      });
    }

    return NextResponse.json({ players, lineups, slots });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Lưu đội hình (Lineup + Slots)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamId, name, formation, isDefault, slots } = body;

    // Validate
    if (!teamId || !formation || !slots || !Array.isArray(slots)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await executeTransaction(async (transaction) => {
      // 1. Kiểm tra xem lineup này đã tồn tại chưa (tìm qua teamId & name/formation)
      // Để đơn giản, nếu đội hình cho format này chưa có thì tạo mới, có rồi thì update hoặc ghi đè
      const request = new sql.Request(transaction);
      request.input('teamId', sql.Int, parseInt(teamId));
      request.input('formation', sql.VarChar, formation);
      
      const existingLineups = await request.query(`SELECT id FROM zen50558_ManagementStore.lineups WHERE team_id = @teamId AND formation = @formation`);
      let lineupId;

      if (existingLineups.recordset.length > 0) {
        lineupId = existingLineups.recordset[0].id;
        // Đã có, tiến hành UPDATE is_default nếu cần, sau đó xoá slots cũ đi làm lại
        const updReq = new sql.Request(transaction);
        await updReq.query(`DELETE FROM zen50558_ManagementStore.lineup_slots WHERE lineup_id = ${lineupId}`);
      } else {
        // Tạo mới lineup
        const insertLineup = new sql.Request(transaction);
        insertLineup.input('teamId', sql.Int, parseInt(teamId));
        insertLineup.input('name', sql.VarChar, name || `Lineup ${formation}`);
        insertLineup.input('formation', sql.VarChar, formation);
        insertLineup.input('isDefault', sql.Bit, isDefault ? 1 : 0);
        
        const res = await insertLineup.query(`
          INSERT INTO zen50558_ManagementStore.lineups (team_id, name, formation, is_default)
          OUTPUT INSERTED.id
          VALUES (@teamId, @name, @formation, @isDefault)
        `);
        lineupId = res.recordset[0].id;
      }

      // 2. Insert các slots kéo thả
      for (const slot of slots) {
        const slotReq = new sql.Request(transaction);
        slotReq.input('lineupId', sql.Int, lineupId);
        slotReq.input('playerId', sql.Int, slot.playerId ? parseInt(slot.playerId) : null);
        slotReq.input('posLabel', sql.VarChar, slot.posLabel);
        slotReq.input('isGk', sql.Bit, slot.isGK ? 1 : 0);
        slotReq.input('locX', sql.Decimal(5, 2), slot.x);
        slotReq.input('locY', sql.Decimal(5, 2), slot.y);

        await slotReq.query(`
          INSERT INTO zen50558_ManagementStore.lineup_slots (lineup_id, player_id, pos_label, is_gk, loc_x, loc_y)
          VALUES (@lineupId, @playerId, @posLabel, @isGk, @locX, @locY)
        `);
      }

      return { lineupId, message: 'Saved successfully' };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error POST /football-lineups:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
