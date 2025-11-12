"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "@/lib/navigation"
import { useAuth } from "@/hooks/use-auth"
import axios, { isAxiosError } from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardHeader from "@/components/dashboard-header"
import LoadingSpinner from "@/components/loading-spinner"
import FileUpload from "@/components/file-upload"

export default function CreateTestPage() {
  const [testTitle, setTestTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState("medium")
  const [timeLimit, setTimeLimit] = useState(60)
  const [loading, setLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState("")
  const [error, setError] = useState("")
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login")
    }
  }, [authLoading, user, navigate])

  if (authLoading) return <LoadingSpinner />
  if (!user) return null

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Validation
    if (!selectedFile) {
      setError("Please select a PDF or Word document")
      return
    }

    setLoading(true)
    setLoadingStatus("Uploading document...")

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', testTitle)
      formData.append('subject', subject)
      formData.append('description', description)
      formData.append('difficulty', difficulty)
      formData.append('total_questions', questionCount.toString())
      formData.append('duration_minutes', timeLimit.toString())

      setLoadingStatus("Processing document...")

      // Make API request
      const response = await axios.post("/api/test/generate", formData, {
        headers: {
          // Don't set Content-Type - let browser set it with boundary
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setLoadingStatus(`Uploading: ${percentCompleted}%`)
          }
        },
      })

      setLoadingStatus("Generating questions with AI...")

      // Check response format
      if (response.data.success) {
        const testId = response.data.data.id
        // Navigate to test details page
        navigate(`/tests/${testId}`)
      } else {
        throw new Error(response.data.error?.message || "Failed to generate test")
      }
    } catch (err: any) {
      console.error("Test generation error:", err)
      
      // Handle different error types
      if (isAxiosError(err)) {
        const errorData = err.response?.data?.error
        const errorCode = errorData?.code
        const errorMessage = errorData?.message || err.message
        
        // Map backend error codes to user-friendly messages
        switch (errorCode) {
          case 'FILE_REQUIRED':
            setError("Please select a file to upload")
            break
          case 'FILE_TOO_LARGE':
            setError("File size exceeds 10MB limit. Please use a smaller file.")
            break
          case 'INVALID_FILE_TYPE':
            setError("Invalid file type. Only PDF and Word documents are supported.")
            break
          case 'INSUFFICIENT_CONTENT':
            setError("Document doesn't contain enough text. Please use a document with at least 100 characters.")
            break
          case 'DOCUMENT_PROCESSING_ERROR':
            setError("Failed to extract text from document. Make sure it's not a scanned image.")
            break
          case 'AI_SERVICE_ERROR':
            setError("AI service is temporarily unavailable. Please try again in a moment.")
            break
          case 'RATE_LIMITED':
            setError("Too many requests. Please wait a moment before trying again.")
            break
          case 'VALIDATION_ERROR':
            setError(errorMessage || "Invalid input. Please check your form data.")
            break
          default:
            setError(errorMessage || "Failed to generate test. Please try again.")
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
      setLoadingStatus("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create New Test</h1>
          <p className="text-muted-foreground mt-2">
            Upload a PDF or Word document and let AI generate multiple-choice questions from your content
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6 bg-card border border-border rounded-lg p-6">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          {loading && loadingStatus && (
            <div className="p-4 bg-primary/10 text-primary rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                <span>{loadingStatus}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Course Document <span className="text-destructive">*</span>
            </label>
            <FileUpload
              onFileSelect={setSelectedFile}
              accept=".pdf,.doc,.docx"
              maxSizeMB={10}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Upload your course materials, lecture notes, or study guide (PDF or Word format)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Test Title <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              placeholder="e.g., Biology Chapter 3 Quiz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Subject <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Biology, Mathematics, History"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Description (Optional)
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the test"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Number of Questions</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number.parseInt(e.target.value) || 10)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Difficulty Level</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Time Limit (minutes)</label>
            <Input
              type="number"
              min="5"
              max="300"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number.parseInt(e.target.value) || 60)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedFile} className="flex-1">
              {loading ? "Generating Test..." : "Generate Test with AI"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
