import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { getAuthToken, verifyAuth } from "@/lib/middleware/auth"
import { successResponse, errorResponse } from "@/lib/utils/response"

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    // Get auth token and verify
    const token = getAuthToken(req)
    if (!token) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Authentication required"), { status: 401 })
    }

    const auth = verifyAuth(token)
    if (!auth) {
      return NextResponse.json(errorResponse("INVALID_TOKEN", "Invalid authentication token"), { status: 401 })
    }

    // Students can only access tests
    if (auth.role !== "student") {
      return NextResponse.json(errorResponse("FORBIDDEN", "Only students can access tests by code"), { status: 403 })
    }

    const { code } = await params
    const testCode = code.toUpperCase()

    const { db } = await connectToDatabase()

    // Find test by code
    const test = await db.collection("tests").findOne({ test_code: testCode })

    if (!test) {
      return NextResponse.json(errorResponse("TEST_NOT_FOUND", "No test found with this code"), { status: 404 })
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
        questions: sanitizedQuestions,
        test_code: test.test_code,
      }),
    )
  } catch (error: any) {
    console.error("Get test by code error:", error)

    if (error.message === "UNAUTHORIZED" || error.message === "INVALID_TOKEN") {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Authentication required"), { status: 401 })
    }

    return NextResponse.json(errorResponse("INTERNAL_ERROR", "An error occurred while retrieving the test"), {
      status: 500,
    })
  }
}
