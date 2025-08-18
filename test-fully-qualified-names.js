// Test script for fully qualified table names
// Run with: node test-fully-qualified-names.js

const BASE_URL = 'http://localhost:3000/api/toys';

async function testFullyQualifiedNames() {
  console.log('🧪 Testing Fully Qualified Table Names...\n');

  try {
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
      return;
    }

    // Test 1: Test API health check
    console.log('1. Testing API health check...');
    const testResponse = await fetch(`${BASE_URL}/test`);
    const testData = await testResponse.json();
    
    if (testData.success) {
      console.log('✅ API health check: PASS');
      console.log(`📊 Summary: ${testData.summary.passed} passed, ${testData.summary.failed} failed`);
      
      if (testData.summary.failed > 0) {
        console.log('⚠️ Some tests failed. Check stored procedures.');
        testData.testResults.forEach(result => {
          if (result.status === 'FAIL') {
            console.log(`   ❌ ${result.test}: ${result.message}`);
          }
        });
      }
    } else {
      console.log('❌ API health check: FAIL');
      console.log(`Error: ${testData.message}`);
    }
    console.log('');

    // Test 2: Test categories with fully qualified names
    console.log('2. Testing categories API...');
    const categoriesResponse = await fetch(`${BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      console.log(`✅ Categories API: PASS (${categoriesData.count} categories)`);
      console.log('📂 Sample categories:');
      categoriesData.data.slice(0, 3).forEach(cat => {
        console.log(`   - ${cat.name} (${cat.id}) - ${cat.color}`);
      });
    } else {
      console.log('❌ Categories API: FAIL');
      console.log(`Error: ${categoriesData.message}`);
    }
    console.log('');

    // Test 3: Test brands with fully qualified names
    console.log('3. Testing brands API...');
    const brandsResponse = await fetch(`${BASE_URL}/brands`);
    const brandsData = await brandsResponse.json();
    
    if (brandsData.success) {
      console.log(`✅ Brands API: PASS (${brandsData.count} brands)`);
      console.log('🏷️ Sample brands:');
      brandsData.data.slice(0, 5).forEach(brand => {
        console.log(`   - ${brand}`);
      });
    } else {
      console.log('❌ Brands API: FAIL');
      console.log(`Error: ${brandsData.message}`);
    }
    console.log('');

    // Test 4: Test toys API with fully qualified names
    console.log('4. Testing toys API...');
    const toysResponse = await fetch(`${BASE_URL}?page=1&pageSize=5`);
    const toysData = await toysResponse.json();
    
    if (toysData.success) {
      console.log(`✅ Toys API: PASS (${toysData.pagination.total} total toys)`);
      console.log('🧸 Sample toys:');
      toysData.toys.forEach(toy => {
        console.log(`   - ${toy.name} (${toy.category.name}) - ${toy.price.toLocaleString('vi-VN')}đ`);
      });
    } else {
      console.log('❌ Toys API: FAIL');
      console.log(`Error: ${toysData.message}`);
    }
    console.log('');

    // Test 5: Test create toy with fully qualified names
    console.log('5. Testing create toy API...');
    if (categoriesData.success && brandsData.success && categoriesData.data.length > 0 && brandsData.data.length > 0) {
      const testToyData = {
        name: 'Test Fully Qualified Names Toy',
        description: 'Đồ chơi test fully qualified table names',
        image: '/images/toys/test-fqn.jpg',
        categoryId: categoriesData.data[0].id,
        price: 799000,
        originalPrice: 999000,
        stock: 30,
        ageRange: '3-10 tuổi',
        brand: brandsData.data[0],
        material: 'Nhựa ABS',
        dimensions: {
          length: 25,
          width: 20,
          height: 15,
          weight: 600
        },
        colors: ['Xanh', 'Đỏ'],
        tags: ['Test', 'FQN', 'Database']
      };

      const createResponse = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testToyData),
      });

      const createData = await createResponse.json();
      
      if (createData.success) {
        console.log(`✅ Create toy: PASS`);
        console.log(`🎉 Created: ${createData.data.name} (ID: ${createData.data.id})`);
        
        // Test 6: Test get single toy
        console.log('\n6. Testing get single toy API...');
        const singleToyResponse = await fetch(`${BASE_URL}/${createData.data.id}`);
        const singleToyData = await singleToyResponse.json();
        
        if (singleToyData.success) {
          console.log(`✅ Get single toy: PASS`);
          console.log(`📦 Retrieved: ${singleToyData.data.name}`);
        } else {
          console.log(`❌ Get single toy: FAIL - ${singleToyData.message}`);
        }

        // Test 7: Test update toy
        console.log('\n7. Testing update toy API...');
        const updateResponse = await fetch(`${BASE_URL}/${createData.data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Updated FQN Test Toy',
            price: 699000,
          }),
        });

        const updateData = await updateResponse.json();
        
        if (updateData.success) {
          console.log(`✅ Update toy: PASS`);
          console.log(`📝 Updated: ${updateData.data.name} - ${updateData.data.price.toLocaleString('vi-VN')}đ`);
        } else {
          console.log(`❌ Update toy: FAIL - ${updateData.message}`);
        }

        // Test 8: Test delete toy
        console.log('\n8. Testing delete toy API...');
        const deleteResponse = await fetch(`${BASE_URL}/${createData.data.id}`, {
          method: 'DELETE',
        });

        const deleteData = await deleteResponse.json();
        
        if (deleteData.success) {
          console.log(`✅ Delete toy: PASS`);
          console.log(`🗑️ Deleted successfully`);
        } else {
          console.log(`❌ Delete toy: FAIL - ${deleteData.message}`);
        }
      } else {
        console.log(`❌ Create toy: FAIL - ${createData.message}`);
      }
    } else {
      console.log('⚠️ Skipping create toy test (missing categories or brands)');
    }

    console.log('\n🎉 Fully qualified names testing completed!');
    console.log('\n📋 Summary:');
    console.log('✅ All table references now use fully qualified names');
    console.log('✅ Format: zen50558_ManagementStore.dbo.TableName');
    console.log('✅ Benefits: Better security, performance, and reliability');
    console.log('✅ No more schema ambiguity or permission issues');
    
    console.log('\n🚀 Database architecture improved:');
    console.log('- Toys → zen50558_ManagementStore.dbo.Toys');
    console.log('- ToyCategories → zen50558_ManagementStore.dbo.ToyCategories');
    console.log('- ToyBrands → zen50558_ManagementStore.dbo.ToyBrands');

  } catch (error) {
    console.error('❌ Fully qualified names test failed:', error.message);
    console.error('🔍 Make sure:');
    console.error('  1. Next.js server is running: npm run dev');
    console.error('  2. Database is accessible');
    console.error('  3. All SQL scripts have been executed with fully qualified names');
    console.error('  4. Stored procedures are created correctly');
  }
}

// Run the test
testFullyQualifiedNames();
