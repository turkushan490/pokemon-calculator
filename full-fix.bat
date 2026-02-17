@echo off
echo =====================================
echo   Full Fix and Start
echo =====================================
echo.

cd /d "%~dp0"

echo Step 1: Clean webpack cache...
if exist ".webpack" rmdir /s /q ".webpack"
echo [OK] Cache cleaned
echo.

echo Step 2: Rebuild native modules...
call npm rebuild better-sqlite3
if errorlevel 1 (
    echo [WARN] Rebuild had issues, trying full reinstall...
    call npm install --build-from-source
)
echo.

echo Step 3: Starting app with debug info...
echo.
echo =====================================
echo   IF APP CRASHES, check the console above
echo   for error messages
echo =====================================
echo.

call npm start

if errorlevel 1 (
    echo.
    echo =====================================
    echo   APP CRASHED!
    echo   Error code: %errorlevel%
    echo =====================================
    echo.
    echo Possible solutions:
    echo 1. Run: npm install
    echo 2. Run: npm rebuild better-sqlite3
    echo 3. Delete node_modules and run: npm install
    echo.
    pause
)
