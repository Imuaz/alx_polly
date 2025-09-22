"use client";

/**
 * Poll Voting Interface Component
 * 
 * Handles the interactive voting experience for polls, including:
 * - Single and multiple choice voting interfaces
 * - Real-time results display after voting
 * - Vote validation and submission
 * - Progress bars and percentage calculations
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Icons } from "@/components/ui/icons"
import { Users, Calendar, Clock } from "lucide-react"
import { Poll } from "@/lib/types/poll"
import { toast } from "sonner"

interface PollViewProps {
  poll: Poll;
  submitVote: (formData: FormData) => Promise<void>;
}

export function PollView({ poll, submitVote }: PollViewProps) {
  // State management for voting interface
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // Track selected option IDs
  const [hasVoted, setHasVoted] = useState(false); // Toggle between voting and results view
  const [isLoading, setIsLoading] = useState(false); // Loading state during vote submission

  /**
   * Handles vote submission to the server
   * 
   * Validates selection, submits votes via server action,
   * and transitions to results view on success
   */
  const handleVote = async () => {
    if (selectedOptions.length === 0) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      selectedOptions.forEach((id) => formData.append("option", id))
      await submitVote(formData)
      setHasVoted(true)
      toast.success("Vote submitted successfully!")
    } catch (error) {
      console.error("Voting error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to submit vote"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles option selection based on poll voting rules
   * 
   * @param optionId - The ID of the option being selected/deselected
   * 
   * For single-choice polls: replaces current selection
   * For multiple-choice polls: toggles option in selection array
   */
  const handleOptionSelect = (optionId: string) => {
    if (poll.allowMultipleVotes) {
      // Toggle option in multi-select mode
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId) // Remove if already selected
          : [...prev, optionId], // Add if not selected
      );
    } else {
      // Replace selection in single-select mode
      setSelectedOptions([optionId]);
    }
  };

  // Results view - shown after user has voted
  if (hasVoted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {poll.title}
            <Badge variant={poll.status === "active" ? "default" : "secondary"}>
              {poll.status}
            </Badge>
          </CardTitle>
          <CardDescription>{poll.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Poll metadata display */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{poll.totalVotes} votes</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
              </div>
              {poll.endsAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Ends {new Date(poll.endsAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            {/* Results visualization with progress bars */}
            <div className="space-y-3">
              {poll.options.map((option) => {
                // Calculate percentage for progress bar
                const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0
                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.text}</span>
                      <span className="text-sm text-muted-foreground">
                        {option.votes} votes ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    {/* Animated progress bar */}
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
            
            {/* Thank you message */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Thank you for voting! Results are updated in real-time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Voting interface - shown before user votes
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {poll.title}
          <Badge variant={poll.status === "active" ? "default" : "secondary"}>
            {poll.status}
          </Badge>
        </CardTitle>
        <CardDescription>{poll.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Poll metadata display */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{poll.totalVotes} votes</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
            </div>
            {poll.endsAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Ends {new Date(poll.endsAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {/* Conditional rendering based on poll voting type */}
          {poll.allowMultipleVotes ? (
            // Multiple choice interface with checkboxes
            <div className="space-y-3">
              {poll.options.map((option) => (
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
            // Single choice interface with radio buttons
            <RadioGroup value={selectedOptions[0]} onValueChange={handleOptionSelect}>
              {poll.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {/* Vote submission button */}
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
  );
}
