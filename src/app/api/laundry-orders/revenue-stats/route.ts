import { NextResponse, NextRequest } from 'next/server';
import { executeQuery } from '@/lib/database-optimized';
import sql from 'mssql';

// GET /api/laundry-orders/revenue-stats - Get revenue statistics by date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

    console.log('📊 Fetching revenue statistics:', { dateFrom, dateTo, groupBy });

    let query = '';
    const params: any = {};

    if (groupBy === 'day') {
      query = `
        SELECT 
          CAST(ReceivedDate AS DATE) as Date,
          COUNT(*) as TotalOrders,
          COUNT(CASE WHEN Status = 'Completed' THEN 1 END) as CompletedOrders,
          COUNT(CASE WHEN Status = 'Pending' THEN 1 END) as PendingOrders,
          COUNT(CASE WHEN Status = 'Processing' THEN 1 END) as ProcessingOrders,
          COUNT(CASE WHEN Status = 'Cancelled' THEN 1 END) as CancelledOrders,
          SUM(TotalCost) as TotalRevenue,
          SUM(CASE WHEN Status = 'Completed' THEN TotalCost ELSE 0 END) as CompletedRevenue,
          AVG(TotalCost) as AverageOrderValue
        FROM LaundryOrders
        WHERE IsActive = 1
          ${dateFrom ? 'AND CAST(ReceivedDate AS DATE) >= @dateFrom' : ''}
          ${dateTo ? 'AND CAST(ReceivedDate AS DATE) <= @dateTo' : ''}
        GROUP BY CAST(ReceivedDate AS DATE)
        ORDER BY CAST(ReceivedDate AS DATE) DESC
      `;
    } else if (groupBy === 'week') {
      query = `
        SELECT 
          DATEPART(YEAR, ReceivedDate) as Year,
          DATEPART(WEEK, ReceivedDate) as Week,
          MIN(CAST(ReceivedDate AS DATE)) as WeekStart,
          MAX(CAST(ReceivedDate AS DATE)) as WeekEnd,
          COUNT(*) as TotalOrders,
          COUNT(CASE WHEN Status = 'Completed' THEN 1 END) as CompletedOrders,
          COUNT(CASE WHEN Status = 'Pending' THEN 1 END) as PendingOrders,
          COUNT(CASE WHEN Status = 'Processing' THEN 1 END) as ProcessingOrders,
          COUNT(CASE WHEN Status = 'Cancelled' THEN 1 END) as CancelledOrders,
          SUM(TotalCost) as TotalRevenue,
          SUM(CASE WHEN Status = 'Completed' THEN TotalCost ELSE 0 END) as CompletedRevenue,
          AVG(TotalCost) as AverageOrderValue
        FROM LaundryOrders
        WHERE IsActive = 1
          ${dateFrom ? 'AND CAST(ReceivedDate AS DATE) >= @dateFrom' : ''}
          ${dateTo ? 'AND CAST(ReceivedDate AS DATE) <= @dateTo' : ''}
        GROUP BY DATEPART(YEAR, ReceivedDate), DATEPART(WEEK, ReceivedDate)
        ORDER BY DATEPART(YEAR, ReceivedDate) DESC, DATEPART(WEEK, ReceivedDate) DESC
      `;
    } else if (groupBy === 'month') {
      query = `
        SELECT 
          DATEPART(YEAR, ReceivedDate) as Year,
          DATEPART(MONTH, ReceivedDate) as Month,
          DATEFROMPARTS(DATEPART(YEAR, ReceivedDate), DATEPART(MONTH, ReceivedDate), 1) as MonthStart,
          COUNT(*) as TotalOrders,
          COUNT(CASE WHEN Status = 'Completed' THEN 1 END) as CompletedOrders,
          COUNT(CASE WHEN Status = 'Pending' THEN 1 END) as PendingOrders,
          COUNT(CASE WHEN Status = 'Processing' THEN 1 END) as ProcessingOrders,
          COUNT(CASE WHEN Status = 'Cancelled' THEN 1 END) as CancelledOrders,
          SUM(TotalCost) as TotalRevenue,
          SUM(CASE WHEN Status = 'Completed' THEN TotalCost ELSE 0 END) as CompletedRevenue,
          AVG(TotalCost) as AverageOrderValue
        FROM LaundryOrders
        WHERE IsActive = 1
          ${dateFrom ? 'AND CAST(ReceivedDate AS DATE) >= @dateFrom' : ''}
          ${dateTo ? 'AND CAST(ReceivedDate AS DATE) <= @dateTo' : ''}
        GROUP BY DATEPART(YEAR, ReceivedDate), DATEPART(MONTH, ReceivedDate)
        ORDER BY DATEPART(YEAR, ReceivedDate) DESC, DATEPART(MONTH, ReceivedDate) DESC
      `;
    }

    if (dateFrom) {
      // Use NVarChar instead of Date to avoid validation issues
      params.dateFrom = { type: sql.NVarChar, value: dateFrom };
    }
    if (dateTo) {
      // Use NVarChar instead of Date to avoid validation issues
      params.dateTo = { type: sql.NVarChar, value: dateTo };
    }

    console.log('📝 Executing query with params:', params);
    console.log('📝 Query:', query);
    
    const result = await executeQuery(query, params);

    console.log(`✅ Found ${result.length} revenue records`);
    
    // Handle empty result
    if (!result || result.length === 0) {
      console.log('ℹ️ No data found for the given date range');
    }

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching revenue statistics:', error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch revenue statistics',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined,
    }, { status: 500 });
  }
}
