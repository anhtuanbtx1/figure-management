USE ManagementStore;
GO

PRINT '==============================================';
PRINT 'CREATING PAYROLL SAVE PROCEDURE';
PRINT '==============================================';
PRINT '';

IF OBJECT_ID(N'[dbo].[sp_SavePayrollImport]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[sp_SavePayrollImport];
GO

CREATE PROCEDURE [dbo].[sp_SavePayrollImport]
    @PayrollPeriod DATE,
    @RowsJson NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    IF @PayrollPeriod IS NULL
    BEGIN
        RAISERROR(N'PayrollPeriod khong duoc de trong.', 16, 1);
        RETURN;
    END;

    IF @RowsJson IS NULL OR LTRIM(RTRIM(@RowsJson)) = N''
    BEGIN
        RAISERROR(N'Danh sach payroll du lieu dau vao dang rong.', 16, 1);
        RETURN;
    END;

    DECLARE @ParsedRows TABLE (
        EmployeeCode NVARCHAR(50) NOT NULL,
        EmployeeName NVARCHAR(255) NOT NULL,
        Salary DECIMAL(18,2) NOT NULL
    );

    INSERT INTO @ParsedRows (EmployeeCode, EmployeeName, Salary)
    SELECT
        CAST(LEFT(LTRIM(RTRIM(ISNULL([code], N''))), 50) AS NVARCHAR(50)) AS EmployeeCode,
        CAST(LEFT(LTRIM(RTRIM(ISNULL([name], N''))), 255) AS NVARCHAR(255)) AS EmployeeName,
        ISNULL(TRY_CONVERT(DECIMAL(18,2), [salary]), 0) AS Salary
    FROM OPENJSON(@RowsJson)
    WITH (
        [code] NVARCHAR(50) '$.code',
        [name] NVARCHAR(255) '$.name',
        [salary] DECIMAL(18,2) '$.salary'
    );

    DELETE FROM @ParsedRows
    WHERE EmployeeCode = N'' OR EmployeeName = N'';

    IF NOT EXISTS (SELECT 1 FROM @ParsedRows)
    BEGIN
        RAISERROR(N'Khong co dong payroll hop le de luu vao database.', 16, 1);
        RETURN;
    END;

    ;WITH DedupedRows AS (
        SELECT
            EmployeeCode,
            MAX(EmployeeName) AS EmployeeName,
            MAX(Salary) AS Salary
        FROM @ParsedRows
        GROUP BY EmployeeCode
    )
    MERGE [dbo].[Payrolls] AS Target
    USING DedupedRows AS Source
        ON Target.EmployeeCode = Source.EmployeeCode
       AND Target.PayrollPeriod = @PayrollPeriod
    WHEN MATCHED THEN
        UPDATE SET
            Target.EmployeeName = CAST(Source.EmployeeName AS NVARCHAR(255)),
            Target.Salary = Source.Salary,
            Target.UpdatedAt = GETDATE()
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (EmployeeCode, EmployeeName, Salary, PayrollPeriod, CreatedAt, UpdatedAt)
        VALUES (
            CAST(Source.EmployeeCode AS NVARCHAR(50)),
            CAST(Source.EmployeeName AS NVARCHAR(255)),
            Source.Salary,
            @PayrollPeriod,
            GETDATE(),
            GETDATE()
        );

    SELECT
        COUNT(*) AS savedRows,
        ISNULL(SUM(Salary), 0) AS totalSalary,
        CONVERT(NVARCHAR(10), @PayrollPeriod, 23) AS payrollPeriod
    FROM [dbo].[Payrolls]
    WHERE PayrollPeriod = @PayrollPeriod;
END
GO

PRINT 'Created procedure: dbo.sp_SavePayrollImport';
GO
