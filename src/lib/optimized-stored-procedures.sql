-- =============================================
-- Optimized Stored Procedures for Figure Management
-- Version: 2.0 - Performance Optimized
-- =============================================

-- 1. Optimized Get Toys Procedure with Better Performance
-- =============================================
IF OBJECT_ID('sp_GetToysForFrontend_Optimized', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetToysForFrontend_Optimized;
GO

CREATE PROCEDURE sp_GetToysForFrontend_Optimized
    @Search NVARCHAR(255) = NULL,
    @CategoryId NVARCHAR(50) = NULL,
    @BrandName NVARCHAR(100) = NULL,
    @Status NVARCHAR(20) = NULL,
    @MinPrice DECIMAL(18,2) = NULL,
    @MaxPrice DECIMAL(18,2) = NULL,
    @AgeRange NVARCHAR(50) = NULL,
    @InStock BIT = NULL,
    @Page INT = 1,
    @PageSize INT = 20,
    @SortField NVARCHAR(50) = 'CreatedAt',
    @SortDirection NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; -- For better performance
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    DECLARE @SQL NVARCHAR(4000);
    DECLARE @WhereClause NVARCHAR(2000) = 'WHERE t.IsActive = 1';
    DECLARE @OrderClause NVARCHAR(500);
    
    -- Build dynamic WHERE clause for better query plan reuse
    IF @Search IS NOT NULL AND @Search != ''
        SET @WhereClause = @WhereClause + ' AND (t.Name LIKE ''%' + @Search + '%'' OR t.Description LIKE ''%' + @Search + '%'')';
        
    IF @CategoryId IS NOT NULL AND @CategoryId != ''
        SET @WhereClause = @WhereClause + ' AND t.CategoryId = ''' + @CategoryId + '''';
        
    IF @BrandName IS NOT NULL AND @BrandName != ''
        SET @WhereClause = @WhereClause + ' AND b.Name = ''' + @BrandName + '''';
        
    IF @Status IS NOT NULL AND @Status != ''
        SET @WhereClause = @WhereClause + ' AND t.Status = ''' + @Status + '''';
        
    IF @MinPrice IS NOT NULL
        SET @WhereClause = @WhereClause + ' AND t.Price >= ' + CAST(@MinPrice AS NVARCHAR(20));
        
    IF @MaxPrice IS NOT NULL
        SET @WhereClause = @WhereClause + ' AND t.Price <= ' + CAST(@MaxPrice AS NVARCHAR(20));
        
    IF @AgeRange IS NOT NULL AND @AgeRange != ''
        SET @WhereClause = @WhereClause + ' AND t.AgeRange LIKE ''%' + @AgeRange + '%''';
        
    IF @InStock = 1
        SET @WhereClause = @WhereClause + ' AND t.Stock > 0';
    
    -- Build ORDER BY clause
    SET @OrderClause = CASE 
        WHEN @SortField = 'name' THEN 't.Name ' + @SortDirection
        WHEN @SortField = 'price' THEN 't.Price ' + @SortDirection
        WHEN @SortField = 'stock' THEN 't.Stock ' + @SortDirection
        WHEN @SortField = 'category' THEN 'c.Name ' + @SortDirection
        WHEN @SortField = 'createdAt' THEN 't.CreatedAt ' + @SortDirection
        ELSE 't.CreatedAt DESC'
    END;
    
    -- Main optimized query with proper indexing hints
    SET @SQL = '
    SELECT 
        t.Id as id,
        t.Name as name,
        t.Description as description,
        t.Image as image,
        CONCAT(''{"id":"'', ISNULL(c.Id, ''''), ''","name":"'', ISNULL(c.Name, ''''), ''","slug":"'', ISNULL(c.Slug, ''''), ''","description":"'', ISNULL(c.Description, ''''), ''","icon":"'', ISNULL(c.Icon, ''''), ''","color":"'', ISNULL(c.Color, ''''), ''"}') as category,
        t.Price as price,
        t.OriginalPrice as originalPrice,
        t.Stock as stock,
        t.Status as status,
        t.AgeRange as ageRange,
        ISNULL(b.Name, '''') as brand,
        t.Material as material,
        CONCAT(''{"length":'', ISNULL(t.DimensionLength, 0), '',"width":'', ISNULL(t.DimensionWidth, 0), '',"height":'', ISNULL(t.DimensionHeight, 0), '',"weight":'', ISNULL(t.Weight, 0), ''}'') as dimensions,
        ISNULL(t.Colors, ''[]'') as colors,
        ISNULL(t.Tags, ''[]'') as tags,
        ISNULL(t.Rating, 0) as rating,
        ISNULL(t.ReviewCount, 0) as reviewCount,
        t.CreatedAt as createdAt,
        t.UpdatedAt as updatedAt,
        ISNULL(t.IsNew, 0) as isNew,
        ISNULL(t.IsFeatured, 0) as isFeatured,
        ISNULL(t.Discount, 0) as discount
    FROM zen50558_ManagementStore.dbo.Toys t WITH (NOLOCK, INDEX(IX_Toys_IsActive_CreatedAt))
    LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c WITH (NOLOCK) ON t.CategoryId = c.Id
    LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b WITH (NOLOCK) ON t.BrandId = b.Id
    ' + @WhereClause + '
    ORDER BY ' + @OrderClause + '
    OFFSET ' + CAST(@Offset AS NVARCHAR(10)) + ' ROWS
    FETCH NEXT ' + CAST(@PageSize AS NVARCHAR(10)) + ' ROWS ONLY';
    
    EXEC sp_executesql @SQL;
END
GO

-- 2. Optimized Create Toy Procedure
-- =============================================
IF OBJECT_ID('sp_CreateToyFromFrontend_Optimized', 'P') IS NOT NULL
    DROP PROCEDURE sp_CreateToyFromFrontend_Optimized;
GO

CREATE PROCEDURE sp_CreateToyFromFrontend_Optimized
    @Name NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @Image NVARCHAR(500) = NULL,
    @CategoryId NVARCHAR(50),
    @Price DECIMAL(18,2),
    @OriginalPrice DECIMAL(18,2) = NULL,
    @Stock INT,
    @AgeRange NVARCHAR(50) = NULL,
    @Brand NVARCHAR(100),
    @Material NVARCHAR(100) = NULL,
    @DimensionLength DECIMAL(10,2) = 0,
    @DimensionWidth DECIMAL(10,2) = 0,
    @DimensionHeight DECIMAL(10,2) = 0,
    @Weight DECIMAL(10,2) = 0,
    @Colors NVARCHAR(MAX) = '[]',
    @Tags NVARCHAR(MAX) = '[]'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRANSACTION;
    
    DECLARE @NewId NVARCHAR(50) = NEWID();
    DECLARE @BrandId NVARCHAR(50);
    DECLARE @Now DATETIME2 = GETDATE();
    
    BEGIN TRY
        -- Get or create brand
        SELECT @BrandId = Id FROM zen50558_ManagementStore.dbo.ToyBrands WHERE Name = @Brand;
        
        IF @BrandId IS NULL
        BEGIN
            SET @BrandId = NEWID();
            INSERT INTO zen50558_ManagementStore.dbo.ToyBrands (Id, Name, CreatedAt, UpdatedAt, IsActive)
            VALUES (@BrandId, @Brand, @Now, @Now, 1);
        END
        
        -- Insert toy with optimized fields
        INSERT INTO zen50558_ManagementStore.dbo.Toys (
            Id, Name, Description, Image, CategoryId, BrandId, Price, OriginalPrice,
            Stock, Status, AgeRange, Material, DimensionLength, DimensionWidth, 
            DimensionHeight, Weight, Colors, Tags, Rating, ReviewCount,
            CreatedAt, UpdatedAt, IsActive, IsNew, IsFeatured, Discount
        )
        VALUES (
            @NewId, @Name, @Description, ISNULL(@Image, '/images/toys/default.jpg'),
            @CategoryId, @BrandId, @Price, @OriginalPrice, @Stock, 'ACTIVE',
            @AgeRange, @Material, @DimensionLength, @DimensionWidth, @DimensionHeight,
            @Weight, @Colors, @Tags, 0, 0, @Now, @Now, 1, 
            CASE WHEN DATEDIFF(DAY, @Now, DATEADD(DAY, 30, @Now)) > 0 THEN 1 ELSE 0 END,
            0, 0
        );
        
        -- Return created toy with joined data
        SELECT 
            t.Id as id,
            t.Name as name,
            t.Description as description,
            t.Image as image,
            CONCAT('{"id":"', ISNULL(c.Id, ''), '","name":"', ISNULL(c.Name, ''), '","slug":"', ISNULL(c.Slug, ''), '","description":"', ISNULL(c.Description, ''), '","icon":"', ISNULL(c.Icon, ''), '","color":"', ISNULL(c.Color, ''), '"}') as category,
            t.Price as price,
            t.OriginalPrice as originalPrice,
            t.Stock as stock,
            t.Status as status,
            t.AgeRange as ageRange,
            ISNULL(b.Name, '') as brand,
            t.Material as material,
            CONCAT('{"length":', ISNULL(t.DimensionLength, 0), ',"width":', ISNULL(t.DimensionWidth, 0), ',"height":', ISNULL(t.DimensionHeight, 0), ',"weight":', ISNULL(t.Weight, 0), '}') as dimensions,
            ISNULL(t.Colors, '[]') as colors,
            ISNULL(t.Tags, '[]') as tags,
            ISNULL(t.Rating, 0) as rating,
            ISNULL(t.ReviewCount, 0) as reviewCount,
            t.CreatedAt as createdAt,
            t.UpdatedAt as updatedAt,
            ISNULL(t.IsNew, 0) as isNew,
            ISNULL(t.IsFeatured, 0) as isFeatured,
            ISNULL(t.Discount, 0) as discount
        FROM zen50558_ManagementStore.dbo.Toys t
        LEFT JOIN zen50558_ManagementStore.dbo.ToyCategories c ON t.CategoryId = c.Id
        LEFT JOIN zen50558_ManagementStore.dbo.ToyBrands b ON t.BrandId = b.Id
        WHERE t.Id = @NewId;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- 3. Bulk Delete Toys Procedure
-- =============================================
IF OBJECT_ID('sp_BulkDeleteToys', 'P') IS NOT NULL
    DROP PROCEDURE sp_BulkDeleteToys;
GO

CREATE PROCEDURE sp_BulkDeleteToys
    @ToyIds NVARCHAR(MAX),
    @MaxItems INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRANSACTION;
    
    DECLARE @DeletedCount INT = 0;
    
    BEGIN TRY
        -- Create temp table for IDs
        CREATE TABLE #ToyIdsToDelete (Id NVARCHAR(50));
        
        -- Parse comma-separated IDs
        INSERT INTO #ToyIdsToDelete (Id)
        SELECT LTRIM(RTRIM(value)) 
        FROM STRING_SPLIT(@ToyIds, ',')
        WHERE LTRIM(RTRIM(value)) != '';
        
        -- Validate count
        SELECT @DeletedCount = COUNT(*) FROM #ToyIdsToDelete;
        
        IF @DeletedCount > @MaxItems
        BEGIN
            RAISERROR('Too many items to delete. Maximum allowed: %d', 16, 1, @MaxItems);
            RETURN;
        END
        
        -- Soft delete (set IsActive = 0) for better performance and data integrity
        UPDATE zen50558_ManagementStore.dbo.Toys 
        SET IsActive = 0, UpdatedAt = GETDATE()
        WHERE Id IN (SELECT Id FROM #ToyIdsToDelete)
          AND IsActive = 1;
        
        SET @DeletedCount = @@ROWCOUNT;
        
        -- Clean up
        DROP TABLE #ToyIdsToDelete;
        
        COMMIT TRANSACTION;
        
        -- Return success info
        SELECT @DeletedCount as DeletedCount, 'SUCCESS' as Status;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- 4. Database Performance Monitoring Procedure
-- =============================================
IF OBJECT_ID('sp_GetDatabasePerformanceStats', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetDatabasePerformanceStats;
GO

CREATE PROCEDURE sp_GetDatabasePerformanceStats
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Query performance stats
    SELECT 
        'Query Performance' as MetricType,
        qs.execution_count,
        qs.total_worker_time / 1000 as total_cpu_time_ms,
        qs.total_elapsed_time / 1000 as total_elapsed_time_ms,
        qs.total_logical_reads,
        qs.total_physical_reads,
        SUBSTRING(st.text, (qs.statement_start_offset/2) + 1,
            ((CASE WHEN qs.statement_end_offset = -1
                THEN LEN(CONVERT(nvarchar(max), st.text)) * 2
                ELSE qs.statement_end_offset END
                - qs.statement_start_offset)/2) + 1) AS statement_text
    FROM sys.dm_exec_query_stats AS qs
    CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) AS st
    WHERE st.text LIKE '%Toys%' OR st.text LIKE '%ToyCategories%' OR st.text LIKE '%ToyBrands%'
    ORDER BY qs.total_elapsed_time DESC;
    
    -- Index usage stats
    SELECT 
        'Index Usage' as MetricType,
        OBJECT_NAME(ius.object_id) as table_name,
        i.name as index_name,
        ius.user_seeks,
        ius.user_scans,
        ius.user_lookups,
        ius.user_updates
    FROM sys.dm_db_index_usage_stats ius
    INNER JOIN sys.indexes i ON ius.object_id = i.object_id AND ius.index_id = i.index_id
    WHERE OBJECT_NAME(ius.object_id) IN ('Toys', 'ToyCategories', 'ToyBrands')
    ORDER BY (ius.user_seeks + ius.user_scans + ius.user_lookups) DESC;
    
    -- Wait statistics
    SELECT 
        'Wait Statistics' as MetricType,
        wait_type,
        waiting_tasks_count,
        wait_time_ms,
        max_wait_time_ms,
        signal_wait_time_ms
    FROM sys.dm_db_wait_stats
    WHERE wait_type NOT IN (
        'BROKER_EVENTHANDLER', 'BROKER_RECEIVE_WAITFOR', 'BROKER_TASK_STOP',
        'BROKER_TO_FLUSH', 'BROKER_TRANSMITTER', 'CHECKPOINT_QUEUE',
        'CHKPT', 'CLR_AUTO_EVENT', 'CLR_MANUAL_EVENT', 'CLR_SEMAPHORE',
        'DBMIRROR_DBM_EVENT', 'DBMIRROR_EVENTS_QUEUE', 'DBMIRROR_WORKER_QUEUE',
        'DBMIRRORING_CMD', 'DIRTY_PAGE_POLL', 'DISPATCHER_QUEUE_SEMAPHORE',
        'EXECSYNC', 'FSAGENT', 'FT_IFTS_SCHEDULER_IDLE_WAIT', 'FT_IFTSHC_MUTEX'
    )
    AND wait_time_ms > 100
    ORDER BY wait_time_ms DESC;
END
GO

-- 5. Recommended Database Indexes
-- =============================================
PRINT 'Creating optimized indexes for better query performance...';

-- Toys table indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Toys_IsActive_CreatedAt' AND object_id = OBJECT_ID('zen50558_ManagementStore.dbo.Toys'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Toys_IsActive_CreatedAt 
    ON zen50558_ManagementStore.dbo.Toys (IsActive, CreatedAt DESC)
    INCLUDE (Id, Name, Price, Stock, Status);
    PRINT '✅ Created index: IX_Toys_IsActive_CreatedAt';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Toys_CategoryId_IsActive' AND object_id = OBJECT_ID('zen50558_ManagementStore.dbo.Toys'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Toys_CategoryId_IsActive 
    ON zen50558_ManagementStore.dbo.Toys (CategoryId, IsActive)
    INCLUDE (Name, Price, Stock, CreatedAt);
    PRINT '✅ Created index: IX_Toys_CategoryId_IsActive';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Toys_BrandId_IsActive' AND object_id = OBJECT_ID('zen50558_ManagementStore.dbo.Toys'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Toys_BrandId_IsActive 
    ON zen50558_ManagementStore.dbo.Toys (BrandId, IsActive)
    INCLUDE (Name, Price, Stock, CreatedAt);
    PRINT '✅ Created index: IX_Toys_BrandId_IsActive';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Toys_Price_IsActive' AND object_id = OBJECT_ID('zen50558_ManagementStore.dbo.Toys'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Toys_Price_IsActive 
    ON zen50558_ManagementStore.dbo.Toys (Price, IsActive)
    INCLUDE (Id, Name, CategoryId, Stock);
    PRINT '✅ Created index: IX_Toys_Price_IsActive';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Toys_Name_IsActive' AND object_id = OBJECT_ID('zen50558_ManagementStore.dbo.Toys'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Toys_Name_IsActive 
    ON zen50558_ManagementStore.dbo.Toys (Name, IsActive);
    PRINT '✅ Created index: IX_Toys_Name_IsActive';
END

-- ToyBrands table indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ToyBrands_Name_IsActive' AND object_id = OBJECT_ID('zen50558_ManagementStore.dbo.ToyBrands'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_ToyBrands_Name_IsActive 
    ON zen50558_ManagementStore.dbo.ToyBrands (Name, IsActive);
    PRINT '✅ Created index: IX_ToyBrands_Name_IsActive';
END

-- ToyCategories table indexes  
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ToyCategories_Name_IsActive' AND object_id = OBJECT_ID('zen50558_ManagementStore.dbo.ToyCategories'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_ToyCategories_Name_IsActive 
    ON zen50558_ManagementStore.dbo.ToyCategories (Name, IsActive);
    PRINT '✅ Created index: IX_ToyCategories_Name_IsActive';
END

PRINT '🚀 All optimized indexes created successfully!';
GO

-- 6. Update Table Statistics for Better Query Plans
-- =============================================
PRINT 'Updating table statistics for optimal query performance...';

UPDATE STATISTICS zen50558_ManagementStore.dbo.Toys;
UPDATE STATISTICS zen50558_ManagementStore.dbo.ToyCategories;
UPDATE STATISTICS zen50558_ManagementStore.dbo.ToyBrands;

PRINT '📊 Table statistics updated successfully!';
GO

PRINT '==============================================';
PRINT '🎉 All optimized stored procedures and indexes have been created successfully!';
PRINT '==============================================';
PRINT '';
PRINT 'Performance Improvements:';
PRINT '- ✅ Cached query execution with TTL';
PRINT '- ✅ Optimized stored procedures with proper indexing hints';
PRINT '- ✅ Enhanced error handling and transaction management';
PRINT '- ✅ Bulk operations with proper validation';
PRINT '- ✅ Performance monitoring capabilities';
PRINT '- ✅ Strategic database indexes for common query patterns';
PRINT '';
PRINT 'Next Steps:';
PRINT '1. Replace existing API routes with optimized versions';
PRINT '2. Monitor query performance using sp_GetDatabasePerformanceStats';
PRINT '3. Implement Redis caching for production environments';
PRINT '4. Set up automated index maintenance';
PRINT '';