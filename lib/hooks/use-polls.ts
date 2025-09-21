"use client";

import useSWR from 'swr';
import { Poll, PollFilters } from '@/lib/types/poll';

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Hook for fetching polls with SWR caching and revalidation
 */
export function usePolls(filters?: PollFilters) {
  const queryParams = new URLSearchParams();
  
  if (filters?.category) queryParams.set('category', filters.category);
  if (filters?.status) queryParams.set('status', filters.status);
  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.sortBy) queryParams.set('sortBy', filters.sortBy);
  if (filters?.sortOrder) queryParams.set('sortOrder', filters.sortOrder);

  const { data, error, isLoading, mutate } = useSWR<Poll[]>(
    `/api/polls?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  return {
    polls: data || [],
    isLoading,
    error,
    mutate, // For manual revalidation
  };
}

/**
 * Hook for fetching a single poll
 */
export function usePoll(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Poll>(
    id ? `/api/polls/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds for individual polls
      errorRetryCount: 3,
    }
  );

  return {
    poll: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook for fetching user poll statistics
 */
export function useUserPollsStats() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/polls/user/stats',
    fetcher,
    {
      revalidateOnFocus: false, // Don't revalidate on focus for stats
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds for stats
      errorRetryCount: 2,
    }
  );

  return {
    stats: data || { totalPolls: 0, activePolls: 0, totalVotes: 0 },
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook for optimistic updates when voting
 */
export function useOptimisticVote(pollId: string) {
  const { mutate } = usePoll(pollId);

  const optimisticVote = async (optionIds: string[]) => {
    // Optimistically update the UI
    mutate(
      (currentPoll) => {
        if (!currentPoll) return currentPoll;

        const updatedOptions = currentPoll.options.map((option) => {
          if (optionIds.includes(option.id)) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });

        return {
          ...currentPoll,
          options: updatedOptions,
          totalVotes: currentPoll.totalVotes + optionIds.length,
        };
      },
      false // Don't revalidate immediately
    );

    // Make the actual API call
    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // Revalidate to get the real data
      mutate();
    } catch (error) {
      // Revert optimistic update on error
      mutate();
      throw error;
    }
  };

  return { optimisticVote };
}
