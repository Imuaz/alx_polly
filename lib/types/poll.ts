export interface Poll {
  id: string
  title: string
  description?: string
  options: PollOption[]
  category: string
  status: 'active' | 'ended' | 'draft'
  createdAt: string
  endsAt?: string
  totalVotes: number
  allowMultipleVotes: boolean
  anonymousVoting: boolean
  createdBy: string
  tags?: string[]
}

export interface PollOption {
  id: string
  text: string
  votes: number
  percentage?: number
}

export interface PollVote {
  id: string
  pollId: string
  optionIds: string[]
  userId?: string
  createdAt: string
  ipAddress?: string
}

export interface PollResult {
  pollId: string
  totalVotes: number
  options: PollOption[]
  winningOption: PollOption
  recentActivity: PollActivity[]
}

export interface PollActivity {
  id: string
  pollId: string
  action: string
  timestamp: string
  userId?: string
}

export interface CreatePollData {
  title: string
  description?: string
  options: string[]
  category: string
  endsAt?: string
  allowMultipleVotes: boolean
  anonymousVoting: boolean
  tags?: string[]
}

export interface PollFilters {
  search?: string
  category?: string
  status?: string
  sortBy?: 'created' | 'votes' | 'ending'
  sortOrder?: 'asc' | 'desc'
}
