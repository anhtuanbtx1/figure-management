-- =====================================================
-- Invoices Schema & Stored Procedures for Frontend (v2)
-- Key Changes:
-- 1. Invoices.Id is now INT IDENTITY(1,1) PRIMARY KEY.
-- 2. InvoiceItems.Id is INT IDENTITY, InvoiceId is INT.
-- 3. sp_CreateInvoiceFromFrontend no longer takes InvoiceNumber; it generates it.
-- 4. All procedures now use INT for Ids.
-- 5. InvoiceNumber remains NVARCHAR, as requested.
-- =====================================================
USE zen50558_ManagementStore;
GO

PRINT '🚀 Starting v2 update for Invoices schema and procedures...';
PRINT '';

-- Drop existing foreign key constraints and procedures before altering tables
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_InvoiceItems_Invoices')
BEGIN
    ALTER TABLE dbo.InvoiceItems DROP CONSTRAINT FK_InvoiceItems_Invoices;
    PRINT '✅ Dropped constraint FK_InvoiceItems_Invoices';
END
GO

-- Drop existing procedures
IF OBJECT_ID('sp_RecalculateInvoiceTotals', 'P') IS NOT NULL DROP PROCEDURE sp_RecalculateInvoiceTotals;
IF OBJECT_ID('sp_GetInvoicesForFrontend', 'P') IS NOT NULL DROP PROCEDURE sp_GetInvoicesForFrontend;
IF OBJECT_ID('sp_CreateInvoiceFromFrontend', 'P') IS NOT NULL DROP PROCEDURE sp_CreateInvoiceFromFrontend;
IF OBJECT_ID('sp_UpdateInvoiceFromFrontend', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateInvoiceFromFrontend;
IF OBJECT_ID('sp_DeleteInvoiceFromFrontend', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteInvoiceFromFrontend;
IF OBJECT_ID('dbo.sp_CreateInvoiceItem', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateInvoiceItem;
PRINT '✅ Dropped existing invoice-related stored procedures.';
GO

-- Drop tables if they exist to recreate them with new schema
-- NOTE: This will delete all existing data in these tables.
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'InvoiceItems' AND type = 'U')
BEGIN
    DROP TABLE dbo.InvoiceItems;
    PRINT '✅ Dropped table InvoiceItems';
END
GO

IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'Invoices' AND type = 'U')
BEGIN
    DROP TABLE dbo.Invoices;
    PRINT '✅ Dropped table Invoices';
END
GO


-- ========================
-- 1) Tables (Re-creation with INT IDs)
-- ========================
PRINT 'Re-creating tables with INT IDENTITY primary keys...';
CREATE TABLE dbo.Invoices (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    InvoiceNumber NVARCHAR(50) NOT NULL UNIQUE,
    BillFrom NVARCHAR(255) NOT NULL,
    BillFromEmail NVARCHAR(255) NULL,
    BillFromAddress NVARCHAR(500) NULL,
    BillFromPhone NVARCHAR(50) NULL,
    BillFromFax NVARCHAR(50) NULL,
    BillTo NVARCHAR(255) NOT NULL,
    BillToEmail NVARCHAR(255) NULL,
    BillToAddress NVARCHAR(500) NULL,
    BillToPhone NVARCHAR(50) NULL,
    BillToFax NVARCHAR(50) NULL,
    OrderDate DATETIME NOT NULL DEFAULT(GETDATE()),
    SubTotal DECIMAL(18,2) NOT NULL DEFAULT 0,
    VAT DECIMAL(18,2) NOT NULL DEFAULT 0,
    GrandTotal DECIMAL(18,2) NOT NULL DEFAULT 0,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    Notes NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    UpdatedAt DATETIME NOT NULL DEFAULT(GETDATE())
);
PRINT '✅ Created table Invoices with Id as INT IDENTITY.';
GO

CREATE TABLE dbo.InvoiceItems (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    InvoiceId INT NOT NULL,
    ItemName NVARCHAR(255) NOT NULL,
    ItemDescription NVARCHAR(1000) NULL,
    UnitPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    Units INT NOT NULL DEFAULT 1,
    -- UnitTotalPrice is calculated on insert via procedure
    UnitTotalPrice AS (ISNULL(UnitPrice, 0) * ISNULL(Units, 0)),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    UpdatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT FK_InvoiceItems_Invoices FOREIGN KEY (InvoiceId)
        REFERENCES dbo.Invoices(Id)
        ON DELETE CASCADE
);
PRINT '✅ Created table InvoiceItems with Id as INT IDENTITY and FK to Invoices.Id.';
GO

-- ========================
-- 2) Stored Procedures (Re-creation with INT IDs)
-- ========================

-- Create Invoice Header
CREATE PROCEDURE sp_CreateInvoiceFromFrontend
    @BillFrom NVARCHAR(255),
    @BillTo NVARCHAR(255),
    @BillFromEmail NVARCHAR(255) = NULL,
    @BillFromAddress NVARCHAR(500) = NULL,
    @BillFromPhone NVARCHAR(50) = NULL,
    @BillFromFax NVARCHAR(50) = NULL,
    @BillToEmail NVARCHAR(255) = NULL,
    @BillToAddress NVARCHAR(500) = NULL,
    @BillToPhone NVARCHAR(50) = NULL,
    @BillToFax NVARCHAR(50) = NULL,
    @OrderDate DATETIME = NULL,
    @VAT DECIMAL(18,2) = 0,
    @Status NVARCHAR(50) = 'Pending',
    @Notes NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Generate a unique InvoiceNumber
    DECLARE @NewInvoiceNumber NVARCHAR(50);
    SET @NewInvoiceNumber = CONCAT('INV-', FORMAT(GETDATE(), 'yyyyMMddHHmmss'), '-', RIGHT('0000' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS VARCHAR(4)), 4));

    IF @OrderDate IS NULL SET @OrderDate = GETDATE();

    DECLARE @OutputTable TABLE (Id INT, InvoiceNumber NVARCHAR(50));

    INSERT INTO dbo.Invoices (
        InvoiceNumber, BillFrom, BillFromEmail, BillFromAddress, BillFromPhone, BillFromFax,
        BillTo, BillToEmail, BillToAddress, BillToPhone, BillToFax,
        OrderDate, SubTotal, VAT, GrandTotal, Status, Notes
    )
    OUTPUT INSERTED.Id, INSERTED.InvoiceNumber INTO @OutputTable
    VALUES (
        @NewInvoiceNumber, @BillFrom, @BillFromEmail, @BillFromAddress, @BillFromPhone, @BillFromFax,
        @BillTo, @BillToEmail, @BillToAddress, @BillToPhone, @BillToFax,
        @OrderDate, 0, @VAT, @VAT, @Status, @Notes -- GrandTotal initially equals VAT
    );

    -- Return the new Id and InvoiceNumber
    SELECT Id, InvoiceNumber FROM @OutputTable;
END
GO
PRINT '✅ Created procedure sp_CreateInvoiceFromFrontend.';

-- Create Invoice Item
CREATE PROCEDURE sp_CreateInvoiceItem
    @InvoiceId INT,
    @ItemName NVARCHAR(255),
    @ItemDescription NVARCHAR(1000) = NULL,
    @UnitPrice DECIMAL(18, 2),
    @Units INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.InvoiceItems (InvoiceId, ItemName, ItemDescription, UnitPrice, Units)
    VALUES (@InvoiceId, @ItemName, @ItemDescription, @UnitPrice, @Units);

    -- After adding an item, recalculate totals for the invoice
    DECLARE @SubTotal DECIMAL(18, 2);
    SELECT @SubTotal = SUM(UnitTotalPrice) FROM dbo.InvoiceItems WHERE InvoiceId = @InvoiceId AND IsActive = 1;

    DECLARE @VAT DECIMAL(18, 2);
    SELECT @VAT = VAT FROM dbo.Invoices WHERE Id = @InvoiceId;

    UPDATE dbo.Invoices
    SET SubTotal = @SubTotal,
        GrandTotal = @SubTotal + @VAT,
        UpdatedAt = GETDATE()
    WHERE Id = @InvoiceId;

    SELECT @@IDENTITY AS NewInvoiceItemId;
END
GO
PRINT '✅ Created procedure sp_CreateInvoiceItem.';

-- Get Invoices (List)
CREATE PROCEDURE sp_GetInvoicesForFrontend
    @Search NVARCHAR(255) = NULL,
    @Status NVARCHAR(50) = NULL,
    @DateFrom DATE = NULL,
    @DateTo DATE = NULL,
    @Page INT = 1,
    @PageSize INT = 10,
    @SortField NVARCHAR(50) = 'CreatedAt',
    @SortDirection NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Pagination and sorting validation
    IF @Page < 1 SET @Page = 1;
    IF @PageSize < 1 OR @PageSize > 100 SET @PageSize = 10;
    IF ISNULL(@SortDirection, 'DESC') NOT IN ('ASC', 'DESC') SET @SortDirection = 'DESC';
    IF ISNULL(@SortField, 'CreatedAt') NOT IN ('InvoiceNumber', 'OrderDate', 'GrandTotal', 'Status', 'BillTo', 'CreatedAt') SET @SortField = 'CreatedAt';
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    SELECT
        i.Id,
        i.InvoiceNumber,
        i.BillFrom,
        i.BillTo,
        i.OrderDate,
        i.SubTotal,
        i.VAT,
        i.GrandTotal,
        i.Status,
        i.CreatedAt,
        (SELECT COUNT(*) FROM dbo.Invoices
            WHERE IsActive = 1
              AND (@Search IS NULL OR InvoiceNumber LIKE '%' + @Search + '%' OR BillTo LIKE '%' + @Search + '%')
              AND (@Status IS NULL OR Status = @Status)
              AND (@DateFrom IS NULL OR OrderDate >= @DateFrom)
              AND (@DateTo IS NULL OR OrderDate <= @DateTo)
        ) AS TotalCount
    FROM dbo.Invoices AS i
    WHERE i.IsActive = 1
      AND (@Search IS NULL OR i.InvoiceNumber LIKE '%' + @Search + '%' OR i.BillTo LIKE '%' + @Search + '%')
      AND (@Status IS NULL OR i.Status = @Status)
      AND (@DateFrom IS NULL OR i.OrderDate >= @DateFrom)
      AND (@DateTo IS NULL OR i.OrderDate <= @DateTo)
    ORDER BY
        CASE WHEN @SortField = 'InvoiceNumber' AND @SortDirection = 'ASC' THEN i.InvoiceNumber END ASC,
        CASE WHEN @SortField = 'InvoiceNumber' AND @SortDirection = 'DESC' THEN i.InvoiceNumber END DESC,
        CASE WHEN @SortField = 'OrderDate' AND @SortDirection = 'ASC' THEN i.OrderDate END ASC,
        CASE WHEN @SortField = 'OrderDate' AND @SortDirection = 'DESC' THEN i.OrderDate END DESC,
        CASE WHEN @SortField = 'GrandTotal' AND @SortDirection = 'ASC' THEN i.GrandTotal END ASC,
        CASE WHEN @SortField = 'GrandTotal' AND @SortDirection = 'DESC' THEN i.GrandTotal END DESC,
        CASE WHEN @SortField = 'Status' AND @SortDirection = 'ASC' THEN i.Status END ASC,
        CASE WHEN @SortField = 'Status' AND @SortDirection = 'DESC' THEN i.Status END DESC,
        CASE WHEN @SortField = 'BillTo' AND @SortDirection = 'ASC' THEN i.BillTo END ASC,
        CASE WHEN @SortField = 'BillTo' AND @SortDirection = 'DESC' THEN i.BillTo END DESC,
        CASE WHEN @SortField = 'CreatedAt' AND @SortDirection = 'ASC' THEN i.CreatedAt END ASC,
        CASE WHEN @SortField = 'CreatedAt' AND @SortDirection = 'DESC' THEN i.CreatedAt END DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO
PRINT '✅ Created procedure sp_GetInvoicesForFrontend.';

-- Delete Invoice (soft delete)
CREATE PROCEDURE sp_DeleteInvoiceFromFrontend
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Invoices
    SET IsActive = 0, UpdatedAt = GETDATE()
    WHERE Id = @Id;

    -- Also deactivate items
    UPDATE dbo.InvoiceItems
    SET IsActive = 0, UpdatedAt = GETDATE()
    WHERE InvoiceId = @Id;

    SELECT @Id AS DeletedId;
END
GO
PRINT '✅ Created procedure sp_DeleteInvoiceFromFrontend.';


PRINT '✅ v2 Invoices schema & procedures update completed successfully.';
