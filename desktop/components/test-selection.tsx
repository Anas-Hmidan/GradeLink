"use client"

import { useEffect, useState } from "react"
import { BookOpen, Clock } from "lucide-react"

interface Test {
  id: string
  title: string
  description: string
  duration: number
  questionCount: number
}

interface TestSelectionProps {
  onSelectTest: (test: Test) => void
}

export default function TestSelection({ onSelectTest }: TestSelectionProps) {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch tests from JSON file
    const loadTests = async () => {
      try {
        const response = await fetch("/tests-data.json")
        const data = await response.json()
        setTests(data.tests || [])
      } catch (error) {
        console.error("Error loading tests:", error)
        setTests([])
      } finally {
        setLoading(false)
      }
    }

    loadTests()
  }, [])

  return (
    <div className="w-full h-screen bg-gradient-to-b from-background to-background/95 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">MCQ Exam Platform</h1>
          </div>
          <p className="text-muted-foreground">Select a test to begin. Face detection will monitor your session.</p>
        </div>
      </div>

      {/* Test List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground">Loading tests...</p>
              </div>
            </div>
          ) : tests.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <BookOpen className="w-16 h-16 text-muted mx-auto" />
                <p className="text-muted-foreground">No tests available. Please check tests-data.json</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="bg-card border border-border hover:border-primary/50 rounded-lg p-6 transition cursor-pointer group"
                  onClick={() => onSelectTest(test)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition">
                        {test.title}
                      </h2>
                      <p className="text-muted-foreground text-sm mt-2">{test.description}</p>

                      <div className="flex gap-6 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{test.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span>{test.questionCount} questions</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition whitespace-nowrap ml-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectTest(test)
                      }}
                    >
                      Start Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
