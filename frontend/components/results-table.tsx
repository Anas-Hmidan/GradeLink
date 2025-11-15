"use client"

import { useMemo } from "react"

interface StudentResult {
  result_id: string
  student_id: string
  student_name: string
  student_email: string
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

interface ResultsTableProps {
  results: StudentResult[]
  sortBy: "score" | "date"
}

export default function ResultsTable({ results, sortBy }: ResultsTableProps) {
  const sortedResults = useMemo(() => {
    const sorted = [...results]
    if (sortBy === "score") {
      sorted.sort((a, b) => b.percentage - a.percentage)
    } else {
      sorted.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    }
    return sorted
  }, [results, sortBy])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Student</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Test</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Score</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Time Spent</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((result) => {
            return (
              <tr key={result.result_id} className="border-b border-border hover:bg-muted/50 transition">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{result.student_name}</p>
                    <p className="text-xs text-muted-foreground">{result.student_email}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{result.testTitle || "N/A"}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {result.score}/{result.total_questions}
                    </p>
                    <p className="text-xs text-muted-foreground">{result.percentage.toFixed(1)}%</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{Math.round(result.time_taken_seconds / 60)} min</td>
                <td className="px-4 py-3">
                  {result.flagged_for_cheating ? (
                    <div>
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">Flagged</span>
                      {result.cheating_reasons.length > 0 && (
                        <p className="text-xs text-orange-300 mt-1">{result.cheating_reasons.join(", ")}</p>
                      )}
                    </div>
                  ) : (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Clean</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(result.submitted_at).toLocaleDateString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
