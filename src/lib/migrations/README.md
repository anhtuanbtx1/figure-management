# Kanban Database Migrations

## Status: ✅ Applied

### Migration 001: Add Kanban Task Dates
- **File:** `001_add_kanban_dates.sql`
- **Applied:** 2026-07-31
- **Purpose:** Add `NgayBatDau` (start date) and `NgayKetThuc` (end date) columns to `KanbanTasks` table
- **Reason:** API route at `src/app/api/kanban/tasks/route.ts` queries these columns, causing "Failed to fetch tasks" error when they're missing

### Table Schema After Migration
```sql
KanbanTasks (
  Id            NVARCHAR(50)   -- Primary Key
  BoardId       NVARCHAR(50)   -- Foreign Key
  ColumnId      NVARCHAR(50)   -- Foreign Key
  TieuDe        NVARCHAR(255)  -- Title
  MoTa          NVARCHAR(MAX)  -- Description
  DoUuTien      NVARCHAR(20)   -- Priority
  ThuTu         INT            -- Order Index
  NguoiDuocGan  NVARCHAR(255)  -- Assignee
  NgayBatDau    DATETIME2      -- Start Date ✨ NEW
  NgayKetThuc   DATETIME2      -- End Date ✨ NEW
  Metadata      NVARCHAR(200)  -- JSON metadata
  NgayTao       DATETIME2      -- Created At
  NgayCapNhat   DATETIME2      -- Updated At
  IsActive      BIT            -- Soft Delete Flag
)
```

## How to Apply

If you're setting up a fresh database:

1. **Run the seed script:**
   ```bash
   sqlcmd -S 45.118.151.103 -U sa -P <password> -d ManagementStore -i src/lib/kanban-schema.sql
   ```

2. **Or apply this migration manually in SSMS:**
   - Open `src/lib/migrations/001_add_kanban_dates.sql`
   - Execute against `ManagementStore` database

3. **Verify the changes:**
   ```sql
   SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME='KanbanTasks' AND COLUMN_NAME LIKE 'Ngay%'
   ORDER BY ORDINAL_POSITION
   ```

## Related Files
- API Route: [src/app/api/kanban/tasks/route.ts](../../app/api/kanban/tasks/route.ts)
- Service: [src/app/(DashboardLayout)/apps/kanban/services/kanbanService.ts](../../app/(DashboardLayout)/apps/kanban/services/kanbanService.ts)
- Schema: [kanban-schema.sql](./kanban-schema.sql)
