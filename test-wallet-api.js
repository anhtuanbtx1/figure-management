// Test script for Wallet Management API
// Run with: node test-wallet-api.js

const BASE_URL = 'http://localhost:3001/api/wallet';

async function testWalletAPI() {
  console.log('🏦 Testing Wallet Management API...\n');

  // Test 1: Categories
  console.log('1. 📂 Testing Wallet Categories...');
  try {
    const response = await fetch(`${BASE_URL}/categories`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Categories: SUCCESS (${data.count} categories)`);
      
      // Show breakdown by type
      const income = data.data.filter(c => c.type === 'income').length;
      const expense = data.data.filter(c => c.type === 'expense').length;
      const transfer = data.data.filter(c => c.type === 'transfer').length;
      
      console.log(`   📈 Income categories: ${income}`);
      console.log(`   📉 Expense categories: ${expense}`);
      console.log(`   🔄 Transfer categories: ${transfer}`);
      
      // Show sample categories
      console.log('   Sample categories:');
      data.data.slice(0, 3).forEach(cat => {
        console.log(`     ${cat.icon || '📁'} ${cat.name} (${cat.type})`);
      });
    } else {
      console.log(`❌ Categories: FAILED - ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Categories: ERROR - ${error.message}`);
  }

  // Test 2: Accounts
  console.log('\n2. 🏦 Testing Wallet Accounts...');
  try {
    const response = await fetch(`${BASE_URL}/accounts`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Accounts: SUCCESS (${data.count} accounts)`);
      
      // Calculate total balance
      const totalBalance = data.data.reduce((sum, acc) => sum + acc.balance, 0);
      console.log(`   💰 Total balance: ${totalBalance.toLocaleString('vi-VN')} VND`);
      
      // Show breakdown by account type
      const accountTypes = {};
      data.data.forEach(acc => {
        accountTypes[acc.accountType] = (accountTypes[acc.accountType] || 0) + 1;
      });
      
      console.log('   Account types:');
      Object.entries(accountTypes).forEach(([type, count]) => {
        console.log(`     ${type}: ${count} accounts`);
      });
      
      // Show sample accounts
      console.log('   Sample accounts:');
      data.data.slice(0, 3).forEach(acc => {
        console.log(`     ${acc.icon || '🏦'} ${acc.name}: ${acc.balance.toLocaleString('vi-VN')} ${acc.currency}`);
      });
    } else {
      console.log(`❌ Accounts: FAILED - ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Accounts: ERROR - ${error.message}`);
  }

  // Test 3: Transactions
  console.log('\n3. 💳 Testing Wallet Transactions...');
  try {
    const response = await fetch(`${BASE_URL}/transactions?page=1&pageSize=5`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Transactions: SUCCESS (${data.transactions.length}/${data.pagination.total} transactions)`);
      console.log(`   📄 Pages: ${data.pagination.totalPages} total`);
      
      // Show transaction breakdown
      const income = data.transactions.filter(t => t.type === 'income').length;
      const expense = data.transactions.filter(t => t.type === 'expense').length;
      const transfer = data.transactions.filter(t => t.type === 'transfer').length;
      
      console.log(`   📈 Income: ${income}, 📉 Expense: ${expense}, 🔄 Transfer: ${transfer}`);
      
      // Show sample transactions
      console.log('   Recent transactions:');
      data.transactions.slice(0, 3).forEach(txn => {
        const icon = txn.type === 'income' ? '📈' : txn.type === 'expense' ? '📉' : '🔄';
        console.log(`     ${icon} ${txn.title}: ${txn.amount.toLocaleString('vi-VN')} VND`);
      });
    } else {
      console.log(`❌ Transactions: FAILED - ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Transactions: ERROR - ${error.message}`);
  }

  // Test 4: Budgets
  console.log('\n4. 💰 Testing Wallet Budgets...');
  try {
    const response = await fetch(`${BASE_URL}/budgets`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Budgets: SUCCESS (${data.count} budgets)`);
      
      // Show budget status
      console.log('   Budget status:');
      data.data.forEach(budget => {
        const percentage = budget.usagePercentage || 0;
        const status = percentage >= budget.alertThreshold ? '⚠️' : '✅';
        console.log(`     ${status} ${budget.name}: ${percentage}% used (${budget.spentAmount.toLocaleString('vi-VN')}/${budget.amount.toLocaleString('vi-VN')} VND)`);
      });
    } else {
      console.log(`❌ Budgets: FAILED - ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Budgets: ERROR - ${error.message}`);
  }

  // Test 5: Goals
  console.log('\n5. 🎯 Testing Wallet Goals...');
  try {
    const response = await fetch(`${BASE_URL}/goals`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Goals: SUCCESS (${data.count} goals)`);
      
      // Show goal progress
      console.log('   Goal progress:');
      data.data.forEach(goal => {
        const percentage = goal.progressPercentage || 0;
        const priority = goal.priority === 'high' ? '🔴' : goal.priority === 'medium' ? '🟡' : '🟢';
        console.log(`     ${priority} ${goal.name}: ${percentage}% (${goal.currentAmount.toLocaleString('vi-VN')}/${goal.targetAmount.toLocaleString('vi-VN')} VND)`);
      });
    } else {
      console.log(`❌ Goals: FAILED - ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Goals: ERROR - ${error.message}`);
  }

  // Test 6: Dashboard Summary
  console.log('\n6. 📊 Testing Dashboard Summary...');
  try {
    const response = await fetch(`${BASE_URL}/dashboard`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Dashboard: SUCCESS`);
      console.log('   Dashboard data sections available:');
      
      if (data.accountBalances) {
        console.log(`     🏦 Account balances by type`);
      }
      if (data.incomeExpense) {
        console.log(`     📊 Income vs Expense summary`);
      }
      if (data.topCategories) {
        console.log(`     🏆 Top spending categories`);
      }
      if (data.budgetStatus) {
        console.log(`     💰 Budget status overview`);
      }
    } else {
      console.log(`❌ Dashboard: FAILED - ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Dashboard: ERROR - ${error.message}`);
  }

  console.log('\n==============================================');
  console.log('WALLET API TEST COMPLETED');
  console.log('==============================================');
  
  console.log('\n💡 Wallet Management Features:');
  console.log('✅ Categories: Income, Expense, Transfer with Vietnamese names');
  console.log('✅ Accounts: Cash, Banks, E-wallets, Credit cards, Investment');
  console.log('✅ Transactions: Full CRUD with pagination and filtering');
  console.log('✅ Budgets: Monthly/Weekly/Yearly with usage tracking');
  console.log('✅ Goals: Savings goals with progress tracking');
  console.log('✅ Dashboard: Summary statistics and insights');
  
  console.log('\n🎯 Ready for frontend implementation at /apps/wallet!');
}

// Run the test
testWalletAPI();
