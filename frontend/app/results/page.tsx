"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "@/lib/navigation"
import { useAuth } from "@/hooks/use-auth"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import DashboardHeader from "@/components/dashboard-header"
import LoadingSpinner from "@/components/loading-spinner"
import ResultsFilters from "@/components/results-filters"
import ResultsTable from "@/components/results-table"
import AnalyticsOverview from "@/components/analytics-overview"

interface StudentResult {
  result_id: string
  student_id: string
  student_email: string
  student_name: string
  testTitle?: string
  testId?: string
  score: number
  total_questions: number
  percentage: number
  time_taken_seconds: number
  submitted_at: string
  flagged_for_cheating: boolean
  cheating_reasons: string[]
}

interface AnalyticsData {
  totalSubmissions: number
  averageScore: number
  highestScore: number
  lowestScore: number
  cheatingCases: number
}

export default function ResultsPage() {
  const [results, setResults] = useState<StudentResult[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTest, setSelectedTest] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"score" | "date">("date")
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      // If a specific test is selected, fetch its results
      if (selectedTest !== "all") {
        const response = await axios.get(`/api/test/${selectedTest}/results`)
        const resultsData = response.data.data?.results || []
        setResults(resultsData)
        // Calculate analytics from results
        if (resultsData.length > 0) {
          const scores = resultsData.map((r: any) => r.percentage)
          const cheatingCount = resultsData.filter((r: any) => r.flagged_for_cheating).length
          setAnalytics({
            totalSubmissions: resultsData.length,
            averageScore: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            cheatingCases: cheatingCount,
          })
        }
      } else {
        // For "all" view, we need to fetch all tests first
        const testsResponse = await axios.get("/api/test/teacher")
        const tests = testsResponse.data.data?.tests || []
        
        // Fetch results for each test
        const allResults: StudentResult[] = []
        for (const test of tests) {
          try {
            const response = await axios.get(`/api/test/${test.id}/results`)
            const testResults = response.data.data?.results || []
            // Add test info to each result
            testResults.forEach((r: any) => {
              allResults.push({
                ...r,
                testTitle: test.title,
                testId: test.id,
              })
            })
          } catch (err) {
            console.error(`Failed to fetch results for test ${test.id}`, err)
          }
        }
        
        setResults(allResults)
        // Calculate overall analytics
        if (allResults.length > 0) {
          const scores = allResults.map(r => r.percentage)
          const cheatingCount = allResults.filter(r => r.flagged_for_cheating).length
          setAnalytics({
            totalSubmissions: allResults.length,
            averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            cheatingCases: cheatingCount,
          })
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch results:", err)
      setError(err.response?.data?.error?.message || "Failed to fetch results")
    } finally {
      setLoading(false)
    }
  }, [selectedTest])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/login")
      return
    }
    fetchResults()
  }, [user, authLoading, fetchResults])

  const handleExportCSV = () => {
    try {
      const headers = [
        "Student Name",
        "Email",
        "Test",
        "Score",
        "Percentage",
        "Time Spent (min)",
        "Completed At",
        "Cheating Detected",
      ]

      const rows = results.map((result) => [
        result.student_name,
        result.student_email,
        result.testTitle || "N/A",
        `${result.score}/${result.total_questions}`,
        `${result.percentage.toFixed(1)}%`,
        Math.round(result.time_taken_seconds / 60),
        new Date(result.submitted_at).toLocaleString(),
        result.flagged_for_cheating ? "Yes" : "No",
      ])

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `results-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      alert("Failed to export results")
    }
  }

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Results</h1>
            <p className="text-muted-foreground mt-1">View submissions, scores, and analytics across all tests</p>
          </div>
          <Button onClick={handleExportCSV} disabled={results.length === 0} variant="outline">
            Export CSV
          </Button>
        </div>

        {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>}

        {analytics && <AnalyticsOverview data={analytics} />}

        <ResultsFilters
          selectedTest={selectedTest}
          onTestChange={setSelectedTest}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {results.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">No results available</p>
          </div>
        ) : (
          <ResultsTable results={results} sortBy={sortBy} />
        )}
      </main>
    </div>
  )
}
