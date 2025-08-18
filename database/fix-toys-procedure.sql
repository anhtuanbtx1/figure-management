-- =====================================================
-- FIX TOYS STORED PROCEDURE
-- Simple version that should work with existing data
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'FIXING TOYS STORED PROCEDURE';
PRINT '==============================================';
PRINT '';

-- First, let's check what data we have
PRINT '🔍 Checking existing data...';

DECLARE @ToyCount INT, @CategoryCount INT, @BrandCount INT;
SELECT @ToyCount = COUNT(*) FROM zen50558_ManagementStore.dbo.Toys;
SELECT @CategoryCount = COUNT(*) FROM zen50558_ManagementStore.dbo.ToyCategories;
SELECT @BrandCount = COUNT(*) FROM zen50558_ManagementStore.dbo.ToyBrands;

PRINT 'Total Toys: ' + CAST(@ToyCount AS NVARCHAR(10));
PRINT 'Total Categories: ' + CAST(@CategoryCount AS NVARCHAR(10));
PRINT 'Total Brands: ' + CAST(@BrandCount AS NVARCHAR(10));

-- Check active toys
DECLARE @ActiveToys INT;
SELECT @ActiveToys = COUNT(*) FROM zen50558_ManagementStore.dbo.Toys WHERE IsActive = 1;
PRINT 'Active Toys: ' + CAST(@ActiveToys AS NVARCHAR(10));

-- Show sample toy data
PRINT '';
PRINT '📋 Sample toy data:';
SELECT TOP 1 
    Id, Name, CategoryId, BrandId, Price, Stock, Status, IsActive,
    CreatedAt, UpdatedAt
FROM zen50558_ManagementStore.dbo.Toys;

-- Check if categories and brands exist for the toy
PRINT '';
PRINT '🔗 Checking relationships:';
SELECT 
    t.Id as ToyId,
    t.Name as ToyName,
    t.CategoryId,
    c.Name as CategoryName,
    t.BrandId,
    b.Name as BrandName,
    t.IsActive as ToyActive,
    c.IsActive as CategoryActive,
    b.IsActive as BrandActive
FROM zen50558_ManagementStore.dbo.Toys t
LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id;

-- Create a simple version of the stored procedure
PRINT '';
PRINT '🔧 Creating simplified sp_GetToysForFrontend...';

-- Drop existing procedure if it exists
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_GetToysForFrontend')
BEGIN
    DROP PROCEDURE sp_GetToysForFrontend;
    PRINT '🗑️ Dropped existing sp_GetToysForFrontend';
END

-- Create new simplified procedure
CREATE PROCEDURE sp_GetToysForFrontend
    @Search NVARCHAR(255) = NULL,
    @CategoryId NVARCHAR(50) = NULL,
    @BrandName NVARCHAR(255) = NULL,
    @Status NVARCHAR(20) = NULL,
    @MinPrice DECIMAL(18,2) = NULL,
    @MaxPrice DECIMAL(18,2) = NULL,
    @AgeRange NVARCHAR(50) = NULL,
    @InStock BIT = NULL,
    @Page INT = 1,
    @PageSize INT = 20,
    @SortField NVARCHAR(50) = 'createdAt',
    @SortDirection NVARCHAR(4) = 'desc'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate parameters
    IF @Page < 1 SET @Page = 1;
    IF @PageSize < 1 OR @PageSize > 100 SET @PageSize = 20;
    IF @SortDirection NOT IN ('asc', 'desc') SET @SortDirection = 'desc';
    
    -- Calculate offset for pagination
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    
    -- Simple query without complex JSON formatting first
    SELECT 
        t.Id as id,
        t.Name as name,
        t.Description as description,
        t.Image as image,
        -- Simple category object (not JSON for now)
        CONCAT('{"id":"', ISNULL(c.Id, ''), '","name":"', ISNULL(c.Name, ''), '","slug":"', ISNULL(c.Slug, ''), '","description":"', ISNULL(c.Description, ''), '","icon":"', ISNULL(c.Icon, ''), '","color":"', ISNULL(c.Color, ''), '"}') as category,
        t.Price as price,
        t.OriginalPrice as originalPrice,
        t.Stock as stock,
        t.Status as status,
        t.AgeRange as ageRange,
        ISNULL(b.Name, '') as brand,
        t.Material as material,
        -- Simple dimensions object
        CONCAT('{"length":', ISNULL(t.DimensionLength, 0), ',"width":', ISNULL(t.DimensionWidth, 0), ',"height":', ISNULL(t.DimensionHeight, 0), ',"weight":', ISNULL(t.Weight, 0), '}') as dimensions,
        ISNULL(t.Colors, '[]') as colors,
        ISNULL(t.Tags, '[]') as tags,
        ISNULL(t.Rating, 0) as rating,
        ISNULL(t.ReviewCount, 0) as reviewCount,
        t.CreatedAt as createdAt,
        t.UpdatedAt as updatedAt,
        ISNULL(t.IsNew, 0) as isNew,
        ISNULL(t.IsFeatured, 0) as isFeatured,
        ISNULL(t.Discount, 0) as discount
    FROM zen50558_ManagementStore.dbo.Toys t
    LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
    LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
    WHERE t.IsActive = 1
        -- Apply filters only if provided
        AND (@Search IS NULL OR @Search = '' OR t.Name LIKE '%' + @Search + '%')
        AND (@CategoryId IS NULL OR @CategoryId = '' OR t.CategoryId = @CategoryId)
        AND (@BrandName IS NULL OR @BrandName = '' OR b.Name = @BrandName)
        AND (@Status IS NULL OR @Status = '' OR t.Status = @Status)
        AND (@MinPrice IS NULL OR t.Price >= @MinPrice)
        AND (@MaxPrice IS NULL OR t.Price <= @MaxPrice)
        AND (@AgeRange IS NULL OR @AgeRange = '' OR t.AgeRange LIKE '%' + @AgeRange + '%')
        AND (@InStock IS NULL OR @InStock = 0 OR t.Stock > 0)
    ORDER BY 
        CASE WHEN @SortField = 'name' AND @SortDirection = 'asc' THEN t.Name END ASC,
        CASE WHEN @SortField = 'name' AND @SortDirection = 'desc' THEN t.Name END DESC,
        CASE WHEN @SortField = 'price' AND @SortDirection = 'asc' THEN t.Price END ASC,
        CASE WHEN @SortField = 'price' AND @SortDirection = 'desc' THEN t.Price END DESC,
        CASE WHEN @SortField = 'createdAt' AND @SortDirection = 'asc' THEN t.CreatedAt END ASC,
        CASE WHEN @SortField = 'createdAt' AND @SortDirection = 'desc' THEN t.CreatedAt END DESC,
        t.CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

PRINT '✅ Simplified sp_GetToysForFrontend created successfully';

-- Test the new procedure
PRINT '';
PRINT '🧪 Testing the new procedure...';

BEGIN TRY
    EXEC sp_GetToysForFrontend @Page = 1, @PageSize = 5;
    PRINT '✅ sp_GetToysForFrontend test: SUCCESS';
END TRY
BEGIN CATCH
    PRINT '❌ sp_GetToysForFrontend test: ERROR - ' + ERROR_MESSAGE();
END CATCH

-- Also create a super simple test procedure
PRINT '';
PRINT '🔧 Creating test procedure for debugging...';

CREATE OR ALTER PROCEDURE sp_GetToysSimpleTest
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.Id as id,
        t.Name as name,
        t.Price as price,
        c.Name as categoryName,
        b.Name as brandName,
        t.IsActive
    FROM zen50558_ManagementStore.dbo.Toys t
    LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
    LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
    WHERE t.IsActive = 1;
END
GO

PRINT '✅ sp_GetToysSimpleTest created successfully';

-- Test simple procedure
BEGIN TRY
    EXEC sp_GetToysSimpleTest;
    PRINT '✅ sp_GetToysSimpleTest: SUCCESS';
END TRY
BEGIN CATCH
    PRINT '❌ sp_GetToysSimpleTest: ERROR - ' + ERROR_MESSAGE();
END CATCH

PRINT '';
PRINT '==============================================';
PRINT 'TOYS PROCEDURE FIX COMPLETED';
PRINT '==============================================';
GO
