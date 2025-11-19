"use client"

import { useState, useEffect } from "react"
import { AuthService } from "@/lib/auth-service"
import AuthScreen from "@/components/auth-screen"
import TestSelection from "@/components/test-selection"
import TestHistoryScreen from "@/components/test-history"
import ExamInterface from "@/components/exam-interface"
import { TestData } from "@/lib/test-service"

type PageState = "auth" | "selection" | "history" | "exam" | "results"

export default function Home() {
  const [currentState, setCurrentState] = useState<PageState>("auth")
  const [selectedTest, setSelectedTest] = useState<TestData | null>(null)
  const [examResults, setExamResults] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const authenticated = AuthService.isAuthenticated()
    setIsAuthenticated(authenticated)
    if (authenticated) {
      setCurrentState("selection")
    } else {
      setCurrentState("auth")
    }
  }, [])

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setCurrentState("selection")
  }

  const handleStartTest = (test: TestData) => {
    setSelectedTest(test)
    setCurrentState("exam")
  }

  const handleExamComplete = (results: any) => {
    setExamResults(results)
    setCurrentState("results")
  }

  const handleReturnToSelection = () => {
    setCurrentState("selection")
    setSelectedTest(null)
    setExamResults(null)
  }

  const handleViewHistory = () => {
    setCurrentState("history")
  }

  return (
    <main className="bg-background text-foreground w-full h-screen overflow-hidden">
      {currentState === "auth" && <AuthScreen onAuthSuccess={handleAuthSuccess} />}
      
      {currentState === "selection" && (
        <TestSelection 
          onSelectTest={handleStartTest} 
          onViewHistory={handleViewHistory}
        />
      )}
      
      {currentState === "history" && (
        <TestHistoryScreen onBack={handleReturnToSelection} />
      )}
      
      {currentState === "exam" && selectedTest && (
        <ExamInterface 
          test={selectedTest} 
          onComplete={handleExamComplete} 
          onCancel={handleReturnToSelection} 
        />
      )}
      
      {currentState === "results" && examResults && (
        <ResultsView 
          results={examResults} 
          onReturnHome={handleReturnToSelection} 
        />
      )}
    </main>
  )
}

function ResultsView({ results, onReturnHome }: any) {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-background to-background/95">
      <div className="max-w-md w-full space-y-6 p-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">Test Submitted!</h1>
          <p className="text-muted-foreground">Your test has been submitted successfully</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">Score</span>
            <span className="text-3xl font-bold text-primary">
              {results.percentage ? `${results.percentage}%` : `${results.score}/${results.total_questions}`}
            </span>
          </div>
          
          {results.total_questions && (
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground">Correct Answers</span>
              <span className="text-xl font-semibold text-green-500">
                {results.score}/{results.total_questions}
              </span>
            </div>
          )}

          {results.timeUsed && (
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground">Time Taken</span>
              <span className="text-lg font-semibold">
                {Math.floor(results.timeUsed / 60)}m {results.timeUsed % 60}s
              </span>
            </div>
          )}

          {results.answeredQuestions !== undefined && (
            <div className="flex justify-between items-center py-3">
              <span className="text-muted-foreground">Questions Answered</span>
              <span className="text-lg font-semibold">
                {results.answeredQuestions}/{results.total_questions}
              </span>
            </div>
          )}
        </div>

        {results.flagged_for_cheating && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-sm font-semibold text-destructive mb-2">⚠️ Test Flagged</p>
            <p className="text-xs text-destructive">
              This test has been flagged for potential integrity issues. Your teacher will review it.
            </p>
          </div>
        )}

        {results.suspiciousActivities && results.suspiciousActivities.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-500 mb-2">
              Suspicious Activities Logged
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">
              {results.suspiciousActivities.length} incident(s) detected during exam
            </p>
            <details className="text-xs">
              <summary className="cursor-pointer text-yellow-600 dark:text-yellow-500 font-semibold">
                View Details
              </summary>
              <ul className="mt-2 space-y-1 text-yellow-700 dark:text-yellow-400">
                {results.suspiciousActivities.slice(0, 10).map((activity: string, idx: number) => (
                  <li key={idx}>• {activity}</li>
                ))}
                {results.suspiciousActivities.length > 10 && (
                  <li>... and {results.suspiciousActivities.length - 10} more</li>
                )}
              </ul>
            </details>
          </div>
        )}

        <button
          onClick={onReturnHome}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Return to Home
        </button>
      </div>
    </div>
  )
}
