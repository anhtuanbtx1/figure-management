-- =====================================================
-- ULTRA SIMPLE WALLET SCHEMA (MOCKUP BASED)
-- Minimal database schema matching the UI mockup exactly
-- =====================================================

-- Use the existing database
USE ManagementStore;
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
    CREATE TABLE ManagementStore.dbo.WalletCategories (
        Id NVARCHAR(50) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Type NVARCHAR(20) NOT NULL, -- 'income', 'expense', 'transfer'
        Color NVARCHAR(50),
        IsActive BIT NOT NULL DEFAULT 1
    );

    PRINT 'âœ… WalletCategories table created (ultra simple)';
END
ELSE
BEGIN
    PRINT 'âœ… WalletCategories table already exists';
END
GO

-- =====================================================
-- 2. WALLET TRANSACTIONS (ULTRA SIMPLE - MATCHES MOCKUP)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WalletTransactions' AND xtype='U')
BEGIN
    CREATE TABLE ManagementStore.dbo.WalletTransactions (
        Id NVARCHAR(50) PRIMARY KEY,
        Type NVARCHAR(20) NOT NULL, -- 'Thu nháº­p', 'Chi tiÃªu', 'Chuyá»ƒn khoáº£n'
        Amount DECIMAL(18,2) NOT NULL, -- Sá»‘ tiá»n
        Description NVARCHAR(500) NOT NULL, -- MÃ´ táº£
        CategoryId NVARCHAR(50) NOT NULL, -- Danh má»¥c
        TransactionDate DATETIME2 NOT NULL DEFAULT GETDATE(), -- NgÃ y
        Status NVARCHAR(20) NOT NULL DEFAULT 'HoÃ n thÃ nh', -- Tráº¡ng thÃ¡i
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        IsActive BIT NOT NULL DEFAULT 1,

        -- Foreign key
        CONSTRAINT FK_WalletTransactions_Category FOREIGN KEY (CategoryId) REFERENCES WalletCategories(Id)
    );

    PRINT 'âœ… WalletTransactions table created (ultra simple - matches mockup)';
END
ELSE
BEGIN
    PRINT 'âœ… WalletTransactions table already exists';
END
GO

PRINT '';
PRINT '==============================================';
PRINT 'ULTRA SIMPLE WALLET SCHEMA COMPLETED';
PRINT '==============================================';
PRINT '';

-- Display summary
PRINT 'ðŸ“Š ULTRA SIMPLE SCHEMA (MOCKUP BASED):';
PRINT 'âœ… WalletCategories - Danh má»¥c giao dá»‹ch';
PRINT 'âœ… WalletTransactions - Giao dá»‹ch (chá»‰ 7 fields cáº§n thiáº¿t)';
PRINT '';
PRINT 'ðŸŽ¯ Perfect match with UI mockup!';
PRINT 'ðŸ’¡ Removed: Accounts, Budgets, Goals, Complex relationships';
PRINT 'ðŸš€ Only what the UI actually needs!';
GO

