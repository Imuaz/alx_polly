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
  enableRouteLoading = true,
}: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [variant, setVariant] = useState<"default" | "minimal" | "logo">("default");
  const pathname = usePathname();

  // Handle route changes
  useEffect(() => {
    if (!enableRouteLoading) return;

    let timeoutId: NodeJS.Timeout;

    setIsLoading(true);
    setMessage("Navigating...");
    setVariant("minimal");

    // Hide loading after a short delay
    timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
    };
  }, [pathname, enableRouteLoading]);

  const showLoading = useCallback((
    newMessage?: string,
    newVariant: "default" | "minimal" | "logo" = "default"
  ) => {
    setIsLoading(true);
    setMessage(newMessage || defaultMessage);
    setVariant(newVariant);
  }, [defaultMessage]);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const updateMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

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
    <T,>(
      operation: () => Promise<T>,
      options?: {
        loadingMessage?: string;
        variant?: "default" | "minimal" | "logo";
      }
    ): Promise<T> => {
      return new Promise(async (resolve, reject) => {
        try {
          showLoading(
            options?.loadingMessage || "Processing...",
            options?.variant || "default"
          );

          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          hideLoading();
        }
      });
    },
    [showLoading, hideLoading]
  );

  return { executeAsync };
}

// Simple error boundary
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorState {
  hasError: boolean;
}

export class LoadingErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Loading Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-destructive">
                Something went wrong
              </h2>
              <p className="text-muted-foreground">
                There was an error loading the content. Please refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
