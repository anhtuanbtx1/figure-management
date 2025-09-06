// Performance test script for Wedding Guests API
// Using built-in fetch (Node.js 18+)

const API_BASE_URL = 'http://localhost:3001/api/wedding-guests';

async function testPerformance() {
  console.log('🚀 Starting Wedding Guests API Performance Test...\n');

  const tests = [
    {
      name: 'Get all guests (no pagination)',
      url: API_BASE_URL,
      description: 'Fetch all guests without pagination'
    },
    {
      name: 'Get first page (50 items)',
      url: `${API_BASE_URL}?page=1&pageSize=50`,
      description: 'Fetch first 50 guests with pagination'
    },
    {
      name: 'Get first page (10 items)',
      url: `${API_BASE_URL}?page=1&pageSize=10`,
      description: 'Fetch first 10 guests with pagination'
    },
    {
      name: 'Search by name',
      url: `${API_BASE_URL}?search=Anh&pageSize=50`,
      description: 'Search for guests with "Anh" in name'
    },
    {
      name: 'Search by unit',
      url: `${API_BASE_URL}?search=OTS&pageSize=50`,
      description: 'Search for guests with "OTS" in unit'
    },
    {
      name: 'Search numeric (gift amount)',
      url: `${API_BASE_URL}?search=500000&pageSize=50`,
      description: 'Search for guests with gift amount 500000'
    },
    {
      name: 'Filter by status',
      url: `${API_BASE_URL}?status=Going&pageSize=50`,
      description: 'Filter guests by Going status'
    },
    {
      name: 'Combined search and filter',
      url: `${API_BASE_URL}?search=Java&status=Going&pageSize=50`,
      description: 'Search "Java" with Going status'
    }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`📊 Testing: ${test.name}`);
    console.log(`   ${test.description}`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(test.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const endTime = Date.now();
      const clientTime = endTime - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const result = {
        test: test.name,
        success: data.success,
        clientTime,
        serverTime: data.performanceMs || 'N/A',
        recordCount: data.count || 0,
        totalRecords: data.pagination?.totalCount || data.count || 0,
        hasNextPage: data.pagination?.hasNextPage || false,
      };

      results.push(result);

      console.log(`   ✅ Success: ${clientTime}ms (server: ${result.serverTime}ms)`);
      console.log(`   📊 Records: ${result.recordCount}/${result.totalRecords}`);
      
      if (result.hasNextPage) {
        console.log(`   📄 Has more pages available`);
      }

    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      results.push({
        test: test.name,
        success: false,
        error: error.message,
        clientTime: 0,
        serverTime: 'N/A',
        recordCount: 0,
        totalRecords: 0,
      });
    }

    console.log('');
    
    // Wait 500ms between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('📈 PERFORMANCE SUMMARY:');
  console.log('=' .repeat(80));
  console.log('Test Name'.padEnd(30) + 'Status'.padEnd(10) + 'Client'.padEnd(10) + 'Server'.padEnd(10) + 'Records');
  console.log('-'.repeat(80));

  results.forEach(result => {
    const status = result.success ? '✅ OK' : '❌ FAIL';
    const clientTime = result.clientTime ? `${result.clientTime}ms` : 'N/A';
    const serverTime = result.serverTime !== 'N/A' ? `${result.serverTime}ms` : 'N/A';
    const records = `${result.recordCount}/${result.totalRecords}`;
    
    console.log(
      result.test.substring(0, 29).padEnd(30) +
      status.padEnd(10) +
      clientTime.padEnd(10) +
      serverTime.padEnd(10) +
      records
    );
  });

  console.log('-'.repeat(80));

  // Performance analysis
  const successfulTests = results.filter(r => r.success && r.clientTime > 0);
  if (successfulTests.length > 0) {
    const avgClientTime = successfulTests.reduce((sum, r) => sum + r.clientTime, 0) / successfulTests.length;
    const maxClientTime = Math.max(...successfulTests.map(r => r.clientTime));
    const minClientTime = Math.min(...successfulTests.map(r => r.clientTime));

    console.log(`\n📊 ANALYSIS:`);
    console.log(`   Average response time: ${avgClientTime.toFixed(1)}ms`);
    console.log(`   Fastest response: ${minClientTime}ms`);
    console.log(`   Slowest response: ${maxClientTime}ms`);

    if (maxClientTime > 3000) {
      console.log(`   ⚠️  WARNING: Some queries are taking longer than 3 seconds`);
    } else if (maxClientTime > 1000) {
      console.log(`   ⚠️  NOTICE: Some queries are taking longer than 1 second`);
    } else {
      console.log(`   ✅ All queries are performing well (under 1 second)`);
    }
  }

  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('   1. Queries over 1000ms should be optimized');
  console.log('   2. Use pagination for large datasets');
  console.log('   3. Consider caching for frequently accessed data');
  console.log('   4. Monitor database indexes and query execution plans');
}

// Run the test
testPerformance().catch(console.error);
