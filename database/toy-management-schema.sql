-- =====================================================
-- TOY MANAGEMENT DATABASE SCHEMA
-- SQL Server Database Schema for Toy Management System
-- =====================================================

-- Use the existing database
USE ManagementStore;
GO

-- =====================================================
-- 1. CREATE CATEGORIES TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ToyCategories' AND xtype='U')
BEGIN
    CREATE TABLE ManagementStore.dbo.ToyCategories (
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
    CREATE TABLE ManagementStore.dbo.ToyBrands (
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
    CREATE TABLE ManagementStore.dbo.Toys (
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
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.ToyCategories)
BEGIN
    INSERT INTO ManagementStore.dbo.ToyCategories (Id, Name, Slug, Description, Icon, Color) VALUES
    ('cat-001', N'Äá»“ chÆ¡i giÃ¡o dá»¥c', 'educational-toys', N'Äá»“ chÆ¡i phÃ¡t triá»ƒn trÃ­ tuá»‡ vÃ  ká»¹ nÄƒng há»c táº­p', 'school', '#4CAF50'),
    ('cat-002', N'Äá»“ chÆ¡i xÃ¢y dá»±ng', 'building-toys', N'Lego, khá»‘i xÃ¢y dá»±ng vÃ  Ä‘á»“ chÆ¡i láº¯p rÃ¡p', 'build', '#2196F3'),
    ('cat-003', N'BÃºp bÃª & NhÃ¢n váº­t', 'dolls-figures', N'BÃºp bÃª, nhÃ¢n váº­t hoáº¡t hÃ¬nh vÃ  phá»¥ kiá»‡n', 'person', '#E91E63'),
    ('cat-004', N'Xe Ä‘á»“ chÆ¡i', 'toy-vehicles', N'Ã” tÃ´, mÃ¡y bay, tÃ u thuyá»n Ä‘á»“ chÆ¡i', 'car', '#FF9800'),
    ('cat-005', N'Äá»“ chÆ¡i thá»ƒ thao', 'sports-toys', N'BÃ³ng, vá»£t, Ä‘á»“ chÆ¡i hoáº¡t Ä‘á»™ng ngoÃ i trá»i', 'ball', '#9C27B0'),
    ('cat-006', N'Äá»“ chÆ¡i Ä‘iá»‡n tá»­', 'electronic-toys', N'Robot, Ä‘á»“ chÆ¡i Ä‘iá»u khiá»ƒn tá»« xa', 'robot', '#607D8B'),
    ('cat-007', N'Äá»“ chÆ¡i nghá»‡ thuáº­t', 'art-craft', N'BÃºt mÃ u, Ä‘áº¥t náº·n, Ä‘á»“ chÆ¡i sÃ¡ng táº¡o', 'palette', '#795548'),
    ('cat-008', N'Äá»“ chÆ¡i Ã¢m nháº¡c', 'musical-toys', N'ÄÃ n piano, trá»‘ng, nháº¡c cá»¥ Ä‘á»“ chÆ¡i', 'music', '#FF5722');

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
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.ToyBrands)
BEGIN
    INSERT INTO ManagementStore.dbo.ToyBrands (Id, Name, Description, Website) VALUES
    ('brand-001', 'LEGO', N'ThÆ°Æ¡ng hiá»‡u Ä‘á»“ chÆ¡i xÃ¢y dá»±ng ná»•i tiáº¿ng tháº¿ giá»›i', 'https://www.lego.com'),
    ('brand-002', 'Mattel', N'CÃ´ng ty Ä‘á»“ chÆ¡i Ä‘a quá»‘c gia, sáº£n xuáº¥t Barbie, Hot Wheels', 'https://www.mattel.com'),
    ('brand-003', 'Hasbro', N'NhÃ  sáº£n xuáº¥t Ä‘á»“ chÆ¡i vÃ  trÃ² chÆ¡i hÃ ng Ä‘áº§u', 'https://www.hasbro.com'),
    ('brand-004', 'Fisher-Price', N'ChuyÃªn vá» Ä‘á»“ chÆ¡i giÃ¡o dá»¥c cho tráº» em', 'https://www.fisher-price.com'),
    ('brand-005', 'Playmobil', N'Äá»“ chÆ¡i nhÃ¢n váº­t vÃ  bá»™ sÆ°u táº­p', 'https://www.playmobil.com'),
    ('brand-006', 'VTech', N'Äá»“ chÆ¡i Ä‘iá»‡n tá»­ giÃ¡o dá»¥c', 'https://www.vtech.com'),
    ('brand-007', 'Melissa & Doug', N'Äá»“ chÆ¡i gá»— vÃ  giÃ¡o dá»¥c sÃ¡ng táº¡o', 'https://www.melissaanddoug.com'),
    ('brand-008', 'Bandai', N'Äá»“ chÆ¡i nhÃ¢n váº­t anime vÃ  mÃ´ hÃ¬nh', 'https://www.bandai.com'),
    ('brand-009', 'Disney', N'Äá»“ chÆ¡i nhÃ¢n váº­t Disney', 'https://www.disney.com'),
    ('brand-010', 'Nerf', N'Äá»“ chÆ¡i sÃºng báº¯n Ä‘áº¡n xá»‘p', 'https://www.nerf.com');

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
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.Toys)
BEGIN
    INSERT INTO ManagementStore.dbo.Toys (
        Id, Name, Description, Image, CategoryId, BrandId, Price, OriginalPrice, Stock, Status,
        AgeRange, Material, DimensionLength, DimensionWidth, DimensionHeight, Weight,
        Colors, Tags, Rating, ReviewCount, IsNew, IsFeatured, Discount
    ) VALUES
    -- Educational Toys
    ('toy-001', N'Bá»™ Lego Creator 3-in-1', N'Bá»™ Ä‘á»“ chÆ¡i xÃ¢y dá»±ng Ä‘a nÄƒng, cÃ³ thá»ƒ táº¡o ra 3 mÃ´ hÃ¬nh khÃ¡c nhau. PhÃ¡t triá»ƒn tÆ° duy logic vÃ  kháº£ nÄƒng sÃ¡ng táº¡o cho tráº».',
     '/images/toys/lego-creator-001.jpg', 'cat-002', 'brand-001', 1299000, 1499000, 25, 'active',
     '6-12 tuá»•i', 'Nhá»±a ABS', 35.0, 25.0, 15.0, 0.8,
     '["Äá»", "Xanh", "VÃ ng", "Tráº¯ng"]', '["Lego", "XÃ¢y dá»±ng", "SÃ¡ng táº¡o", "3-in-1"]', 4.5, 128, 1, 1, 13.33),

    ('toy-002', N'BÃºp bÃª Barbie Dreamhouse', N'NgÃ´i nhÃ  mÆ¡ Æ°á»›c cá»§a Barbie vá»›i 3 táº§ng, 8 phÃ²ng vÃ  hÆ¡n 70 phá»¥ kiá»‡n. KÃ­ch thÃ­ch trÃ­ tÆ°á»Ÿng tÆ°á»£ng vÃ  ká»¹ nÄƒng xÃ£ há»™i.',
     '/images/toys/barbie-dreamhouse-001.jpg', 'cat-003', 'brand-002', 2899000, 3299000, 15, 'active',
     '3-9 tuá»•i', 'Nhá»±a', 90.0, 60.0, 120.0, 4.5,
     '["Há»“ng", "TÃ­m", "Tráº¯ng", "VÃ ng"]', '["Barbie", "NhÃ  bÃºp bÃª", "Phá»¥ kiá»‡n", "Dreamhouse"]', 4.7, 89, 0, 1, 12.12),

    ('toy-003', N'Robot Transformer Optimus Prime', N'Robot biáº¿n hÃ¬nh tá»« xe táº£i thÃ nh robot chiáº¿n Ä‘áº¥u. Cháº¥t liá»‡u cao cáº¥p, chi tiáº¿t tinh xáº£o.',
     '/images/toys/transformer-optimus-001.jpg', 'cat-006', 'brand-003', 899000, 999000, 30, 'active',
     '8+ tuá»•i', 'Nhá»±a ABS + Kim loáº¡i', 25.0, 15.0, 30.0, 1.2,
     '["Äá»", "Xanh", "VÃ ng", "XÃ¡m"]', '["Transformer", "Robot", "Biáº¿n hÃ¬nh", "Optimus Prime"]', 4.3, 156, 0, 0, 10.01),

    ('toy-004', N'Xe Ä‘iá»u khiá»ƒn tá»« xa Racing Car', N'Xe Ä‘ua tá»‘c Ä‘á»™ cao vá»›i Ä‘iá»u khiá»ƒn tá»« xa, pin sáº¡c, Ä‘Ã¨n LED. Tá»‘c Ä‘á»™ tá»‘i Ä‘a 25km/h.',
     '/images/toys/rc-racing-car-001.jpg', 'cat-004', 'brand-004', 1599000, 1799000, 20, 'active',
     '6+ tuá»•i', 'Nhá»±a + Kim loáº¡i', 40.0, 20.0, 15.0, 1.8,
     '["Äá»", "Xanh", "Äen"]', '["RC", "Xe Ä‘ua", "Äiá»u khiá»ƒn", "Tá»‘c Ä‘á»™"]', 4.4, 203, 1, 0, 11.11),

    ('toy-005', N'Bá»™ Ä‘á»“ chÆ¡i bÃ¡c sÄ© Fisher-Price', N'Bá»™ Ä‘á»“ chÆ¡i y táº¿ hoÃ n chá»‰nh vá»›i 20 dá»¥ng cá»¥ bÃ¡c sÄ©. GiÃºp tráº» lÃ m quen vá»›i nghá» y vÃ  giáº£m sá»£ hÃ£i khi khÃ¡m bá»‡nh.',
     '/images/toys/doctor-kit-001.jpg', 'cat-001', 'brand-004', 699000, 799000, 40, 'active',
     '3-7 tuá»•i', 'Nhá»±a an toÃ n', 30.0, 25.0, 10.0, 0.9,
     '["Tráº¯ng", "Äá»", "Xanh"]', '["BÃ¡c sÄ©", "Y táº¿", "GiÃ¡o dá»¥c", "Nháº­p vai"]', 4.6, 174, 0, 1, 12.52),

    -- More toys
    ('toy-006', N'ÄÃ n Piano Ä‘iá»‡n tá»­ VTech', N'ÄÃ n piano 37 phÃ­m vá»›i 100 giai Ä‘iá»‡u, hiá»‡u á»©ng Ã¢m thanh vÃ  Ä‘Ã¨n LED. PhÃ¡t triá»ƒn nÄƒng khiáº¿u Ã¢m nháº¡c.',
     '/images/toys/vtech-piano-001.jpg', 'cat-008', 'brand-006', 1199000, 1399000, 18, 'active',
     '2-6 tuá»•i', 'Nhá»±a', 50.0, 25.0, 8.0, 1.5,
     '["Äen", "Tráº¯ng", "Äá»"]', '["Piano", "Ã‚m nháº¡c", "Äiá»‡n tá»­", "GiÃ¡o dá»¥c"]', 4.2, 92, 0, 0, 14.30),

    ('toy-007', N'Bá»™ xáº¿p hÃ¬nh gá»— Melissa & Doug', N'100 khá»‘i gá»— tá»± nhiÃªn vá»›i nhiá»u hÃ¬nh dáº¡ng vÃ  mÃ u sáº¯c. An toÃ n, thÃ¢n thiá»‡n mÃ´i trÆ°á»ng.',
     '/images/toys/wooden-blocks-001.jpg', 'cat-001', 'brand-007', 899000, 0, 35, 'active',
     '1-5 tuá»•i', 'Gá»— tá»± nhiÃªn', 30.0, 20.0, 20.0, 2.0,
     '["Gá»— tá»± nhiÃªn", "Äá»", "Xanh", "VÃ ng"]', '["Gá»—", "Xáº¿p hÃ¬nh", "Tá»± nhiÃªn", "An toÃ n"]', 4.8, 267, 0, 1, 0),

    ('toy-008', N'MÃ´ hÃ¬nh Gundam Bandai RG', N'MÃ´ hÃ¬nh Gundam tá»· lá»‡ 1/144 vá»›i khá»›p cá»­ Ä‘á»™ng linh hoáº¡t. DÃ nh cho ngÆ°á»i sÆ°u táº­p vÃ  láº¯p rÃ¡p.',
     '/images/toys/gundam-rg-001.jpg', 'cat-006', 'brand-008', 1899000, 2199000, 12, 'active',
     '14+ tuá»•i', 'Nhá»±a PS', 18.0, 12.0, 25.0, 0.4,
     '["Tráº¯ng", "Xanh", "Äá»", "VÃ ng"]', '["Gundam", "MÃ´ hÃ¬nh", "Láº¯p rÃ¡p", "SÆ°u táº­p"]', 4.9, 45, 1, 1, 13.64),

    ('toy-009', N'BÃºp bÃª Elsa Frozen Disney', N'BÃºp bÃª cÃ´ng chÃºa Elsa vá»›i vÃ¡y Ã¡o lá»™ng láº«y, tÃ³c dÃ i vÃ  phá»¥ kiá»‡n. NhÃ¢n váº­t tá»« phim hoáº¡t hÃ¬nh ná»•i tiáº¿ng.',
     '/images/toys/elsa-frozen-001.jpg', 'cat-003', 'brand-009', 599000, 699000, 28, 'active',
     '3-8 tuá»•i', 'Nhá»±a + Váº£i', 15.0, 8.0, 30.0, 0.3,
     '["Xanh", "Tráº¯ng", "Báº¡c"]', '["Elsa", "Frozen", "Disney", "CÃ´ng chÃºa"]', 4.4, 312, 0, 0, 14.31),

    ('toy-010', N'SÃºng Nerf Elite 2.0', N'SÃºng báº¯n Ä‘áº¡n xá»‘p táº§m xa 27m vá»›i bÄƒng Ä‘áº¡n 10 viÃªn. An toÃ n, thÃº vá»‹ cho trÃ² chÆ¡i ngoÃ i trá»i.',
     '/images/toys/nerf-elite-001.jpg', 'cat-005', 'brand-010', 799000, 899000, 22, 'active',
     '8+ tuá»•i', 'Nhá»±a', 60.0, 25.0, 8.0, 1.1,
     '["Xanh", "Cam", "Tráº¯ng"]', '["Nerf", "SÃºng", "NgoÃ i trá»i", "Thá»ƒ thao"]', 4.1, 188, 0, 0, 11.12);

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
        FROM ManagementStore.dbo.Toys t
        INNER JOIN ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
        INNER JOIN ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
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
        FROM ManagementStore.dbo.Toys t
        INNER JOIN ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
        INNER JOIN ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
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

    UPDATE ManagementStore.dbo.Toys
    SET UpdatedAt = GETDATE()
    FROM ManagementStore.dbo.Toys t
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
    FROM ManagementStore.dbo.Toys t
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

