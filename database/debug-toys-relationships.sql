-- =====================================================
-- DEBUG TOYS RELATIONSHIPS
-- Check why toys with IsActive=1 are not being returned
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'DEBUGGING TOYS RELATIONSHIPS';
PRINT '==============================================';
PRINT '';

-- 1. Show all toys (regardless of relationships)
PRINT '1. 🧸 All toys in database:';
SELECT 
    Id,
    Name,
    CategoryId,
    BrandId,
    Price,
    Stock,
    Status,
    IsActive,
    CreatedAt
FROM zen50558_ManagementStore.dbo.Toys;

-- 2. Check categories that toys reference
PRINT '';
PRINT '2. 📂 Categories referenced by toys:';
SELECT DISTINCT 
    t.CategoryId,
    c.Name as CategoryName,
    c.IsActive as CategoryIsActive,
    COUNT(t.Id) as ToysCount
FROM zen50558_ManagementStore.dbo.Toys t
LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
GROUP BY t.CategoryId, c.Name, c.IsActive
ORDER BY ToysCount DESC;

-- 3. Check brands that toys reference
PRINT '';
PRINT '3. 🏷️ Brands referenced by toys:';
SELECT DISTINCT 
    t.BrandId,
    b.Name as BrandName,
    b.IsActive as BrandIsActive,
    COUNT(t.Id) as ToysCount
FROM zen50558_ManagementStore.dbo.Toys t
LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
GROUP BY t.BrandId, b.Name, b.IsActive
ORDER BY ToysCount DESC;

-- 4. Test different JOIN strategies
PRINT '';
PRINT '4. 🔗 Testing LEFT JOIN (should show all toys):';
SELECT 
    t.Id,
    t.Name,
    t.CategoryId,
    c.Name as CategoryName,
    c.IsActive as CategoryActive,
    t.BrandId,
    b.Name as BrandName,
    b.IsActive as BrandActive,
    t.IsActive as ToyActive
FROM zen50558_ManagementStore.dbo.Toys t
LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
WHERE t.IsActive = 1;

-- 5. Test INNER JOIN (current stored procedure logic)
PRINT '';
PRINT '5. 🔗 Testing INNER JOIN (current stored procedure logic):';
SELECT 
    t.Id,
    t.Name,
    t.CategoryId,
    c.Name as CategoryName,
    t.BrandId,
    b.Name as BrandName
FROM zen50558_ManagementStore.dbo.Toys t
INNER JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
INNER JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id AND b.IsActive = 1
WHERE t.IsActive = 1;

-- 6. Check for NULL foreign keys
PRINT '';
PRINT '6. 🚨 Toys with NULL foreign keys:';
SELECT 
    Id,
    Name,
    CategoryId,
    BrandId,
    CASE WHEN CategoryId IS NULL THEN 'NULL CategoryId' ELSE 'CategoryId OK' END as CategoryStatus,
    CASE WHEN BrandId IS NULL THEN 'NULL BrandId' ELSE 'BrandId OK' END as BrandStatus
FROM zen50558_ManagementStore.dbo.Toys
WHERE IsActive = 1 AND (CategoryId IS NULL OR BrandId IS NULL);

-- 7. Check for mismatched foreign keys
PRINT '';
PRINT '7. 🚨 Toys with invalid foreign keys:';
SELECT 
    t.Id,
    t.Name,
    t.CategoryId,
    CASE WHEN c.Id IS NULL THEN 'INVALID CategoryId' ELSE 'Valid CategoryId' END as CategoryStatus,
    t.BrandId,
    CASE WHEN b.Id IS NULL THEN 'INVALID BrandId' ELSE 'Valid BrandId' END as BrandStatus
FROM zen50558_ManagementStore.dbo.Toys t
LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
WHERE t.IsActive = 1 AND (c.Id IS NULL OR b.Id IS NULL);

-- 8. Test the exact stored procedure query step by step
PRINT '';
PRINT '8. 🧪 Step-by-step stored procedure logic:';

-- Step 1: Base toys
PRINT 'Step 1 - Active toys:';
SELECT COUNT(*) as ActiveToysCount FROM zen50558_ManagementStore.dbo.Toys WHERE IsActive = 1;

-- Step 2: After category join
PRINT 'Step 2 - After category join:';
SELECT COUNT(*) as AfterCategoryJoin
FROM zen50558_ManagementStore.dbo.Toys t
INNER JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
WHERE t.IsActive = 1;

-- Step 3: After brand join
PRINT 'Step 3 - After brand join:';
SELECT COUNT(*) as AfterBrandJoin
FROM zen50558_ManagementStore.dbo.Toys t
INNER JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
INNER JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id AND b.IsActive = 1
WHERE t.IsActive = 1;

-- 9. Show available categories and brands
PRINT '';
PRINT '9. 📋 Available active categories:';
SELECT Id, Name, IsActive FROM zen50558_ManagementStore.dbo.ToyCategories WHERE IsActive = 1;

PRINT '';
PRINT '10. 📋 Available active brands:';
SELECT Id, Name, IsActive FROM zen50558_ManagementStore.dbo.ToyBrands WHERE IsActive = 1;

-- 11. Recommendations
PRINT '';
PRINT '==============================================';
PRINT 'ANALYSIS AND RECOMMENDATIONS';
PRINT '==============================================';

DECLARE @ActiveToys INT, @AfterCategoryJoin INT, @AfterBrandJoin INT;

SELECT @ActiveToys = COUNT(*) FROM zen50558_ManagementStore.dbo.Toys WHERE IsActive = 1;

SELECT @AfterCategoryJoin = COUNT(*)
FROM zen50558_ManagementStore.dbo.Toys t
INNER JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
WHERE t.IsActive = 1;

SELECT @AfterBrandJoin = COUNT(*)
FROM zen50558_ManagementStore.dbo.Toys t
INNER JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
INNER JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id AND b.IsActive = 1
WHERE t.IsActive = 1;

PRINT 'Active toys: ' + CAST(@ActiveToys AS NVARCHAR(10));
PRINT 'After category join: ' + CAST(@AfterCategoryJoin AS NVARCHAR(10));
PRINT 'After brand join: ' + CAST(@AfterBrandJoin AS NVARCHAR(10));

IF @ActiveToys > 0 AND @AfterCategoryJoin = 0
BEGIN
    PRINT '';
    PRINT '🚨 ISSUE: Toys lost after category join';
    PRINT 'Problem: CategoryId does not match any active category';
    PRINT 'Solution: Fix CategoryId or activate the referenced category';
END
ELSE IF @AfterCategoryJoin > 0 AND @AfterBrandJoin = 0
BEGIN
    PRINT '';
    PRINT '🚨 ISSUE: Toys lost after brand join';
    PRINT 'Problem: BrandId does not match any active brand';
    PRINT 'Solution: Fix BrandId or activate the referenced brand';
END
ELSE IF @AfterBrandJoin > 0
BEGIN
    PRINT '';
    PRINT '✅ JOINS ARE WORKING: Check stored procedure logic or API';
END

GO
