"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeletePollButtonProps {
  pollId: string
  action: (formData: FormData) => Promise<void>
}

export function DeletePollButton({ pollId, action }: DeletePollButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Poll</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this poll? This action cannot be undone.
            All votes and poll data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action} className="inline">
            <input type="hidden" name="pollId" value={pollId} />
            <AlertDialogAction asChild>
              <Button type="submit" disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                {isDeleting ? "Deleting..." : "Delete Poll"}
              </Button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
