@echo off
echo Killing any running node/electron processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM electron.exe /T 2>nul
timeout /t 2 >nul
echo.
echo Starting the app...
npm start
