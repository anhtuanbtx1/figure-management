USE zen50558_ManagementStore;
GO

-- Set default VAT calc to 0% in recalc and create-with-items procedures

-- 1) Recalc totals SP
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

    SET @VAT = 0; -- default 0%
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

-- 2) Create with items SP
IF OBJECT_ID('sp_CreateInvoiceWithItemsFromFrontend', 'P') IS NOT NULL
    DROP PROCEDURE sp_CreateInvoiceWithItemsFromFrontend;
GO
CREATE PROCEDURE sp_CreateInvoiceWithItemsFromFrontend
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
    @Status NVARCHAR(50) = 'Pending',
    @Notes NVARCHAR(MAX) = NULL,
    @Items NVARCHAR(MAX)
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
            @BillTo, @BillToEmail, @BillToAddress, @BillToPhone, @BillToFax, @OrderDate, 0, 0, 0, @Status, @Notes, 1, GETDATE(), GETDATE()
        );

        IF (@Items IS NOT NULL AND LEN(@Items) > 0)
        BEGIN
            INSERT INTO zen50558_ManagementStore.dbo.InvoiceItems (Id, InvoiceId, ItemName, UnitPrice, Units, UnitTotalPrice, IsActive, CreatedAt, UpdatedAt)
            SELECT 
                'item-' + REPLACE(CAST(NEWID() AS NVARCHAR(36)), '-', ''),
                @NewId,
                JSON_VALUE(j.value, '$.itemName') AS ItemName,
                TRY_CONVERT(DECIMAL(18,2), JSON_VALUE(j.value, '$.unitPrice')) AS UnitPrice,
                TRY_CONVERT(INT, JSON_VALUE(j.value, '$.units')) AS Units,
                TRY_CONVERT(DECIMAL(18,2), JSON_VALUE(j.value, '$.unitPrice')) * TRY_CONVERT(INT, JSON_VALUE(j.value, '$.units')) AS UnitTotalPrice,
                1,
                GETDATE(),
                GETDATE()
            FROM OPENJSON(@Items) j;
        END

        DECLARE @SubTotal DECIMAL(18,2) = 0, @VAT DECIMAL(18,2) = 0, @GrandTotal DECIMAL(18,2) = 0;
        SELECT @SubTotal = ISNULL(SUM(UnitTotalPrice), 0)
        FROM zen50558_ManagementStore.dbo.InvoiceItems WHERE InvoiceId = @NewId AND IsActive = 1;

        SET @VAT = 0; -- default 0%
        SET @GrandTotal = @SubTotal + @VAT;

        UPDATE zen50558_ManagementStore.dbo.Invoices
        SET SubTotal = @SubTotal,
            VAT = @VAT,
            GrandTotal = @GrandTotal,
            UpdatedAt = GETDATE()
        WHERE Id = @NewId;

        SELECT * FROM zen50558_ManagementStore.dbo.Invoices WHERE Id = @NewId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

