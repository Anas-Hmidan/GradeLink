@echo off
echo ============================================================
echo Cheating Detection API - Quick Start
echo ============================================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo [1/4] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Error: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created!
    echo.
) else (
    echo [1/4] Virtual environment already exists
    echo.
)

REM Activate virtual environment
echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Error: Failed to activate virtual environment
    pause
    exit /b 1
)
echo.

REM Install dependencies
echo [3/4] Installing dependencies...
pip install -r requirements.txt -q
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed!
echo.

REM Start API
echo [4/4] Starting Cheating Detection API...
echo.
echo ============================================================
echo API will start on http://localhost:5000
echo Press Ctrl+C to stop the server
echo ============================================================
echo.
python api.py

pause
