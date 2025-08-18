-- =====================================================
-- CREATE MISSING STORED PROCEDURES
-- This script creates any missing stored procedures for the toy management system
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'CREATING MISSING STORED PROCEDURES';
PRINT '==============================================';
PRINT '';

-- =====================================================
-- 1. CREATE sp_GetCategoriesForFrontend IF NOT EXISTS
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_GetCategoriesForFrontend')
BEGIN
    PRINT '📂 Creating sp_GetCategoriesForFrontend...';
    
    EXEC('
    CREATE PROCEDURE sp_GetCategoriesForFrontend
    AS
    BEGIN
        SET NOCOUNT ON;
        
        SELECT 
            Id as id,
            Name as name,
            Slug as slug,
            Description as description,
            Icon as icon,
            Color as color
        FROM zen50558_ManagementStore.dbo.ToyCategories 
        WHERE IsActive = 1
        ORDER BY Name;
    END
    ');
    
    PRINT '✅ sp_GetCategoriesForFrontend created successfully';
END
ELSE
BEGIN
    PRINT '✅ sp_GetCategoriesForFrontend already exists';
END

-- =====================================================
-- 2. CREATE sp_GetBrandsForFrontend IF NOT EXISTS
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_GetBrandsForFrontend')
BEGIN
    PRINT '🏷️ Creating sp_GetBrandsForFrontend...';
    
    EXEC('
    CREATE PROCEDURE sp_GetBrandsForFrontend
    AS
    BEGIN
        SET NOCOUNT ON;
        
        SELECT DISTINCT Name as brand
        FROM zen50558_ManagementStore.dbo.ToyBrands 
        WHERE IsActive = 1
        ORDER BY Name;
    END
    ');
    
    PRINT '✅ sp_GetBrandsForFrontend created successfully';
END
ELSE
BEGIN
    PRINT '✅ sp_GetBrandsForFrontend already exists';
END

-- =====================================================
-- 3. CREATE sp_GetToysForFrontend IF NOT EXISTS
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_GetToysForFrontend')
BEGIN
    PRINT '🧸 Creating sp_GetToysForFrontend...';
    
    EXEC('
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
        @SortField NVARCHAR(50) = ''createdAt'',
        @SortDirection NVARCHAR(4) = ''desc''
    AS
    BEGIN
        SET NOCOUNT ON;
        
        -- Validate parameters
        IF @Page < 1 SET @Page = 1;
        IF @PageSize < 1 OR @PageSize > 100 SET @PageSize = 20;
        IF @SortDirection NOT IN (''asc'', ''desc'') SET @SortDirection = ''desc'';
        
        -- Calculate offset for pagination
        DECLARE @Offset INT = (@Page - 1) * @PageSize;
        
        -- Build the main query with frontend-compatible format
        WITH FilteredToys AS (
            SELECT 
                t.Id,
                t.Name,
                t.Description,
                t.Image,
                t.CategoryId,
                t.BrandId,
                t.Price,
                t.OriginalPrice,
                t.Stock,
                t.Status,
                t.AgeRange,
                t.Material,
                t.DimensionLength,
                t.DimensionWidth,
                t.DimensionHeight,
                t.Weight,
                t.Colors,
                t.Tags,
                t.Rating,
                t.ReviewCount,
                t.CreatedAt,
                t.UpdatedAt,
                t.IsNew,
                t.IsFeatured,
                t.Discount,
                c.Name as CategoryName,
                c.Slug as CategorySlug,
                c.Description as CategoryDescription,
                c.Icon as CategoryIcon,
                c.Color as CategoryColor,
                b.Name as BrandName
            FROM zen50558_ManagementStore.dbo.Toys t
            INNER JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
            INNER JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id AND b.IsActive = 1
            WHERE t.IsActive = 1
                -- Search filter
                AND (@Search IS NULL OR @Search = '''' OR 
                     t.Name LIKE ''%'' + @Search + ''%'' OR 
                     t.Description LIKE ''%'' + @Search + ''%'' OR 
                     b.Name LIKE ''%'' + @Search + ''%'')
                -- Category filter
                AND (@CategoryId IS NULL OR @CategoryId = '''' OR t.CategoryId = @CategoryId)
                -- Brand filter
                AND (@BrandName IS NULL OR @BrandName = '''' OR b.Name = @BrandName)
                -- Status filter
                AND (@Status IS NULL OR @Status = '''' OR t.Status = @Status)
                -- Price range filter
                AND (@MinPrice IS NULL OR t.Price >= @MinPrice)
                AND (@MaxPrice IS NULL OR t.Price <= @MaxPrice)
                -- Age range filter
                AND (@AgeRange IS NULL OR @AgeRange = '''' OR t.AgeRange LIKE ''%'' + @AgeRange + ''%'')
                -- Stock filter
                AND (@InStock IS NULL OR @InStock = 0 OR t.Stock > 0)
        ),
        SortedToys AS (
            SELECT *,
                ROW_NUMBER() OVER (
                    ORDER BY 
                        CASE WHEN @SortField = ''name'' AND @SortDirection = ''asc'' THEN Name END ASC,
                        CASE WHEN @SortField = ''name'' AND @SortDirection = ''desc'' THEN Name END DESC,
                        CASE WHEN @SortField = ''price'' AND @SortDirection = ''asc'' THEN Price END ASC,
                        CASE WHEN @SortField = ''price'' AND @SortDirection = ''desc'' THEN Price END DESC,
                        CASE WHEN @SortField = ''stock'' AND @SortDirection = ''asc'' THEN Stock END ASC,
                        CASE WHEN @SortField = ''stock'' AND @SortDirection = ''desc'' THEN Stock END DESC,
                        CASE WHEN @SortField = ''rating'' AND @SortDirection = ''asc'' THEN Rating END ASC,
                        CASE WHEN @SortField = ''rating'' AND @SortDirection = ''desc'' THEN Rating END DESC,
                        CASE WHEN @SortField = ''createdAt'' AND @SortDirection = ''asc'' THEN CreatedAt END ASC,
                        CASE WHEN @SortField = ''createdAt'' AND @SortDirection = ''desc'' THEN CreatedAt END DESC,
                        CASE WHEN @SortField = ''updatedAt'' AND @SortDirection = ''asc'' THEN UpdatedAt END ASC,
                        CASE WHEN @SortField = ''updatedAt'' AND @SortDirection = ''desc'' THEN UpdatedAt END DESC,
                        -- Default sort
                        CreatedAt DESC
                ) as RowNum
            FROM FilteredToys
        )
        -- Return paginated results in frontend format
        SELECT 
            Id as id,
            Name as name,
            Description as description,
            Image as image,
            -- Category as JSON object
            CONCAT(''{"id":"'', CategoryId, ''","name":"'', CategoryName, ''","slug":"'', CategorySlug, 
                   ''","description":"'', ISNULL(CategoryDescription, ''''), ''","icon":"'', ISNULL(CategoryIcon, ''''), 
                   ''","color":"'', ISNULL(CategoryColor, ''''), ''"}') as category,
            Price as price,
            OriginalPrice as originalPrice,
            Stock as stock,
            Status as status,
            AgeRange as ageRange,
            BrandName as brand,
            Material as material,
            -- Dimensions as JSON object
            CONCAT(''{"length":'', ISNULL(DimensionLength, 0), '',"width":'', ISNULL(DimensionWidth, 0), 
                   '',"height":'', ISNULL(DimensionHeight, 0), '',"weight":'', ISNULL(Weight, 0), ''}'') as dimensions,
            Colors as colors,
            Tags as tags,
            Rating as rating,
            ReviewCount as reviewCount,
            CreatedAt as createdAt,
            UpdatedAt as updatedAt,
            ISNULL(IsNew, 0) as isNew,
            ISNULL(IsFeatured, 0) as isFeatured,
            ISNULL(Discount, 0) as discount
        FROM SortedToys
        WHERE RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize
        ORDER BY RowNum;
    END
    ');
    
    PRINT '✅ sp_GetToysForFrontend created successfully';
END
ELSE
BEGIN
    PRINT '✅ sp_GetToysForFrontend already exists';
END

-- =====================================================
-- 4. TEST ALL PROCEDURES
-- =====================================================

PRINT '';
PRINT '🧪 Testing all procedures...';

-- Test categories
BEGIN TRY
    EXEC sp_GetCategoriesForFrontend;
    PRINT '✅ sp_GetCategoriesForFrontend: Working';
END TRY
BEGIN CATCH
    PRINT '❌ sp_GetCategoriesForFrontend: Error - ' + ERROR_MESSAGE();
END CATCH

-- Test brands
BEGIN TRY
    EXEC sp_GetBrandsForFrontend;
    PRINT '✅ sp_GetBrandsForFrontend: Working';
END TRY
BEGIN CATCH
    PRINT '❌ sp_GetBrandsForFrontend: Error - ' + ERROR_MESSAGE();
END CATCH

-- Test toys
BEGIN TRY
    EXEC sp_GetToysForFrontend @Page = 1, @PageSize = 5;
    PRINT '✅ sp_GetToysForFrontend: Working';
END TRY
BEGIN CATCH
    PRINT '❌ sp_GetToysForFrontend: Error - ' + ERROR_MESSAGE();
END CATCH

PRINT '';
PRINT '==============================================';
PRINT 'MISSING PROCEDURES CREATION COMPLETED';
PRINT '==============================================';
GO
