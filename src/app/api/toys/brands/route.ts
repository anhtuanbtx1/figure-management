import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/database';
import sql from 'mssql';

// GET /api/toys/brands - Get all toy brands
export async function GET() {
  try {
    console.log('🏷️ Fetching toy brands from database...');

    // Add initialization check with retry logic
    let rows: any[] = [];
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        // Try to use stored procedure first
        rows = await executeStoredProcedure('sp_GetBrandsForFrontend', {});
        break; // Success, exit retry loop
      } catch (procError) {
        console.log(`⚠️ Stored procedure attempt ${retryCount + 1} failed, trying direct query...`);

        try {
          // Fallback to direct query with fully qualified names
          const query = `
            SELECT DISTINCT Name as brand
            FROM zen50558_ManagementStore.dbo.ToyBrands
            WHERE IsActive = 1
            ORDER BY Name
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
    }

    console.log(`✅ Found ${rows.length} toy brands`);

    // Extract brand names into array
    const brands: string[] = rows.map(row => row.brand);

    // Return success response
    return NextResponse.json({
      success: true,
      data: brands,
      count: brands.length,
      message: `Successfully retrieved ${brands.length} toy brands`,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching toy brands:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch toy brands',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      data: [],
      count: 0,
    }, { status: 500 });
  }
}

// POST /api/toys/brands - Create new brand (optional for admin)
export async function POST(request: NextRequest) {
  try {
    console.log('➕ Creating new toy brand...');

    // Parse request body
    const body = await request.json();
    const { name, description, website, logo } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'name is required',
      }, { status: 400 });
    }

    // Check if brand already exists
    const existingBrand = await executeQuery(
      'SELECT Id FROM ToyBrands WHERE Name = @name AND IsActive = 1',
      { name: { type: sql.NVarChar, value: name } }
    );

    if (existingBrand.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Brand already exists',
        message: `Brand "${name}" already exists`,
      }, { status: 409 });
    }

    // Generate new ID
    const newId = `brand-${Date.now()}`;

    // Insert new brand
    const insertQuery = `
      INSERT INTO ToyBrands (Id, Name, Description, Website, Logo, IsActive, CreatedAt, UpdatedAt)
      VALUES (@id, @name, @description, @website, @logo, 1, GETDATE(), GETDATE())
    `;

    await executeQuery(insertQuery, {
      id: { type: sql.NVarChar, value: newId },
      name: { type: sql.NVarChar, value: name },
      description: { type: sql.NVarChar, value: description || '' },
      website: { type: sql.NVarChar, value: website || '' },
      logo: { type: sql.NVarChar, value: logo || '' },
    });

    console.log(`✅ Successfully created brand with ID: ${newId}`);

    return NextResponse.json({
      success: true,
      data: {
        id: newId,
        name,
        description,
        website,
        logo,
      },
      message: `Successfully created brand "${name}"`,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating toy brand:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create toy brand',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}
