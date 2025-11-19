@echo off
echo ============================================================
echo Running Cheating Detection API Tests
echo ============================================================
echo.

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Check if API is running
echo Checking if API is running on http://localhost:5000...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: API does not appear to be running!
    echo Please start the API first using: start_api.bat
    echo.
    pause
    exit /b 1
)

echo API is running!
echo.

REM Run tests
python scripts\test_api.py

pause
