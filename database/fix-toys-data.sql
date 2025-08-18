-- =====================================================
-- FIX TOYS DATA ISSUES
-- This script fixes common issues that prevent toys from showing up
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'FIXING TOYS DATA ISSUES';
PRINT '==============================================';
PRINT '';

-- 1. Check current state
DECLARE @TotalToys INT, @ActiveToys INT;
SELECT @TotalToys = COUNT(*) FROM zen50558_ManagementStore.dbo.Toys;
SELECT @ActiveToys = COUNT(*) FROM zen50558_ManagementStore.dbo.Toys WHERE IsActive = 1;

PRINT 'Current state:';
PRINT 'Total toys: ' + CAST(@TotalToys AS NVARCHAR(10));
PRINT 'Active toys: ' + CAST(@ActiveToys AS NVARCHAR(10));
PRINT '';

-- 2. Fix IsActive = 0 issue
IF @TotalToys > 0 AND @ActiveToys = 0
BEGIN
    PRINT '🔧 Fixing IsActive = 0 issue...';
    UPDATE zen50558_ManagementStore.dbo.Toys SET IsActive = 1 WHERE IsActive = 0;
    PRINT '✅ Set all toys to IsActive = 1';
    PRINT '';
END

-- 3. Check and fix orphaned toys (invalid foreign keys)
PRINT '🔧 Checking for orphaned toys...';

-- Find toys with invalid CategoryId
DECLARE @OrphanedByCategory INT;
SELECT @OrphanedByCategory = COUNT(*)
FROM zen50558_ManagementStore.dbo.Toys t
LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
WHERE c.Id IS NULL AND t.IsActive = 1;

-- Find toys with invalid BrandId
DECLARE @OrphanedByBrand INT;
SELECT @OrphanedByBrand = COUNT(*)
FROM zen50558_ManagementStore.dbo.Toys t
LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
WHERE b.Id IS NULL AND t.IsActive = 1;

PRINT 'Toys with invalid CategoryId: ' + CAST(@OrphanedByCategory AS NVARCHAR(10));
PRINT 'Toys with invalid BrandId: ' + CAST(@OrphanedByBrand AS NVARCHAR(10));

-- Fix orphaned toys by assigning them to existing categories/brands
IF @OrphanedByCategory > 0
BEGIN
    PRINT '🔧 Fixing toys with invalid CategoryId...';
    
    -- Get first available category
    DECLARE @FirstCategoryId NVARCHAR(50);
    SELECT TOP 1 @FirstCategoryId = Id FROM zen50558_ManagementStore.dbo.ToyCategories WHERE IsActive = 1 ORDER BY Name;
    
    IF @FirstCategoryId IS NOT NULL
    BEGIN
        UPDATE zen50558_ManagementStore.dbo.Toys 
        SET CategoryId = @FirstCategoryId
        WHERE CategoryId NOT IN (SELECT Id FROM zen50558_ManagementStore.dbo.ToyCategories WHERE IsActive = 1)
        AND IsActive = 1;
        
        PRINT '✅ Fixed toys with invalid CategoryId, assigned to: ' + @FirstCategoryId;
    END
    ELSE
    BEGIN
        PRINT '❌ No active categories found to assign orphaned toys';
    END
END

IF @OrphanedByBrand > 0
BEGIN
    PRINT '🔧 Fixing toys with invalid BrandId...';
    
    -- Get first available brand
    DECLARE @FirstBrandId NVARCHAR(50);
    SELECT TOP 1 @FirstBrandId = Id FROM zen50558_ManagementStore.dbo.ToyBrands WHERE IsActive = 1 ORDER BY Name;
    
    IF @FirstBrandId IS NOT NULL
    BEGIN
        UPDATE zen50558_ManagementStore.dbo.Toys 
        SET BrandId = @FirstBrandId
        WHERE BrandId NOT IN (SELECT Id FROM zen50558_ManagementStore.dbo.ToyBrands WHERE IsActive = 1)
        AND IsActive = 1;
        
        PRINT '✅ Fixed toys with invalid BrandId, assigned to: ' + @FirstBrandId;
    END
    ELSE
    BEGIN
        PRINT '❌ No active brands found to assign orphaned toys';
    END
END

-- 4. Ensure required fields are not NULL
PRINT '';
PRINT '🔧 Fixing NULL values in required fields...';

UPDATE zen50558_ManagementStore.dbo.Toys 
SET 
    Name = ISNULL(Name, 'Unnamed Toy'),
    Description = ISNULL(Description, 'No description available'),
    Image = ISNULL(Image, '/images/toys/default.jpg'),
    Price = ISNULL(Price, 0),
    Stock = ISNULL(Stock, 0),
    Status = ISNULL(Status, 'active'),
    Colors = ISNULL(Colors, '[]'),
    Tags = ISNULL(Tags, '[]'),
    Rating = ISNULL(Rating, 0),
    ReviewCount = ISNULL(ReviewCount, 0),
    IsNew = ISNULL(IsNew, 0),
    IsFeatured = ISNULL(IsFeatured, 0),
    Discount = ISNULL(Discount, 0),
    DimensionLength = ISNULL(DimensionLength, 0),
    DimensionWidth = ISNULL(DimensionWidth, 0),
    DimensionHeight = ISNULL(DimensionHeight, 0),
    Weight = ISNULL(Weight, 0)
WHERE IsActive = 1;

PRINT '✅ Fixed NULL values in required fields';

-- 5. Add sample toy if no toys exist
SELECT @ActiveToys = COUNT(*) FROM zen50558_ManagementStore.dbo.Toys WHERE IsActive = 1;

IF @ActiveToys = 0
BEGIN
    PRINT '';
    PRINT '🔧 No active toys found. Adding sample toy...';
    
    -- Get first category and brand
    DECLARE @SampleCategoryId NVARCHAR(50), @SampleBrandId NVARCHAR(50);
    SELECT TOP 1 @SampleCategoryId = Id FROM zen50558_ManagementStore.dbo.ToyCategories WHERE IsActive = 1;
    SELECT TOP 1 @SampleBrandId = Id FROM zen50558_ManagementStore.dbo.ToyBrands WHERE IsActive = 1;
    
    IF @SampleCategoryId IS NOT NULL AND @SampleBrandId IS NOT NULL
    BEGIN
        INSERT INTO zen50558_ManagementStore.dbo.Toys (
            Id, Name, Description, Image, CategoryId, BrandId, Price, OriginalPrice, Stock,
            Status, AgeRange, Material, DimensionLength, DimensionWidth, DimensionHeight, Weight,
            Colors, Tags, Rating, ReviewCount, IsActive, IsNew, IsFeatured, Discount,
            CreatedAt, UpdatedAt
        ) VALUES (
            'toy-sample-001',
            N'Đồ chơi mẫu',
            N'Đây là đồ chơi mẫu để test hệ thống',
            '/images/toys/sample.jpg',
            @SampleCategoryId,
            @SampleBrandId,
            299000,
            399000,
            10,
            'active',
            N'3-8 tuổi',
            N'Nhựa ABS',
            20.5,
            15.0,
            10.0,
            300.0,
            '["Đỏ", "Xanh"]',
            '["Mẫu", "Test"]',
            4.5,
            12,
            1,
            1,
            0,
            25.06,
            GETDATE(),
            GETDATE()
        );
        
        PRINT '✅ Added sample toy successfully';
    END
    ELSE
    BEGIN
        PRINT '❌ Cannot add sample toy - no categories or brands available';
    END
END

-- 6. Final verification
PRINT '';
PRINT '==============================================';
PRINT 'FINAL VERIFICATION';
PRINT '==============================================';

SELECT @TotalToys = COUNT(*) FROM zen50558_ManagementStore.dbo.Toys;
SELECT @ActiveToys = COUNT(*) FROM zen50558_ManagementStore.dbo.Toys WHERE IsActive = 1;

PRINT 'After fixes:';
PRINT 'Total toys: ' + CAST(@TotalToys AS NVARCHAR(10));
PRINT 'Active toys: ' + CAST(@ActiveToys AS NVARCHAR(10));

-- Show active toys with relationships
PRINT '';
PRINT 'Active toys with relationships:';
SELECT 
    t.Id,
    t.Name,
    c.Name as CategoryName,
    b.Name as BrandName,
    t.Price,
    t.Stock,
    t.IsActive
FROM zen50558_ManagementStore.dbo.Toys t
INNER JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
INNER JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id AND b.IsActive = 1
WHERE t.IsActive = 1;

-- Test stored procedure
PRINT '';
PRINT 'Testing stored procedure:';
BEGIN TRY
    EXEC sp_GetToysForFrontend @Page = 1, @PageSize = 5;
    PRINT '✅ Stored procedure test: SUCCESS';
END TRY
BEGIN CATCH
    PRINT '❌ Stored procedure test: ERROR - ' + ERROR_MESSAGE();
END CATCH

PRINT '';
PRINT '==============================================';
PRINT 'TOYS DATA FIX COMPLETED';
PRINT '==============================================';
GO
