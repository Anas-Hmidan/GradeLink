# Student API Endpoints

All endpoints listed here are used by the student interface.

Note: Student endpoints require `Authorization` header with `Bearer <JWT_TOKEN>` for protected routes.

---

## 1. Register (student)
- Method: POST
- URL: /api/auth/register
- Headers: Content-Type: application/json
- Body:
```json
{
  "email": "student@example.com",
  "password": "StudentPass123",
  "full_name": "Student Name",
  "role": "student"
}
```
- Response: 201 with `token`.

---

## 2. Login
- Method: POST
- URL: /api/auth/login
- Headers: Content-Type: application/json
- Body:
```json
{
  "email": "student@example.com",
  "password": "StudentPass123"
}
```
- Response: 200 with `token`.

---

## 3. Access test with code (Required to take test)
- Method: POST
- URL: /api/test/access
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
  - Content-Type: application/json
- Body:
```json
{
  "test_code": "ABC12XYZ"
}
```
- Success Response: 200
```json
{
  "success": true,
  "data": {
    "id": "...",
    "test_code": "ABC12XYZ",
    "title": "Midterm Exam",
    "description": "Test covering chapters 1-5",
    "subject": "Mathematics",
    "difficulty": "medium",
    "duration_minutes": 60,
    "total_questions": 5,
    "questions": [
      { "id": "q-1", "question": "What is 2+2?", "options": ["2","3","4","5"] },
      { "id": "q-2", "question": "What is 5*5?", "options": ["20","25","30","35"] }
    ]
  }
}
```
- Error Response (Invalid Code): 403
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CODE",
    "message": "Invalid test code"
  }
}
```

**Important**: Students MUST provide the correct 8-character code to access the test. Without the correct code, access is denied. This is like entering a password to unlock the test.

---

## 4. Submit test answers
- Method: POST
- URL: /api/test/{testId}/submit
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
  - Content-Type: application/json
- Body:
```json
{
  "answers": [
    { "question_id": "q-1", "selected_answer": 1, "time_spent_seconds": 45 },
    { "question_id": "q-2", "selected_answer": 2, "time_spent_seconds": 60 }
  ],
  "total_time_seconds": 225
}
```
- Response: 200
```json
{
  "success": true,
  "data": {
    "result_id": "...",
    "score": 4,
    "total_questions": 5,
    "percentage": "80.00",
    "flagged_for_cheating": false
  }
}
```

---

## 5. Get my test results (Student's history)
- Method: GET
- URL: /api/student/results
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body: None
- Response: 200
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "result_id": "...",
        "test_id": "...",
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

**Note**: This endpoint shows all tests the student has completed, including their scores, the teacher who assigned the test, and when they submitted it.

---

## How Students Access Tests

**Important Flow:**
1. Teacher creates a test and receives an **8-character code** (e.g., `ABC12XYZ`)
2. Teacher shares this code with students (via class announcement, email, etc.)
3. Student wants to take the test → Must **POST the code** to `/api/test/access`
4. If code is correct → Student receives the full test with questions
5. If code is wrong → Access denied with 403 error
6. Student answers questions → Submits via `/api/test/{testId}/submit`

**Think of it like a password:** The test code acts as a password that students must enter correctly to unlock and take the test. Without the correct code, they cannot see or answer any questions.
