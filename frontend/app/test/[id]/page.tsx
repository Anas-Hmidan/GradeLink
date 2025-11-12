"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useNavigate } from "@/lib/navigation"
import axios, { isAxiosError } from "@/lib/axios"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/loading-spinner"
import { Clock, CheckCircle } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  // Note: correct_answer and explanation are NOT included for students
}

interface Test {
  id: string
  title: string
  description: string
  subject: string
  difficulty: string
  duration_minutes: number
  total_questions: number
  questions: Question[]
}

interface Answer {
  question_id: string
  selected_answer: number
  time_spent_seconds: number
}

export default function TakeTestPage() {
  const params = useParams()
  const testId = params?.id as string
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, number>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [testStartTime, setTestStartTime] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Fetch test data
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/login")
      return
    }

    const fetchTest = async () => {
      try {
        const response = await axios.get(`/api/test/${testId}`)
        
        if (response.data.success) {
          const testData = response.data.data
          setTest(testData)
          setTimeRemaining(testData.duration_minutes * 60)
          setTestStartTime(Date.now())
          
          // Initialize start time for first question
          const startTimes: Record<string, number> = {}
          testData.questions.forEach((q: Question) => {
            startTimes[q.id] = 0
          })
          startTimes[testData.questions[0].id] = Date.now()
          setQuestionStartTimes(startTimes)
        } else {
          setError("Failed to load test")
        }
      } catch (err: any) {
        console.error("Error fetching test:", err)
        if (isAxiosError(err)) {
          const errorMsg = err.response?.data?.error?.message || "Failed to load test"
          setError(errorMsg)
        } else {
          setError("Failed to load test")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testId, authLoading, user, navigate])

  // Timer countdown
  useEffect(() => {
    if (!test || submitted || submitting) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [test, submitted, submitting])

  // Handle question change - track time spent
  const changeQuestion = (newIndex: number) => {
    if (!test) return

    const currentQ = test.questions[currentQuestion]
    const currentTime = questionStartTimes[currentQ.id] || 0
    
    setCurrentQuestion(newIndex)
    
    // Start timer for new question if not started yet
    const newQ = test.questions[newIndex]
    if (!questionStartTimes[newQ.id]) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [newQ.id]: Date.now()
      }))
    }
  }

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const handleSubmit = async () => {
    if (!test || submitting) return

    setSubmitting(true)
    
    try {
      const totalTimeSeconds = Math.floor((Date.now() - testStartTime) / 1000)
      
      // Calculate time spent per question
      const answersWithTime: Answer[] = test.questions.map(q => {
        const startTime = questionStartTimes[q.id] || 0
        const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
        
        return {
          question_id: q.id,
          selected_answer: answers[q.id] ?? -1, // -1 for unanswered
          time_spent_seconds: timeSpent
        }
      })

      const response = await axios.post(`/api/test/${testId}/submit`, {
        answers: answersWithTime,
        total_time_seconds: totalTimeSeconds
      })

      if (response.data.success) {
        setResult(response.data.data)
        setSubmitted(true)
      } else {
        throw new Error(response.data.error?.message || "Failed to submit test")
      }
    } catch (err: any) {
      console.error("Submit error:", err)
      if (isAxiosError(err)) {
        const errorMsg = err.response?.data?.error?.message || "Failed to submit test"
        alert(errorMsg)
      } else {
        alert("Failed to submit test. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (authLoading || loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-foreground">Test Submitted Successfully!</h1>
          
          <div className="my-6 p-4 bg-muted rounded-lg">
            <div className="text-4xl font-bold text-primary mb-2">
              {result.percentage}%
            </div>
            <p className="text-muted-foreground">
              {result.score} out of {result.total_questions} correct
            </p>
          </div>

          {result.flagged_for_cheating && (
            <div className="mb-4 p-3 bg-yellow-500/10 text-yellow-600 rounded border border-yellow-500/20 text-sm">
              ⚠️ Your submission has been flagged for review
            </div>
          )}

          <Button onClick={() => navigate("/dashboard")} className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!test) return null

  const question = test.questions[currentQuestion]
  const timeColor =
    timeRemaining < 300 ? "text-destructive" : timeRemaining < 600 ? "text-orange-400" : "text-foreground"
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-xl font-bold text-foreground">{test.title}</h1>
              <p className="text-sm text-muted-foreground">
                {test.subject} • {test.difficulty}
              </p>
            </div>
            <div className={`flex items-center gap-2 text-2xl font-mono font-bold ${timeColor}`}>
              <Clock className="w-6 h-6" />
              {formatTime(timeRemaining)}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {test.total_questions}</span>
            <span>•</span>
            <span>{answeredCount} answered</span>
          </div>
        </div>

        {/* Question */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="mb-2 text-sm text-muted-foreground">
            Question {currentQuestion + 1}
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(question.id, idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  answers[question.id] === idx
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background hover:border-primary/50 text-foreground"
                }`}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + idx)}.</span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => changeQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion === test.questions.length - 1 ? (
            <Button 
              onClick={handleSubmit} 
              disabled={submitting} 
              className="flex-1"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </Button>
          ) : (
            <Button 
              onClick={() => changeQuestion(currentQuestion + 1)} 
              className="flex-1"
            >
              Next Question
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-3">Question Navigator</p>
          <div className="grid grid-cols-10 gap-2">
            {test.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => changeQuestion(idx)}
                className={`w-10 h-10 rounded text-sm font-medium transition ${
                  idx === currentQuestion
                    ? "bg-primary text-white"
                    : answers[q.id] !== undefined
                      ? "bg-green-500/20 text-green-400 border border-green-500"
                      : "bg-muted text-muted-foreground hover:bg-border"
                }`}
                title={answers[q.id] !== undefined ? "Answered" : "Not answered"}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Warning about unanswered questions */}
        {currentQuestion === test.questions.length - 1 && answeredCount < test.total_questions && (
          <div className="mt-4 p-4 bg-yellow-500/10 text-yellow-600 rounded-lg border border-yellow-500/20">
            <p className="text-sm">
              ⚠️ You have {test.total_questions - answeredCount} unanswered question(s). 
              Make sure to answer all questions before submitting.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
