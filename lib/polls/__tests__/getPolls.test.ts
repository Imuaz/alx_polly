import { getPolls } from '@/lib/polls/actions'
import {
  setupCommonMocks,
  buildMockQuery,
  mockFrom,
  createMockPolls,
} from '@/lib/__mocks__/test-utils'

describe('getPolls', () => {
  beforeEach(() => {
    setupCommonMocks()
  })

  describe('successful data fetching', () => {
    test('fetches all polls without filters', async () => {
      // Arrange
      const mockPollsData = createMockPolls(2)
      const mockQuery = buildMockQuery(mockPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls()

      // Assert
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
      // Arrange
      const mockPollsData = createMockPolls(1)
      const mockQuery = buildMockQuery(mockPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls({ category: 'general' })

      // Assert
      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'general')
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('general')
    })

    test('applies search filter', async () => {
      // Arrange
      const mockPollsData = createMockPolls(2)
      const mockQuery = buildMockQuery(mockPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls({ search: 'test' })

      // Assert
      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%test%,description.ilike.%test%')
    })

    test('applies sorting by votes descending (default)', async () => {
      // Arrange
      const mockPollsData = createMockPolls(2)
      const mockQuery = buildMockQuery(mockPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls({ sortBy: 'votes' })

      // Assert
      expect(mockQuery.order).toHaveBeenCalledWith('total_votes', { ascending: false })
    })

    test('applies sorting by votes ascending', async () => {
      // Arrange
      const mockPollsData = createMockPolls(2)
      const mockQuery = buildMockQuery(mockPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls({ sortBy: 'votes', sortOrder: 'asc' })

      // Assert
      expect(mockQuery.order).toHaveBeenCalledWith('total_votes', { ascending: true })
    })

    test('applies sorting by ending date', async () => {
      // Arrange
      const mockPollsData = createMockPolls(2)
      const mockQuery = buildMockQuery(mockPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls({ sortBy: 'ending', sortOrder: 'desc' })

      // Assert
      expect(mockQuery.order).toHaveBeenCalledWith('ends_at', { ascending: false })
    })

    test('applies sorting by creation date (default)', async () => {
      // Arrange
      const mockPollsData = createMockPolls(2)
      const mockQuery = buildMockQuery(mockPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls() // No sortBy specified, should default to created_at

      // Assert
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    test('applies multiple filters simultaneously', async () => {
      // Arrange
      const mockPollsData = createMockPolls(1)
      const mockQuery = buildMockQuery(mockPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls({ 
        category: 'general', 
        search: 'test', 
        sortBy: 'votes' 
      })

      // Assert
      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'general')
      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%test%,description.ilike.%test%')
      expect(mockQuery.order).toHaveBeenCalledWith('total_votes', { ascending: false })
      expect(result).toHaveLength(1)
    })
  })

  describe('error handling', () => {
    test('returns empty array on database error', async () => {
      // Arrange
      const mockQuery = buildMockQuery(null, new Error('Database error'))
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls()

      // Assert
      expect(result).toEqual([])
    })

    test('returns empty array when no data returned', async () => {
      // Arrange
      const mockQuery = buildMockQuery(null)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls()

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('data transformation', () => {
    test('transforms database fields to camelCase', async () => {
      // Arrange
      const mockPollsData = [{
        id: 'p1',
        title: 'Test Poll',
        description: 'Test Description',
        category: 'general',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        ends_at: '2024-12-31T23:59:59Z',
        total_votes: 10,
        allow_multiple_votes: true,
        anonymous_voting: false,
        created_by: 'u1',
        poll_options: [
          { id: 'opt1', text: 'Option 1', votes: 5, order_index: 0 }
        ]
      }]
      const mockQuery = buildMockQuery(mockPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls()

      // Assert
      expect(result[0]).toMatchObject({
        id: 'p1',
        title: 'Test Poll',
        description: 'Test Description',
        category: 'general',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        endsAt: '2024-12-31T23:59:59Z',
        totalVotes: 10,
        allowMultipleVotes: true,
        anonymousVoting: false,
        createdBy: 'u1'
      })
      expect(result[0].options[0]).toMatchObject({
        id: 'opt1',
        text: 'Option 1',
        votes: 5,
        orderIndex: 0
      })
    })

    test('handles polls with no options', async () => {
      // Arrange
      const mockPollsData = [{
        id: 'p1',
        title: 'Test Poll',
        description: 'Test Description',
        category: 'general',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        ends_at: null,
        total_votes: 0,
        allow_multiple_votes: false,
        anonymous_voting: true,
        created_by: 'u1',
        poll_options: []
      }]
      const mockQuery = buildMockQuery(mockPollsData)
      mockFrom.mockReturnValue(mockQuery)

      // Act
      const result = await getPolls()

      // Assert
      expect(result[0].options).toEqual([])
    })
  })
})
