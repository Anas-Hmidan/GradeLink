# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```
✅ Backend should be running on http://localhost:3000

---

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
pnpm install
pnpm dev
```
✅ Frontend should be running on http://localhost:3001

---

### Step 3: Create Teacher Account
1. Open browser: http://localhost:3001
2. Click "Sign up"
3. Fill in details:
   - Name: John Teacher
   - Email: teacher@test.com
   - Password: Teacher123
   - Role: **Teacher**
4. Click "Create Account"
5. You'll be redirected to dashboard

---

### Step 4: Create Your First Test
1. Click "Create Test" button
2. Upload a PDF or Word document
   - Example: Upload any course material, textbook chapter, or lecture notes
   - Must be PDF or Word format
   - Must be under 10MB
3. Fill in:
   - **Title**: "Biology Chapter 3 Quiz"
   - **Subject**: "Biology"
   - **Questions**: 10
   - **Difficulty**: Medium
   - **Time Limit**: 60 minutes
4. Click "Generate Test with AI"
5. Wait 5-15 seconds ⏳
6. ✅ Test generated!

---

### Step 5: Test as Student
1. Open incognito window (or different browser)
2. Go to http://localhost:3001
3. Click "Sign up"
4. Fill in details:
   - Name: Jane Student
   - Email: student@test.com
   - Password: Student123
   - Role: **Student**
5. Get the test ID from teacher dashboard
6. Navigate to: http://localhost:3001/test/{TEST_ID}
7. Take the test!
8. Submit and view your score

---

## 📋 Quick Checklist

Before you start, make sure you have:
- [ ] Node.js installed (v18 or higher)
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Backend is running on port 3000
- [ ] Frontend is running on port 3001
- [ ] A PDF or Word document ready for testing

---

## 🎯 Test File Recommendations

Good test files:
- ✅ Textbook chapters (PDF)
- ✅ Lecture notes (Word/PDF)
- ✅ Study guides
- ✅ Research papers
- ✅ Any document with clear text

Bad test files:
- ❌ Scanned images (no extractable text)
- ❌ Files over 10MB
- ❌ Empty documents
- ❌ Image files (JPG, PNG)
- ❌ Documents with less than 100 characters

---

## 🐛 Common Issues

### Backend won't start:
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process or use different port
```

### Frontend won't start:
```bash
# Clear node modules and reinstall
rm -rf node_modules
pnpm install
```

### "File upload failed":
- Check file size (must be < 10MB)
- Check file type (only PDF, DOC, DOCX)
- Check backend console for errors

### "Token expired":
- Clear browser localStorage
- Login again

---

## 🎨 What You Should See

### Teacher Dashboard:
```
┌─────────────────────────────────────┐
│  TeachAI         [+ Create New Test]│
├─────────────────────────────────────┤
│                                     │
│   Your Tests                        │
│   ├─ Biology Quiz                   │
│   ├─ Math Test                      │
│   └─ History Exam                   │
│                                     │
└─────────────────────────────────────┘
```

### Create Test Page:
```
┌─────────────────────────────────────┐
│  Create New Test                    │
├─────────────────────────────────────┤
│                                     │
│  📄 Drop document here              │
│     or click to browse              │
│                                     │
│  Title: [________________]          │
│  Subject: [_____________]           │
│  Questions: [10]  Difficulty: [▼]  │
│  Time: [60] minutes                 │
│                                     │
│  [Generate Test with AI]            │
└─────────────────────────────────────┘
```

### Student Test View:
```
┌─────────────────────────────────────┐
│  Biology Quiz        ⏰ 59:42       │
├─────────────────────────────────────┤
│  Question 1 of 10                   │
│                                     │
│  What is photosynthesis?            │
│                                     │
│  ○ A. Process of...                 │
│  ● B. Process of...  ← Selected     │
│  ○ C. Process of...                 │
│  ○ D. Process of...                 │
│                                     │
│  [Previous]        [Next Question]  │
│                                     │
│  Navigator: [1][2][3][4][5]...      │
└─────────────────────────────────────┘
```

---

## 💪 You're Ready!

Everything is set up and ready to go. Start creating AI-powered tests now!

**Need help?** Check these files:
- Detailed docs: `INTEGRATION_COMPLETE.md`
- Fix issues: `MIGRATION_GUIDE.md`
- Full summary: `FRONTEND_UPDATES_SUMMARY.md`
