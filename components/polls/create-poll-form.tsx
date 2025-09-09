"use client"

/**
 * Poll Creation Form Component
 * 
 * Provides a comprehensive interface for creating new polls with:
 * - Dynamic option management (add/remove options)
 * - Poll settings (multiple votes, anonymous voting)
 * - Form validation and submission
 * - Category selection and optional end dates
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Icons } from "@/components/ui/icons"
import { Plus, X } from "lucide-react"
import { createPoll } from "@/lib/polls/actions"
// import { toast } from "sonner"

export function CreatePollForm() {
  // Form state management
  const [isLoading, setIsLoading] = useState(false) // Loading state during form submission
  const [options, setOptions] = useState(["", ""]) // Poll options (minimum 2 required)
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false) // Allow users to select multiple options
  const [anonymousVoting, setAnonymousVoting] = useState(false) // Hide voter identities
  const [category, setCategory] = useState("") // Poll category selection

  /**
   * Adds a new empty option to the poll
   * Users can add as many options as needed beyond the minimum of 2
   */
  const addOption = () => {
    setOptions([...options, ""])
  }

  /**
   * Removes an option from the poll
   * Prevents removal if only 2 options remain (minimum requirement)
   * 
   * @param index - Index of the option to remove
   */
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  /**
   * Updates the text of a specific option
   * 
   * @param index - Index of the option to update
   * @param value - New text value for the option
   */
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  /**
   * Handles form submission to create a new poll
   * 
   * @param formData - Form data containing all poll information
   * 
   * On success, the server action handles redirect to polls page
   * On error, displays error message and resets loading state
   */
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    
    try {
      await createPoll(formData)
      // Success handled by Server Action redirect to polls page
    } catch (error) {
      console.error("Error creating poll:", error)
      alert(error instanceof Error ? error.message : "Failed to create poll")
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
          <CardDescription>
            Create your poll with a clear title and description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="What's your favorite programming language?"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide more context about your poll..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="category" value={category} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Poll Options</CardTitle>
          <CardDescription>
            Add the choices that users can vote on
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                name={`option-${index}`}
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                required
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Poll Settings</CardTitle>
          <CardDescription>
            Configure additional options for your poll
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Multiple Votes</Label>
              <p className="text-sm text-muted-foreground">
                Users can vote for multiple options
              </p>
            </div>
            <Switch
              checked={allowMultipleVotes}
              onCheckedChange={setAllowMultipleVotes}
            />
            <input type="hidden" name="allowMultipleVotes" value={allowMultipleVotes ? "on" : ""} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Anonymous Voting</Label>
              <p className="text-sm text-muted-foreground">
                Hide voter identities in results
              </p>
            </div>
            <Switch
              checked={anonymousVoting}
              onCheckedChange={setAnonymousVoting}
            />
            <input type="hidden" name="anonymousVoting" value={anonymousVoting ? "on" : ""} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Poll
        </Button>
      </div>
    </form>
  )
}
