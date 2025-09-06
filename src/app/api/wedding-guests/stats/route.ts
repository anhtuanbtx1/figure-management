import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/wedding-guests/stats - Get wedding guests statistics
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('📊 Fetching wedding guests statistics...');

    // Add timeout to prevent deployment issues
    const timeoutPromise = new Promise<NextResponse>((_, reject) => {
      setTimeout(() => reject(new Error('Statistics query timeout')), 15000); // 15 second timeout
    });

    const statsPromise = getWeddingGuestsStats(request);
    const result = await Promise.race([statsPromise, timeoutPromise]);

    return result;

  } catch (error) {
    console.error('❌ Error fetching statistics:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      stats: {
        totalGuests: 0,
        confirmedGuests: 0,
        pendingGuests: 0,
        declinedGuests: 0,
        totalContributions: 0,
        averageContribution: 0
      }
    }, { status: 500 });
  }
}

async function getWeddingGuestsStats(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Get search parameters for filtered stats
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    const queryParams: any = {};
    let whereConditions = ['isActive = 1'];

    // Apply same filters as main query for consistent stats (simplified)
    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(`(
        name LIKE @search OR
        unit LIKE @search OR
        relationship LIKE @search OR
        notes LIKE @search OR
        status LIKE @search OR
        CAST(giftAmount AS NVARCHAR) LIKE @search OR
        CAST(numberOfPeople AS NVARCHAR) LIKE @search
      )`);
      queryParams.search = searchTerm;
    }

    if (status) {
      whereConditions.push('status = @status');
      queryParams.status = status;
    }

    // Split into multiple queries to avoid aggregate function conflicts
    const mainStatsQuery = `
      SELECT
        -- Total counts
        COUNT(*) as totalGuests,
        SUM(numberOfPeople) as totalPeople,
        SUM(giftAmount) as totalContribution,

        -- Status breakdown
        SUM(CASE WHEN status = 'Going' THEN 1 ELSE 0 END) as confirmedGuests,
        SUM(CASE WHEN status = 'Going' THEN numberOfPeople ELSE 0 END) as confirmedPeople,
        SUM(CASE WHEN status = 'Going' THEN giftAmount ELSE 0 END) as confirmedContribution,

        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingGuests,
        SUM(CASE WHEN status = 'Pending' THEN numberOfPeople ELSE 0 END) as pendingPeople,
        SUM(CASE WHEN status = 'Pending' THEN giftAmount ELSE 0 END) as pendingContribution,

        SUM(CASE WHEN status = 'NotGoing' THEN 1 ELSE 0 END) as declinedGuests,
        SUM(CASE WHEN status = 'Maybe' THEN 1 ELSE 0 END) as maybeGuests,

        -- Average gift amount
        AVG(CAST(giftAmount AS FLOAT)) as avgGiftAmount,

        -- Max and min gift amounts
        MAX(giftAmount) as maxGiftAmount,
        MIN(giftAmount) as minGiftAmount

      FROM WeddingGuests
      WHERE ${whereConditions.join(' AND ')}
    `;

    // Separate query for top units
    const topUnitsQuery = `
      SELECT TOP 10
        unit,
        COUNT(*) as count
      FROM WeddingGuests
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY unit
      ORDER BY COUNT(*) DESC
    `;

    console.log('🔍 Executing statistics queries...');
    console.log('Filters:', { search, status });

    // Execute both queries in parallel
    const [mainStatsResult, topUnitsResult] = await Promise.all([
      executeQuery<{
        totalGuests: number;
        totalPeople: number;
        totalContribution: number;
        confirmedGuests: number;
        confirmedPeople: number;
        confirmedContribution: number;
        pendingGuests: number;
        pendingPeople: number;
        pendingContribution: number;
        declinedGuests: number;
        maybeGuests: number;
        avgGiftAmount: number;
        maxGiftAmount: number;
        minGiftAmount: number;
      }>(mainStatsQuery, queryParams),
      executeQuery<{
        unit: string;
        count: number;
      }>(topUnitsQuery, queryParams)
    ]);

    const stats = mainStatsResult[0];

    if (!stats) {
      throw new Error('No statistics data returned');
    }

    // Format top units
    const topUnitsArray = topUnitsResult.map(item => ({
      unit: item.unit || 'Unknown',
      count: item.count || 0
    }));

    // Format response
    const formattedStats = {
      overview: {
        totalGuests: stats.totalGuests || 0,
        totalPeople: stats.totalPeople || 0,
        totalContribution: stats.totalContribution || 0,
        avgGiftAmount: Math.round(stats.avgGiftAmount || 0),
        maxGiftAmount: stats.maxGiftAmount || 0,
        minGiftAmount: stats.minGiftAmount || 0,
      },
      byStatus: {
        confirmed: {
          guests: stats.confirmedGuests || 0,
          people: stats.confirmedPeople || 0,
          contribution: stats.confirmedContribution || 0,
        },
        pending: {
          guests: stats.pendingGuests || 0,
          people: stats.pendingPeople || 0,
          contribution: stats.pendingContribution || 0,
        },
        declined: {
          guests: stats.declinedGuests || 0,
        },
        maybe: {
          guests: stats.maybeGuests || 0,
        },
      },
      topUnits: topUnitsArray,
      filters: {
        search: search || null,
        status: status || null,
      },
    };

    const responseTime = Date.now() - startTime;
    console.log(`✅ Statistics calculated in ${responseTime}ms`);
    console.log('📊 Stats:', {
      total: formattedStats.overview.totalGuests,
      confirmed: formattedStats.byStatus.confirmed.guests,
      totalContribution: formattedStats.overview.totalContribution,
    });

    return NextResponse.json({
      success: true,
      data: formattedStats,
      message: 'Statistics retrieved successfully',
      performanceMs: responseTime,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      performanceMs: Date.now() - startTime,
    }, { status: 500 });
  }
}
