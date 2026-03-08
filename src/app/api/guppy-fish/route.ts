import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

// Database row interface
interface GuppyFishRow {
    id: number;
    fishCode: string;
    name: string | null;
    gender: string;
    birthDate: Date | null;
    photoUrl: string | null;
    strain: string | null;
    color: string | null;
    tailType: string | null;
    size: string | null;
    notes: string | null;
    status: string;
    createdDate: Date;
    updatedDate: Date;
    isActive: boolean;
}

function mapToGuppyFish(row: GuppyFishRow) {
    return {
        id: row.id.toString(),
        fishCode: row.fishCode,
        name: row.name,
        gender: row.gender,
        birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split('T')[0] : null,
        photoUrl: row.photoUrl,
        strain: row.strain,
        color: row.color,
        tailType: row.tailType,
        size: row.size,
        notes: row.notes,
        status: row.status,
        createdDate: row.createdDate,
        updatedDate: row.updatedDate,
        isActive: row.isActive,
    };
}

// GET /api/guppy-fish - Get all guppy fish with pagination & search
export async function GET(request: NextRequest) {
    const startTime = Date.now();

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.trim() || '';
        const gender = searchParams.get('gender')?.trim() || '';
        const strain = searchParams.get('strain')?.trim() || '';
        const status = searchParams.get('status')?.trim() || '';
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '50');
        const sortField = searchParams.get('sortField') || 'createdDate';
        const sortDirection = searchParams.get('sortDirection') || 'DESC';

        const validPage = Math.max(1, page);
        const validPageSize = Math.min(Math.max(1, pageSize), 200);
        const offset = (validPage - 1) * validPageSize;

        const queryParams: Record<string, { type: any; value: any }> = {};
        const whereConditions = ['isActive = 1'];

        if (search) {
            whereConditions.push(`(
        fishCode LIKE @search OR
        name LIKE @search OR
        strain LIKE @search OR
        color LIKE @search OR
        tailType LIKE @search OR
        notes LIKE @search
      )`);
            queryParams.search = { type: sql.NVarChar, value: `%${search}%` };
        }

        if (gender) {
            whereConditions.push('gender = @gender');
            queryParams.gender = { type: sql.NVarChar, value: gender };
        }

        if (strain) {
            whereConditions.push('strain = @strain');
            queryParams.strain = { type: sql.NVarChar, value: strain };
        }

        if (status) {
            whereConditions.push('status = @status');
            queryParams.status = { type: sql.NVarChar, value: status };
        }

        const allowedSortFields = ['createdDate', 'fishCode', 'name', 'gender', 'strain', 'color', 'tailType', 'status', 'birthDate'];
        const validSortField = allowedSortFields.includes(sortField) ? sortField : 'createdDate';
        const validSortDirection = ['ASC', 'DESC'].includes(sortDirection.toUpperCase()) ? sortDirection.toUpperCase() : 'DESC';

        const whereClause = whereConditions.join(' AND ');

        const countQuery = `SELECT COUNT(*) as TotalCount FROM GuppyFish WHERE ${whereClause}`;
        const dataQuery = `
      SELECT id, fishCode, name, gender, birthDate, photoUrl,
             strain, color, tailType, size, notes, status,
             createdDate, updatedDate, isActive
      FROM GuppyFish
      WHERE ${whereClause}
      ORDER BY ${validSortField} ${validSortDirection}
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `;

        const [countResult, dataResult] = await Promise.all([
            executeQuery<{ TotalCount: number }>(countQuery, queryParams),
            executeQuery<GuppyFishRow>(dataQuery, {
                ...queryParams,
                offset: { type: sql.Int, value: offset },
                pageSize: { type: sql.Int, value: validPageSize },
            }),
        ]);

        const totalCount = countResult[0]?.TotalCount || 0;
        const totalPages = Math.ceil(totalCount / validPageSize);
        const fish = dataResult.map(mapToGuppyFish);

        return NextResponse.json({
            success: true,
            data: fish,
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
        console.error('❌ Error fetching guppy fish:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch guppy fish',
            message: error instanceof Error ? error.message : 'Unknown error',
            data: [],
        }, { status: 500 });
    }
}

// POST /api/guppy-fish - Add new guppy fish
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fishCode, name, gender, birthDate, photoUrl, strain, color, tailType, size, notes, status } = body;

        if (!fishCode || !gender) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields',
                message: 'fishCode and gender are required',
            }, { status: 400 });
        }

        const insertQuery = `
      INSERT INTO GuppyFish (
        fishCode, name, gender, birthDate, photoUrl,
        strain, color, tailType, size, notes, status,
        createdDate, updatedDate, isActive
      )
      OUTPUT INSERTED.id
      VALUES (
        @fishCode, @name, @gender, @birthDate, @photoUrl,
        @strain, @color, @tailType, @size, @notes, @status,
        GETDATE(), GETDATE(), 1
      )
    `;

        const result = await executeQuery(insertQuery, {
            fishCode: { type: sql.NVarChar, value: fishCode.trim() },
            name: { type: sql.NVarChar, value: name?.trim() || null },
            gender: { type: sql.NVarChar, value: gender },
            birthDate: { type: sql.Date, value: birthDate || null },
            photoUrl: { type: sql.NVarChar, value: photoUrl?.trim() || null },
            strain: { type: sql.NVarChar, value: strain?.trim() || null },
            color: { type: sql.NVarChar, value: color?.trim() || null },
            tailType: { type: sql.NVarChar, value: tailType?.trim() || null },
            size: { type: sql.NVarChar, value: size?.trim() || null },
            notes: { type: sql.NVarChar, value: notes?.trim() || null },
            status: { type: sql.NVarChar, value: status || 'Active' },
        });

        const newId = result[0]?.id;

        return NextResponse.json({
            success: true,
            data: { id: newId?.toString(), message: `Successfully added fish "${fishCode}"` },
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Error adding guppy fish:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to add guppy fish',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

// PUT /api/guppy-fish - Update guppy fish
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, fishCode, name, gender, birthDate, photoUrl, strain, color, tailType, size, notes, status } = body;

        if (!id || !fishCode || !gender) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields',
                message: 'id, fishCode, and gender are required',
            }, { status: 400 });
        }

        const existsQuery = `SELECT id FROM GuppyFish WHERE id = @id AND isActive = 1`;
        const existing = await executeQuery(existsQuery, { id: { type: sql.Int, value: Number(id) } });

        if (existing.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Fish not found',
                message: `Guppy fish with ID "${id}" not found`,
            }, { status: 404 });
        }

        const updateQuery = `
      UPDATE GuppyFish SET
        fishCode = @fishCode, name = @name, gender = @gender,
        birthDate = @birthDate, photoUrl = @photoUrl,
        strain = @strain, color = @color, tailType = @tailType,
        size = @size, notes = @notes, status = @status,
        updatedDate = GETDATE()
      WHERE id = @id AND isActive = 1
    `;

        await executeQuery(updateQuery, {
            id: { type: sql.Int, value: Number(id) },
            fishCode: { type: sql.NVarChar, value: fishCode.trim() },
            name: { type: sql.NVarChar, value: name?.trim() || null },
            gender: { type: sql.NVarChar, value: gender },
            birthDate: { type: sql.Date, value: birthDate || null },
            photoUrl: { type: sql.NVarChar, value: photoUrl?.trim() || null },
            strain: { type: sql.NVarChar, value: strain?.trim() || null },
            color: { type: sql.NVarChar, value: color?.trim() || null },
            tailType: { type: sql.NVarChar, value: tailType?.trim() || null },
            size: { type: sql.NVarChar, value: size?.trim() || null },
            notes: { type: sql.NVarChar, value: notes?.trim() || null },
            status: { type: sql.NVarChar, value: status || 'Active' },
        });

        return NextResponse.json({
            success: true,
            data: { id: id.toString(), message: `Successfully updated fish "${fishCode}"` },
        });

    } catch (error) {
        console.error('❌ Error updating guppy fish:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update guppy fish',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

// DELETE /api/guppy-fish - Soft delete guppy fish
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Missing required parameter: id',
            }, { status: 400 });
        }

        const deleteQuery = `
      UPDATE GuppyFish SET isActive = 0, updatedDate = GETDATE()
      WHERE id = @id AND isActive = 1
    `;

        await executeQuery(deleteQuery, {
            id: { type: sql.Int, value: Number(id) },
        });

        return NextResponse.json({
            success: true,
            data: { message: `Successfully deleted fish with ID ${id}` },
        });

    } catch (error) {
        console.error('❌ Error deleting guppy fish:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete guppy fish',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
