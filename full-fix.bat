@echo off
echo =====================================
echo   Full Fix and Start
echo =====================================
echo.

cd /d "%~dp0"

echo Step 1: Kill processes using port 9000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":9000" ^| find "LISTENING" 2^>nul') do (
    echo [*] Killing process %%a using port 9000...
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Port 9000 cleared
echo.

echo Step 2: Kill any Electron/node processes...
taskkill /F /IM electron.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 >nul
echo [OK] Processes killed
echo.

echo Step 3: Clean webpack cache...
if exist ".webpack" rmdir /s /q ".webpack"
echo [OK] Cache cleaned
echo.

echo Step 4: Rebuild native modules...
call npm rebuild better-sqlite3
echo [OK] Native modules rebuilt
echo.

echo Step 5: Starting app...
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
    pause
)
