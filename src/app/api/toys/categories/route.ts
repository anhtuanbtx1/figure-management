import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/database';
import { ToyCategory } from '@/app/(DashboardLayout)/types/apps/toy';
import sql from 'mssql';

// Helper function to map database row to frontend ToyCategory format
function mapDatabaseRowToCategory(row: any): ToyCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    icon: row.icon || '',
    color: row.color || '#000000',
  };
}

// GET /api/toys/categories - Get all toy categories
export async function GET() {
  try {
    console.log('📂 Fetching toy categories from database...');

    // Add initialization check with retry logic
    let rows: any[] = [];
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        // Try to use stored procedure first
        rows = await executeStoredProcedure('sp_GetCategoriesForFrontend', {});
        break; // Success, exit retry loop
      } catch (procError) {
        console.log(`⚠️ Stored procedure attempt ${retryCount + 1} failed, trying direct query...`);

        try {
          // Fallback to direct query with fully qualified names
          const query = `
            SELECT
              Id as id,
              Name as name,
              Slug as slug,
              Description as description,
              Icon as icon,
              Color as color
            FROM zen50558_ManagementStore.dbo.ToyCategories
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

    console.log(`✅ Found ${rows.length} toy categories`);

    // Map database rows to ToyCategory interface
    const categories: ToyCategory[] = rows.map(mapDatabaseRowToCategory);

    // Return success response
    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
      message: `Successfully retrieved ${categories.length} toy categories`,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching toy categories:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch toy categories',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      data: [],
      count: 0,
    }, { status: 500 });
  }
}

// POST /api/toys/categories - Create new category (optional for admin)
export async function POST(request: NextRequest) {
  try {
    console.log('➕ Creating new toy category...');

    // Parse request body
    const body = await request.json();
    const { name, slug, description, icon, color } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'name and slug are required',
      }, { status: 400 });
    }

    // Check if slug already exists
    const existingCategory = await executeQuery(
      'SELECT Id FROM ToyCategories WHERE Slug = @slug AND IsActive = 1',
      { slug: { type: sql.NVarChar, value: slug } }
    );

    if (existingCategory.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Category already exists',
        message: `Category with slug "${slug}" already exists`,
      }, { status: 409 });
    }

    // Generate new ID
    const newId = `cat-${Date.now()}`;

    // Insert new category
    const insertQuery = `
      INSERT INTO ToyCategories (Id, Name, Slug, Description, Icon, Color, IsActive, CreatedAt, UpdatedAt)
      VALUES (@id, @name, @slug, @description, @icon, @color, 1, GETDATE(), GETDATE())
    `;

    await executeQuery(insertQuery, {
      id: { type: sql.NVarChar, value: newId },
      name: { type: sql.NVarChar, value: name },
      slug: { type: sql.NVarChar, value: slug },
      description: { type: sql.NVarChar, value: description || '' },
      icon: { type: sql.NVarChar, value: icon || '' },
      color: { type: sql.NVarChar, value: color || '#000000' },
    });

    // Fetch the created category
    const createdCategory = await executeQuery(
      `SELECT Id as id, Name as name, Slug as slug, Description as description, 
              Icon as icon, Color as color 
       FROM ToyCategories 
       WHERE Id = @id`,
      { id: { type: sql.NVarChar, value: newId } }
    );

    const category = mapDatabaseRowToCategory(createdCategory[0]);

    console.log(`✅ Successfully created category with ID: ${newId}`);

    return NextResponse.json({
      success: true,
      data: category,
      message: `Successfully created category "${name}"`,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating toy category:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create toy category',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}
