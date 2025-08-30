"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Users, Calendar } from "lucide-react"

// Placeholder data - replace with actual data fetching
const mockPolls = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "A survey to understand the most popular programming languages among developers",
    votes: 156,
    status: "active",
    createdAt: "2024-01-15",
    endsAt: "2024-02-15",
  },
  {
    id: "2",
    title: "Best framework for web development",
    description: "Which framework do you prefer for building modern web applications?",
    votes: 89,
    status: "active",
    createdAt: "2024-01-10",
    endsAt: "2024-02-10",
  },
  {
    id: "3",
    title: "Preferred database technology",
    description: "What database technology do you use most frequently?",
    votes: 234,
    status: "ended",
    createdAt: "2024-01-01",
    endsAt: "2024-01-31",
  },
]

export function PollsList() {
  return (
    <div className="space-y-4">
      {mockPolls.map((poll) => (
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
                  <span>{poll.votes} votes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Ends {poll.endsAt}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/polls/${poll.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
