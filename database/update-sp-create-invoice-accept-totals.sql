USE zen50558_ManagementStore;
GO

-- Update sp_CreateInvoiceFromFrontend to accept SubTotal & GrandTotal
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
    @SubTotal DECIMAL(18,2) = 0,
    @VAT DECIMAL(18,2) = 0,
    @GrandTotal DECIMAL(18,2) = 0,
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
            @BillTo, @BillToEmail, @BillToAddress, @BillToPhone, @BillToFax, @OrderDate, @SubTotal, @VAT, @GrandTotal, @Status, @Notes, 1, GETDATE(), GETDATE()
        );

        SELECT * FROM zen50558_ManagementStore.dbo.Invoices WHERE Id = @NewId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

