-- =============================================
-- REMINDER SYSTEM PERFORMANCE OPTIMIZATION
-- =============================================
-- Script tối ưu hóa hiệu năng cho hệ thống nhắc nhở
-- Bao gồm: Indexes, Query hints, Statistics
-- =============================================

USE zen50558_ManagementStore;
GO

PRINT '=== REMINDER SYSTEM PERFORMANCE OPTIMIZATION ===';
PRINT '';

-- =============================================
-- 1. ADDITIONAL INDEXES FOR BETTER PERFORMANCE
-- =============================================

PRINT '1. Creating performance indexes...';

-- Composite index for reminder query patterns
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reminders_Active_NextTrigger')
BEGIN
    CREATE INDEX IX_Reminders_Active_NextTrigger 
    ON Reminders(isActive, isPaused, nextTriggerDate)
    INCLUDE (title, description, priority, telegramChatIds);
    PRINT '✅ Created IX_Reminders_Active_NextTrigger';
END

-- Index for date range queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reminders_DateRange')
BEGIN
    CREATE INDEX IX_Reminders_DateRange 
    ON Reminders(startDate, endDate)
    WHERE isActive = 1;
    PRINT '✅ Created IX_Reminders_DateRange';
END

-- Index for notification history queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NotificationHistory_Reminder_Status')
BEGIN
    CREATE INDEX IX_NotificationHistory_Reminder_Status 
    ON NotificationHistory(reminderId, status, sentDate DESC)
    INCLUDE (recipient, errorMessage);
    PRINT '✅ Created IX_NotificationHistory_Reminder_Status';
END

-- Index for pending notifications
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NotificationHistory_Pending')
BEGIN
    CREATE INDEX IX_NotificationHistory_Pending 
    ON NotificationHistory(status, scheduledDate)
    WHERE status = 'pending';
    PRINT '✅ Created IX_NotificationHistory_Pending';
END

-- Index for subscriber lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ReminderSubscribers_Active')
BEGIN
    CREATE INDEX IX_ReminderSubscribers_Active 
    ON ReminderSubscribers(reminderId, isActive)
    INCLUDE (subscriberName, subscriberAddress, mutedUntil)
    WHERE isActive = 1;
    PRINT '✅ Created IX_ReminderSubscribers_Active';
END

PRINT '';

-- =============================================
-- 2. OPTIMIZED STORED PROCEDURES
-- =============================================

PRINT '2. Creating optimized stored procedures...';

-- Optimized procedure to get today's reminders
IF EXISTS (SELECT * FROM sysobjects WHERE name='sp_GetTodayReminders' AND xtype='P')
BEGIN
    DROP PROCEDURE sp_GetTodayReminders;
END
GO

CREATE PROCEDURE sp_GetTodayReminders
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Today DATE = CAST(GETDATE() AS DATE);
    DECLARE @Tomorrow DATE = DATEADD(DAY, 1, @Today);
    
    SELECT 
        r.id,
        r.title,
        r.description,
        r.reminderTime,
        r.priority,
        c.name AS categoryName,
        c.icon AS categoryIcon,
        c.color AS categoryColor,
        r.nextTriggerDate
    FROM Reminders r WITH (NOLOCK, INDEX(IX_Reminders_Active_NextTrigger))
    LEFT JOIN ReminderCategories c WITH (NOLOCK) ON r.categoryId = c.id
    WHERE r.isActive = 1
        AND r.isPaused = 0
        AND r.nextTriggerDate >= @Today
        AND r.nextTriggerDate < @Tomorrow
        AND (@UserId IS NULL OR r.createdBy = CAST(@UserId AS NVARCHAR(255)))
    ORDER BY r.reminderTime ASC, r.priority DESC;
END
GO

PRINT '✅ Created sp_GetTodayReminders';

-- Procedure to get upcoming reminders with pagination
IF EXISTS (SELECT * FROM sysobjects WHERE name='sp_GetUpcomingReminders' AND xtype='P')
BEGIN
    DROP PROCEDURE sp_GetUpcomingReminders;
END
GO

CREATE PROCEDURE sp_GetUpcomingReminders
    @PageNumber INT = 1,
    @PageSize INT = 20,
    @DaysAhead INT = 7,
    @CategoryId INT = NULL,
    @Priority NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    DECLARE @EndDate DATETIME2 = DATEADD(DAY, @DaysAhead, GETDATE());
    
    -- Get total count
    SELECT COUNT(*) AS TotalCount
    FROM Reminders r
    WHERE r.isActive = 1
        AND r.isPaused = 0
        AND r.nextTriggerDate BETWEEN GETDATE() AND @EndDate
        AND (@CategoryId IS NULL OR r.categoryId = @CategoryId)
        AND (@Priority IS NULL OR r.priority = @Priority);
    
    -- Get paginated results
    SELECT 
        r.id,
        r.title,
        r.description,
        r.reminderType,
        r.reminderTime,
        r.nextTriggerDate,
        r.priority,
        c.name AS categoryName,
        c.icon AS categoryIcon,
        c.color AS categoryColor,
        (SELECT COUNT(*) FROM ReminderSubscribers WHERE reminderId = r.id AND isActive = 1) AS activeSubscribers
    FROM Reminders r
    LEFT JOIN ReminderCategories c ON r.categoryId = c.id
    WHERE r.isActive = 1
        AND r.isPaused = 0
        AND r.nextTriggerDate BETWEEN GETDATE() AND @EndDate
        AND (@CategoryId IS NULL OR r.categoryId = @CategoryId)
        AND (@Priority IS NULL OR r.priority = @Priority)
    ORDER BY r.nextTriggerDate ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

PRINT '✅ Created sp_GetUpcomingReminders';

-- Procedure to log notification
IF EXISTS (SELECT * FROM sysobjects WHERE name='sp_LogNotification' AND xtype='P')
BEGIN
    DROP PROCEDURE sp_LogNotification;
END
GO

CREATE PROCEDURE sp_LogNotification
    @ReminderId INT,
    @NotificationType NVARCHAR(20),
    @Recipient NVARCHAR(255),
    @Content NVARCHAR(MAX),
    @Status NVARCHAR(20) = 'pending'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Insert notification log
        INSERT INTO NotificationHistory (
            reminderId,
            notificationType,
            recipient,
            content,
            status,
            scheduledDate,
            sentDate
        ) VALUES (
            @ReminderId,
            @NotificationType,
            @Recipient,
            @Content,
            @Status,
            GETDATE(),
            CASE WHEN @Status = 'sent' THEN GETDATE() ELSE NULL END
        );
        
        -- Update reminder last triggered date if sent
        IF @Status = 'sent'
        BEGIN
            UPDATE Reminders
            SET lastTriggeredDate = GETDATE()
            WHERE id = @ReminderId;
            
            -- Calculate and update next trigger date
            EXEC sp_UpdateNextTriggerDate @ReminderId;
        END
        
        COMMIT TRANSACTION;
        
        SELECT SCOPE_IDENTITY() AS NotificationId;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT '✅ Created sp_LogNotification';

-- =============================================
-- 3. MAINTENANCE PROCEDURES
-- =============================================

PRINT '3. Creating maintenance procedures...';

-- Procedure to clean old notification history
IF EXISTS (SELECT * FROM sysobjects WHERE name='sp_CleanupNotificationHistory' AND xtype='P')
BEGIN
    DROP PROCEDURE sp_CleanupNotificationHistory;
END
GO

CREATE PROCEDURE sp_CleanupNotificationHistory
    @DaysToKeep INT = 90
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CutoffDate DATETIME2 = DATEADD(DAY, -@DaysToKeep, GETDATE());
    DECLARE @DeletedCount INT;
    
    DELETE FROM NotificationHistory
    WHERE createdDate < @CutoffDate
        AND status IN ('sent', 'cancelled');
    
    SET @DeletedCount = @@ROWCOUNT;
    
    PRINT 'Deleted ' + CAST(@DeletedCount AS VARCHAR) + ' old notification records';
    
    -- Rebuild indexes if many records deleted
    IF @DeletedCount > 1000
    BEGIN
        ALTER INDEX ALL ON NotificationHistory REBUILD;
        PRINT 'Rebuilt indexes on NotificationHistory';
    END
END
GO

PRINT '✅ Created sp_CleanupNotificationHistory';

-- =============================================
-- 4. FUNCTIONS FOR BUSINESS LOGIC
-- =============================================

PRINT '4. Creating utility functions...';

-- Function to calculate next reminder date
IF EXISTS (SELECT * FROM sysobjects WHERE name='fn_CalculateNextReminderDate' AND xtype='FN')
BEGIN
    DROP FUNCTION fn_CalculateNextReminderDate;
END
GO

CREATE FUNCTION fn_CalculateNextReminderDate(
    @ReminderType NVARCHAR(20),
    @LastTriggerDate DATETIME2,
    @RepeatInterval INT,
    @RepeatDayOfMonth INT,
    @EndDate DATE
)
RETURNS DATETIME2
AS
BEGIN
    DECLARE @NextDate DATETIME2;
    DECLARE @CurrentDate DATETIME2 = ISNULL(@LastTriggerDate, GETDATE());
    
    IF @ReminderType = 'once'
        SET @NextDate = NULL;
    ELSE IF @ReminderType = 'daily'
        SET @NextDate = DATEADD(DAY, ISNULL(@RepeatInterval, 1), @CurrentDate);
    ELSE IF @ReminderType = 'weekly'
        SET @NextDate = DATEADD(WEEK, ISNULL(@RepeatInterval, 1), @CurrentDate);
    ELSE IF @ReminderType = 'monthly'
    BEGIN
        IF @RepeatDayOfMonth IS NOT NULL
        BEGIN
            -- Calculate next month's specific day
            DECLARE @NextMonth DATE = DATEADD(MONTH, 1, @CurrentDate);
            DECLARE @Year INT = YEAR(@NextMonth);
            DECLARE @Month INT = MONTH(@NextMonth);
            DECLARE @LastDayOfMonth INT = DAY(EOMONTH(@NextMonth));
            DECLARE @TargetDay INT = CASE 
                WHEN @RepeatDayOfMonth > @LastDayOfMonth THEN @LastDayOfMonth
                ELSE @RepeatDayOfMonth
            END;
            
            SET @NextDate = DATEFROMPARTS(@Year, @Month, @TargetDay);
        END
        ELSE
            SET @NextDate = DATEADD(MONTH, ISNULL(@RepeatInterval, 1), @CurrentDate);
    END
    ELSE IF @ReminderType = 'yearly'
        SET @NextDate = DATEADD(YEAR, ISNULL(@RepeatInterval, 1), @CurrentDate);
    
    -- Check if next date exceeds end date
    IF @EndDate IS NOT NULL AND @NextDate > @EndDate
        SET @NextDate = NULL;
    
    RETURN @NextDate;
END
GO

PRINT '✅ Created fn_CalculateNextReminderDate';

-- =============================================
-- 5. PERFORMANCE MONITORING
-- =============================================

PRINT '5. Creating performance monitoring views...';

-- View for reminder statistics
IF EXISTS (SELECT * FROM sysobjects WHERE name='vw_ReminderStatistics' AND xtype='V')
BEGIN
    DROP VIEW vw_ReminderStatistics;
END
GO

CREATE VIEW vw_ReminderStatistics AS
SELECT 
    COUNT(*) AS TotalReminders,
    SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) AS ActiveReminders,
    SUM(CASE WHEN isPaused = 1 THEN 1 ELSE 0 END) AS PausedReminders,
    SUM(CASE WHEN reminderType = 'once' THEN 1 ELSE 0 END) AS OneTimeReminders,
    SUM(CASE WHEN reminderType = 'daily' THEN 1 ELSE 0 END) AS DailyReminders,
    SUM(CASE WHEN reminderType = 'weekly' THEN 1 ELSE 0 END) AS WeeklyReminders,
    SUM(CASE WHEN reminderType = 'monthly' THEN 1 ELSE 0 END) AS MonthlyReminders,
    SUM(CASE WHEN reminderType = 'yearly' THEN 1 ELSE 0 END) AS YearlyReminders,
    SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) AS UrgentReminders,
    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS HighPriorityReminders
FROM Reminders;
GO

PRINT '✅ Created vw_ReminderStatistics';

-- View for notification performance
IF EXISTS (SELECT * FROM sysobjects WHERE name='vw_NotificationPerformance' AND xtype='V')
BEGIN
    DROP VIEW vw_NotificationPerformance;
END
GO

CREATE VIEW vw_NotificationPerformance AS
SELECT 
    CAST(scheduledDate AS DATE) AS Date,
    COUNT(*) AS TotalNotifications,
    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) AS SentNotifications,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS FailedNotifications,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS PendingNotifications,
    AVG(DATEDIFF(SECOND, scheduledDate, sentDate)) AS AvgDeliverySeconds,
    MAX(retryCount) AS MaxRetries
FROM NotificationHistory
WHERE scheduledDate >= DATEADD(DAY, -30, GETDATE())
GROUP BY CAST(scheduledDate AS DATE);
GO

PRINT '✅ Created vw_NotificationPerformance';

-- =============================================
-- 6. UPDATE STATISTICS
-- =============================================

PRINT '6. Updating statistics...';

UPDATE STATISTICS Reminders WITH FULLSCAN;
UPDATE STATISTICS ReminderCategories WITH FULLSCAN;
UPDATE STATISTICS NotificationTemplates WITH FULLSCAN;
UPDATE STATISTICS NotificationHistory WITH FULLSCAN;
UPDATE STATISTICS ReminderSubscribers WITH FULLSCAN;

PRINT '✅ Statistics updated';

-- =============================================
-- 7. PERFORMANCE TEST
-- =============================================

PRINT '';
PRINT '7. Running performance test...';
PRINT '';

SET STATISTICS TIME ON;
SET STATISTICS IO ON;

-- Test 1: Get pending reminders
PRINT 'Test 1: Getting pending reminders...';
EXEC sp_GetPendingReminders;

-- Test 2: Get today's reminders
PRINT 'Test 2: Getting today reminders...';
EXEC sp_GetTodayReminders;

-- Test 3: Get upcoming reminders with pagination
PRINT 'Test 3: Getting upcoming reminders (page 1)...';
EXEC sp_GetUpcomingReminders @PageNumber = 1, @PageSize = 10;

SET STATISTICS TIME OFF;
SET STATISTICS IO OFF;

-- =============================================
PRINT '';
PRINT '✅ REMINDER SYSTEM OPTIMIZATION COMPLETED!';
PRINT '================================================';
PRINT 'Performance improvements:';
PRINT '  - Added 5 optimized indexes';
PRINT '  - Created 4 optimized stored procedures';
PRINT '  - Added maintenance procedures';
PRINT '  - Created utility functions';
PRINT '  - Added monitoring views';
PRINT '  - Updated all statistics';
PRINT '================================================';
PRINT '';
PRINT 'Recommended maintenance schedule:';
PRINT '  - Daily: Run sp_CleanupNotificationHistory';
PRINT '  - Weekly: Update statistics';
PRINT '  - Monthly: Rebuild indexes if fragmentation > 30%';
PRINT '================================================';