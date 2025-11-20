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
    const teacher = requireRole(auth, "teacher")

    const { db } = await connectToDatabase()

    // Fetch tests created by this teacher
    const tests = await db
      .collection("tests")
      .find({ teacher_id: new ObjectId(teacher.userId) })
      .project({ title: 1, subject: 1, difficulty: 1, total_questions: 1, test_code: 1, created_at: 1 })
      .sort({ created_at: -1 })
      .toArray()

    // Optionally include the number of submissions for each test
    const resultsCounts = await Promise.all(
      tests.map(async (t: any) => {
        const count = await db.collection("results").countDocuments({ test_id: t._id })
        return { test_id: t._id.toString(), submissions: count }
      }),
    )

    return NextResponse.json(
      successResponse({
        tests: tests.map((t: any) => ({
          id: t._id.toString(),
          test_code: t.test_code,
          title: t.title,
          subject: t.subject,
          difficulty: t.difficulty,
          total_questions: t.total_questions,
          created_at: t.created_at,
          submissions: resultsCounts.find((r) => r.test_id === t._id.toString())?.submissions || 0,
        })),
      }),
    )
  } catch (error: any) {
    console.error("Get teacher tests error:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Authentication required"), { status: 401 })
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(errorResponse("FORBIDDEN", "Only teachers can fetch their tests"), { status: 403 })
    }

    return NextResponse.json(errorResponse("INTERNAL_ERROR", "Failed to fetch teacher tests"), { status: 500 })
  }
}
