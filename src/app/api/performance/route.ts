import { NextRequest, NextResponse } from 'next/server';
import { 
  getHealthStatus, 
  getPerformanceReport, 
  getPerformanceStats,
  performanceMonitor 
} from '@/lib/performance-monitor';
import { getCacheStats, checkDatabaseHealth } from '@/lib/database-optimized';

// GET /api/performance - Get performance metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'health';
    const timeWindow = searchParams.get('timeWindow') ? parseInt(searchParams.get('timeWindow')!) : undefined;

    switch (action) {
      case 'health':
        const healthStatus = await getHealthStatus();
        const dbHealth = await checkDatabaseHealth();
        const cacheStats = getCacheStats();
        
        return NextResponse.json({
          success: true,
          data: {
            database: healthStatus,
            databaseConnection: dbHealth,
            cache: cacheStats,
            timestamp: new Date().toISOString()
          }
        });

      case 'stats':
        const stats = getPerformanceStats(timeWindow);
        return NextResponse.json({
          success: true,
          data: {
            ...stats,
            timeWindow: timeWindow || 'all_time',
            timestamp: new Date().toISOString()
          }
        });

      case 'report':
        const report = await getPerformanceReport();
        return NextResponse.json({
          success: true,
          data: report
        });

      case 'slow-operations':
        const slowOps = performanceMonitor.getSlowOperations(
          parseInt(searchParams.get('threshold') || '1000'),
          parseInt(searchParams.get('limit') || '10')
        );
        return NextResponse.json({
          success: true,
          data: slowOps
        });

      case 'recent-errors':
        const errors = performanceMonitor.getRecentErrors(
          parseInt(searchParams.get('limit') || '10')
        );
        return NextResponse.json({
          success: true,
          data: errors
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          message: 'Valid actions: health, stats, report, slow-operations, recent-errors'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error getting performance metrics:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get performance metrics',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// POST /api/performance - Clear metrics or perform maintenance
export async function POST(request: NextRequest) {
  try {
    const { action, olderThan } = await request.json();

    switch (action) {
      case 'clear-metrics':
        performanceMonitor.clearMetrics(olderThan);
        return NextResponse.json({
          success: true,
          message: `Metrics cleared${olderThan ? ` (older than ${olderThan}ms)` : ''}`
        });

      case 'clear-cache':
        const { clearCache } = await import('@/lib/database-optimized');
        clearCache();
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          message: 'Valid actions: clear-metrics, clear-cache'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error performing performance action:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform action',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}