import { NextRequest, NextResponse } from 'next/server';
import {
  executeQueryCached,
  executeStoredProcedureCached,
} from '@/lib/database-optimized';

export const dynamic = 'force-dynamic';

type ToysTotalValueRow = {
  totalValue?: number | string | null;
  totalCount?: number | string | null;
  averagePrice?: number | string | null;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  TotalValue?: number | string | null;
  TotalCount?: number | string | null;
  AveragePrice?: number | string | null;
  MinPrice?: number | string | null;
  MaxPrice?: number | string | null;
};

const toNumber = (value: unknown) => Number(value || 0);

const parseOptionalNumber = (value: string | null) => {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildCacheKey = (params: Record<string, any>) =>
  `toys:total-value:${Buffer.from(JSON.stringify(params)).toString('base64')}`;

async function getToysTotalValue(params: Record<string, any>) {
  const cacheKey = buildCacheKey(params);

  try {
    return await executeStoredProcedureCached<ToysTotalValueRow>(
      'sp_GetToysTotalValueForFrontend',
      params,
      `${cacheKey}:sp`,
      300
    );
  } catch (procedureError) {
    console.warn(
      'Stored procedure sp_GetToysTotalValueForFrontend failed, using direct query fallback:',
      procedureError
    );

    const query = `
      SELECT
        ISNULL(SUM(t.Price), 0) AS totalValue,
        COUNT(*) AS totalCount,
        ISNULL(AVG(CAST(t.Price AS DECIMAL(18, 2))), 0) AS averagePrice,
        ISNULL(MIN(t.Price), 0) AS minPrice,
        ISNULL(MAX(t.Price), 0) AS maxPrice
      FROM ManagementStore.dbo.Toys t WITH (NOLOCK)
      LEFT JOIN ManagementStore.dbo.ToyBrands b WITH (NOLOCK) ON t.BrandId = b.Id
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

    return executeQueryCached<ToysTotalValueRow>(
      query,
      params,
      `${cacheKey}:fallback`,
      300
    );
  }
}

// GET /api/toys/total-value - Return total value (SUM of Price) of toys
// Optional query params:
//   - search: search in name and description
//   - categoryId: filter by category ID
//   - brandName: filter by brand name
//   - status: filter by status value (e.g., 'active', 'inactive', 'out_of_stock', 'discontinued')
//   - minPrice: minimum price filter
//   - maxPrice: maximum price filter
//   - ageRange: filter by age range
//   - inStock: filter by stock availability (true/false)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const search = searchParams.get('search') || null;
    const categoryId = searchParams.get('categoryId') || null;
    const brandName = searchParams.get('brandName') || null;
    const status = searchParams.get('status') || null;
    const minPriceRaw = searchParams.get('minPrice');
    const maxPriceRaw = searchParams.get('maxPrice');
    const minPrice = parseOptionalNumber(minPriceRaw);
    const maxPrice = parseOptionalNumber(maxPriceRaw);
    const ageRange = searchParams.get('ageRange') || null;
    const inStock = searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : null;

    if ((minPriceRaw && minPrice === null) || (maxPriceRaw && maxPrice === null)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid price filter',
        message: 'minPrice and maxPrice must be valid numbers',
        data: {
          totalValue: 0,
          totalCount: 0,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0
        }
      }, { status: 400 });
    }

    console.log('🔍 Fetching toys total value with filters:', {
      search,
      categoryId,
      brandName,
      status,
      minPrice,
      maxPrice,
      ageRange,
      inStock
    });

    const params: Record<string, any> = {
      Search: search,
      CategoryId: categoryId,
      BrandName: brandName,
      Status: status,
      MinPrice: minPrice,
      MaxPrice: maxPrice,
      AgeRange: ageRange,
      InStock: inStock,
    };

    const result = await getToysTotalValue(params);

    if (!result || result.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No toys found matching the criteria',
        data: {
          totalValue: 0,
          totalCount: 0,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0
        },
        filters: {
          search,
          categoryId,
          brandName,
          status,
          minPrice,
          maxPrice,
          ageRange,
          inStock
        }
      }, { status: 200 });
    }

    const data = result[0];
    
    // Format the response
    const response = {
      success: true,
      message: 'Toys total value fetched successfully',
      data: {
        totalValue: toNumber(data.totalValue ?? data.TotalValue),
        totalCount: toNumber(data.totalCount ?? data.TotalCount),
        averagePrice: toNumber(data.averagePrice ?? data.AveragePrice),
        minPrice: toNumber(data.minPrice ?? data.MinPrice),
        maxPrice: toNumber(data.maxPrice ?? data.MaxPrice)
      },
      filters: {
        search,
        categoryId,
        brandName,
        status,
        minPrice,
        maxPrice,
        ageRange,
        inStock
      }
    };

    console.log('✅ Toys total value fetched successfully:', {
      totalValue: response.data.totalValue,
      totalCount: response.data.totalCount,
      averagePrice: response.data.averagePrice
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Failed to get toys total value:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get toys total value',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      data: {
        totalValue: 0,
        totalCount: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0
      }
    }, { status: 500 });
  }
}

// POST method not supported for this endpoint
export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'POST method is not supported for this endpoint. Use GET instead.'
  }, { status: 405 });
}

// PUT method not supported for this endpoint
export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'PUT method is not supported for this endpoint. Use GET instead.'
  }, { status: 405 });
}

// DELETE method not supported for this endpoint
export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'DELETE method is not supported for this endpoint. Use GET instead.'
  }, { status: 405 });
}
