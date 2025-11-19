"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "@/lib/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import axios from "@/lib/axios"
import DashboardHeader from "@/components/dashboard-header"
import TestCard from "@/components/test-card"
import LoadingSpinner from "@/components/loading-spinner"
import { Plus } from "lucide-react"

interface Test {
  id: string
  test_code: string
  title: string
  description?: string
  subject: string
  difficulty: string
  total_questions: number
  duration_minutes?: number
  created_at: string
  submissions: number
}

export default function DashboardPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const fetchTests = useCallback(async () => {
    try {
      const response = await axios.get("/api/test/teacher")
      const testsData = response.data.data?.tests || []
      setTests(testsData)
    } catch (err: any) {
      console.error("Failed to fetch tests:", err)
      setError(err.response?.data?.error?.message || "Failed to load tests")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/login")
      return
    }
    fetchTests()
  }, [user, authLoading, fetchTests])

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Tests</h1>
            <p className="text-muted-foreground mt-2">
              Create AI-powered tests from course documents and track student results
            </p>
          </div>
          <Button 
            onClick={() => navigate("/create-test")} 
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Test
          </Button>
        </div>

        {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>}

        {tests.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-lg bg-muted/30">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-2">No tests yet</h3>
              <p className="text-muted-foreground mb-6">
                Upload a course document and let AI generate your first test in seconds
              </p>
              <Button onClick={() => navigate("/create-test")} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Test
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard 
                key={test.id} 
                test={test} 
                onSelect={() => navigate(`/tests/${test.id}`)} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
