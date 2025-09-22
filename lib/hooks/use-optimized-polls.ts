import useSWR from 'swr';
import { useCallback } from 'react';

// Enhanced fetcher with better error handling
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    next: { revalidate: 30 }, // 30 second revalidation
    headers: {
      'Cache-Control': 'max-age=30, stale-while-revalidate=300'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return response.json();
};

// Polls hook with optimized caching
export function usePolls(filters?: {
  category?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/polls?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      fallbackData: undefined,
    }
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    polls: data || [],
    isLoading,
    error,
    refresh,
    mutate
  };
}

// Single poll hook
export function usePoll(pollId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    pollId ? `/api/polls/${pollId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute for single poll
      errorRetryCount: 3,
    }
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    poll: data,
    isLoading,
    error,
    refresh,
    mutate
  };
}

// User stats hook
export function useUserStats() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/polls/user/stats',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute for stats
      errorRetryCount: 3,
    }
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    stats: data || { totalPolls: 0, activePolls: 0, totalVotes: 0, avgVotes: 0 },
    isLoading,
    error,
    refresh,
    mutate
  };
}

