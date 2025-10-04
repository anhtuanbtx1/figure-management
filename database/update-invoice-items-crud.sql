USE zen50558_ManagementStore;
GO

-- Recalculate totals helper
IF OBJECT_ID('sp_RecalculateInvoiceTotalsFromItems', 'P') IS NOT NULL
    DROP PROCEDURE sp_RecalculateInvoiceTotalsFromItems;
GO
CREATE PROCEDURE sp_RecalculateInvoiceTotalsFromItems
    @InvoiceId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SubTotal DECIMAL(18,2) = 0, @VAT DECIMAL(18,2) = 0, @GrandTotal DECIMAL(18,2) = 0;

    SELECT @SubTotal = ISNULL(SUM(UnitTotalPrice), 0)
    FROM zen50558_ManagementStore.dbo.InvoiceItems
    WHERE InvoiceId = @InvoiceId AND IsActive = 1;

    SET @VAT = @SubTotal * 0.1; -- default 10%
    SET @GrandTotal = @SubTotal + @VAT;

    UPDATE zen50558_ManagementStore.dbo.Invoices
    SET SubTotal = @SubTotal,
        VAT = @VAT,
        GrandTotal = @GrandTotal,
        UpdatedAt = GETDATE()
    WHERE Id = @InvoiceId;

    SELECT * FROM zen50558_ManagementStore.dbo.Invoices WHERE Id = @InvoiceId;
END
GO

-- Update item
IF OBJECT_ID('sp_UpdateInvoiceItemFromFrontend', 'P') IS NOT NULL
    DROP PROCEDURE sp_UpdateInvoiceItemFromFrontend;
GO
CREATE PROCEDURE sp_UpdateInvoiceItemFromFrontend
    @ItemId NVARCHAR(50),
    @ItemName NVARCHAR(255),
    @UnitPrice DECIMAL(18,2),
    @Units INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE zen50558_ManagementStore.dbo.InvoiceItems
    SET ItemName = @ItemName,
        UnitPrice = @UnitPrice,
        Units = @Units,
        UpdatedAt = GETDATE()
    WHERE Id = @ItemId;

    DECLARE @InvoiceId NVARCHAR(50);
    SELECT @InvoiceId = InvoiceId FROM zen50558_ManagementStore.dbo.InvoiceItems WHERE Id = @ItemId;

    EXEC sp_RecalculateInvoiceTotalsFromItems @InvoiceId;
END
GO

-- Delete item (soft delete)
IF OBJECT_ID('sp_DeleteInvoiceItemFromFrontend', 'P') IS NOT NULL
    DROP PROCEDURE sp_DeleteInvoiceItemFromFrontend;
GO
CREATE PROCEDURE sp_DeleteInvoiceItemFromFrontend
    @ItemId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @InvoiceId NVARCHAR(50);
    SELECT @InvoiceId = InvoiceId FROM zen50558_ManagementStore.dbo.InvoiceItems WHERE Id = @ItemId;

    UPDATE zen50558_ManagementStore.dbo.InvoiceItems
    SET IsActive = 0,
        UpdatedAt = GETDATE()
    WHERE Id = @ItemId;

    EXEC sp_RecalculateInvoiceTotalsFromItems @InvoiceId;
END
GO

-- Alter Add item to recalc totals as well
IF OBJECT_ID('sp_AddInvoiceItemFromFrontend', 'P') IS NOT NULL
    DROP PROCEDURE sp_AddInvoiceItemFromFrontend;
GO
CREATE PROCEDURE sp_AddInvoiceItemFromFrontend
    @InvoiceId NVARCHAR(50),
    @ItemName NVARCHAR(255),
    @UnitPrice DECIMAL(18,2),
    @Units INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO zen50558_ManagementStore.dbo.InvoiceItems (
        InvoiceId, ItemName, UnitPrice, Units, IsActive, CreatedAt, UpdatedAt
    ) VALUES (
        @InvoiceId,
        @ItemName,
        @UnitPrice,
        @Units,
        1,
        GETDATE(),
        GETDATE()
    );

    EXEC sp_RecalculateInvoiceTotalsFromItems @InvoiceId;
END
GO
