// Quick test script for API endpoints
// Run with: node test-api-quick.js

const BASE_URL = 'http://localhost:3000/api/toys';

async function quickTest() {
  console.log('🚀 Quick API Test...\n');

  try {
    // Check if server is running
    try {
      const healthCheck = await fetch('http://localhost:3000');
      if (!healthCheck.ok) {
        throw new Error('Server not responding');
      }
      console.log('✅ Next.js server is running');
    } catch (error) {
      console.error('❌ Next.js server is not running!');
      console.error('🔍 Please start the server with: npm run dev');
      return;
    }

    // Test categories endpoint
    console.log('\n1. Testing /api/toys/categories...');
    try {
      const response = await fetch(`${BASE_URL}/categories`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ Categories: SUCCESS (${data.count} categories)`);
        if (data.data && data.data.length > 0) {
          console.log(`   Sample: ${data.data[0].name} (${data.data[0].id})`);
        }
      } else {
        console.log(`❌ Categories: FAILED`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.message || data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Categories: ERROR - ${error.message}`);
    }

    // Test brands endpoint
    console.log('\n2. Testing /api/toys/brands...');
    try {
      const response = await fetch(`${BASE_URL}/brands`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ Brands: SUCCESS (${data.count} brands)`);
        if (data.data && data.data.length > 0) {
          console.log(`   Sample: ${data.data.slice(0, 3).join(', ')}`);
        }
      } else {
        console.log(`❌ Brands: FAILED`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.message || data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Brands: ERROR - ${error.message}`);
    }

    // Test toys endpoint
    console.log('\n3. Testing /api/toys...');
    try {
      const response = await fetch(`${BASE_URL}?page=1&pageSize=3`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ Toys: SUCCESS (${data.pagination.total} total toys)`);
        if (data.toys && data.toys.length > 0) {
          console.log(`   Sample: ${data.toys[0].name} - ${data.toys[0].price.toLocaleString('vi-VN')}đ`);
        }
      } else {
        console.log(`❌ Toys: FAILED`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.message || data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Toys: ERROR - ${error.message}`);
    }

    // Test API health check
    console.log('\n4. Testing /api/toys/test...');
    try {
      const response = await fetch(`${BASE_URL}/test`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ API Test: ${data.success ? 'SUCCESS' : 'PARTIAL'}`);
        if (data.summary) {
          console.log(`   Summary: ${data.summary.passed} passed, ${data.summary.failed} failed`);
        }
        
        if (data.testResults) {
          const failedTests = data.testResults.filter(t => t.status === 'FAIL');
          if (failedTests.length > 0) {
            console.log('   Failed tests:');
            failedTests.forEach(test => {
              console.log(`     ❌ ${test.test}: ${test.message}`);
            });
          }
        }
      } else {
        console.log(`❌ API Test: FAILED`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.message || data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ API Test: ERROR - ${error.message}`);
    }

    console.log('\n==============================================');
    console.log('QUICK TEST COMPLETED');
    console.log('==============================================');
    
    console.log('\n💡 If any tests failed:');
    console.log('1. Make sure database is accessible');
    console.log('2. Execute missing stored procedures:');
    console.log('   sqlcmd -S 112.78.2.70 -d zen50558_ManagementStore -U zen50558_ManagementStore -P "Passwordla@123" -i database/create-missing-procedures.sql');
    console.log('3. Check server logs for detailed errors');
    console.log('4. Verify table data exists');

  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
  }
}

// Run the test
quickTest();
