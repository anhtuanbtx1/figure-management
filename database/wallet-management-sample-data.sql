-- =====================================================
-- ULTRA SIMPLE WALLET MOCKUP DATA (MATCHES UI EXACTLY)
-- Minimal data matching the UI mockup requirements
-- =====================================================

USE ManagementStore;
GO

PRINT '==============================================';
PRINT 'INSERTING ULTRA SIMPLE WALLET MOCKUP DATA';
PRINT '==============================================';
PRINT '';

-- =====================================================
-- 1. WALLET CATEGORIES (MATCHES MOCKUP DROPDOWN)
-- =====================================================
PRINT 'ðŸ“‚ Inserting Categories (matches mockup dropdown)...';

-- Clear existing data
DELETE FROM ManagementStore.dbo.WalletCategories;

-- Categories matching the mockup exactly
INSERT INTO ManagementStore.dbo.WalletCategories (Id, Name, Type, Color) VALUES
-- Thu nháº­p
('cat-luong', N'LÆ°Æ¡ng', N'Thu nháº­p', '#4CAF50'),
('cat-thuong', N'ThÆ°á»Ÿng', N'Thu nháº­p', '#8BC34A'),
('cat-khac', N'KhÃ¡c', N'Thu nháº­p', '#CDDC39'),

-- Chi tiÃªu
('cat-an-uong', N'Ä‚n uá»‘ng', N'Chi tiÃªu', '#FF5722'),
('cat-di-chuyen', N'Di chuyá»ƒn', N'Chi tiÃªu', '#2196F3'),
('cat-mua-sam', N'Mua sáº¯m', N'Chi tiÃªu', '#E91E63'),
('cat-hoa-don', N'HÃ³a Ä‘Æ¡n', N'Chi tiÃªu', '#FF9800'),

-- Chuyá»ƒn khoáº£n
('cat-chuyen-khoan', N'Chuyá»ƒn khoáº£n', N'Chuyá»ƒn khoáº£n', '#00BCD4');

PRINT 'âœ… Inserted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' categories (matches mockup)';

-- =====================================================
-- 2. WALLET TRANSACTIONS (MATCHES MOCKUP TABLE EXACTLY)
-- =====================================================
PRINT 'ðŸ’³ Inserting Transactions (matches mockup table)...';

-- Clear existing data
DELETE FROM ManagementStore.dbo.WalletTransactions;

-- Transactions matching the mockup table exactly
INSERT INTO ManagementStore.dbo.WalletTransactions (Id, Type, Amount, Description, CategoryId, TransactionDate, Status) VALUES
('txn-1', N'Thu nháº­p', 15000000, N'LÆ°Æ¡ng thÃ¡ng 12', 'cat-luong', '2024-01-02', N'HoÃ n thÃ nh'),
('txn-2', N'Chi tiÃªu', -500000, N'Ä‚n trÆ°a táº¡i nhÃ  hÃ ng', 'cat-an-uong', '2024-02-02', N'HoÃ n thÃ nh'),
('txn-3', N'Chi tiÃªu', -2000000, N'Mua quáº§n Ã¡o mÃ¹a Ä‘Ã´ng', 'cat-mua-sam', '2024-03-02', N'HoÃ n thÃ nh'),
('txn-4', N'Chuyá»ƒn khoáº£n', -5000000, N'Chuyá»ƒn khoáº£n cho máº¹', 'cat-chuyen-khoan', '2024-04-02', N'Äang chá»'),
('txn-5', N'Chi tiÃªu', -300000, N'XÄƒng xe', 'cat-di-chuyen', '2024-05-02', N'HoÃ n thÃ nh');

PRINT 'âœ… Inserted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' transactions (matches mockup table)';

PRINT '';
PRINT '==============================================';
PRINT 'ULTRA SIMPLE WALLET MOCKUP DATA COMPLETED';
PRINT '==============================================';
PRINT '';

-- Display summary
PRINT 'ðŸ“Š ULTRA SIMPLE MOCKUP SUMMARY (MATCHES UI):';
PRINT 'âœ… Categories: 8 categories (matches dropdown)';
PRINT 'âœ… Transactions: 5 sample transactions (matches table)';
PRINT '';
PRINT 'ðŸŽ¯ Perfect match with UI mockup!';
PRINT 'ðŸ’¡ Only what the form and table actually need!';
PRINT 'ðŸš€ Ready for immediate frontend development!';
GO

