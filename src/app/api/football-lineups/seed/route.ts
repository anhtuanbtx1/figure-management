import { NextResponse } from 'next/server';
import { executeTransaction } from '@/lib/database';
import sql from 'mssql';

export const dynamic = 'force-dynamic';


// Seed initial TEAMS to the database to match FE mock data.
export async function GET() {
  const result = await executeTransaction(async (transaction) => {
    // Check if teams already exist
    const checkReq = new sql.Request(transaction);
    const existing = await checkReq.query("SELECT id FROM ManagementStore.dbo.teams WHERE name = 'Manchester United'");
    if (existing.recordset.length > 0) {
      return { message: 'Manchester United already exists', status: 200 };
    }

    // Insert Manchester City
    let req = new sql.Request(transaction);
    req.input('tName', sql.VarChar, 'Manchester City');
    req.input('tLeague', sql.VarChar, 'Premier League');
    req.input('tLogo', sql.VarChar, '🛡️');
    let res = await req.query("INSERT INTO ManagementStore.dbo.teams (name, league, logo_url) OUTPUT INSERTED.id VALUES (@tName, @tLeague, @tLogo)");
    const manCityId = res.recordset[0].id;

    // Players ManCity
    const manCityPlayers = [
      { shortName: 'Ederson', name: 'Ederson Moraes', pos: 'GK', rating: 88, jersey: 31 },
      { shortName: 'Walker', name: 'Kyle Walker', pos: 'RB', rating: 85, jersey: 2 },
      { shortName: 'Dias', name: 'Rúben Dias', pos: 'CB', rating: 89, jersey: 3 },
      { shortName: 'Stones', name: 'John Stones', pos: 'CB', rating: 86, jersey: 5 },
      { shortName: 'Ake', name: 'Nathan Aké', pos: 'LB', rating: 84, jersey: 6 },
      { shortName: 'Rodri', name: 'Rodri', pos: 'CDM', rating: 90, jersey: 16 },
      { shortName: 'De Bruyne', name: 'Kevin De Bruyne', pos: 'CM', rating: 91, jersey: 17 },
      { shortName: 'Silva', name: 'Bernardo Silva', pos: 'CM', rating: 88, jersey: 20 },
      { shortName: 'Grealish', name: 'Jack Grealish', pos: 'LW', rating: 86, jersey: 10 },
      { shortName: 'Haaland', name: 'Erling Haaland', pos: 'ST', rating: 94, jersey: 9 },
      { shortName: 'Foden', name: 'Phil Foden', pos: 'RW', rating: 88, jersey: 47 },
      { shortName: 'J. Alvarez', name: 'Julián Álvarez', pos: 'ST', rating: 88, jersey: 19 },
      { shortName: 'R. Lewis', name: 'Rico Lewis', pos: 'RB', rating: 82, jersey: 82 }
    ];

    for (const p of manCityPlayers) {
      const pReq = new sql.Request(transaction);
      pReq.input('teamId', sql.Int, manCityId);
      pReq.input('fn', sql.VarChar, p.name);
      pReq.input('sn', sql.VarChar, p.shortName);
      pReq.input('pos', sql.VarChar, p.pos);
      pReq.input('rt', sql.Int, p.rating);
      pReq.input('jn', sql.Int, p.jersey);
      await pReq.query("INSERT INTO ManagementStore.dbo.players (team_id, full_name, short_name, position, rating, jersey_number) VALUES (@teamId, @fn, @sn, @pos, @rt, @jn)");
    }

    // Insert Real Madrid
    req = new sql.Request(transaction);
    req.input('tName2', sql.VarChar, 'Real Madrid');
    req.input('tLeague2', sql.VarChar, 'La Liga');
    req.input('tLogo2', sql.VarChar, '👑');
    res = await req.query("INSERT INTO ManagementStore.dbo.teams (name, league, logo_url) OUTPUT INSERTED.id VALUES (@tName2, @tLeague2, @tLogo2)");
    const realMadridId = res.recordset[0].id;

    const realPlayers = [
      { shortName: 'Courtois', name: 'Thibaut Courtois', pos: 'GK', rating: 90, jersey: 1 },
      { shortName: 'Carvajal', name: 'Dani Carvajal', pos: 'RB', rating: 85, jersey: 2 },
      { shortName: 'Militão', name: 'Éder Militão', pos: 'CB', rating: 86, jersey: 3 },
      { shortName: 'Rüdiger', name: 'Antonio Rüdiger', pos: 'CB', rating: 87, jersey: 22 },
      { shortName: 'Mendy', name: 'Ferland Mendy', pos: 'LB', rating: 82, jersey: 23 },
      { shortName: 'Tchouaméni', name: 'Aurélien Tchouaméni', pos: 'CDM', rating: 84, jersey: 18 },
      { shortName: 'Valverde', name: 'Federico Valverde', pos: 'CM', rating: 88, jersey: 15 },
      { shortName: 'Bellingham', name: 'Jude Bellingham', pos: 'CAM', rating: 90, jersey: 5 },
      { shortName: 'Vinícius Jr', name: 'Vinícius Júnior', pos: 'LW', rating: 89, jersey: 7 },
      { shortName: 'Rodrygo', name: 'Rodrygo', pos: 'RW', rating: 85, jersey: 11 },
      { shortName: 'Mbappé', name: 'Kylian Mbappé', pos: 'ST', rating: 91, jersey: 9 }
    ];

    for (const p of realPlayers) {
      const pReq = new sql.Request(transaction);
      pReq.input('teamId', sql.Int, realMadridId);
      pReq.input('fn', sql.VarChar, p.name);
      pReq.input('sn', sql.VarChar, p.shortName);
      pReq.input('pos', sql.VarChar, p.pos);
      pReq.input('rt', sql.Int, p.rating);
      pReq.input('jn', sql.Int, p.jersey);
      await pReq.query("INSERT INTO ManagementStore.dbo.players (team_id, full_name, short_name, position, rating, jersey_number) VALUES (@teamId, @fn, @sn, @pos, @rt, @jn)");
    }

    // Insert Manchester United
    req = new sql.Request(transaction);
    req.input('tName3', sql.VarChar, 'Manchester United');
    req.input('tLeague3', sql.VarChar, 'Premier League');
    req.input('tLogo3', sql.VarChar, '🔴');
    res = await req.query("INSERT INTO ManagementStore.dbo.teams (name, league, logo_url) OUTPUT INSERTED.id VALUES (@tName3, @tLeague3, @tLogo3)");
    const manUtdId = res.recordset[0].id;

    const muPlayers = [
      { shortName: 'Onana', name: 'André Onana', pos: 'GK', rating: 85, jersey: 24 },
      { shortName: 'Dalot', name: 'Diogo Dalot', pos: 'RB', rating: 82, jersey: 20 },
      { shortName: 'De Ligt', name: 'Matthijs de Ligt', pos: 'CB', rating: 86, jersey: 4 },
      { shortName: 'Martinez', name: 'Lisandro Martínez', pos: 'CB', rating: 84, jersey: 6 },
      { shortName: 'Mazraoui', name: 'Noussair Mazraoui', pos: 'LB', rating: 81, jersey: 3 },
      { shortName: 'Mainoo', name: 'Kobbie Mainoo', pos: 'CDM', rating: 80, jersey: 37 },
      { shortName: 'Ugarte', name: 'Manuel Ugarte', pos: 'CDM', rating: 81, jersey: 25 },
      { shortName: 'Bruno', name: 'Bruno Fernandes', pos: 'CAM', rating: 88, jersey: 8 },
      { shortName: 'Garnacho', name: 'Alejandro Garnacho', pos: 'RW', rating: 81, jersey: 17 },
      { shortName: 'Rashford', name: 'Marcus Rashford', pos: 'LW', rating: 83, jersey: 10 },
      { shortName: 'Højlund', name: 'Rasmus Højlund', pos: 'ST', rating: 80, jersey: 9 },
      { shortName: 'Amad', name: 'Amad Diallo', pos: 'RW', rating: 78, jersey: 16 },
      { shortName: 'Casemiro', name: 'Casemiro', pos: 'CDM', rating: 84, jersey: 18 },
      { shortName: 'Maguire', name: 'Harry Maguire', pos: 'CB', rating: 79, jersey: 5 }
    ];

    for (const p of muPlayers) {
      const pReq = new sql.Request(transaction);
      pReq.input('teamId', sql.Int, manUtdId);
      pReq.input('fn', sql.VarChar, p.name);
      pReq.input('sn', sql.VarChar, p.shortName);
      pReq.input('pos', sql.VarChar, p.pos);
      pReq.input('rt', sql.Int, p.rating);
      pReq.input('jn', sql.Int, p.jersey);
      await pReq.query("INSERT INTO ManagementStore.dbo.players (team_id, full_name, short_name, position, rating, jersey_number) VALUES (@teamId, @fn, @sn, @pos, @rt, @jn)");
    }

    return { message: 'Database seeded successfully with City, Real and United', status: 201 };
  });

  return NextResponse.json(result);
}
