"use client"

import { useState, useEffect, useRef } from "react"
import CameraMonitor from "./camera-monitor"
import QuestionPanel from "./question-panel"
import TestTimer from "./test-timer"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface Test {
  id: string
  title: string
  duration: number
  questions: Question[]
}

interface ExamInterfaceProps {
  test: Test
  onComplete: (results: any) => void
  onCancel: () => void
}

export default function ExamInterface({ test, onComplete, onCancel }: ExamInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeRemaining, setTimeRemaining] = useState(test.duration * 60)
  const [suspiciousActivities, setSuspiciousActivities] = useState<string[]>([])
  const [showWarning, setShowWarning] = useState(false)
  const warningTimeoutRef = useRef<NodeJS.Timeout>()

  const currentQuestion = test.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1

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

  const handleSuspiciousActivity = (activity: string) => {
    setSuspiciousActivities((prev) => [...prev, activity])
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
      [currentQuestion.id]: optionIndex,
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

  const handleSubmitTest = () => {
    let correctCount = 0

    test.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })

    onComplete({
      correctAnswers: correctCount,
      totalQuestions: test.questions.length,
      suspiciousActivities,
      timeUsed: test.duration * 60 - timeRemaining,
    })
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
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition text-sm font-semibold"
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
            selectedAnswer={answers[currentQuestion.id]}
            onAnswerChange={handleAnswerChange}
            currentIndex={currentQuestionIndex}
            totalQuestions={test.questions.length}
            onNext={handleNextQuestion}
            onPrevious={handlePreviousQuestion}
            onSubmit={handleSubmitTest}
            isLastQuestion={isLastQuestion}
          />
        </div>

        {/* Camera Monitor */}
        <div className="w-80">
          <CameraMonitor onSuspiciousActivity={handleSuspiciousActivity} />
        </div>
      </div>
    </div>
  )
}
