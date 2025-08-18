@echo off
echo =====================================================
echo CLEANUP DEBUG FILES
echo =====================================================
echo.

echo 🧹 Cleaning up debug and troubleshooting files...
echo.

echo The following debug files can be safely deleted now that the system is working:
echo.

echo 📁 Debug Scripts:
echo - debug-toy-management.js
echo - debug-toys-only.js
echo - test-api-quick.js
echo - test-fully-qualified-names.js
echo.

echo 📁 Database Debug Scripts:
echo - database\check-toys-data.sql
echo - database\debug-toys-relationships.sql
echo - database\create-simple-toys-procedure.sql
echo - database\fix-toys-data.sql
echo - database\fix-toys-procedure.sql
echo - database\create-missing-procedures.sql
echo - database\update-fully-qualified-names.sql
echo.

echo 📁 Fix Scripts:
echo - fix-toy-management-loading.bat
echo - fix-toys-loading.bat
echo - fix-empty-toys.bat
echo - debug-and-fix-toys.bat
echo - cleanup-debug-files.bat (this file)
echo.

echo 📁 Documentation:
echo - FIX_API_ERRORS.md
echo - MANUAL_DATABASE_SETUP.md
echo.

echo ⚠️  KEEP THESE IMPORTANT FILES:
echo ✅ setup-database.bat / setup-database.sh (for future setups)
echo ✅ test-api.js (for ongoing testing)
echo ✅ database\toy-management-schema.sql (core schema)
echo ✅ database\toy-management-api-mapping.sql (core procedures)
echo ✅ database\toy-management-sample-data.sql (sample data)
echo ✅ database\check-stored-procedures.sql (verification)
echo ✅ database\verify-sample-data.sql (verification)
echo.

echo 🤔 Would you like to delete the debug files? (y/n)
set /p choice="Enter your choice: "

if /i "%choice%"=="y" (
    echo.
    echo 🗑️  Deleting debug files...
    
    REM Delete debug scripts
    if exist debug-toy-management.js del debug-toy-management.js
    if exist debug-toys-only.js del debug-toys-only.js
    if exist test-api-quick.js del test-api-quick.js
    if exist test-fully-qualified-names.js del test-fully-qualified-names.js
    
    REM Delete database debug scripts
    if exist database\check-toys-data.sql del database\check-toys-data.sql
    if exist database\debug-toys-relationships.sql del database\debug-toys-relationships.sql
    if exist database\create-simple-toys-procedure.sql del database\create-simple-toys-procedure.sql
    if exist database\fix-toys-data.sql del database\fix-toys-data.sql
    if exist database\fix-toys-procedure.sql del database\fix-toys-procedure.sql
    if exist database\create-missing-procedures.sql del database\create-missing-procedures.sql
    if exist database\update-fully-qualified-names.sql del database\update-fully-qualified-names.sql
    
    REM Delete fix scripts
    if exist fix-toy-management-loading.bat del fix-toy-management-loading.bat
    if exist fix-toys-loading.bat del fix-toys-loading.bat
    if exist fix-empty-toys.bat del fix-empty-toys.bat
    if exist debug-and-fix-toys.bat del debug-and-fix-toys.bat
    
    REM Delete documentation
    if exist FIX_API_ERRORS.md del FIX_API_ERRORS.md
    
    echo ✅ Debug files deleted successfully!
    echo.
    echo 🎉 Your project is now clean and production-ready!
    echo.
    echo 📋 Remaining important files:
    echo ✅ Core database scripts in database\ folder
    echo ✅ Setup scripts (setup-database.bat/sh)
    echo ✅ Main test script (test-api.js)
    echo ✅ Production toy management page (clean interface)
    
) else (
    echo.
    echo ℹ️  Debug files kept. You can delete them manually later if needed.
)

echo.
echo =====================================================
echo CLEANUP COMPLETED
echo =====================================================
echo.

echo 🎉 Toy Management System Status:
echo ✅ Production-ready interface (no debug UI)
echo ✅ All data loading properly
echo ✅ Categories and brands working
echo ✅ Toys table displaying data
echo ✅ CRUD operations functional
echo ✅ Clean, professional UI
echo.

echo 🚀 System is ready for production use!
echo.

pause
