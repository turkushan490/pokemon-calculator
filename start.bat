@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Colors
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

cls
echo %BLUE%====================================%RESET%
echo %BLUE%  Pokemon Battle Simulator%RESET%
echo %BLUE%  Launcher v1.0%RESET%
echo %BLUE%====================================%RESET%
echo.

:: Check if git is installed
echo %YELLOW%[*] Checking for Git...%RESET%
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[!] Git is not installed or not in PATH%RESET%
    echo %RED%[!] Please install Git from https://git-scm.com/download/win%RESET%
    pause
    exit /b 1
)
echo %GREEN%[✓] Git found%RESET%
echo.

:: Check if node is installed
echo %YELLOW%[*] Checking for Node.js...%RESET%
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[!] Node.js is not installed or not in PATH%RESET%
    echo %RED%[!] Please install Node.js from https://nodejs.org/%RESET%
    pause
    exit /b 1
)
echo %GREEN%[✓] Node.js found%RESET%
node --version
echo.

:: Update from GitHub
echo %YELLOW%[*] Checking for updates from GitHub...%RESET%
echo.

:: Check if we're in a git repo
if exist ".git" (
    echo %BLUE%[*] Pulling latest changes...%RESET%
    git fetch origin
    git reset --hard origin/master
    git pull origin master
    if %errorlevel% equ 0 (
        echo %GREEN%[✓] Repository updated%RESET%
    ) else (
        echo %YELLOW%[!] Could not update (might be offline)%RESET%
    )
) else (
    echo %YELLOW%[!] Not a git repository, skipping update%RESET%
)
echo.

:: Install dependencies
echo %YELLOW%[*] Installing dependencies...%RESET%
if not exist "node_modules" (
    echo %BLUE%[*] First run - installing all packages...%RESET%
    call npm install
    if %errorlevel% neq 0 (
        echo %RED%[!] Failed to install dependencies%RESET%
        pause
        exit /b 1
    )
    echo %GREEN%[✓] Dependencies installed%RESET%
) else (
    echo %GREEN%[✓] Dependencies already installed%RESET%
)
echo.

:: Download sprites if needed
echo %YELLOW%[*] Checking sprites...%RESET%
if not exist "public\sprites" (
    echo %BLUE%[*] Sprites not found, downloading...%RESET%
    if exist "scripts\download-sprites.js" (
        call npm run download-sprites
        if %errorlevel% equ 0 (
            echo %GREEN%[✓] Sprites downloaded%RESET%
        ) else (
            echo %YELLOW%[!] Sprite download failed, will use GitHub CDN fallback%RESET%
        )
    ) else (
        echo %YELLOW%[!] Download script not found, sprites will be loaded from GitHub CDN%RESET%
    )
) else (
    echo %GREEN%[✓] Sprites folder exists%RESET%
)
echo.

:: Kill any existing Electron processes
echo %YELLOW%[*] Stopping any running instances...%RESET%
taskkill /F /IM electron.exe /T >nul 2>&1
timeout /t 2 >nul
echo.

:: Start the app
echo %GREEN%====================================%RESET%
echo %GREEN%  Starting Pokemon Battle Simulator...%RESET%
echo %GREEN%====================================%RESET%
echo.
echo %BLUE%[*] To stop the app, close the window or press Ctrl+C%RESET%
echo.

call npm start

:: If app crashes, show error
if %errorlevel% neq 0 (
    echo.
    echo %RED%[!] App exited with error code %errorlevel%%RESET%
    echo.
    pause
)
