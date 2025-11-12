# Postman Testing Guide

## Prerequisites
1. Server running: `npm run dev` (should be at http://localhost:3000)
2. MongoDB running and accessible
3. `.env` file configured with valid `GEMINI_API_KEY`
4. Sample PDF or Word document ready for upload

## Step-by-Step Testing

### Step 1: Register a Teacher Account

**Method**: POST  
**URL**: `http://localhost:3000/api/auth/register`  
**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "teacher@test.com",
  "password": "Teacher123",
  "full_name": "Test Teacher",
  "role": "teacher"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "673376a...",
      "email": "teacher@test.com",
      "full_name": "Test Teacher",
      "role": "teacher"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**📝 Copy the token** - you'll need it for the next requests!

---

### Step 2: Login (Optional - if you already have an account)

**Method**: POST  
**URL**: `http://localhost:3000/api/auth/login`  
**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "teacher@test.com",
  "password": "Teacher123"
}
```

---

### Step 3: Generate Test from Document (Main Feature!)

**Method**: POST  
**URL**: `http://localhost:3000/api/test/generate`  

**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
```
⚠️ Replace `YOUR_TOKEN_HERE` with the token from Step 1

**Body** (form-data):

Click on "Body" tab → Select "form-data"

Add these key-value pairs:

| Key | Type | Value |
|-----|------|-------|
| file | File | [Select your PDF or DOCX file] |
| title | Text | `Sample Math Test` |
| description | Text | `Test covering chapters 1-3` |
| subject | Text | `Mathematics` |
| difficulty | Text | `medium` |
| total_questions | Text | `5` |
| duration_minutes | Text | `30` |

**Important Notes**:
- For the `file` field, hover over the "Text" dropdown and change it to "File"
- Click "Select Files" and choose your PDF or Word document
- File must be under 10MB
- File must contain readable text (not scanned images)

**Expected Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "673376b1c2d3e4f5g6h7i8j9",
    "title": "Sample Math Test",
    "subject": "Mathematics",
    "total_questions": 5,
    "difficulty": "medium",
    "created_at": "2025-11-12T10:30:00.000Z"
  }
}
```

**⏱️ This request will take 5-15 seconds** - be patient!

**📝 Copy the test `id`** - you'll need it for the next steps!

---

### Step 4: Register a Student Account

**Method**: POST  
**URL**: `http://localhost:3000/api/auth/register`  
**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "student@test.com",
  "password": "Student123",
  "full_name": "Test Student",
  "role": "student"
}
```

**📝 Copy the student token** from the response!

---

### Step 5: Get Test Details (Student View)

**Method**: GET  
**URL**: `http://localhost:3000/api/test/YOUR_TEST_ID_HERE`  
⚠️ Replace `YOUR_TEST_ID_HERE` with the test ID from Step 3

**Headers**:
```
Authorization: Bearer STUDENT_TOKEN_HERE
```
⚠️ Use the student token from Step 4

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "673376b1c2d3e4f5g6h7i8j9",
    "title": "Sample Math Test",
    "description": "Test covering chapters 1-3",
    "subject": "Mathematics",
    "difficulty": "medium",
    "duration_minutes": 30,
    "total_questions": 5,
    "questions": [
      {
        "id": "q-1",
        "question": "What is the derivative of x²?",
        "options": [
          "2x",
          "x",
          "2",
          "x²"
        ]
      },
      {
        "id": "q-2",
        "question": "...",
        "options": ["...", "...", "...", "..."]
      }
      // ... more questions
    ]
  }
}
```

**Note**: The response does NOT include the correct answers (for security)

---

### Step 6: Submit Test Answers

**Method**: POST  
**URL**: `http://localhost:3000/api/test/YOUR_TEST_ID_HERE/submit`  
⚠️ Replace `YOUR_TEST_ID_HERE` with the test ID

**Headers**:
```
Authorization: Bearer STUDENT_TOKEN_HERE
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "answers": [
    {
      "question_id": "q-1",
      "selected_answer": 0,
      "time_spent_seconds": 45
    },
    {
      "question_id": "q-2",
      "selected_answer": 1,
      "time_spent_seconds": 60
    },
    {
      "question_id": "q-3",
      "selected_answer": 2,
      "time_spent_seconds": 30
    },
    {
      "question_id": "q-4",
      "selected_answer": 1,
      "time_spent_seconds": 50
    },
    {
      "question_id": "q-5",
      "selected_answer": 3,
      "time_spent_seconds": 40
    }
  ],
  "total_time_seconds": 225
}
```

**Notes**:
- `selected_answer` is the index: 0 = first option, 1 = second, 2 = third, 3 = fourth
- You must submit answers for ALL questions
- Use the actual `question_id` values from Step 5

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "result_id": "673376c1d2e3f4g5h6i7j8k9",
    "score": 3,
    "total_questions": 5,
    "percentage": "60.00",
    "flagged_for_cheating": false
  }
}
```

---

## Common Errors and Solutions

### Error: "GEMINI_API_KEY environment variable is not set"
**Solution**: 
1. Create `.env` file in backend root
2. Add: `GEMINI_API_KEY=your-api-key-here`
3. Get key from: https://makersuite.google.com/app/apikey
4. Restart the server

### Error: "File size must not exceed 10MB"
**Solution**: Use a smaller file or increase `MAX_FILE_SIZE` in `.env`

### Error: "Only PDF and Word documents are allowed"
**Solution**: Make sure you're uploading a `.pdf`, `.docx`, or `.doc` file

### Error: "Document content is too short or could not be extracted"
**Solution**: 
- File might be a scanned PDF (images only)
- Use a PDF with actual text content
- Try converting to a newer format

### Error: "UNAUTHORIZED"
**Solution**: 
- Make sure you're including the token in Authorization header
- Format: `Bearer YOUR_TOKEN_HERE` (include "Bearer " prefix)
- Token might be expired (7-day expiration)

### Error: "FORBIDDEN - Only teachers can create tests"
**Solution**: Use the teacher token, not the student token

### Error: "Gemini API error: 400"
**Solution**: 
- Check if your API key is valid
- Ensure you have API access enabled
- Check if billing is enabled (if required)

### Error: "Cannot find module 'pdf-parse'"
**Solution**: 
```bash
npm install pdf-parse mammoth --legacy-peer-deps
```

---

## Testing Tips

### 1. Use Postman Collections
Save all these requests in a Postman Collection for easy reuse.

### 2. Use Environment Variables in Postman
Create a Postman Environment with:
- `base_url`: `http://localhost:3000/api`
- `teacher_token`: (set after login)
- `student_token`: (set after login)
- `test_id`: (set after test creation)

Then use them in requests:
- URL: `{{base_url}}/test/generate`
- Header: `Bearer {{teacher_token}}`

### 3. Quick Test with Sample Data
Create a simple text file saved as PDF with content like:
```
Chapter 1: Introduction to Mathematics

Mathematics is the study of numbers, quantities, and shapes.

Key Concepts:
- Addition and Subtraction
- Multiplication and Division
- Fractions and Decimals
- Basic Algebra

Practice Problems:
1. Solve: 2 + 2 = ?
2. Calculate: 10 × 5 = ?
3. Simplify: 15/3 = ?
```

Save this as a Word document or PDF and use it for testing.

### 4. Check Server Logs
Watch the terminal where you ran `npm run dev` for detailed error messages.

### 5. Test in Order
Always test in this order:
1. Register/Login
2. Generate Test
3. Get Test
4. Submit Answers

---

## Sample PDF for Testing

If you don't have a PDF, you can:

1. **Create a quick Word document** with any educational content
2. **Save as PDF**
3. **Upload in Postman**

Or use this simple example:
1. Open Microsoft Word or Google Docs
2. Paste some educational text (math, science, history, etc.)
3. Save/Export as PDF
4. Use that file in Postman

---

## Postman Collection JSON (Import This!)

Save this as `backend-tests.postman_collection.json` and import into Postman:

```json
{
  "info": {
    "name": "MCQ Backend Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Register Teacher",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"teacher@test.com\",\n  \"password\": \"Teacher123\",\n  \"full_name\": \"Test Teacher\",\n  \"role\": \"teacher\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "register"]
        }
      }
    },
    {
      "name": "2. Login Teacher",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"teacher@test.com\",\n  \"password\": \"Teacher123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "3. Generate Test",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer YOUR_TEACHER_TOKEN"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "path/to/your/file.pdf"
            },
            {
              "key": "title",
              "value": "Sample Test",
              "type": "text"
            },
            {
              "key": "subject",
              "value": "Mathematics",
              "type": "text"
            },
            {
              "key": "difficulty",
              "value": "medium",
              "type": "text"
            },
            {
              "key": "total_questions",
              "value": "5",
              "type": "text"
            },
            {
              "key": "duration_minutes",
              "value": "30",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "http://localhost:3000/api/test/generate",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "test", "generate"]
        }
      }
    }
  ]
}
```

---

## Verification Checklist

- [ ] Server is running on port 3000
- [ ] MongoDB is connected
- [ ] `.env` file has valid GEMINI_API_KEY
- [ ] Can register a teacher account
- [ ] Can login with teacher credentials
- [ ] Can upload PDF/Word file
- [ ] Test generation completes (5-15 seconds)
- [ ] Can register a student account
- [ ] Student can view test (without answers)
- [ ] Student can submit test answers
- [ ] Results are returned correctly

---

## Need Help?

If something isn't working:
1. Check server logs in terminal
2. Verify MongoDB is running
3. Check `.env` file configuration
4. Verify Gemini API key is valid
5. Make sure file is a real PDF/Word document with text

Happy Testing! 🚀
