@echo off
echo This is a test batch file
echo Current directory: %CD%
echo.

echo Checking Node...
where node
if errorlevel 1 (
    echo Node NOT found
    pause
    exit
) else (
    echo Node found
)

echo.
echo Checking npm...
where npm
if errorlevel 1 (
    echo npm NOT found
    pause
    exit
) else (
    echo npm found
)

echo.
echo All checks passed! Press any key to start npm...
pause

npm start
