-- =====================================================
-- TOY MANAGEMENT FRONTEND-COMPATIBLE PROCEDURES
-- Stored procedures that return data in the exact format expected by the frontend
-- Compatible with /apps/toy-management page structure
-- Optimized for performance and security
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'CREATING FRONTEND-COMPATIBLE PROCEDURES';
PRINT '==============================================';
PRINT '';

-- =====================================================
-- 1. MAIN PROCEDURE: GET TOYS FOR FRONTEND
-- =====================================================

CREATE OR ALTER PROCEDURE sp_GetToysForFrontend
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
            AND (@Search IS NULL OR @Search = '' OR
                 t.Name LIKE '%' + @Search + '%' OR
                 t.Description LIKE '%' + @Search + '%' OR
                 b.Name LIKE '%' + @Search + '%')
            -- Category filter
            AND (@CategoryId IS NULL OR @CategoryId = '' OR t.CategoryId = @CategoryId)
            -- Brand filter
            AND (@BrandName IS NULL OR @BrandName = '' OR b.Name = @BrandName)
            -- Status filter
            AND (@Status IS NULL OR @Status = '' OR t.Status = @Status)
            -- Price range filter
            AND (@MinPrice IS NULL OR t.Price >= @MinPrice)
            AND (@MaxPrice IS NULL OR t.Price <= @MaxPrice)
            -- Age range filter
            AND (@AgeRange IS NULL OR @AgeRange = '' OR t.AgeRange LIKE '%' + @AgeRange + '%')
            -- Stock filter
            AND (@InStock IS NULL OR @InStock = 0 OR t.Stock > 0)
    ),
    SortedToys AS (
        SELECT *,
            ROW_NUMBER() OVER (
                ORDER BY
                    CASE WHEN @SortField = 'name' AND @SortDirection = 'asc' THEN Name END ASC,
                    CASE WHEN @SortField = 'name' AND @SortDirection = 'desc' THEN Name END DESC,
                    CASE WHEN @SortField = 'price' AND @SortDirection = 'asc' THEN Price END ASC,
                    CASE WHEN @SortField = 'price' AND @SortDirection = 'desc' THEN Price END DESC,
                    CASE WHEN @SortField = 'stock' AND @SortDirection = 'asc' THEN Stock END ASC,
                    CASE WHEN @SortField = 'stock' AND @SortDirection = 'desc' THEN Stock END DESC,
                    CASE WHEN @SortField = 'rating' AND @SortDirection = 'asc' THEN Rating END ASC,
                    CASE WHEN @SortField = 'rating' AND @SortDirection = 'desc' THEN Rating END DESC,
                    CASE WHEN @SortField = 'createdAt' AND @SortDirection = 'asc' THEN CreatedAt END ASC,
                    CASE WHEN @SortField = 'createdAt' AND @SortDirection = 'desc' THEN CreatedAt END DESC,
                    CASE WHEN @SortField = 'updatedAt' AND @SortDirection = 'asc' THEN UpdatedAt END ASC,
                    CASE WHEN @SortField = 'updatedAt' AND @SortDirection = 'desc' THEN UpdatedAt END DESC,
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
        CONCAT('{"id":"', CategoryId, '","name":"', CategoryName, '","slug":"', CategorySlug,
               '","description":"', ISNULL(CategoryDescription, ''), '","icon":"', ISNULL(CategoryIcon, ''),
               '","color":"', ISNULL(CategoryColor, ''), '"}') as category,
        Price as price,
        OriginalPrice as originalPrice,
        Stock as stock,
        Status as status,
        AgeRange as ageRange,
        BrandName as brand,
        Material as material,
        -- Dimensions as JSON object
        CONCAT('{"length":', ISNULL(DimensionLength, 0), ',"width":', ISNULL(DimensionWidth, 0),
               ',"height":', ISNULL(DimensionHeight, 0), ',"weight":', ISNULL(Weight, 0), '}') as dimensions,
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
GO

PRINT '✅ sp_GetToysForFrontend created successfully';

-- =====================================================
-- 2. PROCEDURE: GET SINGLE TOY BY ID
-- =====================================================

CREATE OR ALTER PROCEDURE sp_GetToyByIdForFrontend
    @ToyId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate input
    IF @ToyId IS NULL OR @ToyId = ''
    BEGIN
        RAISERROR('ToyId is required', 16, 1);
        RETURN;
    END

    -- Get single toy in frontend format
    SELECT
        t.Id as id,
        t.Name as name,
        t.Description as description,
        t.Image as image,
        -- Category as JSON object
        CONCAT('{"id":"', c.Id, '","name":"', c.Name, '","slug":"', c.Slug,
               '","description":"', ISNULL(c.Description, ''), '","icon":"', ISNULL(c.Icon, ''),
               '","color":"', ISNULL(c.Color, ''), '"}') as category,
        t.Price as price,
        t.OriginalPrice as originalPrice,
        t.Stock as stock,
        t.Status as status,
        t.AgeRange as ageRange,
        b.Name as brand,
        t.Material as material,
        -- Dimensions as JSON object
        CONCAT('{"length":', ISNULL(t.DimensionLength, 0), ',"width":', ISNULL(t.DimensionWidth, 0),
               ',"height":', ISNULL(t.DimensionHeight, 0), ',"weight":', ISNULL(t.Weight, 0), '}') as dimensions,
        t.Colors as colors,
        t.Tags as tags,
        t.Rating as rating,
        t.ReviewCount as reviewCount,
        t.CreatedAt as createdAt,
        t.UpdatedAt as updatedAt,
        ISNULL(t.IsNew, 0) as isNew,
        ISNULL(t.IsFeatured, 0) as isFeatured,
        ISNULL(t.Discount, 0) as discount
    FROM zen50558_ManagementStore.dbo.Toys t
    INNER JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
    INNER JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id AND b.IsActive = 1
    WHERE t.Id = @ToyId AND t.IsActive = 1;

    -- Check if toy was found
    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Toy not found', 16, 1);
        RETURN;
    END
END
GO

PRINT '✅ sp_GetToyByIdForFrontend created successfully';

-- =====================================================
-- 3. PROCEDURE: CREATE NEW TOY
-- =====================================================

CREATE OR ALTER PROCEDURE sp_CreateToyFromFrontend
    @Name NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @Image NVARCHAR(500) = NULL,
    @CategoryId NVARCHAR(50),
    @Price DECIMAL(18,2),
    @OriginalPrice DECIMAL(18,2) = NULL,
    @Stock INT,
    @AgeRange NVARCHAR(50) = NULL,
    @Brand NVARCHAR(255),
    @Material NVARCHAR(255) = NULL,
    @DimensionLength DECIMAL(10,2) = 0,
    @DimensionWidth DECIMAL(10,2) = 0,
    @DimensionHeight DECIMAL(10,2) = 0,
    @Weight DECIMAL(10,2) = 0,
    @Colors NVARCHAR(MAX) = NULL, -- JSON array
    @Tags NVARCHAR(MAX) = NULL    -- JSON array
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Validate required fields
        IF @Name IS NULL OR @Name = ''
        BEGIN
            RAISERROR('Name is required', 16, 1);
            RETURN;
        END

        IF @CategoryId IS NULL OR @CategoryId = ''
        BEGIN
            RAISERROR('CategoryId is required', 16, 1);
            RETURN;
        END

        IF @Price <= 0
        BEGIN
            RAISERROR('Price must be greater than 0', 16, 1);
            RETURN;
        END

        IF @Stock < 0
        BEGIN
            RAISERROR('Stock cannot be negative', 16, 1);
            RETURN;
        END

        IF @Brand IS NULL OR @Brand = ''
        BEGIN
            RAISERROR('Brand is required', 16, 1);
            RETURN;
        END

        -- Validate category exists
        IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.ToyCategories WHERE Id = @CategoryId AND IsActive = 1)
        BEGIN
            RAISERROR('Invalid CategoryId', 16, 1);
            RETURN;
        END

        -- Get or create brand
        DECLARE @BrandId NVARCHAR(50);
        SELECT @BrandId = Id FROM zen50558_ManagementStore.dbo.ToyBrands WHERE Name = @Brand AND IsActive = 1;

        IF @BrandId IS NULL
        BEGIN
            SET @BrandId = 'brand-' + REPLACE(CAST(NEWID() AS NVARCHAR(36)), '-', '');
            INSERT INTO zen50558_ManagementStore.dbo.ToyBrands (Id, Name, IsActive, CreatedAt, UpdatedAt)
            VALUES (@BrandId, @Brand, 1, GETDATE(), GETDATE());
        END

        -- Generate new toy ID
        DECLARE @NewId NVARCHAR(50) = 'toy-' + REPLACE(CAST(NEWID() AS NVARCHAR(36)), '-', '');

        -- Set default values
        IF @Image IS NULL OR @Image = '' SET @Image = '/images/toys/default.jpg';
        IF @Colors IS NULL SET @Colors = '[]';
        IF @Tags IS NULL SET @Tags = '[]';

        -- Calculate discount if original price is provided
        DECLARE @Discount DECIMAL(5,2) = 0;
        IF @OriginalPrice IS NOT NULL AND @OriginalPrice > @Price
        BEGIN
            SET @Discount = ROUND(((@OriginalPrice - @Price) / @OriginalPrice) * 100, 2);
        END

        -- Insert new toy
        INSERT INTO zen50558_ManagementStore.dbo.Toys (
            Id, Name, Description, Image, CategoryId, BrandId, Price, OriginalPrice, Stock,
            AgeRange, Material, DimensionLength, DimensionWidth, DimensionHeight, Weight,
            Colors, Tags, Status, IsActive, IsNew, IsFeatured, Discount, Rating, ReviewCount,
            CreatedAt, UpdatedAt
        ) VALUES (
            @NewId, @Name, @Description, @Image, @CategoryId, @BrandId, @Price, @OriginalPrice, @Stock,
            @AgeRange, @Material, @DimensionLength, @DimensionWidth, @DimensionHeight, @Weight,
            @Colors, @Tags, 'active', 1, 1, 0, @Discount, 0, 0,
            GETDATE(), GETDATE()
        );

        COMMIT TRANSACTION;

        -- Return the created toy in frontend format
        EXEC sp_GetToyByIdForFrontend @NewId;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT '✅ sp_CreateToyFromFrontend created successfully';

-- =====================================================
-- 4. PROCEDURE: UPDATE EXISTING TOY
-- =====================================================

CREATE OR ALTER PROCEDURE sp_UpdateToyFromFrontend
    @ToyId NVARCHAR(50),
    @Name NVARCHAR(255) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Image NVARCHAR(500) = NULL,
    @CategoryId NVARCHAR(50) = NULL,
    @Price DECIMAL(18,2) = NULL,
    @OriginalPrice DECIMAL(18,2) = NULL,
    @Stock INT = NULL,
    @Status NVARCHAR(20) = NULL,
    @AgeRange NVARCHAR(50) = NULL,
    @Brand NVARCHAR(255) = NULL,
    @Material NVARCHAR(255) = NULL,
    @DimensionLength DECIMAL(10,2) = NULL,
    @DimensionWidth DECIMAL(10,2) = NULL,
    @DimensionHeight DECIMAL(10,2) = NULL,
    @Weight DECIMAL(10,2) = NULL,
    @Colors NVARCHAR(MAX) = NULL, -- JSON array
    @Tags NVARCHAR(MAX) = NULL    -- JSON array
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Validate toy exists
        IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.Toys WHERE Id = @ToyId AND IsActive = 1)
        BEGIN
            RAISERROR('Toy not found', 16, 1);
            RETURN;
        END

        -- Validate price if provided
        IF @Price IS NOT NULL AND @Price <= 0
        BEGIN
            RAISERROR('Price must be greater than 0', 16, 1);
            RETURN;
        END

        -- Validate stock if provided
        IF @Stock IS NOT NULL AND @Stock < 0
        BEGIN
            RAISERROR('Stock cannot be negative', 16, 1);
            RETURN;
        END

        -- Validate category if provided
        IF @CategoryId IS NOT NULL AND @CategoryId != '' AND
           NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.ToyCategories WHERE Id = @CategoryId AND IsActive = 1)
        BEGIN
            RAISERROR('Invalid CategoryId', 16, 1);
            RETURN;
        END

        -- Handle brand update if provided
        DECLARE @BrandId NVARCHAR(50) = NULL;
        IF @Brand IS NOT NULL AND @Brand != ''
        BEGIN
            SELECT @BrandId = Id FROM zen50558_ManagementStore.dbo.ToyBrands WHERE Name = @Brand AND IsActive = 1;

            IF @BrandId IS NULL
            BEGIN
                SET @BrandId = 'brand-' + REPLACE(CAST(NEWID() AS NVARCHAR(36)), '-', '');
                INSERT INTO zen50558_ManagementStore.dbo.ToyBrands (Id, Name, IsActive, CreatedAt, UpdatedAt)
                VALUES (@BrandId, @Brand, 1, GETDATE(), GETDATE());
            END
        END

        -- Build dynamic update query
        DECLARE @UpdateSQL NVARCHAR(MAX) = 'UPDATE zen50558_ManagementStore.dbo.Toys SET UpdatedAt = GETDATE()';

        IF @Name IS NOT NULL
            SET @UpdateSQL += ', Name = ''' + REPLACE(@Name, '''', '''''') + '''';
        IF @Description IS NOT NULL
            SET @UpdateSQL += ', Description = ''' + REPLACE(@Description, '''', '''''') + '''';
        IF @Image IS NOT NULL
            SET @UpdateSQL += ', Image = ''' + @Image + '''';
        IF @CategoryId IS NOT NULL AND @CategoryId != ''
            SET @UpdateSQL += ', CategoryId = ''' + @CategoryId + '''';
        IF @Price IS NOT NULL
            SET @UpdateSQL += ', Price = ' + CAST(@Price AS NVARCHAR(20));
        IF @OriginalPrice IS NOT NULL
            SET @UpdateSQL += ', OriginalPrice = ' + CAST(@OriginalPrice AS NVARCHAR(20));
        IF @Stock IS NOT NULL
            SET @UpdateSQL += ', Stock = ' + CAST(@Stock AS NVARCHAR(10));
        IF @Status IS NOT NULL
            SET @UpdateSQL += ', Status = ''' + @Status + '''';
        IF @AgeRange IS NOT NULL
            SET @UpdateSQL += ', AgeRange = ''' + @AgeRange + '''';
        IF @BrandId IS NOT NULL
            SET @UpdateSQL += ', BrandId = ''' + @BrandId + '''';
        IF @Material IS NOT NULL
            SET @UpdateSQL += ', Material = ''' + REPLACE(@Material, '''', '''''') + '''';
        IF @DimensionLength IS NOT NULL
            SET @UpdateSQL += ', DimensionLength = ' + CAST(@DimensionLength AS NVARCHAR(10));
        IF @DimensionWidth IS NOT NULL
            SET @UpdateSQL += ', DimensionWidth = ' + CAST(@DimensionWidth AS NVARCHAR(10));
        IF @DimensionHeight IS NOT NULL
            SET @UpdateSQL += ', DimensionHeight = ' + CAST(@DimensionHeight AS NVARCHAR(10));
        IF @Weight IS NOT NULL
            SET @UpdateSQL += ', Weight = ' + CAST(@Weight AS NVARCHAR(10));
        IF @Colors IS NOT NULL
            SET @UpdateSQL += ', Colors = ''' + REPLACE(@Colors, '''', '''''') + '''';
        IF @Tags IS NOT NULL
            SET @UpdateSQL += ', Tags = ''' + REPLACE(@Tags, '''', '''''') + '''';

        -- Update discount if both prices are provided
        IF @Price IS NOT NULL AND @OriginalPrice IS NOT NULL AND @OriginalPrice > @Price
        BEGIN
            DECLARE @NewDiscount DECIMAL(5,2) = ROUND(((@OriginalPrice - @Price) / @OriginalPrice) * 100, 2);
            SET @UpdateSQL += ', Discount = ' + CAST(@NewDiscount AS NVARCHAR(10));
        END

        SET @UpdateSQL += ' WHERE Id = ''' + @ToyId + '''';

        -- Execute update
        EXEC sp_executesql @UpdateSQL;

        COMMIT TRANSACTION;

        -- Return updated toy in frontend format
        EXEC sp_GetToyByIdForFrontend @ToyId;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT '✅ sp_UpdateToyFromFrontend created successfully';

-- =====================================================
-- 5. PROCEDURE: DELETE TOY (SOFT DELETE)
-- =====================================================

CREATE OR ALTER PROCEDURE sp_DeleteToyFromFrontend
    @ToyId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate input
    IF @ToyId IS NULL OR @ToyId = ''
    BEGIN
        RAISERROR('ToyId is required', 16, 1);
        RETURN;
    END

    -- Check if toy exists
    IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.Toys WHERE Id = @ToyId AND IsActive = 1)
    BEGIN
        RAISERROR('Toy not found', 16, 1);
        RETURN;
    END

    -- Soft delete - set IsActive to 0
    UPDATE zen50558_ManagementStore.dbo.Toys
    SET IsActive = 0, UpdatedAt = GETDATE()
    WHERE Id = @ToyId;

    SELECT 'Toy deleted successfully' as message;
END
GO

PRINT '✅ sp_DeleteToyFromFrontend created successfully';

-- =====================================================
-- 6. PROCEDURE: GET CATEGORIES FOR FRONTEND
-- =====================================================

CREATE OR ALTER PROCEDURE sp_GetCategoriesForFrontend
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
GO

PRINT '✅ sp_GetCategoriesForFrontend created successfully';

-- =====================================================
-- 7. PROCEDURE: GET BRANDS FOR FRONTEND
-- =====================================================

CREATE OR ALTER PROCEDURE sp_GetBrandsForFrontend
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT Name as brand
    FROM zen50558_ManagementStore.dbo.ToyBrands
    WHERE IsActive = 1
    ORDER BY Name;
END
GO

PRINT '✅ sp_GetBrandsForFrontend created successfully';

-- =====================================================
-- 4. PROCEDURE: UPDATE EXISTING TOY
-- =====================================================

CREATE OR ALTER PROCEDURE sp_UpdateToyFromFrontend
    @ToyId NVARCHAR(50),
    @Name NVARCHAR(255) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Image NVARCHAR(500) = NULL,
    @CategoryId NVARCHAR(50) = NULL,
    @Price DECIMAL(18,2) = NULL,
    @OriginalPrice DECIMAL(18,2) = NULL,
    @Stock INT = NULL,
    @Status NVARCHAR(20) = NULL,
    @AgeRange NVARCHAR(50) = NULL,
    @Brand NVARCHAR(255) = NULL,
    @Material NVARCHAR(255) = NULL,
    @DimensionLength DECIMAL(10,2) = NULL,
    @DimensionWidth DECIMAL(10,2) = NULL,
    @DimensionHeight DECIMAL(10,2) = NULL,
    @Weight DECIMAL(10,2) = NULL,
    @Colors NVARCHAR(MAX) = NULL, -- JSON array
    @Tags NVARCHAR(MAX) = NULL    -- JSON array
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Validate toy exists
        IF NOT EXISTS (SELECT 1 FROM Toys WHERE Id = @ToyId AND IsActive = 1)
        BEGIN
            RAISERROR('Toy not found', 16, 1);
            RETURN;
        END

        -- Validate price if provided
        IF @Price IS NOT NULL AND @Price <= 0
        BEGIN
            RAISERROR('Price must be greater than 0', 16, 1);
            RETURN;
        END

        -- Validate stock if provided
        IF @Stock IS NOT NULL AND @Stock < 0
        BEGIN
            RAISERROR('Stock cannot be negative', 16, 1);
            RETURN;
        END

        -- Validate category if provided
        IF @CategoryId IS NOT NULL AND @CategoryId != '' AND
           NOT EXISTS (SELECT 1 FROM ToyCategories WHERE Id = @CategoryId AND IsActive = 1)
        BEGIN
            RAISERROR('Invalid CategoryId', 16, 1);
            RETURN;
        END

        -- Handle brand update if provided
        DECLARE @BrandId NVARCHAR(50) = NULL;
        IF @Brand IS NOT NULL AND @Brand != ''
        BEGIN
            SELECT @BrandId = Id FROM ToyBrands WHERE Name = @Brand AND IsActive = 1;

            IF @BrandId IS NULL
            BEGIN
                SET @BrandId = 'brand-' + REPLACE(CAST(NEWID() AS NVARCHAR(36)), '-', '');
                INSERT INTO ToyBrands (Id, Name, IsActive, CreatedAt, UpdatedAt)
                VALUES (@BrandId, @Brand, 1, GETDATE(), GETDATE());
            END
        END

        -- Build dynamic update query
        DECLARE @UpdateSQL NVARCHAR(MAX) = 'UPDATE Toys SET UpdatedAt = GETDATE()';

        IF @Name IS NOT NULL
            SET @UpdateSQL += ', Name = ''' + REPLACE(@Name, '''', '''''') + '''';
        IF @Description IS NOT NULL
            SET @UpdateSQL += ', Description = ''' + REPLACE(@Description, '''', '''''') + '''';
        IF @Image IS NOT NULL
            SET @UpdateSQL += ', Image = ''' + @Image + '''';
        IF @CategoryId IS NOT NULL AND @CategoryId != ''
            SET @UpdateSQL += ', CategoryId = ''' + @CategoryId + '''';
        IF @Price IS NOT NULL
            SET @UpdateSQL += ', Price = ' + CAST(@Price AS NVARCHAR(20));
        IF @OriginalPrice IS NOT NULL
            SET @UpdateSQL += ', OriginalPrice = ' + CAST(@OriginalPrice AS NVARCHAR(20));
        IF @Stock IS NOT NULL
            SET @UpdateSQL += ', Stock = ' + CAST(@Stock AS NVARCHAR(10));
        IF @Status IS NOT NULL
            SET @UpdateSQL += ', Status = ''' + @Status + '''';
        IF @AgeRange IS NOT NULL
            SET @UpdateSQL += ', AgeRange = ''' + @AgeRange + '''';
        IF @BrandId IS NOT NULL
            SET @UpdateSQL += ', BrandId = ''' + @BrandId + '''';
        IF @Material IS NOT NULL
            SET @UpdateSQL += ', Material = ''' + REPLACE(@Material, '''', '''''') + '''';
        IF @DimensionLength IS NOT NULL
            SET @UpdateSQL += ', DimensionLength = ' + CAST(@DimensionLength AS NVARCHAR(10));
        IF @DimensionWidth IS NOT NULL
            SET @UpdateSQL += ', DimensionWidth = ' + CAST(@DimensionWidth AS NVARCHAR(10));
        IF @DimensionHeight IS NOT NULL
            SET @UpdateSQL += ', DimensionHeight = ' + CAST(@DimensionHeight AS NVARCHAR(10));
        IF @Weight IS NOT NULL
            SET @UpdateSQL += ', Weight = ' + CAST(@Weight AS NVARCHAR(10));
        IF @Colors IS NOT NULL
            SET @UpdateSQL += ', Colors = ''' + REPLACE(@Colors, '''', '''''') + '''';
        IF @Tags IS NOT NULL
            SET @UpdateSQL += ', Tags = ''' + REPLACE(@Tags, '''', '''''') + '''';

        -- Update discount if both prices are provided
        IF @Price IS NOT NULL AND @OriginalPrice IS NOT NULL AND @OriginalPrice > @Price
        BEGIN
            DECLARE @NewDiscount DECIMAL(5,2) = ROUND(((@OriginalPrice - @Price) / @OriginalPrice) * 100, 2);
            SET @UpdateSQL += ', Discount = ' + CAST(@NewDiscount AS NVARCHAR(10));
        END

        SET @UpdateSQL += ' WHERE Id = ''' + @ToyId + '''';

        -- Execute update
        EXEC sp_executesql @UpdateSQL;

        COMMIT TRANSACTION;

        -- Return updated toy in frontend format
        EXEC sp_GetToyByIdForFrontend @ToyId;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT '✅ sp_UpdateToyFromFrontend created successfully';

-- =====================================================
-- 5. PROCEDURE TO GET SINGLE TOY FOR FRONTEND
-- =====================================================

CREATE OR ALTER PROCEDURE sp_GetToyByIdForFrontend
    @ToyId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        t.Id as id,
        t.Name as name,
        t.Description as description,
        t.Image as image,
        JSON_QUERY(
            '{"id":"' + c.Id + '","name":"' + c.Name + '","slug":"' + c.Slug + 
            '","description":"' + ISNULL(c.Description, '') + '","icon":"' + ISNULL(c.Icon, '') + 
            '","color":"' + ISNULL(c.Color, '') + '"}'
        ) as category,
        t.Price as price,
        t.OriginalPrice as originalPrice,
        t.Stock as stock,
        t.Status as status,
        t.AgeRange as ageRange,
        b.Name as brand,
        t.Material as material,
        JSON_QUERY(
            '{"length":' + CAST(ISNULL(t.DimensionLength, 0) AS NVARCHAR(10)) + 
            ',"width":' + CAST(ISNULL(t.DimensionWidth, 0) AS NVARCHAR(10)) + 
            ',"height":' + CAST(ISNULL(t.DimensionHeight, 0) AS NVARCHAR(10)) + 
            ',"weight":' + CAST(ISNULL(t.Weight, 0) AS NVARCHAR(10)) + '}'
        ) as dimensions,
        t.Colors as colors,
        t.Tags as tags,
        t.Rating as rating,
        t.ReviewCount as reviewCount,
        t.CreatedAt as createdAt,
        t.UpdatedAt as updatedAt,
        ISNULL(t.IsNew, 0) as isNew,
        ISNULL(t.IsFeatured, 0) as isFeatured,
        ISNULL(t.Discount, 0) as discount
    FROM Toys t
    INNER JOIN ToyCategories c ON t.CategoryId = c.Id
    INNER JOIN ToyBrands b ON t.BrandId = b.Id
    WHERE t.Id = @ToyId AND t.IsActive = 1;
END
GO

-- =====================================================
-- 6. PROCEDURE TO CREATE TOY FROM FRONTEND DATA
-- =====================================================

CREATE OR ALTER PROCEDURE sp_CreateToyFromFrontend
    @Name NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @Image NVARCHAR(500),
    @CategoryId NVARCHAR(50),
    @Price DECIMAL(18,2),
    @OriginalPrice DECIMAL(18,2) = NULL,
    @Stock INT,
    @AgeRange NVARCHAR(50),
    @Brand NVARCHAR(255),
    @Material NVARCHAR(255),
    @DimensionLength DECIMAL(10,2) = 0,
    @DimensionWidth DECIMAL(10,2) = 0,
    @DimensionHeight DECIMAL(10,2) = 0,
    @Weight DECIMAL(10,2) = 0,
    @Colors NVARCHAR(MAX), -- JSON array
    @Tags NVARCHAR(MAX)    -- JSON array
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @NewId NVARCHAR(50) = 'toy-' + REPLACE(CAST(NEWID() AS NVARCHAR(36)), '-', '');
    DECLARE @BrandId NVARCHAR(50);
    
    -- Get or create brand
    SELECT @BrandId = Id FROM ToyBrands WHERE Name = @Brand;
    
    IF @BrandId IS NULL
    BEGIN
        SET @BrandId = 'brand-' + REPLACE(CAST(NEWID() AS NVARCHAR(36)), '-', '');
        INSERT INTO ToyBrands (Id, Name) VALUES (@BrandId, @Brand);
    END
    
    -- Insert new toy
    INSERT INTO Toys (
        Id, Name, Description, Image, CategoryId, BrandId, Price, OriginalPrice, Stock,
        AgeRange, Material, DimensionLength, DimensionWidth, DimensionHeight, Weight,
        Colors, Tags, Status, IsActive
    ) VALUES (
        @NewId, @Name, @Description, @Image, @CategoryId, @BrandId, @Price, @OriginalPrice, @Stock,
        @AgeRange, @Material, @DimensionLength, @DimensionWidth, @DimensionHeight, @Weight,
        @Colors, @Tags, 'active', 1
    );
    
    -- Return the created toy in frontend format
    EXEC sp_GetToyByIdForFrontend @NewId;
END
GO

-- =====================================================
-- 7. PROCEDURE TO UPDATE TOY FROM FRONTEND DATA
-- =====================================================

CREATE OR ALTER PROCEDURE sp_UpdateToyFromFrontend
    @ToyId NVARCHAR(50),
    @Name NVARCHAR(255) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Image NVARCHAR(500) = NULL,
    @CategoryId NVARCHAR(50) = NULL,
    @Price DECIMAL(18,2) = NULL,
    @OriginalPrice DECIMAL(18,2) = NULL,
    @Stock INT = NULL,
    @Status NVARCHAR(20) = NULL,
    @AgeRange NVARCHAR(50) = NULL,
    @Brand NVARCHAR(255) = NULL,
    @Material NVARCHAR(255) = NULL,
    @DimensionLength DECIMAL(10,2) = NULL,
    @DimensionWidth DECIMAL(10,2) = NULL,
    @DimensionHeight DECIMAL(10,2) = NULL,
    @Weight DECIMAL(10,2) = NULL,
    @Colors NVARCHAR(MAX) = NULL, -- JSON array
    @Tags NVARCHAR(MAX) = NULL    -- JSON array
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BrandId NVARCHAR(50);

    -- Handle brand update if provided
    IF @Brand IS NOT NULL
    BEGIN
        SELECT @BrandId = Id FROM ToyBrands WHERE Name = @Brand;

        IF @BrandId IS NULL
        BEGIN
            SET @BrandId = 'brand-' + REPLACE(CAST(NEWID() AS NVARCHAR(36)), '-', '');
            INSERT INTO ToyBrands (Id, Name) VALUES (@BrandId, @Brand);
        END
    END

    -- Build dynamic update query
    DECLARE @SQL NVARCHAR(MAX) = 'UPDATE Toys SET UpdatedAt = GETDATE()';

    IF @Name IS NOT NULL
        SET @SQL = @SQL + ', Name = ''' + @Name + '''';
    IF @Description IS NOT NULL
        SET @SQL = @SQL + ', Description = ''' + @Description + '''';
    IF @Image IS NOT NULL
        SET @SQL = @SQL + ', Image = ''' + @Image + '''';
    IF @CategoryId IS NOT NULL
        SET @SQL = @SQL + ', CategoryId = ''' + @CategoryId + '''';
    IF @Price IS NOT NULL
        SET @SQL = @SQL + ', Price = ' + CAST(@Price AS NVARCHAR(20));
    IF @OriginalPrice IS NOT NULL
        SET @SQL = @SQL + ', OriginalPrice = ' + CAST(@OriginalPrice AS NVARCHAR(20));
    IF @Stock IS NOT NULL
        SET @SQL = @SQL + ', Stock = ' + CAST(@Stock AS NVARCHAR(10));
    IF @Status IS NOT NULL
        SET @SQL = @SQL + ', Status = ''' + @Status + '''';
    IF @AgeRange IS NOT NULL
        SET @SQL = @SQL + ', AgeRange = ''' + @AgeRange + '''';
    IF @BrandId IS NOT NULL
        SET @SQL = @SQL + ', BrandId = ''' + @BrandId + '''';
    IF @Material IS NOT NULL
        SET @SQL = @SQL + ', Material = ''' + @Material + '''';
    IF @DimensionLength IS NOT NULL
        SET @SQL = @SQL + ', DimensionLength = ' + CAST(@DimensionLength AS NVARCHAR(10));
    IF @DimensionWidth IS NOT NULL
        SET @SQL = @SQL + ', DimensionWidth = ' + CAST(@DimensionWidth AS NVARCHAR(10));
    IF @DimensionHeight IS NOT NULL
        SET @SQL = @SQL + ', DimensionHeight = ' + CAST(@DimensionHeight AS NVARCHAR(10));
    IF @Weight IS NOT NULL
        SET @SQL = @SQL + ', Weight = ' + CAST(@Weight AS NVARCHAR(10));
    IF @Colors IS NOT NULL
        SET @SQL = @SQL + ', Colors = ''' + @Colors + '''';
    IF @Tags IS NOT NULL
        SET @SQL = @SQL + ', Tags = ''' + @Tags + '''';

    SET @SQL = @SQL + ' WHERE Id = ''' + @ToyId + ''' AND IsActive = 1';

    -- Execute update
    EXEC sp_executesql @SQL;

    -- Return updated toy
    EXEC sp_GetToyByIdForFrontend @ToyId;
END
GO

-- =====================================================
-- 8. PROCEDURE TO DELETE TOY (SOFT DELETE)
-- =====================================================

CREATE OR ALTER PROCEDURE sp_DeleteToyFromFrontend
    @ToyId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if toy exists
    IF NOT EXISTS (SELECT 1 FROM Toys WHERE Id = @ToyId AND IsActive = 1)
    BEGIN
        RAISERROR('Toy not found', 16, 1);
        RETURN;
    END

    -- Soft delete
    UPDATE Toys
    SET IsActive = 0, UpdatedAt = GETDATE()
    WHERE Id = @ToyId;

    SELECT 'Toy deleted successfully' as message;
END
GO

PRINT 'Frontend-compatible API mapping procedures created successfully!';
PRINT 'Use these procedures to integrate with /apps/toy-management page:';
PRINT '- sp_GetToysForFrontend: Get filtered toys list';
PRINT '- sp_GetToyByIdForFrontend: Get single toy';
PRINT '- sp_CreateToyFromFrontend: Create new toy';
PRINT '- sp_UpdateToyFromFrontend: Update existing toy';
PRINT '- sp_DeleteToyFromFrontend: Delete toy (soft delete)';
PRINT '- vw_ToysForFrontend: Direct view access';
PRINT '- vw_CategoriesForFrontend: Get categories';
PRINT '- vw_BrandsForFrontend: Get brands list';
