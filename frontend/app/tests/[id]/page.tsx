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
  test_code: string
  title: string
  description?: string
  subject: string
  difficulty: string
  total_questions: number
  duration_minutes: number
  questions: Question[]
  created_at: string
}

export default function TestDetailsPage() {
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
      setTest(response.data.data || response.data.test)
    } catch (err: any) {
      console.error("Failed to fetch test details:", err)
      setError(err.response?.data?.error?.message || "Failed to load test details")
    } finally {
      setLoading(false)
    }
  }

  const copyTestCode = () => {
    if (test?.test_code) {
      navigator.clipboard.writeText(test.test_code)
      toast({
        title: "Test Code Copied!",
        description: "Share this code with students to take the test",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button 
            onClick={() => navigate("/dashboard")} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{test.title}</h1>
              {test.description && (
                <p className="text-muted-foreground text-lg mb-4">{test.description}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="text-base py-1">
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  {test.subject}
                </Badge>
                <Badge variant="outline" className={`text-base py-1 ${getDifficultyColor(test.difficulty)}`}>
                  {test.difficulty}
                </Badge>
                <Badge variant="outline" className="text-base py-1">
                  <FileText className="w-4 h-4 mr-1.5" />
                  {test.total_questions} Questions
                </Badge>
                <Badge variant="outline" className="text-base py-1">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {test.duration_minutes} Minutes
                </Badge>
              </div>
            </div>
            <Button onClick={copyTestCode} size="lg" className="shrink-0">
              <Copy className="w-4 h-4 mr-2" />
              Copy Test Code
            </Button>
          </div>
        </div>
      </div>

      {/* Questions with Answers */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Teacher View - Complete Answer Key</h3>
              <p className="text-sm text-muted-foreground">
                This page shows all questions with their correct answers. Share the Test Code ({test.test_code}) with students to let them take the test using their desktop app.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {test.questions.map((question, index) => (
            <Card key={index} className="p-6 border-l-4 border-l-primary">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold shrink-0">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-foreground flex-1 pt-1.5">
                  {question.question}
                </h3>
              </div>

              <div className="space-y-3 ml-14">
                {question.options.map((option, optIndex) => {
                  const isCorrect = optIndex === question.correct_answer
                  return (
                    <div
                      key={optIndex}
                      className={`p-4 rounded-lg border-2 transition ${
                        isCorrect
                          ? "bg-green-500/10 border-green-500/50 text-green-400"
                          : "bg-muted/30 border-border text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        <span className="flex-1">{option}</span>
                        {isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {question.explanation && (
                <div className="mt-4 ml-14 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-semibold text-sm">💡 Explanation:</span>
                    <p className="text-sm text-blue-300 flex-1">{question.explanation}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-card border border-border rounded-lg text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Test Code for Students</h3>
          <div className="flex items-center justify-center gap-3">
            <code className="px-4 py-2 bg-muted rounded text-lg font-mono text-foreground">
              {test.test_code}
            </code>
            <Button onClick={copyTestCode} variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Students will enter this code in their desktop application
          </p>
        </div>
      </main>
    </div>
  )
}
