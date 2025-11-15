"use client"

import { Clock } from "lucide-react"

interface TestTimerProps {
  timeRemaining: number
}

export default function TestTimer({ timeRemaining }: TestTimerProps) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const isWarning = timeRemaining < 300 // Less than 5 minutes
  const isCritical = timeRemaining < 60 // Less than 1 minute

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${
        isCritical
          ? "bg-destructive/20 text-destructive"
          : isWarning
            ? "bg-yellow-500/20 text-yellow-600"
            : "bg-muted text-foreground"
      }`}
    >
      <Clock className="w-4 h-4" />
      <span>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  )
}
