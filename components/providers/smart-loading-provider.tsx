"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface LoadingContextType {
  isLoading: boolean;
  message: string;
  variant: "default" | "minimal" | "logo";
  showLoading: (message?: string, variant?: "default" | "minimal" | "logo") => void;
  hideLoading: () => void;
  updateMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
  defaultMessage?: string;
  enableRouteLoading?: boolean;
}

export function LoadingProvider({
  children,
  defaultMessage = "Loading...",
  enableRouteLoading = false, // Disabled by default to prevent auth conflicts
}: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [variant, setVariant] = useState<"default" | "minimal" | "logo">("default");
  const [manualLoading, setManualLoading] = useState(false);
  const pathname = usePathname();

  // Handle route changes - but only for manual navigation, not auth redirects
  useEffect(() => {
    if (!enableRouteLoading || manualLoading) return;

    let timeoutId: NodeJS.Timeout;
    let isAuthPath = pathname === '/login' || pathname === '/verify-email' || pathname === '/register';
    
    // Don't show loading overlay for auth-related paths or very quick transitions
    if (isAuthPath) {
      return;
    }

    // Show minimal loading for non-auth route changes
    setIsLoading(true);
    setMessage("Loading...");
    setVariant("minimal");

    // Very short loading time to avoid interfering with Next.js
    timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, enableRouteLoading, manualLoading]);

  const showLoading = useCallback(
    (
      newMessage?: string,
      newVariant: "default" | "minimal" | "logo" = "default"
    ) => {
      setManualLoading(true);
      setIsLoading(true);
      setMessage(newMessage || defaultMessage);
      setVariant(newVariant);
    },
    [defaultMessage]
  );

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setManualLoading(false);
  }, []);

  const updateMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  // Auto-hide manual loading after a reasonable time to prevent stuck states
  useEffect(() => {
    if (manualLoading && isLoading) {
      const maxTimeout = setTimeout(() => {
        setIsLoading(false);
        setManualLoading(false);
      }, 10000); // 10 second maximum

      return () => clearTimeout(maxTimeout);
    }
  }, [manualLoading, isLoading]);

  const contextValue: LoadingContextType = {
    isLoading,
    message,
    variant,
    showLoading,
    hideLoading,
    updateMessage,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <LoadingScreen
        show={isLoading}
        message={message}
        variant={variant}
      />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

// Hook for auth-related loading states
export function useAuthLoading() {
  const { showLoading, hideLoading } = useLoading();

  const showAuthLoading = useCallback((action: string) => {
    const messages = {
      signin: "Signing in...",
      signup: "Creating your account...",
      signout: "Signing out...",
      verify: "Verifying your email...",
      reset: "Sending reset email...",
      loading: "Loading your account...",
    };

    showLoading(
      messages[action as keyof typeof messages] || "Authenticating...",
      "logo"
    );
  }, [showLoading]);

  return {
    showAuthLoading,
    hideAuthLoading: hideLoading,
  };
}

// Hook for async operations with loading states
export function useAsyncOperation() {
  const { showLoading, hideLoading } = useLoading();

  const executeAsync = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      options?: {
        loadingMessage?: string;
        variant?: "default" | "minimal" | "logo";
      }
    ): Promise<T> => {
      try {
        showLoading(
          options?.loadingMessage || "Processing...",
          options?.variant || "default"
        );

        const result = await operation();
        return result;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return { executeAsync };
}