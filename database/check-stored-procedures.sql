-- =====================================================
-- CHECK STORED PROCEDURES FOR TOY MANAGEMENT
-- Script to verify if all required stored procedures exist
-- =====================================================

USE zen50558_ManagementStore;
GO

PRINT '==============================================';
PRINT 'CHECKING STORED PROCEDURES FOR TOY MANAGEMENT';
PRINT '==============================================';

-- =====================================================
-- 1. LIST ALL EXISTING STORED PROCEDURES
-- =====================================================
PRINT '';
PRINT '📋 ALL STORED PROCEDURES IN DATABASE:';
PRINT '----------------------------------------';

SELECT 
    ROUTINE_NAME as ProcedureName,
    ROUTINE_TYPE as Type,
    CREATED as CreatedDate,
    LAST_ALTERED as LastModified
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;

-- =====================================================
-- 2. CHECK REQUIRED TOY MANAGEMENT PROCEDURES
-- =====================================================
PRINT '';
PRINT '🔍 REQUIRED TOY MANAGEMENT PROCEDURES:';
PRINT '----------------------------------------';

DECLARE @RequiredProcedures TABLE (
    ProcedureName NVARCHAR(255),
    Description NVARCHAR(500)
);

INSERT INTO @RequiredProcedures VALUES
('sp_GetToys', 'Original procedure for getting toys'),
('sp_GetToysForFrontend', 'Frontend-compatible procedure for getting toys with filtering/sorting/pagination'),
('sp_GetToyByIdForFrontend', 'Get single toy by ID in frontend format'),
('sp_CreateToyFromFrontend', 'Create new toy from frontend data'),
('sp_UpdateToyFromFrontend', 'Update existing toy from frontend data'),
('sp_DeleteToyFromFrontend', 'Delete toy (soft delete)');

SELECT 
    rp.ProcedureName,
    rp.Description,
    CASE 
        WHEN r.ROUTINE_NAME IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as Status,
    r.CREATED as CreatedDate
FROM @RequiredProcedures rp
LEFT JOIN INFORMATION_SCHEMA.ROUTINES r ON rp.ProcedureName = r.ROUTINE_NAME
ORDER BY rp.ProcedureName;

-- =====================================================
-- 3. CHECK MISSING PROCEDURES
-- =====================================================
PRINT '';
PRINT '⚠️ MISSING PROCEDURES:';
PRINT '----------------------------------------';

SELECT rp.ProcedureName + ' - ' + rp.Description as MissingProcedure
FROM @RequiredProcedures rp
LEFT JOIN INFORMATION_SCHEMA.ROUTINES r ON rp.ProcedureName = r.ROUTINE_NAME
WHERE r.ROUTINE_NAME IS NULL;

-- =====================================================
-- 4. CHECK TABLES EXIST
-- =====================================================
PRINT '';
PRINT '📊 CHECKING REQUIRED TABLES:';
PRINT '----------------------------------------';

DECLARE @RequiredTables TABLE (
    TableName NVARCHAR(255)
);

INSERT INTO @RequiredTables VALUES
('Toys'), ('ToyCategories'), ('ToyBrands');

SELECT 
    rt.TableName,
    CASE 
        WHEN t.TABLE_NAME IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as Status,
    CASE 
        WHEN t.TABLE_NAME IS NOT NULL THEN 
            (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = rt.TableName)
        ELSE 0
    END as ColumnCount
FROM @RequiredTables rt
LEFT JOIN INFORMATION_SCHEMA.TABLES t ON rt.TableName = t.TABLE_NAME
ORDER BY rt.TableName;

-- =====================================================
-- 5. TEST BASIC QUERIES
-- =====================================================
PRINT '';
PRINT '🧪 TESTING BASIC QUERIES:';
PRINT '----------------------------------------';

-- Test if we can query basic tables
BEGIN TRY
    DECLARE @ToyCount INT, @CategoryCount INT, @BrandCount INT;
    
    SELECT @ToyCount = COUNT(*) FROM zen50558_ManagementStore.dbo.Toys WHERE IsActive = 1;
    SELECT @CategoryCount = COUNT(*) FROM zen50558_ManagementStore.dbo.ToyCategories WHERE IsActive = 1;
    SELECT @BrandCount = COUNT(*) FROM zen50558_ManagementStore.dbo.ToyBrands WHERE IsActive = 1;
    
    PRINT 'Basic table queries: ✅ SUCCESS';
    PRINT 'Toys: ' + CAST(@ToyCount AS NVARCHAR(10));
    PRINT 'Categories: ' + CAST(@CategoryCount AS NVARCHAR(10));
    PRINT 'Brands: ' + CAST(@BrandCount AS NVARCHAR(10));
END TRY
BEGIN CATCH
    PRINT 'Basic table queries: ❌ FAILED';
    PRINT 'Error: ' + ERROR_MESSAGE();
END CATCH

-- =====================================================
-- 6. TEST EXISTING PROCEDURES
-- =====================================================
PRINT '';
PRINT '🧪 TESTING EXISTING PROCEDURES:';
PRINT '----------------------------------------';

-- Test sp_GetToys if it exists
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_GetToys')
BEGIN
    BEGIN TRY
        EXEC sp_GetToys @Page = 1, @PageSize = 1;
        PRINT 'sp_GetToys: ✅ SUCCESS';
    END TRY
    BEGIN CATCH
        PRINT 'sp_GetToys: ❌ FAILED - ' + ERROR_MESSAGE();
    END CATCH
END
ELSE
BEGIN
    PRINT 'sp_GetToys: ❌ NOT FOUND';
END

-- Test sp_GetToysForFrontend if it exists
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_GetToysForFrontend')
BEGIN
    BEGIN TRY
        EXEC sp_GetToysForFrontend @Page = 1, @PageSize = 1;
        PRINT 'sp_GetToysForFrontend: ✅ SUCCESS';
    END TRY
    BEGIN CATCH
        PRINT 'sp_GetToysForFrontend: ❌ FAILED - ' + ERROR_MESSAGE();
    END CATCH
END
ELSE
BEGIN
    PRINT 'sp_GetToysForFrontend: ❌ NOT FOUND';
END

-- =====================================================
-- 7. RECOMMENDATIONS
-- =====================================================
PRINT '';
PRINT '💡 RECOMMENDATIONS:';
PRINT '----------------------------------------';

DECLARE @MissingCount INT;
SELECT @MissingCount = COUNT(*)
FROM @RequiredProcedures rp
LEFT JOIN INFORMATION_SCHEMA.ROUTINES r ON rp.ProcedureName = r.ROUTINE_NAME
WHERE r.ROUTINE_NAME IS NULL;

IF @MissingCount > 0
BEGIN
    PRINT '⚠️ ' + CAST(@MissingCount AS NVARCHAR(10)) + ' stored procedures are missing.';
    PRINT '';
    PRINT 'TO FIX THIS ISSUE:';
    PRINT '1. Execute the schema file first (if not done):';
    PRINT '   sqlcmd -S your-server -d zen50558_ManagementStore -i database/toy-management-schema.sql';
    PRINT '';
    PRINT '2. Execute the API mapping file:';
    PRINT '   sqlcmd -S your-server -d zen50558_ManagementStore -i database/toy-management-api-mapping.sql';
    PRINT '';
    PRINT '3. Execute the sample data file:';
    PRINT '   sqlcmd -S your-server -d zen50558_ManagementStore -i database/toy-management-sample-data.sql';
    PRINT '';
    PRINT '4. Test the API endpoints:';
    PRINT '   node test-api.js';
END
ELSE
BEGIN
    PRINT '✅ All required stored procedures exist!';
    PRINT 'You can now test the API endpoints.';
END

PRINT '';
PRINT '==============================================';
PRINT 'STORED PROCEDURES CHECK COMPLETED';
PRINT '==============================================';
GO
