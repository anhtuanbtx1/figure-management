-- Tạo bảng team_categories nếu chưa tồn tại
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'team_categories'
)
BEGIN
  CREATE TABLE ManagementStore.dbo.team_categories (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    color       NVARCHAR(20)  NOT NULL DEFAULT '#4ae176',
    created_at  DATETIME      NOT NULL DEFAULT GETDATE()
  );

  -- Dữ liệu mẫu
  INSERT INTO ManagementStore.dbo.team_categories (name, description, color) VALUES
    (N'Premier League', N'Giải Ngoại hạng Anh', '#60a5fa'),
    (N'La Liga', N'Giải VĐQG Tây Ban Nha', '#f59e0b'),
    (N'Champions League', N'Cúp C1 châu Âu', '#4ae176'),
    (N'Nội bộ', N'Đội bóng nội bộ công ty', '#a78bfa');

  PRINT 'Bảng team_categories đã được tạo thành công.';
END
ELSE
BEGIN
  PRINT 'Bảng team_categories đã tồn tại.';
END
