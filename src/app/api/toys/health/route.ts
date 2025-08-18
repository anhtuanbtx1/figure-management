import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// Health check endpoint to verify API readiness
export async function GET() {
  try {
    console.log('🏥 API Health check starting...');
    
    const healthChecks = [];
    
    // Check database connection
    try {
      await executeQuery('SELECT 1 as test');
      healthChecks.push({ service: 'Database Connection', status: 'healthy', message: 'Connected' });
    } catch (error) {
      healthChecks.push({ 
        service: 'Database Connection', 
        status: 'unhealthy', 
        message: error instanceof Error ? error.message : 'Connection failed' 
      });
    }
    
    // Check categories table
    try {
      const categoriesResult = await executeQuery('SELECT COUNT(*) as count FROM zen50558_ManagementStore.dbo.ToyCategories WHERE IsActive = 1');
      const categoriesCount = categoriesResult[0]?.count || 0;
      healthChecks.push({ 
        service: 'Categories Table', 
        status: categoriesCount > 0 ? 'healthy' : 'warning', 
        message: `${categoriesCount} active categories` 
      });
    } catch (error) {
      healthChecks.push({ 
        service: 'Categories Table', 
        status: 'unhealthy', 
        message: error instanceof Error ? error.message : 'Table access failed' 
      });
    }
    
    // Check brands table
    try {
      const brandsResult = await executeQuery('SELECT COUNT(*) as count FROM zen50558_ManagementStore.dbo.ToyBrands WHERE IsActive = 1');
      const brandsCount = brandsResult[0]?.count || 0;
      healthChecks.push({ 
        service: 'Brands Table', 
        status: brandsCount > 0 ? 'healthy' : 'warning', 
        message: `${brandsCount} active brands` 
      });
    } catch (error) {
      healthChecks.push({ 
        service: 'Brands Table', 
        status: 'unhealthy', 
        message: error instanceof Error ? error.message : 'Table access failed' 
      });
    }
    
    // Check toys table
    try {
      const toysResult = await executeQuery('SELECT COUNT(*) as count FROM zen50558_ManagementStore.dbo.Toys WHERE IsActive = 1');
      const toysCount = toysResult[0]?.count || 0;
      healthChecks.push({ 
        service: 'Toys Table', 
        status: toysCount > 0 ? 'healthy' : 'warning', 
        message: `${toysCount} active toys` 
      });
    } catch (error) {
      healthChecks.push({ 
        service: 'Toys Table', 
        status: 'unhealthy', 
        message: error instanceof Error ? error.message : 'Table access failed' 
      });
    }
    
    // Check stored procedures
    try {
      const proceduresResult = await executeQuery(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.ROUTINES 
        WHERE ROUTINE_TYPE = 'PROCEDURE' 
        AND ROUTINE_NAME IN ('sp_GetCategoriesForFrontend', 'sp_GetBrandsForFrontend', 'sp_GetToysForFrontend')
      `);
      const proceduresCount = proceduresResult[0]?.count || 0;
      healthChecks.push({ 
        service: 'Stored Procedures', 
        status: proceduresCount >= 3 ? 'healthy' : 'warning', 
        message: `${proceduresCount}/3 procedures available` 
      });
    } catch (error) {
      healthChecks.push({ 
        service: 'Stored Procedures', 
        status: 'unhealthy', 
        message: error instanceof Error ? error.message : 'Procedures check failed' 
      });
    }
    
    // Overall health status
    const unhealthyServices = healthChecks.filter(check => check.status === 'unhealthy');
    const warningServices = healthChecks.filter(check => check.status === 'warning');
    
    let overallStatus = 'healthy';
    let overallMessage = 'All services are healthy';
    
    if (unhealthyServices.length > 0) {
      overallStatus = 'unhealthy';
      overallMessage = `${unhealthyServices.length} services are unhealthy`;
    } else if (warningServices.length > 0) {
      overallStatus = 'warning';
      overallMessage = `${warningServices.length} services have warnings`;
    }
    
    console.log(`🏥 API Health check completed: ${overallStatus}`);
    
    return NextResponse.json({
      success: overallStatus !== 'unhealthy',
      status: overallStatus,
      message: overallMessage,
      timestamp: new Date().toISOString(),
      checks: healthChecks,
      summary: {
        healthy: healthChecks.filter(c => c.status === 'healthy').length,
        warning: warningServices.length,
        unhealthy: unhealthyServices.length,
        total: healthChecks.length,
      }
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
