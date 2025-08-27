USE zen50558_ManagementStore;
GO

IF OBJECT_ID('sp_GetInvoiceGrandTotalSum', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetInvoiceGrandTotalSum;
GO
CREATE PROCEDURE sp_GetInvoiceGrandTotalSum
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CAST(ISNULL(SUM(GrandTotal), 0) AS DECIMAL(18,2)) AS TotalGrandTotal
    FROM zen50558_ManagementStore.dbo.Invoices WITH (NOLOCK)
    WHERE IsActive = 1;
END
GO

