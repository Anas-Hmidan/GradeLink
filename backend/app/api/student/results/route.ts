import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
import { getAuthToken, verifyAuth, requireRole } from "@/lib/middleware/auth"
import { successResponse, errorResponse } from "@/lib/utils/response"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    const auth = verifyAuth(token)
    const student = requireRole(auth, "student")

    const { db } = await connectToDatabase()

    // Fetch all results for this student
    const results = await db
      .collection("results")
      .find({ student_id: new ObjectId(student.userId) })
      .sort({ submitted_at: -1 })
      .toArray()

    // Get test details and teacher info for each result
    const enrichedResults = await Promise.all(
      results.map(async (result: any) => {
        const test = await db.collection("tests").findOne({ _id: result.test_id })
        
        if (!test) {
          return null
        }

        // Get teacher info
        const teacher = await db.collection("users").findOne({ _id: test.teacher_id })

        return {
          result_id: result._id.toString(),
          test_id: result.test_id.toString(),
          test_title: test.title,
          test_subject: test.subject,
          test_difficulty: test.difficulty,
          test_code: test.test_code,
          teacher_name: teacher?.full_name || "Unknown",
          teacher_email: teacher?.email || "Unknown",
          score: result.score,
          total_questions: result.total_questions,
          percentage: result.percentage,
          time_taken_seconds: result.time_taken_seconds,
          submitted_at: result.submitted_at,
          flagged_for_cheating: result.flagged_for_cheating,
          cheating_reasons: result.cheating_reasons || [],
        }
      }),
    )

    // Filter out null results (in case tests were deleted)
    const validResults = enrichedResults.filter((r) => r !== null)

    return NextResponse.json(
      successResponse({
        results: validResults,
        total_tests_taken: validResults.length,
      }),
    )
  } catch (error: any) {
    console.error("Get student results error:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Authentication required"), { status: 401 })
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(errorResponse("FORBIDDEN", "Only students can access this endpoint"), { status: 403 })
    }

    return NextResponse.json(errorResponse("INTERNAL_ERROR", "Failed to fetch student results"), { status: 500 })
  }
}
