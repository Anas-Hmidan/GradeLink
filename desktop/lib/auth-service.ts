// Authentication Service
// Handles login, register, and token management

import { API_CONFIG, getApiUrl } from "./api-config"

export interface AuthResponse {
  success: boolean
  token?: string
  error?: {
    code: string
    message: string
  }
}

export interface User {
  email: string
  full_name: string
  role: string
}

const TOKEN_KEY = "exam_auth_token"
const USER_KEY = "exam_user_data"

export class AuthService {
  // Register a new student
  static async register(
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResponse> {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.REGISTER)
      console.log("🔵 Registering at:", url)
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role: "student",
        }),
      })

      console.log("🔵 Response status:", response.status, response.statusText)
      console.log("🔵 Response headers:", Object.fromEntries(response.headers.entries()))
      
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("❌ Expected JSON but got:", contentType, text.substring(0, 200))
        return {
          success: false,
          error: {
            code: "INVALID_RESPONSE",
            message: "Server returned invalid response. Check backend URL and CORS settings.",
          },
        }
      }

      const data = await response.json()
      console.log("🔵 Response data:", data)

      // Handle both response formats:
      // Format 1: { token: "..." }
      // Format 2: { success: true, data: { token: "...", user: {...} } }
      const token = data.token || data.data?.token
      const userData = data.user || data.data?.user

      if (response.ok && token) {
        // Store token and user data
        this.setToken(token)
        
        if (userData) {
          this.setUser({
            email: userData.email || email,
            full_name: userData.full_name || fullName,
            role: userData.role || "student"
          })
        } else {
          this.setUser({ email, full_name: fullName, role: "student" })
        }
        
        return { success: true, token }
      }

      return {
        success: false,
        error: data.error || { code: "REGISTER_FAILED", message: "Registration failed" },
      }
    } catch (error) {
      console.error("❌ Register error:", error)
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Could not connect to server. Please check your connection.",
        },
      }
    }
  }

  // Login existing user
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      // Handle both response formats:
      // Format 1: { token: "...", user: {...} }
      // Format 2: { success: true, data: { token: "...", user: {...} } }
      const token = data.token || data.data?.token
      const userData = data.user || data.data?.user

      if (response.ok && token) {
        // Store token
        this.setToken(token)
        
        // Store user data if available
        if (userData) {
          this.setUser({
            email: userData.email || email,
            full_name: userData.full_name || email.split("@")[0],
            role: userData.role || "student"
          })
        } else {
          this.setUser({ email, full_name: email.split("@")[0], role: "student" })
        }
        
        return { success: true, token }
      }

      return {
        success: false,
        error: data.error || { code: "LOGIN_FAILED", message: "Invalid credentials" },
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Could not connect to server. Please check your connection.",
        },
      }
    }
  }

  // Get stored token
  static getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
  }

  // Store token
  static setToken(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(TOKEN_KEY, token)
  }

  // Get stored user
  static getUser(): User | null {
    if (typeof window === "undefined") return null
    const userData = localStorage.getItem(USER_KEY)
    if (!userData) return null
    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  }

  // Store user data
  static setUser(user: User): void {
    if (typeof window === "undefined") return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // Logout
  static logout(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  // Get authorization header
  static getAuthHeader(): Record<string, string> {
    const token = this.getToken()
    if (!token) return {}
    return {
      Authorization: `Bearer ${token}`,
    }
  }
}
