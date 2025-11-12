import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3001"

export function middleware(req: NextRequest) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        // Allow credentials (cookies / authorization headers) from the frontend
        "Access-Control-Allow-Credentials": "true",
      },
    })
  }

  const res = NextResponse.next()
  res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  // Allow credentials for cross-origin requests (matches axios withCredentials)
  res.headers.set("Access-Control-Allow-Credentials", "true")
  return res
}

export const config = {
  matcher: "/api/:path*",
}
