"use client"

import type { FC } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock } from "lucide-react"

interface Test {
  id: string
  title: string
  description?: string
  subject: string
  difficulty: string
  total_questions: number
  duration_minutes: number
  created_at: string
}

interface TestCardProps {
  test: Test
  onSelect: () => void
}

const TestCard: FC<TestCardProps> = ({ test, onSelect }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/20 text-green-400"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "hard":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="p-6 border-border bg-card hover:shadow-lg transition cursor-pointer group" onClick={onSelect}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition">
            {test.title}
          </h3>
          <p className="text-sm text-muted-foreground">{test.subject}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
          {test.difficulty}
        </span>
      </div>

      {test.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{test.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{test.total_questions}</span>
          <span className="text-muted-foreground">questions</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{test.duration_minutes}</span>
          <span className="text-muted-foreground">min</span>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Created {formatDate(test.created_at)}
        </span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className="text-primary hover:text-primary/80"
        >
          View Details 
        </Button>
      </div>
    </Card>
  )
}

export default TestCard
