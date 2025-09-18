-- ========================================
-- REMINDER SYSTEM DATABASE SCHEMA
-- ========================================
-- Script to create all tables for Reminder System
-- Database: zen50558_ManagementStore
-- ========================================

USE zen50558_ManagementStore;
GO

PRINT '=== CREATING REMINDER SYSTEM TABLES ===';
PRINT '';

-- ========================================
-- 1. DROP EXISTING TABLES (if any)
-- ========================================
IF EXISTS (SELECT * FROM sysobjects WHERE name='NotificationHistory' AND xtype='U')
    DROP TABLE NotificationHistory;
IF EXISTS (SELECT * FROM sysobjects WHERE name='ReminderSubscribers' AND xtype='U')
    DROP TABLE ReminderSubscribers;
IF EXISTS (SELECT * FROM sysobjects WHERE name='ReminderAttachments' AND xtype='U')
    DROP TABLE ReminderAttachments;
IF EXISTS (SELECT * FROM sysobjects WHERE name='Reminders' AND xtype='U')
    DROP TABLE Reminders;
IF EXISTS (SELECT * FROM sysobjects WHERE name='ReminderCategories' AND xtype='U')
    DROP TABLE ReminderCategories;
IF EXISTS (SELECT * FROM sysobjects WHERE name='NotificationTemplates' AND xtype='U')
    DROP TABLE NotificationTemplates;
IF EXISTS (SELECT * FROM sysobjects WHERE name='TelegramSettings' AND xtype='U')
    DROP TABLE TelegramSettings;
GO

-- ========================================
-- 2. CREATE REMINDER_CATEGORIES TABLE
-- ========================================
CREATE TABLE ReminderCategories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    icon NVARCHAR(50) NULL,
    color NVARCHAR(20) NULL,
    isActive BIT NOT NULL DEFAULT 1,
    createdDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    createdBy NVARCHAR(255) NOT NULL DEFAULT 'System',
    updatedBy NVARCHAR(255) NULL
);

CREATE INDEX IX_ReminderCategories_Name ON ReminderCategories(name);
CREATE INDEX IX_ReminderCategories_IsActive ON ReminderCategories(isActive);

PRINT 'Created table: ReminderCategories';
GO

-- ========================================
-- 3. CREATE REMINDERS TABLE
-- ========================================
CREATE TABLE Reminders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    categoryId INT NULL,
    
    -- Time configuration
    reminderType NVARCHAR(20) NOT NULL,
    reminderDate DATE NULL,
    reminderTime TIME NOT NULL,
    
    -- Repeat configuration
    repeatInterval INT NULL,
    repeatDaysOfWeek NVARCHAR(20) NULL,
    repeatDayOfMonth INT NULL,
    repeatMonths NVARCHAR(50) NULL,
    
    -- Validity period
    startDate DATE NOT NULL,
    endDate DATE NULL,
    
    -- Notification settings
    notifyBefore INT NULL DEFAULT 0,
    priority NVARCHAR(20) NOT NULL DEFAULT 'medium',
    
    -- Telegram settings
    telegramChatIds NVARCHAR(MAX) NULL,
    telegramTemplate NVARCHAR(MAX) NULL,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    isPaused BIT NOT NULL DEFAULT 0,
    lastTriggeredDate DATETIME2 NULL,
    nextTriggerDate DATETIME2 NULL,
    
    -- Metadata
    tags NVARCHAR(500) NULL,
    customData NVARCHAR(MAX) NULL,
    
    createdDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    createdBy NVARCHAR(255) NOT NULL DEFAULT 'System',
    updatedBy NVARCHAR(255) NULL,
    
    CONSTRAINT FK_Reminders_Category FOREIGN KEY (categoryId) REFERENCES ReminderCategories(id)
);

-- Create indexes
CREATE INDEX IX_Reminders_Title ON Reminders(title);
CREATE INDEX IX_Reminders_ReminderType ON Reminders(reminderType);
CREATE INDEX IX_Reminders_IsActive ON Reminders(isActive);
CREATE INDEX IX_Reminders_NextTriggerDate ON Reminders(nextTriggerDate);
CREATE INDEX IX_Reminders_CategoryId ON Reminders(categoryId);
CREATE INDEX IX_Reminders_Priority ON Reminders(priority);

-- Add check constraints
ALTER TABLE Reminders 
ADD CONSTRAINT CK_Reminders_Type 
CHECK (reminderType IN ('once', 'daily', 'weekly', 'monthly', 'yearly'));

ALTER TABLE Reminders 
ADD CONSTRAINT CK_Reminders_Priority 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE Reminders 
ADD CONSTRAINT CK_Reminders_DayOfMonth 
CHECK (repeatDayOfMonth IS NULL OR (repeatDayOfMonth >= 1 AND repeatDayOfMonth <= 31));

PRINT 'Created table: Reminders';
GO

-- ========================================
-- 4. CREATE NOTIFICATION_TEMPLATES TABLE
-- ========================================
CREATE TABLE NotificationTemplates (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    templateType NVARCHAR(20) NOT NULL,
    subject NVARCHAR(255) NULL,
    content NVARCHAR(MAX) NOT NULL,
    parseMode NVARCHAR(20) NULL DEFAULT 'HTML',
    disableWebPreview BIT NULL DEFAULT 0,
    disableNotification BIT NULL DEFAULT 0,
    isDefault BIT NOT NULL DEFAULT 0,
    isActive BIT NOT NULL DEFAULT 1,
    createdDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    createdBy NVARCHAR(255) NOT NULL DEFAULT 'System',
    updatedBy NVARCHAR(255) NULL
);

CREATE INDEX IX_NotificationTemplates_Name ON NotificationTemplates(name);
CREATE INDEX IX_NotificationTemplates_TemplateType ON NotificationTemplates(templateType);
CREATE INDEX IX_NotificationTemplates_IsDefault ON NotificationTemplates(isDefault);

PRINT 'Created table: NotificationTemplates';
GO

-- ========================================
-- 5. CREATE NOTIFICATION_HISTORY TABLE
-- ========================================
CREATE TABLE NotificationHistory (
    id INT IDENTITY(1,1) PRIMARY KEY,
    reminderId INT NOT NULL,
    notificationType NVARCHAR(20) NOT NULL,
    recipient NVARCHAR(255) NOT NULL,
    subject NVARCHAR(255) NULL,
    content NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(20) NOT NULL,
    errorMessage NVARCHAR(MAX) NULL,
    retryCount INT NOT NULL DEFAULT 0,
    scheduledDate DATETIME2 NOT NULL,
    sentDate DATETIME2 NULL,
    responseData NVARCHAR(MAX) NULL,
    createdDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_NotificationHistory_Reminder FOREIGN KEY (reminderId) REFERENCES Reminders(id)
);

CREATE INDEX IX_NotificationHistory_ReminderId ON NotificationHistory(reminderId);
CREATE INDEX IX_NotificationHistory_Status ON NotificationHistory(status);
CREATE INDEX IX_NotificationHistory_ScheduledDate ON NotificationHistory(scheduledDate);
CREATE INDEX IX_NotificationHistory_SentDate ON NotificationHistory(sentDate);

PRINT 'Created table: NotificationHistory';
GO

-- ========================================
-- 6. CREATE TELEGRAM_SETTINGS TABLE
-- ========================================
CREATE TABLE TelegramSettings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    botToken NVARCHAR(255) NOT NULL,
    botUsername NVARCHAR(100) NOT NULL,
    defaultChatIds NVARCHAR(MAX) NULL,
    defaultParseMode NVARCHAR(20) NULL DEFAULT 'HTML',
    maxMessagesPerSecond INT NOT NULL DEFAULT 30,
    maxMessagesPerMinute INT NOT NULL DEFAULT 20,
    webhookUrl NVARCHAR(500) NULL,
    webhookSecret NVARCHAR(255) NULL,
    isActive BIT NOT NULL DEFAULT 1,
    lastTestDate DATETIME2 NULL,
    lastTestResult NVARCHAR(MAX) NULL,
    createdDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    createdBy NVARCHAR(255) NOT NULL DEFAULT 'System',
    updatedBy NVARCHAR(255) NULL
);

PRINT 'Created table: TelegramSettings';
GO

-- ========================================
-- 7. CREATE REMINDER_ATTACHMENTS TABLE
-- ========================================
CREATE TABLE ReminderAttachments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    reminderId INT NOT NULL,
    fileName NVARCHAR(255) NOT NULL,
    fileType NVARCHAR(50) NOT NULL,
    fileSize BIGINT NOT NULL,
    filePath NVARCHAR(500) NOT NULL,
    telegramFileId NVARCHAR(255) NULL,
    uploadedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    uploadedBy NVARCHAR(255) NOT NULL DEFAULT 'System',
    
    CONSTRAINT FK_ReminderAttachments_Reminder FOREIGN KEY (reminderId) REFERENCES Reminders(id) ON DELETE CASCADE
);

CREATE INDEX IX_ReminderAttachments_ReminderId ON ReminderAttachments(reminderId);
CREATE INDEX IX_ReminderAttachments_FileType ON ReminderAttachments(fileType);

PRINT 'Created table: ReminderAttachments';
GO

-- ========================================
-- 8. CREATE REMINDER_SUBSCRIBERS TABLE
-- ========================================
CREATE TABLE ReminderSubscribers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    reminderId INT NOT NULL,
    subscriberName NVARCHAR(255) NOT NULL,
    subscriberType NVARCHAR(20) NOT NULL,
    subscriberAddress NVARCHAR(255) NOT NULL,
    isActive BIT NOT NULL DEFAULT 1,
    mutedUntil DATETIME2 NULL,
    telegramUsername NVARCHAR(100) NULL,
    telegramFirstName NVARCHAR(100) NULL,
    telegramLastName NVARCHAR(100) NULL,
    subscribedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    unsubscribedDate DATETIME2 NULL,
    
    CONSTRAINT FK_ReminderSubscribers_Reminder FOREIGN KEY (reminderId) REFERENCES Reminders(id) ON DELETE CASCADE
);

CREATE INDEX IX_ReminderSubscribers_ReminderId ON ReminderSubscribers(reminderId);
CREATE INDEX IX_ReminderSubscribers_SubscriberType ON ReminderSubscribers(subscriberType);
CREATE INDEX IX_ReminderSubscribers_IsActive ON ReminderSubscribers(isActive);

ALTER TABLE ReminderSubscribers
ADD CONSTRAINT UQ_ReminderSubscribers_Reminder_Address 
UNIQUE (reminderId, subscriberType, subscriberAddress);

PRINT 'Created table: ReminderSubscribers';
GO

-- ========================================
-- 9. INSERT SAMPLE DATA
-- ========================================
PRINT '';
PRINT 'Inserting sample data...';

-- Insert sample categories
INSERT INTO ReminderCategories (name, description, icon, color) VALUES
(N'Work', N'Work related reminders', 'work', '#2196F3'),
(N'Personal', N'Personal reminders', 'person', '#4CAF50'),
(N'Family', N'Family reminders', 'family', '#FF9800'),
(N'Health', N'Health related reminders', 'health', '#F44336'),
(N'Finance', N'Financial reminders', 'money', '#9C27B0'),
(N'Study', N'Study reminders', 'book', '#00BCD4'),
(N'Event', N'Event reminders', 'event', '#FF5722'),
(N'Other', N'Other reminders', 'other', '#607D8B');

PRINT 'Inserted 8 categories';

-- Insert sample notification templates
INSERT INTO NotificationTemplates (name, description, templateType, content, parseMode) VALUES
(N'Default Telegram Template', N'Default template for Telegram notifications', 'telegram', 
N'<b>Reminder: {{title}}</b>

Time: {{date}} at {{time}}
Description: {{description}}

Category: {{category}}
Priority: {{priority}}', 'HTML'),

(N'Simple Template', N'Simple notification template', 'telegram',
N'<b>{{title}}</b>
{{time}} - {{date}}
{{description}}', 'HTML'),

(N'Detailed Template', N'Detailed notification template', 'telegram',
N'<b>IMPORTANT NOTIFICATION</b>
--------------------------------
Title: {{title}}
Time: {{date}} at {{time}}
Location: {{location}}

Details:
{{description}}

Notes: {{notes}}', 'HTML');

PRINT 'Inserted 3 notification templates';

-- Insert sample reminders
INSERT INTO Reminders (title, description, categoryId, reminderType, reminderTime, startDate, priority) VALUES
(N'Weekly Team Meeting', N'Weekly team sync meeting', 1, 'weekly', '09:00:00', CAST(GETDATE() AS DATE), 'high'),
(N'Daily Medication', N'Take medication after breakfast', 4, 'daily', '08:00:00', CAST(GETDATE() AS DATE), 'urgent'),
(N'Monthly Bill Payment', N'Pay electricity bill', 5, 'monthly', '10:00:00', CAST(GETDATE() AS DATE), 'high');

PRINT 'Inserted 3 sample reminders';
GO

-- ========================================
-- 10. CREATE STORED PROCEDURES
-- ========================================
PRINT '';
PRINT 'Creating stored procedures...';

-- Drop existing procedures if any
IF EXISTS (SELECT * FROM sysobjects WHERE name='sp_GetPendingReminders' AND xtype='P')
    DROP PROCEDURE sp_GetPendingReminders;
GO

CREATE PROCEDURE sp_GetPendingReminders
    @CurrentDateTime DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @CurrentDateTime IS NULL
        SET @CurrentDateTime = GETDATE();
    
    SELECT 
        r.id,
        r.title,
        r.description,
        r.reminderType,
        r.reminderTime,
        r.priority,
        r.telegramChatIds,
        r.telegramTemplate,
        c.name AS categoryName,
        c.icon AS categoryIcon
    FROM Reminders r
    LEFT JOIN ReminderCategories c ON r.categoryId = c.id
    WHERE r.isActive = 1
        AND r.isPaused = 0
        AND (r.nextTriggerDate <= @CurrentDateTime OR r.nextTriggerDate IS NULL)
        AND (r.endDate IS NULL OR r.endDate >= CAST(@CurrentDateTime AS DATE))
    ORDER BY r.priority DESC, r.nextTriggerDate ASC;
END
GO

PRINT 'Created procedure: sp_GetPendingReminders';

IF EXISTS (SELECT * FROM sysobjects WHERE name='sp_UpdateNextTriggerDate' AND xtype='P')
    DROP PROCEDURE sp_UpdateNextTriggerDate;
GO

CREATE PROCEDURE sp_UpdateNextTriggerDate
    @ReminderId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ReminderType NVARCHAR(20);
    DECLARE @NextDate DATETIME2;
    DECLARE @CurrentDate DATETIME2 = GETDATE();
    
    SELECT @ReminderType = reminderType
    FROM Reminders
    WHERE id = @ReminderId;
    
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
    
    UPDATE Reminders
    SET lastTriggeredDate = @CurrentDate,
        nextTriggerDate = @NextDate,
        updatedDate = @CurrentDate
    WHERE id = @ReminderId;
    
    SELECT @NextDate AS NextTriggerDate;
END
GO

PRINT 'Created procedure: sp_UpdateNextTriggerDate';

-- ========================================
-- 11. CREATE VIEWS
-- ========================================
PRINT '';
PRINT 'Creating views...';

IF EXISTS (SELECT * FROM sysobjects WHERE name='vw_RemindersFullInfo' AND xtype='V')
    DROP VIEW vw_RemindersFullInfo;
GO

CREATE VIEW vw_RemindersFullInfo AS
SELECT 
    r.id,
    r.title,
    r.description,
    r.reminderType,
    r.reminderDate,
    r.reminderTime,
    r.startDate,
    r.endDate,
    r.priority,
    r.isActive,
    r.isPaused,
    r.lastTriggeredDate,
    r.nextTriggerDate,
    c.name AS categoryName,
    c.icon AS categoryIcon,
    c.color AS categoryColor,
    (SELECT COUNT(*) FROM ReminderSubscribers WHERE reminderId = r.id AND isActive = 1) AS activeSubscribers,
    (SELECT COUNT(*) FROM NotificationHistory WHERE reminderId = r.id AND status = 'sent') AS totalNotificationsSent,
    (SELECT TOP 1 sentDate FROM NotificationHistory WHERE reminderId = r.id AND status = 'sent' ORDER BY sentDate DESC) AS lastNotificationSent
FROM Reminders r
LEFT JOIN ReminderCategories c ON r.categoryId = c.id;
GO

PRINT 'Created view: vw_RemindersFullInfo';

-- ========================================
-- 12. FINAL VERIFICATION
-- ========================================
PRINT '';
PRINT '=== VERIFICATION ===';
PRINT '';

SELECT 'Tables Created:' AS Status, COUNT(*) AS Count
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('ReminderCategories', 'Reminders', 'NotificationTemplates', 
                     'NotificationHistory', 'TelegramSettings', 'ReminderAttachments', 
                     'ReminderSubscribers');

SELECT 'Categories:' AS DataType, COUNT(*) AS Count FROM ReminderCategories
UNION ALL
SELECT 'Reminders:', COUNT(*) FROM Reminders
UNION ALL
SELECT 'Templates:', COUNT(*) FROM NotificationTemplates;

PRINT '';
PRINT '=== REMINDER SYSTEM SETUP COMPLETED SUCCESSFULLY ===';
PRINT 'Tables created: 7';
PRINT 'Stored procedures created: 2';
PRINT 'Views created: 1';
PRINT 'Sample data inserted';
PRINT '=====================================================';