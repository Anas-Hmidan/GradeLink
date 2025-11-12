import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { getAuthToken, verifyAuth, requireAuth } from "@/lib/middleware/auth"
import { successResponse, errorResponse } from "@/lib/utils/response"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const token = getAuthToken(request)
    const auth = verifyAuth(token)
    requireAuth(auth)

    const { testId } = await params

    if (!ObjectId.isValid(testId)) {
      return NextResponse.json(errorResponse("INVALID_TEST_ID", "Invalid test ID format"), { status: 400 })
    }

    const { db } = await connectToDatabase()

    const test = await db.collection("tests").findOne({ _id: new ObjectId(testId) })
    if (!test) {
      return NextResponse.json(errorResponse("TEST_NOT_FOUND", "Test not found"), { status: 404 })
    }

    // Return questions without answers (for students)
    const questionsWithoutAnswers = test.questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      // Do NOT include correct_answer or explanation
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
        questions: questionsWithoutAnswers,
      }),
    )
  } catch (error: any) {
    console.error("Get test error:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Authentication required"), { status: 401 })
    }

    return NextResponse.json(errorResponse("INTERNAL_ERROR", "An error occurred while fetching the test"), {
      status: 500,
    })
  }
}
