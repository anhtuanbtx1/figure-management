import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { getDbPool } from '@/lib/database';
import { catalogBody, catalogFailure, catalogId, checkCatalogSession } from '@/lib/medical-catalog-api';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    checkCatalogSession(request);
    const conditionId = catalogId(params.id);
    const body = await catalogBody(request, true);
    const pool = await getDbPool();
    const result = await pool.request()
      .input('conditionId', sql.Int, conditionId)
      .input('name', sql.NVarChar(200), body.name)
      .input('description', sql.NVarChar(2000), body.description).query(`
        INSERT INTO dbo.ConditionMedications (ConditionId, Name, Description)
        OUTPUT INSERTED.Id AS id, INSERTED.ConditionId AS conditionId,
               INSERTED.Name AS name, INSERTED.Description AS description
        VALUES (@conditionId, @name, @description)
      `);
    return NextResponse.json({ success: true, data: result.recordset[0] }, { status: 201 });
  } catch (error) { return catalogFailure(error); }
}
