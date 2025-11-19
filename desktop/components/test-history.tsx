"use client"

import { useState, useEffect } from "react"
import { History, BookOpen, Clock, Award, AlertTriangle, ArrowLeft, Calendar } from "lucide-react"
import { TestService, TestHistory } from "@/lib/test-service"

interface TestHistoryScreenProps {
  onBack: () => void
}

export default function TestHistoryScreen({ onBack }: TestHistoryScreenProps) {
  const [results, setResults] = useState<TestHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await TestService.getStudentResults()

      if (response.success && response.data) {
        setResults(response.data.results)
      } else {
        setError(response.error?.message || "Failed to load results")
      }
    } catch (err) {
      console.error("Load results error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-500 bg-green-500/10"
      case "medium":
        return "text-yellow-500 bg-yellow-500/10"
      case "hard":
        return "text-red-500 bg-red-500/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-500"
    if (percentage >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-background to-background/95 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to Tests</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <History className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">My Test History</h1>
          </div>
          <p className="text-muted-foreground">View all your completed tests and results</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground">Loading results...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
                <p className="text-destructive">{error}</p>
                <button
                  onClick={loadResults}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <History className="w-16 h-16 text-muted mx-auto" />
                <p className="text-muted-foreground">No tests completed yet</p>
                <p className="text-sm text-muted-foreground">
                  Your test results will appear here after you complete exams
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Tests</p>
                  <p className="text-2xl font-bold text-foreground">{results.length}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-foreground">
                    {results.length > 0
                      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
                      : 0}
                    %
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tests Flagged</p>
                  <p className="text-2xl font-bold text-destructive">
                    {results.filter((r) => r.flagged_for_cheating).length}
                  </p>
                </div>
              </div>

              {/* Results List */}
              {results.map((result) => (
                <div
                  key={result.result_id}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{result.test_title}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(
                            result.test_difficulty
                          )}`}
                        >
                          {result.test_difficulty}
                        </span>
                        {result.flagged_for_cheating && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-destructive/10 text-destructive">
                            ⚠️ Flagged
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {result.test_subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(result.submitted_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(result.time_taken_seconds)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getScoreColor(result.percentage)}`}>
                        {result.percentage}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.score}/{result.total_questions} correct
                      </p>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Assigned by</p>
                    <p className="text-sm font-semibold text-foreground">{result.teacher_name}</p>
                    <p className="text-xs text-muted-foreground">{result.teacher_email}</p>
                  </div>

                  {/* Cheating Reasons */}
                  {result.flagged_for_cheating && result.cheating_reasons.length > 0 && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-destructive mb-2">
                        Flagged Reasons:
                      </p>
                      <ul className="text-xs text-destructive space-y-1">
                        {result.cheating_reasons.map((reason, idx) => (
                          <li key={idx}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
