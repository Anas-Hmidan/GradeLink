import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { getAuthToken, verifyAuth, requireRole } from "@/lib/middleware/auth"
import { successResponse, errorResponse } from "@/lib/utils/response"
import { ObjectId } from "mongodb"

interface StudentAnswer {
  question_id: string
  selected_answer: number
  time_spent_seconds: number
}

function calculateScore(answers: StudentAnswer[], correctAnswers: Map<string, number>): number {
  let correct = 0
  answers.forEach((answer) => {
    if (correctAnswers.get(answer.question_id) === answer.selected_answer) {
      correct++
    }
  })
  return correct
}

function detectCheating(
  answers: StudentAnswer[],
  totalTime: number,
  testDuration: number,
): { flagged: boolean; reasons: string[] } {
  const reasons: string[] = []

  // Check if test completed suspiciously fast
  if (totalTime < testDuration * 60 * 0.1) {
    reasons.push("Test completed unusually fast")
  }

  // Check for pattern anomalies (all answers submitted at once)
  const timeSpent = answers.map((a) => a.time_spent_seconds)
  const avgTime = timeSpent.reduce((a, b) => a + b, 0) / timeSpent.length
  const variance = timeSpent.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / timeSpent.length

  if (variance < 1) {
    reasons.push("Unusually consistent time per question")
  }

  return {
    flagged: reasons.length > 0,
    reasons,
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const token = getAuthToken(request)
    const auth = verifyAuth(token)
    const student = requireRole(auth, "student")

    const { testId } = await params

    if (!ObjectId.isValid(testId)) {
      return NextResponse.json(errorResponse("INVALID_TEST_ID", "Invalid test ID format"), { status: 400 })
    }

    const body = await request.json()
    const { answers, total_time_seconds } = body

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(errorResponse("INVALID_ANSWERS", "Answers must be a non-empty array"), { status: 400 })
    }

    const { db } = await connectToDatabase()

    const test = await db.collection("tests").findOne({ _id: new ObjectId(testId) })
    if (!test) {
      return NextResponse.json(errorResponse("TEST_NOT_FOUND", "Test not found"), { status: 404 })
    }

    // Build correct answers map
    const correctAnswersMap = new Map(test.questions.map((q: any) => [q.id, q.correct_answer]))

    // Calculate score
    const score = calculateScore(answers, correctAnswersMap)
    const percentage = (score / test.total_questions) * 100

    // Detect cheating
    const cheatingDetection = detectCheating(answers, total_time_seconds, test.duration_minutes)

    // Store result
    const result = await db.collection("results").insertOne({
      test_id: new ObjectId(testId),
      student_id: new ObjectId(student.userId),
      answers: answers.map((a: StudentAnswer) => ({
        ...a,
        is_correct: correctAnswersMap.get(a.question_id) === a.selected_answer,
      })),
      score,
      total_questions: test.total_questions,
      percentage,
      time_taken_seconds: total_time_seconds,
      submitted_at: new Date(),
      flagged_for_cheating: cheatingDetection.flagged,
      cheating_reasons: cheatingDetection.reasons,
    })

    return NextResponse.json(
      successResponse({
        result_id: result.insertedId.toString(),
        score,
        total_questions: test.total_questions,
        percentage: percentage.toFixed(2),
        flagged_for_cheating: cheatingDetection.flagged,
      }),
    )
  } catch (error: any) {
    console.error("Test submission error:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Authentication required"), { status: 401 })
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(errorResponse("FORBIDDEN", "Only students can submit tests"), { status: 403 })
    }

    return NextResponse.json(errorResponse("INTERNAL_ERROR", "An error occurred during test submission"), {
      status: 500,
    })
  }
}
