import { NextResponse } from "next/server"

export function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-Token, X-Requested-With, Accept-Version",
    "Access-Control-Allow-Credentials": "true",
  }
}

export function handleCorsPreflightRequest(origin?: string | null) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  })
}

export function addCorsHeaders(response: NextResponse, origin?: string | null) {
  const headers = corsHeaders(origin)
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
