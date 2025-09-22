"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Spinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full", className)}
    role="status"
    aria-label="Loading"
    {...props}
  />
))
Spinner.displayName = "Spinner"

export { Spinner }