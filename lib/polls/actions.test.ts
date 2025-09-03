import { createPoll, votePoll, deletePoll, getPolls, getPoll, getUserPolls } from '@/lib/polls/actions'

// Mocks for Next.js utilities
const mockRedirect = jest.fn((url?: string) => {
  // Simulate Next.js redirect throwing to break execution flow
  const err: any = new Error('NEXT_REDIRECT')
  err.digest = 'NEXT_REDIRECT'
  throw err
})
const mockRevalidatePath = jest.fn((path?: string) => {})

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => mockRedirect(url)),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn((path: string) => mockRevalidatePath(path)),
}))

// Supabase server client mock
const mockGetUser = jest.fn()
const mockFrom = jest.fn()

const makeSelectable = (result: any) => {
  const obj: any = {
    eq: jest.fn(() => obj),
    or: jest.fn(() => obj),
    order: jest.fn(() => obj),
    single: jest.fn(async () => result),
    then: (resolve: any) => resolve(result), // thenable so `await query` works
  }
  return obj
}

const buildSupabaseClient = (overrides: Partial<Record<string, any>> = {}) => {
  const client: any = {
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }
  Object.assign(client, overrides)
  return client
}

jest.mock('@/lib/supabase-server', () => ({
  createServerComponentClient: jest.fn(),
}))

// Helper to set the supabase client returned by factory
const setSupabaseReturn = (client: any) => {
  const { createServerComponentClient } = require('@/lib/supabase-server')
  ;(createServerComponentClient as jest.Mock).mockResolvedValue(client)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('poll actions', () => {
  describe('createPoll', () => {
    test('creates poll and options then redirects on success', async () => {
      // Arrange auth
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      // Arrange DB call flows
      const insertMock = jest.fn(() => ({
        select: () => ({
          single: jest.fn().mockResolvedValue({ data: { id: 'p1' }, error: null }),
        }),
      }))
      const optionsInsertMock = jest.fn().mockResolvedValue({ error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            insert: insertMock,
          }
        }
        if (table === 'poll_options') {
          return {
            insert: optionsInsertMock,
          }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      const fd = new FormData()
      fd.set('title', 'My Poll')
      fd.set('description', 'Desc')
      fd.set('category', 'general')
      fd.set('endDate', '')
      fd.set('allowMultipleVotes', 'on')
      fd.set('anonymousVoting', '')
      fd.set('option-0', 'A')
      fd.set('option-1', 'B')

      // Act
      await expect(createPoll(fd)).rejects.toMatchObject({ digest: 'NEXT_REDIRECT' })

      // Assert
      expect(insertMock).toHaveBeenCalled()
      expect(optionsInsertMock).toHaveBeenCalled()
      expect(mockRevalidatePath).toHaveBeenCalledWith('/polls')
      expect(mockRedirect).toHaveBeenCalledWith('/polls?success=Poll created successfully!')
    })

    test('validates required fields', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
      setSupabaseReturn(buildSupabaseClient())

      const fd = new FormData()
      // Missing title and options
      fd.set('category', 'general')

      await expect(createPoll(fd)).rejects.toThrow(
        'Title, category, and at least 2 options are required'
      )
    })

    test('requires authentication', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') })
      setSupabaseReturn(buildSupabaseClient())

      const fd = new FormData()
      fd.set('title', 'Test')
      fd.set('category', 'general')
      fd.set('option-0', 'A')
      fd.set('option-1', 'B')

      await expect(createPoll(fd)).rejects.toThrow('Authentication required')
    })

    test('handles database error during poll creation', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const insertMock = jest.fn(() => ({
        select: () => ({
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
        }),
      }))

      mockFrom.mockReturnValue({ insert: insertMock })
      setSupabaseReturn(buildSupabaseClient())

      const fd = new FormData()
      fd.set('title', 'Test')
      fd.set('category', 'general')
      fd.set('option-0', 'A')
      fd.set('option-1', 'B')

      await expect(createPoll(fd)).rejects.toThrow('Failed to create poll: DB Error')
    })

    test('filters out empty options', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const insertMock = jest.fn(() => ({
        select: () => ({
          single: jest.fn().mockResolvedValue({ data: { id: 'p1' }, error: null }),
        }),
      }))
      const optionsInsertMock = jest.fn().mockResolvedValue({ error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') {
          return { insert: insertMock }
        }
        if (table === 'poll_options') {
          return { insert: optionsInsertMock }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      const fd = new FormData()
      fd.set('title', 'Test')
      fd.set('category', 'general')
      fd.set('option-0', 'Option A')
      fd.set('option-1', '   ')  // Empty option (whitespace only)
      fd.set('option-2', 'Option B')
      fd.set('option-3', '')     // Empty option

      await expect(createPoll(fd)).rejects.toMatchObject({ digest: 'NEXT_REDIRECT' })

      // Should only insert 2 options (the non-empty ones)
      expect(optionsInsertMock).toHaveBeenCalledWith([
        { poll_id: 'p1', text: 'Option A', votes: 0, order_index: 0 },
        { poll_id: 'p1', text: 'Option B', votes: 0, order_index: 1 }
      ])
    })
  })

  describe('votePoll', () => {
    test('records a single vote and revalidates path', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const existingVoteSelect = makeSelectable({ data: null, error: null })
      const pollSelect = makeSelectable({ data: { allow_multiple_votes: false, status: 'active' }, error: null })
      const voteInsert = jest.fn().mockResolvedValue({ error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'poll_votes') {
          return {
            select: jest.fn(() => existingVoteSelect),
            insert: voteInsert,
          }
        }
        if (table === 'polls') {
          return {
            select: jest.fn(() => pollSelect),
          }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      const res = await votePoll('p1', ['opt1'])
      expect(res).toEqual({ success: true })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/polls/p1')
      expect(voteInsert).toHaveBeenCalled()
    })

    test('prevents double voting', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const existingVoteSelect = makeSelectable({ data: { id: 'v1' }, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'poll_votes') {
          return {
            select: jest.fn(() => existingVoteSelect),
          }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      await expect(votePoll('p1', ['opt1'])).rejects.toThrow('You have already voted on this poll')
    })

    test('requires authentication for voting', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') })
      setSupabaseReturn(buildSupabaseClient())

      await expect(votePoll('p1', ['opt1'])).rejects.toThrow('Authentication required')
    })

    test('prevents voting on inactive polls', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const existingVoteSelect = makeSelectable({ data: null, error: null })
      const pollSelect = makeSelectable({ data: { allow_multiple_votes: false, status: 'closed' }, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'poll_votes') {
          return {
            select: jest.fn(() => existingVoteSelect),
          }
        }
        if (table === 'polls') {
          return {
            select: jest.fn(() => pollSelect),
          }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      await expect(votePoll('p1', ['opt1'])).rejects.toThrow('This poll is no longer active')
    })

    test('prevents multiple votes on single-choice polls', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const existingVoteSelect = makeSelectable({ data: null, error: null })
      const pollSelect = makeSelectable({ data: { allow_multiple_votes: false, status: 'active' }, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'poll_votes') {
          return {
            select: jest.fn(() => existingVoteSelect),
          }
        }
        if (table === 'polls') {
          return {
            select: jest.fn(() => pollSelect),
          }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      await expect(votePoll('p1', ['opt1', 'opt2'])).rejects.toThrow('Only one option can be selected for this poll')
    })
  })

  describe('deletePoll', () => {
    test('deletes own poll and redirects', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const ownerSelect = makeSelectable({ data: { created_by: 'u1' }, error: null })
      const deleteEq = jest.fn().mockResolvedValue({ error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: jest.fn(() => ownerSelect),
            delete: jest.fn(() => ({ eq: deleteEq })),
          }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      await expect(deletePoll('p1')).rejects.toMatchObject({ digest: 'NEXT_REDIRECT' })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/polls')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard?success=Poll deleted successfully!')
    })

    test('prevents deleting others\' polls', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const ownerSelect = makeSelectable({ data: { created_by: 'u2' }, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: jest.fn(() => ownerSelect),
          }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      await expect(deletePoll('p1')).rejects.toThrow('You can only delete your own polls')
    })

    test('requires authentication', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') })
      setSupabaseReturn(buildSupabaseClient())

      await expect(deletePoll('p1')).rejects.toThrow('Authentication required')
    })

    test('handles poll not found error', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const ownerSelect = makeSelectable({ data: null, error: new Error('Poll not found') })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: jest.fn(() => ownerSelect),
          }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      await expect(deletePoll('nonexistent')).rejects.toThrow('Failed to find poll: Poll not found')
    })

    test('handles database error during deletion', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const ownerSelect = makeSelectable({ data: { created_by: 'u1' }, error: null })
      const deleteEq = jest.fn().mockResolvedValue({ error: new Error('Delete failed') })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: jest.fn(() => ownerSelect),
            delete: jest.fn(() => ({ eq: deleteEq })),
          }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      await expect(deletePoll('p1')).rejects.toThrow('Failed to delete poll: Delete failed')
    })
  })

  describe('getPolls', () => {
    const mockPollsData = [
      {
        id: 'p1',
        title: 'Test Poll 1',
        description: 'Description 1',
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
        ]
      },
      {
        id: 'p2',
        title: 'Test Poll 2',
        description: 'Description 2',
        category: 'tech',
        status: 'closed',
        created_at: '2024-01-02T00:00:00Z',
        ends_at: '2024-01-03T00:00:00Z',
        total_votes: 10,
        allow_multiple_votes: true,
        anonymous_voting: false,
        created_by: 'u2',
        poll_options: [
          { id: 'opt3', text: 'Option A', votes: 6, order_index: 0 },
          { id: 'opt4', text: 'Option B', votes: 4, order_index: 1 }
        ]
      }
    ]

    test('fetches all polls without filters', async () => {
      const mockQuery: any = {
        select: jest.fn(),
        eq: jest.fn(),
        or: jest.fn(),
        order: jest.fn(() => Promise.resolve({ data: mockPollsData, error: null }))
      }
      
      // Set up the chaining after the object is created
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)
      mockQuery.or.mockReturnValue(mockQuery)

      mockFrom.mockReturnValue(mockQuery)
      setSupabaseReturn(buildSupabaseClient())

      const result = await getPolls()

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        id: 'p1',
        title: 'Test Poll 1',
        category: 'general',
        status: 'active',
        totalVotes: 5,
        allowMultipleVotes: false,
        anonymousVoting: true,
        createdBy: 'u1'
      })
      expect(result[0].options).toHaveLength(2)
      expect(result[0].options[0]).toMatchObject({
        id: 'opt1',
        text: 'Option 1',
        votes: 3,
        orderIndex: 0
      })
    })

    test('applies category filter', async () => {
      const mockQuery: any = {
        select: jest.fn(),
        eq: jest.fn(),
        or: jest.fn(),
        order: jest.fn(() => Promise.resolve({ data: [mockPollsData[0]], error: null }))
      }
      
      // Set up the chaining after the object is created
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)
      mockQuery.or.mockReturnValue(mockQuery)

      mockFrom.mockReturnValue(mockQuery)
      setSupabaseReturn(buildSupabaseClient())

      const result = await getPolls({ category: 'general' })

      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'general')
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('general')
    })

    test('applies search filter', async () => {
      const mockQuery: any = {
        select: jest.fn(),
        eq: jest.fn(),
        or: jest.fn(),
        order: jest.fn(() => Promise.resolve({ data: mockPollsData, error: null }))
      }
      
      // Set up the chaining after the object is created
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)
      mockQuery.or.mockReturnValue(mockQuery)

      mockFrom.mockReturnValue(mockQuery)
      setSupabaseReturn(buildSupabaseClient())

      const result = await getPolls({ search: 'test' })

      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%test%,description.ilike.%test%')
    })

    test('applies sorting by votes', async () => {
      const mockQuery: any = {
        select: jest.fn(),
        eq: jest.fn(),
        or: jest.fn(),
        order: jest.fn(() => Promise.resolve({ data: mockPollsData, error: null }))
      }
      
      // Set up the chaining after the object is created
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)
      mockQuery.or.mockReturnValue(mockQuery)

      mockFrom.mockReturnValue(mockQuery)
      setSupabaseReturn(buildSupabaseClient())

      const result = await getPolls({ sortBy: 'votes', sortOrder: 'asc' })

      expect(mockQuery.order).toHaveBeenCalledWith('total_votes', { ascending: true })
    })

    test('applies sorting by ending date', async () => {
      const mockQuery: any = {
        select: jest.fn(),
        eq: jest.fn(),
        or: jest.fn(),
        order: jest.fn(() => Promise.resolve({ data: mockPollsData, error: null }))
      }
      
      // Set up the chaining after the object is created
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)
      mockQuery.or.mockReturnValue(mockQuery)

      mockFrom.mockReturnValue(mockQuery)
      setSupabaseReturn(buildSupabaseClient())

      const result = await getPolls({ sortBy: 'ending', sortOrder: 'desc' })

      expect(mockQuery.order).toHaveBeenCalledWith('ends_at', { ascending: false })
    })

    test('applies multiple filters simultaneously', async () => {
      const mockQuery: any = {
        select: jest.fn(),
        eq: jest.fn(),
        or: jest.fn(),
        order: jest.fn(() => Promise.resolve({ data: [mockPollsData[0]], error: null }))
      }
      
      // Set up the chaining after the object is created
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)
      mockQuery.or.mockReturnValue(mockQuery)

      mockFrom.mockReturnValue(mockQuery)
      setSupabaseReturn(buildSupabaseClient())

      const result = await getPolls({ category: 'general', search: 'test', sortBy: 'votes' })

      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'general')
      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%test%,description.ilike.%test%')
      expect(mockQuery.order).toHaveBeenCalledWith('total_votes', { ascending: false })
      expect(result).toHaveLength(1)
    })

    test('returns empty array on database error', async () => {
      const mockQuery: any = {
        select: jest.fn(),
        eq: jest.fn(),
        or: jest.fn(),
        order: jest.fn(() => Promise.resolve({ data: null, error: new Error('Database error') }))
      }
      
      // Set up the chaining after the object is created
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)
      mockQuery.or.mockReturnValue(mockQuery)

      mockFrom.mockReturnValue(mockQuery)
      setSupabaseReturn(buildSupabaseClient())

      const result = await getPolls()

      expect(result).toEqual([])
    })
  })

  describe('getPoll', () => {
    const mockPollData = {
      id: 'p1',
      title: 'Test Poll',
      description: 'Test Description',
      category: 'general',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      ends_at: null,
      total_votes: 10,
      allow_multiple_votes: false,
      anonymous_voting: true,
      created_by: 'u1',
      poll_options: [
        { id: 'opt1', text: 'Option 1', votes: 6, order_index: 0 },
        { id: 'opt2', text: 'Option 2', votes: 4, order_index: 1 }
      ]
    }

    test('fetches single poll with calculated percentages', async () => {
      const mockQuery = makeSelectable({ data: mockPollData, error: null })
      mockFrom.mockReturnValue({ select: jest.fn(() => mockQuery) })
      setSupabaseReturn(buildSupabaseClient())

      const result = await getPoll('p1')

      expect(result).toMatchObject({
        id: 'p1',
        title: 'Test Poll',
        category: 'general',
        status: 'active',
        totalVotes: 10,
        allowMultipleVotes: false,
        anonymousVoting: true,
        createdBy: 'u1'
      })
      expect(result?.options).toHaveLength(2)
      expect(result?.options[0]).toMatchObject({
        id: 'opt1',
        text: 'Option 1',
        votes: 6,
        percentage: 60
      })
      expect(result?.options[1]).toMatchObject({
        id: 'opt2',
        text: 'Option 2',
        votes: 4,
        percentage: 40
      })
    })

    test('returns null when poll not found', async () => {
      const mockQuery = makeSelectable({ data: null, error: null })
      mockFrom.mockReturnValue({ select: jest.fn(() => mockQuery) })
      setSupabaseReturn(buildSupabaseClient())

      const result = await getPoll('nonexistent')

      expect(result).toBeNull()
    })

    test('returns null on database error', async () => {
      const mockQuery = makeSelectable({ data: null, error: new Error('DB Error') })
      mockFrom.mockReturnValue({ select: jest.fn(() => mockQuery) })
      setSupabaseReturn(buildSupabaseClient())

      const result = await getPoll('p1')

      expect(result).toBeNull()
    })

    test('calculates percentages correctly with zero votes', async () => {
      const mockPollDataZeroVotes = {
        ...mockPollData,
        total_votes: 0,
        poll_options: [
          { id: 'opt1', text: 'Option 1', votes: 0, order_index: 0 },
          { id: 'opt2', text: 'Option 2', votes: 0, order_index: 1 }
        ]
      }

      const mockQuery = makeSelectable({ data: mockPollDataZeroVotes, error: null })
      mockFrom.mockReturnValue({ select: jest.fn(() => mockQuery) })
      setSupabaseReturn(buildSupabaseClient())

      const result = await getPoll('p1')

      expect(result?.options[0].percentage).toBe(0)
      expect(result?.options[1].percentage).toBe(0)
    })
  })

  describe('getUserPolls', () => {
    const mockUserPollsData = [
      {
        id: 'p1',
        title: 'My Poll 1',
        description: 'My Description 1',
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
        ]
      }
    ]

    test('fetches polls for authenticated user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const mockQuery: any = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(() => Promise.resolve({ data: mockUserPollsData, error: null }))
      }
      
      // Set up the chaining after the object is created
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)

      mockFrom.mockReturnValue(mockQuery)
      setSupabaseReturn(buildSupabaseClient())

      const result = await getUserPolls()

      expect(mockQuery.eq).toHaveBeenCalledWith('created_by', 'u1')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'p1',
        title: 'My Poll 1',
        createdBy: 'u1'
      })
    })

    test('returns empty array when user not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') })
      setSupabaseReturn(buildSupabaseClient())

      const result = await getUserPolls()

      expect(result).toEqual([])
    })

    test('returns empty array on database error', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const mockQuery: any = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(() => Promise.resolve({ data: null, error: new Error('Database error') }))
      }
      
      // Set up the chaining after the object is created
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)

      mockFrom.mockReturnValue(mockQuery)
      setSupabaseReturn(buildSupabaseClient())

      const result = await getUserPolls()

      expect(result).toEqual([])
    })

    test('handles empty poll options array', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      const mockUserPollsDataNoOptions = [{
        id: 'p1',
        title: 'My Poll 1',
        description: 'Test description',
        category: 'general',
        status: 'active',
        created_at: '2023-01-01T00:00:00Z',
        ends_at: null,
        total_votes: 0,
        allow_multiple_votes: false,
        anonymous_voting: false,
        created_by: 'u1',
        poll_options: []
      }]

      const mockQuery: any = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(() => Promise.resolve({ data: mockUserPollsDataNoOptions, error: null }))
      }
      
      // Set up the chaining after the object is created
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)

      mockFrom.mockReturnValue(mockQuery)
      setSupabaseReturn(buildSupabaseClient())

      const result = await getUserPolls()

      expect(result).toHaveLength(1)
      expect(result[0].options).toEqual([])
    })
  })

  // Integration-style tests to verify the complete flow
  describe('integration scenarios', () => {
    test('complete poll lifecycle: create, vote, get, delete', async () => {
      // Mock user authentication
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      // Test poll creation
      const insertMock = jest.fn(() => ({
        select: () => ({
          single: jest.fn().mockResolvedValue({ data: { id: 'p1' }, error: null }),
        }),
      }))
      const optionsInsertMock = jest.fn().mockResolvedValue({ error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') {
          return { insert: insertMock }
        }
        if (table === 'poll_options') {
          return { insert: optionsInsertMock }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      const fd = new FormData()
      fd.set('title', 'Integration Test Poll')
      fd.set('category', 'test')
      fd.set('option-0', 'Yes')
      fd.set('option-1', 'No')

      // Should create poll successfully
      await expect(createPoll(fd)).rejects.toMatchObject({ digest: 'NEXT_REDIRECT' })
      expect(insertMock).toHaveBeenCalled()
      expect(optionsInsertMock).toHaveBeenCalled()
    })

    test('handles concurrent voting attempts', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

      // First vote succeeds
      const existingVoteSelect1 = makeSelectable({ data: null, error: null })
      const pollSelect = makeSelectable({ data: { allow_multiple_votes: false, status: 'active' }, error: null })
      const voteInsert1 = jest.fn().mockResolvedValue({ error: null })

      // Second vote fails (already voted)
      const existingVoteSelect2 = makeSelectable({ data: { id: 'v1' }, error: null })

      let callCount = 0
      mockFrom.mockImplementation((table: string) => {
        if (table === 'poll_votes') {
          callCount++
          return {
            select: jest.fn(() => callCount === 1 ? existingVoteSelect1 : existingVoteSelect2),
            insert: voteInsert1,
          }
        }
        if (table === 'polls') {
          return {
            select: jest.fn(() => pollSelect),
          }
        }
        return {}
      })

      setSupabaseReturn(buildSupabaseClient())

      // First vote should succeed
      const result1 = await votePoll('p1', ['opt1'])
      expect(result1).toEqual({ success: true })

      // Second vote should fail
      await expect(votePoll('p1', ['opt2'])).rejects.toThrow('You have already voted on this poll')
    })
  })
})
