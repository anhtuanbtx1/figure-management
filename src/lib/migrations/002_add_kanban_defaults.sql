/* Migration: Add DEFAULT constraints to KanbanTasks timestamps */
-- Purpose: Ensure NgayTao, NgayCapNhat, and IsActive have proper defaults
-- This prevents NULL inserts on these required columns

-- Drop existing defaults if they exist (idempotent)
IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_KanbanTasks_NgayTao')
BEGIN
  ALTER TABLE ManagementStore.dbo.KanbanTasks DROP CONSTRAINT DF_KanbanTasks_NgayTao;
END
GO

IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_KanbanTasks_NgayCapNhat')
BEGIN
  ALTER TABLE ManagementStore.dbo.KanbanTasks DROP CONSTRAINT DF_KanbanTasks_NgayCapNhat;
END
GO

IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_KanbanTasks_IsActive')
BEGIN
  ALTER TABLE ManagementStore.dbo.KanbanTasks DROP CONSTRAINT DF_KanbanTasks_IsActive;
END
GO

-- Add default constraints
ALTER TABLE ManagementStore.dbo.KanbanTasks
ADD CONSTRAINT DF_KanbanTasks_NgayTao DEFAULT SYSUTCDATETIME() FOR NgayTao;

ALTER TABLE ManagementStore.dbo.KanbanTasks
ADD CONSTRAINT DF_KanbanTasks_NgayCapNhat DEFAULT SYSUTCDATETIME() FOR NgayCapNhat;

ALTER TABLE ManagementStore.dbo.KanbanTasks
ADD CONSTRAINT DF_KanbanTasks_IsActive DEFAULT 1 FOR IsActive;

PRINT '✅ Added DEFAULT constraints to KanbanTasks';
GO

-- Verify
SELECT 'DEFAULT Constraints' as Status,
  (SELECT COUNT(*) FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('ManagementStore.dbo.KanbanTasks')) as Count;
