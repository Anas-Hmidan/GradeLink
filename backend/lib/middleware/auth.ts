import { verifyToken } from "@/lib/utils/auth"
import type { NextRequest } from "next/server"

export interface AuthPayload {
  userId: string
  role: "teacher" | "student"
}

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}

export function verifyAuth(token: string | null): AuthPayload | null {
  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  return {
    userId: decoded.userId,
    role: decoded.role as "teacher" | "student",
  }
}

export function requireAuth(auth: AuthPayload | null): AuthPayload {
  if (!auth) {
    throw new Error("UNAUTHORIZED")
  }
  return auth
}

export function requireRole(auth: AuthPayload | null, requiredRole: "teacher" | "student") {
  const verified = requireAuth(auth)
  if (verified.role !== requiredRole) {
    throw new Error("FORBIDDEN")
  }
  return verified
}
