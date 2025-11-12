"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "@/lib/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LoginFormProps {
  isSignup?: boolean
}

export default function LoginForm({ isSignup = false }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isSignup) {
        await signup(email, password, name)
      } else {
        await login(email, password)
      }
      navigate("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg border border-border bg-card">
      <h1 className="text-2xl font-bold mb-2 text-foreground">
        {isSignup ? "Create Teacher Account" : "Teacher Sign In"}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {isSignup ? "Join the platform to create AI-powered tests" : "Sign in to manage your tests"}
      </p>

      {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Full Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
          />
          {isSignup && (
            <p className="text-xs text-muted-foreground mt-1">
              Min 8 characters, include uppercase, lowercase, and number
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => navigate(isSignup ? "/login" : "/signup")}
          className="text-primary hover:underline font-medium"
        >
          {isSignup ? "Sign in" : "Sign up"}
        </button>
      </p>
    </div>
  )
}
