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

// Map database row to EventGuest interface
function mapToEventGuest(row: WeddingGuestRow): EventGuest {
  // Safely convert giftAmount to number
  const giftAmount = row.giftAmount;
  let contributionAmount = 0;

  if (giftAmount !== null && giftAmount !== undefined) {
    const parsed = Number(giftAmount);
    contributionAmount = isNaN(parsed) ? 0 : parsed;
  }

  console.log(`💰 Mapping guest ${row.name}: giftAmount=${giftAmount} → contributionAmount=${contributionAmount}`);

  return {
    id: row.id.toString(),
    fullName: row.name || '',
    unit: row.unit || '',
    numberOfPeople: Number(row.numberOfPeople) || 1,
    contributionAmount,
    status: mapDatabaseStatusToGuestStatus(row.status),
    relationship: row.relationship,
    notes: row.notes || '',
    createdAt: new Date(row.createdDate),
    updatedAt: new Date(row.updatedDate),
    createdBy: row.createdBy || '',
    updatedBy: row.updatedBy,
    isActive: Boolean(row.isActive),
  };
}

// GET /api/wedding-guests - Get all wedding guests with optional search
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching wedding guests from database...');

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    // Build dynamic query with search functionality
    let query = `
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
      FROM WeddingGuests
      WHERE isActive = 1
    `;

    const queryParams: any = {};

    // Add search condition (LIKE search across multiple fields)
    if (search) {
      query += ` AND (
        name LIKE @search OR
        unit LIKE @search OR
        relationship LIKE @search OR
        notes LIKE @search OR
        status LIKE @search OR
        CAST(giftAmount AS NVARCHAR) LIKE @search OR
        CAST(numberOfPeople AS NVARCHAR) LIKE @search
      )`;
      queryParams.search = `%${search}%`;
    }

    // Add status filter
    if (status) {
      query += ` AND status = @status`;
      queryParams.status = status;
    }

    query += ` ORDER BY createdDate DESC`;

    console.log('🔍 Executing query with search:', search, 'status:', status);

    // Execute query
    const rows = await executeQuery<WeddingGuestRow>(query, queryParams);

    console.log(`✅ Found ${rows.length} wedding guests`);

    // Map database rows to EventGuest interface
    const guests: EventGuest[] = rows.map(mapToEventGuest);

    // Return success response
    return NextResponse.json({
      success: true,
      data: guests,
      count: guests.length,
      message: `Successfully retrieved ${guests.length} wedding guests`,
      searchTerm: search,
      statusFilter: status,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching wedding guests:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch wedding guests',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      data: [],
      count: 0,
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
