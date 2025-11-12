"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "@/lib/navigation"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"

interface Question {
  id: string
  text: string
  options: string[]
}

interface StudentTestFormProps {
  testData: {
    id: string
    title: string
    timeLimit: number
    questions: Question[]
  }
  studentInfo: {
    name: string
    email: string
  }
  shareLink: string
}

export default function StudentTestForm({ testData, studentInfo, shareLink }: StudentTestFormProps) {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeRemaining, setTimeRemaining] = useState(testData.timeLimit * 60)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
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
  }, [])

  const handleAnswer = (qIdx: number, answerIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [testData.questions[qIdx].id]: answerIdx,
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await axios.post(`/api/tests/share/${shareLink}/submit`, {
        studentName: studentInfo.name,
        studentEmail: studentInfo.email,
        answers,
        timeSpent: testData.timeLimit * 60 - timeRemaining,
      })
      setSubmitted(true)
    } catch {
      alert("Failed to submit test. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-card border border-border rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-2 text-green-400">Test Submitted Successfully</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for completing the test. Your results have been recorded.
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    )
  }

  const question = testData.questions[currentQuestion]
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const timeColor =
    timeRemaining < 300 ? "text-destructive" : timeRemaining < 600 ? "text-orange-400" : "text-foreground"

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-foreground">{testData.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {testData.questions.length}
            </p>
          </div>
          <div className={`text-2xl font-mono font-bold ${timeColor}`}>{formatTime(timeRemaining)}</div>
        </div>

        {/* Question */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{question.text}</h2>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion, idx)}
                className={`w-full text-left p-4 rounded border-2 transition ${
                  answers[question.id] === idx
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background hover:border-primary/50 text-foreground"
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + idx)})</span> {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {Object.keys(answers).length} of {testData.questions.length} answered
          </div>

          {currentQuestion === testData.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? "Submitting..." : "Submit Test"}
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="flex-1">
              Next
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 p-4 bg-card border border-border rounded-lg">
          <p className="text-sm font-medium text-foreground mb-3">Question Navigator</p>
          <div className="grid grid-cols-10 gap-2">
            {testData.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-8 h-8 rounded text-xs font-medium transition ${
                  idx === currentQuestion
                    ? "bg-primary text-white"
                    : answers[q.id] !== undefined
                      ? "bg-green-500/20 text-green-400"
                      : "bg-muted text-muted-foreground hover:bg-border"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
