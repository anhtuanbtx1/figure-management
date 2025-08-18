-- =====================================================
-- TOY MANAGEMENT DATABASE SCHEMA
-- SQL Server Database Schema for Toy Management System
-- =====================================================

-- Use the existing database
USE zen50558_ManagementStore;
GO

-- =====================================================
-- 1. CREATE CATEGORIES TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ToyCategories' AND xtype='U')
BEGIN
    CREATE TABLE zen50558_ManagementStore.dbo.ToyCategories (
        Id NVARCHAR(50) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Slug NVARCHAR(255) NOT NULL UNIQUE,
        Description NVARCHAR(MAX),
        Icon NVARCHAR(255),
        Color NVARCHAR(50),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        IsActive BIT NOT NULL DEFAULT 1
    );

    -- Create indexes for better performance
    CREATE INDEX IX_ToyCategories_Slug ON ToyCategories(Slug);
    CREATE INDEX IX_ToyCategories_Name ON ToyCategories(Name);
    CREATE INDEX IX_ToyCategories_IsActive ON ToyCategories(IsActive);

    PRINT 'ToyCategories table created successfully';
END
ELSE
BEGIN
    PRINT 'ToyCategories table already exists';
END
GO

-- =====================================================
-- 2. CREATE BRANDS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ToyBrands' AND xtype='U')
BEGIN
    CREATE TABLE zen50558_ManagementStore.dbo.ToyBrands (
        Id NVARCHAR(50) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL UNIQUE,
        Description NVARCHAR(MAX),
        Logo NVARCHAR(255),
        Website NVARCHAR(255),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        IsActive BIT NOT NULL DEFAULT 1
    );

    -- Create indexes
    CREATE INDEX IX_ToyBrands_Name ON ToyBrands(Name);
    CREATE INDEX IX_ToyBrands_IsActive ON ToyBrands(IsActive);

    PRINT 'ToyBrands table created successfully';
END
ELSE
BEGIN
    PRINT 'ToyBrands table already exists';
END
GO

-- =====================================================
-- 3. CREATE TOYS TABLE (MAIN TABLE)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Toys' AND xtype='U')
BEGIN
    CREATE TABLE zen50558_ManagementStore.dbo.Toys (
        Id NVARCHAR(50) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NOT NULL,
        Image NVARCHAR(500),
        CategoryId NVARCHAR(50) NOT NULL,
        BrandId NVARCHAR(50) NOT NULL,
        Price DECIMAL(18,2) NOT NULL,
        OriginalPrice DECIMAL(18,2),
        Stock INT NOT NULL DEFAULT 0,
        Status NVARCHAR(20) NOT NULL DEFAULT 'active',
        AgeRange NVARCHAR(50),
        Material NVARCHAR(255),
        
        -- Dimensions (stored as separate columns for easier querying)
        DimensionLength DECIMAL(10,2),
        DimensionWidth DECIMAL(10,2),
        DimensionHeight DECIMAL(10,2),
        Weight DECIMAL(10,2),
        
        -- JSON fields for arrays
        Colors NVARCHAR(MAX), -- JSON array of colors
        Tags NVARCHAR(MAX),   -- JSON array of tags
        
        -- Rating and reviews
        Rating DECIMAL(3,2) DEFAULT 0,
        ReviewCount INT DEFAULT 0,
        
        -- Flags
        IsNew BIT DEFAULT 0,
        IsFeatured BIT DEFAULT 0,
        Discount DECIMAL(5,2) DEFAULT 0,
        
        -- Audit fields
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CreatedBy NVARCHAR(255) DEFAULT 'System',
        UpdatedBy NVARCHAR(255),
        IsActive BIT NOT NULL DEFAULT 1,
        
        -- Foreign key constraints
        CONSTRAINT FK_Toys_Category FOREIGN KEY (CategoryId) REFERENCES ToyCategories(Id),
        CONSTRAINT FK_Toys_Brand FOREIGN KEY (BrandId) REFERENCES ToyBrands(Id)
    );

    -- Create indexes for better performance
    CREATE INDEX IX_Toys_CategoryId ON Toys(CategoryId);
    CREATE INDEX IX_Toys_BrandId ON Toys(BrandId);
    CREATE INDEX IX_Toys_Status ON Toys(Status);
    CREATE INDEX IX_Toys_Price ON Toys(Price);
    CREATE INDEX IX_Toys_Stock ON Toys(Stock);
    CREATE INDEX IX_Toys_Rating ON Toys(Rating);
    CREATE INDEX IX_Toys_CreatedAt ON Toys(CreatedAt);
    CREATE INDEX IX_Toys_Name ON Toys(Name);
    CREATE INDEX IX_Toys_IsActive ON Toys(IsActive);
    CREATE INDEX IX_Toys_IsFeatured ON Toys(IsFeatured);
    CREATE INDEX IX_Toys_IsNew ON Toys(IsNew);

    -- Add check constraints
    ALTER TABLE Toys 
    ADD CONSTRAINT CK_Toys_Status 
    CHECK (Status IN ('active', 'inactive', 'out_of_stock', 'discontinued'));

    ALTER TABLE Toys 
    ADD CONSTRAINT CK_Toys_Price 
    CHECK (Price >= 0);

    ALTER TABLE Toys 
    ADD CONSTRAINT CK_Toys_Stock 
    CHECK (Stock >= 0);

    ALTER TABLE Toys 
    ADD CONSTRAINT CK_Toys_Rating 
    CHECK (Rating >= 0 AND Rating <= 5);

    ALTER TABLE Toys 
    ADD CONSTRAINT CK_Toys_Discount 
    CHECK (Discount >= 0 AND Discount <= 100);

    PRINT 'Toys table created successfully';
END
ELSE
BEGIN
    PRINT 'Toys table already exists';
END
GO

-- =====================================================
-- 4. CREATE TOY IMAGES TABLE (FOR MULTIPLE IMAGES)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ToyImages' AND xtype='U')
BEGIN
    CREATE TABLE ToyImages (
        Id NVARCHAR(50) PRIMARY KEY,
        ToyId NVARCHAR(50) NOT NULL,
        ImageUrl NVARCHAR(500) NOT NULL,
        AltText NVARCHAR(255),
        IsPrimary BIT DEFAULT 0,
        SortOrder INT DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_ToyImages_Toy FOREIGN KEY (ToyId) REFERENCES Toys(Id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX IX_ToyImages_ToyId ON ToyImages(ToyId);
    CREATE INDEX IX_ToyImages_IsPrimary ON ToyImages(IsPrimary);
    CREATE INDEX IX_ToyImages_SortOrder ON ToyImages(SortOrder);

    PRINT 'ToyImages table created successfully';
END
ELSE
BEGIN
    PRINT 'ToyImages table already exists';
END
GO

-- =====================================================
-- 5. CREATE TOY REVIEWS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ToyReviews' AND xtype='U')
BEGIN
    CREATE TABLE ToyReviews (
        Id NVARCHAR(50) PRIMARY KEY,
        ToyId NVARCHAR(50) NOT NULL,
        CustomerName NVARCHAR(255) NOT NULL,
        CustomerEmail NVARCHAR(255),
        Rating INT NOT NULL,
        Title NVARCHAR(255),
        Comment NVARCHAR(MAX),
        IsVerified BIT DEFAULT 0,
        IsApproved BIT DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_ToyReviews_Toy FOREIGN KEY (ToyId) REFERENCES Toys(Id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX IX_ToyReviews_ToyId ON ToyReviews(ToyId);
    CREATE INDEX IX_ToyReviews_Rating ON ToyReviews(Rating);
    CREATE INDEX IX_ToyReviews_IsApproved ON ToyReviews(IsApproved);
    CREATE INDEX IX_ToyReviews_CreatedAt ON ToyReviews(CreatedAt);

    -- Add check constraint for rating
    ALTER TABLE ToyReviews 
    ADD CONSTRAINT CK_ToyReviews_Rating 
    CHECK (Rating >= 1 AND Rating <= 5);

    PRINT 'ToyReviews table created successfully';
END
ELSE
BEGIN
    PRINT 'ToyReviews table already exists';
END
GO

-- =====================================================
-- 6. INSERT SAMPLE CATEGORIES
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.ToyCategories)
BEGIN
    INSERT INTO zen50558_ManagementStore.dbo.ToyCategories (Id, Name, Slug, Description, Icon, Color) VALUES
    ('cat-001', N'Đồ chơi giáo dục', 'educational-toys', N'Đồ chơi phát triển trí tuệ và kỹ năng học tập', 'school', '#4CAF50'),
    ('cat-002', N'Đồ chơi xây dựng', 'building-toys', N'Lego, khối xây dựng và đồ chơi lắp ráp', 'build', '#2196F3'),
    ('cat-003', N'Búp bê & Nhân vật', 'dolls-figures', N'Búp bê, nhân vật hoạt hình và phụ kiện', 'person', '#E91E63'),
    ('cat-004', N'Xe đồ chơi', 'toy-vehicles', N'Ô tô, máy bay, tàu thuyền đồ chơi', 'car', '#FF9800'),
    ('cat-005', N'Đồ chơi thể thao', 'sports-toys', N'Bóng, vợt, đồ chơi hoạt động ngoài trời', 'ball', '#9C27B0'),
    ('cat-006', N'Đồ chơi điện tử', 'electronic-toys', N'Robot, đồ chơi điều khiển từ xa', 'robot', '#607D8B'),
    ('cat-007', N'Đồ chơi nghệ thuật', 'art-craft', N'Bút màu, đất nặn, đồ chơi sáng tạo', 'palette', '#795548'),
    ('cat-008', N'Đồ chơi âm nhạc', 'musical-toys', N'Đàn piano, trống, nhạc cụ đồ chơi', 'music', '#FF5722');

    PRINT 'Sample categories inserted successfully';
END
ELSE
BEGIN
    PRINT 'Categories already exist';
END
GO

-- =====================================================
-- 7. INSERT SAMPLE BRANDS
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.ToyBrands)
BEGIN
    INSERT INTO zen50558_ManagementStore.dbo.ToyBrands (Id, Name, Description, Website) VALUES
    ('brand-001', 'LEGO', N'Thương hiệu đồ chơi xây dựng nổi tiếng thế giới', 'https://www.lego.com'),
    ('brand-002', 'Mattel', N'Công ty đồ chơi đa quốc gia, sản xuất Barbie, Hot Wheels', 'https://www.mattel.com'),
    ('brand-003', 'Hasbro', N'Nhà sản xuất đồ chơi và trò chơi hàng đầu', 'https://www.hasbro.com'),
    ('brand-004', 'Fisher-Price', N'Chuyên về đồ chơi giáo dục cho trẻ em', 'https://www.fisher-price.com'),
    ('brand-005', 'Playmobil', N'Đồ chơi nhân vật và bộ sưu tập', 'https://www.playmobil.com'),
    ('brand-006', 'VTech', N'Đồ chơi điện tử giáo dục', 'https://www.vtech.com'),
    ('brand-007', 'Melissa & Doug', N'Đồ chơi gỗ và giáo dục sáng tạo', 'https://www.melissaanddoug.com'),
    ('brand-008', 'Bandai', N'Đồ chơi nhân vật anime và mô hình', 'https://www.bandai.com'),
    ('brand-009', 'Disney', N'Đồ chơi nhân vật Disney', 'https://www.disney.com'),
    ('brand-010', 'Nerf', N'Đồ chơi súng bắn đạn xốp', 'https://www.nerf.com');

    PRINT 'Sample brands inserted successfully';
END
ELSE
BEGIN
    PRINT 'Brands already exist';
END
GO

-- =====================================================
-- 8. INSERT SAMPLE TOYS
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.Toys)
BEGIN
    INSERT INTO zen50558_ManagementStore.dbo.Toys (
        Id, Name, Description, Image, CategoryId, BrandId, Price, OriginalPrice, Stock, Status,
        AgeRange, Material, DimensionLength, DimensionWidth, DimensionHeight, Weight,
        Colors, Tags, Rating, ReviewCount, IsNew, IsFeatured, Discount
    ) VALUES
    -- Educational Toys
    ('toy-001', N'Bộ Lego Creator 3-in-1', N'Bộ đồ chơi xây dựng đa năng, có thể tạo ra 3 mô hình khác nhau. Phát triển tư duy logic và khả năng sáng tạo cho trẻ.',
     '/images/toys/lego-creator-001.jpg', 'cat-002', 'brand-001', 1299000, 1499000, 25, 'active',
     '6-12 tuổi', 'Nhựa ABS', 35.0, 25.0, 15.0, 0.8,
     '["Đỏ", "Xanh", "Vàng", "Trắng"]', '["Lego", "Xây dựng", "Sáng tạo", "3-in-1"]', 4.5, 128, 1, 1, 13.33),

    ('toy-002', N'Búp bê Barbie Dreamhouse', N'Ngôi nhà mơ ước của Barbie với 3 tầng, 8 phòng và hơn 70 phụ kiện. Kích thích trí tưởng tượng và kỹ năng xã hội.',
     '/images/toys/barbie-dreamhouse-001.jpg', 'cat-003', 'brand-002', 2899000, 3299000, 15, 'active',
     '3-9 tuổi', 'Nhựa', 90.0, 60.0, 120.0, 4.5,
     '["Hồng", "Tím", "Trắng", "Vàng"]', '["Barbie", "Nhà búp bê", "Phụ kiện", "Dreamhouse"]', 4.7, 89, 0, 1, 12.12),

    ('toy-003', N'Robot Transformer Optimus Prime', N'Robot biến hình từ xe tải thành robot chiến đấu. Chất liệu cao cấp, chi tiết tinh xảo.',
     '/images/toys/transformer-optimus-001.jpg', 'cat-006', 'brand-003', 899000, 999000, 30, 'active',
     '8+ tuổi', 'Nhựa ABS + Kim loại', 25.0, 15.0, 30.0, 1.2,
     '["Đỏ", "Xanh", "Vàng", "Xám"]', '["Transformer", "Robot", "Biến hình", "Optimus Prime"]', 4.3, 156, 0, 0, 10.01),

    ('toy-004', N'Xe điều khiển từ xa Racing Car', N'Xe đua tốc độ cao với điều khiển từ xa, pin sạc, đèn LED. Tốc độ tối đa 25km/h.',
     '/images/toys/rc-racing-car-001.jpg', 'cat-004', 'brand-004', 1599000, 1799000, 20, 'active',
     '6+ tuổi', 'Nhựa + Kim loại', 40.0, 20.0, 15.0, 1.8,
     '["Đỏ", "Xanh", "Đen"]', '["RC", "Xe đua", "Điều khiển", "Tốc độ"]', 4.4, 203, 1, 0, 11.11),

    ('toy-005', N'Bộ đồ chơi bác sĩ Fisher-Price', N'Bộ đồ chơi y tế hoàn chỉnh với 20 dụng cụ bác sĩ. Giúp trẻ làm quen với nghề y và giảm sợ hãi khi khám bệnh.',
     '/images/toys/doctor-kit-001.jpg', 'cat-001', 'brand-004', 699000, 799000, 40, 'active',
     '3-7 tuổi', 'Nhựa an toàn', 30.0, 25.0, 10.0, 0.9,
     '["Trắng", "Đỏ", "Xanh"]', '["Bác sĩ", "Y tế", "Giáo dục", "Nhập vai"]', 4.6, 174, 0, 1, 12.52),

    -- More toys
    ('toy-006', N'Đàn Piano điện tử VTech', N'Đàn piano 37 phím với 100 giai điệu, hiệu ứng âm thanh và đèn LED. Phát triển năng khiếu âm nhạc.',
     '/images/toys/vtech-piano-001.jpg', 'cat-008', 'brand-006', 1199000, 1399000, 18, 'active',
     '2-6 tuổi', 'Nhựa', 50.0, 25.0, 8.0, 1.5,
     '["Đen", "Trắng", "Đỏ"]', '["Piano", "Âm nhạc", "Điện tử", "Giáo dục"]', 4.2, 92, 0, 0, 14.30),

    ('toy-007', N'Bộ xếp hình gỗ Melissa & Doug', N'100 khối gỗ tự nhiên với nhiều hình dạng và màu sắc. An toàn, thân thiện môi trường.',
     '/images/toys/wooden-blocks-001.jpg', 'cat-001', 'brand-007', 899000, 0, 35, 'active',
     '1-5 tuổi', 'Gỗ tự nhiên', 30.0, 20.0, 20.0, 2.0,
     '["Gỗ tự nhiên", "Đỏ", "Xanh", "Vàng"]', '["Gỗ", "Xếp hình", "Tự nhiên", "An toàn"]', 4.8, 267, 0, 1, 0),

    ('toy-008', N'Mô hình Gundam Bandai RG', N'Mô hình Gundam tỷ lệ 1/144 với khớp cử động linh hoạt. Dành cho người sưu tập và lắp ráp.',
     '/images/toys/gundam-rg-001.jpg', 'cat-006', 'brand-008', 1899000, 2199000, 12, 'active',
     '14+ tuổi', 'Nhựa PS', 18.0, 12.0, 25.0, 0.4,
     '["Trắng", "Xanh", "Đỏ", "Vàng"]', '["Gundam", "Mô hình", "Lắp ráp", "Sưu tập"]', 4.9, 45, 1, 1, 13.64),

    ('toy-009', N'Búp bê Elsa Frozen Disney', N'Búp bê công chúa Elsa với váy áo lộng lẫy, tóc dài và phụ kiện. Nhân vật từ phim hoạt hình nổi tiếng.',
     '/images/toys/elsa-frozen-001.jpg', 'cat-003', 'brand-009', 599000, 699000, 28, 'active',
     '3-8 tuổi', 'Nhựa + Vải', 15.0, 8.0, 30.0, 0.3,
     '["Xanh", "Trắng", "Bạc"]', '["Elsa", "Frozen", "Disney", "Công chúa"]', 4.4, 312, 0, 0, 14.31),

    ('toy-010', N'Súng Nerf Elite 2.0', N'Súng bắn đạn xốp tầm xa 27m với băng đạn 10 viên. An toàn, thú vị cho trò chơi ngoài trời.',
     '/images/toys/nerf-elite-001.jpg', 'cat-005', 'brand-010', 799000, 899000, 22, 'active',
     '8+ tuổi', 'Nhựa', 60.0, 25.0, 8.0, 1.1,
     '["Xanh", "Cam", "Trắng"]', '["Nerf", "Súng", "Ngoài trời", "Thể thao"]', 4.1, 188, 0, 0, 11.12);

    PRINT 'Sample toys inserted successfully';
END
ELSE
BEGIN
    PRINT 'Toys already exist';
END
GO

-- =====================================================
-- 9. CREATE STORED PROCEDURES
-- =====================================================

-- Procedure to get toys with filters
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetToys')
    DROP PROCEDURE sp_GetToys;
GO

CREATE PROCEDURE sp_GetToys
    @Search NVARCHAR(255) = NULL,
    @CategoryId NVARCHAR(50) = NULL,
    @BrandId NVARCHAR(50) = NULL,
    @Status NVARCHAR(20) = NULL,
    @MinPrice DECIMAL(18,2) = NULL,
    @MaxPrice DECIMAL(18,2) = NULL,
    @InStock BIT = NULL,
    @Page INT = 1,
    @PageSize INT = 20,
    @SortField NVARCHAR(50) = 'CreatedAt',
    @SortDirection NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @CountSQL NVARCHAR(MAX);
    DECLARE @WhereClause NVARCHAR(MAX) = ' WHERE t.IsActive = 1 ';

    -- Build WHERE clause
    IF @Search IS NOT NULL AND @Search != ''
        SET @WhereClause += ' AND (t.Name LIKE ''%' + @Search + '%'' OR t.Description LIKE ''%' + @Search + '%'') ';

    IF @CategoryId IS NOT NULL AND @CategoryId != ''
        SET @WhereClause += ' AND t.CategoryId = ''' + @CategoryId + ''' ';

    IF @BrandId IS NOT NULL AND @BrandId != ''
        SET @WhereClause += ' AND t.BrandId = ''' + @BrandId + ''' ';

    IF @Status IS NOT NULL AND @Status != ''
        SET @WhereClause += ' AND t.Status = ''' + @Status + ''' ';

    IF @MinPrice IS NOT NULL
        SET @WhereClause += ' AND t.Price >= ' + CAST(@MinPrice AS NVARCHAR(20)) + ' ';

    IF @MaxPrice IS NOT NULL
        SET @WhereClause += ' AND t.Price <= ' + CAST(@MaxPrice AS NVARCHAR(20)) + ' ';

    IF @InStock = 1
        SET @WhereClause += ' AND t.Stock > 0 ';

    -- Count query
    SET @CountSQL = '
        SELECT COUNT(*) as TotalCount
        FROM zen50558_ManagementStore.dbo.Toys t
        INNER JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
        INNER JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
        ' + @WhereClause;

    -- Main query
    SET @SQL = '
        SELECT
            t.Id,
            t.Name,
            t.Description,
            t.Image,
            t.CategoryId,
            c.Name as CategoryName,
            t.BrandId,
            b.Name as BrandName,
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
            t.IsNew,
            t.IsFeatured,
            t.Discount,
            t.CreatedAt,
            t.UpdatedAt
        FROM zen50558_ManagementStore.dbo.Toys t
        INNER JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
        INNER JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
        ' + @WhereClause + '
        ORDER BY t.' + @SortField + ' ' + @SortDirection + '
        OFFSET ' + CAST(@Offset AS NVARCHAR(10)) + ' ROWS
        FETCH NEXT ' + CAST(@PageSize AS NVARCHAR(10)) + ' ROWS ONLY';

    -- Execute count query
    EXEC sp_executesql @CountSQL;

    -- Execute main query
    EXEC sp_executesql @SQL;
END
GO

PRINT 'Stored procedures created successfully';

-- =====================================================
-- 10. CREATE TRIGGERS FOR AUDIT
-- =====================================================

-- Trigger for updating UpdatedAt on Toys table
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_Toys_UpdatedAt')
    DROP TRIGGER tr_Toys_UpdatedAt;
GO

CREATE TRIGGER tr_Toys_UpdatedAt
ON Toys
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE zen50558_ManagementStore.dbo.Toys
    SET UpdatedAt = GETDATE()
    FROM zen50558_ManagementStore.dbo.Toys t
    INNER JOIN inserted i ON t.Id = i.Id;
END
GO

-- Trigger for updating toy rating when reviews change
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_UpdateToyRating')
    DROP TRIGGER tr_UpdateToyRating;
GO

CREATE TRIGGER tr_UpdateToyRating
ON ToyReviews
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Update rating for affected toys
    WITH RatingStats AS (
        SELECT
            ToyId,
            AVG(CAST(Rating AS DECIMAL(3,2))) as AvgRating,
            COUNT(*) as ReviewCount
        FROM ToyReviews
        WHERE IsApproved = 1
        GROUP BY ToyId
    )
    UPDATE t
    SET
        Rating = COALESCE(rs.AvgRating, 0),
        ReviewCount = COALESCE(rs.ReviewCount, 0),
        UpdatedAt = GETDATE()
    FROM zen50558_ManagementStore.dbo.Toys t
    LEFT JOIN RatingStats rs ON t.Id = rs.ToyId
    WHERE t.Id IN (
        SELECT DISTINCT ToyId FROM inserted
        UNION
        SELECT DISTINCT ToyId FROM deleted
    );
END
GO

PRINT 'Triggers created successfully';

-- =====================================================
-- SCHEMA CREATION COMPLETED
-- =====================================================
PRINT '==============================================';
PRINT 'TOY MANAGEMENT DATABASE SCHEMA CREATED SUCCESSFULLY!';
PRINT '==============================================';
PRINT 'Tables created:';
PRINT '- ToyCategories (8 sample categories)';
PRINT '- ToyBrands (10 sample brands)';
PRINT '- Toys (10 sample toys)';
PRINT '- ToyImages (for multiple product images)';
PRINT '- ToyReviews (for customer reviews)';
PRINT '';
PRINT 'Stored Procedures:';
PRINT '- sp_GetToys (with filtering and pagination)';
PRINT '';
PRINT 'Triggers:';
PRINT '- tr_Toys_UpdatedAt (auto-update timestamps)';
PRINT '- tr_UpdateToyRating (auto-calculate ratings)';
PRINT '';
PRINT 'Ready to use with the Toy Management application!';
PRINT '==============================================';
GO
