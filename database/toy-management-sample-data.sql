-- =====================================================
-- TOY MANAGEMENT - EXTENDED SAMPLE DATA
-- Additional sample data for categories, brands, and toys
-- Run this after toy-management-schema.sql to add more variety
-- =====================================================

USE ManagementStore;
GO

-- =====================================================
-- 1. INSERT ADDITIONAL CATEGORIES
-- =====================================================

-- Add more categories if they don't exist
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.ToyCategories WHERE Id = 'cat-009')
BEGIN
    INSERT INTO ManagementStore.dbo.ToyCategories (Id, Name, Slug, Description, Icon, Color) VALUES
    ('cat-009', N'Äá»“ chÆ¡i mÃ´ hÃ¬nh', 'model-toys', N'MÃ´ hÃ¬nh xe, mÃ¡y bay, tÃ u thuyá»n, nhÃ¢n váº­t', 'FlightTakeoff', '#3F51B5'),
    ('cat-010', N'Äá»“ chÆ¡i ngoÃ i trá»i', 'outdoor-toys', N'XÃ­ch Ä‘u, cáº§u trÆ°á»£t, Ä‘á»“ chÆ¡i sÃ¢n vÆ°á»n', 'Park', '#8BC34A'),
    ('cat-011', N'Äá»“ chÆ¡i trÃ­ tuá»‡', 'puzzle-toys', N'Xáº¿p hÃ¬nh, rubik, Ä‘á»‘ vui, logic games', 'Extension', '#FF6F00'),
    ('cat-012', N'Äá»“ chÆ¡i nhÃ  báº¿p', 'kitchen-toys', N'Bá»™ náº¥u Äƒn, Ä‘á»“ chÆ¡i thá»±c pháº©m giáº£', 'Restaurant', '#E91E63'),
    ('cat-013', N'Äá»“ chÆ¡i khoa há»c', 'science-toys', N'ThÃ­ nghiá»‡m, kÃ­nh hiá»ƒn vi, bá»™ hÃ³a há»c', 'Science', '#00BCD4'),
    ('cat-014', N'Äá»“ chÆ¡i Ä‘á»™ng váº­t', 'animal-toys', N'ThÃº nhá»“i bÃ´ng, mÃ´ hÃ¬nh Ä‘á»™ng váº­t', 'Pets', '#4CAF50'),
    ('cat-015', N'Äá»“ chÆ¡i board game', 'board-games', N'Cá» vua, cá» tá»· phÃº, trÃ² chÆ¡i bÃ n', 'Casino', '#795548'),
    ('cat-016', N'Äá»“ chÆ¡i baby', 'baby-toys', N'Äá»“ chÆ¡i cho tráº» sÆ¡ sinh vÃ  nhá» tuá»•i', 'ChildCare', '#FFC107');

    PRINT 'Additional categories inserted successfully';
END

-- Update existing categories to use Material-UI icon names instead of emojis
UPDATE ManagementStore.dbo.ToyCategories SET Icon = 'School' WHERE Id = 'cat-001' AND Icon = 'school';
UPDATE ManagementStore.dbo.ToyCategories SET Icon = 'Build' WHERE Id = 'cat-002' AND Icon = 'build';
UPDATE ManagementStore.dbo.ToyCategories SET Icon = 'Person' WHERE Id = 'cat-003' AND Icon = 'person';
UPDATE ManagementStore.dbo.ToyCategories SET Icon = 'DirectionsCar' WHERE Id = 'cat-004' AND Icon = 'car';
UPDATE ManagementStore.dbo.ToyCategories SET Icon = 'SportsBaseball' WHERE Id = 'cat-005' AND Icon = 'ball';
UPDATE ManagementStore.dbo.ToyCategories SET Icon = 'SmartToy' WHERE Id = 'cat-006' AND Icon = 'robot';
UPDATE ManagementStore.dbo.ToyCategories SET Icon = 'Palette' WHERE Id = 'cat-007' AND Icon = 'palette';
UPDATE ManagementStore.dbo.ToyCategories SET Icon = 'MusicNote' WHERE Id = 'cat-008' AND Icon = 'music';

PRINT 'Updated existing categories with Material-UI icon names';
GO

-- =====================================================
-- 2. INSERT ADDITIONAL BRANDS
-- =====================================================

-- Add more brands if they don't exist
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.ToyBrands WHERE Id = 'brand-011')
BEGIN
    INSERT INTO ManagementStore.dbo.ToyBrands (Id, Name, Description, Website) VALUES
    ('brand-011', 'Crayola', N'ThÆ°Æ¡ng hiá»‡u bÃºt mÃ u vÃ  Ä‘á»“ dÃ¹ng nghá»‡ thuáº­t hÃ ng Ä‘áº§u', 'https://www.crayola.com'),
    ('brand-012', 'Hot Wheels', N'ThÆ°Æ¡ng hiá»‡u xe Ä‘á»“ chÆ¡i ná»•i tiáº¿ng cá»§a Mattel', 'https://www.hotwheels.com'),
    ('brand-013', 'Barbie', N'ThÆ°Æ¡ng hiá»‡u bÃºp bÃª iconic cá»§a Mattel', 'https://www.barbie.com'),
    ('brand-014', 'Transformers', N'Robot biáº¿n hÃ¬nh cá»§a Hasbro', 'https://www.transformers.com'),
    ('brand-015', 'My Little Pony', N'ThÆ°Æ¡ng hiá»‡u ngá»±a pony cá»§a Hasbro', 'https://www.mylittlepony.com'),
    ('brand-016', 'PokÃ©mon', N'Äá»“ chÆ¡i vÃ  tháº» bÃ i PokÃ©mon', 'https://www.pokemon.com'),
    ('brand-017', 'Peppa Pig', N'Äá»“ chÆ¡i nhÃ¢n váº­t Peppa Pig', 'https://www.peppapig.com'),
    ('brand-018', 'Paw Patrol', N'Äá»“ chÆ¡i Ä‘á»™i cá»©u há»™ Paw Patrol', 'https://www.pawpatrol.com'),
    ('brand-019', 'Frozen', N'Äá»“ chÆ¡i nhÃ¢n váº­t Frozen cá»§a Disney', 'https://movies.disney.com/frozen'),
    ('brand-020', 'Marvel', N'Äá»“ chÆ¡i siÃªu anh hÃ¹ng Marvel', 'https://www.marvel.com'),
    ('brand-021', 'Star Wars', N'Äá»“ chÆ¡i Star Wars', 'https://www.starwars.com'),
    ('brand-022', 'Minecraft', N'Äá»“ chÆ¡i vÃ  mÃ´ hÃ¬nh Minecraft', 'https://www.minecraft.net'),
    ('brand-023', 'Ravensburger', N'Puzzle vÃ  board games cao cáº¥p', 'https://www.ravensburger.com'),
    ('brand-024', 'Schleich', N'MÃ´ hÃ¬nh Ä‘á»™ng váº­t cháº¥t lÆ°á»£ng cao', 'https://www.schleich-s.com'),
    ('brand-025', 'Playdoh', N'Äáº¥t náº·n Play-Doh cá»§a Hasbro', 'https://www.play-doh.com'),
    ('brand-026', 'Chicco', N'Äá»“ chÆ¡i cho tráº» em vÃ  baby', 'https://www.chicco.com'),
    ('brand-027', 'Little Tikes', N'Äá»“ chÆ¡i ngoÃ i trá»i vÃ  trong nhÃ ', 'https://www.littletikes.com'),
    ('brand-028', 'Sylvanian Families', N'Äá»“ chÆ¡i gia Ä‘Ã¬nh Ä‘á»™ng váº­t', 'https://www.sylvanianfamilies.com'),
    ('brand-029', 'Funko Pop', N'MÃ´ hÃ¬nh nhÃ¢n váº­t collectible', 'https://www.funko.com'),
    ('brand-030', 'Spin Master', N'Äá»“ chÆ¡i sÃ¡ng táº¡o vÃ  giáº£i trÃ­', 'https://www.spinmaster.com');

    PRINT 'Additional brands inserted successfully';
END
GO

-- =====================================================
-- 3. INSERT ADDITIONAL SAMPLE TOYS
-- =====================================================

-- Add more sample toys to demonstrate variety
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.Toys WHERE Id = 'toy-011')
BEGIN
    INSERT INTO ManagementStore.dbo.Toys (
        Id, Name, Description, Image, CategoryId, BrandId, Price, OriginalPrice, Stock, Status,
        AgeRange, Material, DimensionLength, DimensionWidth, DimensionHeight, Weight,
        Colors, Tags, Rating, ReviewCount, IsNew, IsFeatured, Discount
    ) VALUES
    -- Puzzle & Brain Games
    ('toy-011', N'Rubik Cube 3x3 Speed Cube', N'Rubik cube tá»‘c Ä‘á»™ cao vá»›i cÆ¡ cháº¿ xoay mÆ°á»£t mÃ . PhÃ¡t triá»ƒn tÆ° duy logic vÃ  khÃ©o lÃ©o tay.',
     '/images/toys/rubik-cube-001.jpg', 'cat-011', 'brand-023', 299000, 399000, 45, 'active',
     '8+ tuá»•i', 'Nhá»±a ABS', 5.7, 5.7, 5.7, 85,
     '["Äa mÃ u", "Äen", "Tráº¯ng"]', '["Rubik", "Puzzle", "TrÃ­ tuá»‡", "Tá»‘c Ä‘á»™"]', 4.6, 234, 0, 1, 25.06),

    -- Science Toys
    ('toy-012', N'Bá»™ thÃ­ nghiá»‡m khoa há»c 4M', N'Bá»™ thÃ­ nghiá»‡m khoa há»c vá»›i 50+ thÃ­ nghiá»‡m an toÃ n. Bao gá»“m kÃ­nh hiá»ƒn vi, á»‘ng nghiá»‡m vÃ  hÃ³a cháº¥t.',
     '/images/toys/science-kit-4m.jpg', 'cat-013', 'brand-026', 1899000, 2199000, 18, 'active',
     '8-14 tuá»•i', 'Nhá»±a + Thá»§y tinh', 40.0, 30.0, 25.0, 2200,
     '["Xanh", "Tráº¯ng", "Trong suá»‘t"]', '["Khoa há»c", "ThÃ­ nghiá»‡m", "STEM", "GiÃ¡o dá»¥c"]', 4.8, 156, 1, 1, 13.64),

    -- Animal Toys
    ('toy-013', N'Gáº¥u bÃ´ng Teddy Bear khá»•ng lá»“', N'Gáº¥u bÃ´ng teddy bear siÃªu má»m máº¡i, kÃ­ch thÆ°á»›c lá»›n. Cháº¥t liá»‡u an toÃ n cho tráº» em.',
     '/images/toys/teddy-bear-giant.jpg', 'cat-014', 'brand-026', 1299000, 0, 25, 'active',
     '0+ tuá»•i', 'BÃ´ng PP + Váº£i nhung', 80.0, 60.0, 100.0, 1800,
     '["NÃ¢u", "Tráº¯ng", "Há»“ng"]', '["Gáº¥u bÃ´ng", "Teddy", "Má»m máº¡i", "An toÃ n"]', 4.9, 312, 0, 1, 0),

    -- Board Games
    ('toy-014', N'Cá» tá»· phÃº Monopoly Classic', N'TrÃ² chÆ¡i cá» tá»· phÃº kinh Ä‘iá»ƒn vá»›i báº£n Ä‘á»“ Viá»‡t Nam. PhÃ¡t triá»ƒn tÆ° duy kinh doanh.',
     '/images/toys/monopoly-vietnam.jpg', 'cat-015', 'brand-003', 899000, 1099000, 30, 'active',
     '8+ tuá»•i', 'Giáº¥y + Nhá»±a', 40.0, 27.0, 5.0, 1200,
     '["Äa mÃ u"]', '["Monopoly", "Board game", "Gia Ä‘Ã¬nh", "Kinh doanh"]', 4.5, 189, 0, 0, 18.20),

    -- Kitchen Toys
    ('toy-015', N'Bá»™ Ä‘á»“ chÆ¡i nhÃ  báº¿p Hello Kitty', N'Bá»™ nhÃ  báº¿p mini vá»›i Ä‘áº§y Ä‘á»§ dá»¥ng cá»¥ náº¥u Äƒn. Thiáº¿t káº¿ Hello Kitty dá»… thÆ°Æ¡ng.',
     '/images/toys/kitchen-hello-kitty.jpg', 'cat-012', 'brand-027', 1599000, 1899000, 22, 'active',
     '3-8 tuá»•i', 'Nhá»±a ABS', 60.0, 40.0, 80.0, 3500,
     '["Há»“ng", "Tráº¯ng", "Äá»"]', '["NhÃ  báº¿p", "Hello Kitty", "Náº¥u Äƒn", "Nháº­p vai"]', 4.7, 145, 1, 1, 15.80),

    -- Model Toys
    ('toy-016', N'MÃ´ hÃ¬nh mÃ¡y bay Boeing 747', N'MÃ´ hÃ¬nh mÃ¡y bay Boeing 747 tá»· lá»‡ 1:200 vá»›i chi tiáº¿t tinh xáº£o. DÃ nh cho ngÆ°á»i sÆ°u táº­p.',
     '/images/toys/boeing-747-model.jpg', 'cat-009', 'brand-024', 2299000, 2699000, 12, 'active',
     '12+ tuá»•i', 'Kim loáº¡i + Nhá»±a', 35.0, 32.0, 12.0, 800,
     '["Tráº¯ng", "Xanh", "Äá»"]', '["MÃ¡y bay", "MÃ´ hÃ¬nh", "Boeing", "SÆ°u táº­p"]', 4.8, 67, 0, 1, 14.82),

    -- Outdoor Toys
    ('toy-017', N'Xe scooter 3 bÃ¡nh cho tráº» em', N'Xe scooter 3 bÃ¡nh an toÃ n vá»›i Ä‘Ã¨n LED vÃ  nháº¡c. PhÃ¡t triá»ƒn kháº£ nÄƒng cÃ¢n báº±ng.',
     '/images/toys/scooter-3-wheels.jpg', 'cat-010', 'brand-027', 1799000, 2199000, 15, 'active',
     '3-8 tuá»•i', 'Nhá»±a + Kim loáº¡i', 60.0, 35.0, 80.0, 3200,
     '["Xanh", "Há»“ng", "Äá»"]', '["Scooter", "3 bÃ¡nh", "LED", "CÃ¢n báº±ng"]', 4.4, 98, 1, 0, 18.19),

    -- Baby Toys
    ('toy-018', N'Äá»“ chÆ¡i xÃºc xáº¯c má»m cho baby', N'Bá»™ 6 xÃºc xáº¯c má»m vá»›i Ã¢m thanh vÃ  mÃ u sáº¯c. An toÃ n cho tráº» sÆ¡ sinh.',
     '/images/toys/soft-dice-baby.jpg', 'cat-016', 'brand-026', 399000, 499000, 50, 'active',
     '0-2 tuá»•i', 'Váº£i má»m + BÃ´ng', 8.0, 8.0, 8.0, 150,
     '["Äa mÃ u"]', '["Baby", "Má»m", "An toÃ n", "Ã‚m thanh"]', 4.6, 278, 0, 0, 20.04),

    -- Art & Craft
    ('toy-019', N'Bá»™ bÃºt mÃ u Crayola 120 mÃ u', N'Bá»™ bÃºt mÃ u sÃ¡p Crayola vá»›i 120 mÃ u sáº¯c rá»±c rá»¡. KÃ¨m sÃ¡ch tÃ´ mÃ u vÃ  giáº¥y váº½.',
     '/images/toys/crayola-120-colors.jpg', 'cat-007', 'brand-011', 899000, 1199000, 35, 'active',
     '3+ tuá»•i', 'SÃ¡p mÃ u + Giáº¥y', 35.0, 25.0, 8.0, 1100,
     '["Äa mÃ u"]', '["Crayola", "BÃºt mÃ u", "120 mÃ u", "Nghá»‡ thuáº­t"]', 4.7, 201, 0, 1, 25.02),

    -- Electronic Toys
    ('toy-020', N'Robot láº­p trÃ¬nh Dash Wonder', N'Robot thÃ´ng minh cÃ³ thá»ƒ láº­p trÃ¬nh qua app. Dáº¡y tráº» em coding cÆ¡ báº£n.',
     '/images/toys/dash-robot-wonder.jpg', 'cat-006', 'brand-030', 3299000, 3899000, 8, 'active',
     '6+ tuá»•i', 'Nhá»±a + Linh kiá»‡n Ä‘iá»‡n tá»­', 20.0, 15.0, 18.0, 1500,
     '["Xanh", "Tráº¯ng"]', '["Robot", "Láº­p trÃ¬nh", "Coding", "STEM"]', 4.9, 89, 1, 1, 15.39);

    PRINT 'Additional sample toys inserted successfully';
END
GO

-- =====================================================
-- 4. UPDATE EXISTING DATA FOR BETTER VARIETY
-- =====================================================

-- Update some existing toys to use new categories and brands
UPDATE ManagementStore.dbo.Toys SET CategoryId = 'cat-009' WHERE Id = 'toy-008' AND CategoryId = 'cat-001'; -- Piano -> Model
UPDATE ManagementStore.dbo.Toys SET BrandId = 'brand-011' WHERE Id = 'toy-006' AND BrandId = 'brand-007'; -- Crayola brand for art toys

-- =====================================================
-- 5. VERIFY DATA INTEGRITY
-- =====================================================

-- Check categories count
SELECT 'Categories' as TableName, COUNT(*) as RecordCount FROM ManagementStore.dbo.ToyCategories WHERE IsActive = 1
UNION ALL
-- Check brands count
SELECT 'Brands' as TableName, COUNT(*) as RecordCount FROM ManagementStore.dbo.ToyBrands WHERE IsActive = 1
UNION ALL
-- Check toys count
SELECT 'Toys' as TableName, COUNT(*) as RecordCount FROM ManagementStore.dbo.Toys WHERE IsActive = 1;

-- Show category distribution
SELECT
    c.Name as CategoryName,
    COUNT(t.Id) as ToyCount
FROM ManagementStore.dbo.ToyCategories c
LEFT JOIN ManagementStore.dbo.Toys t ON c.Id = t.CategoryId AND t.IsActive = 1
WHERE c.IsActive = 1
GROUP BY c.Id, c.Name
ORDER BY ToyCount DESC, c.Name;

-- Show brand distribution
SELECT
    b.Name as BrandName,
    COUNT(t.Id) as ToyCount
FROM ManagementStore.dbo.ToyBrands b
LEFT JOIN ManagementStore.dbo.Toys t ON b.Id = t.BrandId AND t.IsActive = 1
WHERE b.IsActive = 1
GROUP BY b.Id, b.Name
ORDER BY ToyCount DESC, b.Name;

PRINT '==============================================';
PRINT 'EXTENDED SAMPLE DATA INSERTED SUCCESSFULLY!';
PRINT '==============================================';
PRINT 'Summary:';
PRINT '- Total Categories: 16 (8 original + 8 new)';
PRINT '- Total Brands: 30 (10 original + 20 new)';
PRINT '- Total Sample Toys: 20 (10 original + 10 new)';
PRINT '';
PRINT 'Categories include:';
PRINT 'âœ… Educational, Building, Dolls, Vehicles, Sports';
PRINT 'âœ… Electronic, Art, Music, Model, Outdoor';
PRINT 'âœ… Puzzle, Kitchen, Science, Animal, Board Games, Baby';
PRINT '';
PRINT 'Brands include:';
PRINT 'âœ… LEGO, Mattel, Hasbro, Fisher-Price, Disney';
PRINT 'âœ… Crayola, Hot Wheels, Barbie, Transformers';
PRINT 'âœ… PokÃ©mon, Marvel, Star Wars, Minecraft';
PRINT 'âœ… And many more popular toy brands!';
PRINT '';
PRINT 'Ready for dropdown testing in /apps/toy-management!';
PRINT '==============================================';
GO

