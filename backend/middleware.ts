import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Allow multiple origins for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_ORIGIN || "",
].filter(Boolean)

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin")
  
  // Determine which origin to allow
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0]

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
      },
    })
  }

  const res = NextResponse.next()
  res.headers.set("Access-Control-Allow-Origin", allowedOrigin)
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS")
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  res.headers.set("Access-Control-Allow-Credentials", "true")
  return res
}

export const config = {
  matcher: "/api/:path*",
}
