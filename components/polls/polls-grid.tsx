"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Users, Calendar, Clock } from "lucide-react"

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
    category: "Technology",
  },
  {
    id: "2",
    title: "Best framework for web development",
    description: "Which framework do you prefer for building modern web applications?",
    votes: 89,
    status: "active",
    createdAt: "2024-01-10",
    endsAt: "2024-02-10",
    category: "Technology",
  },
  {
    id: "3",
    title: "Preferred database technology",
    description: "What database technology do you use most frequently?",
    votes: 234,
    status: "ended",
    createdAt: "2024-01-01",
    endsAt: "2024-01-31",
    category: "Technology",
  },
  {
    id: "4",
    title: "Favorite coffee shop in the city",
    description: "Where do you like to grab your morning coffee?",
    votes: 67,
    status: "active",
    createdAt: "2024-01-20",
    endsAt: "2024-02-20",
    category: "Lifestyle",
  },
  {
    id: "5",
    title: "Best pizza toppings",
    description: "What are your favorite pizza toppings?",
    votes: 189,
    status: "active",
    createdAt: "2024-01-18",
    endsAt: "2024-02-18",
    category: "Food",
  },
  {
    id: "6",
    title: "Preferred workout time",
    description: "When do you prefer to exercise?",
    votes: 123,
    status: "active",
    createdAt: "2024-01-12",
    endsAt: "2024-02-12",
    category: "Health",
  },
]

export function PollsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {mockPolls.map((poll) => (
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
                  <span>{poll.votes} votes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Ends {poll.endsAt}</span>
                </div>
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
