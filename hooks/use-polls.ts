import useSWR from 'swr'
import { Poll, PollFilters, CreatePollData } from '@/lib/types/poll'


function buildQuery(filters?: PollFilters) {
  if (!filters) return ''
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)
  if (filters.status) params.append('status', filters.status)
  if (filters.search) params.append('search', filters.search)
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
  return `?${params.toString()}`
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function usePolls(filters?: PollFilters) {
  const { data: polls = [], error, isLoading, mutate } = useSWR<Poll[]>(`/api/polls${buildQuery(filters)}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000 // 1 minute
  })


  const createPoll = async (pollData: CreatePollData): Promise<Poll | null> => {
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pollData)
      })
      if (!response.ok) throw new Error('Failed to create poll')
      await mutate() // revalidate cache
      return await response.json()
    } catch (err) {
      return null
    }
  }


  const voteOnPoll = async (pollId: string, optionIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIds })
      })
      if (!response.ok) throw new Error('Failed to vote')
      await mutate()
      return true
    } catch (err) {
      return false
    }
  }


  const deletePoll = async (pollId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete poll')
      await mutate()
      return true
    } catch (err) {
      return false
    }
  }

  return {
    polls,
    loading: isLoading,
    error,
    createPoll,
    voteOnPoll,
    deletePoll,
    refetch: mutate
  }
}
