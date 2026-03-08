-- ==========================================
-- Guppy Breeding Lab - Database Schema
-- SQL Server (MSSQL)
-- ==========================================

-- Table 1: GuppyFish (đã tạo bởi user)
-- Nếu chưa tạo, dùng script sau:
/*
CREATE TABLE GuppyFish (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    fishCode        NVARCHAR(50)   NOT NULL,
    name            NVARCHAR(100)  NULL,
    gender          NVARCHAR(10)   NOT NULL,
    birthDate       DATE           NULL,
    photoUrl        NVARCHAR(500)  NULL,
    strain          NVARCHAR(100)  NULL,
    color           NVARCHAR(100)  NULL,
    tailType        NVARCHAR(50)   NULL,
    size            NVARCHAR(20)   NULL,
    notes           NVARCHAR(500)  NULL,
    status          NVARCHAR(20)   DEFAULT 'Active',
    createdDate     DATETIME       DEFAULT GETDATE(),
    updatedDate     DATETIME       DEFAULT GETDATE(),
    isActive        BIT            DEFAULT 1,
    CONSTRAINT CK_GuppyFish_Gender CHECK (gender IN ('Male', 'Female')),
    CONSTRAINT UQ_GuppyFish_FishCode UNIQUE (fishCode)
);
*/

-- Table 2: GuppyBreeding
CREATE TABLE GuppyBreeding (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    maleFishId      INT            NOT NULL,
    femaleFishId    INT            NOT NULL,
    pairingDate     DATE           NOT NULL,
    birthDate       DATE           NULL,
    fryCount        INT            NULL,
    survivalCount   INT            NULL,
    notes           NVARCHAR(500)  NULL,
    status          NVARCHAR(20)   DEFAULT 'Pairing',
    createdDate     DATETIME       DEFAULT GETDATE(),
    updatedDate     DATETIME       DEFAULT GETDATE(),
    isActive        BIT            DEFAULT 1,

    -- Foreign Keys
    CONSTRAINT FK_GuppyBreeding_MaleFish FOREIGN KEY (maleFishId)
        REFERENCES GuppyFish(id),
    CONSTRAINT FK_GuppyBreeding_FemaleFish FOREIGN KEY (femaleFishId)
        REFERENCES GuppyFish(id),

    -- Constraints
    CONSTRAINT CK_GuppyBreeding_Status CHECK (status IN ('Pairing', 'Pregnant', 'Born', 'Completed', 'Failed'))
);

-- Index for performance
CREATE INDEX IX_GuppyBreeding_MaleFishId ON GuppyBreeding(maleFishId);
CREATE INDEX IX_GuppyBreeding_FemaleFishId ON GuppyBreeding(femaleFishId);
CREATE INDEX IX_GuppyBreeding_PairingDate ON GuppyBreeding(pairingDate DESC);
CREATE INDEX IX_GuppyBreeding_IsActive ON GuppyBreeding(isActive);
