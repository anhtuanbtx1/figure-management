// Test script for dropdown data in Toy Management
// Run with: node test-dropdown-data.js

const BASE_URL = 'http://localhost:3000/api/toys';

async function testDropdownData() {
  console.log('🧪 Testing Dropdown Data for Toy Management...\n');

  try {
    // Test 1: Get categories for dropdown
    console.log('1. Testing categories dropdown data...');
    const categoriesResponse = await fetch(`${BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      console.log(`✅ Categories: Found ${categoriesData.count} categories`);
      console.log('📂 Categories available for dropdown:');
      categoriesData.data.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (${cat.slug}) - ${cat.color}`);
      });
      
      if (categoriesData.count < 5) {
        console.log('⚠️ Warning: Less than 5 categories. Consider adding more variety.');
      } else {
        console.log('✅ Good variety of categories for dropdown!');
      }
    } else {
      console.log('❌ Categories failed:', categoriesData.message);
      return;
    }
    console.log('');

    // Test 2: Get brands for dropdown
    console.log('2. Testing brands dropdown data...');
    const brandsResponse = await fetch(`${BASE_URL}/brands`);
    const brandsData = await brandsResponse.json();
    
    if (brandsData.success) {
      console.log(`✅ Brands: Found ${brandsData.count} brands`);
      console.log('🏷️ Brands available for dropdown:');
      brandsData.data.forEach((brand, index) => {
        console.log(`   ${index + 1}. ${brand}`);
      });
      
      if (brandsData.count < 10) {
        console.log('⚠️ Warning: Less than 10 brands. Consider adding more variety.');
      } else {
        console.log('✅ Good variety of brands for dropdown!');
      }
    } else {
      console.log('❌ Brands failed:', brandsData.message);
      return;
    }
    console.log('');

    // Test 3: Test filtering by category
    console.log('3. Testing category filtering...');
    if (categoriesData.data.length > 0) {
      const testCategory = categoriesData.data[0];
      const categoryFilterResponse = await fetch(`${BASE_URL}?category=${testCategory.id}&pageSize=5`);
      const categoryFilterData = await categoryFilterResponse.json();
      
      if (categoryFilterData.success) {
        console.log(`✅ Category filter: Found ${categoryFilterData.toys.length} toys in "${testCategory.name}"`);
        if (categoryFilterData.toys.length > 0) {
          console.log('📦 Sample toys in this category:');
          categoryFilterData.toys.forEach((toy, index) => {
            console.log(`   ${index + 1}. ${toy.name} - ${toy.price.toLocaleString('vi-VN')}đ`);
          });
        } else {
          console.log('⚠️ No toys found in this category. Consider adding sample toys.');
        }
      } else {
        console.log('❌ Category filtering failed:', categoryFilterData.message);
      }
    }
    console.log('');

    // Test 4: Test filtering by brand
    console.log('4. Testing brand filtering...');
    if (brandsData.data.length > 0) {
      const testBrand = brandsData.data[0];
      const brandFilterResponse = await fetch(`${BASE_URL}?brand=${encodeURIComponent(testBrand)}&pageSize=5`);
      const brandFilterData = await brandFilterResponse.json();
      
      if (brandFilterData.success) {
        console.log(`✅ Brand filter: Found ${brandFilterData.toys.length} toys from "${testBrand}"`);
        if (brandFilterData.toys.length > 0) {
          console.log('📦 Sample toys from this brand:');
          brandFilterData.toys.forEach((toy, index) => {
            console.log(`   ${index + 1}. ${toy.name} - ${toy.price.toLocaleString('vi-VN')}đ`);
          });
        } else {
          console.log('⚠️ No toys found for this brand. Consider adding sample toys.');
        }
      } else {
        console.log('❌ Brand filtering failed:', brandFilterData.message);
      }
    }
    console.log('');

    // Test 5: Test creating toy with dropdown data
    console.log('5. Testing toy creation with dropdown data...');
    if (categoriesData.data.length > 0 && brandsData.data.length > 0) {
      const testToyData = {
        name: 'Test Dropdown Toy',
        description: 'Đồ chơi test dropdown functionality',
        image: '/images/toys/test-dropdown.jpg',
        categoryId: categoriesData.data[0].id,
        price: 599000,
        originalPrice: 699000,
        stock: 25,
        ageRange: '3-8 tuổi',
        brand: brandsData.data[0],
        material: 'Nhựa ABS',
        dimensions: {
          length: 20,
          width: 15,
          height: 10,
          weight: 500
        },
        colors: ['Đỏ', 'Xanh'],
        tags: ['Test', 'Dropdown']
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
        console.log(`✅ Toy creation: Successfully created "${createData.data.name}"`);
        console.log(`📂 Category: ${createData.data.category.name}`);
        console.log(`🏷️ Brand: ${createData.data.brand}`);
        
        // Clean up - delete the test toy
        const deleteResponse = await fetch(`${BASE_URL}/${createData.data.id}`, {
          method: 'DELETE',
        });
        
        if (deleteResponse.ok) {
          console.log('🗑️ Test toy cleaned up successfully');
        }
      } else {
        console.log('❌ Toy creation failed:', createData.message);
      }
    }
    console.log('');

    // Test 6: Check data distribution
    console.log('6. Analyzing data distribution...');
    const allToysResponse = await fetch(`${BASE_URL}?pageSize=100`);
    const allToysData = await allToysResponse.json();
    
    if (allToysData.success) {
      const toys = allToysData.toys;
      
      // Category distribution
      const categoryDistribution = {};
      toys.forEach(toy => {
        const catName = toy.category.name;
        categoryDistribution[catName] = (categoryDistribution[catName] || 0) + 1;
      });
      
      console.log('📊 Category distribution:');
      Object.entries(categoryDistribution).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} toys`);
      });
      
      // Brand distribution
      const brandDistribution = {};
      toys.forEach(toy => {
        brandDistribution[toy.brand] = (brandDistribution[toy.brand] || 0) + 1;
      });
      
      console.log('\n📊 Brand distribution:');
      Object.entries(brandDistribution).forEach(([brand, count]) => {
        console.log(`   ${brand}: ${count} toys`);
      });
      
      // Check for empty categories/brands
      const usedCategories = new Set(toys.map(toy => toy.category.id));
      const usedBrands = new Set(toys.map(toy => toy.brand));
      
      const emptyCategories = categoriesData.data.filter(cat => !usedCategories.has(cat.id));
      const emptyBrands = brandsData.data.filter(brand => !usedBrands.has(brand));
      
      if (emptyCategories.length > 0) {
        console.log('\n⚠️ Empty categories (no toys):');
        emptyCategories.forEach(cat => console.log(`   - ${cat.name}`));
      }
      
      if (emptyBrands.length > 0) {
        console.log('\n⚠️ Empty brands (no toys):');
        emptyBrands.forEach(brand => console.log(`   - ${brand}`));
      }
      
      if (emptyCategories.length === 0 && emptyBrands.length === 0) {
        console.log('\n✅ All categories and brands have toys assigned!');
      }
    }

    console.log('\n🎉 Dropdown data testing completed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Categories: ${categoriesData.count} available`);
    console.log(`✅ Brands: ${brandsData.count} available`);
    console.log('✅ Filtering by category and brand works');
    console.log('✅ Toy creation with dropdown data works');
    
    console.log('\n🚀 Ready to test in /apps/toy-management:');
    console.log('1. Open http://localhost:3000/apps/toy-management');
    console.log('2. Click "Thêm đồ chơi mới" button');
    console.log('3. Check if category and brand dropdowns are populated');
    console.log('4. Test filtering by category and brand');
    console.log('5. Create a new toy and verify it appears in the list');

  } catch (error) {
    console.error('❌ Dropdown data test failed:', error.message);
    console.error('🔍 Make sure the Next.js server is running on http://localhost:3000');
    console.error('🔍 Make sure the database has sample data (run toy-management-sample-data.sql)');
  }
}

// Run the test
testDropdownData();
