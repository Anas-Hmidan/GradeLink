# ✅ Frontend Integration Checklist

## Pre-Flight Check

Before running the application, verify these items:

### Backend Status
- [ ] Backend server is installed
- [ ] Backend dependencies are installed (`npm install`)
- [ ] Backend is running on port 3000
- [ ] Backend MongoDB is connected
- [ ] Backend Google Gemini API key is configured

### Frontend Status
- [ ] Frontend dependencies are installed (`pnpm install`)
- [ ] `.env.local` exists with correct API URL
- [ ] No TypeScript errors (`pnpm run lint`)

---

## Testing Checklist

### 1. Authentication Testing

#### Teacher Registration
- [ ] Navigate to http://localhost:3001
- [ ] Click "Sign up"
- [ ] Fill in form:
  - [ ] Name field works
  - [ ] Email field works
  - [ ] Password field works (min 8 chars)
  - [ ] Role selector shows "Teacher" and "Student"
  - [ ] Select "Teacher"
- [ ] Click "Create Account"
- [ ] Should redirect to /dashboard
- [ ] Should see "Teacher" role in header
- [ ] Should see "Create Test" button

#### Student Registration
- [ ] Open incognito/private window
- [ ] Navigate to http://localhost:3001
- [ ] Click "Sign up"
- [ ] Select "Student" role
- [ ] Complete registration
- [ ] Should redirect to /dashboard
- [ ] Should see "Student" role in header
- [ ] Should NOT see "Create Test" button

#### Login
- [ ] Logout from current session
- [ ] Click "Sign in"
- [ ] Enter credentials
- [ ] Should redirect to dashboard
- [ ] User info should persist on page refresh

---

### 2. File Upload Testing

#### Valid Files
- [ ] Navigate to /create-test
- [ ] Drag-and-drop a PDF file (< 10MB)
  - [ ] Drop zone highlights on drag
  - [ ] File name shows after drop
  - [ ] File size displays correctly
- [ ] Remove file with X button
- [ ] Click to browse and select Word file
  - [ ] File selector opens
  - [ ] Word file (.docx) is accepted
  - [ ] File displays in upload area

#### Invalid Files
- [ ] Try uploading image file (JPG/PNG)
  - [ ] Should show error
- [ ] Try uploading file > 10MB
  - [ ] Should show error
- [ ] Try uploading without file
  - [ ] "Generate" button should be disabled

---

### 3. Test Generation Testing

#### Successful Generation
- [ ] Upload valid PDF/Word document
- [ ] Fill in all fields:
  - [ ] Title: "Test Title"
  - [ ] Subject: "Test Subject"
  - [ ] Description: (optional)
  - [ ] Questions: 10
  - [ ] Difficulty: Medium
  - [ ] Time Limit: 60 minutes
- [ ] Click "Generate Test with AI"
- [ ] Should see loading states:
  - [ ] "Uploading: X%"
  - [ ] "Processing document..."
  - [ ] "Generating questions with AI..."
- [ ] Wait 5-15 seconds
- [ ] Should redirect to test details page
- [ ] Test ID should be visible in URL

#### Error Handling
- [ ] Try with empty document
  - [ ] Should show "Insufficient content" error
- [ ] Try with scanned PDF (image)
  - [ ] Should show "Document processing error"
- [ ] Simulate network error
  - [ ] Should show user-friendly error message

---

### 4. Student Test Taking

#### Accessing Test
- [ ] Login as student
- [ ] Navigate to /test/{TEST_ID}
- [ ] Test should load
- [ ] Should see:
  - [ ] Test title
  - [ ] Subject and difficulty
  - [ ] Timer (counting down)
  - [ ] Question 1
  - [ ] 4 answer options

#### Taking Test
- [ ] Select an answer
  - [ ] Option should highlight
- [ ] Click "Next Question"
  - [ ] Should move to question 2
  - [ ] Previous answer should be saved
- [ ] Click "Previous"
  - [ ] Should return to question 1
  - [ ] Answer should still be selected
- [ ] Use question navigator
  - [ ] Click on question 5
  - [ ] Should jump to question 5
  - [ ] Answered questions show green
  - [ ] Unanswered questions show gray

#### Timer
- [ ] Timer should count down
- [ ] Timer turns orange at 10 minutes
- [ ] Timer turns red at 5 minutes
- [ ] Auto-submit when timer reaches 0

#### Submission
- [ ] Answer all questions
- [ ] Click "Submit Test"
- [ ] Should see confirmation
- [ ] Should show results:
  - [ ] Score (X out of Y)
  - [ ] Percentage
  - [ ] Pass/fail indicator
  - [ ] Cheating flag (if applicable)

---

### 5. Navigation Testing

#### Header Navigation
- [ ] Click "TeachAI" logo
  - [ ] Should go to dashboard
- [ ] Click "Dashboard"
  - [ ] Should go to dashboard
- [ ] Click "Create Test" (teacher only)
  - [ ] Should go to create test page
- [ ] Click "Results"
  - [ ] Should go to results page
- [ ] Click "Logout"
  - [ ] Should logout
  - [ ] Should redirect to login
  - [ ] Should clear localStorage

#### Direct URL Access
- [ ] Try accessing /create-test without login
  - [ ] Should redirect to /login
- [ ] Try accessing /test/{id} without login
  - [ ] Should redirect to /login
- [ ] Login and refresh page
  - [ ] Should stay logged in
  - [ ] Should stay on same page

---

### 6. Role-Based Access Testing

#### Teacher Only Features
- [ ] Login as student
- [ ] Dashboard should NOT show "Create Test" button
- [ ] Try accessing /create-test directly
  - [ ] Should show error or redirect

#### Student Only Features
- [ ] Login as teacher
- [ ] Try taking a test at /test/{id}
  - [ ] Should work (teachers can also take tests)

---

### 7. Error Handling Testing

#### Network Errors
- [ ] Stop backend server
- [ ] Try to login
  - [ ] Should show connection error
- [ ] Try to generate test
  - [ ] Should show connection error
- [ ] Try to take test
  - [ ] Should show connection error

#### Invalid Data
- [ ] Try login with wrong password
  - [ ] Should show "Invalid credentials" error
- [ ] Try login with non-existent email
  - [ ] Should show error
- [ ] Try accessing non-existent test
  - [ ] Should show "Test not found" error

#### Token Expiration
- [ ] Manually delete token from localStorage
- [ ] Try to access protected page
  - [ ] Should redirect to login
- [ ] Make API request after token expires
  - [ ] Should redirect to login

---

### 8. UI/UX Testing

#### Responsiveness
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] All elements should be visible
- [ ] Navigation should work on all sizes

#### Dark Mode
- [ ] UI should respect system dark mode preference
- [ ] Colors should be readable in dark mode
- [ ] Buttons should be visible in dark mode

#### Loading States
- [ ] All buttons show loading state when processing
- [ ] Loading spinners appear when fetching data
- [ ] Buttons are disabled during loading
- [ ] No double-submission possible

---

## Performance Checklist

- [ ] Page loads in < 2 seconds
- [ ] File upload shows progress
- [ ] No console errors
- [ ] No console warnings (except known issues)
- [ ] Images load properly
- [ ] Icons render correctly

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Known Issues to Expect

These are limitations, not bugs:

1. **Tests list might be empty** - Backend `/api/tests` endpoint may not be implemented
2. **Results page might not work** - Backend endpoint may not be implemented
3. **No test editing** - Feature not implemented yet
4. **No test sharing UI** - Must manually share test ID
5. **No pagination** - Will show all tests at once

---

## Success Criteria

✅ All of these should work:
- User can register (both roles)
- User can login
- Token persists across refresh
- Teacher can upload files
- Teacher can generate tests
- Student can take tests
- Student can see results
- Proper error messages show
- Loading states are visible
- Navigation works
- Logout works

---

## If Something Doesn't Work

1. **Check browser console** for JavaScript errors
2. **Check Network tab** in DevTools for API errors
3. **Check backend logs** for server errors
4. **Verify token** exists in localStorage
5. **Clear cache** and try again
6. **Restart servers** (backend and frontend)
7. **Check environment variables** are correct

---

## Need Help?

Refer to these files:
- **Setup**: `QUICK_START.md`
- **Troubleshooting**: `MIGRATION_GUIDE.md`
- **Technical Details**: `INTEGRATION_COMPLETE.md`
- **Overview**: `README.md`

---

## Final Verification

Once all tests pass:
- [ ] Take a screenshot of working teacher flow
- [ ] Take a screenshot of working student flow
- [ ] Document any issues encountered
- [ ] Note any missing backend endpoints
- [ ] Test is ready for production!

---

**Good luck with testing! 🚀**
