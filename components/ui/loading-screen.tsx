"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3 as Poll, Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  className?: string;
  variant?: "default" | "minimal" | "logo";
  show?: boolean;
  onComplete?: () => void;
}

export function LoadingScreen({
  message = "Loading...",
  className,
  variant = "default",
  show = true,
  onComplete,
}: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      // Prevent scrolling when loading screen is active
      document.body.style.overflow = "hidden";
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "unset";
        onComplete?.();
      }, 200); // Wait for exit animation
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-background/95 backdrop-blur-md",
        "transition-all duration-300 ease-in-out",
        !isAnimating && "opacity-0",
        className,
      )}
      role="dialog"
      aria-labelledby="loading-title"
      aria-describedby="loading-description"
      aria-live="polite"
    >
      <div className="flex flex-col items-center space-y-4 px-6 py-8 max-w-sm w-full">
        {/* Loading Animation */}
        <div className="relative">
          {variant === "logo" && (
            <>
              {/* Animated Logo */}
              <div className="relative">
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60",
                    "flex items-center justify-center shadow-lg",
                    "animate-pulse",
                  )}
                >
                  <Poll className="h-8 w-8 text-primary-foreground" />
                </div>
                {/* Rotating Ring */}
                <div
                  className={cn(
                    "absolute -inset-2 rounded-full border-2 border-transparent",
                    "border-t-primary/30 border-r-primary/20",
                    "animate-spin",
                  )}
                />
              </div>
            </>
          )}

          {variant === "minimal" && (
            <Loader2
              className="h-8 w-8 text-primary animate-spin"
              aria-hidden="true"
            />
          )}

          {variant === "default" && (
            <>
              {/* Multi-layer Loading Animation */}
              <div className="relative">
                {/* Outer Ring */}
                <div
                  className={cn(
                    "w-16 h-16 rounded-full border-4 border-muted",
                    "border-t-primary animate-spin",
                    "[animation-duration:1.5s]",
                  )}
                />
                {/* Inner Ring */}
                <div
                  className={cn(
                    "absolute inset-2 rounded-full border-4 border-muted",
                    "border-r-primary/60 animate-spin",
                    "[animation-duration:1s] [animation-direction:reverse]",
                  )}
                />
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Poll
                    className={cn(
                      "h-6 w-6 text-primary",
                      "animate-pulse [animation-duration:2s]",
                    )}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2
            id="loading-title"
            className="text-lg font-semibold text-foreground"
          >
            {message}
          </h2>
          <div className="flex items-center justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full bg-primary/60",
                  "animate-bounce",
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1.4s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Indicator (Optional) */}
        <div className="w-full max-w-xs">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-gradient-to-r from-primary/50 to-primary",
                "animate-pulse rounded-full",
                "bg-[length:200%_100%]",
                "animate-[shimmer_2s_ease-in-out_infinite]",
              )}
            />
          </div>
        </div>
      </div>

      {/* Screen Reader Content */}
      <div
        id="loading-description"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        The application is loading. Please wait while we prepare your content.
      </div>
    </div>
  );
}

// Page-level loading component
interface PageLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function PageLoading({
  className,
  size = "md",
  message = "Loading...",
}: PageLoadingProps) {
  const sizeClasses = {
    sm: "py-8",
    md: "py-16",
    lg: "py-24",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full",
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label={message}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div
            className={cn(
              "w-8 h-8 rounded-full border-2 border-muted",
              "border-t-primary animate-spin",
            )}
          />
        </div>
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  );
}

// Skeleton components for better UX
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden="true"
    />
  );
}

// Enhanced skeleton components
export function PollCardSkeleton() {
  return (
    <div
      className="rounded-lg border bg-card p-6 shadow-sm space-y-4"
      role="status"
      aria-label="Loading poll"
    >
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div
      className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-3"
      role="status"
      aria-label="Loading statistics"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-12" />
        </div>
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function NavSkeleton() {
  return (
    <div
      className="space-y-2 px-4"
      role="status"
      aria-label="Loading navigation"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading table data">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading states hook for better state management
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
  };
}
