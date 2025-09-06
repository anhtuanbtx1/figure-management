import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { GuestStatus } from '@/app/(DashboardLayout)/types/apps/eventGuest';

// Helper: read allowed values from a CHECK constraint definition (SQL Server)
async function getAllowedValuesFromCheckConstraint(constraintName: string): Promise<string[] | null> {
  try {
    const rows = await executeQuery(
      `SELECT OBJECT_DEFINITION(OBJECT_ID(@constraintName)) AS definition`,
      { constraintName }
    );
    const def: string | undefined = rows?.[0]?.definition;
    if (!def) return null;

    // Expect something like: CHECK (([Relationship] IN ('Friend','Family','Colleague')))
    const inMatch = def.match(/IN\s*\(([^\)]*)\)/i);
    if (!inMatch) return null;
    const list = inMatch[1];
    const values = list
      .split(',')
      .map(s => s.trim())
      .map(s => s.replace(/^N?'/, '').replace(/'$/, ''))
      .filter(Boolean);
    return values.length ? values : null;
  } catch (e) {
    console.warn('Could not read constraint definition:', e);
    return null;
  }
}

// Interface for database row (matching actual database schema)
interface WeddingGuestRow {
  id: number;
  name: string;
  unit: string;
  numberOfPeople: number;
  giftAmount: number;
  status: string;
  relationship: string | null;
  notes: string;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string | null;
  isActive: boolean;
}

// Interface for API response (matching updated EventGuest interface)
interface EventGuest {
  id: string;
  fullName: string;
  unit: string;
  numberOfPeople: number;
  contributionAmount: number;
  status: GuestStatus;
  relationship: string | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string | null;
  isActive: boolean;
}

// Map database status to GuestStatus enum
function mapDatabaseStatusToGuestStatus(dbStatus: string): GuestStatus {
  switch (dbStatus?.toLowerCase()) {
    case 'going':
      return GuestStatus.CONFIRMED;
    case 'notgoing':
      return GuestStatus.DECLINED;
    case 'maybe':
    case 'pending':
      return GuestStatus.PENDING;
    default:
      return GuestStatus.PENDING;
  }
}

// Optimized mapping function with minimal processing
function mapToEventGuest(row: WeddingGuestRow): EventGuest {
  // Fast numeric conversion without extensive validation
  const contributionAmount = Number(row.giftAmount) || 0;

  // Pre-computed status mapping for better performance
  let status: GuestStatus;
  switch (row.status?.toLowerCase()) {
    case 'going':
      status = GuestStatus.CONFIRMED;
      break;
    case 'notgoing':
      status = GuestStatus.DECLINED;
      break;
    default:
      status = GuestStatus.PENDING;
      break;
  }

  return {
    id: row.id.toString(),
    fullName: row.name,
    unit: row.unit,
    numberOfPeople: row.numberOfPeople,
    contributionAmount,
    status,
    relationship: row.relationship,
    notes: row.notes,
    createdAt: row.createdDate,
    updatedAt: row.updatedDate,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    isActive: row.isActive,
  };
}

// GET /api/wedding-guests - Get wedding guests with pagination and optimized search
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🔍 Fetching wedding guests from database...');

    // Get search parameters with pagination
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50'); // Default 50 records per page
    const sortField = searchParams.get('sortField') || 'createdDate';
    const sortDirection = searchParams.get('sortDirection') || 'DESC';

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    // Allow larger pageSize for statistics (up to 1000), but limit normal pagination to 100
    const maxPageSize = pageSize > 100 ? 1000 : 100;
    const validPageSize = Math.min(Math.max(1, pageSize), maxPageSize);
    const offset = (validPage - 1) * validPageSize;

    console.log('📄 Pagination params:', { page: validPage, pageSize: validPageSize, offset });

    const queryParams: any = {};
    let whereConditions = ['isActive = 1'];
    let joinClause = '';

    // Decode and normalize search term for Vietnamese characters (for error logging)
    const decodedSearch = search ? decodeURIComponent(search) : '';
    const normalizedSearch = decodedSearch ? decodedSearch.normalize('NFC') : '';

    // Optimized search logic
    if (search) {
      // Use different search strategies based on search term characteristics
      const isNumeric = /^\d+$/.test(normalizedSearch);
      const searchTerm = `%${normalizedSearch}%`;

      if (isNumeric) {
        // Optimized numeric search using computed columns
        whereConditions.push(`(
          GiftAmountText LIKE @search OR
          NumberOfPeopleText LIKE @search OR
          name LIKE @search OR
          unit LIKE @search
        )`);
      } else if (normalizedSearch.length >= 3) {
        // Use LIKE search for longer terms (fallback since full-text index not available)
        whereConditions.push(`(
          name LIKE @search OR
          unit LIKE @search OR
          relationship LIKE @search OR
          notes LIKE @search OR
          status LIKE @search
        )`);
      } else {
        // Use LIKE search for short terms (fallback)
        whereConditions.push(`(
          name LIKE @search OR
          unit LIKE @search OR
          status LIKE @search
        )`);
      }
      queryParams.search = searchTerm;
    }

    // Add status filter
    if (status) {
      whereConditions.push('status = @status');
      queryParams.status = status;
    }

    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['createdDate', 'name', 'unit', 'status', 'giftAmount', 'numberOfPeople'];
    const validSortField = allowedSortFields.includes(sortField) ? sortField : 'createdDate';
    const validSortDirection = ['ASC', 'DESC'].includes(sortDirection.toUpperCase()) ? sortDirection.toUpperCase() : 'DESC';

    // Build optimized query with pagination
    const countQuery = `
      SELECT COUNT(*) as TotalCount
      FROM WeddingGuests ${joinClause}
      WHERE ${whereConditions.join(' AND ')}
    `;

    const dataQuery = `
      SELECT
        id,
        name,
        unit,
        numberOfPeople,
        giftAmount,
        status,
        relationship,
        notes,
        createdDate,
        updatedDate,
        createdBy,
        updatedBy,
        isActive
      FROM WeddingGuests ${joinClause}
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${validSortField} ${validSortDirection}
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;

    console.log('🔍 Executing optimized queries...');
    console.log('Search params:', { search, status, isNumeric: /^\d+$/.test(search) });

    // Execute count and data queries in parallel for better performance
    const [countResult, dataResult] = await Promise.all([
      executeQuery<{ TotalCount: number }>(countQuery, queryParams),
      executeQuery<WeddingGuestRow>(dataQuery, {
        ...queryParams,
        offset,
        pageSize: validPageSize
      })
    ]);

    const totalCount = countResult[0]?.TotalCount || 0;
    const totalPages = Math.ceil(totalCount / validPageSize);

    console.log(`✅ Found ${dataResult.length} guests (${totalCount} total) in ${Date.now() - startTime}ms`);

    // Optimized mapping with minimal processing
    const guests: EventGuest[] = dataResult.map(mapToEventGuest);

    // Return paginated response
    return NextResponse.json({
      success: true,
      data: guests,
      pagination: {
        page: validPage,
        pageSize: validPageSize,
        totalCount,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1,
      },
      count: guests.length,
      message: `Successfully retrieved ${guests.length} of ${totalCount} wedding guests`,
      searchTerm: search,
      statusFilter: status,
      performanceMs: Date.now() - startTime,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching wedding guests:', error);

    // Log additional context for debugging (re-extract params for error context)
    const { searchParams: errorSearchParams } = new URL(request.url);
    const errorSearch = errorSearchParams.get('search')?.trim() || '';
    const errorStatus = errorSearchParams.get('status')?.trim() || '';
    const errorPage = parseInt(errorSearchParams.get('page') || '1');
    const errorPageSize = parseInt(errorSearchParams.get('pageSize') || '50');

    console.error('Search params:', {
      originalSearch: errorSearch,
      status: errorStatus,
      page: errorPage,
      pageSize: errorPageSize
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch wedding guests',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      data: [],
      count: 0,
      performanceMs: Date.now() - startTime,
    }, { status: 500 });
  }
}

// GET /api/wedding-guests/stats - Get wedding guests statistics
export async function HEAD(request: NextRequest) {
  try {
    console.log('📊 Calculating wedding guests statistics...');

    const query = `
      SELECT
        COUNT(*) as TotalGuests,
        SUM(CASE WHEN status = 'Going' THEN 1 ELSE 0 END) as ConfirmedGuests,
        SUM(CASE WHEN status = 'Maybe' OR status = 'Pending' THEN 1 ELSE 0 END) as PendingGuests,
        SUM(CASE WHEN status = 'NotGoing' THEN 1 ELSE 0 END) as DeclinedGuests,
        COALESCE(SUM(CASE WHEN giftAmount IS NOT NULL THEN giftAmount ELSE 0 END), 0) as TotalContribution,
        COALESCE(AVG(CASE WHEN giftAmount IS NOT NULL THEN giftAmount ELSE 0 END), 0) as AverageContribution
      FROM WeddingGuests
      WHERE isActive = 1
    `;

    const result = await executeQuery(query);
    const stats = result[0];

    // Safely convert to numbers with fallback to 0
    const totalGuests = Number(stats.TotalGuests) || 0;
    const confirmedGuests = Number(stats.ConfirmedGuests) || 0;
    const pendingGuests = Number(stats.PendingGuests) || 0;
    const declinedGuests = Number(stats.DeclinedGuests) || 0;
    const totalContribution = Number(stats.TotalContribution) || 0;
    const averageContribution = Number(stats.AverageContribution) || 0;

    console.log('📊 Statistics calculated:', {
      totalGuests,
      confirmedGuests,
      pendingGuests,
      declinedGuests,
      totalContribution,
      averageContribution
    });

    return NextResponse.json({
      success: true,
      data: {
        totalGuests,
        confirmedGuests,
        pendingGuests,
        declinedGuests,
        totalContribution,
        averageContribution,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error calculating statistics:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to calculate statistics',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

// POST /api/wedding-guests - Add new wedding guest
export async function POST(request: NextRequest) {
  try {
    console.log('➕ Adding new wedding guest...');

    // Parse request body
    const body = await request.json();
    let { fullName, unit, numberOfPeople, contributionAmount, status, relationship, notes } = body;

    // Validate required fields
    if (!fullName || !unit) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'fullName and unit are required',
      }, { status: 400 });
    }

    // Relationship validation against CHECK constraint if present
    const allowedRelationshipValues = await getAllowedValuesFromCheckConstraint('CK_WeddingGuests_Relationship');
    if (allowedRelationshipValues && relationship) {
      const normalized = String(relationship).trim();
      if (!allowedRelationshipValues.includes(normalized)) {
        // Fallback to NULL to avoid constraint violation
        console.warn(`Relationship "${normalized}" not in allowed list ${JSON.stringify(allowedRelationshipValues)}. Setting to NULL.`);
        relationship = null;
      }
    }

    // Map frontend status to database status
    let dbStatus = 'Pending';
    switch (status) {
      case 'CONFIRMED':
        dbStatus = 'Going';
        break;
      case 'DECLINED':
        dbStatus = 'NotGoing';
        break;
      case 'PENDING':
      default:
        dbStatus = 'Pending';
        break;
    }

    // Insert query
    const insertQuery = `
      INSERT INTO WeddingGuests (
        name,
        unit,
        numberOfPeople,
        giftAmount,
        status,
        relationship,
        notes,
        createdDate,
        updatedDate,
        createdBy,
        isActive
      )
      OUTPUT INSERTED.id
      VALUES (
        @fullName,
        @unit,
        @numberOfPeople,
        @contributionAmount,
        @status,
        @relationship,
        @notes,
        GETDATE(),
        GETDATE(),
        @createdBy,
        1
      )
    `;

    // Execute insert query
    const result = await executeQuery(insertQuery, {
      fullName: fullName.trim(),
      unit: unit.trim(),
      numberOfPeople: Number(numberOfPeople) || 1,
      contributionAmount: Number(contributionAmount) || 0,
      status: dbStatus,
      relationship: relationship || null,
      notes: notes || '',
      createdBy: 'System', // TODO: Replace with actual user when auth is implemented
    });

    const newGuestId = result[0]?.id;

    if (!newGuestId) {
      throw new Error('Failed to get new guest ID');
    }

    console.log(`✅ Successfully added new guest with ID: ${newGuestId}`);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: newGuestId.toString(),
        message: `Successfully added guest "${fullName}"`,
      },
      message: 'Guest added successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error adding wedding guest:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to add wedding guest',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

// PUT /api/wedding-guests - Update existing wedding guest
export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Updating wedding guest...');

    // Parse request body
    const body = await request.json();
    let { id, fullName, unit, numberOfPeople, contributionAmount, status, relationship, notes } = body;

    // Validate required fields
    if (!id || !fullName || !unit) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'id, fullName and unit are required',
      }, { status: 400 });
    }

    console.log('📝 Update data received:', {
      id,
      fullName,
      unit,
      numberOfPeople,
      contributionAmount,
      status,
      relationship,
      notes
    });

    // Check if guest exists
    const existsQuery = `SELECT id FROM WeddingGuests WHERE id = @id AND isActive = 1`;
    const existingGuest = await executeQuery(existsQuery, { id: Number(id) });

    if (existingGuest.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Guest not found',
        message: `Wedding guest with ID "${id}" not found`,
      }, { status: 404 });
    }

    // Relationship validation against CHECK constraint if present
    const allowedRelationshipValues = await getAllowedValuesFromCheckConstraint('CK_WeddingGuests_Relationship');
    if (allowedRelationshipValues && relationship) {
      const normalized = String(relationship).trim();
      if (!allowedRelationshipValues.includes(normalized)) {
        // Fallback to NULL to avoid constraint violation
        console.warn(`Relationship "${normalized}" not in allowed list ${JSON.stringify(allowedRelationshipValues)}. Setting to NULL.`);
        relationship = null;
      }
    }

    // Map frontend status to database status
    let dbStatus = 'Pending';
    switch (status) {
      case 'CONFIRMED':
        dbStatus = 'Going';
        break;
      case 'DECLINED':
        dbStatus = 'NotGoing';
        break;
      case 'PENDING':
      default:
        dbStatus = 'Pending';
        break;
    }

    // Update query
    const updateQuery = `
      UPDATE WeddingGuests
      SET
        name = @fullName,
        unit = @unit,
        numberOfPeople = @numberOfPeople,
        giftAmount = @contributionAmount,
        status = @status,
        relationship = @relationship,
        notes = @notes,
        updatedDate = GETDATE(),
        updatedBy = @updatedBy
      WHERE id = @id AND isActive = 1
    `;

    console.log('🔄 Executing update query with params:', {
      id: Number(id),
      fullName: fullName.trim(),
      unit: unit.trim(),
      numberOfPeople: Number(numberOfPeople) || 1,
      contributionAmount: Number(contributionAmount) || 0,
      status: dbStatus,
      relationship: relationship || null,
      notes: notes || '',
      updatedBy: 'System'
    });

    // Execute update query
    await executeQuery(updateQuery, {
      id: Number(id),
      fullName: fullName.trim(),
      unit: unit.trim(),
      numberOfPeople: Number(numberOfPeople) || 1,
      contributionAmount: Number(contributionAmount) || 0,
      status: dbStatus,
      relationship: relationship || null,
      notes: notes || '',
      updatedBy: 'System', // TODO: Replace with actual user when auth is implemented
    });

    console.log(`✅ Successfully updated guest with ID: ${id}`);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: id.toString(),
        message: `Successfully updated guest "${fullName}"`,
      },
      message: 'Guest updated successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error updating wedding guest:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to update wedding guest',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}
