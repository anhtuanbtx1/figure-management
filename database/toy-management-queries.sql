-- =====================================================
-- TOY MANAGEMENT - SAMPLE QUERIES & API ENDPOINTS
-- Common queries for the Toy Management System
-- =====================================================

USE zen50558_ManagementStore;
GO

-- =====================================================
-- 1. BASIC QUERIES
-- =====================================================

-- Get all toys with category and brand info
SELECT 
    t.Id,
    t.Name,
    t.Description,
    t.Image,
    c.Name as CategoryName,
    c.Icon as CategoryIcon,
    b.Name as BrandName,
    t.Price,
    t.OriginalPrice,
    t.Stock,
    t.Status,
    t.AgeRange,
    t.Rating,
    t.ReviewCount,
    t.IsNew,
    t.IsFeatured,
    t.Discount,
    t.CreatedAt
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
WHERE t.IsActive = 1
ORDER BY t.CreatedAt DESC;

-- Get toys by category
SELECT t.*, c.Name as CategoryName, b.Name as BrandName
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
WHERE c.Slug = 'educational-toys' AND t.IsActive = 1
ORDER BY t.Rating DESC;

-- Get featured toys
SELECT t.*, c.Name as CategoryName, b.Name as BrandName
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
WHERE t.IsFeatured = 1 AND t.IsActive = 1 AND t.Status = 'active'
ORDER BY t.Rating DESC;

-- Get new arrivals
SELECT t.*, c.Name as CategoryName, b.Name as BrandName
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
WHERE t.IsNew = 1 AND t.IsActive = 1 AND t.Status = 'active'
ORDER BY t.CreatedAt DESC;

-- =====================================================
-- 2. SEARCH & FILTER QUERIES
-- =====================================================

-- Search toys by name or description
DECLARE @SearchTerm NVARCHAR(255) = N'lego';
SELECT t.*, c.Name as CategoryName, b.Name as BrandName
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
WHERE (t.Name LIKE '%' + @SearchTerm + '%' OR t.Description LIKE '%' + @SearchTerm + '%')
    AND t.IsActive = 1
ORDER BY t.Rating DESC;

-- Filter by price range
DECLARE @MinPrice DECIMAL(18,2) = 500000;
DECLARE @MaxPrice DECIMAL(18,2) = 1500000;
SELECT t.*, c.Name as CategoryName, b.Name as BrandName
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
WHERE t.Price BETWEEN @MinPrice AND @MaxPrice
    AND t.IsActive = 1 AND t.Status = 'active'
ORDER BY t.Price ASC;

-- Filter by age range
SELECT t.*, c.Name as CategoryName, b.Name as BrandName
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
WHERE t.AgeRange LIKE '%3-6%' AND t.IsActive = 1
ORDER BY t.Rating DESC;

-- Filter by brand
SELECT t.*, c.Name as CategoryName, b.Name as BrandName
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
WHERE b.Name = 'LEGO' AND t.IsActive = 1
ORDER BY t.Price ASC;

-- =====================================================
-- 3. STATISTICS & ANALYTICS
-- =====================================================

-- Category statistics
SELECT 
    c.Name as CategoryName,
    COUNT(t.Id) as ToyCount,
    AVG(t.Price) as AvgPrice,
    MIN(t.Price) as MinPrice,
    MAX(t.Price) as MaxPrice,
    SUM(t.Stock) as TotalStock,
    AVG(t.Rating) as AvgRating
FROM ToyCategories c
LEFT JOIN Toys t ON c.Id = t.CategoryId AND t.IsActive = 1
GROUP BY c.Id, c.Name
ORDER BY ToyCount DESC;

-- Brand statistics
SELECT 
    b.Name as BrandName,
    COUNT(t.Id) as ToyCount,
    AVG(t.Price) as AvgPrice,
    AVG(t.Rating) as AvgRating,
    SUM(t.ReviewCount) as TotalReviews
FROM ToyBrands b
LEFT JOIN Toys t ON b.Id = t.BrandId AND t.IsActive = 1
GROUP BY b.Id, b.Name
ORDER BY ToyCount DESC;

-- Stock status overview
SELECT 
    Status,
    COUNT(*) as Count,
    SUM(Stock) as TotalStock,
    AVG(Price) as AvgPrice
FROM Toys 
WHERE IsActive = 1
GROUP BY Status;

-- Top rated toys
SELECT TOP 10
    t.Name,
    t.Rating,
    t.ReviewCount,
    t.Price,
    c.Name as CategoryName,
    b.Name as BrandName
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
WHERE t.IsActive = 1 AND t.ReviewCount >= 10
ORDER BY t.Rating DESC, t.ReviewCount DESC;

-- Low stock alert
SELECT 
    t.Name,
    t.Stock,
    t.Status,
    c.Name as CategoryName,
    b.Name as BrandName
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
WHERE t.Stock <= 5 AND t.IsActive = 1 AND t.Status = 'active'
ORDER BY t.Stock ASC;

-- =====================================================
-- 4. CRUD OPERATIONS
-- =====================================================

-- Insert new toy
/*
INSERT INTO Toys (
    Id, Name, Description, Image, CategoryId, BrandId, Price, OriginalPrice, Stock, Status,
    AgeRange, Material, DimensionLength, DimensionWidth, DimensionHeight, Weight,
    Colors, Tags, IsNew, IsFeatured, Discount
) VALUES (
    'toy-new-001', 
    N'Tên đồ chơi mới', 
    N'Mô tả chi tiết về đồ chơi', 
    '/images/toys/new-toy.jpg',
    'cat-001', 
    'brand-001', 
    999000, 
    1199000, 
    50, 
    'active',
    '3-8 tuổi', 
    'Nhựa ABS', 
    30.0, 25.0, 15.0, 1.0,
    '["Đỏ", "Xanh", "Vàng"]', 
    '["Mới", "Giáo dục", "Sáng tạo"]', 
    1, 0, 16.68
);
*/

-- Update toy information
/*
UPDATE Toys 
SET 
    Name = N'Tên đã cập nhật',
    Price = 899000,
    Stock = 45,
    UpdatedAt = GETDATE(),
    UpdatedBy = 'Admin'
WHERE Id = 'toy-001';
*/

-- Update toy status
/*
UPDATE Toys 
SET Status = 'inactive', UpdatedAt = GETDATE()
WHERE Id = 'toy-001';
*/

-- Soft delete toy
/*
UPDATE Toys 
SET IsActive = 0, UpdatedAt = GETDATE()
WHERE Id = 'toy-001';
*/

-- =====================================================
-- 5. COMPLEX QUERIES FOR DASHBOARD
-- =====================================================

-- Dashboard summary
SELECT 
    (SELECT COUNT(*) FROM Toys WHERE IsActive = 1) as TotalToys,
    (SELECT COUNT(*) FROM Toys WHERE IsActive = 1 AND Status = 'active') as ActiveToys,
    (SELECT COUNT(*) FROM Toys WHERE IsActive = 1 AND Stock <= 5) as LowStockToys,
    (SELECT COUNT(*) FROM Toys WHERE IsActive = 1 AND IsNew = 1) as NewToys,
    (SELECT AVG(Rating) FROM Toys WHERE IsActive = 1) as AvgRating,
    (SELECT SUM(Stock) FROM Toys WHERE IsActive = 1) as TotalStock,
    (SELECT COUNT(*) FROM ToyCategories WHERE IsActive = 1) as TotalCategories,
    (SELECT COUNT(*) FROM ToyBrands WHERE IsActive = 1) as TotalBrands;

-- Monthly sales trend (assuming you have sales data)
/*
SELECT 
    YEAR(CreatedAt) as Year,
    MONTH(CreatedAt) as Month,
    COUNT(*) as ToysAdded,
    AVG(Price) as AvgPrice
FROM Toys 
WHERE IsActive = 1 AND CreatedAt >= DATEADD(MONTH, -12, GETDATE())
GROUP BY YEAR(CreatedAt), MONTH(CreatedAt)
ORDER BY Year DESC, Month DESC;
*/

-- Price distribution
SELECT 
    CASE 
        WHEN Price < 500000 THEN 'Dưới 500K'
        WHEN Price < 1000000 THEN '500K - 1M'
        WHEN Price < 2000000 THEN '1M - 2M'
        ELSE 'Trên 2M'
    END as PriceRange,
    COUNT(*) as Count,
    AVG(Rating) as AvgRating
FROM Toys 
WHERE IsActive = 1
GROUP BY 
    CASE 
        WHEN Price < 500000 THEN 'Dưới 500K'
        WHEN Price < 1000000 THEN '500K - 1M'
        WHEN Price < 2000000 THEN '1M - 2M'
        ELSE 'Trên 2M'
    END
ORDER BY MIN(Price);

-- =====================================================
-- 6. UTILITY QUERIES
-- =====================================================

-- Reset all toy ratings (recalculate from reviews)
/*
UPDATE t
SET 
    Rating = COALESCE(rs.AvgRating, 0),
    ReviewCount = COALESCE(rs.ReviewCount, 0),
    UpdatedAt = GETDATE()
FROM Toys t
LEFT JOIN (
    SELECT 
        ToyId,
        AVG(CAST(Rating AS DECIMAL(3,2))) as AvgRating,
        COUNT(*) as ReviewCount
    FROM ToyReviews 
    WHERE IsApproved = 1
    GROUP BY ToyId
) rs ON t.Id = rs.ToyId
WHERE t.IsActive = 1;
*/

-- Clean up orphaned records
/*
DELETE FROM ToyImages WHERE ToyId NOT IN (SELECT Id FROM Toys);
DELETE FROM ToyReviews WHERE ToyId NOT IN (SELECT Id FROM Toys);
*/

-- Backup important data
/*
SELECT * INTO Toys_Backup FROM Toys;
SELECT * INTO ToyCategories_Backup FROM ToyCategories;
SELECT * INTO ToyBrands_Backup FROM ToyBrands;
*/

PRINT 'Sample queries ready for Toy Management System!';
