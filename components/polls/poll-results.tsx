"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Clock } from "lucide-react"

interface PollResultsProps {
  pollId: string
}

// Placeholder data - replace with actual data fetching
const mockResults = {
  totalVotes: 146,
  options: [
    { id: "1", text: "JavaScript/TypeScript", votes: 45, percentage: 30.8 },
    { id: "2", text: "Python", votes: 38, percentage: 26.0 },
    { id: "3", text: "Java", votes: 25, percentage: 17.1 },
    { id: "4", text: "C++", votes: 18, percentage: 12.3 },
    { id: "5", text: "Go", votes: 12, percentage: 8.2 },
    { id: "6", text: "Rust", votes: 8, percentage: 5.5 },
  ],
  recentActivity: [
    { time: "2 minutes ago", action: "New vote for Python" },
    { time: "5 minutes ago", action: "New vote for JavaScript/TypeScript" },
    { time: "10 minutes ago", action: "New vote for Java" },
    { time: "15 minutes ago", action: "New vote for Python" },
  ],
}

export function PollResults({ pollId }: PollResultsProps) {
  const winningOption = mockResults.options.reduce((prev, current) => 
    prev.votes > current.votes ? prev : current
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Results
        </CardTitle>
        <CardDescription>
          Live voting results and statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Winner Highlight */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="bg-green-600">
              Winner
            </Badge>
            <span className="text-sm text-muted-foreground">
              {winningOption.percentage.toFixed(1)}% of votes
            </span>
          </div>
          <h3 className="font-semibold text-lg">{winningOption.text}</h3>
          <p className="text-sm text-muted-foreground">
            {winningOption.votes} votes
          </p>
        </div>

        {/* Results Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium">Vote Breakdown</h4>
          {mockResults.options.map((option) => (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{option.text}</span>
                <span className="text-sm text-muted-foreground">
                  {option.votes} votes ({option.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{mockResults.totalVotes}</div>
            <div className="text-xs text-muted-foreground">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{mockResults.options.length}</div>
            <div className="text-xs text-muted-foreground">Options</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </h4>
          <div className="space-y-2">
            {mockResults.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{activity.action}</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
