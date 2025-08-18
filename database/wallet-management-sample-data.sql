-- =====================================================
-- ULTRA SIMPLE WALLET MOCKUP DATA (MATCHES UI EXACTLY)
-- Minimal data matching the UI mockup requirements
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'INSERTING ULTRA SIMPLE WALLET MOCKUP DATA';
PRINT '==============================================';
PRINT '';

-- =====================================================
-- 1. WALLET CATEGORIES (MATCHES MOCKUP DROPDOWN)
-- =====================================================
PRINT '📂 Inserting Categories (matches mockup dropdown)...';

-- Clear existing data
DELETE FROM zen50558_ManagementStore.dbo.WalletCategories;

-- Categories matching the mockup exactly
INSERT INTO zen50558_ManagementStore.dbo.WalletCategories (Id, Name, Type, Color) VALUES
-- Thu nhập
('cat-luong', N'Lương', N'Thu nhập', '#4CAF50'),
('cat-thuong', N'Thưởng', N'Thu nhập', '#8BC34A'),
('cat-khac', N'Khác', N'Thu nhập', '#CDDC39'),

-- Chi tiêu
('cat-an-uong', N'Ăn uống', N'Chi tiêu', '#FF5722'),
('cat-di-chuyen', N'Di chuyển', N'Chi tiêu', '#2196F3'),
('cat-mua-sam', N'Mua sắm', N'Chi tiêu', '#E91E63'),
('cat-hoa-don', N'Hóa đơn', N'Chi tiêu', '#FF9800'),

-- Chuyển khoản
('cat-chuyen-khoan', N'Chuyển khoản', N'Chuyển khoản', '#00BCD4');

PRINT '✅ Inserted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' categories (matches mockup)';

-- =====================================================
-- 2. WALLET TRANSACTIONS (MATCHES MOCKUP TABLE EXACTLY)
-- =====================================================
PRINT '💳 Inserting Transactions (matches mockup table)...';

-- Clear existing data
DELETE FROM zen50558_ManagementStore.dbo.WalletTransactions;

-- Transactions matching the mockup table exactly
INSERT INTO zen50558_ManagementStore.dbo.WalletTransactions (Id, Type, Amount, Description, CategoryId, TransactionDate, Status) VALUES
('txn-1', N'Thu nhập', 15000000, N'Lương tháng 12', 'cat-luong', '2024-01-02', N'Hoàn thành'),
('txn-2', N'Chi tiêu', -500000, N'Ăn trưa tại nhà hàng', 'cat-an-uong', '2024-02-02', N'Hoàn thành'),
('txn-3', N'Chi tiêu', -2000000, N'Mua quần áo mùa đông', 'cat-mua-sam', '2024-03-02', N'Hoàn thành'),
('txn-4', N'Chuyển khoản', -5000000, N'Chuyển khoản cho mẹ', 'cat-chuyen-khoan', '2024-04-02', N'Đang chờ'),
('txn-5', N'Chi tiêu', -300000, N'Xăng xe', 'cat-di-chuyen', '2024-05-02', N'Hoàn thành');

PRINT '✅ Inserted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' transactions (matches mockup table)';

PRINT '';
PRINT '==============================================';
PRINT 'ULTRA SIMPLE WALLET MOCKUP DATA COMPLETED';
PRINT '==============================================';
PRINT '';

-- Display summary
PRINT '📊 ULTRA SIMPLE MOCKUP SUMMARY (MATCHES UI):';
PRINT '✅ Categories: 8 categories (matches dropdown)';
PRINT '✅ Transactions: 5 sample transactions (matches table)';
PRINT '';
PRINT '🎯 Perfect match with UI mockup!';
PRINT '💡 Only what the form and table actually need!';
PRINT '🚀 Ready for immediate frontend development!';
GO
