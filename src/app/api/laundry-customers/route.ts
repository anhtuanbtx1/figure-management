import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

interface LaundryCustomer {
  id: number;
  fullName: string;
  phoneNumber: string;
  notes: string | null;
  totalOrders: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/laundry-customers?phone=xxx - Get customer by phone number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone')?.trim();

    if (!phone) {
      return NextResponse.json({
        success: false,
        error: 'Missing phone parameter',
        message: 'Phone number is required',
      }, { status: 400 });
    }

    console.log('🔍 Searching for customer with phone:', phone);

    // Check if table exists first
    const checkTableQuery = `
      SELECT COUNT(*) as TableExists 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'LaundryCustomers'
    `;
    
    const tableCheck = await executeQuery(checkTableQuery);
    
    if (!tableCheck[0]?.TableExists) {
      console.error('❌ LaundryCustomers table does not exist!');
      return NextResponse.json({
        success: false,
        error: 'Database table not found',
        message: 'LaundryCustomers table does not exist. Please run database/create-laundry-schema.sql',
      }, { status: 500 });
    }

    const query = `
      SELECT 
        Id as id,
        FullName as fullName,
        PhoneNumber as phoneNumber,
        Notes as notes,
        TotalOrders as totalOrders,
        TotalSpent as totalSpent,
        IsActive as isActive,
        CreatedAt as createdAt,
        UpdatedAt as updatedAt
      FROM LaundryCustomers
      WHERE PhoneNumber = @phone AND IsActive = 1
    `;

    const result = await executeQuery<LaundryCustomer>(query, {
      phone: { type: sql.NVarChar, value: phone }
    });

    if (result.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Customer not found',
      }, { status: 200 });
    }

    console.log('✅ Found customer:', result[0].fullName);

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Customer found',
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching customer:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch customer',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      hint: 'Make sure to run database/create-laundry-schema.sql first',
    }, { status: 500 });
  }
}

// POST /api/laundry-customers - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, phoneNumber, notes } = body;

    if (!fullName || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'fullName and phoneNumber are required',
      }, { status: 400 });
    }

    console.log('➕ Creating new customer:', fullName, phoneNumber);

    // Check if customer with this phone already exists
    const existingQuery = `
      SELECT Id FROM LaundryCustomers 
      WHERE PhoneNumber = @phoneNumber AND IsActive = 1
    `;
    
    const existing = await executeQuery(existingQuery, {
      phoneNumber: { type: sql.NVarChar, value: phoneNumber.trim() }
    });

    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Customer already exists',
        message: 'A customer with this phone number already exists',
        data: { id: existing[0].Id }
      }, { status: 409 });
    }

    const insertQuery = `
      INSERT INTO LaundryCustomers (
        FullName,
        PhoneNumber,
        Notes,
        CreatedAt,
        UpdatedAt,
        CreatedBy,
        IsActive
      )
      OUTPUT INSERTED.Id
      VALUES (
        @fullName,
        @phoneNumber,
        @notes,
        GETDATE(),
        GETDATE(),
        @createdBy,
        1
      )
    `;

    const result = await executeQuery(insertQuery, {
      fullName: { type: sql.NVarChar, value: fullName.trim() },
      phoneNumber: { type: sql.NVarChar, value: phoneNumber.trim() },
      notes: { type: sql.NText, value: notes || null },
      createdBy: { type: sql.NVarChar, value: 'System' }
    });

    const newCustomerId = result[0]?.Id;

    console.log(`✅ Successfully created customer with ID: ${newCustomerId}`);

    return NextResponse.json({
      success: true,
      data: {
        id: newCustomerId,
        fullName,
        phoneNumber,
        notes
      },
      message: 'Customer created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating customer:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create customer',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}
