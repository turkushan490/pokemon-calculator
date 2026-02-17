@echo off
chcp 65001 >nul

cls
echo ====================================
echo   Restarting Pokemon Battle Simulator
echo ====================================
echo.

echo [*] Killing any running instances...
taskkill /F /IM electron.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 >nul

echo [*] Clearing webpack cache...
if exist ".webpack" (
    rmdir /s /q ".webpack"
    echo [✓] Cache cleared
)

echo.
echo [*] Starting the app...
echo.

call npm start
