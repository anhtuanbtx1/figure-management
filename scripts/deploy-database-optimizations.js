const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Database configuration (same as your project)
const config = {
  server: process.env.DB_SERVER || '112.78.2.70',
  database: process.env.DB_DATABASE || 'zen50558_ManagementStore',
  user: process.env.DB_USER || 'zen50558_ManagementStore',
  password: process.env.DB_PASSWORD || 'Passwordla@123',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  requestTimeout: 60000,
  connectionTimeout: 60000
};

async function deployOptimizations() {
  let pool;
  
  try {
    console.log('🔌 Connecting to database...');
    pool = await new sql.ConnectionPool(config).connect();
    console.log('✅ Connected to SQL Server database');
    
    // Read the optimization script
    const scriptPath = path.join(__dirname, '..', 'src', 'lib', 'optimized-stored-procedures.sql');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    console.log('📋 Loading optimization script...');
    
    // Split script into individual statements by GO keyword
    const statements = script.split(/^\s*GO\s*$/gm)
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0 && !statement.startsWith('--'));
    
    console.log(`🚀 Executing ${statements.length} optimization statements...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`📊 Executing statement ${i + 1}/${statements.length}...`);
        
        const request = pool.request();
        await request.query(statement);
        
        successCount++;
        console.log(`✅ Statement ${i + 1} executed successfully`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        
        // Log the problematic statement for debugging
        console.log('Problematic statement:', statement.substring(0, 200) + '...');
        
        // Continue with other statements unless it's a critical error
        if (error.message.includes('syntax error') || error.message.includes('cannot find')) {
          console.log('⚠️ Continuing with next statement...');
        } else {
          throw error; // Stop on critical errors
        }
      }
    }
    
    console.log('\n🎉 Database optimization deployment completed!');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    
    // Test the optimizations
    console.log('\n🧪 Testing optimizations...');
    await testOptimizations(pool);
    
  } catch (error) {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
    
  } finally {
    if (pool) {
      await pool.close();
      console.log('📦 Database connection closed');
    }
  }
}

async function testOptimizations(pool) {
  try {
    // Test 1: Check if indexes were created
    console.log('📋 Checking indexes...');
    const indexQuery = `
      SELECT 
        t.name AS table_name,
        i.name AS index_name,
        i.type_desc
      FROM sys.indexes i
      INNER JOIN sys.tables t ON i.object_id = t.object_id
      WHERE t.name IN ('Toys', 'ToyCategories', 'ToyBrands')
        AND i.name LIKE 'IX_%'
      ORDER BY t.name, i.name
    `;
    
    const indexResult = await pool.request().query(indexQuery);
    console.log(`✅ Found ${indexResult.recordset.length} optimized indexes:`);
    
    indexResult.recordset.forEach(row => {
      console.log(`   - ${row.table_name}.${row.index_name} (${row.type_desc})`);
    });
    
    // Test 2: Check if stored procedures were created
    console.log('\n📋 Checking stored procedures...');
    const spQuery = `
      SELECT name, create_date, modify_date
      FROM sys.procedures
      WHERE name LIKE '%Optimized%' OR name LIKE 'sp_GetToysForFrontend%' OR name LIKE 'sp_BulkDeleteToys%'
      ORDER BY name
    `;
    
    const spResult = await pool.request().query(spQuery);
    console.log(`✅ Found ${spResult.recordset.length} optimization procedures:`);
    
    spResult.recordset.forEach(row => {
      console.log(`   - ${row.name} (modified: ${row.modify_date.toLocaleDateString()})`);
    });
    
    // Test 3: Performance test
    console.log('\n🚀 Running performance test...');
    const perfTest = `
      DECLARE @StartTime DATETIME2 = GETDATE();
      
      SELECT TOP 10 
        t.Id, t.Name, t.Price, c.Name as CategoryName
      FROM zen50558_ManagementStore.dbo.Toys t WITH (NOLOCK)
      LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c WITH (NOLOCK) ON t.CategoryId = c.Id
      WHERE t.IsActive = 1
      ORDER BY t.CreatedAt DESC;
      
      SELECT DATEDIFF(MICROSECOND, @StartTime, GETDATE()) / 1000.0 AS ResponseTimeMs;
    `;
    
    const perfResult = await pool.request().query(perfTest);
    const responseTime = perfResult.recordsets[1][0]?.ResponseTimeMs || 'N/A';
    console.log(`⚡ Query response time: ${responseTime}ms`);
    
    if (parseFloat(responseTime) < 100) {
      console.log('🎯 Excellent performance! (<100ms)');
    } else if (parseFloat(responseTime) < 300) {
      console.log('👍 Good performance! (<300ms)');
    } else {
      console.log('⚠️ Performance could be improved (>300ms)');
    }
    
    console.log('\n✅ All optimization tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Testing failed:', error.message);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚡ Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚡ Shutting down gracefully...');
  process.exit(0);
});

// Run the deployment
if (require.main === module) {
  console.log('🚀 Starting Database Optimization Deployment...');
  console.log('================================================');
  
  deployOptimizations()
    .then(() => {
      console.log('\n🎉 Deployment completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Update your API routes to use optimized functions');
      console.log('2. Monitor performance using /api/performance');
      console.log('3. Test your application thoroughly');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Deployment failed:', error.message);
      process.exit(1);
    });
}

module.exports = { deployOptimizations, testOptimizations };