import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

interface LaundryOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  phoneNumber: string;
  totalCost: number;
  status: string;
  receivedDate: Date;
  completedDate: Date | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/laundry-orders - Get all orders with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const status = searchParams.get('status')?.trim() || '';
    const search = searchParams.get('search')?.trim() || '';
    const phoneNumber = searchParams.get('phoneNumber')?.trim() || '';
    const dateFrom = searchParams.get('dateFrom')?.trim() || '';
    const dateTo = searchParams.get('dateTo')?.trim() || '';

    const validPage = Math.max(1, page);
    const validPageSize = Math.min(Math.max(1, pageSize), 100);
    const offset = (validPage - 1) * validPageSize;

    console.log('🔍 Fetching laundry orders...', { status, search, phoneNumber, dateFrom, dateTo });

    const queryParams: any = {};
    let whereConditions = ['IsActive = 1'];

    // Add status filter
    if (status && status !== 'All') {
      whereConditions.push('Status = @status');
      queryParams.status = { type: sql.NVarChar, value: status };
    }

    // Add search filter (general search)
    if (search) {
      whereConditions.push(`(
        OrderNumber LIKE @search OR
        CustomerName LIKE @search OR
        PhoneNumber LIKE @search
      )`);
      queryParams.search = { type: sql.NVarChar, value: `%${search}%` };
    }

    // Add phone number filter (exact match)
    if (phoneNumber) {
      whereConditions.push('PhoneNumber = @phoneNumber');
      queryParams.phoneNumber = { type: sql.NVarChar, value: phoneNumber };
    }

    // Add date range filter
    if (dateFrom) {
      whereConditions.push('CAST(ReceivedDate AS DATE) >= @dateFrom');
      queryParams.dateFrom = { type: sql.Date, value: dateFrom };
    }

    if (dateTo) {
      whereConditions.push('CAST(ReceivedDate AS DATE) <= @dateTo');
      queryParams.dateTo = { type: sql.Date, value: dateTo };
    }

    // Count query
    const countQuery = `
      SELECT COUNT(*) as TotalCount
      FROM LaundryOrders
      WHERE ${whereConditions.join(' AND ')}
    `;

    // Data query
    const dataQuery = `
      SELECT
        Id as id,
        OrderNumber as orderNumber,
        CustomerId as customerId,
        CustomerName as customerName,
        PhoneNumber as phoneNumber,
        TotalCost as totalCost,
        Status as status,
        ReceivedDate as receivedDate,
        CompletedDate as completedDate,
        Notes as notes,
        IsActive as isActive,
        CreatedAt as createdAt,
        UpdatedAt as updatedAt
      FROM LaundryOrders
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ReceivedDate DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;

    const [countResult, dataResult] = await Promise.all([
      executeQuery<{ TotalCount: number }>(countQuery, queryParams),
      executeQuery<LaundryOrder>(dataQuery, {
        ...queryParams,
        offset: { type: sql.Int, value: offset },
        pageSize: { type: sql.Int, value: validPageSize }
      })
    ]);

    const totalCount = countResult[0]?.TotalCount || 0;
    const totalPages = Math.ceil(totalCount / validPageSize);

    console.log(`✅ Found ${dataResult.length} orders (${totalCount} total)`);

    return NextResponse.json({
      success: true,
      data: dataResult,
      pagination: {
        page: validPage,
        pageSize: validPageSize,
        totalCount,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1,
      },
      count: dataResult.length,
      message: `Successfully retrieved ${dataResult.length} of ${totalCount} orders`,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

// POST /api/laundry-orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, customerName, phoneNumber, totalCost, status, notes } = body;

    if (!customerId || !customerName || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'customerId, customerName, and phoneNumber are required',
      }, { status: 400 });
    }

    console.log('➕ Creating new laundry order for customer:', customerName);

    // Generate order number
    const orderNumberQuery = `
      SELECT TOP 1 OrderNumber 
      FROM LaundryOrders 
      ORDER BY Id DESC
    `;
    
    const lastOrder = await executeQuery(orderNumberQuery);
    let orderNumber = 'LO-001';
    
    if (lastOrder.length > 0 && lastOrder[0].OrderNumber) {
      const lastNumber = parseInt(lastOrder[0].OrderNumber.split('-')[1]);
      orderNumber = `LO-${String(lastNumber + 1).padStart(3, '0')}`;
    }

    const insertQuery = `
      INSERT INTO LaundryOrders (
        OrderNumber,
        CustomerId,
        CustomerName,
        PhoneNumber,
        TotalCost,
        Status,
        ReceivedDate,
        Notes,
        CreatedAt,
        UpdatedAt,
        CreatedBy,
        IsActive
      )
      OUTPUT INSERTED.Id
      VALUES (
        @orderNumber,
        @customerId,
        @customerName,
        @phoneNumber,
        @totalCost,
        @status,
        GETDATE(),
        @notes,
        GETDATE(),
        GETDATE(),
        @createdBy,
        1
      )
    `;

    const result = await executeQuery(insertQuery, {
      orderNumber: { type: sql.NVarChar, value: orderNumber },
      customerId: { type: sql.Int, value: customerId },
      customerName: { type: sql.NVarChar, value: customerName.trim() },
      phoneNumber: { type: sql.NVarChar, value: phoneNumber.trim() },
      totalCost: { type: sql.Decimal, value: totalCost || 0 },
      status: { type: sql.NVarChar, value: status || 'Pending' },
      notes: { type: sql.NText, value: notes || null },
      createdBy: { type: sql.NVarChar, value: 'System' }
    });

    const newOrderId = result[0]?.Id;

    console.log(`✅ Successfully created order with ID: ${newOrderId}`);

    return NextResponse.json({
      success: true,
      data: {
        id: newOrderId,
        orderNumber,
        customerId,
        customerName,
        phoneNumber,
        totalCost,
        status: status || 'Pending'
      },
      message: 'Order created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create order',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

// PUT /api/laundry-orders - Update order status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'id and status are required',
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      }, { status: 400 });
    }

    console.log('🔄 Updating order status:', id, status);

    // Check if order exists and get current status
    const checkQuery = `
      SELECT Id, Status, CustomerId, TotalCost FROM LaundryOrders 
      WHERE Id = @id AND IsActive = 1
    `;
    
    const existing = await executeQuery(checkQuery, {
      id: { type: sql.Int, value: id }
    });

    if (existing.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Order not found',
        message: 'Order does not exist or has been deleted',
      }, { status: 404 });
    }

    const oldStatus = existing[0].Status;
    const customerId = existing[0].CustomerId;
    const totalCost = existing[0].TotalCost;

    // Update status
    const updateQuery = `
      UPDATE LaundryOrders
      SET Status = @status,
          UpdatedAt = GETDATE(),
          UpdatedBy = @updatedBy,
          CompletedDate = CASE WHEN @status = 'Completed' THEN GETDATE() ELSE CompletedDate END
      WHERE Id = @id AND IsActive = 1
    `;

    await executeQuery(updateQuery, {
      id: { type: sql.Int, value: id },
      status: { type: sql.NVarChar, value: status },
      updatedBy: { type: sql.NVarChar, value: 'System' }
    });

    // Update customer statistics based on status change
    // Case 1: Old status was NOT Completed, new status IS Completed -> Increase TotalOrders
    if (oldStatus !== 'Completed' && status === 'Completed') {
      console.log(`📈 Increasing TotalOrders for customer ${customerId}`);
      await executeQuery(`
        UPDATE LaundryCustomers
        SET TotalOrders = TotalOrders + 1,
            TotalSpent = TotalSpent + @totalCost,
            UpdatedAt = GETDATE()
        WHERE Id = @customerId
      `, {
        customerId: { type: sql.Int, value: customerId },
        totalCost: { type: sql.Decimal, value: totalCost || 0 }
      });
    }
    // Case 2: Old status WAS Completed, new status is NOT Completed -> Decrease TotalOrders
    else if (oldStatus === 'Completed' && status !== 'Completed') {
      console.log(`📉 Decreasing TotalOrders for customer ${customerId}`);
      await executeQuery(`
        UPDATE LaundryCustomers
        SET TotalOrders = CASE WHEN TotalOrders > 0 THEN TotalOrders - 1 ELSE 0 END,
            TotalSpent = CASE WHEN TotalSpent >= @totalCost THEN TotalSpent - @totalCost ELSE 0 END,
            UpdatedAt = GETDATE()
        WHERE Id = @customerId
      `, {
        customerId: { type: sql.Int, value: customerId },
        totalCost: { type: sql.Decimal, value: totalCost || 0 }
      });
    }

    console.log(`✅ Successfully updated order ${id} from ${oldStatus} to ${status}`);

    return NextResponse.json({
      success: true,
      data: {
        id,
        status,
      },
      message: 'Order status updated successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update order status',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

// PATCH /api/laundry-orders - Update order total cost
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, totalCost } = body;

    if (!id || totalCost === undefined || totalCost === null) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'id and totalCost are required',
      }, { status: 400 });
    }

    if (totalCost < 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid total cost',
        message: 'Total cost cannot be negative',
      }, { status: 400 });
    }

    console.log('💰 Updating order total cost:', id, totalCost);

    // Check if order exists and get current data
    const checkQuery = `
      SELECT Id, TotalCost, Status, CustomerId FROM LaundryOrders 
      WHERE Id = @id AND IsActive = 1
    `;
    
    const existing = await executeQuery(checkQuery, {
      id: { type: sql.Int, value: id }
    });

    if (existing.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Order not found',
        message: 'Order does not exist or has been deleted',
      }, { status: 404 });
    }

    const oldTotalCost = existing[0].TotalCost;
    const status = existing[0].Status;
    const customerId = existing[0].CustomerId;
    const costDifference = totalCost - oldTotalCost;

    // Update total cost
    const updateQuery = `
      UPDATE LaundryOrders
      SET TotalCost = @totalCost,
          UpdatedAt = GETDATE(),
          UpdatedBy = @updatedBy
      WHERE Id = @id AND IsActive = 1
    `;

    await executeQuery(updateQuery, {
      id: { type: sql.Int, value: id },
      totalCost: { type: sql.Decimal, value: totalCost },
      updatedBy: { type: sql.NVarChar, value: 'System' }
    });

    // Update customer TotalSpent ONLY if order status is Completed
    if (status === 'Completed' && costDifference !== 0) {
      console.log(`💵 Updating customer TotalSpent by ${costDifference}`);
      await executeQuery(`
        UPDATE LaundryCustomers
        SET TotalSpent = TotalSpent + @costDifference,
            UpdatedAt = GETDATE()
        WHERE Id = @customerId
      `, {
        customerId: { type: sql.Int, value: customerId },
        costDifference: { type: sql.Decimal, value: costDifference }
      });
    }

    console.log(`✅ Successfully updated order ${id} total cost from ${oldTotalCost} to ${totalCost}`);

    return NextResponse.json({
      success: true,
      data: {
        id,
        totalCost,
        oldTotalCost,
      },
      message: 'Order total cost updated successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error updating order total cost:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update order total cost',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}
