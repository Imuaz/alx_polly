import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Clock } from "lucide-react"
import { Poll } from "@/lib/types/poll"
import { PollChart } from "@/components/polls/PollChart"

interface PollResultsProps {
  poll: Poll
}

export function PollResults({ poll }: PollResultsProps) {
  const winningOption = poll.options.reduce((prev, current) => 
    prev.votes > current.votes ? prev : current
  )
  
  const winningPercentage = poll.totalVotes > 0 ? (winningOption.votes / poll.totalVotes) * 100 : 0
  const chartData = poll.options.map(o => ({ name: o.text, value: o.votes }))

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
              {winningPercentage.toFixed(1)}% of votes
            </span>
          </div>
          <h3 className="font-semibold text-lg">{winningOption.text}</h3>
          <p className="text-sm text-muted-foreground">
            {winningOption.votes} votes
          </p>
        </div>

        {/* Chart Visualization */}
        <div className="space-y-3">
          <h4 className="font-medium">Visualization</h4>
          <PollChart data={chartData} type="pie" />
          <PollChart data={chartData} type="bar" />
        </div>

        {/* Results Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium">Vote Breakdown</h4>
          {poll.options.map((option) => {
            const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0
            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{option.text}</span>
                  <span className="text-sm text-muted-foreground">
                    {option.votes} votes ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{poll.totalVotes}</div>
            <div className="text-xs text-muted-foreground">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{poll.options.length}</div>
            <div className="text-xs text-muted-foreground">Options</div>
          </div>
        </div>

        {/* Recent Activity - Simplified for now */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Poll Information
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span className="text-xs text-muted-foreground">
                {new Date(poll.createdAt).toLocaleDateString()}
              </span>
            </div>
            {poll.endsAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ends</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(poll.endsAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
