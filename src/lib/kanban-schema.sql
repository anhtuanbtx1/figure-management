/* Kanban Board Schema for zen50558_ManagementStore */

-- 1) Boards
IF OBJECT_ID('zen50558_ManagementStore.dbo.KanbanBoards','U') IS NULL
BEGIN
  CREATE TABLE zen50558_ManagementStore.dbo.KanbanBoards (
    Id           NVARCHAR(50)  NOT NULL PRIMARY KEY,
    TenBoard     NVARCHAR(255) NOT NULL,
    MoTa         NVARCHAR(1000) NULL,
    NgayTao      DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    NgayCapNhat  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    IsActive     BIT            NOT NULL DEFAULT 1
  );
END
GO

-- 2) Columns
IF OBJECT_ID('zen50558_ManagementStore.dbo.KanbanColumns','U') IS NULL
BEGIN
  CREATE TABLE zen50558_ManagementStore.dbo.KanbanColumns (
    Id           NVARCHAR(50)  NOT NULL PRIMARY KEY,
    BoardId      NVARCHAR(50)  NOT NULL,
    TenCot       NVARCHAR(255) NOT NULL,
    MaCot        NVARCHAR(50)  NOT NULL,
    ThuTu        INT           NOT NULL,
    NgayTao      DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    NgayCapNhat  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    IsActive     BIT           NOT NULL DEFAULT 1
  );
  CREATE INDEX IX_KanbanColumns_Board ON zen50558_ManagementStore.dbo.KanbanColumns(BoardId, ThuTu);
END
GO

-- 3) Tasks
IF OBJECT_ID('zen50558_ManagementStore.dbo.KanbanTasks','U') IS NULL
BEGIN
  CREATE TABLE zen50558_ManagementStore.dbo.KanbanTasks (
    Id            NVARCHAR(50)   NOT NULL PRIMARY KEY,
    BoardId       NVARCHAR(50)   NOT NULL,
    ColumnId      NVARCHAR(50)   NOT NULL,
    TieuDe        NVARCHAR(255)  NOT NULL,
    MoTa          NVARCHAR(MAX)  NULL,
    DoUuTien      NVARCHAR(20)   NOT NULL DEFAULT N'Trung bình', -- Thấp/Trung bình/Cao/Khẩn cấp
    ThuTu         INT            NOT NULL,
    NguoiDuocGan  NVARCHAR(255)  NULL,
    Metadata      NVARCHAR(200)  NULL, -- thông tin kéo thả (position, vv.)
    NgayTao       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    NgayCapNhat   DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    IsActive      BIT             NOT NULL DEFAULT 1
  );
  CREATE INDEX IX_KanbanTasks_Column ON zen50558_ManagementStore.dbo.KanbanTasks(BoardId, ColumnId, ThuTu) INCLUDE (TieuDe, DoUuTien);
END
GO

/* Sample seed data (idempotent) */
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.KanbanBoards WHERE Id='board-1')
BEGIN
  INSERT INTO zen50558_ManagementStore.dbo.KanbanBoards(Id, TenBoard, MoTa)
  VALUES('board-1', N'Bảng chính', N'Kanban board mặc định');
END
GO

-- Ensure default columns
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.KanbanColumns WHERE Id='col-todo')
  INSERT INTO zen50558_ManagementStore.dbo.KanbanColumns(Id, BoardId, TenCot, MaCot, ThuTu)
  VALUES('col-todo','board-1',N'Cần làm','todo',1);
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.KanbanColumns WHERE Id='col-progress')
  INSERT INTO zen50558_ManagementStore.dbo.KanbanColumns(Id, BoardId, TenCot, MaCot, ThuTu)
  VALUES('col-progress','board-1',N'Đang thực hiện','progress',2);
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.KanbanColumns WHERE Id='col-pending')
  INSERT INTO zen50558_ManagementStore.dbo.KanbanColumns(Id, BoardId, TenCot, MaCot, ThuTu)
  VALUES('col-pending','board-1',N'Chờ xử lý','pending',3);
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.KanbanColumns WHERE Id='col-done')
  INSERT INTO zen50558_ManagementStore.dbo.KanbanColumns(Id, BoardId, TenCot, MaCot, ThuTu)
  VALUES('col-done','board-1',N'Hoàn thành','done',4);
GO

-- Sample tasks (insert only if none exists)
IF NOT EXISTS (SELECT 1 FROM zen50558_ManagementStore.dbo.KanbanTasks WHERE BoardId='board-1')
BEGIN
  INSERT INTO zen50558_ManagementStore.dbo.KanbanTasks(Id, BoardId, ColumnId, TieuDe, MoTa, DoUuTien, ThuTu, NguoiDuocGan)
  VALUES
  ('task-101','board-1','col-todo',N'Thiết kế giao diện trang chủ',N'Tạo wireframe và prototype',N'Cao',1,N'Nguyễn An'),
  ('task-102','board-1','col-todo',N'Phát triển tính năng đăng nhập',N'API + UI + Validation',N'Trung bình',2,N'Trần Bình'),
  ('task-103','board-1','col-progress',N'Tối ưu hiệu suất',N'Kiểm tra bundle & lazy load',N'Trung bình',1,N'Lê Cường'),
  ('task-104','board-1','col-pending',N'Viết tài liệu hướng dẫn',N'Getting started',N'Thấp',1,N'Vũ Dung'),
  ('task-105','board-1','col-done',N'Thiết lập CI/CD',N'Pipeline cơ bản',N'Cao',1,N'Phạm Em');
END
GO

/* Helper resequencing procedure for a column */
IF OBJECT_ID('zen50558_ManagementStore.dbo.sp_Kanban_ReindexColumn','P') IS NULL
  EXEC('CREATE PROCEDURE zen50558_ManagementStore.dbo.sp_Kanban_ReindexColumn @BoardId NVARCHAR(50), @ColumnId NVARCHAR(50) AS BEGIN SET NOCOUNT ON; WITH Ordered AS ( SELECT Id, ROW_NUMBER() OVER (ORDER BY ThuTu, NgayCapNhat) AS rn FROM zen50558_ManagementStore.dbo.KanbanTasks WHERE BoardId=@BoardId AND ColumnId=@ColumnId AND IsActive=1 ) UPDATE t SET ThuTu = o.rn FROM zen50558_ManagementStore.dbo.KanbanTasks t JOIN Ordered o ON t.Id=o.Id; END');
GO

