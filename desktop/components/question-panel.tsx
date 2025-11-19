"use client"

import { ChevronLeft, ChevronRight, Send } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface QuestionPanelProps {
  question: Question
  selectedAnswer: number | undefined
  onAnswerChange: (optionIndex: number) => void
  currentIndex: number
  totalQuestions: number
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  isLastQuestion: boolean
  submitting?: boolean
}

export default function QuestionPanel({
  question,
  selectedAnswer,
  onAnswerChange,
  currentIndex,
  totalQuestions,
  onNext,
  onPrevious,
  onSubmit,
  isLastQuestion,
  submitting = false,
}: QuestionPanelProps) {
  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-full overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-muted/50 border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Question */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">{question.question}</h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition"
              onClick={() => onAnswerChange(index)}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={selectedAnswer === index}
                onChange={() => onAnswerChange(index)}
                className="mt-1 w-4 h-4 cursor-pointer"
              />
              <span className="text-foreground flex-1">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-border bg-muted/30 p-4 flex items-center justify-between">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Previous</span>
        </button>

        <div className="text-sm text-muted-foreground">
          {selectedAnswer !== undefined ? "✓ Answered" : "○ Not answered"}
        </div>

        {isLastQuestion ? (
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                <span className="text-sm">Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="text-sm">Submit Test</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition"
          >
            <span className="text-sm font-semibold">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
