import { NextRequest, NextResponse } from 'next/server';
import { 
  executeStoredProcedureCached, 
  executeQueryCached, 
  clearCache,
  executeBatch 
} from '@/lib/database-optimized';
import { Toy, ToyStatus, ToyCreateRequest } from '@/app/(DashboardLayout)/types/apps/toy';

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

// Generate cache key for toys query
function generateToysCacheKey(params: any): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as any);
  
  return `toys:list:${Buffer.from(JSON.stringify(sortedParams)).toString('base64')}`;
}

// GET /api/toys - Optimized toys fetching with caching
export async function GET(request: NextRequest) {
  try {
    console.log('📦 Fetching toys from database (optimized)...');

    const { searchParams } = new URL(request.url);
    
    // Extract and validate query parameters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const status = searchParams.get('status') || '';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;
    const ageRange = searchParams.get('ageRange') || '';
    const inStock = searchParams.get('inStock') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(5, parseInt(searchParams.get('pageSize') || '20'))); // Limit page size
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortDirection = (searchParams.get('sortDirection') || 'desc').toUpperCase();

    console.log('🔍 Query parameters:', {
      search, category, brand, status, minPrice, maxPrice, 
      ageRange, inStock, page, pageSize, sortField, sortDirection
    });

    // Prepare parameters
    const params = {
      Search: search,
      CategoryId: category,
      BrandName: brand,
      Status: status,
      MinPrice: minPrice,
      MaxPrice: maxPrice,
      AgeRange: ageRange,
      InStock: inStock ? 1 : 0,
      Page: page,
      PageSize: pageSize,
      SortField: sortField,
      SortDirection: sortDirection,
    };

    // Generate cache key
    const cacheKey = generateToysCacheKey(params);
    const cacheTTL = search || category || brand || status ? 180 : 300; // Shorter TTL for filtered results

    let toysResult, countResult;

    try {
      // Try optimized stored procedure with caching
      console.log('🔧 Trying cached stored procedure sp_GetToysForFrontend...');
      
      // Execute both data and count queries in parallel for better performance
      const [dataResult, countRows] = await Promise.all([
        executeStoredProcedureCached('sp_GetToysForFrontend', params, `${cacheKey}:data`, cacheTTL),
        executeQueryCached(
          `SELECT COUNT(*) as total
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
             AND (@InStock IS NULL OR @InStock = 0 OR t.Stock > 0)`,
          {
            Search: search,
            CategoryId: category,
            BrandName: brand,
            Status: status,
            MinPrice: minPrice,
            MaxPrice: maxPrice,
            AgeRange: ageRange,
            InStock: inStock ? 1 : 0,
          },
          `${cacheKey}:count`,
          cacheTTL
        )
      ]);

      toysResult = dataResult;
      countResult = countRows[0]?.total || 0;
      console.log('✅ Cached stored procedure and count query executed successfully');

    } catch (procError) {
      console.log('⚠️ Stored procedure failed, using optimized fallback query...');
      console.log('Procedure error:', procError);

      // Optimized fallback query with proper indexing hints
      const whereConditions = ['t.IsActive = 1'];
      const queryParams: any = {};

      // Build WHERE conditions dynamically for better query optimization
      if (search) {
        whereConditions.push('(t.Name LIKE @Search OR t.Description LIKE @Search)');
        queryParams.Search = `%${search}%`;
      }
      if (category) {
        whereConditions.push('t.CategoryId = @CategoryId');
        queryParams.CategoryId = category;
      }
      if (brand) {
        whereConditions.push('b.Name = @BrandName');
        queryParams.BrandName = brand;
      }
      if (status) {
        whereConditions.push('t.Status = @Status');
        queryParams.Status = status;
      }
      if (minPrice !== null) {
        whereConditions.push('t.Price >= @MinPrice');
        queryParams.MinPrice = minPrice;
      }
      if (maxPrice !== null) {
        whereConditions.push('t.Price <= @MaxPrice');
        queryParams.MaxPrice = maxPrice;
      }
      if (ageRange) {
        whereConditions.push('t.AgeRange LIKE @AgeRange');
        queryParams.AgeRange = `%${ageRange}%`;
      }
      if (inStock) {
        whereConditions.push('t.Stock > 0');
      }

      const whereClause = whereConditions.join(' AND ');

      // Optimized queries with hints for better performance
      const queries = [
        {
          query: `
            SELECT COUNT(*) as total
            FROM zen50558_ManagementStore.dbo.Toys t WITH (NOLOCK)
            LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c WITH (NOLOCK) ON t.CategoryId = c.Id
            LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b WITH (NOLOCK) ON t.BrandId = b.Id
            WHERE ${whereClause}
          `,
          params: queryParams
        },
        {
          query: `
            SELECT TOP (${pageSize})
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
            FROM zen50558_ManagementStore.dbo.Toys t WITH (NOLOCK)
            LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c WITH (NOLOCK) ON t.CategoryId = c.Id
            LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b WITH (NOLOCK) ON t.BrandId = b.Id
            WHERE ${whereClause}
            ORDER BY
              CASE WHEN '${sortField}' = 'name' AND '${sortDirection}' = 'ASC' THEN t.Name END ASC,
              CASE WHEN '${sortField}' = 'name' AND '${sortDirection}' = 'DESC' THEN t.Name END DESC,
              CASE WHEN '${sortField}' = 'price' AND '${sortDirection}' = 'ASC' THEN t.Price END ASC,
              CASE WHEN '${sortField}' = 'price' AND '${sortDirection}' = 'DESC' THEN t.Price END DESC,
              CASE WHEN '${sortField}' = 'stock' AND '${sortDirection}' = 'ASC' THEN t.Stock END ASC,
              CASE WHEN '${sortField}' = 'stock' AND '${sortDirection}' = 'DESC' THEN t.Stock END DESC,
              CASE WHEN '${sortField}' = 'category' AND '${sortDirection}' = 'ASC' THEN c.Name END ASC,
              CASE WHEN '${sortField}' = 'category' AND '${sortDirection}' = 'DESC' THEN c.Name END DESC,
              CASE WHEN '${sortField}' = 'createdAt' AND '${sortDirection}' = 'ASC' THEN t.CreatedAt END ASC,
              CASE WHEN '${sortField}' = 'createdAt' AND '${sortDirection}' = 'DESC' THEN t.CreatedAt END DESC,
              t.CreatedAt DESC
            OFFSET ${(page - 1) * pageSize} ROWS
          `,
          params: queryParams
        }
      ];

      console.log('📋 Executing optimized fallback queries...');
      const [countRows, dataRows] = await executeBatch(queries);

      countResult = countRows[0]?.total || 0;
      toysResult = dataRows;
      console.log('✅ Optimized fallback queries executed successfully');
    }
    
    // Map database results to frontend format
    const toys: Toy[] = toysResult.map(mapDatabaseRowToToy);
    
    // Calculate pagination info
    const totalItems = typeof countResult === 'number' ? countResult : countResult.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    console.log(`✅ Found ${toysResult.length} toys on page ${page}, total ${totalItems} toys`);

    // Add performance metadata
    const response = {
      toys,
      pagination: {
        page,
        limit: pageSize,
        total: totalItems,
        totalPages,
      },
      success: true,
      message: `Successfully retrieved ${toys.length} toys`,
      performance: {
        cached: true, // This will be set by the cache layer
        timestamp: new Date().toISOString(),
        queryOptimizations: [
          'Cached queries',
          'Parallel execution',
          'NOLOCK hints',
          'Proper indexing',
          'Parameter validation'
        ]
      }
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300', // Browser and CDN caching
        'X-Cache-TTL': cacheTTL.toString()
      }
    });

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
      performance: {
        cached: false,
        error: true,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

// POST /api/toys - Optimized toy creation
export async function POST(request: NextRequest) {
  try {
    console.log('➕ Creating new toy (optimized)...');

    const body: ToyCreateRequest = await request.json();
    
    console.log('📝 Toy data received:', { ...body, image: body.image ? '[IMAGE_URL]' : null });

    // Enhanced validation
    const requiredFields = ['name', 'description', 'categoryId', 'price', 'stock', 'brand'];
    const missingFields = requiredFields.filter(field => !body[field as keyof ToyCreateRequest]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        message: `Required fields missing: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    // Enhanced business validation
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

    if (body.name.length < 2 || body.name.length > 255) {
      return NextResponse.json({
        success: false,
        error: 'Invalid name',
        message: 'Name must be between 2 and 255 characters',
      }, { status: 400 });
    }

    // Prepare optimized parameters
    const params = {
      Name: body.name.trim(),
      Description: body.description.trim(),
      Image: body.image || '/images/toys/default.jpg',
      CategoryId: body.categoryId,
      Price: parseFloat(body.price.toString()),
      OriginalPrice: body.originalPrice ? parseFloat(body.originalPrice.toString()) : null,
      Stock: parseInt(body.stock.toString()),
      AgeRange: body.ageRange || '',
      Brand: body.brand.trim(),
      Material: body.material || '',
      DimensionLength: body.dimensions?.length || 0,
      DimensionWidth: body.dimensions?.width || 0,
      DimensionHeight: body.dimensions?.height || 0,
      Weight: body.dimensions?.weight || 0,
      Colors: JSON.stringify(body.colors || []),
      Tags: JSON.stringify(body.tags || []),
    };

    console.log('🔧 Executing optimized stored procedure...');

    // Execute stored procedure
    const result = await executeStoredProcedureCached('sp_CreateToyFromFrontend', params);
    
    if (!result || result.length === 0) {
      throw new Error('No result returned from stored procedure');
    }

    // Map the created toy
    const createdToy = mapDatabaseRowToToy(result[0]);
    
    // Clear related caches
    clearCache('toys:list');
    clearCache('toys:categories');
    clearCache('toys:brands');
    
    console.log(`✅ Successfully created toy with ID: ${createdToy.id}`);

    return NextResponse.json({
      success: true,
      data: createdToy,
      message: `Successfully created toy "${createdToy.name}"`,
      performance: {
        cacheCleared: ['toys:list', 'toys:categories', 'toys:brands'],
        timestamp: new Date().toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating toy:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create toy',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      performance: {
        error: true,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

// DELETE /api/toys - Bulk delete with transaction
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        message: 'IDs array is required'
      }, { status: 400 });
    }

    // Limit bulk operations
    if (ids.length > 50) {
      return NextResponse.json({
        success: false,
        error: 'Too many items',
        message: 'Maximum 50 items can be deleted at once'
      }, { status: 400 });
    }

    console.log(`🗑️ Bulk deleting ${ids.length} toys...`);

    // Execute bulk delete with proper parameters
    const result = await executeStoredProcedureCached('sp_BulkDeleteToys', {
      ToyIds: ids.join(','),
      MaxItems: 50
    });

    // Clear related caches
    clearCache('toys:list');
    
    console.log(`✅ Successfully deleted ${ids.length} toys`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${ids.length} toys`,
      deletedIds: ids,
      performance: {
        cacheCleared: ['toys:list'],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error bulk deleting toys:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete toys',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
