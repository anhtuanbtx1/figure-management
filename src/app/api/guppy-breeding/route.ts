import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

// Database row interface
interface GuppyBreedingRow {
    id: number;
    maleFishId: number;
    femaleFishId: number;
    pairingDate: Date;
    birthDate: Date | null;
    fryCount: number | null;
    survivalCount: number | null;
    notes: string | null;
    status: string;
    createdDate: Date;
    updatedDate: Date;
    isActive: boolean;
    // Joined fields
    maleFishCode?: string;
    maleFishName?: string;
    maleStrain?: string;
    femaleFishCode?: string;
    femaleFishName?: string;
    femaleStrain?: string;
}

function mapToBreeding(row: GuppyBreedingRow) {
    const fryCount = row.fryCount ?? null;
    const survivalCount = row.survivalCount ?? null;
    const survivalRate = (fryCount && fryCount > 0 && survivalCount !== null)
        ? Math.round((survivalCount / fryCount) * 100)
        : null;

    return {
        id: row.id.toString(),
        maleFishId: row.maleFishId.toString(),
        femaleFishId: row.femaleFishId.toString(),
        pairingDate: new Date(row.pairingDate).toISOString().split('T')[0],
        birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split('T')[0] : null,
        fryCount,
        survivalCount,
        survivalRate,
        notes: row.notes,
        status: row.status,
        createdDate: row.createdDate,
        updatedDate: row.updatedDate,
        isActive: row.isActive,
        maleFishCode: row.maleFishCode || '',
        maleFishName: row.maleFishName || '',
        maleStrain: row.maleStrain || '',
        femaleFishCode: row.femaleFishCode || '',
        femaleFishName: row.femaleFishName || '',
        femaleStrain: row.femaleStrain || '',
    };
}

// GET /api/guppy-breeding
export async function GET(request: NextRequest) {
    const startTime = Date.now();

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.trim() || '';
        const status = searchParams.get('status')?.trim() || '';
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '50');

        const validPage = Math.max(1, page);
        const validPageSize = Math.min(Math.max(1, pageSize), 200);
        const offset = (validPage - 1) * validPageSize;

        const queryParams: Record<string, { type: any; value: any }> = {};
        const whereConditions = ['b.isActive = 1'];

        if (search) {
            whereConditions.push(`(
        m.fishCode LIKE @search OR m.name LIKE @search OR m.strain LIKE @search OR
        f.fishCode LIKE @search OR f.name LIKE @search OR f.strain LIKE @search OR
        b.notes LIKE @search
      )`);
            queryParams.search = { type: sql.NVarChar, value: `%${search}%` };
        }

        if (status) {
            whereConditions.push('b.status = @status');
            queryParams.status = { type: sql.NVarChar, value: status };
        }

        const whereClause = whereConditions.join(' AND ');

        const countQuery = `
      SELECT COUNT(*) as TotalCount
      FROM GuppyBreeding b
      LEFT JOIN GuppyFish m ON b.maleFishId = m.id
      LEFT JOIN GuppyFish f ON b.femaleFishId = f.id
      WHERE ${whereClause}
    `;

        const dataQuery = `
      SELECT
        b.id, b.maleFishId, b.femaleFishId, b.pairingDate, b.birthDate,
        b.fryCount, b.survivalCount, b.notes, b.status,
        b.createdDate, b.updatedDate, b.isActive,
        m.fishCode as maleFishCode, m.name as maleFishName, m.strain as maleStrain,
        f.fishCode as femaleFishCode, f.name as femaleFishName, f.strain as femaleStrain
      FROM GuppyBreeding b
      LEFT JOIN GuppyFish m ON b.maleFishId = m.id
      LEFT JOIN GuppyFish f ON b.femaleFishId = f.id
      WHERE ${whereClause}
      ORDER BY b.pairingDate DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `;

        const [countResult, dataResult] = await Promise.all([
            executeQuery<{ TotalCount: number }>(countQuery, queryParams),
            executeQuery<GuppyBreedingRow>(dataQuery, {
                ...queryParams,
                offset: { type: sql.Int, value: offset },
                pageSize: { type: sql.Int, value: validPageSize },
            }),
        ]);

        const totalCount = countResult[0]?.TotalCount || 0;
        const totalPages = Math.ceil(totalCount / validPageSize);

        return NextResponse.json({
            success: true,
            data: dataResult.map(mapToBreeding),
            pagination: {
                page: validPage,
                pageSize: validPageSize,
                totalCount,
                totalPages,
                hasNextPage: validPage < totalPages,
                hasPreviousPage: validPage > 1,
            },
            performanceMs: Date.now() - startTime,
        });

    } catch (error) {
        console.error('❌ Error fetching breeding records:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch breeding records',
            message: error instanceof Error ? error.message : 'Unknown error',
            data: [],
        }, { status: 500 });
    }
}

// POST /api/guppy-breeding
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { maleFishId, femaleFishId, pairingDate, birthDate, fryCount, survivalCount, notes, status } = body;

        if (!maleFishId || !femaleFishId || !pairingDate) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields',
                message: 'maleFishId, femaleFishId, and pairingDate are required',
            }, { status: 400 });
        }

        const insertQuery = `
      INSERT INTO GuppyBreeding (
        maleFishId, femaleFishId, pairingDate, birthDate,
        fryCount, survivalCount, notes, status,
        createdDate, updatedDate, isActive
      )
      OUTPUT INSERTED.id
      VALUES (
        @maleFishId, @femaleFishId, @pairingDate, @birthDate,
        @fryCount, @survivalCount, @notes, @status,
        GETDATE(), GETDATE(), 1
      )
    `;

        const result = await executeQuery(insertQuery, {
            maleFishId: { type: sql.Int, value: Number(maleFishId) },
            femaleFishId: { type: sql.Int, value: Number(femaleFishId) },
            pairingDate: { type: sql.Date, value: pairingDate },
            birthDate: { type: sql.Date, value: birthDate || null },
            fryCount: { type: sql.Int, value: fryCount ?? null },
            survivalCount: { type: sql.Int, value: survivalCount ?? null },
            notes: { type: sql.NVarChar, value: notes?.trim() || null },
            status: { type: sql.NVarChar, value: status || 'Pairing' },
        });

        const newId = result[0]?.id;

        return NextResponse.json({
            success: true,
            data: { id: newId?.toString(), message: 'Successfully added breeding record' },
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Error adding breeding record:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to add breeding record',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

// PUT /api/guppy-breeding
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, maleFishId, femaleFishId, pairingDate, birthDate, fryCount, survivalCount, notes, status } = body;

        if (!id || !maleFishId || !femaleFishId || !pairingDate) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields',
            }, { status: 400 });
        }

        const updateQuery = `
      UPDATE GuppyBreeding SET
        maleFishId = @maleFishId, femaleFishId = @femaleFishId,
        pairingDate = @pairingDate, birthDate = @birthDate,
        fryCount = @fryCount, survivalCount = @survivalCount,
        notes = @notes, status = @status, updatedDate = GETDATE()
      WHERE id = @id AND isActive = 1
    `;

        await executeQuery(updateQuery, {
            id: { type: sql.Int, value: Number(id) },
            maleFishId: { type: sql.Int, value: Number(maleFishId) },
            femaleFishId: { type: sql.Int, value: Number(femaleFishId) },
            pairingDate: { type: sql.Date, value: pairingDate },
            birthDate: { type: sql.Date, value: birthDate || null },
            fryCount: { type: sql.Int, value: fryCount ?? null },
            survivalCount: { type: sql.Int, value: survivalCount ?? null },
            notes: { type: sql.NVarChar, value: notes?.trim() || null },
            status: { type: sql.NVarChar, value: status || 'Pairing' },
        });

        return NextResponse.json({
            success: true,
            data: { id: id.toString(), message: 'Successfully updated breeding record' },
        });

    } catch (error) {
        console.error('❌ Error updating breeding record:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update breeding record',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

// DELETE /api/guppy-breeding
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing required parameter: id' }, { status: 400 });
        }

        await executeQuery(
            `UPDATE GuppyBreeding SET isActive = 0, updatedDate = GETDATE() WHERE id = @id AND isActive = 1`,
            { id: { type: sql.Int, value: Number(id) } }
        );

        return NextResponse.json({
            success: true,
            data: { message: `Successfully deleted breeding record ID ${id}` },
        });

    } catch (error) {
        console.error('❌ Error deleting breeding record:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete breeding record',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
