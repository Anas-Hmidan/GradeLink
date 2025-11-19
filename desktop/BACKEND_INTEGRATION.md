# Backend Integration - Complete Setup Guide

## 🎉 What's New

Your exam monitoring desktop app now integrates with **two backends**:

1. **Main Backend** (Node.js) - Authentication, tests, submissions, results
2. **Python Backend** - Face detection and monitoring

## 📋 Features Implemented

### ✅ Authentication System
- **Login** - Students can sign in with email/password
- **Register** - New students can create accounts
- **Token Management** - JWT tokens stored in localStorage
- **Auto-logout** - Session management

### ✅ Test Access with Codes
- Students enter **8-character test codes** (e.g., `ABC12XYZ`)
- Validates code against backend
- Shows test preview before starting
- Displays: title, subject, difficulty, duration, question count

### ✅ Exam Taking
- Real-time face detection monitoring (Python API)
- Answer tracking with time spent per question
- Suspicious activity logging with timestamps
- Submit to backend API

### ✅ Results & History
- View test results after submission
- Complete test history with all past exams
- Shows: scores, percentages, time taken, flagged tests
- Teacher information for each test

## 🚀 Quick Start

### 1. Configure Backend URLs

Create a `.env.local` file in the `desktop` folder:

```env
# Main Backend (Node.js)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Python Face Detection Backend
NEXT_PUBLIC_FACE_DETECTION_URL=http://localhost:5000
```

**Default values (if not set):**
- Main Backend: `http://localhost:3001`
- Face Detection: `http://localhost:5000`

### 2. Start Both Backends

**Terminal 1 - Main Backend:**
```bash
cd ..\backend
npm install
npm start
# Should run on http://localhost:3001
```

**Terminal 2 - Python Face Detection:**
```bash
cd ..\face-detection-backend
pip install -r requirements.txt
python api.py
# Should run on http://localhost:5000
```

### 3. Start Desktop App

**Terminal 3:**
```bash
cd desktop
npm install
npm run electron:dev
```

## 📖 User Flow

### 1. Authentication
- App starts with **Login/Register** screen
- Students create account or sign in
- JWT token stored in browser

### 2. Test Selection
- Enter **8-character test code** provided by teacher
- View test preview (title, subject, duration, questions)
- Click "Start Test" to begin

### 3. Taking Exam
- Face detection monitors continuously (Python API)
- Answer multiple-choice questions
- Navigate between questions
- Suspicious activities logged automatically
- Submit when complete

### 4. Results
- View immediate results after submission
- Score, percentage, time taken displayed
- Flagged tests shown with warning
- Return to home to take more tests

### 5. History
- View all completed tests
- See scores, dates, teacher info
- Check flagged tests and reasons

## 🔧 API Integration Details

### Main Backend Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Create student account |
| `/api/auth/login` | POST | Sign in student |
| `/api/test/access` | POST | Access test with code |
| `/api/test/:testId/submit` | POST | Submit test answers |
| `/api/student/results` | GET | Get test history |

### Python Backend Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check API status |
| `/analyze-frame` | POST | Analyze video frame for face detection |

## 📁 New Files Created

### Services
- `lib/api-config.ts` - API URLs and endpoints configuration
- `lib/auth-service.ts` - Authentication logic (login, register, token)
- `lib/test-service.ts` - Test operations (access, submit, results)

### Components
- `components/auth-screen.tsx` - Login/Register UI
- `components/test-history.tsx` - Test history viewer

### Updated Files
- `app/page.tsx` - Main app flow with auth
- `components/test-selection.tsx` - Code entry instead of JSON list
- `components/exam-interface.tsx` - Backend submission
- `components/question-panel.tsx` - Submitting state
- `components/camera-monitor.tsx` - No "Analyzing..." indicator

## 🎯 Backend API Requirements

Your backend must implement these endpoints according to `STUDENT_API.md`:

### Register Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test Access Response
```json
{
  "success": true,
  "data": {
    "id": "test-123",
    "test_code": "ABC12XYZ",
    "title": "Midterm Exam",
    "description": "Test covering chapters 1-5",
    "subject": "Mathematics",
    "difficulty": "medium",
    "duration_minutes": 60,
    "total_questions": 5,
    "questions": [
      {
        "id": "q-1",
        "question": "What is 2+2?",
        "options": ["2", "3", "4", "5"]
      }
    ]
  }
}
```

### Submit Test Response
```json
{
  "success": true,
  "data": {
    "result_id": "result-456",
    "score": 4,
    "total_questions": 5,
    "percentage": "80.00",
    "flagged_for_cheating": false
  }
}
```

### Student Results Response
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "result_id": "result-456",
        "test_id": "test-123",
        "test_title": "Midterm Exam",
        "test_subject": "Mathematics",
        "test_difficulty": "medium",
        "test_code": "ABC12XYZ",
        "teacher_name": "Dr. John Smith",
        "teacher_email": "teacher@example.com",
        "score": 8,
        "total_questions": 10,
        "percentage": 80,
        "time_taken_seconds": 1200,
        "submitted_at": "2025-11-15T10:45:00.000Z",
        "flagged_for_cheating": false,
        "cheating_reasons": []
      }
    ],
    "total_tests_taken": 5
  }
}
```

## 🔐 Authentication Headers

All protected endpoints receive:
```
Authorization: Bearer <JWT_TOKEN>
```

The app automatically includes this header for all backend requests.

## 🐛 Troubleshooting

### "API Offline" Error
- **Check Main Backend:** Visit `http://localhost:3001/api/health` (or your backend URL)
- **Check Python API:** Visit `http://localhost:5000/health`
- Ensure both backends are running

### "Invalid test code" Error
- Verify the 8-character code is correct
- Check that the test exists in backend
- Ensure test is active/available

### Login/Register Fails
- Check backend is running on correct port
- Verify API endpoint paths match backend
- Check browser console for error details

### Face Detection Not Working
- Python backend must be running
- Camera permissions must be granted
- Check `PYTHON_API_FIX.md` for screenshot fix

### Token Expired
- Student will need to log out and log in again
- Implement token refresh in backend if needed

## 📊 Data Flow

```
1. Student Registration/Login
   Desktop App → POST /api/auth/register or /login
   ← JWT Token stored in localStorage

2. Access Test
   Desktop App → POST /api/test/access {test_code}
   ← Test data with questions

3. Take Exam
   Desktop App ← Video frames → Python API /analyze-frame
   ← Face detection results
   (Suspicious activity logged locally)

4. Submit Test
   Desktop App → POST /api/test/:testId/submit
   {answers, total_time_seconds}
   ← Result with score, percentage, flagged status

5. View History
   Desktop App → GET /api/student/results
   ← Array of all past test results
```

## 🎨 UI States

### Before Authentication
- Login/Register screen
- No access to tests

### After Authentication
- Test code entry
- Test preview
- Exam interface with camera
- Results screen
- History viewer

## 🔄 Session Management

- Token stored in `localStorage`
- Persists across app restarts
- Logout clears token and reloads app
- Protected routes check authentication

## 📝 Environment Variables

Create `.env.local`:

```env
# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_FACE_DETECTION_URL=http://localhost:5000

# For production, use your production URLs
# NEXT_PUBLIC_BACKEND_URL=https://api.yourschool.com
# NEXT_PUBLIC_FACE_DETECTION_URL=https://face-api.yourschool.com
```

## ✨ Summary

Your desktop app is now a **full-stack exam platform**:
- ✅ User authentication
- ✅ Test code access
- ✅ Real-time face monitoring
- ✅ Backend submission
- ✅ Results history
- ✅ Dual backend architecture

Students can register, access tests with codes, take monitored exams, and view their complete history!
