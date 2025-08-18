import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/wallet/categories - Fetch all wallet categories for dropdown
export async function GET() {
  try {
    console.log('📂 Fetching wallet categories from database...');

    // Add initialization check with retry logic
    let rows: any[] = [];
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        // Direct query to get categories
        const query = `
          SELECT 
            Id as id,
            Name as name,
            Type as type,
            Color as color,
            IsActive as isActive
          FROM zen50558_ManagementStore.dbo.WalletCategories 
          WHERE IsActive = 1
          ORDER BY Type, Name
        `;
        rows = await executeQuery(query);
        break; // Success, exit retry loop
      } catch (queryError) {
        retryCount++;
        if (retryCount > maxRetries) {
          throw queryError; // Final failure
        }
        console.log(`🔄 Query failed, retrying in 500ms... (${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`✅ Found ${rows.length} wallet categories`);

    // Transform data for frontend
    const categories = rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      color: row.color,
      isActive: row.isActive
    }));

    return NextResponse.json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
      count: categories.length
    });

  } catch (error) {
    console.error('❌ Error fetching wallet categories:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0
    }, { status: 500 });
  }
}

// POST /api/wallet/categories - Create new category (optional for future)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, color } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json({
        success: false,
        message: 'Name and type are required',
        data: null
      }, { status: 400 });
    }

    // Generate ID
    const id = `cat-${Date.now()}`;

    // Insert new category
    const insertQuery = `
      INSERT INTO zen50558_ManagementStore.dbo.WalletCategories 
      (Id, Name, Type, Color, IsActive)
      VALUES (@id, @name, @type, @color, 1)
    `;

    await executeQuery(insertQuery, {
      id,
      name,
      type,
      color: color || '#4CAF50'
    });

    console.log(`✅ Created new wallet category: ${name}`);

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: {
        id,
        name,
        type,
        color: color || '#4CAF50',
        isActive: true
      }
    });

  } catch (error) {
    console.error('❌ Error creating wallet category:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create category',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
}
