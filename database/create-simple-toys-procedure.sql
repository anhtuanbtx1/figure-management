-- =====================================================
-- CREATE SIMPLE TOYS PROCEDURE FOR TESTING
-- This creates a very basic procedure to isolate the issue
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'CREATING SIMPLE TOYS PROCEDURE';
PRINT '==============================================';
PRINT '';

-- Drop existing procedures
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_GetToysForFrontend')
BEGIN
    DROP PROCEDURE sp_GetToysForFrontend;
    PRINT '🗑️ Dropped existing sp_GetToysForFrontend';
END

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_GetToysSimple')
BEGIN
    DROP PROCEDURE sp_GetToysSimple;
    PRINT '🗑️ Dropped existing sp_GetToysSimple';
END

-- Create super simple procedure first
PRINT '';
PRINT '🔧 Creating sp_GetToysSimple (no joins, no filters)...';

CREATE PROCEDURE sp_GetToysSimple
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id as id,
        Name as name,
        Description as description,
        Image as image,
        '{"id":"","name":"Unknown","slug":"","description":"","icon":"","color":""}' as category,
        Price as price,
        OriginalPrice as originalPrice,
        Stock as stock,
        Status as status,
        AgeRange as ageRange,
        'Unknown' as brand,
        Material as material,
        '{"length":0,"width":0,"height":0,"weight":0}' as dimensions,
        ISNULL(Colors, '[]') as colors,
        ISNULL(Tags, '[]') as tags,
        ISNULL(Rating, 0) as rating,
        ISNULL(ReviewCount, 0) as reviewCount,
        CreatedAt as createdAt,
        UpdatedAt as updatedAt,
        ISNULL(IsNew, 0) as isNew,
        ISNULL(IsFeatured, 0) as isFeatured,
        ISNULL(Discount, 0) as discount
    FROM zen50558_ManagementStore.dbo.Toys
    WHERE IsActive = 1;
END
GO

PRINT '✅ sp_GetToysSimple created successfully';

-- Test simple procedure
PRINT '';
PRINT '🧪 Testing sp_GetToysSimple...';
BEGIN TRY
    EXEC sp_GetToysSimple;
    PRINT '✅ sp_GetToysSimple test: SUCCESS';
END TRY
BEGIN CATCH
    PRINT '❌ sp_GetToysSimple test: ERROR - ' + ERROR_MESSAGE();
END CATCH

-- Create procedure with LEFT JOINs (more forgiving)
PRINT '';
PRINT '🔧 Creating sp_GetToysForFrontend with LEFT JOINs...';

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
    
    -- Use LEFT JOINs to be more forgiving with missing relationships
    SELECT 
        t.Id as id,
        t.Name as name,
        ISNULL(t.Description, '') as description,
        ISNULL(t.Image, '/images/toys/default.jpg') as image,
        -- Category with fallback
        CASE 
            WHEN c.Id IS NOT NULL THEN 
                CONCAT('{"id":"', c.Id, '","name":"', ISNULL(c.Name, ''), '","slug":"', ISNULL(c.Slug, ''), '","description":"', ISNULL(c.Description, ''), '","icon":"', ISNULL(c.Icon, ''), '","color":"', ISNULL(c.Color, ''), '"}')
            ELSE 
                '{"id":"","name":"Unknown Category","slug":"","description":"","icon":"","color":""}'
        END as category,
        ISNULL(t.Price, 0) as price,
        t.OriginalPrice as originalPrice,
        ISNULL(t.Stock, 0) as stock,
        ISNULL(t.Status, 'active') as status,
        t.AgeRange as ageRange,
        ISNULL(b.Name, 'Unknown Brand') as brand,
        t.Material as material,
        -- Dimensions with fallback
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
        -- Apply filters only if provided and valid
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

PRINT '✅ sp_GetToysForFrontend created successfully';

-- Test new procedure
PRINT '';
PRINT '🧪 Testing sp_GetToysForFrontend...';
BEGIN TRY
    EXEC sp_GetToysForFrontend @Page = 1, @PageSize = 5;
    PRINT '✅ sp_GetToysForFrontend test: SUCCESS';
END TRY
BEGIN CATCH
    PRINT '❌ sp_GetToysForFrontend test: ERROR - ' + ERROR_MESSAGE();
END CATCH

-- Test with no parameters
PRINT '';
PRINT '🧪 Testing sp_GetToysForFrontend with no parameters...';
BEGIN TRY
    EXEC sp_GetToysForFrontend;
    PRINT '✅ sp_GetToysForFrontend (no params) test: SUCCESS';
END TRY
BEGIN CATCH
    PRINT '❌ sp_GetToysForFrontend (no params) test: ERROR - ' + ERROR_MESSAGE();
END CATCH

PRINT '';
PRINT '==============================================';
PRINT 'SIMPLE TOYS PROCEDURE CREATION COMPLETED';
PRINT '==============================================';
GO
