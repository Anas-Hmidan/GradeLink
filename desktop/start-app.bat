@echo off
echo ========================================
echo  Exam Monitoring System - Startup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [1/3] Starting Python Face Detection API...
echo.

REM Start Python API in new window
start "Python Face Detection API" cmd /k "cd ..\face-detection-backend && python api.py"

echo Waiting for API to start (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo [2/3] Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Desktop Application...
echo.
echo NOTE: This will open the app when Next.js is ready (may take 30-60 seconds)
echo.

REM Start Electron app (wait-on will wait up to 60 seconds for Next.js)
call npm run electron:dev

echo.
echo Application closed.
pause
