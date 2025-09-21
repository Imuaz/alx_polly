"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PageLoadingOverlay, RouteTransitionLoader } from '@/components/ui/loading-states';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  showRouteTransition: () => void;
  hideRouteTransition: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [showRouteTransition, setShowRouteTransition] = useState(false);

  const showLoading = useCallback((message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const showRouteTransitionHandler = useCallback(() => {
    setShowRouteTransition(true);
  }, []);

  const hideRouteTransitionHandler = useCallback(() => {
    setShowRouteTransition(false);
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        showLoading,
        hideLoading,
        showRouteTransition: showRouteTransitionHandler,
        hideRouteTransition: hideRouteTransitionHandler,
      }}
    >
      {children}
      {isLoading && <PageLoadingOverlay message={loadingMessage} />}
      {showRouteTransition && <RouteTransitionLoader />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}