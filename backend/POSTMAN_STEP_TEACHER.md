# Teacher: Fetch Tests and View Results

This guide shows how teachers can fetch their own tests and view student results for a specific test.

## 1) Get tests created by the logged-in teacher

- Method: GET
- URL: http://localhost:3000/api/test/teacher
- Headers:
  - Authorization: Bearer <TEACHER_TOKEN>

Example Postman steps:
1. Register or login as a teacher (see previous steps). Copy the token.
2. Create a request `GET http://localhost:3000/api/test/teacher`.
3. Add header: `Authorization: Bearer <TEACHER_TOKEN>`.
4. Send request.

Expected response (200):
```
{
  "success": true,
  "data": {
    "tests": [
      {
        "id": "6914ec9edaafbefeb9f86171",
        "title": "Android",
        "subject": "Mobile Dev",
        "difficulty": "medium",
        "total_questions": 5,
        "created_at": "2025-11-12T10:30:00.000Z",
        "submissions": 3
      }
    ]
  }
}
```

Notes:
- `submissions` is the number of students who submitted the test so far.

## 2) Get results for a specific test

- Method: GET
- URL: http://localhost:3000/api/test/<TEST_ID>/results
- Headers:
  - Authorization: Bearer <TEACHER_TOKEN>

Example Postman steps:
1. Use the token from Step 1.
2. Replace `<TEST_ID>` with the `id` value returned from `GET /api/test/teacher`.
3. Send request.

Expected response (200):
```
{
  "success": true,
  "data": {
    "testId": "6914ec9edaafbefeb9f86171",
    "results": [
      {
        "result_id": "673376c1d2e3f4g5h6i7j8k9",
        "student_id": "60e2b...",
        "student_email": "student1@test.com",
        "student_name": "Test Student",
        "score": 4,
        "total_questions": 5,
        "percentage": 80,
        "time_taken_seconds": 1200,
        "submitted_at": "2025-11-12T12:12:00.000Z",
        "flagged_for_cheating": false,
        "cheating_reasons": []
      }
    ]
  }
}
```

Notes:
- Teachers must be the owner of the test to view its results (access check).
- If there are no results, `results` array will be empty.

## Troubleshooting
- If you get `FORBIDDEN`, confirm the request token belongs to the teacher that created the test.
- If `TEST_NOT_FOUND`, verify the test id is correct.
- If `UNAUTHORIZED`, the token is missing or invalid. Make sure token returned from login/registration is present in the Authorization header.
