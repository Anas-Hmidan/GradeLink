# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Create Environment File
```bash
# Copy the example file
copy .env.example .env
```

Edit `.env` and set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong random string (min 32 characters)
- `GEMINI_API_KEY` - Your Gemini API key from https://makersuite.google.com/app/apikey

### Step 3: Run the Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📝 First Test

### 1. Register a Teacher Account
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"teacher@test.com\",
    \"password\": \"Test1234\",
    \"full_name\": \"Test Teacher\",
    \"role\": \"teacher\"
  }"
```

**Response**: You'll get a JWT token. Copy it for next steps.

### 2. Generate a Test from a Document

Prepare a PDF or Word document with course content, then:

```bash
curl -X POST http://localhost:3000/api/test/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@your-course-file.pdf" \
  -F "title=Sample Test" \
  -F "subject=Your Subject" \
  -F "difficulty=medium" \
  -F "total_questions=5" \
  -F "duration_minutes=30"
```

**Response**: You'll get the test ID and details.

### 3. Register a Student Account
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"student@test.com\",
    \"password\": \"Test1234\",
    \"full_name\": \"Test Student\",
    \"role\": \"student\"
  }"
```

### 4. Student Takes the Test
```bash
# Get the test (use student's token)
curl -X GET http://localhost:3000/api/test/TEST_ID \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"

# Submit answers
curl -X POST http://localhost:3000/api/test/TEST_ID/submit \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"answers\": [
      {
        \"question_id\": \"q-1\",
        \"selected_answer\": 0,
        \"time_spent_seconds\": 30
      }
    ],
    \"total_time_seconds\": 300
  }"
```

## 🔧 Troubleshooting

### "Cannot find module" errors
- Run: `npm install --legacy-peer-deps`
- Restart VS Code

### MongoDB connection error
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env`

### Gemini API error
- Verify your API key is correct
- Check you have API quota available
- Ensure billing is enabled (if required)

### File upload fails
- Check file is PDF or DOCX format
- Ensure file is under 10MB
- Verify file contains readable text (not scanned images)

## 📱 Using with a Frontend

Your frontend should:

1. **For login/register**: Send JSON with `Content-Type: application/json`
2. **For test generation**: Send FormData with `Content-Type: multipart/form-data`
3. **Include JWT token** in Authorization header for protected routes

### Example Frontend Code (React)

#### Login
```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  localStorage.setItem('token', data.data.token);
  return data;
};
```

#### Upload Document and Generate Test
```javascript
const generateTest = async (file, testData) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', testData.title);
  formData.append('subject', testData.subject);
  formData.append('difficulty', testData.difficulty);
  formData.append('total_questions', testData.total_questions);
  formData.append('duration_minutes', testData.duration_minutes);
  
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/test/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return await response.json();
};
```

#### Get Test (Student)
```javascript
const getTest = async (testId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/test/${testId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return await response.json();
};
```

#### Submit Test
```javascript
const submitTest = async (testId, answers) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/test/${testId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      answers,
      total_time_seconds: calculateTotalTime(answers),
    }),
  });
  return await response.json();
};
```

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [FIXES_SUMMARY.md](./FIXES_SUMMARY.md) for all changes made
- Set up proper environment variables for production
- Implement frontend integration
- Add monitoring and logging

## 💡 Tips

- Use **Postman** or **Insomnia** for API testing
- Check MongoDB with **MongoDB Compass**
- Monitor Gemini API usage in Google Cloud Console
- Test with different PDF/Word formats
- Start with small documents to test the flow

## 🆘 Need Help?

- Check the [README.md](./README.md) troubleshooting section
- Review error messages in console
- Verify all environment variables are set
- Ensure dependencies are installed
- Check MongoDB is accessible

Happy testing! 🎉
