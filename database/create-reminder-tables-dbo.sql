-- ========================================
-- REMINDER SYSTEM DATABASE SCHEMA (DBO)
-- ========================================
-- Script to create all tables for Reminder System
-- Database: zen50558_ManagementStore
-- Schema: dbo
-- ========================================

USE zen50558_ManagementStore;
GO

PRINT '=== CREATING REMINDER SYSTEM TABLES IN DBO SCHEMA ===';
PRINT '';

-- ========================================
-- 1. DROP EXISTING TABLES (if any)
-- ========================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NotificationHistory]') AND type in (N'U'))
    DROP TABLE [dbo].[NotificationHistory];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ReminderSubscribers]') AND type in (N'U'))
    DROP TABLE [dbo].[ReminderSubscribers];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ReminderAttachments]') AND type in (N'U'))
    DROP TABLE [dbo].[ReminderAttachments];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reminders]') AND type in (N'U'))
    DROP TABLE [dbo].[Reminders];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ReminderCategories]') AND type in (N'U'))
    DROP TABLE [dbo].[ReminderCategories];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NotificationTemplates]') AND type in (N'U'))
    DROP TABLE [dbo].[NotificationTemplates];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TelegramSettings]') AND type in (N'U'))
    DROP TABLE [dbo].[TelegramSettings];
GO

PRINT 'Dropped existing tables if any';

-- ========================================
-- 2. CREATE REMINDER_CATEGORIES TABLE
-- ========================================
CREATE TABLE [dbo].[ReminderCategories] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(500) NULL,
    [icon] NVARCHAR(50) NULL,
    [color] NVARCHAR(20) NULL,
    [isActive] BIT NOT NULL DEFAULT 1,
    [createdDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [updatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [createdBy] NVARCHAR(255) NOT NULL DEFAULT 'System',
    [updatedBy] NVARCHAR(255) NULL
);

CREATE INDEX IX_ReminderCategories_Name ON [dbo].[ReminderCategories]([name]);
CREATE INDEX IX_ReminderCategories_IsActive ON [dbo].[ReminderCategories]([isActive]);

PRINT 'Created table: dbo.ReminderCategories';
GO

-- ========================================
-- 3. CREATE REMINDERS TABLE
-- ========================================
CREATE TABLE [dbo].[Reminders] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [categoryId] INT NULL,
    
    -- Time configuration
    [reminderType] NVARCHAR(20) NOT NULL,
    [reminderDate] DATE NULL,
    [reminderTime] TIME NOT NULL,
    
    -- Repeat configuration
    [repeatInterval] INT NULL,
    [repeatDaysOfWeek] NVARCHAR(20) NULL,
    [repeatDayOfMonth] INT NULL,
    [repeatMonths] NVARCHAR(50) NULL,
    
    -- Validity period
    [startDate] DATE NOT NULL,
    [endDate] DATE NULL,
    
    -- Notification settings
    [notifyBefore] INT NULL DEFAULT 0,
    [priority] NVARCHAR(20) NOT NULL DEFAULT 'medium',
    
    -- Telegram settings
    [telegramChatIds] NVARCHAR(MAX) NULL,
    [telegramTemplate] NVARCHAR(MAX) NULL,
    
    -- Status
    [isActive] BIT NOT NULL DEFAULT 1,
    [isPaused] BIT NOT NULL DEFAULT 0,
    [lastTriggeredDate] DATETIME2 NULL,
    [nextTriggerDate] DATETIME2 NULL,
    
    -- Metadata
    [tags] NVARCHAR(500) NULL,
    [customData] NVARCHAR(MAX) NULL,
    
    [createdDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [updatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [createdBy] NVARCHAR(255) NOT NULL DEFAULT 'System',
    [updatedBy] NVARCHAR(255) NULL,
    
    CONSTRAINT FK_Reminders_Category FOREIGN KEY ([categoryId]) REFERENCES [dbo].[ReminderCategories]([id])
);

-- Create indexes
CREATE INDEX IX_Reminders_Title ON [dbo].[Reminders]([title]);
CREATE INDEX IX_Reminders_ReminderType ON [dbo].[Reminders]([reminderType]);
CREATE INDEX IX_Reminders_IsActive ON [dbo].[Reminders]([isActive]);
CREATE INDEX IX_Reminders_NextTriggerDate ON [dbo].[Reminders]([nextTriggerDate]);
CREATE INDEX IX_Reminders_CategoryId ON [dbo].[Reminders]([categoryId]);
CREATE INDEX IX_Reminders_Priority ON [dbo].[Reminders]([priority]);

-- Add check constraints
ALTER TABLE [dbo].[Reminders] 
ADD CONSTRAINT CK_Reminders_Type 
CHECK ([reminderType] IN ('once', 'daily', 'weekly', 'monthly', 'yearly'));

ALTER TABLE [dbo].[Reminders] 
ADD CONSTRAINT CK_Reminders_Priority 
CHECK ([priority] IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE [dbo].[Reminders] 
ADD CONSTRAINT CK_Reminders_DayOfMonth 
CHECK ([repeatDayOfMonth] IS NULL OR ([repeatDayOfMonth] >= 1 AND [repeatDayOfMonth] <= 31));

PRINT 'Created table: dbo.Reminders';
GO

-- ========================================
-- 4. CREATE NOTIFICATION_TEMPLATES TABLE
-- ========================================
CREATE TABLE [dbo].[NotificationTemplates] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(500) NULL,
    [templateType] NVARCHAR(20) NOT NULL,
    [subject] NVARCHAR(255) NULL,
    [content] NVARCHAR(MAX) NOT NULL,
    [parseMode] NVARCHAR(20) NULL DEFAULT 'HTML',
    [disableWebPreview] BIT NULL DEFAULT 0,
    [disableNotification] BIT NULL DEFAULT 0,
    [isDefault] BIT NOT NULL DEFAULT 0,
    [isActive] BIT NOT NULL DEFAULT 1,
    [createdDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [updatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [createdBy] NVARCHAR(255) NOT NULL DEFAULT 'System',
    [updatedBy] NVARCHAR(255) NULL
);

CREATE INDEX IX_NotificationTemplates_Name ON [dbo].[NotificationTemplates]([name]);
CREATE INDEX IX_NotificationTemplates_TemplateType ON [dbo].[NotificationTemplates]([templateType]);
CREATE INDEX IX_NotificationTemplates_IsDefault ON [dbo].[NotificationTemplates]([isDefault]);

PRINT 'Created table: dbo.NotificationTemplates';
GO

-- ========================================
-- 5. CREATE NOTIFICATION_HISTORY TABLE
-- ========================================
CREATE TABLE [dbo].[NotificationHistory] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [reminderId] INT NOT NULL,
    [notificationType] NVARCHAR(20) NOT NULL,
    [recipient] NVARCHAR(255) NOT NULL,
    [subject] NVARCHAR(255) NULL,
    [content] NVARCHAR(MAX) NOT NULL,
    [status] NVARCHAR(20) NOT NULL,
    [errorMessage] NVARCHAR(MAX) NULL,
    [retryCount] INT NOT NULL DEFAULT 0,
    [scheduledDate] DATETIME2 NOT NULL,
    [sentDate] DATETIME2 NULL,
    [responseData] NVARCHAR(MAX) NULL,
    [createdDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_NotificationHistory_Reminder FOREIGN KEY ([reminderId]) REFERENCES [dbo].[Reminders]([id])
);

CREATE INDEX IX_NotificationHistory_ReminderId ON [dbo].[NotificationHistory]([reminderId]);
CREATE INDEX IX_NotificationHistory_Status ON [dbo].[NotificationHistory]([status]);
CREATE INDEX IX_NotificationHistory_ScheduledDate ON [dbo].[NotificationHistory]([scheduledDate]);
CREATE INDEX IX_NotificationHistory_SentDate ON [dbo].[NotificationHistory]([sentDate]);

PRINT 'Created table: dbo.NotificationHistory';
GO

-- ========================================
-- 6. CREATE TELEGRAM_SETTINGS TABLE
-- ========================================
CREATE TABLE [dbo].[TelegramSettings] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [botToken] NVARCHAR(255) NOT NULL,
    [botUsername] NVARCHAR(100) NOT NULL,
    [defaultChatIds] NVARCHAR(MAX) NULL,
    [defaultParseMode] NVARCHAR(20) NULL DEFAULT 'HTML',
    [maxMessagesPerSecond] INT NOT NULL DEFAULT 30,
    [maxMessagesPerMinute] INT NOT NULL DEFAULT 20,
    [webhookUrl] NVARCHAR(500) NULL,
    [webhookSecret] NVARCHAR(255) NULL,
    [isActive] BIT NOT NULL DEFAULT 1,
    [lastTestDate] DATETIME2 NULL,
    [lastTestResult] NVARCHAR(MAX) NULL,
    [createdDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [updatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [createdBy] NVARCHAR(255) NOT NULL DEFAULT 'System',
    [updatedBy] NVARCHAR(255) NULL
);

PRINT 'Created table: dbo.TelegramSettings';
GO

-- ========================================
-- 7. CREATE REMINDER_ATTACHMENTS TABLE
-- ========================================
CREATE TABLE [dbo].[ReminderAttachments] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [reminderId] INT NOT NULL,
    [fileName] NVARCHAR(255) NOT NULL,
    [fileType] NVARCHAR(50) NOT NULL,
    [fileSize] BIGINT NOT NULL,
    [filePath] NVARCHAR(500) NOT NULL,
    [telegramFileId] NVARCHAR(255) NULL,
    [uploadedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [uploadedBy] NVARCHAR(255) NOT NULL DEFAULT 'System',
    
    CONSTRAINT FK_ReminderAttachments_Reminder FOREIGN KEY ([reminderId]) REFERENCES [dbo].[Reminders]([id]) ON DELETE CASCADE
);

CREATE INDEX IX_ReminderAttachments_ReminderId ON [dbo].[ReminderAttachments]([reminderId]);
CREATE INDEX IX_ReminderAttachments_FileType ON [dbo].[ReminderAttachments]([fileType]);

PRINT 'Created table: dbo.ReminderAttachments';
GO

-- ========================================
-- 8. CREATE REMINDER_SUBSCRIBERS TABLE
-- ========================================
CREATE TABLE [dbo].[ReminderSubscribers] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [reminderId] INT NOT NULL,
    [subscriberName] NVARCHAR(255) NOT NULL,
    [subscriberType] NVARCHAR(20) NOT NULL,
    [subscriberAddress] NVARCHAR(255) NOT NULL,
    [isActive] BIT NOT NULL DEFAULT 1,
    [mutedUntil] DATETIME2 NULL,
    [telegramUsername] NVARCHAR(100) NULL,
    [telegramFirstName] NVARCHAR(100) NULL,
    [telegramLastName] NVARCHAR(100) NULL,
    [subscribedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [unsubscribedDate] DATETIME2 NULL,
    
    CONSTRAINT FK_ReminderSubscribers_Reminder FOREIGN KEY ([reminderId]) REFERENCES [dbo].[Reminders]([id]) ON DELETE CASCADE
);

CREATE INDEX IX_ReminderSubscribers_ReminderId ON [dbo].[ReminderSubscribers]([reminderId]);
CREATE INDEX IX_ReminderSubscribers_SubscriberType ON [dbo].[ReminderSubscribers]([subscriberType]);
CREATE INDEX IX_ReminderSubscribers_IsActive ON [dbo].[ReminderSubscribers]([isActive]);

ALTER TABLE [dbo].[ReminderSubscribers]
ADD CONSTRAINT UQ_ReminderSubscribers_Reminder_Address 
UNIQUE ([reminderId], [subscriberType], [subscriberAddress]);

PRINT 'Created table: dbo.ReminderSubscribers';
GO

-- ========================================
-- 9. INSERT SAMPLE DATA
-- ========================================
PRINT '';
PRINT 'Inserting sample data...';

-- Insert sample categories
INSERT INTO [dbo].[ReminderCategories] ([name], [description], [icon], [color]) VALUES
(N'Công việc', N'Nhắc nhở liên quan đến công việc', 'work', '#2196F3'),
(N'Cá nhân', N'Nhắc nhở cá nhân', 'person', '#4CAF50'),
(N'Gia đình', N'Nhắc nhở về gia đình', 'family', '#FF9800'),
(N'Sức khỏe', N'Nhắc nhở về sức khỏe', 'health', '#F44336'),
(N'Tài chính', N'Nhắc nhở về tài chính', 'money', '#9C27B0'),
(N'Học tập', N'Nhắc nhở về học tập', 'book', '#00BCD4'),
(N'Sự kiện', N'Nhắc nhở về sự kiện', 'event', '#FF5722'),
(N'Khác', N'Nhắc nhở khác', 'other', '#607D8B');

PRINT 'Inserted 8 categories';

-- Insert sample notification templates
INSERT INTO [dbo].[NotificationTemplates] ([name], [description], [templateType], [content], [parseMode]) VALUES
(N'Template mặc định Telegram', N'Template mặc định cho thông báo Telegram', 'telegram', 
N'<b>🔔 Nhắc nhở: {{title}}</b>

📅 Thời gian: {{date}} lúc {{time}}
📝 Nội dung: {{description}}

🏷️ Danh mục: {{category}}
⚡ Độ ưu tiên: {{priority}}', 'HTML'),

(N'Template ngắn gọn', N'Template ngắn gọn cho thông báo nhanh', 'telegram',
N'⏰ <b>{{title}}</b>
🕐 {{time}} - {{date}}
{{description}}', 'HTML'),

(N'Template chi tiết', N'Template chi tiết với đầy đủ thông tin', 'telegram',
N'<b>📢 THÔNG BÁO QUAN TRỌNG</b>
━━━━━━━━━━━━━━━━━━
<b>Tiêu đề:</b> {{title}}
<b>Thời gian:</b> {{date}} lúc {{time}}
<b>Địa điểm:</b> {{location}}

<b>📋 Chi tiết:</b>
{{description}}

<b>📎 Ghi chú:</b>
{{notes}}', 'HTML');

PRINT 'Inserted 3 notification templates';

-- Insert sample reminders
INSERT INTO [dbo].[Reminders] ([title], [description], [categoryId], [reminderType], [reminderTime], [startDate], [priority]) VALUES
(N'Họp team hàng tuần', N'Họp team để review công việc tuần', 1, 'weekly', '09:00:00', CAST(GETDATE() AS DATE), 'high'),
(N'Uống thuốc hàng ngày', N'Nhắc nhở uống thuốc sau bữa sáng', 4, 'daily', '08:00:00', CAST(GETDATE() AS DATE), 'urgent'),
(N'Thanh toán hóa đơn', N'Thanh toán hóa đơn điện nước', 5, 'monthly', '10:00:00', CAST(GETDATE() AS DATE), 'high');

PRINT 'Inserted 3 sample reminders';
GO

-- ========================================
-- 10. CREATE STORED PROCEDURES
-- ========================================
PRINT '';
PRINT 'Creating stored procedures...';

-- Drop existing procedures if any
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetPendingReminders]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetPendingReminders];
GO

CREATE PROCEDURE [dbo].[sp_GetPendingReminders]
    @CurrentDateTime DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @CurrentDateTime IS NULL
        SET @CurrentDateTime = GETDATE();
    
    SELECT 
        r.[id],
        r.[title],
        r.[description],
        r.[reminderType],
        r.[reminderTime],
        r.[priority],
        r.[telegramChatIds],
        r.[telegramTemplate],
        c.[name] AS categoryName,
        c.[icon] AS categoryIcon
    FROM [dbo].[Reminders] r
    LEFT JOIN [dbo].[ReminderCategories] c ON r.[categoryId] = c.[id]
    WHERE r.[isActive] = 1
        AND r.[isPaused] = 0
        AND (r.[nextTriggerDate] <= @CurrentDateTime OR r.[nextTriggerDate] IS NULL)
        AND (r.[endDate] IS NULL OR r.[endDate] >= CAST(@CurrentDateTime AS DATE))
    ORDER BY r.[priority] DESC, r.[nextTriggerDate] ASC;
END
GO

PRINT 'Created procedure: dbo.sp_GetPendingReminders';

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateNextTriggerDate]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_UpdateNextTriggerDate];
GO

CREATE PROCEDURE [dbo].[sp_UpdateNextTriggerDate]
    @ReminderId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ReminderType NVARCHAR(20);
    DECLARE @NextDate DATETIME2;
    DECLARE @CurrentDate DATETIME2 = GETDATE();
    
    SELECT @ReminderType = [reminderType]
    FROM [dbo].[Reminders]
    WHERE [id] = @ReminderId;
    
    IF @ReminderType = 'once'
        SET @NextDate = NULL;
    ELSE IF @ReminderType = 'daily'
        SET @NextDate = DATEADD(DAY, 1, @CurrentDate);
    ELSE IF @ReminderType = 'weekly'
        SET @NextDate = DATEADD(WEEK, 1, @CurrentDate);
    ELSE IF @ReminderType = 'monthly'
        SET @NextDate = DATEADD(MONTH, 1, @CurrentDate);
    ELSE IF @ReminderType = 'yearly'
        SET @NextDate = DATEADD(YEAR, 1, @CurrentDate);
    
    UPDATE [dbo].[Reminders]
    SET [lastTriggeredDate] = @CurrentDate,
        [nextTriggerDate] = @NextDate,
        [updatedDate] = @CurrentDate
    WHERE [id] = @ReminderId;
    
    SELECT @NextDate AS NextTriggerDate;
END
GO

PRINT 'Created procedure: dbo.sp_UpdateNextTriggerDate';

-- ========================================
-- 11. CREATE VIEWS
-- ========================================
PRINT '';
PRINT 'Creating views...';

IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[vw_RemindersFullInfo]'))
    DROP VIEW [dbo].[vw_RemindersFullInfo];
GO

CREATE VIEW [dbo].[vw_RemindersFullInfo] AS
SELECT 
    r.[id],
    r.[title],
    r.[description],
    r.[reminderType],
    r.[reminderDate],
    r.[reminderTime],
    r.[startDate],
    r.[endDate],
    r.[priority],
    r.[isActive],
    r.[isPaused],
    r.[lastTriggeredDate],
    r.[nextTriggerDate],
    c.[name] AS categoryName,
    c.[icon] AS categoryIcon,
    c.[color] AS categoryColor,
    (SELECT COUNT(*) FROM [dbo].[ReminderSubscribers] WHERE [reminderId] = r.[id] AND [isActive] = 1) AS activeSubscribers,
    (SELECT COUNT(*) FROM [dbo].[NotificationHistory] WHERE [reminderId] = r.[id] AND [status] = 'sent') AS totalNotificationsSent,
    (SELECT TOP 1 [sentDate] FROM [dbo].[NotificationHistory] WHERE [reminderId] = r.[id] AND [status] = 'sent' ORDER BY [sentDate] DESC) AS lastNotificationSent
FROM [dbo].[Reminders] r
LEFT JOIN [dbo].[ReminderCategories] c ON r.[categoryId] = c.[id];
GO

PRINT 'Created view: dbo.vw_RemindersFullInfo';

-- ========================================
-- 12. FINAL VERIFICATION
-- ========================================
PRINT '';
PRINT '=== VERIFICATION ===';
PRINT '';

-- Check tables
SELECT 'Tables Created:' AS Status, COUNT(*) AS Count
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'dbo'
AND TABLE_NAME IN ('ReminderCategories', 'Reminders', 'NotificationTemplates', 
                   'NotificationHistory', 'TelegramSettings', 'ReminderAttachments', 
                   'ReminderSubscribers');

-- Check data
SELECT 'Categories:' AS DataType, COUNT(*) AS Count FROM [dbo].[ReminderCategories]
UNION ALL
SELECT 'Reminders:', COUNT(*) FROM [dbo].[Reminders]
UNION ALL
SELECT 'Templates:', COUNT(*) FROM [dbo].[NotificationTemplates];

PRINT '';
PRINT '=== REMINDER SYSTEM SETUP COMPLETED SUCCESSFULLY ===';
PRINT 'Schema: dbo';
PRINT 'Tables created: 7';
PRINT 'Stored procedures created: 2';
PRINT 'Views created: 1';
PRINT 'Sample data inserted';
PRINT '=====================================================';
GO