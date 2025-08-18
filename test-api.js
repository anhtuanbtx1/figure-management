// Enhanced Test script for Toy Management API endpoints
// Run with: node test-api.js

const BASE_URL = 'http://localhost:3000/api/toys';

async function testAPI() {
  console.log('🧪 Testing Toy Management API endpoints...\n');

  // Check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3000');
    if (!healthCheck.ok) {
      throw new Error('Server not responding');
    }
    console.log('✅ Next.js server is running\n');
  } catch (error) {
    console.error('❌ Next.js server is not running!');
    console.error('🔍 Please start the server with: npm run dev');
    console.error('🔍 Then run this test again\n');
    return;
  }

  try {
    // Test 1: Test endpoint
    console.log('1. Testing API health check...');
    const testResponse = await fetch(`${BASE_URL}/test`);
    const testData = await testResponse.json();
    console.log('✅ Test endpoint:', testData.success ? 'PASS' : 'FAIL');
    if (!testData.success) {
      console.log('❌ Test failed:', testData.message);
      console.log('📋 Test results:', testData.testResults);
    }
    console.log('');

    // Test 2: Get categories
    console.log('2. Testing categories endpoint...');
    const categoriesResponse = await fetch(`${BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories:', categoriesData.success ? 'PASS' : 'FAIL');
    if (categoriesData.success) {
      console.log(`📂 Found ${categoriesData.count} categories`);
      console.log('📋 Sample categories:', categoriesData.data.slice(0, 3).map(c => c.name));
    } else {
      console.log('❌ Categories failed:', categoriesData.message);
    }
    console.log('');

    // Test 3: Get brands
    console.log('3. Testing brands endpoint...');
    const brandsResponse = await fetch(`${BASE_URL}/brands`);
    const brandsData = await brandsResponse.json();
    console.log('✅ Brands:', brandsData.success ? 'PASS' : 'FAIL');
    if (brandsData.success) {
      console.log(`🏷️ Found ${brandsData.count} brands`);
      console.log('📋 Sample brands:', brandsData.data.slice(0, 5));
    } else {
      console.log('❌ Brands failed:', brandsData.message);
    }
    console.log('');

    // Test 4: Get toys (basic)
    console.log('4. Testing toys endpoint (basic)...');
    const toysResponse = await fetch(`${BASE_URL}?page=1&pageSize=5`);
    const toysData = await toysResponse.json();
    console.log('✅ Toys:', toysData.success ? 'PASS' : 'FAIL');
    if (toysData.success) {
      console.log(`🧸 Found ${toysData.pagination.total} total toys`);
      console.log(`📄 Page ${toysData.pagination.page} of ${toysData.pagination.totalPages}`);
      console.log('📋 Sample toys:', toysData.toys.slice(0, 3).map(t => t.name));
    } else {
      console.log('❌ Toys failed:', toysData.message);
    }
    console.log('');

    // Test 5: Get toys with filters
    console.log('5. Testing toys endpoint with filters...');
    const filteredToysResponse = await fetch(`${BASE_URL}?search=lego&page=1&pageSize=10&sortField=price&sortDirection=asc`);
    const filteredToysData = await filteredToysResponse.json();
    console.log('✅ Filtered toys:', filteredToysData.success ? 'PASS' : 'FAIL');
    if (filteredToysData.success) {
      console.log(`🔍 Found ${filteredToysData.toys.length} toys matching 'lego'`);
      if (filteredToysData.toys.length > 0) {
        console.log('📋 Filtered toys:', filteredToysData.toys.map(t => `${t.name} - ${t.price.toLocaleString('vi-VN')}đ`));
      }
    } else {
      console.log('❌ Filtered toys failed:', filteredToysData.message);
    }
    console.log('');

    // Test 6: Create new toy (if we have categories)
    if (categoriesData.success && categoriesData.data.length > 0) {
      console.log('6. Testing create toy endpoint...');
      const newToyData = {
        name: 'Test Toy API',
        description: 'Đồ chơi test từ API',
        image: '/images/toys/test-toy.jpg',
        categoryId: categoriesData.data[0].id,
        price: 999000,
        originalPrice: 1199000,
        stock: 50,
        ageRange: '3-8 tuổi',
        brand: 'Test Brand',
        material: 'Nhựa ABS',
        dimensions: {
          length: 30,
          width: 25,
          height: 15,
          weight: 1000
        },
        colors: ['Đỏ', 'Xanh', 'Vàng'],
        tags: ['Test', 'API', 'Demo']
      };

      const createResponse = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newToyData),
      });

      const createData = await createResponse.json();
      console.log('✅ Create toy:', createData.success ? 'PASS' : 'FAIL');
      if (createData.success) {
        console.log(`🎉 Created toy: ${createData.data.name} (ID: ${createData.data.id})`);
        
        // Test 7: Get the created toy
        console.log('7. Testing get single toy endpoint...');
        const singleToyResponse = await fetch(`${BASE_URL}/${createData.data.id}`);
        const singleToyData = await singleToyResponse.json();
        console.log('✅ Get single toy:', singleToyData.success ? 'PASS' : 'FAIL');
        if (singleToyData.success) {
          console.log(`📦 Retrieved toy: ${singleToyData.data.name}`);
        }

        // Test 8: Update the toy
        console.log('8. Testing update toy endpoint...');
        const updateResponse = await fetch(`${BASE_URL}/${createData.data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test Toy API (Updated)',
            price: 899000,
          }),
        });

        const updateData = await updateResponse.json();
        console.log('✅ Update toy:', updateData.success ? 'PASS' : 'FAIL');
        if (updateData.success) {
          console.log(`📝 Updated toy: ${updateData.data.name} - ${updateData.data.price.toLocaleString('vi-VN')}đ`);
        }

        // Test 9: Delete the toy
        console.log('9. Testing delete toy endpoint...');
        const deleteResponse = await fetch(`${BASE_URL}/${createData.data.id}`, {
          method: 'DELETE',
        });

        const deleteData = await deleteResponse.json();
        console.log('✅ Delete toy:', deleteData.success ? 'PASS' : 'FAIL');
        if (deleteData.success) {
          console.log(`🗑️ Deleted toy successfully`);
        }
      } else {
        console.log('❌ Create toy failed:', createData.message);
      }
    } else {
      console.log('6-9. Skipping CRUD tests (no categories available)');
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('🔍 Make sure the Next.js server is running on http://localhost:3000');
  }
}

// Run the test
testAPI();
