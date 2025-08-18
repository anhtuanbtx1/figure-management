import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/wallet/transactions/[id] - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`💳 Fetching wallet transaction: ${params.id}`);

    const query = `
      SELECT 
        t.Id as id,
        t.Type as type,
        t.Amount as amount,
        t.Description as description,
        t.CategoryId as categoryId,
        c.Name as categoryName,
        c.Type as categoryType,
        c.Color as categoryColor,
        t.TransactionDate as transactionDate,
        t.Status as status,
        t.CreatedAt as createdAt,
        t.IsActive as isActive
      FROM zen50558_ManagementStore.dbo.WalletTransactions t
      LEFT JOIN zen50558_ManagementStore.dbo.WalletCategories c ON t.CategoryId = c.Id
      WHERE t.Id = @id AND t.IsActive = 1
    `;

    const result = await executeQuery(query, { id: params.id });

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found',
        data: null
      }, { status: 404 });
    }

    const transaction = result[0];

    return NextResponse.json({
      success: true,
      message: 'Transaction fetched successfully',
      data: {
        id: transaction.id,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        categoryId: transaction.categoryId,
        categoryName: transaction.categoryName,
        categoryType: transaction.categoryType,
        categoryColor: transaction.categoryColor,
        transactionDate: transaction.transactionDate,
        status: transaction.status,
        createdAt: transaction.createdAt,
        isActive: transaction.isActive
      }
    });

  } catch (error) {
    console.error(`❌ Error fetching wallet transaction ${params.id}:`, error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
}

// PUT /api/wallet/transactions/[id] - Update existing transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`💳 Updating wallet transaction: ${params.id}`);

    const body = await request.json();
    const { type, amount, description, categoryId, transactionDate, status } = body;

    // Validate required fields
    if (!type || !amount || !description || !categoryId) {
      return NextResponse.json({
        success: false,
        message: 'Type, amount, description, and categoryId are required',
        data: null
      }, { status: 400 });
    }

    // Check if transaction exists
    const checkQuery = `
      SELECT Id FROM zen50558_ManagementStore.dbo.WalletTransactions 
      WHERE Id = @id AND IsActive = 1
    `;
    
    const existingTransaction = await executeQuery(checkQuery, { id: params.id });
    
    if (existingTransaction.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found',
        data: null
      }, { status: 404 });
    }

    // Update transaction
    const updateQuery = `
      UPDATE zen50558_ManagementStore.dbo.WalletTransactions
      SET
        Type = @type,
        Amount = @amount,
        Description = @description,
        CategoryId = @categoryId,
        TransactionDate = @transactionDate,
        Status = @status
      WHERE Id = @id AND IsActive = 1
    `;

    await executeQuery(updateQuery, {
      id: params.id,
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
      transactionDate: transactionDate || new Date().toISOString(),
      status: status || 'Hoàn thành'
    });

    console.log(`✅ Updated wallet transaction: ${params.id}`);

    // Fetch updated transaction with category info
    const fetchQuery = `
      SELECT 
        t.Id as id,
        t.Type as type,
        t.Amount as amount,
        t.Description as description,
        t.CategoryId as categoryId,
        c.Name as categoryName,
        c.Type as categoryType,
        c.Color as categoryColor,
        t.TransactionDate as transactionDate,
        t.Status as status,
        t.CreatedAt as createdAt
      FROM zen50558_ManagementStore.dbo.WalletTransactions t
      LEFT JOIN zen50558_ManagementStore.dbo.WalletCategories c ON t.CategoryId = c.Id
      WHERE t.Id = @id
    `;

    const result = await executeQuery(fetchQuery, { id: params.id });
    const transaction = result[0];

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      data: {
        id: transaction.id,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        categoryId: transaction.categoryId,
        categoryName: transaction.categoryName,
        categoryType: transaction.categoryType,
        categoryColor: transaction.categoryColor,
        transactionDate: transaction.transactionDate,
        status: transaction.status,
        createdAt: transaction.createdAt
      }
    });

  } catch (error) {
    console.error(`❌ Error updating wallet transaction ${params.id}:`, error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to update transaction',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
}

// DELETE /api/wallet/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`💳 Deleting wallet transaction: ${params.id}`);

    // Check if transaction exists
    const checkQuery = `
      SELECT Id FROM zen50558_ManagementStore.dbo.WalletTransactions 
      WHERE Id = @id AND IsActive = 1
    `;
    
    const existingTransaction = await executeQuery(checkQuery, { id: params.id });
    
    if (existingTransaction.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found',
        data: null
      }, { status: 404 });
    }

    // Soft delete (set IsActive = 0)
    const deleteQuery = `
      UPDATE zen50558_ManagementStore.dbo.WalletTransactions
      SET IsActive = 0
      WHERE Id = @id
    `;

    await executeQuery(deleteQuery, {
      id: params.id
    });

    console.log(`✅ Deleted wallet transaction: ${params.id}`);

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: { id: params.id }
    });

  } catch (error) {
    console.error(`❌ Error deleting wallet transaction ${params.id}:`, error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to delete transaction',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
}
