-- =============================================
-- Create Count Stored Procedure for Toys
-- =============================================
-- This procedure counts toys with filters for accurate pagination
-- Author: Agent Mode
-- Date: 2025-08-25
-- =============================================

USE zen50558_ManagementStore;
GO

PRINT '';
PRINT '==============================================';
PRINT 'CREATING TOYS COUNT STORED PROCEDURE';
PRINT '==============================================';
PRINT '';

-- Drop existing procedure if it exists
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_GetToysCountForFrontend')
BEGIN
    DROP PROCEDURE sp_GetToysCountForFrontend;
    PRINT '🗑️ Dropped existing sp_GetToysCountForFrontend';
END
GO

-- Create the count stored procedure
PRINT '🔧 Creating sp_GetToysCountForFrontend...';
GO

CREATE PROCEDURE sp_GetToysCountForFrontend
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
    
    -- Return count of toys matching the filters
    SELECT COUNT(*) as total
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

PRINT '✅ sp_GetToysCountForFrontend created successfully';
PRINT '';

-- Test the new procedure
PRINT '🧪 Testing the count procedure...';
PRINT '';

-- Test 1: Count all active toys
BEGIN TRY
    DECLARE @totalCount INT;
    DECLARE @result TABLE (total INT);
    
    INSERT INTO @result
    EXEC sp_GetToysCountForFrontend;
    
    SELECT @totalCount = total FROM @result;
    PRINT '✅ Test 1 - Count all active toys: ' + CAST(@totalCount AS NVARCHAR(10)) + ' toys found';
END TRY
BEGIN CATCH
    PRINT '❌ Test 1 failed: ' + ERROR_MESSAGE();
END CATCH

-- Test 2: Count toys with search filter
BEGIN TRY
    DECLARE @searchCount INT;
    DECLARE @result2 TABLE (total INT);
    
    INSERT INTO @result2
    EXEC sp_GetToysCountForFrontend @Search = 'Robot';
    
    SELECT @searchCount = total FROM @result2;
    PRINT '✅ Test 2 - Count toys with search "Robot": ' + CAST(@searchCount AS NVARCHAR(10)) + ' toys found';
END TRY
BEGIN CATCH
    PRINT '❌ Test 2 failed: ' + ERROR_MESSAGE();
END CATCH

-- Test 3: Count toys with price filter
BEGIN TRY
    DECLARE @priceCount INT;
    DECLARE @result3 TABLE (total INT);
    
    INSERT INTO @result3
    EXEC sp_GetToysCountForFrontend @MinPrice = 100000, @MaxPrice = 500000;
    
    SELECT @priceCount = total FROM @result3;
    PRINT '✅ Test 3 - Count toys with price 100,000-500,000: ' + CAST(@priceCount AS NVARCHAR(10)) + ' toys found';
END TRY
BEGIN CATCH
    PRINT '❌ Test 3 failed: ' + ERROR_MESSAGE();
END CATCH

-- Test 4: Count toys in stock
BEGIN TRY
    DECLARE @stockCount INT;
    DECLARE @result4 TABLE (total INT);
    
    INSERT INTO @result4
    EXEC sp_GetToysCountForFrontend @InStock = 1;
    
    SELECT @stockCount = total FROM @result4;
    PRINT '✅ Test 4 - Count toys in stock: ' + CAST(@stockCount AS NVARCHAR(10)) + ' toys found';
END TRY
BEGIN CATCH
    PRINT '❌ Test 4 failed: ' + ERROR_MESSAGE();
END CATCH

PRINT '';
PRINT '==============================================';
PRINT 'TOYS COUNT PROCEDURE CREATION COMPLETED';
PRINT '==============================================';
PRINT '';
PRINT 'ℹ️ Notes:';
PRINT '  - The procedure sp_GetToysCountForFrontend is now available';
PRINT '  - It accepts the same filter parameters as sp_GetToysForFrontend';
PRINT '  - It returns only the total count, not paginated data';
PRINT '  - This is more efficient for pagination calculations';
PRINT '';
PRINT '📝 To use in the API:';
PRINT '  - Call sp_GetToysCountForFrontend for counting';
PRINT '  - Call sp_GetToysForFrontend for paginated data';
PRINT '  - This ensures accurate pagination totals';
GO
