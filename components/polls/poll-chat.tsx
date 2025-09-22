"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PollChatProps {
  pollId: string
}

export function PollChat({ pollId }: PollChatProps) {
  const [messages, setMessages] = useState<{ id: string; text: string }[]>([])
  const [value, setValue] = useState("")

  const onSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setMessages((prev) => [...prev, { id: String(Date.now()), text: value.trim() }])
    setValue("")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Discussion</CardTitle>
        <CardDescription>Chat about this poll</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64 overflow-auto rounded border p-3 bg-background" aria-label="Chat messages">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet. Be the first to comment.</p>
          ) : (
            <ul className="space-y-2">
              {messages.map((m) => (
                <li key={m.id} className="text-sm">{m.text}</li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={onSend} className="flex items-center gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write a message..."
            className="flex-1"
            aria-label="Message input"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardContent>
    </Card>
  )
}


