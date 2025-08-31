"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SuccessMessage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const successMessage = searchParams.get("success")
    if (successMessage) {
      setMessage(successMessage)
    }
  }, [searchParams])

  const handleDismiss = () => {
    setMessage(null)
    // Remove success param from URL
    const url = new URL(window.location.href)
    url.searchParams.delete("success")
    router.replace(url.pathname + url.search)
  }

  if (!message) return null

  return (
    <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-green-800 dark:text-green-200">{message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-auto p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
