import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/wallet/salary-stats - Get salary statistics from wallet transactions
export async function GET(request: NextRequest) {
  try {
    console.log('💰 Fetching salary statistics...');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    // Get date range (default to last 6 months)
    const monthsToShow = parseInt(searchParams.get('months') || '6');
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setMonth(startDate.getMonth() - monthsToShow);

    console.log('📅 Date range:', {
      startDate: startDate.toISOString(),
      endDate: currentDate.toISOString(),
      monthsToShow
    });

    // Query to get salary category by specific ID (cat-luong)
    const categoryQuery = `
      SELECT Id, Name, Color
      FROM zen50558_ManagementStore.dbo.WalletCategories
      WHERE Id = 'cat-luong'
        AND IsActive = 1
        AND Type = N'Thu nhập'
    `;

    const categories = await executeQuery(categoryQuery);
    
    if (!categories || categories.length === 0) {
      console.log('⚠️ No salary category found (cat-luong)');
      return NextResponse.json({
        success: true,
        message: 'No salary category found (cat-luong)',
        data: {
          currentMonth: {
            totalSalary: 0,
            transactionCount: 0,
            avgSalary: 0
          },
          lastMonth: {
            totalSalary: 0,
            transactionCount: 0,
            avgSalary: 0
          },
          monthlyTrend: [],
          yearToDate: {
            totalSalary: 0,
            monthsWithSalary: 0,
            avgMonthlySalary: 0
          },
          recentSalaries: []
        }
      });
    }

    const salaryCategory = categories[0];
    console.log('📂 Salary category found (cat-luong):', salaryCategory);

    // Get current month salary statistics
    const currentMonthQuery = `
      SELECT
        COALESCE(SUM(Amount), 0) as totalSalary,
        COUNT(*) as transactionCount,
        COALESCE(AVG(Amount), 0) as avgSalary
      FROM zen50558_ManagementStore.dbo.WalletTransactions
      WHERE CategoryId = @categoryId
        AND IsActive = 1
        AND Status LIKE N'%Hoàn thành%'
        AND YEAR(TransactionDate) = YEAR(GETDATE())
        AND MONTH(TransactionDate) = MONTH(GETDATE())
    `;

    const currentMonthResult = await executeQuery(currentMonthQuery, { 
      categoryId: salaryCategory.Id 
    });

    // Get last month salary statistics for comparison
    const lastMonthQuery = `
      SELECT
        COALESCE(SUM(Amount), 0) as totalSalary,
        COUNT(*) as transactionCount,
        COALESCE(AVG(Amount), 0) as avgSalary
      FROM zen50558_ManagementStore.dbo.WalletTransactions
      WHERE CategoryId = @categoryId
        AND IsActive = 1
        AND Status LIKE N'%Hoàn thành%'
        AND YEAR(TransactionDate) = YEAR(DATEADD(MONTH, -1, GETDATE()))
        AND MONTH(TransactionDate) = MONTH(DATEADD(MONTH, -1, GETDATE()))
    `;

    const lastMonthResult = await executeQuery(lastMonthQuery, { 
      categoryId: salaryCategory.Id 
    });

    // Get monthly trend for last N months
    const monthlyTrendQuery = `
      SELECT 
        FORMAT(TransactionDate, 'yyyy-MM') as month,
        SUM(Amount) as totalSalary,
        COUNT(*) as transactionCount,
        AVG(Amount) as avgSalary
      FROM zen50558_ManagementStore.dbo.WalletTransactions
      WHERE CategoryId = @categoryId
        AND IsActive = 1
        AND Status LIKE N'%Hoàn thành%'
        AND TransactionDate >= @startDate
      GROUP BY FORMAT(TransactionDate, 'yyyy-MM')
      ORDER BY month DESC
    `;

    const monthlyTrend = await executeQuery(monthlyTrendQuery, {
      categoryId: salaryCategory.Id,
      startDate: startDate.toISOString()
    });

    // Get year-to-date statistics
    const ytdQuery = `
      SELECT
        COALESCE(SUM(Amount), 0) as totalSalary,
        COUNT(DISTINCT FORMAT(TransactionDate, 'yyyy-MM')) as monthsWithSalary,
        COALESCE(AVG(Amount), 0) as avgTransactionAmount
      FROM zen50558_ManagementStore.dbo.WalletTransactions
      WHERE CategoryId = @categoryId
        AND IsActive = 1
        AND Status LIKE N'%Hoàn thành%'
        AND YEAR(TransactionDate) = YEAR(GETDATE())
    `;

    const ytdResult = await executeQuery(ytdQuery, {
      categoryId: salaryCategory.Id
    });

    // Log year-to-date results for debugging
    console.log('📊 Year-to-date salary statistics:', {
      totalSalary: ytdResult[0]?.totalSalary || 0,
      monthsWithSalary: ytdResult[0]?.monthsWithSalary || 0,
      year: new Date().getFullYear()
    });

    // Get recent salary transactions
    const recentSalariesQuery = `
      SELECT TOP 5
        Id as id,
        Amount as amount,
        Description as description,
        TransactionDate as transactionDate,
        Status as status
      FROM zen50558_ManagementStore.dbo.WalletTransactions
      WHERE CategoryId = @categoryId
        AND IsActive = 1
      ORDER BY TransactionDate DESC
    `;

    const recentSalaries = await executeQuery(recentSalariesQuery, {
      categoryId: salaryCategory.Id
    });

    // Calculate monthly profit (assuming 15% profit margin as example)
    const profitMargin = 0.15; // This could be configurable

    // Format the response
    const currentMonth = currentMonthResult[0] || {};
    const lastMonth = lastMonthResult[0] || {};
    const ytd = ytdResult[0] || {};

    const currentMonthSalary = parseFloat(currentMonth.totalSalary || 0);
    const lastMonthSalary = parseFloat(lastMonth.totalSalary || 0);
    const salaryChange = currentMonthSalary - lastMonthSalary;
    const salaryChangePercent = lastMonthSalary > 0 
      ? ((salaryChange / lastMonthSalary) * 100).toFixed(2)
      : '0';

    // Calculate yearly summary
    const yearlyTotal = parseFloat(ytd.totalSalary || 0);
    const monthsCount = parseInt(ytd.monthsWithSalary || 0);
    const avgMonthly = monthsCount > 0 ? yearlyTotal / monthsCount : 0;
    
    console.log('✅ Salary statistics fetched successfully');
    console.log(`💰 Tổng lương năm ${new Date().getFullYear()}: ${yearlyTotal.toLocaleString('vi-VN')} VNĐ`);
    console.log(`📅 Số tháng có lương: ${monthsCount} tháng`);
    console.log(`📊 Trung bình mỗi tháng: ${avgMonthly.toLocaleString('vi-VN')} VNĐ`);

    return NextResponse.json({
      success: true,
      message: 'Salary statistics fetched successfully',
      data: {
        category: {
          id: salaryCategory.Id,
          name: salaryCategory.Name,
          color: salaryCategory.Color
        },
        currentMonth: {
          totalSalary: currentMonthSalary,
          transactionCount: parseInt(currentMonth.transactionCount || 0),
          avgSalary: parseFloat(currentMonth.avgSalary || 0),
          estimatedProfit: currentMonthSalary * profitMargin
        },
        lastMonth: {
          totalSalary: lastMonthSalary,
          transactionCount: parseInt(lastMonth.transactionCount || 0),
          avgSalary: parseFloat(lastMonth.avgSalary || 0),
          estimatedProfit: lastMonthSalary * profitMargin
        },
        comparison: {
          salaryChange,
          salaryChangePercent: parseFloat(salaryChangePercent),
          trend: salaryChange > 0 ? 'up' : salaryChange < 0 ? 'down' : 'stable'
        },
        monthlyTrend: monthlyTrend.map(trend => ({
          month: trend.month,
          totalSalary: parseFloat(trend.totalSalary || 0),
          transactionCount: parseInt(trend.transactionCount || 0),
          avgSalary: parseFloat(trend.avgSalary || 0),
          estimatedProfit: parseFloat(trend.totalSalary || 0) * profitMargin
        })),
        yearToDate: {
          totalSalary: parseFloat(ytd.totalSalary || 0),
          monthsWithSalary: parseInt(ytd.monthsWithSalary || 0),
          avgMonthlySalary: ytd.monthsWithSalary > 0 
            ? parseFloat(ytd.totalSalary || 0) / parseInt(ytd.monthsWithSalary || 1)
            : 0,
          totalProfit: parseFloat(ytd.totalSalary || 0) * profitMargin,
          year: new Date().getFullYear(),
          formattedTotal: `${(parseFloat(ytd.totalSalary || 0) / 1000000).toFixed(0)} triệu VNĐ`
        },
        recentSalaries: recentSalaries.map(salary => ({
          id: salary.id,
          amount: parseFloat(salary.amount),
          description: salary.description,
          transactionDate: salary.transactionDate,
          status: salary.status
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching salary statistics:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch salary statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
}
