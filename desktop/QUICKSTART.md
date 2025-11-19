# 🚀 Quick Start Guide

## Prerequisites

1. **Node.js Backend** (your main backend on port 3001)
2. **Python Face Detection Backend** (on port 5000)
3. **Desktop App** (this folder)

## Step 1: Configure

The app is already configured with defaults in `.env.local`:
- Main Backend: `http://localhost:3001`
- Face Detection: `http://localhost:5000`

If your backends use different ports, edit `.env.local`.

## Step 2: Start Backends

### Terminal 1 - Main Backend
```bash
cd ..\backend
npm install  # first time only
npm start
```
Should see: Server running on port 3001

### Terminal 2 - Python Face Detection
```bash
cd ..\face-detection-backend
pip install -r requirements.txt  # first time only
python api.py
```
Should see: Running on http://0.0.0.0:5000

## Step 3: Start Desktop App

### Terminal 3 - Desktop App
```bash
npm install  # first time only
npm run electron:dev
```

App will open in Electron window!

## Step 4: Test the Flow

1. **Register** a test student account
   - Email: `student@test.com`
   - Password: `test123`
   - Full Name: `Test Student`

2. **Login** with those credentials

3. **Enter Test Code** provided by teacher (e.g., `ABC12XYZ`)
   - If you don't have one, create a test in your backend first

4. **Start Test** and answer questions
   - Camera will activate automatically
   - Face detection runs in background

5. **Submit Test** when done
   - View results immediately
   - Check history anytime

## Troubleshooting

### "Could not connect to server"
- Check main backend is running on port 3001
- Visit: http://localhost:3001/api/health

### "API Offline" (red indicator in camera)
- Check Python API is running on port 5000
- Visit: http://localhost:5000/health

### "Invalid test code"
- Verify the code is exactly 8 characters
- Check test exists in your backend
- Make sure test is active/available

### Camera not working
- Grant camera permissions when prompted
- Close other apps using camera (Zoom, Teams, etc.)
- Check browser console for errors

## Backend Integration Checklist

Make sure your backend implements:
- ✅ `POST /api/auth/register` - Create student account
- ✅ `POST /api/auth/login` - Authenticate student  
- ✅ `POST /api/test/access` - Access test with code
- ✅ `POST /api/test/:testId/submit` - Submit answers
- ✅ `GET /api/student/results` - Get test history

All protected routes must accept:
```
Authorization: Bearer <JWT_TOKEN>
```

## Quick Test

1. Start all 3 services (main backend, Python API, desktop app)
2. Register account: `student@test.com` / `test123`
3. Create a test in your backend with code `TEST1234`
4. Enter code `TEST1234` in desktop app
5. Take the test with camera monitoring
6. Submit and view results!

## Documentation

- **`BACKEND_INTEGRATION.md`** - Complete integration guide
- **`PYTHON_API_FIX.md`** - Fix screenshots issue
- **`INTEGRATION_COMPLETE.md`** - What was implemented
- **`STUDENT_API.md`** - Backend API specification

## Need Help?

Check the console logs:
- **Browser Console** (F12) - Frontend errors
- **Terminal 1** - Backend API logs
- **Terminal 2** - Python API logs
- **Terminal 3** - Electron/Next.js logs

Happy testing! 🎉
