"use client"

import React, { useState } from "react"
import { useNavigate } from "@/lib/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function QuickLogin({ signup = false }: { signup?: boolean }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"teacher" | "student">("teacher")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()
  const { login, signup: authSignup } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (signup) {
        await authSignup(email, password, name)
      } else {
        await login(email, password)
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto p-6 rounded-lg border border-border bg-card">
        <h1 className="text-2xl font-bold mb-6 text-foreground">{signup ? 'Create Account' : 'Sign In'}</h1>
        {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {signup && (
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Name</label>
              <input className="w-full px-3 py-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
            <input type="email" className="w-full px-3 py-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
            <input type="password" className="w-full px-3 py-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-white px-4 py-2 rounded">
            {loading ? 'Loading...' : signup ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
