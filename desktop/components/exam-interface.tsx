"use client"

import { useState, useEffect, useRef } from "react"
import CameraMonitor from "./camera-monitor"
import QuestionPanel from "./question-panel"
import TestTimer from "./test-timer"
import { TestService, TestData, TestAnswer } from "@/lib/test-service"
import { AuthService } from "@/lib/auth-service"

interface ExamInterfaceProps {
  test: TestData
  onComplete: (results: any) => void
  onCancel: () => void
}

export default function ExamInterface({ test, onComplete, onCancel }: ExamInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { answer: number; startTime: number }>>({})
  const [timeRemaining, setTimeRemaining] = useState(test.duration_minutes * 60)
  const [suspiciousActivities, setSuspiciousActivities] = useState<string[]>([])
  const [showWarning, setShowWarning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const warningTimeoutRef = useRef<NodeJS.Timeout>()
  const questionStartTimeRef = useRef<number>(Date.now())
  const testStartTimeRef = useRef<number>(Date.now())

  const currentQuestion = test.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1
  const user = AuthService.getUser()
  const studentId = user?.email?.split('@')[0] || "STUDENT"

  // Handle time expiration
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmitTest()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  // Track question start time
  useEffect(() => {
    questionStartTimeRef.current = Date.now()
  }, [currentQuestionIndex])

  const handleSuspiciousActivity = (activity: string) => {
    const timestamp = new Date().toISOString()
    setSuspiciousActivities((prev) => [...prev, `[${timestamp}] ${activity}`])
    setShowWarning(true)

    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }

    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(false)
    }, 4000)
  }

  const handleAnswerChange = (optionIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: {
        answer: optionIndex,
        startTime: questionStartTimeRef.current,
      },
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitTest = async () => {
    if (submitting) return
    
    setSubmitting(true)

    try {
      // Calculate total time taken
      const totalTimeSeconds = test.duration_minutes * 60 - timeRemaining

      // Prepare answers payload
      const answersPayload: TestAnswer[] = test.questions.map((question) => {
        const answerData = answers[question.id]
        const timeSpent = answerData 
          ? Math.floor((Date.now() - answerData.startTime) / 1000)
          : 0

        return {
          question_id: question.id,
          selected_answer: answerData?.answer ?? -1, // -1 means not answered
          time_spent_seconds: timeSpent,
        }
      })

      // Submit to backend
      const response = await TestService.submitTest(test.id, {
        answers: answersPayload,
        total_time_seconds: totalTimeSeconds,
      })

      if (response.success && response.data) {
        // Pass results to parent
        onComplete({
          ...response.data,
          suspiciousActivities,
          timeUsed: totalTimeSeconds,
          answeredQuestions: answersPayload.filter(a => a.selected_answer !== -1).length,
        })
      } else {
        // Show error and allow retry
        alert(response.error?.message || "Failed to submit test. Please try again.")
        setSubmitting(false)
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("An error occurred while submitting. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{test.title}</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {test.questions.length}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <TestTimer timeRemaining={timeRemaining} />
          {showWarning && (
            <div className="bg-destructive/20 text-destructive px-4 py-2 rounded-lg text-sm font-semibold animate-pulse">
              ⚠️ Suspicious Activity Detected
            </div>
          )}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
                onCancel()
              }
            }}
            className="text-muted-foreground hover:text-foreground transition text-sm font-semibold"
            disabled={submitting}
          >
            Exit Test
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-4 p-4">
        {/* Question Panel */}
        <div className="flex-1 flex flex-col">
          <QuestionPanel
            question={currentQuestion}
            selectedAnswer={answers[currentQuestion.id]?.answer}
            onAnswerChange={handleAnswerChange}
            currentIndex={currentQuestionIndex}
            totalQuestions={test.questions.length}
            onNext={handleNextQuestion}
            onPrevious={handlePreviousQuestion}
            onSubmit={handleSubmitTest}
            isLastQuestion={isLastQuestion}
            submitting={submitting}
          />
        </div>

        {/* Camera Monitor */}
        <div className="w-80">
          <CameraMonitor 
            onSuspiciousActivity={handleSuspiciousActivity} 
            studentId={studentId}
          />
        </div>
      </div>
    </div>
  )
}