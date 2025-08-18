-- =====================================================
-- WALLET MANAGEMENT API MAPPING
-- Stored Procedures for Frontend API Integration
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'CREATING WALLET MANAGEMENT API PROCEDURES';
PRINT '==============================================';
PRINT '';

-- =====================================================
-- 1. GET WALLET CATEGORIES FOR FRONTEND
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetWalletCategoriesForFrontend')
    DROP PROCEDURE sp_GetWalletCategoriesForFrontend;
GO

CREATE PROCEDURE sp_GetWalletCategoriesForFrontend
    @Type NVARCHAR(20) = NULL -- 'income', 'expense', 'transfer', or NULL for all
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id as id,
        Name as name,
        Slug as slug,
        Description as description,
        Icon as icon,
        Color as color,
        Type as type,
        CreatedAt as createdAt,
        UpdatedAt as updatedAt,
        IsActive as isActive
    FROM zen50558_ManagementStore.dbo.WalletCategories 
    WHERE IsActive = 1
        AND (@Type IS NULL OR Type = @Type)
    ORDER BY Type, Name;
END
GO

PRINT '✅ sp_GetWalletCategoriesForFrontend created';

-- =====================================================
-- 2. GET WALLET ACCOUNTS FOR FRONTEND
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetWalletAccountsForFrontend')
    DROP PROCEDURE sp_GetWalletAccountsForFrontend;
GO

CREATE PROCEDURE sp_GetWalletAccountsForFrontend
    @AccountType NVARCHAR(50) = NULL -- 'cash', 'bank', 'credit_card', 'e_wallet', 'investment', or NULL for all
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id as id,
        Name as name,
        AccountType as accountType,
        AccountNumber as accountNumber,
        BankName as bankName,
        Balance as balance,
        Currency as currency,
        Icon as icon,
        Color as color,
        Description as description,
        IsDefault as isDefault,
        CreatedAt as createdAt,
        UpdatedAt as updatedAt,
        IsActive as isActive
    FROM zen50558_ManagementStore.dbo.WalletAccounts 
    WHERE IsActive = 1
        AND (@AccountType IS NULL OR AccountType = @AccountType)
    ORDER BY IsDefault DESC, AccountType, Name;
END
GO

PRINT '✅ sp_GetWalletAccountsForFrontend created';

-- =====================================================
-- 3. GET WALLET TRANSACTIONS FOR FRONTEND
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetWalletTransactionsForFrontend')
    DROP PROCEDURE sp_GetWalletTransactionsForFrontend;
GO

CREATE PROCEDURE sp_GetWalletTransactionsForFrontend
    @Page INT = 1,
    @PageSize INT = 20,
    @Search NVARCHAR(255) = '',
    @Type NVARCHAR(20) = '', -- 'income', 'expense', 'transfer'
    @CategoryId NVARCHAR(50) = '',
    @AccountId NVARCHAR(50) = '',
    @Status NVARCHAR(20) = '', -- 'pending', 'completed', 'cancelled'
    @DateFrom DATETIME2 = NULL,
    @DateTo DATETIME2 = NULL,
    @SortField NVARCHAR(50) = 'TransactionDate',
    @SortDirection NVARCHAR(10) = 'desc'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    DECLARE @TotalCount INT;
    
    -- Build dynamic WHERE clause
    DECLARE @WhereClause NVARCHAR(MAX) = 'WHERE t.IsActive = 1';
    
    IF @Search != ''
        SET @WhereClause = @WhereClause + ' AND (t.Title LIKE ''%' + @Search + '%'' OR t.Description LIKE ''%' + @Search + '%'')';
    
    IF @Type != ''
        SET @WhereClause = @WhereClause + ' AND t.Type = ''' + @Type + '''';
    
    IF @CategoryId != ''
        SET @WhereClause = @WhereClause + ' AND t.CategoryId = ''' + @CategoryId + '''';
    
    IF @AccountId != ''
        SET @WhereClause = @WhereClause + ' AND (t.AccountId = ''' + @AccountId + ''' OR t.ToAccountId = ''' + @AccountId + ''')';
    
    IF @Status != ''
        SET @WhereClause = @WhereClause + ' AND t.Status = ''' + @Status + '''';
    
    IF @DateFrom IS NOT NULL
        SET @WhereClause = @WhereClause + ' AND t.TransactionDate >= ''' + CONVERT(NVARCHAR, @DateFrom, 120) + '''';
    
    IF @DateTo IS NOT NULL
        SET @WhereClause = @WhereClause + ' AND t.TransactionDate <= ''' + CONVERT(NVARCHAR, @DateTo, 120) + '''';
    
    -- Get total count
    DECLARE @CountQuery NVARCHAR(MAX) = '
        SELECT @TotalCount = COUNT(*)
        FROM zen50558_ManagementStore.dbo.WalletTransactions t ' + @WhereClause;
    
    EXEC sp_executesql @CountQuery, N'@TotalCount INT OUTPUT', @TotalCount OUTPUT;
    
    -- Build main query
    DECLARE @MainQuery NVARCHAR(MAX) = '
        SELECT 
            t.Id as id,
            t.Title as title,
            t.Description as description,
            t.Amount as amount,
            t.Type as type,
            t.CategoryId as categoryId,
            c.Name as categoryName,
            c.Icon as categoryIcon,
            c.Color as categoryColor,
            t.AccountId as accountId,
            a.Name as accountName,
            a.Icon as accountIcon,
            t.ToAccountId as toAccountId,
            ta.Name as toAccountName,
            ta.Icon as toAccountIcon,
            t.TransactionDate as transactionDate,
            t.Location as location,
            t.Notes as notes,
            t.Tags as tags,
            t.Receipt as receipt,
            t.Status as status,
            t.IsRecurring as isRecurring,
            t.RecurringType as recurringType,
            t.CreatedAt as createdAt,
            t.UpdatedAt as updatedAt
        FROM zen50558_ManagementStore.dbo.WalletTransactions t
        LEFT JOIN zen50558_ManagementStore.dbo.WalletCategories c ON t.CategoryId = c.Id
        LEFT JOIN zen50558_ManagementStore.dbo.WalletAccounts a ON t.AccountId = a.Id
        LEFT JOIN zen50558_ManagementStore.dbo.WalletAccounts ta ON t.ToAccountId = ta.Id
        ' + @WhereClause + '
        ORDER BY ' + @SortField + ' ' + @SortDirection + '
        OFFSET ' + CAST(@Offset AS NVARCHAR) + ' ROWS
        FETCH NEXT ' + CAST(@PageSize AS NVARCHAR) + ' ROWS ONLY';
    
    EXEC sp_executesql @MainQuery;
    
    -- Return pagination info
    SELECT 
        @Page as page,
        @PageSize as pageSize,
        @TotalCount as total,
        CEILING(CAST(@TotalCount AS FLOAT) / @PageSize) as totalPages;
END
GO

PRINT '✅ sp_GetWalletTransactionsForFrontend created';

-- =====================================================
-- 4. GET WALLET BUDGETS FOR FRONTEND
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetWalletBudgetsForFrontend')
    DROP PROCEDURE sp_GetWalletBudgetsForFrontend;
GO

CREATE PROCEDURE sp_GetWalletBudgetsForFrontend
    @Period NVARCHAR(20) = NULL -- 'monthly', 'weekly', 'yearly', or NULL for all
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        b.Id as id,
        b.Name as name,
        b.CategoryId as categoryId,
        c.Name as categoryName,
        c.Icon as categoryIcon,
        c.Color as categoryColor,
        b.Amount as amount,
        b.Period as period,
        b.StartDate as startDate,
        b.EndDate as endDate,
        b.SpentAmount as spentAmount,
        b.AlertThreshold as alertThreshold,
        CASE 
            WHEN b.Amount > 0 THEN ROUND((b.SpentAmount / b.Amount) * 100, 2)
            ELSE 0 
        END as usagePercentage,
        CASE 
            WHEN b.Amount > 0 AND (b.SpentAmount / b.Amount) * 100 >= b.AlertThreshold THEN 1
            ELSE 0 
        END as isOverThreshold,
        b.CreatedAt as createdAt,
        b.UpdatedAt as updatedAt,
        b.IsActive as isActive
    FROM zen50558_ManagementStore.dbo.WalletBudgets b
    LEFT JOIN zen50558_ManagementStore.dbo.WalletCategories c ON b.CategoryId = c.Id
    WHERE b.IsActive = 1
        AND (@Period IS NULL OR b.Period = @Period)
    ORDER BY b.Period, c.Name;
END
GO

PRINT '✅ sp_GetWalletBudgetsForFrontend created';

-- =====================================================
-- 5. GET WALLET GOALS FOR FRONTEND
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetWalletGoalsForFrontend')
    DROP PROCEDURE sp_GetWalletGoalsForFrontend;
GO

CREATE PROCEDURE sp_GetWalletGoalsForFrontend
    @Status NVARCHAR(20) = NULL -- 'active', 'completed', 'paused', or NULL for all
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        g.Id as id,
        g.Name as name,
        g.Description as description,
        g.TargetAmount as targetAmount,
        g.CurrentAmount as currentAmount,
        g.TargetDate as targetDate,
        g.AccountId as accountId,
        a.Name as accountName,
        a.Icon as accountIcon,
        g.Icon as icon,
        g.Color as color,
        g.Priority as priority,
        g.Status as status,
        CASE 
            WHEN g.TargetAmount > 0 THEN ROUND((g.CurrentAmount / g.TargetAmount) * 100, 2)
            ELSE 0 
        END as progressPercentage,
        g.TargetAmount - g.CurrentAmount as remainingAmount,
        CASE 
            WHEN g.TargetDate IS NOT NULL THEN DATEDIFF(DAY, GETDATE(), g.TargetDate)
            ELSE NULL 
        END as daysRemaining,
        g.CreatedAt as createdAt,
        g.UpdatedAt as updatedAt,
        g.IsActive as isActive
    FROM zen50558_ManagementStore.dbo.WalletGoals g
    LEFT JOIN zen50558_ManagementStore.dbo.WalletAccounts a ON g.AccountId = a.Id
    WHERE g.IsActive = 1
        AND (@Status IS NULL OR g.Status = @Status)
    ORDER BY 
        CASE g.Priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
            ELSE 4 
        END,
        g.TargetDate ASC;
END
GO

PRINT '✅ sp_GetWalletGoalsForFrontend created';

-- =====================================================
-- 6. GET WALLET DASHBOARD SUMMARY
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetWalletDashboardSummary')
    DROP PROCEDURE sp_GetWalletDashboardSummary;
GO

CREATE PROCEDURE sp_GetWalletDashboardSummary
    @DateFrom DATETIME2 = NULL,
    @DateTo DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Default to current month if no dates provided
    IF @DateFrom IS NULL
        SET @DateFrom = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);
    
    IF @DateTo IS NULL
        SET @DateTo = EOMONTH(GETDATE());
    
    -- Total balances by account type
    SELECT 
        'accountBalances' as section,
        AccountType as accountType,
        SUM(Balance) as totalBalance,
        COUNT(*) as accountCount
    FROM zen50558_ManagementStore.dbo.WalletAccounts
    WHERE IsActive = 1
    GROUP BY AccountType;
    
    -- Income vs Expense summary
    SELECT 
        'incomeExpense' as section,
        Type as type,
        SUM(Amount) as totalAmount,
        COUNT(*) as transactionCount,
        AVG(Amount) as averageAmount
    FROM zen50558_ManagementStore.dbo.WalletTransactions
    WHERE IsActive = 1 
        AND Status = 'completed'
        AND TransactionDate >= @DateFrom 
        AND TransactionDate <= @DateTo
        AND Type IN ('income', 'expense')
    GROUP BY Type;
    
    -- Top spending categories
    SELECT TOP 5
        'topCategories' as section,
        c.Name as categoryName,
        c.Icon as categoryIcon,
        c.Color as categoryColor,
        SUM(t.Amount) as totalAmount,
        COUNT(t.Id) as transactionCount
    FROM zen50558_ManagementStore.dbo.WalletTransactions t
    JOIN zen50558_ManagementStore.dbo.WalletCategories c ON t.CategoryId = c.Id
    WHERE t.IsActive = 1 
        AND t.Status = 'completed'
        AND t.Type = 'expense'
        AND t.TransactionDate >= @DateFrom 
        AND t.TransactionDate <= @DateTo
    GROUP BY c.Id, c.Name, c.Icon, c.Color
    ORDER BY SUM(t.Amount) DESC;
    
    -- Budget status
    SELECT 
        'budgetStatus' as section,
        b.Name as budgetName,
        c.Name as categoryName,
        b.Amount as budgetAmount,
        b.SpentAmount as spentAmount,
        b.AlertThreshold as alertThreshold,
        ROUND((b.SpentAmount / b.Amount) * 100, 2) as usagePercentage
    FROM zen50558_ManagementStore.dbo.WalletBudgets b
    JOIN zen50558_ManagementStore.dbo.WalletCategories c ON b.CategoryId = c.Id
    WHERE b.IsActive = 1
        AND b.StartDate <= GETDATE()
        AND b.EndDate >= GETDATE();
END
GO

PRINT '✅ sp_GetWalletDashboardSummary created';

PRINT '';
PRINT '==============================================';
PRINT 'WALLET API PROCEDURES CREATION COMPLETED';
PRINT '==============================================';
PRINT '';

-- Display summary
PRINT '📊 SUMMARY:';
PRINT '✅ sp_GetWalletCategoriesForFrontend - Get categories with filtering';
PRINT '✅ sp_GetWalletAccountsForFrontend - Get accounts with balances';
PRINT '✅ sp_GetWalletTransactionsForFrontend - Get transactions with pagination';
PRINT '✅ sp_GetWalletBudgetsForFrontend - Get budgets with usage tracking';
PRINT '✅ sp_GetWalletGoalsForFrontend - Get goals with progress calculation';
PRINT '✅ sp_GetWalletDashboardSummary - Get dashboard overview data';
PRINT '';
PRINT '🎯 Ready for frontend integration!';
GO
