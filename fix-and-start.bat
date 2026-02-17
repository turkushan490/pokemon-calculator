@echo off
echo =====================================
echo   Fix and Start
echo =====================================
echo.

echo Step 1: Rebuild native modules...
call npm rebuild better-sqlite3
echo.

echo Step 2: Starting app...
echo.
call npm start

pause
