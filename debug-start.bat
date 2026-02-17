@echo off
echo Starting with debug output...
echo.

cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo Running: npm start
echo.

npm start

if errorlevel 1 (
    echo.
    echo ERROR CODE: %errorlevel%
    echo.
    pause
)
