"use client"

import { useState } from "react"
import TestSelection from "@/components/test-selection"
import ExamInterface from "@/components/exam-interface"

type PageState = "selection" | "exam" | "results"

export default function Home() {
  const [currentState, setCurrentState] = useState<PageState>("selection")
  const [selectedTest, setSelectedTest] = useState<any>(null)
  const [examResults, setExamResults] = useState<any>(null)

  const handleStartTest = (test: any) => {
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

  return (
    <main className="bg-background text-foreground w-full h-screen overflow-hidden">
      {currentState === "selection" && <TestSelection onSelectTest={handleStartTest} />}
      {currentState === "exam" && selectedTest && (
        <ExamInterface test={selectedTest} onComplete={handleExamComplete} onCancel={handleReturnToSelection} />
      )}
      {currentState === "results" && examResults && (
        <ResultsView results={examResults} onReturnHome={handleReturnToSelection} />
      )}
    </main>
  )
}

function ResultsView({ results, onReturnHome }: any) {
  const score = (results.correctAnswers / results.totalQuestions) * 100

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-background to-background/95">
      <div className="max-w-md w-full space-y-6 p-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">Test Complete!</h1>
          <p className="text-muted-foreground">Here's your performance summary</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">Total Questions</span>
            <span className="text-xl font-semibold">{results.totalQuestions}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">Correct Answers</span>
            <span className="text-xl font-semibold text-green-500">{results.correctAnswers}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Score</span>
            <span className="text-3xl font-bold text-primary">{score.toFixed(1)}%</span>
          </div>
        </div>

        {results.suspiciousActivities && results.suspiciousActivities.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-sm font-semibold text-destructive mb-2">Suspicious Activities Detected</p>
            <ul className="text-xs text-destructive space-y-1">
              {results.suspiciousActivities.map((activity: string, idx: number) => (
                <li key={idx}>• {activity}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onReturnHome}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Return to Test Selection
        </button>
      </div>
    </div>
  )
}
