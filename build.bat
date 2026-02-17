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
echo %BLUE%  Build EXE%RESET%
echo %BLUE%====================================%RESET%
echo.

:: Check if node is installed
echo %YELLOW%[*] Checking for Node.js...%RESET%
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[!] Node.js is not installed%RESET%
    pause
    exit /b 1
)
echo %GREEN%[✓] Node.js found%RESET%
echo.

:: Check dependencies
echo %YELLOW%[*] Checking dependencies...%RESET%
if not exist "node_modules" (
    echo %RED%[!] Dependencies not installed. Run start.bat first%RESET%
    pause
    exit /b 1
)
echo %GREEN%[✓] Dependencies installed%RESET%
echo.

:: Clean previous builds
echo %YELLOW%[*] Cleaning previous builds...%RESET%
if exist "out" (
    rmdir /s /q "out"
    echo %GREEN%[✓] Cleaned out folder%RESET%
)
echo.

:: Package the app
echo %YELLOW%[*] Packaging app (this may take a few minutes)...%RESET%
echo.
call npm run package
if %errorlevel% neq 0 (
    echo %RED%[!] Build failed%RESET%
    pause
    exit /b 1
)
echo.

:: Create installer
echo %GREEN%====================================%RESET%
echo %GREEN%[✓] Build Complete!%RESET%
echo %GREEN%====================================%RESET%
echo.
echo %BLUE%[*] The executable can be found in:%RESET%
echo %BLUE%    out\poke-calculator-win32-x64\%RESET%
echo.
echo %YELLOW%[*] To create an installer, run:%RESET%
echo %YELLOW%    npm run make%RESET%
echo.

:: Ask if user wants to create installer
set /p create_installer="Do you want to create an installer? (y/n): "
if /i "%create_installer%"=="y" (
    echo.
    echo %YELLOW%[*] Creating installer...%RESET%
    call npm run make
    if %errorlevel% equ 0 (
        echo %GREEN%[✓] Installer created!%RESET%
        echo %BLUE%[*] Look in the 'out' folder for .exe installer%RESET%
    ) else (
        echo %RED%[!] Failed to create installer%RESET%
    )
)

echo.
pause
