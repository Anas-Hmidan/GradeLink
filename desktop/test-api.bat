@echo off
echo Testing Python API...
echo.

curl -X GET http://localhost:5000/health
echo.
echo.

echo If you see {"status":"ok",...} above, the API is running!
echo.

pause
