// Test script for category icons and colors
// Run with: node test-category-icons.js

const BASE_URL = 'http://localhost:3000/api/toys';

async function testCategoryIcons() {
  console.log('🎨 Testing Category Icons and Colors...\n');

  try {
    // Test 1: Get categories and check icon/color mapping
    console.log('1. Testing categories with icons and colors...');
    const categoriesResponse = await fetch(`${BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      console.log(`✅ Categories: Found ${categoriesData.count} categories`);
      console.log('🎨 Category Icon and Color Mapping:');
      console.log('━'.repeat(80));
      
      categoriesData.data.forEach((cat, index) => {
        const iconStatus = cat.icon ? '✅' : '❌';
        const colorStatus = cat.color ? '✅' : '❌';
        
        console.log(`${index + 1}. ${cat.name}`);
        console.log(`   📂 Slug: ${cat.slug}`);
        console.log(`   🎯 Icon: ${iconStatus} ${cat.icon || 'Missing'}`);
        console.log(`   🎨 Color: ${colorStatus} ${cat.color || 'Missing'}`);
        console.log(`   📝 Description: ${cat.description || 'No description'}`);
        console.log('');
      });
      
      // Check for missing icons or colors
      const missingIcons = categoriesData.data.filter(cat => !cat.icon || cat.icon === '');
      const missingColors = categoriesData.data.filter(cat => !cat.color || cat.color === '');
      
      if (missingIcons.length > 0) {
        console.log('⚠️ Categories missing icons:');
        missingIcons.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));
        console.log('');
      }
      
      if (missingColors.length > 0) {
        console.log('⚠️ Categories missing colors:');
        missingColors.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));
        console.log('');
      }
      
      if (missingIcons.length === 0 && missingColors.length === 0) {
        console.log('✅ All categories have icons and colors assigned!');
      }
    } else {
      console.log('❌ Categories failed:', categoriesData.message);
      return;
    }
    console.log('');

    // Test 2: Check Material-UI icon names
    console.log('2. Validating Material-UI icon names...');
    const validMUIIcons = [
      'School', 'Build', 'Person', 'DirectionsCar', 'SportsBaseball',
      'SmartToy', 'Palette', 'MusicNote', 'FlightTakeoff', 'Park',
      'Extension', 'Restaurant', 'Science', 'Pets', 'Casino', 'ChildCare'
    ];
    
    const categoryIcons = categoriesData.data.map(cat => cat.icon).filter(icon => icon);
    const invalidIcons = categoryIcons.filter(icon => !validMUIIcons.includes(icon) && icon.length > 2);
    
    if (invalidIcons.length > 0) {
      console.log('⚠️ Invalid Material-UI icon names found:');
      invalidIcons.forEach(icon => console.log(`   - ${icon}`));
      console.log('');
      console.log('💡 Valid Material-UI icons:');
      validMUIIcons.forEach(icon => console.log(`   ✅ ${icon}`));
    } else {
      console.log('✅ All icon names are valid Material-UI icons!');
    }
    console.log('');

    // Test 3: Check color format
    console.log('3. Validating color formats...');
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    const invalidColors = categoriesData.data.filter(cat => 
      cat.color && !hexColorRegex.test(cat.color)
    );
    
    if (invalidColors.length > 0) {
      console.log('⚠️ Invalid color formats found:');
      invalidColors.forEach(cat => console.log(`   - ${cat.name}: ${cat.color}`));
      console.log('💡 Colors should be in hex format: #RRGGBB');
    } else {
      console.log('✅ All colors are in valid hex format!');
    }
    console.log('');

    // Test 4: Test toys with category data
    console.log('4. Testing toys with category icon/color data...');
    const toysResponse = await fetch(`${BASE_URL}?pageSize=5`);
    const toysData = await toysResponse.json();
    
    if (toysData.success && toysData.toys.length > 0) {
      console.log('📦 Sample toys with category data:');
      toysData.toys.forEach((toy, index) => {
        console.log(`${index + 1}. ${toy.name}`);
        console.log(`   📂 Category: ${toy.category.name}`);
        console.log(`   🎯 Icon: ${toy.category.icon || 'Missing'}`);
        console.log(`   🎨 Color: ${toy.category.color || 'Missing'}`);
        console.log('');
      });
      
      // Check if all toys have category with icon and color
      const toysWithMissingIcons = toysData.toys.filter(toy => !toy.category.icon);
      const toysWithMissingColors = toysData.toys.filter(toy => !toy.category.color);
      
      if (toysWithMissingIcons.length > 0) {
        console.log('⚠️ Toys with categories missing icons:');
        toysWithMissingIcons.forEach(toy => console.log(`   - ${toy.name} (${toy.category.name})`));
      }
      
      if (toysWithMissingColors.length > 0) {
        console.log('⚠️ Toys with categories missing colors:');
        toysWithMissingColors.forEach(toy => console.log(`   - ${toy.name} (${toy.category.name})`));
      }
      
      if (toysWithMissingIcons.length === 0 && toysWithMissingColors.length === 0) {
        console.log('✅ All toys have categories with icons and colors!');
      }
    } else {
      console.log('⚠️ No toys found to test category data');
    }
    console.log('');

    // Test 5: Color palette analysis
    console.log('5. Analyzing color palette...');
    const colors = categoriesData.data.map(cat => cat.color).filter(color => color);
    const uniqueColors = [...new Set(colors)];
    
    console.log(`🎨 Color palette (${uniqueColors.length} unique colors):`);
    uniqueColors.forEach(color => {
      console.log(`   ${color} ████`);
    });
    
    if (uniqueColors.length < colors.length) {
      console.log(`⚠️ ${colors.length - uniqueColors.length} duplicate colors found`);
    } else {
      console.log('✅ All categories have unique colors!');
    }

    console.log('\n🎉 Category icons and colors testing completed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Categories: ${categoriesData.count} total`);
    console.log(`✅ Icons: ${categoryIcons.length} assigned`);
    console.log(`✅ Colors: ${colors.length} assigned`);
    console.log(`✅ Unique colors: ${uniqueColors.length}`);
    
    console.log('\n🚀 Ready to test in browser:');
    console.log('1. Open http://localhost:3000/apps/toy-management');
    console.log('2. Check category dropdowns show icons and colors');
    console.log('3. Check category chips in table show icons and colors');
    console.log('4. Check filters work with icon/color display');

  } catch (error) {
    console.error('❌ Category icons test failed:', error.message);
    console.error('🔍 Make sure the Next.js server is running on http://localhost:3000');
    console.error('🔍 Make sure the database has updated sample data (run toy-management-sample-data.sql)');
  }
}

// Run the test
testCategoryIcons();
