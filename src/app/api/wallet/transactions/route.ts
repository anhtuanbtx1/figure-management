import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/wallet/transactions - Fetch transactions with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    console.log('💳 Fetching wallet transactions from database...');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';
    const sortField = searchParams.get('sortField') || 'TransactionDate';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    console.log('🔍 Query params:', { page, pageSize, search, type, categoryId, status, sortField, sortDirection });

    // Build WHERE clause
    let whereConditions = ['t.IsActive = 1'];
    let queryParams: any = {};

    if (search) {
      whereConditions.push('(t.Description LIKE @search OR t.Type LIKE @search)');
      queryParams.search = `%${search}%`;
    }

    if (type) {
      whereConditions.push('t.Type = @type');
      queryParams.type = type;
    }

    if (categoryId) {
      whereConditions.push('t.CategoryId = @categoryId');
      queryParams.categoryId = categoryId;
    }

    if (status) {
      whereConditions.push('t.Status = @status');
      queryParams.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM zen50558_ManagementStore.dbo.WalletTransactions t
      ${whereClause}
    `;

    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    // Get paginated data
    const offset = (page - 1) * pageSize;
    
    const dataQuery = `
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
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY
    `;

    const transactions = await executeQuery(dataQuery, queryParams);

    console.log(`✅ Found ${transactions.length} transactions (${total} total)`);

    // Transform data for frontend
    const transformedTransactions = transactions.map(row => ({
      id: row.id,
      type: row.type,
      amount: parseFloat(row.amount),
      description: row.description,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      categoryType: row.categoryType,
      categoryColor: row.categoryColor,
      transactionDate: row.transactionDate,
      status: row.status,
      createdAt: row.createdAt,
      isActive: row.isActive
    }));

    return NextResponse.json({
      success: true,
      message: 'Transactions fetched successfully',
      transactions: transformedTransactions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('❌ Error fetching wallet transactions:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error instanceof Error ? error.message : 'Unknown error',
      transactions: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0
      }
    }, { status: 500 });
  }
}

// POST /api/wallet/transactions - Create new transaction
export async function POST(request: Request) {
  try {
    console.log('💳 Creating new wallet transaction...');

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

    // Generate ID
    const id = `txn-${Date.now()}`;
    const now = new Date().toISOString();

    // Insert new transaction
    const insertQuery = `
      INSERT INTO zen50558_ManagementStore.dbo.WalletTransactions 
      (Id, Type, Amount, Description, CategoryId, TransactionDate, Status, CreatedAt, IsActive)
      VALUES (@id, @type, @amount, @description, @categoryId, @transactionDate, @status, @createdAt, 1)
    `;

    await executeQuery(insertQuery, {
      id,
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
      transactionDate: transactionDate || now,
      status: status || 'Hoàn thành',
      createdAt: now
    });

    console.log(`✅ Created new wallet transaction: ${description}`);

    // Fetch the created transaction with category info
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

    const result = await executeQuery(fetchQuery, { id });
    const transaction = result[0];

    return NextResponse.json({
      success: true,
      message: 'Transaction created successfully',
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
    console.error('❌ Error creating wallet transaction:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create transaction',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
}
