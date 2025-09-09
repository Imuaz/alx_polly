/**
 * Dashboard Header Component
 * 
 * Provides a consistent header layout for dashboard pages with:
 * - Main heading with responsive typography
 * - Optional descriptive text
 * - Flexible action area for buttons or other controls
 * - Proper spacing and alignment
 */

import { ReactNode } from "react"

interface DashboardHeaderProps {
  heading: string // Main page title
  text?: string // Optional descriptive text below heading
  children?: ReactNode // Action buttons or other controls (right-aligned)
}

/**
 * Renders a dashboard page header with title, description, and action area
 * 
 * @param heading - The main page title
 * @param text - Optional subtitle or description
 * @param children - Action elements (buttons, etc.) to display on the right
 */
export function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      {/* Left side: Title and description */}
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>
        {text && <p className="text-lg text-muted-foreground">{text}</p>}
      </div>
      {/* Right side: Action buttons or controls */}
      {children}
    </div>
  )
}
