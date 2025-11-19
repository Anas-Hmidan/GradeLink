import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { getAuthToken, verifyAuth, requireRole } from "@/lib/middleware/auth"
import { successResponse, errorResponse } from "@/lib/utils/response"

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    const auth = verifyAuth(token)
    const student = requireRole(auth, "student")

    const body = await request.json()
    const { test_code } = body

    if (!test_code || typeof test_code !== "string") {
      return NextResponse.json(errorResponse("MISSING_CODE", "Test code is required"), { status: 400 })
    }

    const testCode = test_code.toUpperCase().trim()

    if (testCode.length !== 8) {
      return NextResponse.json(errorResponse("INVALID_CODE", "Test code must be 8 characters"), { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find test by code
    const test = await db.collection("tests").findOne({ test_code: testCode })

    if (!test) {
      return NextResponse.json(errorResponse("INVALID_CODE", "Invalid test code"), { status: 403 })
    }

    // Remove correct answers and explanations from questions for students
    const sanitizedQuestions = test.questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }))

    return NextResponse.json(
      successResponse({
        id: test._id.toString(),
        title: test.title,
        description: test.description,
        subject: test.subject,
        difficulty: test.difficulty,
        duration_minutes: test.duration_minutes,
        total_questions: test.total_questions,
        test_code: testCode,
        questions: sanitizedQuestions,
      }),
    )
  } catch (error: any) {
    console.error("Test access error:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Authentication required"), { status: 401 })
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(errorResponse("FORBIDDEN", "Only students can access tests with code"), { status: 403 })
    }

    return NextResponse.json(errorResponse("INTERNAL_ERROR", "Failed to access test"), { status: 500 })
  }
}
