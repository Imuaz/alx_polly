"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface RouteLoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const RouteLoadingContext = createContext<RouteLoadingContextType | undefined>(
  undefined
);

interface RouteLoadingProviderProps {
  children: React.ReactNode;
}

export function RouteLoadingProvider({ children }: RouteLoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Clear loading state when route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Brief delay to avoid flash

    return () => clearTimeout(timer);
  }, [pathname]);

  // Show loading screen when navigating
  useEffect(() => {
    if (isLoading) {
      // Prevent scrolling while loading
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isLoading]);

  const value = {
    isLoading,
    setIsLoading,
  };

  return (
    <RouteLoadingContext.Provider value={value}>
      {isLoading && (
        <LoadingScreen message="Navigating..." className="z-[100]" />
      )}
      {children}
    </RouteLoadingContext.Provider>
  );
}

export function useRouteLoading() {
  const context = useContext(RouteLoadingContext);
  if (context === undefined) {
    throw new Error(
      "useRouteLoading must be used within a RouteLoadingProvider"
    );
  }
  return context;
}

// Hook for programmatic navigation with loading
export function useNavigateWithLoading() {
  const { setIsLoading } = useRouteLoading();

  const navigateWithLoading = (callback: () => void) => {
    setIsLoading(true);
    // Small delay to show loading state before navigation
    setTimeout(callback, 50);
  };

  return { navigateWithLoading };
}
