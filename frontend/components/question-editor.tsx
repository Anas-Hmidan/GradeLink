"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuestionEditorProps {
  questions: Question[]
  onSave: (questions: Question[]) => Promise<void>
  onCancel: () => void
}

export default function QuestionEditor({ questions: initialQuestions, onSave, onCancel }: QuestionEditorProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    const updated = [...questions]
    if (field === "text") updated[idx].text = value
    if (field === "explanation") updated[idx].explanation = value
    setQuestions(updated)
  }

  const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...questions]
    updated[qIdx].options[oIdx] = value
    setQuestions(updated)
  }

  const handleCorrectAnswerChange = (qIdx: number, oIdx: number) => {
    const updated = [...questions]
    updated[qIdx].correctAnswer = oIdx
    setQuestions(updated)
  }

  const handleSave = async () => {
    setError("")
    try {
      setSaving(true)
      await onSave(questions)
    } catch {
      setError("Failed to save questions")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-destructive/10 text-destructive rounded">{error}</div>}

      {questions.map((question, qIdx) => (
        <div key={question.id} className="p-4 border border-border rounded bg-background space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Question {qIdx + 1}</label>
            <textarea
              value={question.text}
              onChange={(e) => handleQuestionChange(qIdx, "text", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Options (click to mark as correct)</label>
            <div className="space-y-2">
              {question.options.map((option, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCorrectAnswerChange(qIdx, oIdx)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold ${
                      oIdx === question.correctAnswer ? "bg-green-500 border-green-500 text-white" : "border-border"
                    }`}
                  >
                    {oIdx === question.correctAnswer ? "✓" : ""}
                  </button>
                  <span className="text-sm text-muted-foreground">{String.fromCharCode(65 + oIdx)})</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Explanation (optional)</label>
            <textarea
              value={question.explanation}
              onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              rows={2}
              placeholder="Explain why this is the correct answer..."
            />
          </div>
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
