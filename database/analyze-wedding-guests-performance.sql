-- Performance Analysis for WeddingGuests table
-- This script analyzes current indexes, query performance, and suggests optimizations

USE zen50558_ManagementStore;
GO

PRINT '=== WEDDING GUESTS PERFORMANCE ANALYSIS ===';
PRINT '';

-- 1. Check current table structure and row count
PRINT '1. TABLE STRUCTURE AND SIZE:';
SELECT 
    t.name AS TableName,
    p.rows AS RowCount,
    (SUM(a.total_pages) * 8) / 1024 AS TotalSpaceMB,
    (SUM(a.used_pages) * 8) / 1024 AS UsedSpaceMB,
    (SUM(a.data_pages) * 8) / 1024 AS DataSpaceMB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.object_id = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE t.name = 'WeddingGuests'
GROUP BY t.name, p.rows;

PRINT '';

-- 2. Check existing indexes
PRINT '2. CURRENT INDEXES:';
SELECT 
    i.name AS IndexName,
    i.type_desc AS IndexType,
    i.is_unique AS IsUnique,
    STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS IndexColumns,
    i.fill_factor AS FillFactor,
    s.user_seeks AS UserSeeks,
    s.user_scans AS UserScans,
    s.user_lookups AS UserLookups,
    s.user_updates AS UserUpdates
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
LEFT JOIN sys.dm_db_index_usage_stats s ON i.object_id = s.object_id AND i.index_id = s.index_id
WHERE i.object_id = OBJECT_ID('WeddingGuests')
GROUP BY i.name, i.type_desc, i.is_unique, i.fill_factor, s.user_seeks, s.user_scans, s.user_lookups, s.user_updates
ORDER BY i.index_id;

PRINT '';

-- 3. Check column statistics
PRINT '3. COLUMN STATISTICS:';
SELECT 
    c.name AS ColumnName,
    c.data_type AS DataType,
    c.max_length AS MaxLength,
    c.is_nullable AS IsNullable,
    STATS_DATE(OBJECT_ID('WeddingGuests'), s.stats_id) AS LastUpdated
FROM sys.columns c
LEFT JOIN sys.stats s ON c.object_id = s.object_id 
    AND EXISTS (SELECT 1 FROM sys.stats_columns sc WHERE sc.stats_id = s.stats_id AND sc.column_id = c.column_id)
WHERE c.object_id = OBJECT_ID('WeddingGuests')
ORDER BY c.column_id;

PRINT '';

-- 4. Analyze query performance with execution plan
PRINT '4. QUERY PERFORMANCE TEST:';
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- Test current query without search
DECLARE @StartTime DATETIME2 = GETDATE();
SELECT COUNT(*) AS TotalRecords
FROM WeddingGuests
WHERE isActive = 1;
DECLARE @EndTime DATETIME2 = GETDATE();
PRINT 'Simple COUNT query took: ' + CAST(DATEDIFF(MILLISECOND, @StartTime, @EndTime) AS VARCHAR) + ' ms';

-- Test with ORDER BY
SET @StartTime = GETDATE();
SELECT TOP 10 id, name, unit, status, createdDate
FROM WeddingGuests
WHERE isActive = 1
ORDER BY createdDate DESC;
SET @EndTime = GETDATE();
PRINT 'ORDER BY query took: ' + CAST(DATEDIFF(MILLISECOND, @StartTime, @EndTime) AS VARCHAR) + ' ms';

-- Test with LIKE search (most expensive operation)
SET @StartTime = GETDATE();
SELECT COUNT(*)
FROM WeddingGuests
WHERE isActive = 1
AND (
    name LIKE '%test%' OR
    unit LIKE '%test%' OR
    relationship LIKE '%test%' OR
    notes LIKE '%test%' OR
    status LIKE '%test%' OR
    CAST(giftAmount AS NVARCHAR) LIKE '%test%' OR
    CAST(numberOfPeople AS NVARCHAR) LIKE '%test%'
);
SET @EndTime = GETDATE();
PRINT 'LIKE search query took: ' + CAST(DATEDIFF(MILLISECOND, @StartTime, @EndTime) AS VARCHAR) + ' ms';

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;

PRINT '';

-- 5. Missing index suggestions
PRINT '5. MISSING INDEX RECOMMENDATIONS:';
SELECT 
    migs.avg_total_user_cost * (migs.avg_user_impact / 100.0) * (migs.user_seeks + migs.user_scans) AS improvement_measure,
    'CREATE INDEX IX_WeddingGuests_' + 
    REPLACE(REPLACE(REPLACE(mid.equality_columns, '[', ''), ']', ''), ', ', '_') +
    CASE WHEN mid.inequality_columns IS NOT NULL 
         THEN '_' + REPLACE(REPLACE(REPLACE(mid.inequality_columns, '[', ''), ']', ''), ', ', '_')
         ELSE '' END +
    ' ON WeddingGuests (' + 
    ISNULL(mid.equality_columns, '') +
    CASE WHEN mid.equality_columns IS NOT NULL AND mid.inequality_columns IS NOT NULL 
         THEN ', ' ELSE '' END +
    ISNULL(mid.inequality_columns, '') + ')' +
    CASE WHEN mid.included_columns IS NOT NULL 
         THEN ' INCLUDE (' + mid.included_columns + ')' 
         ELSE '' END AS create_index_statement,
    migs.user_seeks,
    migs.user_scans,
    migs.avg_total_user_cost,
    migs.avg_user_impact
FROM sys.dm_db_missing_index_groups mig
INNER JOIN sys.dm_db_missing_index_group_stats migs ON migs.group_handle = mig.index_group_handle
INNER JOIN sys.dm_db_missing_index_details mid ON mig.index_handle = mid.index_handle
WHERE mid.database_id = DB_ID()
AND mid.object_id = OBJECT_ID('WeddingGuests')
ORDER BY improvement_measure DESC;

PRINT '';
PRINT '=== ANALYSIS COMPLETE ===';
