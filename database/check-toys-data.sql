-- =====================================================
-- CHECK TOYS DATA IN DATABASE
-- This script checks why toys are not being returned
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'CHECKING TOYS DATA';
PRINT '==============================================';
PRINT '';

-- 1. Check total toys count
PRINT '1. 📊 Total toys count:';
SELECT COUNT(*) as TotalToys FROM zen50558_ManagementStore.dbo.Toys;

-- 2. Check active toys count
PRINT '';
PRINT '2. ✅ Active toys count:';
SELECT COUNT(*) as ActiveToys FROM zen50558_ManagementStore.dbo.Toys WHERE IsActive = 1;

-- 3. Check toys by IsActive status
PRINT '';
PRINT '3. 📋 Toys by IsActive status:';
SELECT 
    IsActive,
    COUNT(*) as Count
FROM zen50558_ManagementStore.dbo.Toys 
GROUP BY IsActive;

-- 4. Show all toys with their details
PRINT '';
PRINT '4. 🧸 All toys details:';
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

-- 5. Check toys with category and brand relationships
PRINT '';
PRINT '5. 🔗 Toys with relationships:';
SELECT 
    t.Id as ToyId,
    t.Name as ToyName,
    t.CategoryId,
    c.Name as CategoryName,
    c.IsActive as CategoryActive,
    t.BrandId,
    b.Name as BrandName,
    b.IsActive as BrandActive,
    t.IsActive as ToyActive
FROM zen50558_ManagementStore.dbo.Toys t
LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id;

-- 6. Check for orphaned toys (toys with invalid CategoryId or BrandId)
PRINT '';
PRINT '6. 🚨 Orphaned toys (invalid foreign keys):';
SELECT 
    t.Id,
    t.Name,
    t.CategoryId,
    CASE WHEN c.Id IS NULL THEN 'MISSING CATEGORY' ELSE 'Category OK' END as CategoryStatus,
    t.BrandId,
    CASE WHEN b.Id IS NULL THEN 'MISSING BRAND' ELSE 'Brand OK' END as BrandStatus,
    t.IsActive
FROM zen50558_ManagementStore.dbo.Toys t
LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id AND b.IsActive = 1
WHERE c.Id IS NULL OR b.Id IS NULL;

-- 7. Test the exact query that stored procedure uses
PRINT '';
PRINT '7. 🧪 Testing stored procedure query:';
SELECT 
    t.Id as id,
    t.Name as name,
    t.Description as description,
    t.Image as image,
    t.Price as price,
    t.Stock as stock,
    t.Status as status,
    t.IsActive as toyActive,
    c.IsActive as categoryActive,
    b.IsActive as brandActive
FROM zen50558_ManagementStore.dbo.Toys t
LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
WHERE t.IsActive = 1;

-- 8. Test with relaxed conditions (show all toys regardless of foreign keys)
PRINT '';
PRINT '8. 🔓 All active toys (ignoring foreign key issues):';
SELECT 
    Id,
    Name,
    CategoryId,
    BrandId,
    Price,
    Stock,
    Status,
    IsActive
FROM zen50558_ManagementStore.dbo.Toys 
WHERE IsActive = 1;

-- 9. Check if stored procedure exists and test it
PRINT '';
PRINT '9. 🔧 Testing stored procedure:';
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_GetToysForFrontend')
BEGIN
    PRINT 'sp_GetToysForFrontend exists. Testing...';
    BEGIN TRY
        EXEC sp_GetToysForFrontend @Page = 1, @PageSize = 10;
        PRINT '✅ Stored procedure executed successfully';
    END TRY
    BEGIN CATCH
        PRINT '❌ Stored procedure error: ' + ERROR_MESSAGE();
    END CATCH
END
ELSE
BEGIN
    PRINT '❌ sp_GetToysForFrontend does not exist';
END

-- 10. Recommendations
PRINT '';
PRINT '==============================================';
PRINT 'RECOMMENDATIONS';
PRINT '==============================================';
PRINT '';

DECLARE @TotalToys INT, @ActiveToys INT, @OrphanedToys INT;

SELECT @TotalToys = COUNT(*) FROM zen50558_ManagementStore.dbo.Toys;
SELECT @ActiveToys = COUNT(*) FROM zen50558_ManagementStore.dbo.Toys WHERE IsActive = 1;
SELECT @OrphanedToys = COUNT(*) 
FROM zen50558_ManagementStore.dbo.Toys t
LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id AND c.IsActive = 1
LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id AND b.IsActive = 1
WHERE (c.Id IS NULL OR b.Id IS NULL) AND t.IsActive = 1;

IF @TotalToys = 0
BEGIN
    PRINT '🚨 NO TOYS FOUND - Need to add sample data';
    PRINT 'Run: sqlcmd -i database\toy-management-sample-data.sql';
END
ELSE IF @ActiveToys = 0
BEGIN
    PRINT '🚨 NO ACTIVE TOYS - All toys have IsActive = 0';
    PRINT 'Fix: UPDATE zen50558_ManagementStore.dbo.Toys SET IsActive = 1;';
END
ELSE IF @OrphanedToys > 0
BEGIN
    PRINT '🚨 ORPHANED TOYS FOUND - Invalid CategoryId or BrandId';
    PRINT 'Fix foreign key relationships or create missing categories/brands';
END
ELSE
BEGIN
    PRINT '✅ Data looks good - Check stored procedure or API logic';
END

PRINT '';
PRINT 'Total toys: ' + CAST(@TotalToys AS NVARCHAR(10));
PRINT 'Active toys: ' + CAST(@ActiveToys AS NVARCHAR(10));
PRINT 'Orphaned toys: ' + CAST(@OrphanedToys AS NVARCHAR(10));

GO
