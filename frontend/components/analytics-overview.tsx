"use client"

import { Card } from "@/components/ui/card"

interface AnalyticsData {
  totalSubmissions: number
  averageScore: number
  highestScore: number
  lowestScore: number
  cheatingCases: number
}

interface AnalyticsOverviewProps {
  data: AnalyticsData
}

export default function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <Card className="p-6 border-border bg-card">
        <p className="text-sm text-muted-foreground mb-1">Total Submissions</p>
        <p className="text-3xl font-bold text-foreground">{data.totalSubmissions}</p>
      </Card>

      <Card className="p-6 border-border bg-card">
        <p className="text-sm text-muted-foreground mb-1">Average Score</p>
        <p className="text-3xl font-bold text-foreground">{data.averageScore.toFixed(1)}%</p>
      </Card>

      <Card className="p-6 border-border bg-card">
        <p className="text-sm text-muted-foreground mb-1">Highest Score</p>
        <p className="text-3xl font-bold text-green-400">{data.highestScore}%</p>
      </Card>

      <Card className="p-6 border-border bg-card">
        <p className="text-sm text-muted-foreground mb-1">Lowest Score</p>
        <p className="text-3xl font-bold text-destructive">{data.lowestScore}%</p>
      </Card>

      <Card className="p-6 border-border bg-card">
        <p className="text-sm text-muted-foreground mb-1">Cheating Cases</p>
        <p className="text-3xl font-bold text-orange-400">{data.cheatingCases}</p>
      </Card>
    </div>
  )
}
