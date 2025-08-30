"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface CreatePollButtonProps {
  variant?: "default" | "outline"
  className?: string
}

export function CreatePollButton({ variant = "default", className }: CreatePollButtonProps) {
  return (
    <Button asChild variant={variant} className={className}>
      <Link href="/polls/create">
        <Plus className="mr-2 h-4 w-4" />
        Create Poll
      </Link>
    </Button>
  )
}
