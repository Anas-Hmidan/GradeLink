"use client"

import { useState, useEffect } from "react"
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
  id: string
  studentName: string
  studentEmail: string
  testTitle: string
  testId: string
  score: number
  totalQuestions: number
  timeSpent: number
  completedAt: string
  cheatingDetected: boolean
  cheatingFlags?: string[]
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

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/login")
      return
    }
    fetchResults()
  }, [user, authLoading, navigate, selectedTest])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const params = selectedTest !== "all" ? `?testId=${selectedTest}` : ""
      const response = await axios.get(`/api/results${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setResults(response.data.results)
      setAnalytics(response.data.analytics)
    } catch {
      setError("Failed to fetch results")
    } finally {
      setLoading(false)
    }
  }

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
        result.studentName,
        result.studentEmail,
        result.testTitle,
        `${result.score}/${result.totalQuestions}`,
        `${((result.score / result.totalQuestions) * 100).toFixed(1)}%`,
        Math.round(result.timeSpent / 60),
        new Date(result.completedAt).toLocaleString(),
        result.cheatingDetected ? "Yes" : "No",
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
