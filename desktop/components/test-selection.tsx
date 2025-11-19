"use client"

import { useState } from "react"
import { BookOpen, Clock, AlertCircle, Lock, History } from "lucide-react"
import { TestService, TestData } from "@/lib/test-service"
import { AuthService } from "@/lib/auth-service"

interface TestSelectionProps {
  onSelectTest: (test: TestData) => void
  onViewHistory: () => void
}

export default function TestSelection({ onSelectTest, onViewHistory }: TestSelectionProps) {
  const [testCode, setTestCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testData, setTestData] = useState<TestData | null>(null)

  const user = AuthService.getUser()

  const handleAccessTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate code format (8 characters)
      const code = testCode.trim().toUpperCase()
      if (code.length !== 8) {
        setError("Test code must be exactly 8 characters")
        setLoading(false)
        return
      }

      const response = await TestService.accessTest(code)

      if (response.success && response.data) {
        setTestData(response.data)
        setError(null)
      } else {
        setError(response.error?.message || "Invalid test code or test not available")
        setTestData(null)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Test access error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTest = () => {
    if (testData) {
      onSelectTest(testData)
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    window.location.reload()
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-background to-background/95 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Exam Platform</h1>
            </div>
            <p className="text-muted-foreground">Enter your test code to begin.</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{user.full_name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {!testData ? (
            <>
              {/* Test Code Entry */}
              <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Access Test</h2>
                  <p className="text-muted-foreground">
                    Enter the 8-character code provided by your teacher
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <form onSubmit={handleAccessTest} className="space-y-4">
                  <div>
                    <label htmlFor="testCode" className="block text-sm font-medium text-foreground mb-2">
                      Test Code
                    </label>
                    <input
                      id="testCode"
                      type="text"
                      value={testCode}
                      onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                      placeholder="ABC12XYZ"
                      maxLength={8}
                      required
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Example: ABC12XYZ (8 characters)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || testCode.trim().length !== 8}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                        Accessing Test...
                      </span>
                    ) : (
                      "Access Test"
                    )}
                  </button>
                </form>
              </div>

              {/* View History Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={onViewHistory}
                  className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
                >
                  <History className="w-4 h-4" />
                  View My Test History
                </button>
              </div>
            </>
          ) : (
            /* Test Preview */
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full mb-4">
                  <span className="text-xs font-semibold text-primary uppercase">
                    Code: {testData.test_code}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{testData.title}</h2>
                <p className="text-muted-foreground">{testData.description}</p>
              </div>

              {/* Test Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-background border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Subject</p>
                  <p className="text-lg font-semibold text-foreground">{testData.subject}</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{testData.difficulty}</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-lg font-semibold text-foreground">{testData.duration_minutes} min</p>
                    </div>
                  </div>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Questions</p>
                      <p className="text-lg font-semibold text-foreground">{testData.total_questions}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-500 mb-2">
                  ⚠️ Important Instructions
                </p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>• Face detection will monitor your session continuously</li>
                  <li>• Keep your face visible in the camera at all times</li>
                  <li>• Any suspicious activity will be flagged and recorded</li>
                  <li>• Once started, the timer cannot be paused</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setTestData(null)
                    setTestCode("")
                    setError(null)
                  }}
                  className="flex-1 border border-border text-foreground py-3 rounded-lg font-semibold hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartTest}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Start Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
