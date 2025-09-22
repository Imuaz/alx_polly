import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Users, Clock } from "lucide-react"
import { getPollsOptimized } from "@/lib/data/optimized-polls-server"
import { PollFilters } from "@/lib/types/poll"

interface PollsGridProps {
  filters?: PollFilters
}

export async function PollsGrid({ filters }: PollsGridProps) {
  const polls = await getPollsOptimized(filters).catch(() => []);

  if (!Array.isArray(polls) || polls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No polls found</h3>
          <p className="text-sm">Try adjusting your filters or create a new poll to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <Card key={poll.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardHeader>
            <div className="flex items-start justify-between">
              <Badge variant="outline" className="text-xs">
                {poll.category}
              </Badge>
              <Badge variant={poll.status === "active" ? "default" : "secondary"}>
                {poll.status}
              </Badge>
            </div>
            <CardTitle className="line-clamp-2">
              <Link href={`/polls/${poll.id}`} className="hover:underline">
                {poll.title}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {poll.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{poll.total_votes} votes</span>
                </div>
                {poll.expires_at && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Ends {new Date(poll.expires_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <Button className="w-full" size="sm" asChild>
                <Link href={`/polls/${poll.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Poll
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
