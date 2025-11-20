import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/utils/auth"
import { successResponse, errorResponse } from "@/lib/utils/response"
import { rateLimit } from "@/lib/middleware/rateLimit"
import { handleCorsPreflightRequest, corsHeaders } from "@/lib/utils/cors"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request.headers.get("origin"))
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  
  try {
    // Rate limiting: 10 login attempts per IP per hour
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (!rateLimit(`login-${ip}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json(errorResponse("RATE_LIMITED", "Too many login attempts. Try again later."), {
        status: 429,
        headers: corsHeaders(origin),
      })
    }

    let body: any
    try {
      body = await request.json()
    } catch (parseErr) {
      // Return a helpful error when the incoming body is not valid JSON.
      try {
        const raw = await request.text()
        console.error("Invalid JSON body for /api/auth/login:", raw)
      } catch (e) {
        console.error("Invalid JSON and failed to read raw body")
      }

      return NextResponse.json(
        errorResponse("INVALID_JSON", "Invalid JSON body"),
        { status: 400, headers: corsHeaders(origin) },
      )
    }

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(errorResponse("MISSING_FIELDS", "Email and password are required"), { status: 400, headers: corsHeaders(origin) })
    }

    const { db } = await connectToDatabase()

    // Find user
    const user = await db.collection("users").findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(errorResponse("INVALID_CREDENTIALS", "Invalid email or password"), { status: 401, headers: corsHeaders(origin) })
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.password, user.salt)
    if (!passwordMatch) {
      return NextResponse.json(errorResponse("INVALID_CREDENTIALS", "Invalid email or password"), { status: 401, headers: corsHeaders(origin) })
    }

    const token = generateToken(user._id.toString(), user.role)

    return NextResponse.json(
      successResponse({
        user: {
          id: user._id.toString(),
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
        token,
      }),
      {
        headers: corsHeaders(origin),
      }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(errorResponse("INTERNAL_ERROR", "An error occurred during login"), { 
      status: 500,
      headers: corsHeaders(origin),
    })
  }
}
