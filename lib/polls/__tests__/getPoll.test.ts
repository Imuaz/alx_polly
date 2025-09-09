import { getPoll } from '@/lib/polls/actions'
import {
  setupCommonMocks,
  makeSelectable,
  mockFrom,
  createMockPoll,
} from '@/lib/__mocks__/test-utils'

describe('getPoll', () => {
  beforeEach(() => {
    setupCommonMocks()
  })

  describe('successful data fetching', () => {
    test('fetches single poll with calculated percentages', async () => {
      // Arrange
      const mockPollData = createMockPoll({
        total_votes: 10,
        poll_options: [
          { id: 'opt1', text: 'Option 1', votes: 6, order_index: 0 },
          { id: 'opt2', text: 'Option 2', votes: 4, order_index: 1 }
        ]
      })
      const mockQuery = makeSelectable({ data: mockPollData, error: null })
      mockFrom.mockReturnValue({ select: jest.fn(() => mockQuery) })

      // Act
      const result = await getPoll('p1')

      // Assert
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

    test('calculates percentages correctly with zero votes', async () => {
      // Arrange
      const mockPollData = createMockPoll({
        total_votes: 0,
        poll_options: [
          { id: 'opt1', text: 'Option 1', votes: 0, order_index: 0 },
          { id: 'opt2', text: 'Option 2', votes: 0, order_index: 1 }
        ]
      })
      const mockQuery = makeSelectable({ data: mockPollData, error: null })
      mockFrom.mockReturnValue({ select: jest.fn(() => mockQuery) })

      // Act
      const result = await getPoll('p1')

      // Assert
      expect(result?.options[0].percentage).toBe(0)
      expect(result?.options[1].percentage).toBe(0)
    })

    test('handles polls with no options', async () => {
      // Arrange
      const mockPollData = createMockPoll({
        poll_options: []
      })
      const mockQuery = makeSelectable({ data: mockPollData, error: null })
      mockFrom.mockReturnValue({ select: jest.fn(() => mockQuery) })

      // Act
      const result = await getPoll('p1')

      // Assert
      expect(result?.options).toEqual([])
    })
  })

  describe('error handling', () => {
    test('returns null when poll not found', async () => {
      // Arrange
      const mockQuery = makeSelectable({ data: null, error: null })
      mockFrom.mockReturnValue({ select: jest.fn(() => mockQuery) })

      // Act
      const result = await getPoll('nonexistent')

      // Assert
      expect(result).toBeNull()
    })

    test('returns null on database error', async () => {
      // Arrange
      const mockQuery = makeSelectable({ data: null, error: new Error('DB Error') })
      mockFrom.mockReturnValue({ select: jest.fn(() => mockQuery) })

      // Act
      const result = await getPoll('p1')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('data transformation', () => {
    test('transforms database fields to camelCase', async () => {
      // Arrange
      const mockPollData = {
        id: 'p1',
        title: 'Test Poll',
        description: 'Test Description',
        category: 'tech',
        status: 'closed',
        created_at: '2024-01-01T00:00:00Z',
        ends_at: '2024-12-31T23:59:59Z',
        total_votes: 15,
        allow_multiple_votes: true,
        anonymous_voting: false,
        created_by: 'u2',
        poll_options: [
          { id: 'opt1', text: 'Yes', votes: 10, order_index: 0 },
          { id: 'opt2', text: 'No', votes: 5, order_index: 1 }
        ]
      }
      const mockQuery = makeSelectable({ data: mockPollData, error: null })
      mockFrom.mockReturnValue({ select: jest.fn(() => mockQuery) })

      // Act
      const result = await getPoll('p1')

      // Assert
      expect(result).toMatchObject({
        id: 'p1',
        title: 'Test Poll',
        description: 'Test Description',
        category: 'tech',
        status: 'closed',
        createdAt: '2024-01-01T00:00:00Z',
        endsAt: '2024-12-31T23:59:59Z',
        totalVotes: 15,
        allowMultipleVotes: true,
        anonymousVoting: false,
        createdBy: 'u2'
      })
      expect(result?.options[0]).toMatchObject({
        id: 'opt1',
        text: 'Yes',
        votes: 10,
        orderIndex: 0,
        percentage: 66.67
      })
    })

    test('rounds percentages to 2 decimal places', async () => {
      // Arrange
      const mockPollData = createMockPoll({
        total_votes: 3,
        poll_options: [
          { id: 'opt1', text: 'Option 1', votes: 1, order_index: 0 },
          { id: 'opt2', text: 'Option 2', votes: 2, order_index: 1 }
        ]
      })
      const mockQuery = makeSelectable({ data: mockPollData, error: null })
      mockFrom.mockReturnValue({ select: jest.fn(() => mockQuery) })

      // Act
      const result = await getPoll('p1')

      // Assert
      expect(result?.options[0].percentage).toBe(33.33)
      expect(result?.options[1].percentage).toBe(66.67)
    })
  })

  describe('query construction', () => {
    test('constructs correct query with poll ID', async () => {
      // Arrange
      const mockQuery = makeSelectable({ data: null, error: null })
      const selectSpy = jest.fn(() => mockQuery)
      mockFrom.mockReturnValue({ select: selectSpy })

      // Act
      await getPoll('test-poll-id')

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
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-poll-id')
    })
  })
})
