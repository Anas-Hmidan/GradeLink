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

    return NextResponse.json(
      errorResponse(
        "DEPRECATED_ENDPOINT",
        "This endpoint is deprecated. Please use POST /api/test/access with the test code in the request body instead.",
      ),
      { status: 410 },
    )
  } catch (error: any) {
    console.error("Get test by code error:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Authentication required"), { status: 401 })
    }

    return NextResponse.json(errorResponse("INTERNAL_ERROR", "An error occurred while fetching the test"), {
      status: 500,
    })
  }
}
