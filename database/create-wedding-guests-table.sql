-- Create WeddingGuests table with all required fields
-- This script ensures the table has all necessary columns for the event guests feature

USE zen50558_ManagementStore;
GO

-- Drop table if exists (for clean recreation)
IF EXISTS (SELECT * FROM sysobjects WHERE name='WeddingGuests' AND xtype='U')
BEGIN
    DROP TABLE WeddingGuests;
    PRINT 'Dropped existing WeddingGuests table';
END
GO

-- Create WeddingGuests table with all required fields
CREATE TABLE WeddingGuests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    unit NVARCHAR(255) NOT NULL,
    numberOfPeople INT NOT NULL DEFAULT 1,
    giftAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    relationship NVARCHAR(255) NULL,
    notes NVARCHAR(MAX) NULL,
    createdDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    createdBy NVARCHAR(255) NOT NULL DEFAULT 'System',
    updatedBy NVARCHAR(255) NULL,
    isActive BIT NOT NULL DEFAULT 1
);

-- Create indexes for better performance
CREATE INDEX IX_WeddingGuests_Name ON WeddingGuests(name);
CREATE INDEX IX_WeddingGuests_Unit ON WeddingGuests(unit);
CREATE INDEX IX_WeddingGuests_Status ON WeddingGuests(status);
CREATE INDEX IX_WeddingGuests_CreatedDate ON WeddingGuests(createdDate);
CREATE INDEX IX_WeddingGuests_IsActive ON WeddingGuests(isActive);

-- Add check constraints
ALTER TABLE WeddingGuests 
ADD CONSTRAINT CK_WeddingGuests_Status 
CHECK (status IN ('Going', 'Pending', 'NotGoing', 'Maybe'));

ALTER TABLE WeddingGuests 
ADD CONSTRAINT CK_WeddingGuests_NumberOfPeople 
CHECK (numberOfPeople > 0);

ALTER TABLE WeddingGuests 
ADD CONSTRAINT CK_WeddingGuests_GiftAmount 
CHECK (giftAmount >= 0);

PRINT 'WeddingGuests table created successfully with all required fields';

-- Insert sample data
INSERT INTO WeddingGuests (name, unit, numberOfPeople, giftAmount, status, relationship, notes, createdBy) VALUES
(N'Nguyễn Văn An', N'OTS', 2, 1000000, 'Going', N'Bạn bè', N'Bạn thân từ thời đại học', 'System'),
(N'Trần Thị Bình', N'Eximbank', 1, 2000000, 'Going', N'Đồng nghiệp', N'Cùng phòng ban', 'System'),
(N'Lê Minh Cường', N'Bên nội', 3, 500000, 'Pending', N'Họ hàng', N'Anh trai', 'System'),
(N'Phạm Thu Dung', N'Bạn bè', 2, 3000000, 'Going', N'Bạn bè', N'Bạn thân từ nhỏ', 'System'),
(N'Hoàng Văn Em', N'Bên ngoại', 4, 1500000, 'Maybe', N'Họ hàng', N'Chú ruột', 'System');

PRINT 'Sample data inserted successfully';

-- Verify the table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'WeddingGuests' 
ORDER BY ORDINAL_POSITION;

PRINT 'Table structure verification completed';

-- Show sample data
SELECT TOP 3 * FROM WeddingGuests;
PRINT 'Sample data verification completed';
