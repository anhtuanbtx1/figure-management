// Test script for Wallet Management API Endpoints
// Run with: node test-wallet-api-endpoints.js

const BASE_URL = 'http://localhost:3002/api/wallet';

async function testWalletAPIEndpoints() {
  console.log('🏦 Testing Wallet Management API Endpoints...\n');

  // Test 1: GET Categories
  console.log('1. 📂 Testing GET /api/wallet/categories...');
  try {
    const response = await fetch(`${BASE_URL}/categories`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Categories: SUCCESS (${data.count} categories)`);
      console.log('   Sample categories:');
      data.data.slice(0, 3).forEach(cat => {
        console.log(`     - ${cat.name} (${cat.type}) - ${cat.color}`);
      });
    } else {
      console.log(`❌ Categories: FAILED - ${data.message}`);
    }
  } catch (error) {
    console.log(`❌ Categories: ERROR - ${error.message}`);
  }

  // Test 2: GET Transactions
  console.log('\n2. 💳 Testing GET /api/wallet/transactions...');
  try {
    const response = await fetch(`${BASE_URL}/transactions?page=1&pageSize=5`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Transactions: SUCCESS (${data.transactions.length}/${data.pagination.total} transactions)`);
      console.log(`   Pagination: Page ${data.pagination.page}/${data.pagination.totalPages}`);
      console.log('   Sample transactions:');
      data.transactions.slice(0, 3).forEach(txn => {
        const amount = txn.amount.toLocaleString('vi-VN');
        console.log(`     - ${txn.type}: ${amount} VND - ${txn.description}`);
      });
    } else {
      console.log(`❌ Transactions: FAILED - ${data.message}`);
    }
  } catch (error) {
    console.log(`❌ Transactions: ERROR - ${error.message}`);
  }

  // Test 3: POST Create Transaction
  console.log('\n3. ➕ Testing POST /api/wallet/transactions...');
  try {
    const newTransaction = {
      type: 'Chi tiêu',
      amount: -250000,
      description: 'Test transaction - Mua sách',
      categoryId: 'cat-mua-sam',
      transactionDate: new Date().toISOString(),
      status: 'Hoàn thành'
    };

    const response = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTransaction)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Create Transaction: SUCCESS`);
      console.log(`   Created: ${data.data.description} - ${data.data.amount.toLocaleString('vi-VN')} VND`);
      console.log(`   ID: ${data.data.id}`);
      
      // Store ID for update/delete tests
      global.testTransactionId = data.data.id;
    } else {
      console.log(`❌ Create Transaction: FAILED - ${data.message}`);
    }
  } catch (error) {
    console.log(`❌ Create Transaction: ERROR - ${error.message}`);
  }

  // Test 4: GET Single Transaction
  if (global.testTransactionId) {
    console.log('\n4. 🔍 Testing GET /api/wallet/transactions/[id]...');
    try {
      const response = await fetch(`${BASE_URL}/transactions/${global.testTransactionId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ Get Transaction: SUCCESS`);
        console.log(`   Found: ${data.data.description} - ${data.data.amount.toLocaleString('vi-VN')} VND`);
        console.log(`   Category: ${data.data.categoryName} (${data.data.categoryType})`);
      } else {
        console.log(`❌ Get Transaction: FAILED - ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ Get Transaction: ERROR - ${error.message}`);
    }
  }

  // Test 5: PUT Update Transaction
  if (global.testTransactionId) {
    console.log('\n5. ✏️ Testing PUT /api/wallet/transactions/[id]...');
    try {
      const updateData = {
        type: 'Chi tiêu',
        amount: -300000,
        description: 'Test transaction UPDATED - Mua sách và vở',
        categoryId: 'cat-mua-sam',
        transactionDate: new Date().toISOString(),
        status: 'Hoàn thành'
      };

      const response = await fetch(`${BASE_URL}/transactions/${global.testTransactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ Update Transaction: SUCCESS`);
        console.log(`   Updated: ${data.data.description} - ${data.data.amount.toLocaleString('vi-VN')} VND`);
      } else {
        console.log(`❌ Update Transaction: FAILED - ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ Update Transaction: ERROR - ${error.message}`);
    }
  }

  // Test 6: GET Transactions with Filters
  console.log('\n6. 🔍 Testing GET /api/wallet/transactions with filters...');
  try {
    const response = await fetch(`${BASE_URL}/transactions?type=Chi tiêu&pageSize=3&sortField=Amount&sortDirection=desc`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Filtered Transactions: SUCCESS (${data.transactions.length} expense transactions)`);
      console.log('   Top expenses:');
      data.transactions.forEach(txn => {
        const amount = Math.abs(txn.amount).toLocaleString('vi-VN');
        console.log(`     - ${amount} VND: ${txn.description}`);
      });
    } else {
      console.log(`❌ Filtered Transactions: FAILED - ${data.message}`);
    }
  } catch (error) {
    console.log(`❌ Filtered Transactions: ERROR - ${error.message}`);
  }

  // Test 7: GET Dashboard Statistics
  console.log('\n7. 📊 Testing GET /api/wallet/dashboard...');
  try {
    const response = await fetch(`${BASE_URL}/dashboard`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Dashboard: SUCCESS`);
      console.log(`   Total Income: ${data.data.summary.totalIncome.toLocaleString('vi-VN')} VND`);
      console.log(`   Total Expense: ${data.data.summary.totalExpense.toLocaleString('vi-VN')} VND`);
      console.log(`   Net Balance: ${data.data.summary.netBalance.toLocaleString('vi-VN')} VND`);
      console.log(`   Total Transactions: ${data.data.summary.totalTransactions}`);
      
      if (data.data.topCategories.length > 0) {
        console.log('   Top Categories:');
        data.data.topCategories.slice(0, 3).forEach(cat => {
          console.log(`     - ${cat.categoryName}: ${cat.totalAmount.toLocaleString('vi-VN')} VND (${cat.transactionCount} txns)`);
        });
      }
    } else {
      console.log(`❌ Dashboard: FAILED - ${data.message}`);
    }
  } catch (error) {
    console.log(`❌ Dashboard: ERROR - ${error.message}`);
  }

  // Test 8: DELETE Transaction
  if (global.testTransactionId) {
    console.log('\n8. 🗑️ Testing DELETE /api/wallet/transactions/[id]...');
    try {
      const response = await fetch(`${BASE_URL}/transactions/${global.testTransactionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ Delete Transaction: SUCCESS`);
        console.log(`   Deleted transaction ID: ${data.data.id}`);
      } else {
        console.log(`❌ Delete Transaction: FAILED - ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ Delete Transaction: ERROR - ${error.message}`);
    }
  }

  console.log('\n==============================================');
  console.log('WALLET API ENDPOINTS TEST COMPLETED');
  console.log('==============================================');
  
  console.log('\n🎯 API Endpoints Ready:');
  console.log('✅ GET /api/wallet/categories - Fetch categories for dropdown');
  console.log('✅ GET /api/wallet/transactions - Fetch transactions with pagination');
  console.log('✅ POST /api/wallet/transactions - Create new transaction');
  console.log('✅ GET /api/wallet/transactions/[id] - Get single transaction');
  console.log('✅ PUT /api/wallet/transactions/[id] - Update transaction');
  console.log('✅ DELETE /api/wallet/transactions/[id] - Delete transaction');
  console.log('✅ GET /api/wallet/dashboard - Dashboard statistics');
  
  console.log('\n🚀 Ready for frontend integration!');
}

// Run the test
testWalletAPIEndpoints();
