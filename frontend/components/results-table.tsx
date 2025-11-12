"use client"

import { useMemo } from "react"

interface StudentResult {
  id: string
  studentName: string
  studentEmail: string
  testTitle: string
  score: number
  totalQuestions: number
  timeSpent: number
  completedAt: string
  cheatingDetected: boolean
  cheatingFlags?: string[]
}

interface ResultsTableProps {
  results: StudentResult[]
  sortBy: "score" | "date"
}

export default function ResultsTable({ results, sortBy }: ResultsTableProps) {
  const sortedResults = useMemo(() => {
    const sorted = [...results]
    if (sortBy === "score") {
      sorted.sort((a, b) => (b.score / b.totalQuestions) * 100 - (a.score / a.totalQuestions) * 100)
    } else {
      sorted.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
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
            const percentage = ((result.score / result.totalQuestions) * 100).toFixed(1)

            return (
              <tr key={result.id} className="border-b border-border hover:bg-muted/50 transition">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{result.studentName}</p>
                    <p className="text-xs text-muted-foreground">{result.studentEmail}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{result.testTitle}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {result.score}/{result.totalQuestions}
                    </p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{Math.round(result.timeSpent / 60)} min</td>
                <td className="px-4 py-3">
                  {result.cheatingDetected ? (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">Flagged</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Clean</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(result.completedAt).toLocaleDateString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
