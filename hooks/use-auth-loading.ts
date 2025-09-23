"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLoading } from '@/components/providers/smart-loading-provider';

/**
 * Hook that coordinates between authentication state and loading states
 * to prevent UI conflicts during auth transitions
 */
export function useAuthLoading() {
  const { loading, isInitializing } = useAuth();
  const { hideLoading } = useLoading();

  useEffect(() => {
    // If auth is not loading and not initializing, ensure UI loading is cleared
    if (!loading && !isInitializing) {
      // Small delay to ensure all auth-related operations complete
      const timer = setTimeout(() => {
        hideLoading();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading, isInitializing, hideLoading]);

  return {
    isAuthLoading: loading || isInitializing,
  };
}