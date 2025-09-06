-- Add unit column to WeddingGuests table if it doesn't exist
-- This migration adds the missing 'unit' column to store guest organization/unit information

USE zen50558_ManagementStore;
GO

-- Check if the column exists and add it if it doesn't
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'WeddingGuests' 
    AND COLUMN_NAME = 'unit'
)
BEGIN
    ALTER TABLE WeddingGuests 
    ADD unit NVARCHAR(255) NULL;
    
    PRINT 'Added unit column to WeddingGuests table';
END
ELSE
BEGIN
    PRINT 'Unit column already exists in WeddingGuests table';
END
GO

-- Update existing records with default unit values if they are NULL
UPDATE WeddingGuests 
SET unit = 'Chưa xác định'
WHERE unit IS NULL OR unit = '';

-- Make the column NOT NULL after updating existing records
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'WeddingGuests' 
    AND COLUMN_NAME = 'unit'
    AND IS_NULLABLE = 'YES'
)
BEGIN
    ALTER TABLE WeddingGuests 
    ALTER COLUMN unit NVARCHAR(255) NOT NULL;
    
    PRINT 'Made unit column NOT NULL';
END

-- Create index for better search performance
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'IX_WeddingGuests_Unit' 
    AND object_id = OBJECT_ID('WeddingGuests')
)
BEGIN
    CREATE INDEX IX_WeddingGuests_Unit ON WeddingGuests(unit);
    PRINT 'Created index on unit column';
END

PRINT 'Migration completed successfully';
