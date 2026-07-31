/* Migration: Add NgayBatDau and NgayKetThuc columns to KanbanTasks */
-- Purpose: Support task scheduling with start and end dates
-- Created: 2026-07-31
-- Status: PENDING

IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='KanbanTasks' AND COLUMN_NAME='NgayBatDau'
)
BEGIN
  ALTER TABLE ManagementStore.dbo.KanbanTasks
  ADD NgayBatDau DATETIME2 NULL;

  PRINT '✅ Added NgayBatDau column to KanbanTasks';
END
GO

IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='KanbanTasks' AND COLUMN_NAME='NgayKetThuc'
)
BEGIN
  ALTER TABLE ManagementStore.dbo.KanbanTasks
  ADD NgayKetThuc DATETIME2 NULL;

  PRINT '✅ Added NgayKetThuc column to KanbanTasks';
END
GO

-- Verify migration
SELECT 'Migration Status' as Status, COUNT(*) as ColumnCount
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='KanbanTasks'
  AND COLUMN_NAME IN ('NgayBatDau', 'NgayKetThuc');
