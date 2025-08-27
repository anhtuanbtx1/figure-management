-- =====================================================
-- Invoices Schema & Stored Procedures for Frontend
-- Database: zen50558_ManagementStore
-- Author: Augment Agent
-- Date: 2025-08-27
-- =====================================================
USE zen50558_ManagementStore;
GO

PRINT '🚀 Creating Invoices schema and procedures...';
PRINT '';

-- ========================
-- 1) Tables
-- ========================
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'Invoices' AND type = 'U')
BEGIN
    CREATE TABLE zen50558_ManagementStore.dbo.Invoices (
        Id NVARCHAR(50) NOT NULL PRIMARY KEY,
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
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Shipped, Delivered, Cancelled
        Notes NVARCHAR(MAX) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
        UpdatedAt DATETIME NOT NULL DEFAULT(GETDATE())
    );
    PRINT '✅ Created table Invoices';
END
ELSE
BEGIN
    PRINT 'ℹ️ Table Invoices already exists';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'InvoiceItems' AND type = 'U')
BEGIN
    CREATE TABLE zen50558_ManagementStore.dbo.InvoiceItems (
        Id NVARCHAR(50) NOT NULL PRIMARY KEY,
        InvoiceId NVARCHAR(50) NOT NULL,
        ItemName NVARCHAR(255) NOT NULL,
        UnitPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
        Units INT NOT NULL DEFAULT 1,
        UnitTotalPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
        UpdatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
        CONSTRAINT FK_InvoiceItems_Invoices FOREIGN KEY (InvoiceId)
            REFERENCES zen50558_ManagementStore.dbo.Invoices(Id)
            ON DELETE CASCADE
    );
    PRINT '✅ Created table InvoiceItems';
END
ELSE
BEGIN
    PRINT 'ℹ️ Table InvoiceItems already exists';
END
GO

-- ========================
-- 2) Helper function to recalc totals
-- ========================
IF OBJECT_ID('sp_RecalculateInvoiceTotals', 'P') IS NOT NULL
    DROP PROCEDURE sp_RecalculateInvoiceTotals;
GO
CREATE PROCEDURE sp_RecalculateInvoiceTotals
    @InvoiceId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @SubTotal DECIMAL(18,2) = 0, @VAT DECIMAL(18,2) = 0, @GrandTotal DECIMAL(18,2) = 0;

    SELECT @SubTotal = ISNULL(SUM(UnitTotalPrice), 0)
    FROM zen50558_ManagementStore.dbo.InvoiceItems
    WHERE InvoiceId = @InvoiceId AND IsActive = 1;

    -- Keep VAT as stored; if you want derive VAT from rate, adapt here
    SELECT @VAT = VAT FROM zen50558_ManagementStore.dbo.Invoices WHERE Id = @InvoiceId;

    SET @GrandTotal = @SubTotal + ISNULL(@VAT,0);

    UPDATE zen50558_ManagementStore.dbo.Invoices
    SET SubTotal = @SubTotal,
        GrandTotal = @GrandTotal,
        UpdatedAt = GETDATE()
    WHERE Id = @InvoiceId;
END
GO

-- ========================
-- 3) Get Invoices for Frontend (paging/filter/sort)
-- ========================
IF OBJECT_ID('sp_GetInvoicesForFrontend', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetInvoicesForFrontend;
GO
CREATE PROCEDURE sp_GetInvoicesForFrontend
    @Search NVARCHAR(255) = NULL,
    @Status NVARCHAR(50) = NULL,
    @DateFrom DATETIME = NULL,
    @DateTo DATETIME = NULL,
    @Page INT = 1,
    @PageSize INT = 10,
    @SortField NVARCHAR(50) = 'CreatedAt',
    @SortDirection NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    IF @Page < 1 SET @Page = 1;
    IF @PageSize < 1 OR @PageSize > 100 SET @PageSize = 10;
    IF @SortDirection NOT IN ('ASC', 'DESC') SET @SortDirection = 'DESC';

    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    ;WITH Filtered AS (
        SELECT 
            i.Id,
            i.InvoiceNumber,
            i.BillFrom, i.BillFromEmail, i.BillFromAddress, i.BillFromPhone, i.BillFromFax,
            i.BillTo, i.BillToEmail, i.BillToAddress, i.BillToPhone, i.BillToFax,
            i.OrderDate, i.SubTotal, i.VAT, i.GrandTotal, i.Status, i.Notes,
            i.IsActive, i.CreatedAt, i.UpdatedAt,
            COUNT(1) OVER() AS TotalCount
        FROM zen50558_ManagementStore.dbo.Invoices i
        WHERE i.IsActive = 1
          AND (@Search IS NULL OR @Search = '' OR 
               i.InvoiceNumber LIKE '%' + @Search + '%' OR
               i.BillFrom LIKE '%' + @Search + '%' OR
               i.BillTo LIKE '%' + @Search + '%')
          AND (@Status IS NULL OR @Status = '' OR i.Status = @Status)
          AND (@DateFrom IS NULL OR i.OrderDate >= @DateFrom)
          AND (@DateTo IS NULL OR i.OrderDate < DATEADD(DAY, 1, @DateTo))
    )
    SELECT *
    FROM Filtered
    ORDER BY 
        CASE WHEN @SortField = 'InvoiceNumber' AND @SortDirection = 'ASC' THEN InvoiceNumber END ASC,
        CASE WHEN @SortField = 'InvoiceNumber' AND @SortDirection = 'DESC' THEN InvoiceNumber END DESC,
        CASE WHEN @SortField = 'OrderDate' AND @SortDirection = 'ASC' THEN OrderDate END ASC,
        CASE WHEN @SortField = 'OrderDate' AND @SortDirection = 'DESC' THEN OrderDate END DESC,
        CASE WHEN @SortField = 'GrandTotal' AND @SortDirection = 'ASC' THEN GrandTotal END ASC,
        CASE WHEN @SortField = 'GrandTotal' AND @SortDirection = 'DESC' THEN GrandTotal END DESC,
        CASE WHEN @SortField = 'CreatedAt' AND @SortDirection = 'ASC' THEN CreatedAt END ASC,
        CASE WHEN @SortField = 'CreatedAt' AND @SortDirection = 'DESC' THEN CreatedAt END DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- ========================
-- 4) Create Invoice (header + items)
-- ========================
IF OBJECT_ID('sp_CreateInvoiceFromFrontend', 'P') IS NOT NULL
    DROP PROCEDURE sp_CreateInvoiceFromFrontend;
GO
CREATE PROCEDURE sp_CreateInvoiceFromFrontend
    @InvoiceNumber NVARCHAR(50),
    @BillFrom NVARCHAR(255),
    @BillFromEmail NVARCHAR(255) = NULL,
    @BillFromAddress NVARCHAR(500) = NULL,
    @BillFromPhone NVARCHAR(50) = NULL,
    @BillFromFax NVARCHAR(50) = NULL,
    @BillTo NVARCHAR(255),
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
    BEGIN TRY
        BEGIN TRANSACTION;

        IF @OrderDate IS NULL SET @OrderDate = GETDATE();

        DECLARE @NewId NVARCHAR(50) = 'inv-' + REPLACE(CAST(NEWID() AS NVARCHAR(36)), '-', '');

        INSERT INTO zen50558_ManagementStore.dbo.Invoices (
            Id, InvoiceNumber, BillFrom, BillFromEmail, BillFromAddress, BillFromPhone, BillFromFax,
            BillTo, BillToEmail, BillToAddress, BillToPhone, BillToFax, OrderDate, SubTotal, VAT, GrandTotal, Status, Notes, IsActive, CreatedAt, UpdatedAt
        ) VALUES (
            @NewId, @InvoiceNumber, @BillFrom, @BillFromEmail, @BillFromAddress, @BillFromPhone, @BillFromFax,
            @BillTo, @BillToEmail, @BillToAddress, @BillToPhone, @BillToFax, @OrderDate, 0, @VAT, 0, @Status, @Notes, 1, GETDATE(), GETDATE()
        );

        -- Return created invoice
        SELECT * FROM zen50558_ManagementStore.dbo.Invoices WHERE Id = @NewId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- ========================
-- 5) Update Invoice (header only)
-- ========================
IF OBJECT_ID('sp_UpdateInvoiceFromFrontend', 'P') IS NOT NULL
    DROP PROCEDURE sp_UpdateInvoiceFromFrontend;
GO
CREATE PROCEDURE sp_UpdateInvoiceFromFrontend
    @Id NVARCHAR(50),
    @InvoiceNumber NVARCHAR(50),
    @BillFrom NVARCHAR(255),
    @BillFromEmail NVARCHAR(255) = NULL,
    @BillFromAddress NVARCHAR(500) = NULL,
    @BillFromPhone NVARCHAR(50) = NULL,
    @BillFromFax NVARCHAR(50) = NULL,
    @BillTo NVARCHAR(255),
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
    UPDATE zen50558_ManagementStore.dbo.Invoices
    SET InvoiceNumber = @InvoiceNumber,
        BillFrom = @BillFrom,
        BillFromEmail = @BillFromEmail,
        BillFromAddress = @BillFromAddress,
        BillFromPhone = @BillFromPhone,
        BillFromFax = @BillFromFax,
        BillTo = @BillTo,
        BillToEmail = @BillToEmail,
        BillToAddress = @BillToAddress,
        BillToPhone = @BillToPhone,
        BillToFax = @BillToFax,
        OrderDate = ISNULL(@OrderDate, OrderDate),
        VAT = @VAT,
        Status = @Status,
        Notes = @Notes,
        UpdatedAt = GETDATE()
    WHERE Id = @Id AND IsActive = 1;

    -- Return updated invoice
    SELECT * FROM zen50558_ManagementStore.dbo.Invoices WHERE Id = @Id;
END
GO

-- ========================
-- 6) Delete Invoice (soft delete) + cascade items
-- ========================
IF OBJECT_ID('sp_DeleteInvoiceFromFrontend', 'P') IS NOT NULL
    DROP PROCEDURE sp_DeleteInvoiceFromFrontend;
GO
CREATE PROCEDURE sp_DeleteInvoiceFromFrontend
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE zen50558_ManagementStore.dbo.Invoices
    SET IsActive = 0, UpdatedAt = GETDATE()
    WHERE Id = @Id AND IsActive = 1;

    -- Also soft-delete items
    UPDATE zen50558_ManagementStore.dbo.InvoiceItems
    SET IsActive = 0, UpdatedAt = GETDATE()
    WHERE InvoiceId = @Id AND IsActive = 1;

    -- Return affected Id
    SELECT @Id AS DeletedId;
END
GO

PRINT '✅ Invoices schema & procedures created successfully.';

