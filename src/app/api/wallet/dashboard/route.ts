import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/wallet/dashboard - Get comprehensive wallet dashboard statistics with filtering
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching comprehensive wallet dashboard statistics...');

    // Parse query parameters for comprehensive filtering
    const { searchParams } = new URL(request.url);

    // Date range parameters - validate safely to prevent Invalid Date
    const rawDateFrom = searchParams.get('dateFrom');
    const rawDateTo = searchParams.get('dateTo');

    let parsedDateFrom: Date;
    let parsedDateTo: Date;

    if (rawDateFrom && rawDateFrom !== 'undefined' && rawDateFrom !== 'null' && !isNaN(new Date(rawDateFrom).getTime())) {
      parsedDateFrom = new Date(rawDateFrom);
    } else {
      const now = new Date();
      parsedDateFrom = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    if (rawDateTo && rawDateTo !== 'undefined' && rawDateTo !== 'null' && !isNaN(new Date(rawDateTo).getTime())) {
      parsedDateTo = new Date(rawDateTo);
    } else {
      const now = new Date();
      parsedDateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    const dateFrom = parsedDateFrom.toISOString();
    const dateTo = parsedDateTo.toISOString();

    // Additional filter parameters
    const categoryId = searchParams.get('categoryId');
    const transactionType = searchParams.get('type');
    const status = searchParams.get('status');
    const dateRangeType = searchParams.get('dateRangeType') || 'custom'; // custom, week, month, year
    const yearMonth = searchParams.get('yearMonth') || '';
    const year = searchParams.get('year') || '';

    console.log('📅 Filter parameters:', {
      dateFrom,
      dateTo,
      categoryId,
      transactionType,
      status,
      dateRangeType,
      yearMonth,
      year
    });

    // Build dynamic WHERE clause for filtering
    let whereConditions = [`t.IsActive = 1`];
    let queryParams: Record<string, { type: any; value: any }> = {};

    // Date range filtering
    whereConditions.push(`t.TransactionDate >= @dateFrom`);
    queryParams.dateFrom = { type: sql.DateTime, value: parsedDateFrom };
    whereConditions.push(`t.TransactionDate <= @dateTo`);
    queryParams.dateTo = { type: sql.DateTime, value: parsedDateTo };

    // Category filtering (CategoryId is NVARCHAR like 'cat-luong')
    if (categoryId && categoryId.trim() !== '' && categoryId !== 'undefined' && categoryId !== 'null') {
      whereConditions.push(`t.CategoryId = @categoryId`);
      queryParams.categoryId = { type: sql.NVarChar, value: categoryId.trim() };
    }

    // Transaction type filtering
    if (transactionType && transactionType.trim() !== '' && transactionType !== 'undefined' && transactionType !== 'null') {
      whereConditions.push(`t.Type = @transactionType`);
      queryParams.transactionType = { type: sql.NVarChar, value: transactionType.trim() };
    }

    // Status filtering
    if (status && status.trim() !== '' && status !== 'undefined' && status !== 'null') {
      whereConditions.push(`t.Status = @status`);
      queryParams.status = { type: sql.NVarChar, value: status.trim() };
    }

    const whereClause = whereConditions.join(' AND ');

    // Get comprehensive balance statistics with filtering
    const balanceQuery = `
      SELECT
        -- Total Income (only completed transactions) - using LIKE for better Unicode matching
        SUM(CASE WHEN t.Type LIKE N'%Thu nhập%' AND t.Status LIKE N'%Hoàn thành%' THEN t.Amount ELSE 0 END) as totalIncome,

        -- Total Expenses (only completed transactions, includes both Chi tiêu and Chuyển khoản, use ABS for positive display)
        SUM(CASE WHEN (t.Type LIKE N'%Chi tiêu%' OR t.Type LIKE N'%Chuyển khoản%') AND t.Status LIKE N'%Hoàn thành%' THEN ABS(t.Amount) ELSE 0 END) as totalExpense,

        -- Net Balance (Income - (Expenses + Transfers), only completed)
        SUM(CASE WHEN t.Type LIKE N'%Thu nhập%' AND t.Status LIKE N'%Hoàn thành%' THEN t.Amount ELSE 0 END) -
        SUM(CASE WHEN (t.Type LIKE N'%Chi tiêu%' OR t.Type LIKE N'%Chuyển khoản%') AND t.Status LIKE N'%Hoàn thành%' THEN ABS(t.Amount) ELSE 0 END) as netBalance,

        -- Total Transactions (all statuses)
        COUNT(*) as totalTransactions,

        -- Pending transactions - using LIKE for better Unicode matching
        COUNT(CASE WHEN t.Status LIKE N'%ang chờ%' THEN 1 END) as pendingTransactions,

        -- Completed transactions - using LIKE for better Unicode matching
        COUNT(CASE WHEN t.Status LIKE N'%Hoàn thành%' THEN 1 END) as completedTransactions

      FROM ManagementStore.dbo.WalletTransactions t
      LEFT JOIN ManagementStore.dbo.WalletCategories c ON t.CategoryId = c.Id
      WHERE ${whereClause}
    `;

    const balanceResult = await executeQuery(balanceQuery, queryParams);
    const balance = balanceResult[0] || {};

    // Get transactions by type with same filtering
    const typeStatsQuery = `
      SELECT
        t.Type,
        COUNT(*) as count,
        SUM(ABS(t.Amount)) as totalAmount,
        AVG(ABS(t.Amount)) as avgAmount,
        COUNT(CASE WHEN t.Status LIKE N'%Hoàn thành%' THEN 1 END) as completedCount,
        COUNT(CASE WHEN t.Status LIKE N'%ang chờ%' THEN 1 END) as pendingCount,
        SUM(CASE WHEN t.Status LIKE N'%Hoàn thành%' THEN ABS(t.Amount) ELSE 0 END) as completedAmount
      FROM ManagementStore.dbo.WalletTransactions t
      LEFT JOIN ManagementStore.dbo.WalletCategories c ON t.CategoryId = c.Id
      WHERE ${whereClause}
      GROUP BY t.Type
      ORDER BY completedAmount DESC
    `;

    const typeStats = await executeQuery(typeStatsQuery, queryParams);

    // Get top categories with same filtering
    const categoryStatsQuery = `
      SELECT TOP 10
        c.Id as categoryId,
        c.Name as categoryName,
        c.Type as categoryType,
        c.Color as categoryColor,
        COUNT(t.Id) as transactionCount,
        SUM(ABS(t.Amount)) as totalAmount,
        AVG(ABS(t.Amount)) as avgAmount,
        COUNT(CASE WHEN t.Status LIKE N'%Hoàn thành%' THEN 1 END) as completedCount,
        COUNT(CASE WHEN t.Status LIKE N'%ang chờ%' THEN 1 END) as pendingCount,
        SUM(CASE WHEN t.Status LIKE N'%Hoàn thành%' THEN ABS(t.Amount) ELSE 0 END) as completedAmount
      FROM ManagementStore.dbo.WalletTransactions t
      JOIN ManagementStore.dbo.WalletCategories c ON t.CategoryId = c.Id
      WHERE ${whereClause.replace('t.IsActive = 1', 't.IsActive = 1 AND c.IsActive = 1')}
      GROUP BY c.Id, c.Name, c.Type, c.Color
      ORDER BY completedAmount DESC
    `;

    const categoryStats = await executeQuery(categoryStatsQuery, queryParams);

    // Get recent transactions
    const recentTransactionsQuery = `
      SELECT TOP 5
        t.Id as id,
        t.Type as type,
        t.Amount as amount,
        t.Description as description,
        c.Name as categoryName,
        c.Color as categoryColor,
        t.TransactionDate as transactionDate,
        t.Status as status
      FROM ManagementStore.dbo.WalletTransactions t
      LEFT JOIN ManagementStore.dbo.WalletCategories c ON t.CategoryId = c.Id
      WHERE t.IsActive = 1
      ORDER BY t.TransactionDate DESC
    `;

    const recentTransactions = await executeQuery(recentTransactionsQuery);

    // Get monthly trend (last 6 months)
    const monthlyTrendQuery = `
      SELECT 
        FORMAT(TransactionDate, 'yyyy-MM') as month,
        SUM(CASE WHEN Type LIKE N'%Thu nhập%' THEN Amount ELSE 0 END) as income,
        SUM(CASE WHEN Type LIKE N'%Chi tiêu%' OR Type LIKE N'%Chuyển khoản%' THEN ABS(Amount) ELSE 0 END) as expense,
        COUNT(*) as transactionCount
      FROM ManagementStore.dbo.WalletTransactions
      WHERE IsActive = 1
        AND TransactionDate >= DATEADD(MONTH, -6, GETDATE())
      GROUP BY FORMAT(TransactionDate, 'yyyy-MM')
      ORDER BY month DESC
    `;

    const monthlyTrend = await executeQuery(monthlyTrendQuery);

    // Get date range specific statistics
    const dateRangeStatsQuery = `
      SELECT
        -- Weekly stats (last 4 weeks)
        (SELECT COUNT(*) FROM ManagementStore.dbo.WalletTransactions
         WHERE IsActive = 1 AND TransactionDate >= DATEADD(WEEK, -1, GETDATE())) as thisWeekCount,
        (SELECT COUNT(*) FROM ManagementStore.dbo.WalletTransactions
         WHERE IsActive = 1 AND TransactionDate >= DATEADD(WEEK, -2, GETDATE())
         AND TransactionDate < DATEADD(WEEK, -1, GETDATE())) as lastWeekCount,

        -- Monthly stats
        (SELECT COUNT(*) FROM ManagementStore.dbo.WalletTransactions
         WHERE IsActive = 1 AND YEAR(TransactionDate) = YEAR(GETDATE())
         AND MONTH(TransactionDate) = MONTH(GETDATE())) as thisMonthCount,
        (SELECT COUNT(*) FROM ManagementStore.dbo.WalletTransactions
         WHERE IsActive = 1 AND YEAR(TransactionDate) = YEAR(DATEADD(MONTH, -1, GETDATE()))
         AND MONTH(TransactionDate) = MONTH(DATEADD(MONTH, -1, GETDATE()))) as lastMonthCount,

        -- Yearly stats
        (SELECT COUNT(*) FROM ManagementStore.dbo.WalletTransactions
         WHERE IsActive = 1 AND YEAR(TransactionDate) = YEAR(GETDATE())) as thisYearCount,
        (SELECT COUNT(*) FROM ManagementStore.dbo.WalletTransactions
         WHERE IsActive = 1 AND YEAR(TransactionDate) = YEAR(GETDATE()) - 1) as lastYearCount
    `;

    const dateRangeStats = await executeQuery(dateRangeStatsQuery);

    console.log('✅ Comprehensive dashboard statistics fetched successfully');

    // Transform and return comprehensive data
    return NextResponse.json({
      success: true,
      message: 'Comprehensive dashboard statistics fetched successfully',
      data: {
        // Main summary statistics
        summary: {
          totalIncome: parseFloat(balance.totalIncome || 0),
          totalExpense: parseFloat(balance.totalExpense || 0),
          netBalance: parseFloat(balance.netBalance || 0),
          totalTransactions: Number(balance.totalTransactions || 0),
          pendingTransactions: Number(balance.pendingTransactions || 0),
          completedTransactions: Number(balance.completedTransactions || 0)
        },

        // Applied filters
        filters: {
          dateFrom,
          dateTo,
          categoryId,
          transactionType,
          status,
          dateRangeType,
          yearMonth,
          year
        },
        // Transaction type statistics
        typeStats: typeStats.map(stat => ({
          type: stat.Type,
          count: Number(stat.count || 0),
          totalAmount: parseFloat(stat.totalAmount || 0),
          avgAmount: parseFloat(stat.avgAmount || 0),
          completedCount: Number(stat.completedCount || 0),
          pendingCount: Number(stat.pendingCount || 0),
          completedAmount: parseFloat(stat.completedAmount || 0)
        })),

        // Top categories by spending/income
        topCategories: categoryStats.map(cat => ({
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
          categoryType: cat.categoryType,
          categoryColor: cat.categoryColor,
          transactionCount: Number(cat.transactionCount || 0),
          totalAmount: parseFloat(cat.totalAmount || 0),
          avgAmount: parseFloat(cat.avgAmount || 0),
          completedCount: Number(cat.completedCount || 0),
          pendingCount: Number(cat.pendingCount || 0),
          completedAmount: parseFloat(cat.completedAmount || 0)
        })),
        recentTransactions: recentTransactions.map(txn => ({
          id: txn.id,
          type: txn.type,
          amount: parseFloat(txn.amount || 0),
          description: txn.description,
          categoryName: txn.categoryName,
          categoryColor: txn.categoryColor,
          transactionDate: txn.transactionDate,
          status: txn.status
        })),
        // Monthly trend analysis
        monthlyTrend: monthlyTrend.map(trend => ({
          month: trend.month,
          income: parseFloat(trend.income || 0),
          expense: parseFloat(trend.expense || 0),
          transactionCount: Number(trend.transactionCount || 0),
          net: parseFloat(trend.income || 0) - parseFloat(trend.expense || 0)
        })),

        // Date range comparison statistics
        dateRangeComparison: {
          weekly: {
            thisWeek: Number(dateRangeStats[0]?.thisWeekCount || 0),
            lastWeek: Number(dateRangeStats[0]?.lastWeekCount || 0),
            change: Number(dateRangeStats[0]?.thisWeekCount || 0) - Number(dateRangeStats[0]?.lastWeekCount || 0)
          },
          monthly: {
            thisMonth: Number(dateRangeStats[0]?.thisMonthCount || 0),
            lastMonth: Number(dateRangeStats[0]?.lastMonthCount || 0),
            change: Number(dateRangeStats[0]?.thisMonthCount || 0) - Number(dateRangeStats[0]?.lastMonthCount || 0)
          },
          yearly: {
            thisYear: Number(dateRangeStats[0]?.thisYearCount || 0),
            lastYear: Number(dateRangeStats[0]?.lastYearCount || 0),
            change: Number(dateRangeStats[0]?.thisYearCount || 0) - Number(dateRangeStats[0]?.lastYearCount || 0)
          }
        },

        // Current date range
        dateRange: {
          from: dateFrom,
          to: dateTo
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching wallet dashboard statistics:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
}
