-- =====================================================
-- ULTRA SIMPLE WALLET SCHEMA (MOCKUP BASED)
-- Minimal database schema matching the UI mockup exactly
-- =====================================================

-- Use the existing database
USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'CREATING ULTRA SIMPLE WALLET SCHEMA';
PRINT '==============================================';
PRINT '';

-- =====================================================
-- 1. WALLET CATEGORIES (ULTRA SIMPLE)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WalletCategories' AND xtype='U')
BEGIN
    CREATE TABLE zen50558_ManagementStore.dbo.WalletCategories (
        Id NVARCHAR(50) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Type NVARCHAR(20) NOT NULL, -- 'income', 'expense', 'transfer'
        Color NVARCHAR(50),
        IsActive BIT NOT NULL DEFAULT 1
    );

    PRINT '✅ WalletCategories table created (ultra simple)';
END
ELSE
BEGIN
    PRINT '✅ WalletCategories table already exists';
END
GO

-- =====================================================
-- 2. WALLET TRANSACTIONS (ULTRA SIMPLE - MATCHES MOCKUP)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WalletTransactions' AND xtype='U')
BEGIN
    CREATE TABLE zen50558_ManagementStore.dbo.WalletTransactions (
        Id NVARCHAR(50) PRIMARY KEY,
        Type NVARCHAR(20) NOT NULL, -- 'Thu nhập', 'Chi tiêu', 'Chuyển khoản'
        Amount DECIMAL(18,2) NOT NULL, -- Số tiền
        Description NVARCHAR(500) NOT NULL, -- Mô tả
        CategoryId NVARCHAR(50) NOT NULL, -- Danh mục
        TransactionDate DATETIME2 NOT NULL DEFAULT GETDATE(), -- Ngày
        Status NVARCHAR(20) NOT NULL DEFAULT 'Hoàn thành', -- Trạng thái
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        IsActive BIT NOT NULL DEFAULT 1,

        -- Foreign key
        CONSTRAINT FK_WalletTransactions_Category FOREIGN KEY (CategoryId) REFERENCES WalletCategories(Id)
    );

    PRINT '✅ WalletTransactions table created (ultra simple - matches mockup)';
END
ELSE
BEGIN
    PRINT '✅ WalletTransactions table already exists';
END
GO

PRINT '';
PRINT '==============================================';
PRINT 'ULTRA SIMPLE WALLET SCHEMA COMPLETED';
PRINT '==============================================';
PRINT '';

-- Display summary
PRINT '📊 ULTRA SIMPLE SCHEMA (MOCKUP BASED):';
PRINT '✅ WalletCategories - Danh mục giao dịch';
PRINT '✅ WalletTransactions - Giao dịch (chỉ 7 fields cần thiết)';
PRINT '';
PRINT '🎯 Perfect match with UI mockup!';
PRINT '💡 Removed: Accounts, Budgets, Goals, Complex relationships';
PRINT '🚀 Only what the UI actually needs!';
GO
