USE ManagementStore;
GO

PRINT '==============================================';
PRINT 'CREATING PAYROLL LIST PROCEDURE';
PRINT '==============================================';
PRINT '';

IF OBJECT_ID(N'[dbo].[sp_GetPayrollList]', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[sp_GetPayrollList];
GO

CREATE PROCEDURE [dbo].[sp_GetPayrollList]
    @Code NVARCHAR(50) = NULL,
    @Name NVARCHAR(255) = NULL,
    @SalaryKeyword NVARCHAR(50) = NULL,
    @PayrollPeriod DATE = NULL,
    @Page INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    IF @Page < 1 SET @Page = 1;
    IF @PageSize < 1 SET @PageSize = 10;
    IF @PageSize > 100 SET @PageSize = 100;

    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    ;WITH FilteredPayrolls AS (
        SELECT
            [Id] AS id,
            [EmployeeCode] AS code,
            [EmployeeName] AS name,
            [Salary] AS salary,
            [PayrollPeriod] AS payrollPeriod,
            [CreatedAt] AS createdAt,
            [UpdatedAt] AS updatedAt
        FROM [dbo].[Payrolls]
        WHERE (@Code IS NULL OR [EmployeeCode] LIKE '%' + @Code + '%')
          AND (@Name IS NULL OR [EmployeeName] LIKE '%' + @Name + '%')
          AND (
                @SalaryKeyword IS NULL
                OR CONVERT(NVARCHAR(50), CONVERT(BIGINT, [Salary])) LIKE '%' + @SalaryKeyword + '%'
              )
          AND (@PayrollPeriod IS NULL OR [PayrollPeriod] = @PayrollPeriod)
    )
    SELECT
        id,
        code,
        name,
        salary,
        payrollPeriod,
        createdAt,
        updatedAt,
        COUNT(*) OVER() AS totalCount,
        SUM(salary) OVER() AS totalSalary
    FROM FilteredPayrolls
    ORDER BY payrollPeriod DESC, code ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

PRINT 'Created procedure: dbo.sp_GetPayrollList';
GO
