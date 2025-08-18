// Direct test for toys API to debug loading issue
// Run with: node test-toys-api-direct.js

const BASE_URL = 'http://localhost:3001/api/toys';

async function testToysAPIDirect() {
  console.log('🧸 Testing Toys API Directly...\n');

  // Test 1: Basic toys endpoint
  console.log('1. Testing basic toys endpoint...');
  try {
    const response = await fetch(`${BASE_URL}`);
    const text = await response.text();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Response length: ${text.length} characters`);
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ JSON parsing: SUCCESS');
        console.log(`Success: ${data.success}`);
        console.log(`Message: ${data.message || 'No message'}`);
        
        if (data.toys) {
          console.log(`Toys array length: ${data.toys.length}`);
          console.log(`Pagination:`, data.pagination);
          
          if (data.toys.length > 0) {
            console.log('First toy sample:', {
              id: data.toys[0].id,
              name: data.toys[0].name,
              price: data.toys[0].price
            });
          }
        } else {
          console.log('❌ No toys property in response');
          console.log('Available properties:', Object.keys(data));
        }
      } catch (parseError) {
        console.log(`❌ JSON parsing failed: ${parseError.message}`);
        console.log('Raw response preview:', text.substring(0, 200) + '...');
      }
    } else {
      console.log(`❌ HTTP error: ${response.status}`);
      console.log('Error response:', text.substring(0, 500));
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }

  // Test 2: With specific parameters
  console.log('\n2. Testing with pagination parameters...');
  try {
    const params = new URLSearchParams({
      page: '1',
      pageSize: '5',
      search: '',
      category: '',
      brand: '',
      status: '',
      sortField: 'createdAt',
      sortDirection: 'desc'
    });
    
    const response = await fetch(`${BASE_URL}?${params}`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Parameterized request: SUCCESS');
      console.log(`Toys returned: ${data.toys?.length || 0}`);
      console.log(`Total toys: ${data.pagination?.total || 'Unknown'}`);
    } else {
      console.log('❌ Parameterized request: FAILED');
      console.log(`Error: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Parameterized request error: ${error.message}`);
  }

  // Test 3: Check database directly via health endpoint
  console.log('\n3. Testing database health...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Health check: ${data.status}`);
      console.log(`Overall: ${data.message}`);
      
      data.checks?.forEach(check => {
        const icon = check.status === 'healthy' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
        console.log(`   ${icon} ${check.service}: ${check.message}`);
      });
      
      // Focus on toys table
      const toysCheck = data.checks?.find(c => c.service === 'Toys Table');
      if (toysCheck) {
        console.log(`\n🧸 Toys table status: ${toysCheck.status}`);
        console.log(`🧸 Toys table message: ${toysCheck.message}`);
      }
    } else {
      console.log('❌ Health check failed');
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
  }

  // Test 4: Test categories and brands (for comparison)
  console.log('\n4. Testing categories and brands (for comparison)...');
  
  try {
    const [categoriesRes, brandsRes] = await Promise.all([
      fetch(`${BASE_URL}/categories`),
      fetch(`${BASE_URL}/brands`)
    ]);
    
    const categoriesData = await categoriesRes.json();
    const brandsData = await brandsRes.json();
    
    console.log(`📂 Categories: ${categoriesRes.ok ? 'SUCCESS' : 'FAILED'} (${categoriesData.count || 0} items)`);
    console.log(`🏷️ Brands: ${brandsRes.ok ? 'SUCCESS' : 'FAILED'} (${brandsData.count || 0} items)`);
    
    if (categoriesRes.ok && brandsRes.ok && !categoriesData.success) {
      console.log('⚠️ Categories/Brands work but toys might have different issue');
    }
    
  } catch (error) {
    console.log(`❌ Categories/Brands test error: ${error.message}`);
  }

  // Test 5: Manual SQL query simulation
  console.log('\n5. Checking for common toys API issues...');
  
  const commonIssues = [
    'Stored procedure sp_GetToysForFrontend might be missing or broken',
    'Toys table might be empty or all toys have IsActive = 0',
    'Foreign key relationships (CategoryId/BrandId) might be invalid',
    'JSON formatting in stored procedure might be causing errors',
    'Pagination parameters might be causing issues',
    'API timeout or memory issues with large datasets'
  ];
  
  console.log('💡 Common issues to check:');
  commonIssues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });

  console.log('\n==============================================');
  console.log('TOYS API DIRECT TEST COMPLETED');
  console.log('==============================================');
  
  console.log('\n🔧 Next debugging steps:');
  console.log('1. Check browser console for detailed error logs');
  console.log('2. Check if toys table has data with IsActive = 1');
  console.log('3. Test stored procedure manually in database');
  console.log('4. Check if CategoryId/BrandId are valid foreign keys');
  console.log('5. Try manual load toys button in debug panel');
}

// Run the test
testToysAPIDirect();
