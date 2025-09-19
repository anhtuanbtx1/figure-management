import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure, executeQuery } from '@/lib/database';
import { Toy, ToyStatus, ToyCreateRequest } from '@/app/(DashboardLayout)/types/apps/toy';
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

// GET /api/toys - Get toys with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    console.log('📦 Fetching toys from database...');

    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const status = searchParams.get('status') || '';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;
    const ageRange = searchParams.get('ageRange') || '';
    const inStock = searchParams.get('inStock') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    console.log('🔍 Query parameters:', {
      search, category, brand, status, minPrice, maxPrice, 
      ageRange, inStock, page, pageSize, sortField, sortDirection
    });

    // First, get total count for pagination
    // We'll use a direct count query instead of relying on pagination

    // Get toys data with pagination
    const dataParams = {
      Search: { type: sql.NVarChar, value: search },
      CategoryId: { type: sql.NVarChar, value: category },
      BrandName: { type: sql.NVarChar, value: brand },
      Status: { type: sql.NVarChar, value: status },
      MinPrice: { type: sql.Decimal, value: minPrice },
      MaxPrice: { type: sql.Decimal, value: maxPrice },
      AgeRange: { type: sql.NVarChar, value: ageRange },
      InStock: { type: sql.Bit, value: inStock ? 1 : 0 },
      Page: { type: sql.Int, value: page },
      PageSize: { type: sql.Int, value: pageSize },
      SortField: { type: sql.NVarChar, value: sortField },
      SortDirection: { type: sql.NVarChar, value: sortDirection.toUpperCase() },
    };

    let toysResult, countResult;

    try {
      // Try stored procedure first for data
      console.log('🔧 Trying stored procedure sp_GetToysForFrontend...');
      toysResult = await executeStoredProcedure('sp_GetToysForFrontend', dataParams);
      
      // For count, use a direct query instead of the paginated stored procedure
      const countQuery = `
        SELECT COUNT(*) as total
        FROM zen50558_ManagementStore.dbo.Toys t
        LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
        LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
        WHERE t.IsActive = 1
          AND (@Search IS NULL OR @Search = '' OR t.Name LIKE '%' + @Search + '%' OR t.Description LIKE '%' + @Search + '%')
          AND (@CategoryId IS NULL OR @CategoryId = '' OR t.CategoryId = @CategoryId)
          AND (@BrandName IS NULL OR @BrandName = '' OR b.Name = @BrandName)
          AND (@Status IS NULL OR @Status = '' OR t.Status = @Status)
          AND (@MinPrice IS NULL OR t.Price >= @MinPrice)
          AND (@MaxPrice IS NULL OR t.Price <= @MaxPrice)
          AND (@AgeRange IS NULL OR @AgeRange = '' OR t.AgeRange LIKE '%' + @AgeRange + '%')
          AND (@InStock IS NULL OR @InStock = 0 OR t.Stock > 0)
      `;
      
      const countParams = {
        Search: { type: sql.NVarChar, value: search },
        CategoryId: { type: sql.NVarChar, value: category },
        BrandName: { type: sql.NVarChar, value: brand },
        Status: { type: sql.NVarChar, value: status },
        MinPrice: { type: sql.Decimal, value: minPrice },
        MaxPrice: { type: sql.Decimal, value: maxPrice },
        AgeRange: { type: sql.NVarChar, value: ageRange },
        InStock: { type: sql.Bit, value: inStock ? 1 : 0 },
      };
      
      const countRows = await executeQuery(countQuery, countParams);
      countResult = countRows[0]?.total || 0;
      console.log('✅ Stored procedure and count query executed successfully');
    } catch (procError) {
      console.log('⚠️ Stored procedure failed, using fallback query...');
      console.log('Procedure error:', procError);

      // Fallback to direct query
      const whereConditions = [];
      const queryParams: any = {};

      whereConditions.push('t.IsActive = 1');

      if (search) {
        whereConditions.push('(t.Name LIKE @Search OR t.Description LIKE @Search)');
        queryParams.Search = { type: sql.NVarChar, value: `%${search}%` };
      }
      if (category) {
        whereConditions.push('t.CategoryId = @CategoryId');
        queryParams.CategoryId = { type: sql.NVarChar, value: category };
      }
      if (brand) {
        whereConditions.push('b.Name = @BrandName');
        queryParams.BrandName = { type: sql.NVarChar, value: brand };
      }
      if (status) {
        whereConditions.push('t.Status = @Status');
        queryParams.Status = { type: sql.NVarChar, value: status };
      }
      if (minPrice !== null) {
        whereConditions.push('t.Price >= @MinPrice');
        queryParams.MinPrice = { type: sql.Decimal, value: minPrice };
      }
      if (maxPrice !== null) {
        whereConditions.push('t.Price <= @MaxPrice');
        queryParams.MaxPrice = { type: sql.Decimal, value: maxPrice };
      }
      if (ageRange) {
        whereConditions.push('t.AgeRange LIKE @AgeRange');
        queryParams.AgeRange = { type: sql.NVarChar, value: `%${ageRange}%` };
      }
      if (inStock) {
        whereConditions.push('t.Stock > 0');
      }

      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

      // Count query
      const countQuery = `
        SELECT COUNT(*) as total
        FROM zen50558_ManagementStore.dbo.Toys t
        LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
        LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
        ${whereClause}
      `;

      // Data query
      const dataQuery = `
        SELECT
          t.Id as id,
          t.Name as name,
          t.Description as description,
          t.Image as image,
          CONCAT('{"id":"', ISNULL(c.Id, ''), '","name":"', ISNULL(c.Name, ''), '","slug":"', ISNULL(c.Slug, ''), '","description":"', ISNULL(c.Description, ''), '","icon":"', ISNULL(c.Icon, ''), '","color":"', ISNULL(c.Color, ''), '"}') as category,
          t.Price as price,
          t.OriginalPrice as originalPrice,
          t.Stock as stock,
          t.Status as status,
          t.AgeRange as ageRange,
          ISNULL(b.Name, '') as brand,
          t.Material as material,
          CONCAT('{"length":', ISNULL(t.DimensionLength, 0), ',"width":', ISNULL(t.DimensionWidth, 0), ',"height":', ISNULL(t.DimensionHeight, 0), ',"weight":', ISNULL(t.Weight, 0), '}') as dimensions,
          ISNULL(t.Colors, '[]') as colors,
          ISNULL(t.Tags, '[]') as tags,
          ISNULL(t.Rating, 0) as rating,
          ISNULL(t.ReviewCount, 0) as reviewCount,
          t.CreatedAt as createdAt,
          t.UpdatedAt as updatedAt,
          ISNULL(t.IsNew, 0) as isNew,
          ISNULL(t.IsFeatured, 0) as isFeatured,
          ISNULL(t.Discount, 0) as discount
        FROM zen50558_ManagementStore.dbo.Toys t
        LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
        LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
        ${whereClause}
        ORDER BY
          CASE WHEN '${sortField}' = 'name' AND '${sortDirection}' = 'asc' THEN t.Name END ASC,
          CASE WHEN '${sortField}' = 'name' AND '${sortDirection}' = 'desc' THEN t.Name END DESC,
          CASE WHEN '${sortField}' = 'price' AND '${sortDirection}' = 'asc' THEN t.Price END ASC,
          CASE WHEN '${sortField}' = 'price' AND '${sortDirection}' = 'desc' THEN t.Price END DESC,
          CASE WHEN '${sortField}' = 'stock' AND '${sortDirection}' = 'asc' THEN t.Stock END ASC,
          CASE WHEN '${sortField}' = 'stock' AND '${sortDirection}' = 'desc' THEN t.Stock END DESC,
          CASE WHEN '${sortField}' = 'category' AND '${sortDirection}' = 'asc' THEN c.Name END ASC,
          CASE WHEN '${sortField}' = 'category' AND '${sortDirection}' = 'desc' THEN c.Name END DESC,
          CASE WHEN '${sortField}' = 'createdAt' AND '${sortDirection}' = 'asc' THEN t.CreatedAt END ASC,
          CASE WHEN '${sortField}' = 'createdAt' AND '${sortDirection}' = 'desc' THEN t.CreatedAt END DESC,
          t.CreatedAt DESC
        OFFSET ${(page - 1) * pageSize} ROWS
        FETCH NEXT ${pageSize} ROWS ONLY
      `;

      console.log('📋 Executing fallback queries...');
      const [countRows, dataRows] = await Promise.all([
        executeQuery(countQuery, queryParams),
        executeQuery(dataQuery, queryParams)
      ]);

      countResult = countRows[0]?.total || 0; // Get the actual count value
      toysResult = dataRows;
      console.log('✅ Fallback queries executed successfully');
    }
    
    // Map database results to frontend format
    const toys: Toy[] = toysResult.map(mapDatabaseRowToToy);
    
    // Calculate pagination info
    const totalItems = typeof countResult === 'number' ? countResult : countResult.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    console.log(`✅ Found ${toysResult.length} toys on page ${page}, total ${totalItems} toys`);

    // Return response in format expected by frontend
    return NextResponse.json({
      toys,
      pagination: {
        page,
        limit: pageSize,
        total: totalItems,
        totalPages,
      },
      success: true,
      message: `Successfully retrieved ${toys.length} toys`,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching toys:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch toys',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      toys: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }, { status: 500 });
  }
}

// POST /api/toys - Create new toy
export async function POST(request: NextRequest) {
  try {
    console.log('➕ Creating new toy...');

    // Parse request body
    const body: ToyCreateRequest = await request.json();
    
    console.log('📝 Toy data received:', body);

    // Validate required fields
    const requiredFields = ['name', 'description', 'categoryId', 'price', 'stock', 'brand'];
    const missingFields = requiredFields.filter(field => !body[field as keyof ToyCreateRequest]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: `Required fields missing: ${missingFields.join(', ')}`,
      }, { status: 400 });
    }

    // Validate price and stock
    if (body.price <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid price',
        message: 'Price must be greater than 0',
      }, { status: 400 });
    }

    if (body.stock < 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid stock',
        message: 'Stock cannot be negative',
      }, { status: 400 });
    }

    // Prepare parameters for stored procedure
    const params = {
      Name: { type: sql.NVarChar, value: body.name },
      Description: { type: sql.NText, value: body.description },
      Image: { type: sql.NVarChar, value: body.image || '/images/toys/default.jpg' },
      CategoryId: { type: sql.NVarChar, value: body.categoryId },
      Price: { type: sql.Decimal, value: body.price },
      OriginalPrice: { type: sql.Decimal, value: body.originalPrice || null },
      Stock: { type: sql.Int, value: body.stock },
      AgeRange: { type: sql.NVarChar, value: body.ageRange || '' },
      Brand: { type: sql.NVarChar, value: body.brand },
      Material: { type: sql.NVarChar, value: body.material || '' },
      DimensionLength: { type: sql.Decimal, value: body.dimensions?.length || 0 },
      DimensionWidth: { type: sql.Decimal, value: body.dimensions?.width || 0 },
      DimensionHeight: { type: sql.Decimal, value: body.dimensions?.height || 0 },
      Weight: { type: sql.Decimal, value: body.dimensions?.weight || 0 },
      Colors: { type: sql.NVarChar, value: JSON.stringify(body.colors || []) },
      Tags: { type: sql.NVarChar, value: JSON.stringify(body.tags || []) },
    };

    console.log('🔧 Executing stored procedure with params:', params);

    // Execute stored procedure to create toy
    const result = await executeStoredProcedure('sp_CreateToyFromFrontend', params);
    
    if (!result || result.length === 0) {
      throw new Error('No result returned from stored procedure');
    }

    // Map the created toy to frontend format
    const createdToy = mapDatabaseRowToToy(result[0]);
    
    console.log(`✅ Successfully created toy with ID: ${createdToy.id}`);

    return NextResponse.json({
      success: true,
      data: createdToy,
      message: `Successfully created toy "${createdToy.name}"`,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating toy:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create toy',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}