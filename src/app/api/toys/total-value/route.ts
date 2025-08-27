import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/database';

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
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;
    const ageRange = searchParams.get('ageRange') || null;
    const inStock = searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : null;

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

    // Prepare parameters for stored procedure
    const params: Record<string, any> = {};
    
    if (search) params.Search = search;
    if (categoryId) params.CategoryId = categoryId;
    if (brandName) params.BrandName = brandName;
    if (status) params.Status = status;
    if (minPrice !== null) params.MinPrice = minPrice;
    if (maxPrice !== null) params.MaxPrice = maxPrice;
    if (ageRange) params.AgeRange = ageRange;
    if (inStock !== null) params.InStock = inStock;

    // Execute stored procedure
    const result = await executeStoredProcedure('sp_GetToysTotalValueForFrontend', params);

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
        totalValue: parseFloat(data.totalValue || 0),
        totalCount: parseInt(data.totalCount || 0),
        averagePrice: parseFloat(data.averagePrice || 0),
        minPrice: parseFloat(data.minPrice || 0),
        maxPrice: parseFloat(data.maxPrice || 0)
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
