import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
import { getAuthToken, verifyAuth, requireRole } from "@/lib/middleware/auth"
import { successResponse, errorResponse } from "@/lib/utils/response"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const token = getAuthToken(request)
    const auth = verifyAuth(token)
    const teacher = requireRole(auth, "teacher")

    const { testId } = await params
    if (!ObjectId.isValid(testId)) {
      return NextResponse.json(errorResponse("INVALID_TEST_ID", "Invalid test ID format"), { status: 400 })
    }

    const { db } = await connectToDatabase()

    const test = await db.collection("tests").findOne({ _id: new ObjectId(testId) })
    if (!test) {
      return NextResponse.json(errorResponse("TEST_NOT_FOUND", "Test not found"), { status: 404 })
    }

    // Check ownership
    if (test.teacher_id.toString() !== teacher.userId) {
      return NextResponse.json(errorResponse("FORBIDDEN", "You don't have access to this test"), { status: 403 })
    }

    // Fetch results for the test
    const results = await db
      .collection("results")
      .find({ test_id: new ObjectId(testId) })
      .sort({ submitted_at: -1 })
      .toArray()

    // Enrich results with student info
    const studentIds = results.map((r: any) => r.student_id)
    const students = await db
      .collection("users")
      .find({ _id: { $in: studentIds } })
      .project({ email: 1, full_name: 1 })
      .toArray()

    const studentMap = new Map(students.map((s: any) => [s._id.toString(), s]))

    const formatted = results.map((r: any) => ({
      result_id: r._id.toString(),
      student_id: r.student_id.toString(),
      student_email: studentMap.get(r.student_id.toString())?.email || null,
      student_name: studentMap.get(r.student_id.toString())?.full_name || "Unknown",
      score: r.score,
      total_questions: r.total_questions,
      percentage: r.percentage,
      time_taken_seconds: r.time_taken_seconds,
      submitted_at: r.submitted_at,
      flagged_for_cheating: r.flagged_for_cheating,
      cheating_reasons: r.cheating_reasons,
    }))

    return NextResponse.json(successResponse({ testId, results: formatted }))
  } catch (error: any) {
    console.error("Get test results error:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Authentication required"), { status: 401 })
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(errorResponse("FORBIDDEN", "Only teachers can view test results"), { status: 403 })
    }

    return NextResponse.json(errorResponse("INTERNAL_ERROR", "Failed to fetch test results"), { status: 500 })
  }
}
