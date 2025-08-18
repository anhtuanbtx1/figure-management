-- =====================================================
-- ENHANCED TOY MANAGEMENT DATABASE SCHEMA
-- Extended SQL Server Database Schema for Toy Management System
-- Includes additional tables for complete business operations
-- =====================================================

-- Use the existing database
USE zen50558_ManagementStore;
GO

-- =====================================================
-- 1. CREATE SUPPLIERS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Suppliers' AND xtype='U')
BEGIN
    CREATE TABLE Suppliers (
        Id NVARCHAR(50) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        ContactPerson NVARCHAR(255),
        Email NVARCHAR(255),
        Phone NVARCHAR(50),
        Address NVARCHAR(MAX),
        City NVARCHAR(100),
        Country NVARCHAR(100),
        Website NVARCHAR(255),
        TaxId NVARCHAR(50),
        PaymentTerms NVARCHAR(100),
        Rating DECIMAL(3,2) DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_Suppliers_Name ON Suppliers(Name);
    CREATE INDEX IX_Suppliers_IsActive ON Suppliers(IsActive);
    CREATE INDEX IX_Suppliers_Rating ON Suppliers(Rating);

    PRINT 'Suppliers table created successfully';
END
GO

-- =====================================================
-- 2. CREATE CUSTOMERS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Customers' AND xtype='U')
BEGIN
    CREATE TABLE Customers (
        Id NVARCHAR(50) PRIMARY KEY,
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        Email NVARCHAR(255) UNIQUE NOT NULL,
        Phone NVARCHAR(50),
        DateOfBirth DATE,
        Gender NVARCHAR(10),
        Address NVARCHAR(MAX),
        City NVARCHAR(100),
        PostalCode NVARCHAR(20),
        Country NVARCHAR(100),
        CustomerType NVARCHAR(20) DEFAULT 'Regular', -- Regular, VIP, Wholesale
        TotalSpent DECIMAL(18,2) DEFAULT 0,
        TotalOrders INT DEFAULT 0,
        LastOrderDate DATETIME2,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_Customers_Email ON Customers(Email);
    CREATE INDEX IX_Customers_CustomerType ON Customers(CustomerType);
    CREATE INDEX IX_Customers_TotalSpent ON Customers(TotalSpent);
    CREATE INDEX IX_Customers_IsActive ON Customers(IsActive);

    PRINT 'Customers table created successfully';
END
GO

-- =====================================================
-- 3. CREATE ORDERS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orders' AND xtype='U')
BEGIN
    CREATE TABLE Orders (
        Id NVARCHAR(50) PRIMARY KEY,
        OrderNumber NVARCHAR(50) UNIQUE NOT NULL,
        CustomerId NVARCHAR(50) NOT NULL,
        OrderDate DATETIME2 NOT NULL DEFAULT GETDATE(),
        Status NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Processing, Shipped, Delivered, Cancelled
        SubTotal DECIMAL(18,2) NOT NULL,
        TaxAmount DECIMAL(18,2) DEFAULT 0,
        ShippingAmount DECIMAL(18,2) DEFAULT 0,
        DiscountAmount DECIMAL(18,2) DEFAULT 0,
        TotalAmount DECIMAL(18,2) NOT NULL,
        PaymentMethod NVARCHAR(50),
        PaymentStatus NVARCHAR(20) DEFAULT 'Pending', -- Pending, Paid, Failed, Refunded
        ShippingAddress NVARCHAR(MAX),
        BillingAddress NVARCHAR(MAX),
        Notes NVARCHAR(MAX),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_Orders_Customer FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
    );

    CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);
    CREATE INDEX IX_Orders_OrderDate ON Orders(OrderDate);
    CREATE INDEX IX_Orders_Status ON Orders(Status);
    CREATE INDEX IX_Orders_PaymentStatus ON Orders(PaymentStatus);
    CREATE INDEX IX_Orders_OrderNumber ON Orders(OrderNumber);

    PRINT 'Orders table created successfully';
END
GO

-- =====================================================
-- 4. CREATE ORDER ITEMS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OrderItems' AND xtype='U')
BEGIN
    CREATE TABLE OrderItems (
        Id NVARCHAR(50) PRIMARY KEY,
        OrderId NVARCHAR(50) NOT NULL,
        ToyId NVARCHAR(50) NOT NULL,
        Quantity INT NOT NULL,
        UnitPrice DECIMAL(18,2) NOT NULL,
        TotalPrice DECIMAL(18,2) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_OrderItems_Order FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
        CONSTRAINT FK_OrderItems_Toy FOREIGN KEY (ToyId) REFERENCES Toys(Id)
    );

    CREATE INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
    CREATE INDEX IX_OrderItems_ToyId ON OrderItems(ToyId);

    PRINT 'OrderItems table created successfully';
END
GO

-- =====================================================
-- 5. CREATE INVENTORY TRANSACTIONS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='InventoryTransactions' AND xtype='U')
BEGIN
    CREATE TABLE InventoryTransactions (
        Id NVARCHAR(50) PRIMARY KEY,
        ToyId NVARCHAR(50) NOT NULL,
        TransactionType NVARCHAR(20) NOT NULL, -- Purchase, Sale, Adjustment, Return
        Quantity INT NOT NULL, -- Positive for incoming, negative for outgoing
        UnitCost DECIMAL(18,2),
        TotalCost DECIMAL(18,2),
        ReferenceId NVARCHAR(50), -- OrderId, PurchaseOrderId, etc.
        ReferenceType NVARCHAR(50), -- Order, Purchase, Adjustment
        Notes NVARCHAR(MAX),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CreatedBy NVARCHAR(255) DEFAULT 'System',
        
        CONSTRAINT FK_InventoryTransactions_Toy FOREIGN KEY (ToyId) REFERENCES Toys(Id)
    );

    CREATE INDEX IX_InventoryTransactions_ToyId ON InventoryTransactions(ToyId);
    CREATE INDEX IX_InventoryTransactions_TransactionType ON InventoryTransactions(TransactionType);
    CREATE INDEX IX_InventoryTransactions_CreatedAt ON InventoryTransactions(CreatedAt);

    PRINT 'InventoryTransactions table created successfully';
END
GO

-- =====================================================
-- 6. CREATE PURCHASE ORDERS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PurchaseOrders' AND xtype='U')
BEGIN
    CREATE TABLE PurchaseOrders (
        Id NVARCHAR(50) PRIMARY KEY,
        PONumber NVARCHAR(50) UNIQUE NOT NULL,
        SupplierId NVARCHAR(50) NOT NULL,
        OrderDate DATETIME2 NOT NULL DEFAULT GETDATE(),
        ExpectedDeliveryDate DATETIME2,
        Status NVARCHAR(20) NOT NULL DEFAULT 'Draft', -- Draft, Sent, Confirmed, Received, Cancelled
        SubTotal DECIMAL(18,2) NOT NULL,
        TaxAmount DECIMAL(18,2) DEFAULT 0,
        TotalAmount DECIMAL(18,2) NOT NULL,
        Notes NVARCHAR(MAX),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CreatedBy NVARCHAR(255) DEFAULT 'System',
        
        CONSTRAINT FK_PurchaseOrders_Supplier FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id)
    );

    CREATE INDEX IX_PurchaseOrders_SupplierId ON PurchaseOrders(SupplierId);
    CREATE INDEX IX_PurchaseOrders_OrderDate ON PurchaseOrders(OrderDate);
    CREATE INDEX IX_PurchaseOrders_Status ON PurchaseOrders(Status);

    PRINT 'PurchaseOrders table created successfully';
END
GO

-- =====================================================
-- 7. CREATE PURCHASE ORDER ITEMS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PurchaseOrderItems' AND xtype='U')
BEGIN
    CREATE TABLE PurchaseOrderItems (
        Id NVARCHAR(50) PRIMARY KEY,
        PurchaseOrderId NVARCHAR(50) NOT NULL,
        ToyId NVARCHAR(50) NOT NULL,
        Quantity INT NOT NULL,
        UnitCost DECIMAL(18,2) NOT NULL,
        TotalCost DECIMAL(18,2) NOT NULL,
        ReceivedQuantity INT DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_PurchaseOrderItems_PurchaseOrder FOREIGN KEY (PurchaseOrderId) REFERENCES PurchaseOrders(Id) ON DELETE CASCADE,
        CONSTRAINT FK_PurchaseOrderItems_Toy FOREIGN KEY (ToyId) REFERENCES Toys(Id)
    );

    CREATE INDEX IX_PurchaseOrderItems_PurchaseOrderId ON PurchaseOrderItems(PurchaseOrderId);
    CREATE INDEX IX_PurchaseOrderItems_ToyId ON PurchaseOrderItems(ToyId);

    PRINT 'PurchaseOrderItems table created successfully';
END
GO

-- =====================================================
-- 8. ADD SUPPLIER RELATIONSHIP TO TOYS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Toys') AND name = 'SupplierId')
BEGIN
    ALTER TABLE Toys ADD SupplierId NVARCHAR(50);
    ALTER TABLE Toys ADD CONSTRAINT FK_Toys_Supplier FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id);
    CREATE INDEX IX_Toys_SupplierId ON Toys(SupplierId);
    
    PRINT 'SupplierId column added to Toys table';
END
GO

-- =====================================================
-- 9. CREATE PROMOTIONS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Promotions' AND xtype='U')
BEGIN
    CREATE TABLE Promotions (
        Id NVARCHAR(50) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX),
        Code NVARCHAR(50) UNIQUE,
        DiscountType NVARCHAR(20) NOT NULL, -- Percentage, FixedAmount
        DiscountValue DECIMAL(18,2) NOT NULL,
        MinOrderAmount DECIMAL(18,2) DEFAULT 0,
        MaxDiscountAmount DECIMAL(18,2),
        StartDate DATETIME2 NOT NULL,
        EndDate DATETIME2 NOT NULL,
        UsageLimit INT,
        UsedCount INT DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_Promotions_Code ON Promotions(Code);
    CREATE INDEX IX_Promotions_StartDate ON Promotions(StartDate);
    CREATE INDEX IX_Promotions_EndDate ON Promotions(EndDate);
    CREATE INDEX IX_Promotions_IsActive ON Promotions(IsActive);

    PRINT 'Promotions table created successfully';
END
GO

-- =====================================================
-- 10. CREATE WISHLIST TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Wishlist' AND xtype='U')
BEGIN
    CREATE TABLE Wishlist (
        Id NVARCHAR(50) PRIMARY KEY,
        CustomerId NVARCHAR(50) NOT NULL,
        ToyId NVARCHAR(50) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_Wishlist_Customer FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Wishlist_Toy FOREIGN KEY (ToyId) REFERENCES Toys(Id) ON DELETE CASCADE,
        CONSTRAINT UK_Wishlist_Customer_Toy UNIQUE (CustomerId, ToyId)
    );

    CREATE INDEX IX_Wishlist_CustomerId ON Wishlist(CustomerId);
    CREATE INDEX IX_Wishlist_ToyId ON Wishlist(ToyId);

    PRINT 'Wishlist table created successfully';
END
GO

-- =====================================================
-- 11. INSERT SAMPLE SUPPLIERS
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM Suppliers)
BEGIN
    INSERT INTO Suppliers (Id, Name, ContactPerson, Email, Phone, Address, City, Country, Website, Rating) VALUES
    ('sup-001', N'Công ty TNHH Đồ chơi Việt Nam', N'Nguyễn Văn A', 'contact@toyvietnam.com', '0901234567', N'123 Đường ABC, Quận 1', N'Hồ Chí Minh', N'Việt Nam', 'https://toyvietnam.com', 4.5),
    ('sup-002', N'Global Toys Import Co.', N'John Smith', 'sales@globaltoys.com', '+1-555-0123', N'456 Main Street', N'New York', N'USA', 'https://globaltoys.com', 4.8),
    ('sup-003', N'Asian Toy Manufacturing', N'李小明', 'info@asiantoys.cn', '+86-138-0013-8000', N'789 Industrial Road', N'Guangzhou', N'China', 'https://asiantoys.cn', 4.2),
    ('sup-004', N'European Toy Distributors', N'Hans Mueller', 'orders@eurotoys.de', '+49-30-12345678', N'Berliner Str. 100', N'Berlin', N'Germany', 'https://eurotoys.de', 4.6),
    ('sup-005', N'Eco-Friendly Toys Ltd', N'Sarah Johnson', 'hello@ecotoys.co.uk', '+44-20-7946-0958', N'Green Park Lane 25', N'London', N'UK', 'https://ecotoys.co.uk', 4.9);

    PRINT 'Sample suppliers inserted successfully';
END
GO

-- =====================================================
-- 12. INSERT SAMPLE CUSTOMERS
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM Customers)
BEGIN
    INSERT INTO Customers (Id, FirstName, LastName, Email, Phone, Address, City, Country, CustomerType, TotalSpent, TotalOrders) VALUES
    ('cust-001', N'Nguyễn', N'Thị Lan', 'lan.nguyen@email.com', '0987654321', N'456 Đường XYZ, Quận 3', N'Hồ Chí Minh', N'Việt Nam', 'VIP', 5500000, 8),
    ('cust-002', N'Trần', N'Văn Minh', 'minh.tran@email.com', '0912345678', N'789 Đường DEF, Quận 7', N'Hồ Chí Minh', N'Việt Nam', 'Regular', 2300000, 3),
    ('cust-003', N'Lê', N'Thị Hoa', 'hoa.le@email.com', '0923456789', N'321 Đường GHI, Ba Đình', N'Hà Nội', N'Việt Nam', 'Regular', 1800000, 2),
    ('cust-004', N'Phạm', N'Văn Đức', 'duc.pham@email.com', '0934567890', N'654 Đường JKL, Hải Châu', N'Đà Nẵng', N'Việt Nam', 'Wholesale', 12500000, 15),
    ('cust-005', N'Hoàng', N'Thị Mai', 'mai.hoang@email.com', '0945678901', N'987 Đường MNO, Ninh Kiều', N'Cần Thơ', N'Việt Nam', 'Regular', 950000, 1);

    PRINT 'Sample customers inserted successfully';
END
GO

-- =====================================================
-- 13. CREATE ENHANCED STORED PROCEDURES
-- =====================================================

-- Procedure to get dashboard statistics
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetDashboardStats')
    DROP PROCEDURE sp_GetDashboardStats;
GO

CREATE PROCEDURE sp_GetDashboardStats
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        -- Product Statistics
        (SELECT COUNT(*) FROM Toys WHERE IsActive = 1) as TotalProducts,
        (SELECT COUNT(*) FROM Toys WHERE IsActive = 1 AND Status = 'active') as ActiveProducts,
        (SELECT COUNT(*) FROM Toys WHERE IsActive = 1 AND Stock <= 5) as LowStockProducts,
        (SELECT COUNT(*) FROM Toys WHERE IsActive = 1 AND IsNew = 1) as NewProducts,

        -- Order Statistics
        (SELECT COUNT(*) FROM Orders WHERE CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)) as TodayOrders,
        (SELECT COUNT(*) FROM Orders WHERE CreatedAt >= DATEADD(DAY, -7, GETDATE())) as WeekOrders,
        (SELECT COUNT(*) FROM Orders WHERE CreatedAt >= DATEADD(MONTH, -1, GETDATE())) as MonthOrders,
        (SELECT COALESCE(SUM(TotalAmount), 0) FROM Orders WHERE CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)) as TodayRevenue,

        -- Customer Statistics
        (SELECT COUNT(*) FROM Customers WHERE IsActive = 1) as TotalCustomers,
        (SELECT COUNT(*) FROM Customers WHERE CreatedAt >= DATEADD(DAY, -7, GETDATE())) as NewCustomersThisWeek,

        -- Inventory Statistics
        (SELECT COALESCE(SUM(Stock), 0) FROM Toys WHERE IsActive = 1) as TotalStock,
        (SELECT COALESCE(AVG(Rating), 0) FROM Toys WHERE IsActive = 1) as AvgRating,

        -- Supplier Statistics
        (SELECT COUNT(*) FROM Suppliers WHERE IsActive = 1) as TotalSuppliers,
        (SELECT COUNT(*) FROM PurchaseOrders WHERE Status = 'Sent') as PendingPurchaseOrders;
END
GO

-- Procedure to get low stock report
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetLowStockReport')
    DROP PROCEDURE sp_GetLowStockReport;
GO

CREATE PROCEDURE sp_GetLowStockReport
    @MinStock INT = 5
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        t.Id,
        t.Name,
        t.Stock,
        t.Status,
        c.Name as CategoryName,
        b.Name as BrandName,
        s.Name as SupplierName,
        s.Email as SupplierEmail,
        s.Phone as SupplierPhone,
        t.Price,
        t.UpdatedAt
    FROM Toys t
    INNER JOIN ToyCategories c ON t.CategoryId = c.Id
    INNER JOIN ToyBrands b ON t.BrandId = b.Id
    LEFT JOIN Suppliers s ON t.SupplierId = s.Id
    WHERE t.Stock <= @MinStock
        AND t.IsActive = 1
        AND t.Status = 'active'
    ORDER BY t.Stock ASC, t.Name;
END
GO

-- Procedure to get sales report
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetSalesReport')
    DROP PROCEDURE sp_GetSalesReport;
GO

CREATE PROCEDURE sp_GetSalesReport
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL,
    @GroupBy NVARCHAR(20) = 'Day' -- Day, Week, Month
AS
BEGIN
    SET NOCOUNT ON;

    IF @StartDate IS NULL SET @StartDate = DATEADD(MONTH, -1, GETDATE());
    IF @EndDate IS NULL SET @EndDate = GETDATE();

    IF @GroupBy = 'Day'
    BEGIN
        SELECT
            CAST(o.CreatedAt AS DATE) as Period,
            COUNT(o.Id) as OrderCount,
            SUM(o.TotalAmount) as Revenue,
            AVG(o.TotalAmount) as AvgOrderValue,
            SUM(oi.Quantity) as ItemsSold
        FROM Orders o
        LEFT JOIN OrderItems oi ON o.Id = oi.OrderId
        WHERE o.CreatedAt BETWEEN @StartDate AND @EndDate
            AND o.Status != 'Cancelled'
        GROUP BY CAST(o.CreatedAt AS DATE)
        ORDER BY Period DESC;
    END
    ELSE IF @GroupBy = 'Week'
    BEGIN
        SELECT
            DATEPART(YEAR, o.CreatedAt) as Year,
            DATEPART(WEEK, o.CreatedAt) as Week,
            COUNT(o.Id) as OrderCount,
            SUM(o.TotalAmount) as Revenue,
            AVG(o.TotalAmount) as AvgOrderValue,
            SUM(oi.Quantity) as ItemsSold
        FROM Orders o
        LEFT JOIN OrderItems oi ON o.Id = oi.OrderId
        WHERE o.CreatedAt BETWEEN @StartDate AND @EndDate
            AND o.Status != 'Cancelled'
        GROUP BY DATEPART(YEAR, o.CreatedAt), DATEPART(WEEK, o.CreatedAt)
        ORDER BY Year DESC, Week DESC;
    END
    ELSE IF @GroupBy = 'Month'
    BEGIN
        SELECT
            DATEPART(YEAR, o.CreatedAt) as Year,
            DATEPART(MONTH, o.CreatedAt) as Month,
            COUNT(o.Id) as OrderCount,
            SUM(o.TotalAmount) as Revenue,
            AVG(o.TotalAmount) as AvgOrderValue,
            SUM(oi.Quantity) as ItemsSold
        FROM Orders o
        LEFT JOIN OrderItems oi ON o.Id = oi.OrderId
        WHERE o.CreatedAt BETWEEN @StartDate AND @EndDate
            AND o.Status != 'Cancelled'
        GROUP BY DATEPART(YEAR, o.CreatedAt), DATEPART(MONTH, o.CreatedAt)
        ORDER BY Year DESC, Month DESC;
    END
END
GO

PRINT 'Enhanced stored procedures created successfully';

-- =====================================================
-- 14. CREATE ENHANCED TRIGGERS
-- =====================================================

-- Trigger to update customer statistics when orders change
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_UpdateCustomerStats')
    DROP TRIGGER tr_UpdateCustomerStats;
GO

CREATE TRIGGER tr_UpdateCustomerStats
ON Orders
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Update customer statistics for affected customers
    WITH CustomerStats AS (
        SELECT
            CustomerId,
            COUNT(*) as TotalOrders,
            SUM(TotalAmount) as TotalSpent,
            MAX(OrderDate) as LastOrderDate
        FROM Orders
        WHERE Status != 'Cancelled'
        GROUP BY CustomerId
    )
    UPDATE c
    SET
        TotalOrders = COALESCE(cs.TotalOrders, 0),
        TotalSpent = COALESCE(cs.TotalSpent, 0),
        LastOrderDate = cs.LastOrderDate,
        UpdatedAt = GETDATE()
    FROM Customers c
    LEFT JOIN CustomerStats cs ON c.Id = cs.CustomerId
    WHERE c.Id IN (
        SELECT DISTINCT CustomerId FROM inserted
        UNION
        SELECT DISTINCT CustomerId FROM deleted
    );
END
GO

-- Trigger to create inventory transactions when orders are placed
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_CreateInventoryTransaction')
    DROP TRIGGER tr_CreateInventoryTransaction;
GO

CREATE TRIGGER tr_CreateInventoryTransaction
ON OrderItems
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Create inventory transactions for new order items
    INSERT INTO InventoryTransactions (
        Id, ToyId, TransactionType, Quantity, ReferenceId, ReferenceType, CreatedAt
    )
    SELECT
        NEWID(),
        i.ToyId,
        'Sale',
        -i.Quantity, -- Negative for outgoing stock
        i.OrderId,
        'Order',
        GETDATE()
    FROM inserted i;

    -- Update toy stock
    UPDATE t
    SET
        Stock = t.Stock - i.Quantity,
        UpdatedAt = GETDATE()
    FROM Toys t
    INNER JOIN inserted i ON t.Id = i.ToyId;
END
GO

-- Trigger to update toy stock when purchase orders are received
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_UpdateStockFromPurchase')
    DROP TRIGGER tr_UpdateStockFromPurchase;
GO

CREATE TRIGGER tr_UpdateStockFromPurchase
ON PurchaseOrderItems
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Only process when ReceivedQuantity is updated
    IF UPDATE(ReceivedQuantity)
    BEGIN
        -- Calculate the difference in received quantity
        WITH StockUpdates AS (
            SELECT
                i.ToyId,
                i.ReceivedQuantity - d.ReceivedQuantity as QuantityDiff,
                i.PurchaseOrderId,
                i.UnitCost
            FROM inserted i
            INNER JOIN deleted d ON i.Id = d.Id
            WHERE i.ReceivedQuantity != d.ReceivedQuantity
        )
        -- Update toy stock
        UPDATE t
        SET
            Stock = t.Stock + su.QuantityDiff,
            UpdatedAt = GETDATE()
        FROM Toys t
        INNER JOIN StockUpdates su ON t.Id = su.ToyId
        WHERE su.QuantityDiff > 0;

        -- Create inventory transactions
        INSERT INTO InventoryTransactions (
            Id, ToyId, TransactionType, Quantity, UnitCost, TotalCost,
            ReferenceId, ReferenceType, CreatedAt
        )
        SELECT
            NEWID(),
            su.ToyId,
            'Purchase',
            su.QuantityDiff,
            su.UnitCost,
            su.QuantityDiff * su.UnitCost,
            su.PurchaseOrderId,
            'PurchaseOrder',
            GETDATE()
        FROM (
            SELECT
                i.ToyId,
                i.ReceivedQuantity - d.ReceivedQuantity as QuantityDiff,
                i.PurchaseOrderId,
                i.UnitCost
            FROM inserted i
            INNER JOIN deleted d ON i.Id = d.Id
            WHERE i.ReceivedQuantity != d.ReceivedQuantity
        ) su
        WHERE su.QuantityDiff > 0;
    END
END
GO

PRINT 'Enhanced triggers created successfully';

-- =====================================================
-- 15. CREATE VIEWS FOR REPORTING
-- =====================================================

-- View for product performance
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_ProductPerformance')
    DROP VIEW vw_ProductPerformance;
GO

CREATE VIEW vw_ProductPerformance AS
SELECT
    t.Id,
    t.Name,
    t.Price,
    t.Stock,
    t.Rating,
    t.ReviewCount,
    c.Name as CategoryName,
    b.Name as BrandName,
    s.Name as SupplierName,
    COALESCE(sales.TotalSold, 0) as TotalSold,
    COALESCE(sales.Revenue, 0) as Revenue,
    COALESCE(sales.OrderCount, 0) as OrderCount,
    t.CreatedAt
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
LEFT JOIN Suppliers s ON t.SupplierId = s.Id
LEFT JOIN (
    SELECT
        oi.ToyId,
        SUM(oi.Quantity) as TotalSold,
        SUM(oi.TotalPrice) as Revenue,
        COUNT(DISTINCT oi.OrderId) as OrderCount
    FROM OrderItems oi
    INNER JOIN Orders o ON oi.OrderId = o.Id
    WHERE o.Status != 'Cancelled'
    GROUP BY oi.ToyId
) sales ON t.Id = sales.ToyId
WHERE t.IsActive = 1;
GO

PRINT 'Views created successfully';

-- =====================================================
-- ENHANCED SCHEMA CREATION COMPLETED
-- =====================================================
PRINT '==============================================';
PRINT 'ENHANCED TOY MANAGEMENT DATABASE SCHEMA CREATED SUCCESSFULLY!';
PRINT '==============================================';
PRINT 'New Tables Added:';
PRINT '- Suppliers (5 sample suppliers)';
PRINT '- Customers (5 sample customers)';
PRINT '- Orders (order management)';
PRINT '- OrderItems (order line items)';
PRINT '- InventoryTransactions (stock tracking)';
PRINT '- PurchaseOrders (supplier orders)';
PRINT '- PurchaseOrderItems (purchase line items)';
PRINT '- Promotions (discount management)';
PRINT '- Wishlist (customer wishlists)';
PRINT '';
PRINT 'Enhanced Stored Procedures:';
PRINT '- sp_GetDashboardStats (comprehensive dashboard data)';
PRINT '- sp_GetLowStockReport (inventory alerts)';
PRINT '- sp_GetSalesReport (sales analytics)';
PRINT '';
PRINT 'Enhanced Triggers:';
PRINT '- tr_UpdateCustomerStats (auto-update customer data)';
PRINT '- tr_CreateInventoryTransaction (stock tracking)';
PRINT '- tr_UpdateStockFromPurchase (purchase receiving)';
PRINT '';
PRINT 'Views:';
PRINT '- vw_ProductPerformance (product analytics)';
PRINT '';
PRINT 'Features Added:';
PRINT '✅ Complete Order Management System';
PRINT '✅ Customer Relationship Management';
PRINT '✅ Supplier Management';
PRINT '✅ Purchase Order System';
PRINT '✅ Inventory Tracking & Transactions';
PRINT '✅ Promotion & Discount Management';
PRINT '✅ Customer Wishlist';
PRINT '✅ Advanced Reporting & Analytics';
PRINT '✅ Automated Stock Updates';
PRINT '✅ Dashboard Statistics';
PRINT '';
PRINT 'Ready for complete toy management operations!';
PRINT '==============================================';
GO
