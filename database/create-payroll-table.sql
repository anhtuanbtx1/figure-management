-- =====================================================
-- PAYROLL TABLE SCHEMA
-- Luu tru danh sach bang luong nhan su
-- Database: ManagementStore
-- Schema: dbo
-- =====================================================

USE ManagementStore;
GO

PRINT '==============================================';
PRINT 'CREATING PAYROLL TABLE';
PRINT '==============================================';
PRINT '';

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Payrolls]') AND type = N'U')
BEGIN
    CREATE TABLE [dbo].[Payrolls] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [EmployeeCode] NVARCHAR(50) NOT NULL,
        [EmployeeName] NVARCHAR(255) NOT NULL,
        [Salary] DECIMAL(18,2) NOT NULL,
        [PayrollPeriod] DATE NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),

        CONSTRAINT [CK_Payrolls_Salary] CHECK ([Salary] >= 0),
        CONSTRAINT [UQ_Payrolls_EmployeeCode_PayrollPeriod] UNIQUE ([EmployeeCode], [PayrollPeriod])
    );

    CREATE INDEX [IX_Payrolls_PayrollPeriod] ON [dbo].[Payrolls]([PayrollPeriod]);
    CREATE INDEX [IX_Payrolls_EmployeeCode] ON [dbo].[Payrolls]([EmployeeCode]);
    CREATE INDEX [IX_Payrolls_EmployeeName] ON [dbo].[Payrolls]([EmployeeName]);

    PRINT 'Created table: dbo.Payrolls';
END
ELSE
BEGIN
    PRINT 'Table dbo.Payrolls already exists';

    IF EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'dbo'
          AND TABLE_NAME = 'Payrolls'
          AND COLUMN_NAME = 'EmployeeCode'
          AND DATA_TYPE <> 'nvarchar'
    )
    BEGIN
        ALTER TABLE [dbo].[Payrolls] ALTER COLUMN [EmployeeCode] NVARCHAR(50) NOT NULL;
        PRINT 'Altered column dbo.Payrolls.EmployeeCode to NVARCHAR(50)';
    END

    IF EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'dbo'
          AND TABLE_NAME = 'Payrolls'
          AND COLUMN_NAME = 'EmployeeName'
          AND DATA_TYPE <> 'nvarchar'
    )
    BEGIN
        ALTER TABLE [dbo].[Payrolls] ALTER COLUMN [EmployeeName] NVARCHAR(255) NOT NULL;
        PRINT 'Altered column dbo.Payrolls.EmployeeName to NVARCHAR(255)';
    END
END
GO

PRINT '';
PRINT '==============================================';
PRINT 'PAYROLL TABLE SETUP COMPLETED';
PRINT '==============================================';
PRINT '';

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'Payrolls'
ORDER BY ORDINAL_POSITION;
GO
