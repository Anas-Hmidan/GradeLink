# Frontend Integration Prompt for Backend Updates

## Context
I have a Next.js backend that generates MCQ tests from PDF/Word documents using Google Gemini AI. The backend has been completely updated with critical fixes. I need to update the frontend to be compatible with these changes.

## Backend Overview

### Architecture
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database**: MongoDB
- **AI**: Google Gemini 1.5 Flash
- **Authentication**: JWT-based with Bearer tokens
- **Roles**: Teacher (creates tests) and Student (takes tests)

## Critical API Changes

### 1. Test Generation Endpoint Changed (BREAKING CHANGE)
**Old**: Accepted JSON with just a subject string
**New**: Requires multipart/form-data with actual PDF/Word document

**Endpoint**: `POST /api/test/generate`

**Request Format**:
```javascript
// Must use FormData, NOT JSON
const formData = new FormData();
formData.append('file', selectedFile); // Required: PDF or DOCX file
formData.append('title', 'Test Title');
formData.append('description', 'Optional description');
formData.append('subject', 'Mathematics');
formData.append('difficulty', 'medium'); // 'easy', 'medium', or 'hard'
formData.append('total_questions', '10'); // String representation of number
formData.append('duration_minutes', '60'); // String representation of number

// Headers
{
  'Authorization': `Bearer ${token}`,
  // Do NOT set Content-Type - let browser set it with boundary
}
```

**File Requirements**:
- **Accepted Types**: PDF (.pdf), Word (.docx, .doc)
- **Max Size**: 10MB
- **Min Content**: 100 characters of extractable text
- **Note**: Scanned PDFs (images) won't work - need actual text

**Response Format**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Test Title",
    "subject": "Mathematics",
    "total_questions": 10,
    "difficulty": "medium",
    "created_at": "2025-11-12T10:30:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "FILE_REQUIRED",
    "message": "Course document (PDF or Word) is required",
    "details": {}
  }
}
```

### 2. Authentication Endpoints (Unchanged but verify)

#### Register
**Endpoint**: `POST /api/auth/register`
**Content-Type**: `application/json`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "role": "teacher"  // or "student"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "teacher"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
**Endpoint**: `POST /api/auth/login`
**Content-Type**: `application/json`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response**: Same as register

### 3. Get Test (Student View)

**Endpoint**: `GET /api/test/{testId}`
**Authorization**: Bearer token (student or teacher)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Midterm Exam",
    "description": "Chapters 1-5",
    "subject": "Mathematics",
    "difficulty": "medium",
    "duration_minutes": 60,
    "total_questions": 20,
    "questions": [
      {
        "id": "q-1",
        "question": "What is 2 + 2?",
        "options": [
          "3",
          "4",
          "5",
          "6"
        ]
        // Note: NO correct_answer or explanation in student view
      }
    ]
  }
}
```

### 4. Submit Test

**Endpoint**: `POST /api/test/{testId}/submit`
**Authorization**: Bearer token (student only)
**Content-Type**: `application/json`

**Request**:
```json
{
  "answers": [
    {
      "question_id": "q-1",
      "selected_answer": 1,  // Index: 0, 1, 2, or 3
      "time_spent_seconds": 45
    },
    {
      "question_id": "q-2",
      "selected_answer": 2,
      "time_spent_seconds": 60
    }
  ],
  "total_time_seconds": 3000
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "result_id": "507f1f77bcf86cd799439012",
    "score": 15,
    "total_questions": 20,
    "percentage": "75.00",
    "flagged_for_cheating": false
  }
}
```

## Error Codes to Handle

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Common Error Codes:
- `UNAUTHORIZED` (401) - No token or invalid token
- `FORBIDDEN` (403) - Wrong role (e.g., student trying to create test)
- `RATE_LIMITED` (429) - Too many requests
- `VALIDATION_ERROR` (400) - Invalid input data
- `FILE_REQUIRED` (400) - Missing file in test generation
- `FILE_TOO_LARGE` (400) - File exceeds 10MB
- `INVALID_FILE_TYPE` (400) - Not PDF or Word
- `INSUFFICIENT_CONTENT` (400) - Document too short or empty
- `DOCUMENT_PROCESSING_ERROR` (400) - Failed to extract text
- `TEST_NOT_FOUND` (404) - Test doesn't exist
- `AI_SERVICE_ERROR` (503) - Gemini API failed
- `INTERNAL_ERROR` (500) - Server error

## Frontend Requirements

### 1. File Upload Component (Teacher Dashboard)
```jsx
// Example component structure needed
<TestGenerationForm>
  <FileUpload 
    accept=".pdf,.doc,.docx"
    maxSize={10485760} // 10MB
    onChange={handleFileSelect}
  />
  <Input name="title" required />
  <Input name="subject" required />
  <Select name="difficulty" options={['easy', 'medium', 'hard']} />
  <NumberInput name="total_questions" min={1} max={100} />
  <NumberInput name="duration_minutes" min={5} max={300} />
  <Button type="submit">Generate Test</Button>
</TestGenerationForm>
```

### 2. Loading States
Test generation can take 5-15 seconds:
- Show upload progress
- Show "Processing document..." message
- Show "Generating questions with AI..." message
- Handle timeout scenarios (> 30 seconds)

### 3. Token Management
```javascript
// Store token after login/register
localStorage.setItem('token', data.data.token);

// Include in all authenticated requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}

// Handle token expiration (7 days)
if (error.code === 'UNAUTHORIZED') {
  // Redirect to login
}
```

### 4. Role-Based Routing
```javascript
// Decode JWT to get role (or store during login)
const user = JSON.parse(atob(token.split('.')[1]));

// Routes:
// Teacher: /dashboard, /create-test, /my-tests
// Student: /available-tests, /take-test/:id, /my-results
```

### 5. Test Taking Interface (Student)
Features needed:
- Display questions one at a time or all at once
- Track time per question (for cheating detection)
- Show countdown timer
- Prevent multiple submissions
- Save answers locally (in case of connection loss)
- Submit on timer expiration

### 6. Form Validation
```javascript
// Client-side validation before API call
- Email format validation
- Password strength check
- File type/size validation
- Required field checks
- Number range validation (questions, duration)
```

## Expected User Flows

### Teacher Flow:
1. Register/Login as teacher
2. Navigate to "Create Test" page
3. Upload PDF/Word document (course material)
4. Fill in test details (title, subject, difficulty, questions, duration)
5. Submit form (multipart/form-data)
6. Wait 5-15 seconds for AI generation
7. View generated test with questions
8. Share test ID with students

### Student Flow:
1. Register/Login as student
2. View available tests (needs implementation)
3. Select a test to take
4. See test details (title, subject, duration, question count)
5. Start test (timer begins)
6. Answer questions (track time per question)
7. Submit answers
8. View results (score, percentage, flagged status)

## API Base URL
```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

## Rate Limits (Don't hammer the API)
- Registration: 5 per hour per IP
- Login: 10 per hour per IP
- Test Generation: 20 per hour per teacher

## Testing Checklist
- [ ] File upload works with PDF
- [ ] File upload works with DOCX
- [ ] File size validation (reject > 10MB)
- [ ] File type validation (reject images, etc.)
- [ ] Registration with both roles
- [ ] Login and token storage
- [ ] Token sent in Authorization header
- [ ] Test generation shows loading state
- [ ] Test generation handles errors gracefully
- [ ] Student can view test without answers
- [ ] Student can submit test
- [ ] Results are displayed correctly
- [ ] Role-based access control works
- [ ] Error messages are user-friendly

## Known Backend Limitations
1. No pagination for tests list (implement if needed)
2. No test editing after generation
3. No question bank or question reuse
4. File is processed in-memory (not saved)
5. Generation can be slow for large documents
6. English content works best with Gemini

## Sample Frontend Code Snippets

### File Upload Handler
```javascript
const handleTestGeneration = async (formData) => {
  const file = formData.get('file');
  
  // Validation
  if (!file || file.size === 0) {
    setError('Please select a file');
    return;
  }
  
  if (file.size > 10485760) {
    setError('File size must not exceed 10MB');
    return;
  }
  
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    setError('Only PDF and Word documents are allowed');
    return;
  }
  
  setLoading(true);
  setStatus('Uploading document...');
  
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/test/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // Don't stringify FormData!
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    setStatus('Test generated successfully!');
    // Navigate to test details or tests list
    router.push(`/tests/${data.data.id}`);
    
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Auth Helper
```javascript
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!data.success) {
    if (data.error.code === 'UNAUTHORIZED') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(data.error.message);
  }
  
  return data.data;
};
```

## Questions to Ask/Verify
1. Should there be a "My Tests" page for teachers to view created tests?
2. Should students see a list of available tests or only access via shared link?
3. Do we need a results history page for students?
4. Should teachers be able to see student results?
5. Do we need test expiration dates?
6. Should tests be shareable via link or require assignment?

## Priority Features to Implement
1. **High Priority**: File upload form with validation
2. **High Priority**: Test generation with loading states
3. **High Priority**: Student test-taking interface with timer
4. **Medium Priority**: Results display page
5. **Medium Priority**: Tests list for teachers
6. **Low Priority**: Analytics dashboard
7. **Low Priority**: Test sharing mechanism

Now please help me build/fix the frontend to work with this backend!
