-- =====================================================
-- TOY MANAGEMENT - EXTENDED SAMPLE DATA
-- Additional sample data for categories, brands, and toys
-- Run this after toy-management-schema.sql to add more variety
-- =====================================================

USE zen50558_ManagementStore;
GO

-- =====================================================
-- 1. INSERT ADDITIONAL CATEGORIES
-- =====================================================

-- Add more categories if they don't exist
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.ToyCategories WHERE Id = 'cat-009')
BEGIN
    INSERT INTO zen50558_ManagementStore.dbo.ToyCategories (Id, Name, Slug, Description, Icon, Color) VALUES
    ('cat-009', N'Đồ chơi mô hình', 'model-toys', N'Mô hình xe, máy bay, tàu thuyền, nhân vật', 'FlightTakeoff', '#3F51B5'),
    ('cat-010', N'Đồ chơi ngoài trời', 'outdoor-toys', N'Xích đu, cầu trượt, đồ chơi sân vườn', 'Park', '#8BC34A'),
    ('cat-011', N'Đồ chơi trí tuệ', 'puzzle-toys', N'Xếp hình, rubik, đố vui, logic games', 'Extension', '#FF6F00'),
    ('cat-012', N'Đồ chơi nhà bếp', 'kitchen-toys', N'Bộ nấu ăn, đồ chơi thực phẩm giả', 'Restaurant', '#E91E63'),
    ('cat-013', N'Đồ chơi khoa học', 'science-toys', N'Thí nghiệm, kính hiển vi, bộ hóa học', 'Science', '#00BCD4'),
    ('cat-014', N'Đồ chơi động vật', 'animal-toys', N'Thú nhồi bông, mô hình động vật', 'Pets', '#4CAF50'),
    ('cat-015', N'Đồ chơi board game', 'board-games', N'Cờ vua, cờ tỷ phú, trò chơi bàn', 'Casino', '#795548'),
    ('cat-016', N'Đồ chơi baby', 'baby-toys', N'Đồ chơi cho trẻ sơ sinh và nhỏ tuổi', 'ChildCare', '#FFC107');

    PRINT 'Additional categories inserted successfully';
END

-- Update existing categories to use Material-UI icon names instead of emojis
UPDATE zen50558_ManagementStore.dbo.ToyCategories SET Icon = 'School' WHERE Id = 'cat-001' AND Icon = 'school';
UPDATE zen50558_ManagementStore.dbo.ToyCategories SET Icon = 'Build' WHERE Id = 'cat-002' AND Icon = 'build';
UPDATE zen50558_ManagementStore.dbo.ToyCategories SET Icon = 'Person' WHERE Id = 'cat-003' AND Icon = 'person';
UPDATE zen50558_ManagementStore.dbo.ToyCategories SET Icon = 'DirectionsCar' WHERE Id = 'cat-004' AND Icon = 'car';
UPDATE zen50558_ManagementStore.dbo.ToyCategories SET Icon = 'SportsBaseball' WHERE Id = 'cat-005' AND Icon = 'ball';
UPDATE zen50558_ManagementStore.dbo.ToyCategories SET Icon = 'SmartToy' WHERE Id = 'cat-006' AND Icon = 'robot';
UPDATE zen50558_ManagementStore.dbo.ToyCategories SET Icon = 'Palette' WHERE Id = 'cat-007' AND Icon = 'palette';
UPDATE zen50558_ManagementStore.dbo.ToyCategories SET Icon = 'MusicNote' WHERE Id = 'cat-008' AND Icon = 'music';

PRINT 'Updated existing categories with Material-UI icon names';
GO

-- =====================================================
-- 2. INSERT ADDITIONAL BRANDS
-- =====================================================

-- Add more brands if they don't exist
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.ToyBrands WHERE Id = 'brand-011')
BEGIN
    INSERT INTO zen50558_ManagementStore.dbo.ToyBrands (Id, Name, Description, Website) VALUES
    ('brand-011', 'Crayola', N'Thương hiệu bút màu và đồ dùng nghệ thuật hàng đầu', 'https://www.crayola.com'),
    ('brand-012', 'Hot Wheels', N'Thương hiệu xe đồ chơi nổi tiếng của Mattel', 'https://www.hotwheels.com'),
    ('brand-013', 'Barbie', N'Thương hiệu búp bê iconic của Mattel', 'https://www.barbie.com'),
    ('brand-014', 'Transformers', N'Robot biến hình của Hasbro', 'https://www.transformers.com'),
    ('brand-015', 'My Little Pony', N'Thương hiệu ngựa pony của Hasbro', 'https://www.mylittlepony.com'),
    ('brand-016', 'Pokémon', N'Đồ chơi và thẻ bài Pokémon', 'https://www.pokemon.com'),
    ('brand-017', 'Peppa Pig', N'Đồ chơi nhân vật Peppa Pig', 'https://www.peppapig.com'),
    ('brand-018', 'Paw Patrol', N'Đồ chơi đội cứu hộ Paw Patrol', 'https://www.pawpatrol.com'),
    ('brand-019', 'Frozen', N'Đồ chơi nhân vật Frozen của Disney', 'https://movies.disney.com/frozen'),
    ('brand-020', 'Marvel', N'Đồ chơi siêu anh hùng Marvel', 'https://www.marvel.com'),
    ('brand-021', 'Star Wars', N'Đồ chơi Star Wars', 'https://www.starwars.com'),
    ('brand-022', 'Minecraft', N'Đồ chơi và mô hình Minecraft', 'https://www.minecraft.net'),
    ('brand-023', 'Ravensburger', N'Puzzle và board games cao cấp', 'https://www.ravensburger.com'),
    ('brand-024', 'Schleich', N'Mô hình động vật chất lượng cao', 'https://www.schleich-s.com'),
    ('brand-025', 'Playdoh', N'Đất nặn Play-Doh của Hasbro', 'https://www.play-doh.com'),
    ('brand-026', 'Chicco', N'Đồ chơi cho trẻ em và baby', 'https://www.chicco.com'),
    ('brand-027', 'Little Tikes', N'Đồ chơi ngoài trời và trong nhà', 'https://www.littletikes.com'),
    ('brand-028', 'Sylvanian Families', N'Đồ chơi gia đình động vật', 'https://www.sylvanianfamilies.com'),
    ('brand-029', 'Funko Pop', N'Mô hình nhân vật collectible', 'https://www.funko.com'),
    ('brand-030', 'Spin Master', N'Đồ chơi sáng tạo và giải trí', 'https://www.spinmaster.com');

    PRINT 'Additional brands inserted successfully';
END
GO

-- =====================================================
-- 3. INSERT ADDITIONAL SAMPLE TOYS
-- =====================================================

-- Add more sample toys to demonstrate variety
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.Toys WHERE Id = 'toy-011')
BEGIN
    INSERT INTO zen50558_ManagementStore.dbo.Toys (
        Id, Name, Description, Image, CategoryId, BrandId, Price, OriginalPrice, Stock, Status,
        AgeRange, Material, DimensionLength, DimensionWidth, DimensionHeight, Weight,
        Colors, Tags, Rating, ReviewCount, IsNew, IsFeatured, Discount
    ) VALUES
    -- Puzzle & Brain Games
    ('toy-011', N'Rubik Cube 3x3 Speed Cube', N'Rubik cube tốc độ cao với cơ chế xoay mượt mà. Phát triển tư duy logic và khéo léo tay.',
     '/images/toys/rubik-cube-001.jpg', 'cat-011', 'brand-023', 299000, 399000, 45, 'active',
     '8+ tuổi', 'Nhựa ABS', 5.7, 5.7, 5.7, 85,
     '["Đa màu", "Đen", "Trắng"]', '["Rubik", "Puzzle", "Trí tuệ", "Tốc độ"]', 4.6, 234, 0, 1, 25.06),

    -- Science Toys
    ('toy-012', N'Bộ thí nghiệm khoa học 4M', N'Bộ thí nghiệm khoa học với 50+ thí nghiệm an toàn. Bao gồm kính hiển vi, ống nghiệm và hóa chất.',
     '/images/toys/science-kit-4m.jpg', 'cat-013', 'brand-026', 1899000, 2199000, 18, 'active',
     '8-14 tuổi', 'Nhựa + Thủy tinh', 40.0, 30.0, 25.0, 2200,
     '["Xanh", "Trắng", "Trong suốt"]', '["Khoa học", "Thí nghiệm", "STEM", "Giáo dục"]', 4.8, 156, 1, 1, 13.64),

    -- Animal Toys
    ('toy-013', N'Gấu bông Teddy Bear khổng lồ', N'Gấu bông teddy bear siêu mềm mại, kích thước lớn. Chất liệu an toàn cho trẻ em.',
     '/images/toys/teddy-bear-giant.jpg', 'cat-014', 'brand-026', 1299000, 0, 25, 'active',
     '0+ tuổi', 'Bông PP + Vải nhung', 80.0, 60.0, 100.0, 1800,
     '["Nâu", "Trắng", "Hồng"]', '["Gấu bông", "Teddy", "Mềm mại", "An toàn"]', 4.9, 312, 0, 1, 0),

    -- Board Games
    ('toy-014', N'Cờ tỷ phú Monopoly Classic', N'Trò chơi cờ tỷ phú kinh điển với bản đồ Việt Nam. Phát triển tư duy kinh doanh.',
     '/images/toys/monopoly-vietnam.jpg', 'cat-015', 'brand-003', 899000, 1099000, 30, 'active',
     '8+ tuổi', 'Giấy + Nhựa', 40.0, 27.0, 5.0, 1200,
     '["Đa màu"]', '["Monopoly", "Board game", "Gia đình", "Kinh doanh"]', 4.5, 189, 0, 0, 18.20),

    -- Kitchen Toys
    ('toy-015', N'Bộ đồ chơi nhà bếp Hello Kitty', N'Bộ nhà bếp mini với đầy đủ dụng cụ nấu ăn. Thiết kế Hello Kitty dễ thương.',
     '/images/toys/kitchen-hello-kitty.jpg', 'cat-012', 'brand-027', 1599000, 1899000, 22, 'active',
     '3-8 tuổi', 'Nhựa ABS', 60.0, 40.0, 80.0, 3500,
     '["Hồng", "Trắng", "Đỏ"]', '["Nhà bếp", "Hello Kitty", "Nấu ăn", "Nhập vai"]', 4.7, 145, 1, 1, 15.80),

    -- Model Toys
    ('toy-016', N'Mô hình máy bay Boeing 747', N'Mô hình máy bay Boeing 747 tỷ lệ 1:200 với chi tiết tinh xảo. Dành cho người sưu tập.',
     '/images/toys/boeing-747-model.jpg', 'cat-009', 'brand-024', 2299000, 2699000, 12, 'active',
     '12+ tuổi', 'Kim loại + Nhựa', 35.0, 32.0, 12.0, 800,
     '["Trắng", "Xanh", "Đỏ"]', '["Máy bay", "Mô hình", "Boeing", "Sưu tập"]', 4.8, 67, 0, 1, 14.82),

    -- Outdoor Toys
    ('toy-017', N'Xe scooter 3 bánh cho trẻ em', N'Xe scooter 3 bánh an toàn với đèn LED và nhạc. Phát triển khả năng cân bằng.',
     '/images/toys/scooter-3-wheels.jpg', 'cat-010', 'brand-027', 1799000, 2199000, 15, 'active',
     '3-8 tuổi', 'Nhựa + Kim loại', 60.0, 35.0, 80.0, 3200,
     '["Xanh", "Hồng", "Đỏ"]', '["Scooter", "3 bánh", "LED", "Cân bằng"]', 4.4, 98, 1, 0, 18.19),

    -- Baby Toys
    ('toy-018', N'Đồ chơi xúc xắc mềm cho baby', N'Bộ 6 xúc xắc mềm với âm thanh và màu sắc. An toàn cho trẻ sơ sinh.',
     '/images/toys/soft-dice-baby.jpg', 'cat-016', 'brand-026', 399000, 499000, 50, 'active',
     '0-2 tuổi', 'Vải mềm + Bông', 8.0, 8.0, 8.0, 150,
     '["Đa màu"]', '["Baby", "Mềm", "An toàn", "Âm thanh"]', 4.6, 278, 0, 0, 20.04),

    -- Art & Craft
    ('toy-019', N'Bộ bút màu Crayola 120 màu', N'Bộ bút màu sáp Crayola với 120 màu sắc rực rỡ. Kèm sách tô màu và giấy vẽ.',
     '/images/toys/crayola-120-colors.jpg', 'cat-007', 'brand-011', 899000, 1199000, 35, 'active',
     '3+ tuổi', 'Sáp màu + Giấy', 35.0, 25.0, 8.0, 1100,
     '["Đa màu"]', '["Crayola", "Bút màu", "120 màu", "Nghệ thuật"]', 4.7, 201, 0, 1, 25.02),

    -- Electronic Toys
    ('toy-020', N'Robot lập trình Dash Wonder', N'Robot thông minh có thể lập trình qua app. Dạy trẻ em coding cơ bản.',
     '/images/toys/dash-robot-wonder.jpg', 'cat-006', 'brand-030', 3299000, 3899000, 8, 'active',
     '6+ tuổi', 'Nhựa + Linh kiện điện tử', 20.0, 15.0, 18.0, 1500,
     '["Xanh", "Trắng"]', '["Robot", "Lập trình", "Coding", "STEM"]', 4.9, 89, 1, 1, 15.39);

    PRINT 'Additional sample toys inserted successfully';
END
GO

-- =====================================================
-- 4. UPDATE EXISTING DATA FOR BETTER VARIETY
-- =====================================================

-- Update some existing toys to use new categories and brands
UPDATE zen50558_ManagementStore.dbo.Toys SET CategoryId = 'cat-009' WHERE Id = 'toy-008' AND CategoryId = 'cat-001'; -- Piano -> Model
UPDATE zen50558_ManagementStore.dbo.Toys SET BrandId = 'brand-011' WHERE Id = 'toy-006' AND BrandId = 'brand-007'; -- Crayola brand for art toys

-- =====================================================
-- 5. VERIFY DATA INTEGRITY
-- =====================================================

-- Check categories count
SELECT 'Categories' as TableName, COUNT(*) as RecordCount FROM zen50558_ManagementStore.dbo.ToyCategories WHERE IsActive = 1
UNION ALL
-- Check brands count
SELECT 'Brands' as TableName, COUNT(*) as RecordCount FROM zen50558_ManagementStore.dbo.ToyBrands WHERE IsActive = 1
UNION ALL
-- Check toys count
SELECT 'Toys' as TableName, COUNT(*) as RecordCount FROM zen50558_ManagementStore.dbo.Toys WHERE IsActive = 1;

-- Show category distribution
SELECT
    c.Name as CategoryName,
    COUNT(t.Id) as ToyCount
FROM zen50558_ManagementStore.dbo.ToyCategories c
LEFT JOIN zen50558_ManagementStore.dbo.Toys t ON c.Id = t.CategoryId AND t.IsActive = 1
WHERE c.IsActive = 1
GROUP BY c.Id, c.Name
ORDER BY ToyCount DESC, c.Name;

-- Show brand distribution
SELECT
    b.Name as BrandName,
    COUNT(t.Id) as ToyCount
FROM zen50558_ManagementStore.dbo.ToyBrands b
LEFT JOIN zen50558_ManagementStore.dbo.Toys t ON b.Id = t.BrandId AND t.IsActive = 1
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
PRINT '✅ Educational, Building, Dolls, Vehicles, Sports';
PRINT '✅ Electronic, Art, Music, Model, Outdoor';
PRINT '✅ Puzzle, Kitchen, Science, Animal, Board Games, Baby';
PRINT '';
PRINT 'Brands include:';
PRINT '✅ LEGO, Mattel, Hasbro, Fisher-Price, Disney';
PRINT '✅ Crayola, Hot Wheels, Barbie, Transformers';
PRINT '✅ Pokémon, Marvel, Star Wars, Minecraft';
PRINT '✅ And many more popular toy brands!';
PRINT '';
PRINT 'Ready for dropdown testing in /apps/toy-management!';
PRINT '==============================================';
GO
