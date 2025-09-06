import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Health check endpoint to verify API readiness
export async function GET() {
  try {
    console.log('🏥 API Health check starting...');

    // Simple health check with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), 10000); // 10 second timeout
    });

    const healthCheckPromise = (async () => {
      // Only check basic database connection
      await executeQuery('SELECT 1 as test');

      return {
        success: true,
        status: 'healthy',
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        checks: [
          { service: 'Database Connection', status: 'healthy', message: 'Connected' },
          { service: 'API Server', status: 'healthy', message: 'Running' }
        ]
      };
    })();

    const result = await Promise.race([healthCheckPromise, timeoutPromise]);

    console.log('🏥 API Health check completed: healthy');
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Health check failed:', error);

    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      checks: [
        { service: 'Database Connection', status: 'unhealthy', message: 'Connection failed' },
        { service: 'API Server', status: 'healthy', message: 'Running' }
      ]
    }, { status: 500 });
  }
}
