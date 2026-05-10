import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure, executeQuery } from '@/lib/database';
import { Toy, ToyStatus, ToyUpdateRequest } from '@/app/(DashboardLayout)/types/apps/toy';
import sql from 'mssql';

// Helper function to map database row to frontend Toy format
function mapDatabaseRowToToy(row: any): Toy {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    category: typeof row.category === 'string' ? JSON.parse(row.category) : row.category,
    price: row.price,
    originalPrice: row.originalPrice,
    stock: row.stock,
    status: row.status as ToyStatus,
    ageRange: row.ageRange,
    brand: row.brand,
    material: row.material,
    dimensions: typeof row.dimensions === 'string' ? JSON.parse(row.dimensions) : row.dimensions,
    colors: typeof row.colors === 'string' ? JSON.parse(row.colors) : row.colors,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    rating: row.rating,
    reviewCount: row.reviewCount,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    isNew: Boolean(row.isNew),
    isFeatured: Boolean(row.isFeatured),
    discount: row.discount || 0,
  };
}

// GET /api/toys/[id] - Get single toy by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const toyId = context.params.id;
    console.log(`🔍 Fetching toy with ID: ${toyId}`);

    // Try stored procedure first, fallback to direct query
    let result;
    try {
      result = await executeStoredProcedure('sp_GetToyByIdForFrontend', {
        ToyId: { type: sql.NVarChar, value: toyId },
      });
    } catch (spError) {
      console.warn('⚠️ Stored procedure not found, using direct query fallback');
      // Fallback: Direct query matching stored procedure logic
      const query = `
        SELECT
          t.Id as id,
          t.Name as name,
          t.Description as description,
          t.Image as image,
          CONCAT('{"id":"', c.Id, '","name":"', c.Name, '","slug":"', c.Slug,
                 '","description":"', ISNULL(c.Description, ''), '","icon":"', ISNULL(c.Icon, ''),
                 '","color":"', ISNULL(c.Color, ''), '"}') as category,
          t.Price as price,
          t.OriginalPrice as originalPrice,
          t.Stock as stock,
          t.Status as status,
          t.AgeRange as ageRange,
          b.Name as brand,
          t.Material as material,
          CONCAT('{"length":', ISNULL(t.DimensionLength, 0), ',"width":', ISNULL(t.DimensionWidth, 0),
                 ',"height":', ISNULL(t.DimensionHeight, 0), ',"weight":', ISNULL(t.Weight, 0), '}') as dimensions,
          t.Colors as colors,
          t.Tags as tags,
          t.Rating as rating,
          t.ReviewCount as reviewCount,
          t.CreatedAt as createdAt,
          t.UpdatedAt as updatedAt,
          ISNULL(t.IsNew, 0) as isNew,
          ISNULL(t.IsFeatured, 0) as isFeatured,
          ISNULL(t.Discount, 0) as discount
        FROM Toys t
        INNER JOIN ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
        INNER JOIN ToyBrands b ON t.BrandId = b.Id AND b.IsActive = 1
        WHERE t.Id = @toyId AND t.IsActive = 1
      `;
      result = await executeQuery(query, {
        toyId: { type: sql.NVarChar, value: toyId }
      });
    }

    if (!result || result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Toy not found',
        message: `Toy with ID "${toyId}" not found`,
      }, { status: 404 });
    }

    // Map database result to frontend format
    const toy = mapDatabaseRowToToy(result[0]);
    
    console.log(`✅ Successfully retrieved toy: ${toy.name}`);

    return NextResponse.json({
      success: true,
      data: toy,
      message: `Successfully retrieved toy "${toy.name}"`,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching toy:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch toy',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

// PUT /api/toys/[id] - Update toy
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const toyId = context.params.id;
    console.log(`✏️ Updating toy with ID: ${toyId}`);

    // Parse request body
    const body: ToyUpdateRequest = await request.json();
    
    console.log('📝 Update data received:', body);

    // Check if toy exists - use simple query instead of stored procedure
    const existingToy = await executeQuery(
      'SELECT Id, Name FROM Toys WHERE Id = @id AND IsActive = 1',
      { id: { type: sql.NVarChar, value: toyId } }
    );

    if (!existingToy || existingToy.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Toy not found',
        message: `Toy with ID "${toyId}" not found`,
      }, { status: 404 });
    }

    // Build update query dynamically based on provided fields
    const updateFields: string[] = [];
    const params: Record<string, any> = { id: { type: sql.NVarChar, value: toyId } };

    if (body.name !== undefined) {
      updateFields.push('Name = @name');
      params.name = { type: sql.NVarChar, value: body.name };
    }
    if (body.description !== undefined) {
      updateFields.push('Description = @description');
      params.description = { type: sql.NText, value: body.description };
    }
    if (body.image !== undefined) {
      updateFields.push('Image = @image');
      params.image = { type: sql.NVarChar, value: body.image };
    }
    if (body.categoryId !== undefined) {
      updateFields.push('CategoryId = @categoryId');
      params.categoryId = { type: sql.NVarChar, value: body.categoryId };
    }
    if (body.price !== undefined) {
      if (body.price <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid price',
          message: 'Price must be greater than 0',
        }, { status: 400 });
      }
      updateFields.push('Price = @price');
      params.price = { type: sql.Decimal, value: body.price };
    }
    if (body.originalPrice !== undefined) {
      updateFields.push('OriginalPrice = @originalPrice');
      params.originalPrice = { type: sql.Decimal, value: body.originalPrice };
    }
    if (body.stock !== undefined) {
      if (body.stock < 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid stock',
          message: 'Stock cannot be negative',
        }, { status: 400 });
      }
      updateFields.push('Stock = @stock');
      params.stock = { type: sql.Int, value: body.stock };
    }
    if (body.status !== undefined) {
      updateFields.push('Status = @status');
      params.status = { type: sql.NVarChar, value: body.status };
    }
    if (body.ageRange !== undefined) {
      updateFields.push('AgeRange = @ageRange');
      params.ageRange = { type: sql.NVarChar, value: body.ageRange };
    }
    if (body.brand !== undefined) {
      // Handle brand update - need to get or create brand ID
      const brandResult = await executeQuery(
        'SELECT Id FROM ToyBrands WHERE Name = @brandName AND IsActive = 1',
        { brandName: { type: sql.NVarChar, value: body.brand } }
      );
      
      let brandId: string;
      if (brandResult.length > 0) {
        brandId = brandResult[0].Id;
      } else {
        // Create new brand
        brandId = `brand-${Date.now()}`;
        await executeQuery(
          'INSERT INTO ToyBrands (Id, Name, IsActive, CreatedAt, UpdatedAt) VALUES (@id, @name, 1, GETDATE(), GETDATE())',
          { 
              id: { type: sql.NVarChar, value: brandId }, 
              name: { type: sql.NVarChar, value: body.brand } 
          }
        );
      }
      updateFields.push('BrandId = @brandId');
      params.brandId = { type: sql.NVarChar, value: brandId };
    }
    if (body.material !== undefined) {
      updateFields.push('Material = @material');
      params.material = { type: sql.NVarChar, value: body.material };
    }
    if (body.dimensions !== undefined) {
      if (body.dimensions.length !== undefined) {
        updateFields.push('DimensionLength = @dimensionLength');
        params.dimensionLength = { type: sql.Decimal, value: body.dimensions.length };
      }
      if (body.dimensions.width !== undefined) {
        updateFields.push('DimensionWidth = @dimensionWidth');
        params.dimensionWidth = { type: sql.Decimal, value: body.dimensions.width };
      }
      if (body.dimensions.height !== undefined) {
        updateFields.push('DimensionHeight = @dimensionHeight');
        params.dimensionHeight = { type: sql.Decimal, value: body.dimensions.height };
      }
      if (body.dimensions.weight !== undefined) {
        updateFields.push('Weight = @weight');
        params.weight = { type: sql.Decimal, value: body.dimensions.weight };
      }
    }
    if (body.colors !== undefined) {
      updateFields.push('Colors = @colors');
      params.colors = { type: sql.NVarChar, value: JSON.stringify(body.colors) };
    }
    if (body.tags !== undefined) {
      updateFields.push('Tags = @tags');
      params.tags = { type: sql.NVarChar, value: JSON.stringify(body.tags) };
    }

    // Always update the UpdatedAt field
    updateFields.push('UpdatedAt = GETDATE()');

    if (updateFields.length === 1) { // Only UpdatedAt field
      return NextResponse.json({
        success: false,
        error: 'No fields to update',
        message: 'No valid fields provided for update',
      }, { status: 400 });
    }

    // Execute update query
    const updateQuery = `
      UPDATE Toys 
      SET ${updateFields.join(', ')}
      WHERE Id = @id AND IsActive = 1
    `;

    await executeQuery(updateQuery, params);

    // Fetch updated toy - try stored procedure first, fallback to direct query
    let updatedResult;
    try {
      updatedResult = await executeStoredProcedure('sp_GetToyByIdForFrontend', {
        ToyId: { type: sql.NVarChar, value: toyId },
      });
    } catch (spError) {
      console.warn('⚠️ Stored procedure not found, using direct query fallback');
      const query = `
        SELECT
          t.Id as id,
          t.Name as name,
          t.Description as description,
          t.Image as image,
          CONCAT('{"id":"', c.Id, '","name":"', c.Name, '","slug":"', c.Slug,
                 '","description":"', ISNULL(c.Description, ''), '","icon":"', ISNULL(c.Icon, ''),
                 '","color":"', ISNULL(c.Color, ''), '"}') as category,
          t.Price as price,
          t.OriginalPrice as originalPrice,
          t.Stock as stock,
          t.Status as status,
          t.AgeRange as ageRange,
          b.Name as brand,
          t.Material as material,
          CONCAT('{"length":', ISNULL(t.DimensionLength, 0), ',"width":', ISNULL(t.DimensionWidth, 0),
                 ',"height":', ISNULL(t.DimensionHeight, 0), ',"weight":', ISNULL(t.Weight, 0), '}') as dimensions,
          t.Colors as colors,
          t.Tags as tags,
          t.Rating as rating,
          t.ReviewCount as reviewCount,
          t.CreatedAt as createdAt,
          t.UpdatedAt as updatedAt,
          ISNULL(t.IsNew, 0) as isNew,
          ISNULL(t.IsFeatured, 0) as isFeatured,
          ISNULL(t.Discount, 0) as discount
        FROM Toys t
        INNER JOIN ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
        INNER JOIN ToyBrands b ON t.BrandId = b.Id AND b.IsActive = 1
        WHERE t.Id = @toyId AND t.IsActive = 1
      `;
      updatedResult = await executeQuery(query, {
        toyId: { type: sql.NVarChar, value: toyId }
      });
    }

    const updatedToy = mapDatabaseRowToToy(updatedResult[0]);
    
    console.log(`✅ Successfully updated toy: ${updatedToy.name}`);

    return NextResponse.json({
      success: true,
      data: updatedToy,
      message: `Successfully updated toy "${updatedToy.name}"`,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error updating toy:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update toy',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

// DELETE /api/toys/[id] - Delete toy (soft delete)
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const toyId = context.params.id;
    console.log(`🗑️ Deleting toy with ID: ${toyId}`);

    // Check if toy exists
    const existingToy = await executeQuery(
      'SELECT Id, Name FROM Toys WHERE Id = @id AND IsActive = 1',
      { id: { type: sql.NVarChar, value: toyId } }
    );

    if (existingToy.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Toy not found',
        message: `Toy with ID "${toyId}" not found`,
      }, { status: 404 });
    }

    const toyName = existingToy[0].Name;

    // Soft delete - set IsActive to 0
    await executeQuery(
      'UPDATE Toys SET IsActive = 0, UpdatedAt = GETDATE() WHERE Id = @id',
      { id: { type: sql.NVarChar, value: toyId } }
    );

    console.log(`✅ Successfully deleted toy: ${toyName}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted toy "${toyName}"`,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error deleting toy:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete toy',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}
