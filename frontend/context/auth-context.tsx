"use client"

import React, { useState, useEffect, useCallback } from "react"
import axios from "@/lib/axios"
import type { AuthContextType, User } from "@/types/auth"

const initialContext: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
}

export const AuthContext = React.createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFromStorage = useCallback(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    // Try to restore a cached user object saved at login/signup. If missing,
    // we still consider the user authenticated by token, but we don't have
    // profile fields. Restoring the user prevents immediate redirect back to
    // /login after a page reload.
    try {
      const raw = localStorage.getItem("auth_user")
      if (raw) {
        const parsed = JSON.parse(raw)
        setUser(parsed)
      } else {
        // no cached user; leave as null (UI may choose to fetch profile lazily)
        setUser(null)
      }
    } catch (e) {
      console.warn("Failed to parse cached auth_user", e)
      setUser(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    try {
      loadFromStorage()
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }, [loadFromStorage])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const resp = await axios.post("/api/auth/login", { email, password })
      const data = resp.data?.data
      if (!data || !data.token) throw new Error("Invalid login response")
      localStorage.setItem("auth_token", data.token)
      const u: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.full_name || data.user.name || "",
        role: data.user.role || "teacher",
      }
      // persist a lightweight user snapshot so we can restore after reloads
      try {
        localStorage.setItem("auth_user", JSON.stringify(u))
      } catch (e) {
        console.warn("Failed to persist auth_user", e)
      }
      setUser(u)
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || "Login failed"
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setError(null)
    try {
      // Always register as teacher
      const resp = await axios.post("/api/auth/register", { email, password, full_name: name, role: "teacher" })
      const data = resp.data?.data
      if (!data || !data.token) throw new Error("Invalid signup response")
      localStorage.setItem("auth_token", data.token)
      const u: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.full_name || data.user.name || "",
        role: "teacher",
      }
      try {
        localStorage.setItem("auth_user", JSON.stringify(u))
      } catch (e) {
        console.warn("Failed to persist auth_user", e)
      }
      setUser(u)
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || "Signup failed"
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    setUser(null)
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  }

  // debug: log when provider mounts to help trace runtime issues
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[AuthProvider] mounted, providing methods:", {
      hasLogin: typeof login === "function",
      hasSignup: typeof signup === "function",
      hasLogout: typeof logout === "function",
    })
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
