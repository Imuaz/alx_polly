/**
 * Test utilities for poll actions testing
 * Provides reusable mocks, builders, and helpers
 */

// Next.js mocks
export const mockRedirect = jest.fn((url?: string) => {
  const err: any = new Error('NEXT_REDIRECT')
  err.digest = 'NEXT_REDIRECT'
  throw err
})

export const mockRevalidatePath = jest.fn((path?: string) => {})

// Supabase mocks
export const mockGetUser = jest.fn()
export const mockFrom = jest.fn()

/**
 * Creates a selectable query mock that can be chained
 */
export const makeSelectable = (result: any) => {
  const obj: any = {
    eq: jest.fn(() => obj),
    or: jest.fn(() => obj),
    order: jest.fn(() => obj),
    single: jest.fn(async () => result),
    then: (resolve: any) => resolve(result), // thenable so `await query` works
  }
  return obj
}

/**
 * Builds a Supabase client mock with optional overrides
 */
export const buildSupabaseClient = (overrides: Partial<Record<string, any>> = {}) => {
  const client: any = {
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }
  Object.assign(client, overrides)
  return client
}

/**
 * Helper to set the supabase client returned by factory
 */
export const setSupabaseReturn = (client: any) => {
  const { createServerComponentClient } = require('@/lib/supabase-server')
  ;(createServerComponentClient as jest.Mock).mockResolvedValue(client)
}

// Authentication helpers
export const mockAuthUser = (userId: string = 'u1') => {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null })
}

export const mockAuthNone = () => {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') })
}

// FormData builders
export interface PollFormDataOptions {
  title?: string
  description?: string
  category?: string
  endDate?: string
  allowMultipleVotes?: boolean
  anonymousVoting?: boolean
  options?: string[]
}

export const buildPollFormData = (overrides: PollFormDataOptions = {}): FormData => {
  const defaults: Required<PollFormDataOptions> = {
    title: 'Test Poll',
    description: 'Test Description',
    category: 'general',
    endDate: '',
    allowMultipleVotes: false,
    anonymousVoting: false,
    options: ['Option A', 'Option B']
  }

  const config = { ...defaults, ...overrides }
  const fd = new FormData()
  
  fd.set('title', config.title)
  fd.set('description', config.description)
  fd.set('category', config.category)
  fd.set('endDate', config.endDate)
  fd.set('allowMultipleVotes', config.allowMultipleVotes ? 'on' : '')
  fd.set('anonymousVoting', config.anonymousVoting ? 'on' : '')
  
  config.options.forEach((option, index) => {
    fd.set(`option-${index}`, option)
  })

  return fd
}

// Supabase query builders
export const buildInsertMock = (returnData: any = { id: 'p1' }) => {
  return jest.fn(() => ({
    select: () => ({
      single: jest.fn().mockResolvedValue({ data: returnData, error: null }),
    }),
  }))
}

export const buildMockQuery = (returnData: any, error: any = null) => {
  const mockQuery: any = {
    select: jest.fn(),
    eq: jest.fn(),
    or: jest.fn(),
    order: jest.fn(() => Promise.resolve({ data: returnData, error })),
    delete: jest.fn(),
    insert: jest.fn(),
  }
  
  // Set up method chaining
  mockQuery.select.mockReturnValue(mockQuery)
  mockQuery.eq.mockReturnValue(mockQuery)
  mockQuery.or.mockReturnValue(mockQuery)
  mockQuery.delete.mockReturnValue({ eq: jest.fn().mockResolvedValue({ error }) })

  return mockQuery
}

// Mock data factories
export const createMockPoll = (overrides: Partial<any> = {}) => ({
  id: 'p1',
  title: 'Test Poll',
  description: 'Test Description',
  category: 'general',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  ends_at: null,
  total_votes: 5,
  allow_multiple_votes: false,
  anonymous_voting: true,
  created_by: 'u1',
  poll_options: [
    { id: 'opt1', text: 'Option 1', votes: 3, order_index: 0 },
    { id: 'opt2', text: 'Option 2', votes: 2, order_index: 1 }
  ],
  ...overrides
})

export const createMockPolls = (count: number = 2) => {
  return Array.from({ length: count }, (_, i) => 
    createMockPoll({
      id: `p${i + 1}`,
      title: `Test Poll ${i + 1}`,
      description: `Description ${i + 1}`,
      category: i % 2 === 0 ? 'general' : 'tech',
      created_by: `u${i + 1}`
    })
  )
}

// Common setup function
export const setupCommonMocks = () => {
  jest.clearAllMocks()
  mockAuthUser() // Default to authenticated user
  setSupabaseReturn(buildSupabaseClient())
}

// Jest mocks - these need to be at module level
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    const err: any = new Error('NEXT_REDIRECT')
    err.digest = 'NEXT_REDIRECT'
    throw err
  }),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/supabase-server', () => ({
  createServerComponentClient: jest.fn(),
}))
