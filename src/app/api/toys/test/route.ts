import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/database';

// GET /api/toys/test - Test database connection and API endpoints
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing toy management API endpoints...');

    const testResults: any[] = [];

    // Test 1: Database connection
    try {
      await executeQuery('SELECT 1 as test');
      testResults.push({
        test: 'Database Connection',
        status: 'PASS',
        message: 'Successfully connected to database',
      });
    } catch (error) {
      testResults.push({
        test: 'Database Connection',
        status: 'FAIL',
        message: `Database connection failed: ${error}`,
      });
    }

    // Test 2: Check if tables exist
    try {
      const tables = await executeQuery(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_NAME IN ('Toys', 'ToyCategories', 'ToyBrands')
        ORDER BY TABLE_NAME
      `);
      
      const expectedTables = ['ToyBrands', 'ToyCategories', 'Toys'];
      const foundTables = tables.map(t => t.TABLE_NAME);
      const missingTables = expectedTables.filter(t => !foundTables.includes(t));
      
      if (missingTables.length === 0) {
        testResults.push({
          test: 'Required Tables',
          status: 'PASS',
          message: `All required tables exist: ${foundTables.join(', ')}`,
        });
      } else {
        testResults.push({
          test: 'Required Tables',
          status: 'FAIL',
          message: `Missing tables: ${missingTables.join(', ')}`,
        });
      }
    } catch (error) {
      testResults.push({
        test: 'Required Tables',
        status: 'FAIL',
        message: `Error checking tables: ${error}`,
      });
    }

    // Test 3: Check if stored procedures exist
    try {
      const procedures = await executeQuery(`
        SELECT ROUTINE_NAME 
        FROM INFORMATION_SCHEMA.ROUTINES 
        WHERE ROUTINE_TYPE = 'PROCEDURE' 
        AND ROUTINE_NAME IN ('sp_GetToys', 'sp_GetToysForFrontend', 'sp_GetToyByIdForFrontend', 'sp_CreateToyFromFrontend')
        ORDER BY ROUTINE_NAME
      `);
      
      const expectedProcedures = ['sp_CreateToyFromFrontend', 'sp_GetToyByIdForFrontend', 'sp_GetToys', 'sp_GetToysForFrontend'];
      const foundProcedures = procedures.map(p => p.ROUTINE_NAME);
      const missingProcedures = expectedProcedures.filter(p => !foundProcedures.includes(p));
      
      if (missingProcedures.length === 0) {
        testResults.push({
          test: 'Stored Procedures',
          status: 'PASS',
          message: `All required procedures exist: ${foundProcedures.join(', ')}`,
        });
      } else {
        testResults.push({
          test: 'Stored Procedures',
          status: 'FAIL',
          message: `Missing procedures: ${missingProcedures.join(', ')}. Please run toy-management-api-mapping.sql`,
        });
      }
    } catch (error) {
      testResults.push({
        test: 'Stored Procedures',
        status: 'FAIL',
        message: `Error checking procedures: ${error}`,
      });
    }

    // Test 4: Test categories query
    try {
      const categories = await executeQuery(`
        SELECT Id, Name, Slug FROM ToyCategories WHERE IsActive = 1
      `);
      
      testResults.push({
        test: 'Categories Query',
        status: 'PASS',
        message: `Found ${categories.length} categories`,
        data: categories.slice(0, 3), // Show first 3 categories
      });
    } catch (error) {
      testResults.push({
        test: 'Categories Query',
        status: 'FAIL',
        message: `Error fetching categories: ${error}`,
      });
    }

    // Test 5: Test brands query
    try {
      const brands = await executeQuery(`
        SELECT Id, Name FROM ToyBrands WHERE IsActive = 1
      `);
      
      testResults.push({
        test: 'Brands Query',
        status: 'PASS',
        message: `Found ${brands.length} brands`,
        data: brands.slice(0, 3), // Show first 3 brands
      });
    } catch (error) {
      testResults.push({
        test: 'Brands Query',
        status: 'FAIL',
        message: `Error fetching brands: ${error}`,
      });
    }

    // Test 6: Test toys query
    try {
      const toys = await executeQuery(`
        SELECT Id, Name, Price, Stock FROM Toys WHERE IsActive = 1
      `);
      
      testResults.push({
        test: 'Toys Query',
        status: 'PASS',
        message: `Found ${toys.length} toys`,
        data: toys.slice(0, 3), // Show first 3 toys
      });
    } catch (error) {
      testResults.push({
        test: 'Toys Query',
        status: 'FAIL',
        message: `Error fetching toys: ${error}`,
      });
    }

    // Test 7: Test stored procedure sp_GetToysForFrontend
    try {
      const result = await executeStoredProcedure('sp_GetToysForFrontend', {
        Page: 1,
        PageSize: 5,
        SortField: 'CreatedAt',
        SortDirection: 'DESC',
      });
      
      testResults.push({
        test: 'sp_GetToysForFrontend',
        status: 'PASS',
        message: `Procedure executed successfully, returned ${result.length} toys`,
        data: result.slice(0, 2), // Show first 2 results
      });
    } catch (error) {
      testResults.push({
        test: 'sp_GetToysForFrontend',
        status: 'FAIL',
        message: `Error executing procedure: ${error}`,
      });
    }

    // Test 8: Test JSON parsing for colors and tags
    try {
      const toysWithJson = await executeQuery(`
        SELECT TOP 1 Id, Name, Colors, Tags FROM Toys WHERE IsActive = 1 AND Colors IS NOT NULL
      `);
      
      if (toysWithJson.length > 0) {
        const toy = toysWithJson[0];
        const colors = JSON.parse(toy.Colors || '[]');
        const tags = JSON.parse(toy.Tags || '[]');
        
        testResults.push({
          test: 'JSON Fields Parsing',
          status: 'PASS',
          message: `Successfully parsed JSON fields`,
          data: {
            toyId: toy.Id,
            toyName: toy.Name,
            colors: colors,
            tags: tags,
          },
        });
      } else {
        testResults.push({
          test: 'JSON Fields Parsing',
          status: 'SKIP',
          message: 'No toys with JSON data found',
        });
      }
    } catch (error) {
      testResults.push({
        test: 'JSON Fields Parsing',
        status: 'FAIL',
        message: `Error parsing JSON fields: ${error}`,
      });
    }

    // Calculate overall status
    const failedTests = testResults.filter(t => t.status === 'FAIL');
    const passedTests = testResults.filter(t => t.status === 'PASS');
    const skippedTests = testResults.filter(t => t.status === 'SKIP');

    const overallStatus = failedTests.length === 0 ? 'PASS' : 'FAIL';

    console.log(`✅ API test completed: ${passedTests.length} passed, ${failedTests.length} failed, ${skippedTests.length} skipped`);

    return NextResponse.json({
      success: overallStatus === 'PASS',
      overallStatus,
      summary: {
        total: testResults.length,
        passed: passedTests.length,
        failed: failedTests.length,
        skipped: skippedTests.length,
      },
      testResults,
      message: overallStatus === 'PASS' 
        ? 'All tests passed! API is ready to use.' 
        : 'Some tests failed. Please check the results and fix any issues.',
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error running API tests:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to run API tests',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
