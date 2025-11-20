import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/utils/auth"
import { validateRegistration } from "@/lib/utils/validation"
import { successResponse, errorResponse } from "@/lib/utils/response"
import { rateLimit } from "@/lib/middleware/rateLimit"
import { handleCorsPreflightRequest, corsHeaders } from "@/lib/utils/cors"

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request.headers.get("origin"))
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  
  try {
    // Rate limiting: 5 registrations per IP per hour
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (!rateLimit(`register-${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(errorResponse("RATE_LIMITED", "Too many registration attempts. Try again later."), {
        status: 429,
        headers: corsHeaders(origin),
      })
    }

    const body = await request.json()
    const { email, password, full_name, role } = body

    // Validation
    const validationErrors = validateRegistration(email, password, full_name)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Registration validation failed", { errors: validationErrors }),
        { status: 400, headers: corsHeaders(origin) },
      )
    }

    if (!["teacher", "student"].includes(role)) {
      return NextResponse.json(errorResponse("INVALID_ROLE", 'Role must be either "teacher" or "student"'), {
        status: 400,
        headers: corsHeaders(origin),
      })
    }

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(errorResponse("USER_EXISTS", "User with this email already exists"), { status: 409, headers: corsHeaders(origin) })
    }

    // Hash password
    const { hash: hashedPassword, salt } = await hashPassword(password)

    // Create user
    const result = await db.collection("users").insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      salt,
      full_name,
      role,
      created_at: new Date(),
      updated_at: new Date(),
    })

    const token = generateToken(result.insertedId.toString(), role)

    return NextResponse.json(
      successResponse({
        user: {
          id: result.insertedId.toString(),
          email,
          full_name,
          role,
        },
        token,
      }),
      { status: 201, headers: corsHeaders(origin) },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(errorResponse("INTERNAL_ERROR", "An error occurred during registration"), { status: 500, headers: corsHeaders(origin) })
  }
}
