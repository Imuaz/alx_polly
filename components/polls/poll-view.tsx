"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Icons } from "@/components/ui/icons"
import { Users, Calendar, Clock } from "lucide-react"

interface PollViewProps {
  pollId: string
}

// Placeholder data - replace with actual data fetching
const mockPoll = {
  id: "1",
  title: "What's your favorite programming language?",
  description: "A comprehensive survey to understand the most popular programming languages among developers in 2024. This poll aims to gather insights about language preferences across different domains and experience levels.",
  options: [
    { id: "1", text: "JavaScript/TypeScript", votes: 45 },
    { id: "2", text: "Python", votes: 38 },
    { id: "3", text: "Java", votes: 25 },
    { id: "4", text: "C++", votes: 18 },
    { id: "5", text: "Go", votes: 12 },
    { id: "6", text: "Rust", votes: 8 },
  ],
  totalVotes: 146,
  status: "active",
  category: "Technology",
  createdAt: "2024-01-15",
  endsAt: "2024-02-15",
  allowMultipleVotes: false,
  anonymousVoting: true,
}

export function PollView({ pollId }: PollViewProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async () => {
    if (selectedOptions.length === 0) return
    
    setIsLoading(true)
    
    // TODO: Implement actual voting logic
    setTimeout(() => {
      setHasVoted(true)
      setIsLoading(false)
    }, 1000)
  }

  const handleOptionSelect = (optionId: string) => {
    if (mockPoll.allowMultipleVotes) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  if (hasVoted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mockPoll.title}
            <Badge variant={mockPoll.status === "active" ? "default" : "secondary"}>
              {mockPoll.status}
            </Badge>
          </CardTitle>
          <CardDescription>{mockPoll.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{mockPoll.totalVotes} votes</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {mockPoll.createdAt}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Ends {mockPoll.endsAt}</span>
              </div>
            </div>
            <div className="space-y-3">
              {mockPoll.options.map((option) => {
                const percentage = (option.votes / mockPoll.totalVotes) * 100
                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.text}</span>
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
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Thank you for voting! Results are updated in real-time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mockPoll.title}
          <Badge variant={mockPoll.status === "active" ? "default" : "secondary"}>
            {mockPoll.status}
          </Badge>
        </CardTitle>
        <CardDescription>{mockPoll.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{mockPoll.totalVotes} votes</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {mockPoll.createdAt}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Ends {mockPoll.endsAt}</span>
            </div>
          </div>
          
          {mockPoll.allowMultipleVotes ? (
            <div className="space-y-3">
              {mockPoll.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => handleOptionSelect(option.id)}
                  />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <RadioGroup value={selectedOptions[0]} onValueChange={handleOptionSelect}>
              {mockPoll.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          <Button 
            onClick={handleVote} 
            disabled={selectedOptions.length === 0 || isLoading}
            className="w-full"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Vote
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
