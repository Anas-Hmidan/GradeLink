"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useNavigate } from "@/lib/navigation"
import { useAuth } from "@/hooks/use-auth"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LoadingSpinner from "@/components/loading-spinner"
import { ArrowLeft, Copy, CheckCircle2, FileText, Clock, BookOpen, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Question {
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
}

interface TestDetails {
  id: string
  title: string
  description?: string
  subject: string
  difficulty: string
  total_questions: number
  duration_minutes: number
  questions: Question[]
  created_at: string
}

export default function StrayTestDetailsPage() {
  const params = useParams()
  const testId = params?.id as string
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [test, setTest] = useState<TestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/login")
      return
    }
    if (testId) {
      fetchTestDetails()
    }
  }, [user, authLoading, testId, navigate])

  const fetchTestDetails = async () => {
    try {
      const response = await axios.get(`/api/test/${testId}`)
      setTest(response.data.test)
    } catch (err: any) {
      console.error("Failed to fetch test details:", err)
      setError(err.response?.data?.message || "Failed to load test details")
    } finally {
      setLoading(false)
    }
  }

  const copyTestId = () => {
    if (testId) {
      navigator.clipboard.writeText(testId)
      toast({
        title: "Test ID Copied!",
        description: "Share this ID with students to take the test",
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (authLoading || loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-destructive text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  if (!test) return null

  return null
}
