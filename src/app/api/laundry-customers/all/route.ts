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

// GET /api/laundry-customers/all - Get all customers
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching all laundry customers...');

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
      WHERE IsActive = 1
      ORDER BY TotalSpent DESC, FullName ASC
    `;

    const result = await executeQuery<LaundryCustomer>(query);

    console.log(`✅ Found ${result.length} customers`);

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      message: `Successfully retrieved ${result.length} customers`,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching all customers:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch customers',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}
