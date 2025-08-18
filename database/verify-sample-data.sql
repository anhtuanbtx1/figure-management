-- =====================================================
-- VERIFY SAMPLE DATA FOR TOY MANAGEMENT
-- Script to check if sample data exists and is properly configured
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'VERIFYING TOY MANAGEMENT SAMPLE DATA';
PRINT '==============================================';

-- =====================================================
-- 1. CHECK CATEGORIES
-- =====================================================
PRINT '';
PRINT '📂 CATEGORIES VERIFICATION:';
PRINT '----------------------------------------';

SELECT
    COUNT(*) as TotalCategories,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as ActiveCategories,
    SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) as InactiveCategories
FROM zen50558_ManagementStore.dbo.ToyCategories;

PRINT '';
PRINT '📋 Categories List:';
SELECT 
    Id,
    Name,
    Slug,
    Color,
    CASE WHEN IsActive = 1 THEN 'Active' ELSE 'Inactive' END as Status
FROM ToyCategories 
ORDER BY Name;

-- =====================================================
-- 2. CHECK BRANDS
-- =====================================================
PRINT '';
PRINT '🏷️ BRANDS VERIFICATION:';
PRINT '----------------------------------------';

SELECT 
    COUNT(*) as TotalBrands,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as ActiveBrands,
    SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) as InactiveBrands
FROM zen50558_ManagementStore.dbo.ToyBrands;

PRINT '';
PRINT '📋 Brands List (First 20):';
SELECT TOP 20
    Id,
    Name,
    CASE WHEN Website IS NOT NULL AND Website != '' THEN 'Yes' ELSE 'No' END as HasWebsite,
    CASE WHEN IsActive = 1 THEN 'Active' ELSE 'Inactive' END as Status
FROM zen50558_ManagementStore.dbo.ToyBrands
ORDER BY Name;

-- =====================================================
-- 3. CHECK TOYS
-- =====================================================
PRINT '';
PRINT '🧸 TOYS VERIFICATION:';
PRINT '----------------------------------------';

SELECT 
    COUNT(*) as TotalToys,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as ActiveToys,
    SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) as InactiveToys,
    SUM(CASE WHEN Status = 'active' THEN 1 ELSE 0 END) as StatusActive,
    SUM(CASE WHEN Stock > 0 THEN 1 ELSE 0 END) as InStock,
    SUM(CASE WHEN Stock = 0 THEN 1 ELSE 0 END) as OutOfStock
FROM zen50558_ManagementStore.dbo.Toys;

-- =====================================================
-- 4. CHECK CATEGORY DISTRIBUTION
-- =====================================================
PRINT '';
PRINT '📊 CATEGORY DISTRIBUTION:';
PRINT '----------------------------------------';

SELECT 
    c.Name as CategoryName,
    COUNT(t.Id) as ToyCount,
    CASE 
        WHEN COUNT(t.Id) = 0 THEN '❌ No toys'
        WHEN COUNT(t.Id) < 3 THEN '⚠️ Few toys'
        ELSE '✅ Good'
    END as Status
FROM ToyCategories c
LEFT JOIN Toys t ON c.Id = t.CategoryId AND t.IsActive = 1
WHERE c.IsActive = 1
GROUP BY c.Id, c.Name
ORDER BY ToyCount DESC, c.Name;

-- =====================================================
-- 5. CHECK BRAND DISTRIBUTION
-- =====================================================
PRINT '';
PRINT '📊 BRAND DISTRIBUTION:';
PRINT '----------------------------------------';

SELECT 
    b.Name as BrandName,
    COUNT(t.Id) as ToyCount,
    CASE 
        WHEN COUNT(t.Id) = 0 THEN '❌ No toys'
        WHEN COUNT(t.Id) < 2 THEN '⚠️ Few toys'
        ELSE '✅ Good'
    END as Status
FROM ToyBrands b
LEFT JOIN Toys t ON b.Id = t.BrandId AND t.IsActive = 1
WHERE b.IsActive = 1
GROUP BY b.Id, b.Name
ORDER BY ToyCount DESC, b.Name;

-- =====================================================
-- 6. CHECK DATA QUALITY
-- =====================================================
PRINT '';
PRINT '🔍 DATA QUALITY CHECK:';
PRINT '----------------------------------------';

-- Check for missing required fields
SELECT 'Categories with missing names' as Issue, COUNT(*) as Count
FROM ToyCategories WHERE Name IS NULL OR Name = ''
UNION ALL
SELECT 'Categories with missing slugs' as Issue, COUNT(*) as Count
FROM ToyCategories WHERE Slug IS NULL OR Slug = ''
UNION ALL
SELECT 'Brands with missing names' as Issue, COUNT(*) as Count
FROM ToyBrands WHERE Name IS NULL OR Name = ''
UNION ALL
SELECT 'Toys with missing names' as Issue, COUNT(*) as Count
FROM Toys WHERE Name IS NULL OR Name = ''
UNION ALL
SELECT 'Toys with invalid prices' as Issue, COUNT(*) as Count
FROM Toys WHERE Price <= 0
UNION ALL
SELECT 'Toys with negative stock' as Issue, COUNT(*) as Count
FROM Toys WHERE Stock < 0
UNION ALL
SELECT 'Toys with missing categories' as Issue, COUNT(*) as Count
FROM Toys t WHERE NOT EXISTS (SELECT 1 FROM ToyCategories c WHERE c.Id = t.CategoryId AND c.IsActive = 1)
UNION ALL
SELECT 'Toys with missing brands' as Issue, COUNT(*) as Count
FROM Toys t WHERE NOT EXISTS (SELECT 1 FROM ToyBrands b WHERE b.Id = t.BrandId AND b.IsActive = 1);

-- =====================================================
-- 7. SAMPLE DATA FOR DROPDOWN TESTING
-- =====================================================
PRINT '';
PRINT '🧪 DROPDOWN TEST DATA:';
PRINT '----------------------------------------';

PRINT 'Categories for dropdown (API format):';
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

PRINT '';
PRINT 'Brands for dropdown (API format):';
SELECT DISTINCT Name as brand
FROM ToyBrands 
WHERE IsActive = 1
ORDER BY Name;

-- =====================================================
-- 8. RECOMMENDATIONS
-- =====================================================
PRINT '';
PRINT '💡 RECOMMENDATIONS:';
PRINT '----------------------------------------';

-- Categories with no toys
IF EXISTS (SELECT 1 FROM ToyCategories c WHERE c.IsActive = 1 AND NOT EXISTS (SELECT 1 FROM Toys t WHERE t.CategoryId = c.Id AND t.IsActive = 1))
BEGIN
    PRINT '⚠️ Some categories have no toys. Consider adding sample toys or hiding empty categories.';
    SELECT 'Empty Category: ' + Name as Recommendation FROM ToyCategories c 
    WHERE c.IsActive = 1 AND NOT EXISTS (SELECT 1 FROM Toys t WHERE t.CategoryId = c.Id AND t.IsActive = 1);
END
ELSE
BEGIN
    PRINT '✅ All categories have toys assigned.';
END

-- Brands with no toys
IF EXISTS (SELECT 1 FROM ToyBrands b WHERE b.IsActive = 1 AND NOT EXISTS (SELECT 1 FROM Toys t WHERE t.BrandId = b.Id AND t.IsActive = 1))
BEGIN
    PRINT '⚠️ Some brands have no toys. Consider adding sample toys or hiding empty brands.';
    SELECT 'Empty Brand: ' + Name as Recommendation FROM ToyBrands b 
    WHERE b.IsActive = 1 AND NOT EXISTS (SELECT 1 FROM Toys t WHERE t.BrandId = b.Id AND t.IsActive = 1);
END
ELSE
BEGIN
    PRINT '✅ All brands have toys assigned.';
END

PRINT '';
PRINT '==============================================';
PRINT 'VERIFICATION COMPLETED!';
PRINT '==============================================';
PRINT '';
PRINT 'Next steps:';
PRINT '1. If data looks good, test the dropdowns in /apps/toy-management';
PRINT '2. If categories/brands are empty, run toy-management-sample-data.sql';
PRINT '3. Test creating new toys with different categories and brands';
PRINT '4. Test filtering by categories and brands';
PRINT '';
GO
