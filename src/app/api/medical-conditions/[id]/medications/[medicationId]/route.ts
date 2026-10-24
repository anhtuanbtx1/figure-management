import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { getDbPool } from '@/lib/database';
import { CatalogError, catalogBody, catalogFailure, catalogId, checkCatalogSession } from '@/lib/medical-catalog-api';

export const dynamic = 'force-dynamic';
type Context = { params: { id: string; medicationId: string } };

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    checkCatalogSession(request);
    const conditionId = catalogId(params.id);
    const id = catalogId(params.medicationId);
    const body = await catalogBody(request, true);
    const pool = await getDbPool();
    const result = await pool.request()
      .input('conditionId', sql.Int, conditionId).input('id', sql.Int, id)
      .input('name', sql.NVarChar(200), body.name)
      .input('description', sql.NVarChar(2000), body.description).query(`
        UPDATE dbo.ConditionMedications SET Name = @name, Description = @description, UpdatedAt = SYSUTCDATETIME()
        OUTPUT INSERTED.Id AS id, INSERTED.ConditionId AS conditionId,
               INSERTED.Name AS name, INSERTED.Description AS description
        WHERE Id = @id AND ConditionId = @conditionId
      `);
    if (!result.recordset.length) throw new CatalogError('Không tìm thấy thuốc trong bệnh này.', 404);
    return NextResponse.json({ success: true, data: result.recordset[0] });
  } catch (error) { return catalogFailure(error); }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    checkCatalogSession(request);
    const conditionId = catalogId(params.id);
    const id = catalogId(params.medicationId);
    const pool = await getDbPool();
    const result = await pool.request()
      .input('conditionId', sql.Int, conditionId).input('id', sql.Int, id).query(
        'DELETE FROM dbo.ConditionMedications OUTPUT DELETED.Id AS id WHERE Id = @id AND ConditionId = @conditionId'
      );
    if (!result.recordset.length) throw new CatalogError('Không tìm thấy thuốc trong bệnh này.', 404);
    return NextResponse.json({ success: true });
  } catch (error) { return catalogFailure(error); }
}
