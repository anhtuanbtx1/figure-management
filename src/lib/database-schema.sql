-- Create WeddingGuests table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WeddingGuests' AND xtype='U')
BEGIN
    CREATE TABLE WeddingGuests (
        Id NVARCHAR(50) PRIMARY KEY,
        FullName NVARCHAR(255) NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
        ContributionAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
        Notes NVARCHAR(MAX),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    -- Create index for better performance
    CREATE INDEX IX_WeddingGuests_Status ON WeddingGuests(Status);
    CREATE INDEX IX_WeddingGuests_CreatedAt ON WeddingGuests(CreatedAt);
    CREATE INDEX IX_WeddingGuests_FullName ON WeddingGuests(FullName);

    -- Add check constraint for Status
    ALTER TABLE WeddingGuests 
    ADD CONSTRAINT CK_WeddingGuests_Status 
    CHECK (Status IN ('CONFIRMED', 'PENDING', 'DECLINED'));

    -- Add check constraint for ContributionAmount
    ALTER TABLE WeddingGuests 
    ADD CONSTRAINT CK_WeddingGuests_ContributionAmount 
    CHECK (ContributionAmount >= 0);

    PRINT 'WeddingGuests table created successfully';
END
ELSE
BEGIN
    PRINT 'WeddingGuests table already exists';
END

-- Insert sample data if table is empty
IF NOT EXISTS (SELECT 1 FROM WeddingGuests)
BEGIN
    INSERT INTO WeddingGuests (Id, FullName, Status, ContributionAmount, Notes, CreatedAt, UpdatedAt) VALUES
    ('1', N'Nguyễn Văn Anh', 'CONFIRMED', 2000000, N'Khách VIP, cần chỗ ngồi ưu tiên', '2024-10-01', '2024-11-15'),
    ('2', N'Trần Thị Bình', 'PENDING', 0, N'Chưa phản hồi lời mời', '2024-10-05', '2024-10-05'),
    ('3', N'Lê Minh Cường', 'CONFIRMED', 1500000, N'Đại diện công ty ABC', '2024-10-10', '2024-11-20'),
    ('4', N'Phạm Thị Dung', 'DECLINED', 0, N'Bận công tác nước ngoài', '2024-10-12', '2024-10-15'),
    ('5', N'Hoàng Văn Em', 'CONFIRMED', 3000000, N'Nhà tài trợ chính', '2024-09-20', '2024-11-25'),
    ('6', N'Vũ Thị Phương', 'CONFIRMED', 500000, N'Giáo viên trường XYZ', '2024-10-08', '2024-11-10'),
    ('7', N'Đặng Minh Giang', 'PENDING', 0, N'Đang cân nhắc tham gia', '2024-11-01', '2024-11-01'),
    ('8', N'Bùi Thị Hoa', 'CONFIRMED', 2000000, N'Đại diện ngân hàng DEF', '2024-10-15', '2024-11-18'),
    ('9', N'Ngô Văn Inh', 'CONFIRMED', 1000000, N'CEO startup công nghệ', '2024-10-20', '2024-11-22'),
    ('10', N'Lý Thị Kim', 'DECLINED', 0, N'Xung đột lịch trình', '2024-10-25', '2024-10-28'),
    ('11', N'Trịnh Văn Long', 'CONFIRMED', 5000000, N'Quan chức chính phủ, cần bảo vệ', '2024-09-15', '2024-11-30'),
    ('12', N'Phan Thị Mai', 'PENDING', 0, N'Đại diện tổ chức phi lợi nhuận', '2024-11-05', '2024-11-05'),
    ('13', N'Võ Minh Nam', 'CONFIRMED', 1500000, N'Vận động viên nổi tiếng', '2024-10-18', '2024-11-12'),
    ('14', N'Đinh Thị Oanh', 'CONFIRMED', 1000000, N'Nghệ sĩ, sẽ biểu diễn tại sự kiện', '2024-09-25', '2024-11-08'),
    ('15', N'Huỳnh Văn Phúc', 'CONFIRMED', 3000000, N'Doanh nhân thành đạt', '2024-10-02', '2024-11-28'),
    ('16', N'Cao Thị Quỳnh', 'PENDING', 0, N'Nhà thiết kế thời trang', '2024-11-08', '2024-11-08'),
    ('17', N'Lương Văn Rồng', 'CONFIRMED', 2000000, N'Chủ chuỗi nhà hàng nổi tiếng', '2024-10-22', '2024-11-14'),
    ('18', N'Đỗ Thị Sương', 'DECLINED', 0, N'Bác sĩ, ca phẫu thuật khẩn cấp', '2024-10-30', '2024-11-02'),
    ('19', N'Tôn Văn Tài', 'CONFIRMED', 4000000, N'Ông trùm bất động sản', '2024-09-10', '2024-12-01'),
    ('20', N'Lê Thị Uyên', 'CONFIRMED', 800000, N'Chuyên gia du lịch', '2024-10-28', '2024-11-26');

    PRINT 'Sample data inserted successfully';
END
ELSE
BEGIN
    PRINT 'WeddingGuests table already contains data';
END
