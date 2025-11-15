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

## 3. Get test by code (Student access)
- Method: GET
- URL: /api/test/code/{code}
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body: None
- Response: 200
```json
{
  "success": true,
  "data": {
    "id": "...",
    "test_code": "ABC12XYZ",
    "title": "...",
    "description": "...",
    "subject": "...",
    "difficulty": "...",
    "duration_minutes": 60,
    "total_questions": 5,
    "questions": [
      { "id": "q-1", "question": "...", "options": ["A","B","C","D"] }
    ]
  }
}
```

**Note**: Students access tests using the 8-character code shared by their teacher. This endpoint does NOT include `correct_answer` nor explanations.

---

## 4. Get test details by ID (Alternative access)
- Method: GET
- URL: /api/test/{testId}
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body: None
- Response: 200
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "...",
    "subject": "...",
    "difficulty": "...",
    "duration_minutes": 60,
    "total_questions": 5,
    "questions": [
      { "id": "q-1", "question": "...", "options": ["A","B","C","D"] }
    ]
  }
}
```

Note: Student view DOES NOT include `correct_answer` nor explanations.

---

## 5. Submit test answers
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

## 6. Get my test results (Student's history)
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

## Extra: If student needs a list of tests
This repo currently does not provide a public `list all tests` endpoint; tests are retrievable by ID or by teacher. If the frontend needs a `available tests` endpoint for students, we can add `GET /api/test` with optional rules (e.g., list public tests or those assigned to students).
