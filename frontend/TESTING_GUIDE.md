# Quick Testing Guide - Teacher API Integration

## 🚀 Quick Start

### 1. Start Backend & Frontend
```bash
# Terminal 1 - Backend (port 3000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 3001)
cd frontend
npm run dev
```

### 2. Test Complete Flow

#### Step 1: Register Teacher
- Navigate to: `http://localhost:3001/login`
- Click "Create Teacher Account"
- Fill in:
  - Name: "Test Teacher"
  - Email: "teacher@test.com"
  - Password: "password123"
- Submit → Should auto-login and redirect to dashboard

#### Step 2: Create Test
- Click "Create New Test" button
- Upload a PDF file (any educational PDF < 10MB)
- Fill form:
  - Title: "Math Midterm"
  - Subject: "Mathematics"
  - Difficulty: "medium"
  - Questions: 5
  - Duration: 30 minutes
- Click "Generate Test"
- Wait 5-15 seconds for AI processing
- Should redirect to test details page

#### Step 3: Verify Test Details
- ✅ Test title and subject displayed
- ✅ All 5 questions visible
- ✅ Correct answers highlighted in GREEN
- ✅ Test CODE shown (e.g., "ABC12XYZ") - **NOT** MongoDB ID
- ✅ "Copy Test Code" button present
- Click copy → Should show toast notification

#### Step 4: Check Dashboard
- Navigate back to dashboard
- ✅ Test card visible with:
  - Title: "Math Midterm"
  - Subject badge
  - Difficulty badge (yellow for medium)
  - "5 questions"
  - "30 min"
  - "0 submissions" badge

#### Step 5: Test Results (If Students Submitted)
- Navigate to "Results" (if visible in menu)
- Select test from dropdown
- Should show empty results OR student submissions if any exist
- Test with Postman:
  - Use Student API to submit test answers
  - Refresh results page
  - Should see student name, score, percentage, time taken
  - Cheating flags if applicable

---

## 🔍 API Endpoint Verification

### Using Browser DevTools

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Perform actions and verify:

#### Login Action
- **Request**: POST `http://localhost:3000/api/auth/login`
- **Payload**: `{ email, password }`
- **Response**: `{ success: true, data: { token, user } }`
- **Status**: 200

#### Dashboard Load
- **Request**: GET `http://localhost:3000/api/test/teacher`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true, data: { tests: [...] } }`
- **Status**: 200
- **Verify**: Each test has `test_code` and `submissions` fields

#### Test Creation
- **Request**: POST `http://localhost:3000/api/test/generate`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Payload**: FormData with file + metadata
- **Response**: `{ success: true, data: { id, test_code, ... } }`
- **Status**: 201

#### Test Details
- **Request**: GET `http://localhost:3000/api/test/{testId}`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Test object with `questions` array
- **Status**: 200
- **Verify**: Questions have `correct_answer` field (teacher view)

#### Results
- **Request**: GET `http://localhost:3000/api/test/{testId}/results`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true, data: { results: [...] } }`
- **Status**: 200
- **Verify**: Results have `flagged_for_cheating` and `cheating_reasons`

---

## ✅ Expected Behavior

### Test Code Display
- ❌ **WRONG**: "67a8b9c0d1e2f3g4h5i6j7k8" (MongoDB ID)
- ✅ **CORRECT**: "ABC12XYZ" (8-character code)

### Submission Count
- Shows on test cards: "0 submissions", "5 submissions", etc.
- Updates after students submit via desktop app

### Field Names in API
- ✅ Backend sends: `student_name`, `total_questions`, `submitted_at`
- ✅ Frontend expects: `student_name`, `total_questions`, `submitted_at`
- ❌ Old format: `studentName`, `totalQuestions`, `completedAt`

### Authorization
- All protected endpoints should have header: `Authorization: Bearer <token>`
- If 401 error → User redirected to login
- Token stored in localStorage under key "auth_token"

---

## 🐛 Common Issues & Solutions

### Issue: Dashboard shows empty
**Symptom**: No tests displayed even after creating one
**Check**:
- DevTools Network tab → GET `/api/test/teacher`
- Response should have `data.tests` array
- If 404 → Backend endpoint not implemented
- If empty array → No tests created yet

**Solution**: Create a test first, refresh dashboard

### Issue: Test code not showing
**Symptom**: Shows long MongoDB ID instead of 8-character code
**Check**:
- Test details page showing `testId` variable
- Should show `test.test_code` instead

**Solution**: Already fixed - verify test object has `test_code` field

### Issue: Results page error
**Symptom**: "Failed to fetch results"
**Check**:
- Network tab → GET `/api/test/{id}/results`
- If 403 → Not test owner
- If 404 → No results endpoint

**Solution**: Ensure backend has results endpoint, user owns the test

### Issue: Copy button not working
**Symptom**: No toast notification
**Check**:
- Browser console for errors
- Clipboard API permissions

**Solution**: Use HTTPS or localhost (clipboard works on both)

### Issue: Cheating reasons not showing
**Symptom**: Only shows "Flagged" without details
**Check**:
- API response has `cheating_reasons` array
- ResultsTable component displays reasons

**Solution**: Already fixed - verify backend provides reasons array

---

## 📊 Data Validation

### Test Object Should Have:
```json
{
  "id": "67a8...",
  "test_code": "ABC12XYZ",  ← 8 characters
  "title": "Math Midterm",
  "subject": "Mathematics",
  "difficulty": "medium",
  "total_questions": 5,
  "duration_minutes": 30,  ← optional
  "created_at": "2025-11-15T...",
  "submissions": 0  ← number
}
```

### Result Object Should Have:
```json
{
  "result_id": "67b9...",
  "student_id": "67c0...",
  "student_name": "John Doe",  ← snake_case
  "student_email": "john@test.com",  ← snake_case
  "score": 4,
  "total_questions": 5,  ← snake_case
  "percentage": 80,
  "time_taken_seconds": 900,  ← snake_case
  "submitted_at": "2025-11-15T...",  ← snake_case
  "flagged_for_cheating": false,  ← snake_case
  "cheating_reasons": []  ← snake_case
}
```

---

## 🎯 Success Criteria

All checkboxes should be ✅:

**Authentication**
- [ ] Can register new teacher
- [ ] Can login with credentials
- [ ] Token persists after refresh
- [ ] Auto-redirects to login if token expired

**Test Creation**
- [ ] Can upload PDF/Word file
- [ ] AI generates questions (5-15 seconds)
- [ ] Redirects to test details
- [ ] Test code generated (8 characters)

**Dashboard**
- [ ] Shows all teacher's tests
- [ ] Displays submission count
- [ ] Click test → Navigate to details
- [ ] Empty state shown if no tests

**Test Details**
- [ ] Questions visible with answers
- [ ] Correct answers highlighted green
- [ ] Test code displayed (not ID)
- [ ] Copy button works
- [ ] Toast notification on copy

**Results** (if students submitted)
- [ ] Can view results per test
- [ ] Student names and emails shown
- [ ] Scores and percentages correct
- [ ] Cheating flags visible
- [ ] Cheating reasons displayed
- [ ] Can export to CSV

**Error Handling**
- [ ] Network errors show message
- [ ] 401 → Redirect to login
- [ ] 404 → "Not found" message
- [ ] Form validation errors shown

---

## 🔄 Integration Points

### Frontend → Backend Calls

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Generate Test**: `POST /api/test/generate` (multipart)
4. **Get Teacher Tests**: `GET /api/test/teacher`
5. **Get Test Details**: `GET /api/test/{id}`
6. **Get Results**: `GET /api/test/{id}/results`

All working ✅

### Backend → Frontend Response

- All responses follow format: `{ success: true/false, data: {...}, error: {...} }`
- Frontend extracts: `response.data.data` or `response.data.test`
- Error messages: `err.response?.data?.error?.message`

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check Network tab in DevTools
3. Verify backend is running on port 3000
4. Verify frontend is running on port 3001
5. Check `TEACHER_API.md` for endpoint details
6. Review `API_INTEGRATION_COMPLETE.md` for implementation details

---

**Ready to Test!** 🚀

Follow the steps above and verify all checkboxes are ✅
