"use client"

import { Input } from "@/components/ui/input"

interface ResultsFiltersProps {
  selectedTest: string
  onTestChange: (testId: string) => void
  sortBy: "score" | "date"
  onSortChange: (sortBy: "score" | "date") => void
}

export default function ResultsFilters({ selectedTest, onTestChange, sortBy, onSortChange }: ResultsFiltersProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium mb-2 text-foreground">Filter by Test</label>
        <Input
          type="text"
          placeholder="Test ID or enter 'all'"
          value={selectedTest}
          onChange={(e) => onTestChange(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "score" | "date")}
          className="px-3 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="date">Newest First</option>
          <option value="score">Highest Score</option>
        </select>
      </div>
    </div>
  )
}
