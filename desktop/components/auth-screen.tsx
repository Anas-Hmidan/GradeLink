"use client"

import { useState } from "react"
import { LogIn, UserPlus, BookOpen, AlertCircle } from "lucide-react"
import { AuthService } from "@/lib/auth-service"

interface AuthScreenProps {
  onAuthSuccess: () => void
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === "register") {
        // Validation
        if (!fullName.trim()) {
          setError("Please enter your full name")
          setLoading(false)
          return
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match")
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters")
          setLoading(false)
          return
        }

        const response = await AuthService.register(email, password, fullName)
        
        if (response.success) {
          onAuthSuccess()
        } else {
          setError(response.error?.message || "Registration failed")
        }
      } else {
        // Login
        const response = await AuthService.login(email, password)
        
        if (response.success) {
          onAuthSuccess()
        } else {
          setError(response.error?.message || "Login failed")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Auth error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Exam Monitoring Platform</h1>
          <p className="text-muted-foreground">
            {mode === "login" ? "Sign in to take your exams" : "Create your student account"}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-6">
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-6 bg-muted p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode("login")
                setError(null)
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition ${
                mode === "login"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register")
                setError(null)
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition ${
                mode === "register"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {mode === "register" && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register")
                    setError(null)
                  }}
                  className="text-primary font-semibold hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login")
                    setError(null)
                  }}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>This platform uses face detection to ensure exam integrity.</p>
          <p className="mt-1">Camera access will be required during exams.</p>
        </div>
      </div>
    </div>
  )
}
