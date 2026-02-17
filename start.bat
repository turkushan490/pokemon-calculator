@echo off
title Pokemon Battle Simulator

cls
echo =====================================
echo   Pokemon Battle Simulator
echo   Starting...
echo =====================================
echo.

:: Check for Node.js
echo [*] Checking Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js found
node --version
echo.

:: Update from Git (only if .git exists)
if exist ".git" (
    echo [*] Updating from GitHub...
    git fetch origin
    git pull origin master
    if errorlevel 1 (
        echo [WARN] Could not update (continuing anyway...)
    )
    echo.
)

:: Install dependencies
if not exist "node_modules" (
    echo [*] Installing dependencies (first time)...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
    echo.
)

:: Kill old processes
echo [*] Stopping any running instances...
taskkill /F /IM electron.exe >nul 2>&1
timeout /t 2 >nul
echo.

:: Start app
echo =====================================
echo   Starting App...
echo =====================================
echo.

call npm start

:: If app crashes
if errorlevel 1 (
    echo.
    echo [ERROR] App crashed!
    echo.
    pause
)
