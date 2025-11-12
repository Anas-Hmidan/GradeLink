"use client"

import { useEffect } from "react"
import { useNavigate } from "@/lib/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    } else {
      navigate("/login")
    }
  }, [user, navigate])

  return null
}
