import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { getDbPool } from '@/lib/database';
import { catalogBody, catalogFailure, checkCatalogSession } from '@/lib/medical-catalog-api';
import type { MedicalCondition } from '@/types/apps/medical-catalog';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    checkCatalogSession(request);
    const pool = await getDbPool();
    const result = await pool.request().query(`
      SELECT c.Id AS conditionId, c.Name AS conditionName,
             m.Id AS medicationId, m.Name AS medicationName, m.Description AS description
      FROM dbo.MedicalConditions c
      LEFT JOIN dbo.ConditionMedications m ON m.ConditionId = c.Id
      ORDER BY c.Name, c.Id, m.Name, m.Id
    `);
    const conditions = new Map<number, MedicalCondition>();
    for (const row of result.recordset) {
      if (!conditions.has(row.conditionId)) {
        conditions.set(row.conditionId, { id: row.conditionId, name: row.conditionName, medications: [] });
      }
      if (row.medicationId != null) {
        conditions.get(row.conditionId)!.medications.push({
          id: row.medicationId, conditionId: row.conditionId,
          name: row.medicationName, description: row.description,
        });
      }
    }
    return NextResponse.json({ success: true, data: Array.from(conditions.values()) }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) { return catalogFailure(error); }
}

export async function POST(request: NextRequest) {
  try {
    checkCatalogSession(request);
    const body = await catalogBody(request);
    const pool = await getDbPool();
    const result = await pool.request().input('name', sql.NVarChar(200), body.name).query(`
      INSERT INTO dbo.MedicalConditions (Name)
      OUTPUT INSERTED.Id AS id, INSERTED.Name AS name VALUES (@name)
    `);
    return NextResponse.json({ success: true, data: { ...result.recordset[0], medications: [] } }, { status: 201 });
  } catch (error) { return catalogFailure(error); }
}
