import { getUserPolls } from '@/lib/polls/actions'
import {
  setupCommonMocks,
  buildMockQuery,
  mockFrom,
  mockAuthNone,
  createMockPoll,
} from '@/lib/__mocks__/test-utils'

describe('getUserPolls', () => {
  beforeEach(() => {
    setupCommonMocks()
  })

  describe('successful data fetching', () => {
    test('fetches polls for authenticated user', async () => {
      // Arrange
      const mockUserPollsData = [createMockPoll({
        id: 'p1',
        title: 'My Poll 1',
        description: 'My Description 1',
        created_by: 'u1'
      })]
      
      const mockQuery = buildMockQuery(mockUserPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getUserPolls()

      // Assert
      expect(mockQuery.eq).toHaveBeenCalledWith('created_by', 'u1')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'p1',
        title: 'My Poll 1',
        createdBy: 'u1'
      })
    })

    test('handles empty poll options array', async () => {
      // Arrange
      const mockUserPollsData = [createMockPoll({
        poll_options: []
      })]
      
      const mockQuery = buildMockQuery(mockUserPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getUserPolls()

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].options).toEqual([])
    })

    test('returns multiple user polls in correct order', async () => {
      // Arrange
      const mockUserPollsData = [
        createMockPoll({
          id: 'p1',
          title: 'Latest Poll',
          created_at: '2024-01-02T00:00:00Z'
        }),
        createMockPoll({
          id: 'p2', 
          title: 'Older Poll',
          created_at: '2024-01-01T00:00:00Z'
        })
      ]
      
      const mockQuery = buildMockQuery(mockUserPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getUserPolls()

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Latest Poll')
      expect(result[1].title).toBe('Older Poll')
    })
  })

  describe('authentication handling', () => {
    test('returns empty array when user not authenticated', async () => {
      mockAuthNone()

      // Act
      const result = await getUserPolls()

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('error handling', () => {
    test('returns empty array on database error', async () => {
      // Arrange
      const mockQuery = buildMockQuery(null, new Error('Database error'))
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getUserPolls()

      // Assert
      expect(result).toEqual([])
    })

    test('returns empty array when no data returned', async () => {
      // Arrange
      const mockQuery = buildMockQuery(null)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getUserPolls()

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('data transformation', () => {
    test('transforms database fields to camelCase', async () => {
      // Arrange
      const mockUserPollsData = [{
        id: 'p1',
        title: 'User Poll',
        description: 'User Description',
        category: 'personal',
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z',
        ends_at: '2024-12-31T23:59:59Z',
        total_votes: 0,
        allow_multiple_votes: true,
        anonymous_voting: false,
        created_by: 'u1',
        poll_options: [
          { id: 'opt1', text: 'Choice A', votes: 0, order_index: 0 },
          { id: 'opt2', text: 'Choice B', votes: 0, order_index: 1 }
        ]
      }]
      
      const mockQuery = buildMockQuery(mockUserPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getUserPolls()

      // Assert
      expect(result[0]).toMatchObject({
        id: 'p1',
        title: 'User Poll',
        description: 'User Description',
        category: 'personal',
        status: 'draft',
        createdAt: '2024-01-01T00:00:00Z',
        endsAt: '2024-12-31T23:59:59Z',
        totalVotes: 0,
        allowMultipleVotes: true,
        anonymousVoting: false,
        createdBy: 'u1'
      })
      expect(result[0].options[0]).toMatchObject({
        id: 'opt1',
        text: 'Choice A',
        votes: 0,
        orderIndex: 0
      })
    })
  })

  describe('query construction', () => {
    test('constructs correct query for user polls', async () => {
      // Arrange
      const mockQuery = buildMockQuery([])
      const selectSpy = jest.fn().mockReturnValue(mockQuery)
      mockFrom.mockReturnValue({ select: selectSpy })

      // Act
      await getUserPolls()

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('polls')
      expect(selectSpy).toHaveBeenCalledWith(`
        *,
        poll_options (
          id,
          text,
          votes,
          order_index
        )
      `)
      expect(mockQuery.eq).toHaveBeenCalledWith('created_by', 'u1')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })
})
