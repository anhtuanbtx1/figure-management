SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.MedicalConditions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MedicalConditions (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_MedicalConditions PRIMARY KEY,
        Name NVARCHAR(200) COLLATE Latin1_General_100_CI_AI NOT NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_MedicalConditions_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_MedicalConditions_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_MedicalConditions_Name UNIQUE (Name),
        CONSTRAINT CK_MedicalConditions_Name CHECK (LEN(LTRIM(RTRIM(Name))) > 0)
    );
END;

IF OBJECT_ID(N'dbo.ConditionMedications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ConditionMedications (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ConditionMedications PRIMARY KEY,
        ConditionId INT NOT NULL,
        Name NVARCHAR(200) COLLATE Latin1_General_100_CI_AI NOT NULL,
        Description NVARCHAR(2000) NOT NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ConditionMedications_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_ConditionMedications_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ConditionMedications_Condition FOREIGN KEY (ConditionId)
            REFERENCES dbo.MedicalConditions(Id) ON DELETE CASCADE,
        CONSTRAINT UQ_ConditionMedications_Condition_Name UNIQUE (ConditionId, Name),
        CONSTRAINT CK_ConditionMedications_Name CHECK (LEN(LTRIM(RTRIM(Name))) > 0),
        CONSTRAINT CK_ConditionMedications_Description CHECK (LEN(LTRIM(RTRIM(Description))) > 0)
    );
    CREATE INDEX IX_ConditionMedications_Name ON dbo.ConditionMedications(Name) INCLUDE (ConditionId);
END;

COMMIT TRANSACTION;
