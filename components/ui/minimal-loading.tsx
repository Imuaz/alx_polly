"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MinimalLoadingProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * A lightweight loading component that doesn't interfere with Next.js navigation
 * Uses relative positioning instead of fixed to avoid scroll issues
 */
export function MinimalLoading({
  message = "Loading...",
  className,
  size = "md",
}: MinimalLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-2 p-4",
        className
      )}
      role="status"
      aria-label={message}
    >
      <Loader2
        className={cn("animate-spin text-primary", sizeClasses[size])}
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Inline loading spinner for buttons and small areas
 */
export function InlineLoading({ 
  size = "sm", 
  className 
}: { 
  size?: "sm" | "md"; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  return (
    <Loader2
      className={cn("animate-spin", sizeClasses[size], className)}
      aria-hidden="true"
    />
  );
}