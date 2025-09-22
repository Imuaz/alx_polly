"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface CommentFormProps {
  onSubmitAction: (formData: FormData) => Promise<void>
}

export function CommentForm({ onSubmitAction }: CommentFormProps) {
  const [value, setValue] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!value.trim()) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("text", value.trim())
      await onSubmitAction(fd)
      setValue("")
      toast.success("Comment posted")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add a comment"
            aria-label="Add a comment"
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


