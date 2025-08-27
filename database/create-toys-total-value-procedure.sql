-- =====================================================
-- CREATE STORED PROCEDURE FOR TOYS TOTAL VALUE
-- =====================================================
-- This procedure calculates the total value (SUM of Price) of toys
-- with optional filters similar to other toy procedures
-- Author: AI Assistant
-- Date: 2025-08-27
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '🚀 Creating stored procedure for toys total value calculation...';
PRINT '';

-- Drop existing procedure if it exists
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_GetToysTotalValueForFrontend')
BEGIN
    DROP PROCEDURE sp_GetToysTotalValueForFrontend;
    PRINT '🗑️ Dropped existing sp_GetToysTotalValueForFrontend';
END
GO

-- Create the total value stored procedure
PRINT '🔧 Creating sp_GetToysTotalValueForFrontend...';
GO

CREATE PROCEDURE sp_GetToysTotalValueForFrontend
    @Search NVARCHAR(255) = NULL,
    @CategoryId NVARCHAR(50) = NULL,
    @BrandName NVARCHAR(255) = NULL,
    @Status NVARCHAR(20) = NULL,
    @MinPrice DECIMAL(18,2) = NULL,
    @MaxPrice DECIMAL(18,2) = NULL,
    @AgeRange NVARCHAR(50) = NULL,
    @InStock BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Calculate total value of toys matching the filters
    SELECT 
        ISNULL(SUM(t.Price), 0) as totalValue,
        COUNT(*) as totalCount,
        ISNULL(AVG(t.Price), 0) as averagePrice,
        ISNULL(MIN(t.Price), 0) as minPrice,
        ISNULL(MAX(t.Price), 0) as maxPrice
    FROM zen50558_ManagementStore.dbo.Toys t
    LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
    LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
    WHERE t.IsActive = 1
        -- Apply filters only if provided
        AND (@Search IS NULL OR @Search = '' OR t.Name LIKE '%' + @Search + '%' OR t.Description LIKE '%' + @Search + '%')
        AND (@CategoryId IS NULL OR @CategoryId = '' OR t.CategoryId = @CategoryId)
        AND (@BrandName IS NULL OR @BrandName = '' OR b.Name = @BrandName)
        AND (@Status IS NULL OR @Status = '' OR t.Status = @Status)
        AND (@MinPrice IS NULL OR t.Price >= @MinPrice)
        AND (@MaxPrice IS NULL OR t.Price <= @MaxPrice)
        AND (@AgeRange IS NULL OR @AgeRange = '' OR t.AgeRange LIKE '%' + @AgeRange + '%')
        AND (@InStock IS NULL OR @InStock = 0 OR t.Stock > 0);
END
GO

PRINT '✅ sp_GetToysTotalValueForFrontend created successfully';
PRINT '';

-- Test the new procedure
PRINT '🧪 Testing the total value procedure...';
PRINT '';

-- Test 1: Get total value of all active toys
BEGIN TRY
    DECLARE @totalValue DECIMAL(18,2);
    DECLARE @totalCount INT;
    DECLARE @avgPrice DECIMAL(18,2);
    DECLARE @result TABLE (
        totalValue DECIMAL(18,2),
        totalCount INT,
        averagePrice DECIMAL(18,2),
        minPrice DECIMAL(18,2),
        maxPrice DECIMAL(18,2)
    );
    
    INSERT INTO @result
    EXEC sp_GetToysTotalValueForFrontend;
    
    SELECT 
        @totalValue = totalValue,
        @totalCount = totalCount,
        @avgPrice = averagePrice
    FROM @result;
    
    PRINT '✅ Test 1 - Total value of all active toys:';
    PRINT '   Total Value: ' + FORMAT(@totalValue, 'N0', 'vi-VN') + ' VNĐ';
    PRINT '   Total Count: ' + CAST(@totalCount AS NVARCHAR(10)) + ' toys';
    PRINT '   Average Price: ' + FORMAT(@avgPrice, 'N0', 'vi-VN') + ' VNĐ';
END TRY
BEGIN CATCH
    PRINT '❌ Test 1 failed: ' + ERROR_MESSAGE();
END CATCH

PRINT '';

-- Test 2: Get total value with status filter
BEGIN TRY
    DECLARE @result2 TABLE (
        totalValue DECIMAL(18,2),
        totalCount INT,
        averagePrice DECIMAL(18,2),
        minPrice DECIMAL(18,2),
        maxPrice DECIMAL(18,2)
    );
    
    INSERT INTO @result2
    EXEC sp_GetToysTotalValueForFrontend @Status = 'active';
    
    SELECT 
        @totalValue = totalValue,
        @totalCount = totalCount
    FROM @result2;
    
    PRINT '✅ Test 2 - Total value of active status toys:';
    PRINT '   Total Value: ' + FORMAT(@totalValue, 'N0', 'vi-VN') + ' VNĐ';
    PRINT '   Total Count: ' + CAST(@totalCount AS NVARCHAR(10)) + ' toys';
END TRY
BEGIN CATCH
    PRINT '❌ Test 2 failed: ' + ERROR_MESSAGE();
END CATCH

PRINT '';

-- Test 3: Get total value with price range filter
BEGIN TRY
    DECLARE @result3 TABLE (
        totalValue DECIMAL(18,2),
        totalCount INT,
        averagePrice DECIMAL(18,2),
        minPrice DECIMAL(18,2),
        maxPrice DECIMAL(18,2)
    );
    
    INSERT INTO @result3
    EXEC sp_GetToysTotalValueForFrontend @MinPrice = 100000, @MaxPrice = 1000000;
    
    SELECT 
        @totalValue = totalValue,
        @totalCount = totalCount
    FROM @result3;
    
    PRINT '✅ Test 3 - Total value of toys between 100K-1M VNĐ:';
    PRINT '   Total Value: ' + FORMAT(@totalValue, 'N0', 'vi-VN') + ' VNĐ';
    PRINT '   Total Count: ' + CAST(@totalCount AS NVARCHAR(10)) + ' toys';
END TRY
BEGIN CATCH
    PRINT '❌ Test 3 failed: ' + ERROR_MESSAGE();
END CATCH

PRINT '';
PRINT '🎉 Stored procedure creation and testing completed!';
PRINT '';
PRINT 'Usage examples:';
PRINT '  -- Get total value of all active toys:';
PRINT '  EXEC sp_GetToysTotalValueForFrontend;';
PRINT '';
PRINT '  -- Get total value with filters:';
PRINT '  EXEC sp_GetToysTotalValueForFrontend @Status = ''active'', @MinPrice = 100000;';
PRINT '';
