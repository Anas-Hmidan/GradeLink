# Teacher API Endpoints

All endpoints listed here are used by the teacher interface.

Note: All teacher endpoints that mention `Authorization` require `Bearer <JWT_TOKEN>` header.

---

## 1. Register (Used by both teacher & student)
- Method: POST
- URL: /api/auth/register
- Headers: Content-Type: application/json
- Body:
```json
{
  "email": "teacher@example.com",
  "password": "SecurePass123",
  "full_name": "Some Teacher",
  "role": "teacher"
}
```
- Response: 201 with `token` to use in Authorization.

---

## 2. Login (Used by both teacher & student)
- Method: POST
- URL: /api/auth/login
- Headers: Content-Type: application/json
- Body:
```json
{
  "email": "teacher@example.com",
  "password": "SecurePass123"
}
```
- Response: 200 with `token` to use in Authorization.

---

## 3. Generate Test (Teacher-only)
- Method: POST
- URL: /api/test/generate
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
  - (Do NOT set Content-Type when using FormData; browser/Postman will set it)
- Body (multipart/form-data):
  - file (File): PDF or Word document
  - title (string) — required
  - description (string) — optional
  - subject (string) — required
  - difficulty (string) — one of: "easy", "medium", "hard"
  - total_questions (number) — required
  - duration_minutes (number) — optional
- Example:
```
file=@course.pdf
title=Midterm
subject=Mathematics
difficulty=medium
total_questions=10
```
- Response: 201 with generated `id` and `test_code` for the test.
```json
{
  "success": true,
  "data": {
    "id": "675a1b2c3d4e5f6g7h8i9j0k",
    "test_code": "ABC12XYZ",
    "title": "Midterm",
    "subject": "Mathematics",
    "total_questions": 10,
    "difficulty": "medium",
    "created_at": "2025-11-15T10:30:00.000Z"
  }
}
```

**Important**: Share the `test_code` with your students so they can access the test.

---

## 4. Get teacher's tests (Teacher-only)
- Method: GET
- URL: /api/test/teacher
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body: None
- Response: 200
```json
{
  "success": true,
  "data": {
    "tests": [
      {
        "id": "...",
        "test_code": "ABC12XYZ",
        "title": "...",
        "subject": "...",
        "difficulty": "...",
        "total_questions": 10,
        "created_at": "...",
        "submissions": 5
      }
    ]
  }
}
```

Note: `submissions` shows how many students have submitted answers for that test. The `test_code` can be shared with students.

---

## 5. Get test results (Teacher-only; owner-only check)
- Method: GET
- URL: /api/test/{testId}/results
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body: None
- Response: 200
```json
{
  "success": true,
  "data": {
    "testId": "675a1b2c3d4e5f6g7h8i9j0k",
    "results": [
      {
        "result_id": "675b2c3d4e5f6g7h8i9j0k1l",
        "student_id": "675c3d4e5f6g7h8i9j0k1l2m",
        "student_email": "student1@example.com",
        "student_name": "Alice Johnson",
        "score": 8,
        "total_questions": 10,
        "percentage": 80,
        "time_taken_seconds": 1200,
        "submitted_at": "2025-11-15T10:45:00.000Z",
        "flagged_for_cheating": false,
        "cheating_reasons": []
      },
      {
        "result_id": "675d4e5f6g7h8i9j0k1l2m3n",
        "student_id": "675e5f6g7h8i9j0k1l2m3n4o",
        "student_email": "student2@example.com",
        "student_name": "Bob Smith",
        "score": 5,
        "total_questions": 10,
        "percentage": 50,
        "time_taken_seconds": 800,
        "submitted_at": "2025-11-15T11:00:00.000Z",
        "flagged_for_cheating": true,
        "cheating_reasons": ["Suspiciously fast completion", "Consistent timing pattern"]
      }
    ]
  }
}
```

**What Teachers Can See:**
- ✅ **All students who took the test** (name and email)
- ✅ **Each student's grade** (score and percentage)
- ✅ **Cheating detection** (`flagged_for_cheating` and specific `cheating_reasons`)
- ✅ **Time taken** by each student
- ✅ **Submission timestamps**

Note: Only teachers who own the test can view its results. Results are sorted by submission date (most recent first).

---

That's all the teacher endpoints! Teachers can:
1. Register and login
2. Generate tests from PDF/Word documents (receive shareable test code)
3. View all their created tests with submission counts
4. View detailed results for each test including student performance
