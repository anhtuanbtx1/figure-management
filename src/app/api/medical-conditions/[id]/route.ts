import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { getDbPool } from '@/lib/database';
import { CatalogError, catalogBody, catalogFailure, catalogId, checkCatalogSession } from '@/lib/medical-catalog-api';

export const dynamic = 'force-dynamic';
type Context = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    checkCatalogSession(request);
    const id = catalogId(params.id);
    const body = await catalogBody(request);
    const pool = await getDbPool();
    const result = await pool.request().input('id', sql.Int, id).input('name', sql.NVarChar(200), body.name).query(`
      UPDATE dbo.MedicalConditions SET Name = @name, UpdatedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.Id AS id, INSERTED.Name AS name WHERE Id = @id
    `);
    if (!result.recordset.length) throw new CatalogError('Không tìm thấy bệnh.', 404);
    return NextResponse.json({ success: true, data: result.recordset[0] });
  } catch (error) { return catalogFailure(error); }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    checkCatalogSession(request);
    const id = catalogId(params.id);
    const pool = await getDbPool();
    const result = await pool.request().input('id', sql.Int, id).query(
      'DELETE FROM dbo.MedicalConditions OUTPUT DELETED.Id AS id WHERE Id = @id'
    );
    if (!result.recordset.length) throw new CatalogError('Không tìm thấy bệnh.', 404);
    return NextResponse.json({ success: true });
  } catch (error) { return catalogFailure(error); }
}
