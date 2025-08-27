USE zen50558_ManagementStore;
GO

-- =====================================================
-- Invoice Items Procedures
-- =====================================================

-- 1) Add single invoice item
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
        Id, InvoiceId, ItemName, UnitPrice, Units, UnitTotalPrice, IsActive, CreatedAt, UpdatedAt
    ) VALUES (
        'item-' + REPLACE(CAST(NEWID() AS NVARCHAR(36)), '-', ''),
        @InvoiceId,
        @ItemName,
        @UnitPrice,
        @Units,
        @UnitPrice * @Units,
        1,
        GETDATE(),
        GETDATE()
    );

    SELECT SCOPE_IDENTITY() AS InsertedIdentity; -- placeholder return
END
GO

-- 2) Get invoice by Id (header only)
IF OBJECT_ID('sp_GetInvoiceByIdForFrontend', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetInvoiceByIdForFrontend;
GO
CREATE PROCEDURE sp_GetInvoiceByIdForFrontend
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.Id,
        i.InvoiceNumber,
        i.BillFrom, i.BillFromEmail, i.BillFromAddress, i.BillFromPhone, i.BillFromFax,
        i.BillTo, i.BillToEmail, i.BillToAddress, i.BillToPhone, i.BillToFax,
        i.OrderDate, i.SubTotal, i.VAT, i.GrandTotal, i.Status, i.Notes,
        i.IsActive, i.CreatedAt, i.UpdatedAt
    FROM zen50558_ManagementStore.dbo.Invoices i
    WHERE i.Id = @Id AND i.IsActive = 1;
END
GO

-- 3) Get invoice items by invoice id
IF OBJECT_ID('sp_GetInvoiceItemsByInvoiceIdForFrontend', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetInvoiceItemsByInvoiceIdForFrontend;
GO
CREATE PROCEDURE sp_GetInvoiceItemsByInvoiceIdForFrontend
    @InvoiceId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        it.Id,
        it.InvoiceId,
        it.ItemName,
        it.UnitPrice,
        it.Units,
        it.UnitTotalPrice,
        it.IsActive,
        it.CreatedAt,
        it.UpdatedAt
    FROM zen50558_ManagementStore.dbo.InvoiceItems it
    WHERE it.InvoiceId = @InvoiceId AND it.IsActive = 1
    ORDER BY it.CreatedAt ASC;
END
GO

