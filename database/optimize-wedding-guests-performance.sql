-- Performance Optimization for WeddingGuests table
-- This script creates optimized indexes and improves query performance

USE ManagementStore;
GO

PRINT '=== OPTIMIZING WEDDING GUESTS PERFORMANCE ===';
PRINT '';

-- 1. Create composite index for the most common query pattern
PRINT '1. Creating composite index for isActive + createdDate (ORDER BY optimization)...';
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WeddingGuests_IsActive_CreatedDate' AND object_id = OBJECT_ID('WeddingGuests'))
BEGIN
    CREATE INDEX IX_WeddingGuests_IsActive_CreatedDate 
    ON WeddingGuests(isActive, createdDate DESC)
    INCLUDE (id, name, unit, numberOfPeople, giftAmount, status, relationship, notes, updatedDate, createdBy, updatedBy);
    PRINT 'âœ… Created IX_WeddingGuests_IsActive_CreatedDate';
END
ELSE
    PRINT 'âš ï¸ IX_WeddingGuests_IsActive_CreatedDate already exists';

-- 2. Create index for status filtering
PRINT '2. Creating index for status filtering...';
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WeddingGuests_Status_IsActive' AND object_id = OBJECT_ID('WeddingGuests'))
BEGIN
    CREATE INDEX IX_WeddingGuests_Status_IsActive 
    ON WeddingGuests(status, isActive)
    INCLUDE (id, name, unit, createdDate);
    PRINT 'âœ… Created IX_WeddingGuests_Status_IsActive';
END
ELSE
    PRINT 'âš ï¸ IX_WeddingGuests_Status_IsActive already exists';

-- 3. Create full-text index for better text search performance
PRINT '3. Setting up full-text search...';

-- Check if full-text catalog exists
IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'WeddingGuestsCatalog')
BEGIN
    CREATE FULLTEXT CATALOG WeddingGuestsCatalog AS DEFAULT;
    PRINT 'âœ… Created full-text catalog';
END
ELSE
    PRINT 'âš ï¸ Full-text catalog already exists';

-- Create full-text index on searchable text columns
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('WeddingGuests'))
BEGIN
    -- First ensure we have a unique index (required for full-text)
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'PK_WeddingGuests' AND object_id = OBJECT_ID('WeddingGuests'))
    BEGIN
        ALTER TABLE WeddingGuests ADD CONSTRAINT PK_WeddingGuests PRIMARY KEY (id);
        PRINT 'âœ… Added primary key constraint';
    END

    CREATE FULLTEXT INDEX ON WeddingGuests(
        name LANGUAGE 1066,  -- Vietnamese
        unit LANGUAGE 1066,
        relationship LANGUAGE 1066,
        notes LANGUAGE 1066
    ) KEY INDEX PK_WeddingGuests
    ON WeddingGuestsCatalog;
    PRINT 'âœ… Created full-text index';
END
ELSE
    PRINT 'âš ï¸ Full-text index already exists';

-- 4. Create computed column for better numeric search
PRINT '4. Adding computed columns for numeric search...';
IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'GiftAmountText' AND object_id = OBJECT_ID('WeddingGuests'))
BEGIN
    ALTER TABLE WeddingGuests 
    ADD GiftAmountText AS CAST(giftAmount AS NVARCHAR(20)) PERSISTED;
    PRINT 'âœ… Added GiftAmountText computed column';
END
ELSE
    PRINT 'âš ï¸ GiftAmountText column already exists';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'NumberOfPeopleText' AND object_id = OBJECT_ID('WeddingGuests'))
BEGIN
    ALTER TABLE WeddingGuests 
    ADD NumberOfPeopleText AS CAST(numberOfPeople AS NVARCHAR(10)) PERSISTED;
    PRINT 'âœ… Added NumberOfPeopleText computed column';
END
ELSE
    PRINT 'âš ï¸ NumberOfPeopleText column already exists';

-- 5. Create indexes on computed columns
PRINT '5. Creating indexes on computed columns...';
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WeddingGuests_GiftAmountText' AND object_id = OBJECT_ID('WeddingGuests'))
BEGIN
    CREATE INDEX IX_WeddingGuests_GiftAmountText 
    ON WeddingGuests(GiftAmountText, isActive);
    PRINT 'âœ… Created IX_WeddingGuests_GiftAmountText';
END
ELSE
    PRINT 'âš ï¸ IX_WeddingGuests_GiftAmountText already exists';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WeddingGuests_NumberOfPeopleText' AND object_id = OBJECT_ID('WeddingGuests'))
BEGIN
    CREATE INDEX IX_WeddingGuests_NumberOfPeopleText 
    ON WeddingGuests(NumberOfPeopleText, isActive);
    PRINT 'âœ… Created IX_WeddingGuests_NumberOfPeopleText';
END
ELSE
    PRINT 'âš ï¸ IX_WeddingGuests_NumberOfPeopleText already exists';

-- 6. Update statistics for better query optimization
PRINT '6. Updating table statistics...';
UPDATE STATISTICS WeddingGuests WITH FULLSCAN;
PRINT 'âœ… Updated statistics';

-- 7. Test optimized queries
PRINT '7. Testing optimized query performance...';
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

DECLARE @TestStart DATETIME2 = GETDATE();

-- Test the main query pattern (no search)
SELECT TOP 50
    id, name, unit, numberOfPeople, giftAmount, status, 
    relationship, notes, createdDate, updatedDate, createdBy, updatedBy, isActive
FROM WeddingGuests
WHERE isActive = 1
ORDER BY createdDate DESC;

DECLARE @TestEnd DATETIME2 = GETDATE();
PRINT 'Optimized main query took: ' + CAST(DATEDIFF(MILLISECOND, @TestStart, @TestEnd) AS VARCHAR) + ' ms';

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;

PRINT '';
PRINT '=== OPTIMIZATION COMPLETE ===';
PRINT 'Recommended next steps:';
PRINT '1. Update API to use pagination (OFFSET/FETCH)';
PRINT '2. Use full-text search for text queries';
PRINT '3. Implement result caching for frequently accessed data';
PRINT '4. Consider adding more specific indexes based on actual usage patterns';

