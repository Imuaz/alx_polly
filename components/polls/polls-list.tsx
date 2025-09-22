import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Users, Calendar, Edit, Trash2 } from "lucide-react"
import { getPolls } from "@/lib/polls/actions"
import { DeletePollButton } from "@/components/polls/delete-poll-button"

export async function PollsList() {
  const polls = await getPolls()

  if (polls.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No polls created yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first poll to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {polls.map((poll) => (
        <Card key={poll.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  <Link href={`/polls/${poll.id}`} className="hover:underline">
                    {poll.title}
                  </Link>
                </CardTitle>
                <CardDescription>{poll.description}</CardDescription>
              </div>
              <Badge variant={poll.status === "active" ? "default" : "secondary"}>
                {poll.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{poll.totalVotes} votes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {poll.endsAt 
                      ? `Ends ${new Date(poll.endsAt).toLocaleDateString()}`
                      : 'No end date'
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/polls/${poll.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/polls/${poll.id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <DeletePollButton pollId={poll.id} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
