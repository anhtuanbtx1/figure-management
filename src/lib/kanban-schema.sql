/* Kanban Board Schema for ManagementStore */

-- 1) Boards
IF OBJECT_ID('ManagementStore.dbo.KanbanBoards','U') IS NULL
BEGIN
  CREATE TABLE ManagementStore.dbo.KanbanBoards (
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
IF OBJECT_ID('ManagementStore.dbo.KanbanColumns','U') IS NULL
BEGIN
  CREATE TABLE ManagementStore.dbo.KanbanColumns (
    Id           NVARCHAR(50)  NOT NULL PRIMARY KEY,
    BoardId      NVARCHAR(50)  NOT NULL,
    TenCot       NVARCHAR(255) NOT NULL,
    MaCot        NVARCHAR(50)  NOT NULL,
    ThuTu        INT           NOT NULL,
    NgayTao      DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    NgayCapNhat  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    IsActive     BIT           NOT NULL DEFAULT 1
  );
  CREATE INDEX IX_KanbanColumns_Board ON ManagementStore.dbo.KanbanColumns(BoardId, ThuTu);
END
GO

-- 3) Tasks
IF OBJECT_ID('ManagementStore.dbo.KanbanTasks','U') IS NULL
BEGIN
  CREATE TABLE ManagementStore.dbo.KanbanTasks (
    Id            NVARCHAR(50)   NOT NULL PRIMARY KEY,
    BoardId       NVARCHAR(50)   NOT NULL,
    ColumnId      NVARCHAR(50)   NOT NULL,
    TieuDe        NVARCHAR(255)  NOT NULL,
    MoTa          NVARCHAR(MAX)  NULL,
    DoUuTien      NVARCHAR(20)   NOT NULL DEFAULT N'Trung bÃ¬nh', -- Tháº¥p/Trung bÃ¬nh/Cao/Kháº©n cáº¥p
    ThuTu         INT            NOT NULL,
    NguoiDuocGan  NVARCHAR(255)  NULL,
    Metadata      NVARCHAR(200)  NULL, -- thÃ´ng tin kÃ©o tháº£ (position, vv.)
    NgayTao       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    NgayCapNhat   DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    IsActive      BIT             NOT NULL DEFAULT 1
  );
  CREATE INDEX IX_KanbanTasks_Column ON ManagementStore.dbo.KanbanTasks(BoardId, ColumnId, ThuTu) INCLUDE (TieuDe, DoUuTien);
END
GO

/* Sample seed data (idempotent) */
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.KanbanBoards WHERE Id='board-1')
BEGIN
  INSERT INTO ManagementStore.dbo.KanbanBoards(Id, TenBoard, MoTa)
  VALUES('board-1', N'Báº£ng chÃ­nh', N'Kanban board máº·c Ä‘á»‹nh');
END
GO

-- Ensure default columns
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.KanbanColumns WHERE Id='col-todo')
  INSERT INTO ManagementStore.dbo.KanbanColumns(Id, BoardId, TenCot, MaCot, ThuTu)
  VALUES('col-todo','board-1',N'Cáº§n lÃ m','todo',1);
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.KanbanColumns WHERE Id='col-progress')
  INSERT INTO ManagementStore.dbo.KanbanColumns(Id, BoardId, TenCot, MaCot, ThuTu)
  VALUES('col-progress','board-1',N'Äang thá»±c hiá»‡n','progress',2);
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.KanbanColumns WHERE Id='col-pending')
  INSERT INTO ManagementStore.dbo.KanbanColumns(Id, BoardId, TenCot, MaCot, ThuTu)
  VALUES('col-pending','board-1',N'Chá» xá»­ lÃ½','pending',3);
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.KanbanColumns WHERE Id='col-done')
  INSERT INTO ManagementStore.dbo.KanbanColumns(Id, BoardId, TenCot, MaCot, ThuTu)
  VALUES('col-done','board-1',N'HoÃ n thÃ nh','done',4);
GO

-- Sample tasks (insert only if none exists)
IF NOT EXISTS (SELECT 1 FROM ManagementStore.dbo.KanbanTasks WHERE BoardId='board-1')
BEGIN
  INSERT INTO ManagementStore.dbo.KanbanTasks(Id, BoardId, ColumnId, TieuDe, MoTa, DoUuTien, ThuTu, NguoiDuocGan)
  VALUES
  ('task-101','board-1','col-todo',N'Thiáº¿t káº¿ giao diá»‡n trang chá»§',N'Táº¡o wireframe vÃ  prototype',N'Cao',1,N'Nguyá»…n An'),
  ('task-102','board-1','col-todo',N'PhÃ¡t triá»ƒn tÃ­nh nÄƒng Ä‘Äƒng nháº­p',N'API + UI + Validation',N'Trung bÃ¬nh',2,N'Tráº§n BÃ¬nh'),
  ('task-103','board-1','col-progress',N'Tá»‘i Æ°u hiá»‡u suáº¥t',N'Kiá»ƒm tra bundle & lazy load',N'Trung bÃ¬nh',1,N'LÃª CÆ°á»ng'),
  ('task-104','board-1','col-pending',N'Viáº¿t tÃ i liá»‡u hÆ°á»›ng dáº«n',N'Getting started',N'Tháº¥p',1,N'VÅ© Dung'),
  ('task-105','board-1','col-done',N'Thiáº¿t láº­p CI/CD',N'Pipeline cÆ¡ báº£n',N'Cao',1,N'Pháº¡m Em');
END
GO

/* Helper resequencing procedure for a column */
IF OBJECT_ID('ManagementStore.dbo.sp_Kanban_ReindexColumn','P') IS NULL
  EXEC('CREATE PROCEDURE ManagementStore.dbo.sp_Kanban_ReindexColumn @BoardId NVARCHAR(50), @ColumnId NVARCHAR(50) AS BEGIN SET NOCOUNT ON; WITH Ordered AS ( SELECT Id, ROW_NUMBER() OVER (ORDER BY ThuTu, NgayCapNhat) AS rn FROM ManagementStore.dbo.KanbanTasks WHERE BoardId=@BoardId AND ColumnId=@ColumnId AND IsActive=1 ) UPDATE t SET ThuTu = o.rn FROM ManagementStore.dbo.KanbanTasks t JOIN Ordered o ON t.Id=o.Id; END');
GO


