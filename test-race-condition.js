// Test script for race condition fixes
// Run with: node test-race-condition.js

const BASE_URL = 'http://localhost:3001/api/toys';

async function testRaceCondition() {
  console.log('🏁 Testing Race Condition Fixes...\n');

  // Test 1: Health check
  console.log('1. 🏥 Testing API health check...');
  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthData.success) {
      console.log('✅ Health check: PASSED');
      console.log(`📊 Summary: ${healthData.summary.healthy} healthy, ${healthData.summary.warning} warnings, ${healthData.summary.unhealthy} unhealthy`);
      
      healthData.checks.forEach(check => {
        const icon = check.status === 'healthy' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
        console.log(`   ${icon} ${check.service}: ${check.message}`);
      });
    } else {
      console.log('❌ Health check: FAILED');
      console.log(`Error: ${healthData.message}`);
    }
  } catch (error) {
    console.log(`❌ Health check: ERROR - ${error.message}`);
  }

  // Test 2: Rapid concurrent requests (simulate race condition)
  console.log('\n2. 🏁 Testing concurrent API requests...');
  
  const startTime = Date.now();
  const promises = [];
  
  // Make 5 concurrent requests to each endpoint
  for (let i = 0; i < 5; i++) {
    promises.push(
      fetch(`${BASE_URL}/categories`).then(r => ({ endpoint: 'categories', status: r.status, ok: r.ok })),
      fetch(`${BASE_URL}/brands`).then(r => ({ endpoint: 'brands', status: r.status, ok: r.ok })),
      fetch(`${BASE_URL}?page=1&pageSize=5`).then(r => ({ endpoint: 'toys', status: r.status, ok: r.ok }))
    );
  }
  
  try {
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`⏱️ All requests completed in ${endTime - startTime}ms`);
    
    // Analyze results
    const categoriesResults = results.filter(r => r.endpoint === 'categories');
    const brandsResults = results.filter(r => r.endpoint === 'brands');
    const toysResults = results.filter(r => r.endpoint === 'toys');
    
    const categoriesSuccess = categoriesResults.filter(r => r.ok).length;
    const brandsSuccess = brandsResults.filter(r => r.ok).length;
    const toysSuccess = toysResults.filter(r => r.ok).length;
    
    console.log(`📂 Categories: ${categoriesSuccess}/5 successful`);
    console.log(`🏷️ Brands: ${brandsSuccess}/5 successful`);
    console.log(`🧸 Toys: ${toysSuccess}/5 successful`);
    
    if (categoriesSuccess === 5 && brandsSuccess === 5 && toysSuccess === 5) {
      console.log('✅ Race condition test: PASSED - All concurrent requests successful');
    } else {
      console.log('⚠️ Race condition test: PARTIAL - Some requests failed');
      
      // Show failed requests
      results.forEach((result, index) => {
        if (!result.ok) {
          console.log(`   ❌ Request ${index + 1} (${result.endpoint}): HTTP ${result.status}`);
        }
      });
    }
    
  } catch (error) {
    console.log(`❌ Concurrent requests test: ERROR - ${error.message}`);
  }

  // Test 3: Sequential requests with timing
  console.log('\n3. ⏱️ Testing sequential requests with timing...');
  
  const endpoints = [
    { name: 'Health', url: `${BASE_URL}/health` },
    { name: 'Categories', url: `${BASE_URL}/categories` },
    { name: 'Brands', url: `${BASE_URL}/brands` },
    { name: 'Toys', url: `${BASE_URL}?page=1&pageSize=3` },
  ];
  
  for (const endpoint of endpoints) {
    const start = Date.now();
    try {
      const response = await fetch(endpoint.url);
      const end = Date.now();
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ ${endpoint.name}: SUCCESS (${end - start}ms)`);
        
        if (endpoint.name === 'Categories' && data.count) {
          console.log(`   📂 ${data.count} categories loaded`);
        } else if (endpoint.name === 'Brands' && data.count) {
          console.log(`   🏷️ ${data.count} brands loaded`);
        } else if (endpoint.name === 'Toys' && data.pagination) {
          console.log(`   🧸 ${data.toys.length}/${data.pagination.total} toys loaded`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: FAILED (${end - start}ms) - ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      const end = Date.now();
      console.log(`❌ ${endpoint.name}: ERROR (${end - start}ms) - ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Test 4: Simulate page refresh scenario
  console.log('\n4. 🔄 Testing page refresh scenario...');
  
  try {
    // Simulate rapid requests like on page load
    const refreshStart = Date.now();
    const [categoriesRes, brandsRes, toysRes] = await Promise.all([
      fetch(`${BASE_URL}/categories`),
      fetch(`${BASE_URL}/brands`),
      fetch(`${BASE_URL}?page=1&pageSize=5`)
    ]);
    const refreshEnd = Date.now();
    
    const categoriesOk = categoriesRes.ok;
    const brandsOk = brandsRes.ok;
    const toysOk = toysRes.ok;
    
    console.log(`⏱️ Parallel requests completed in ${refreshEnd - refreshStart}ms`);
    console.log(`📂 Categories: ${categoriesOk ? 'SUCCESS' : 'FAILED'} (${categoriesRes.status})`);
    console.log(`🏷️ Brands: ${brandsOk ? 'SUCCESS' : 'FAILED'} (${brandsRes.status})`);
    console.log(`🧸 Toys: ${toysOk ? 'SUCCESS' : 'FAILED'} (${toysRes.status})`);
    
    if (categoriesOk && brandsOk && toysOk) {
      console.log('✅ Page refresh simulation: PASSED - No race condition detected');
    } else {
      console.log('❌ Page refresh simulation: FAILED - Race condition may exist');
    }
    
  } catch (error) {
    console.log(`❌ Page refresh simulation: ERROR - ${error.message}`);
  }

  console.log('\n==============================================');
  console.log('RACE CONDITION TEST COMPLETED');
  console.log('==============================================');
  
  console.log('\n💡 Race condition fixes implemented:');
  console.log('✅ Retry logic with exponential backoff');
  console.log('✅ Health check endpoint for API readiness');
  console.log('✅ Loading states and dependency management');
  console.log('✅ Fallback mechanisms for failed loads');
  console.log('✅ Enhanced error handling and logging');
  console.log('✅ LoadingFallback component for better UX');
  
  console.log('\n🎯 Expected behavior:');
  console.log('- First page load should work reliably');
  console.log('- No more "❌ Lỗi khi tải danh mục và thương hiệu" on initial load');
  console.log('- Automatic retries for failed requests');
  console.log('- Better loading indicators');
  console.log('- Manual retry option if all attempts fail');
}

// Run the test
testRaceCondition();
