import { votePoll } from '@/lib/polls/actions'
import {
  setupCommonMocks,
  makeSelectable,
  mockFrom,
  mockAuthNone,
} from '@/lib/__mocks__/test-utils'

// Import mocked functions
const { revalidatePath } = require('next/cache')

describe('votePoll', () => {
  beforeEach(() => {
    setupCommonMocks()
  })

  describe('successful voting', () => {
    test('records a single vote and revalidates path', async () => {
      // Arrange
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

      // Act
      const result = await votePoll('p1', ['opt1'])

      // Assert
      expect(result).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith('/polls/p1')
      expect(voteInsert).toHaveBeenCalledWith([
        { poll_id: 'p1', option_id: 'opt1', user_id: 'u1' }
      ])
    })

    test('allows multiple votes on multiple-choice polls', async () => {
      // Arrange
      const existingVoteSelect = makeSelectable({ data: null, error: null })
      const pollSelect = makeSelectable({ data: { allow_multiple_votes: true, status: 'active' }, error: null })
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

      // Act
      const result = await votePoll('p1', ['opt1', 'opt2'])

      // Assert
      expect(result).toEqual({ success: true })
      expect(voteInsert).toHaveBeenCalledWith([
        { poll_id: 'p1', option_id: 'opt1', user_id: 'u1' },
        { poll_id: 'p1', option_id: 'opt2', user_id: 'u1' }
      ])
    })
  })

  describe('validation errors', () => {
    test('prevents double voting', async () => {
      // Arrange
      const existingVoteSelect = makeSelectable({ data: { id: 'v1' }, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'poll_votes') {
          return {
            select: jest.fn(() => existingVoteSelect),
          }
        }
        return {}
      })

      // Act & Assert
      await expect(votePoll('p1', ['opt1'])).rejects.toThrow('You have already voted on this poll')
    })

    test('prevents multiple votes on single-choice polls', async () => {
      // Arrange
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

      // Act & Assert
      await expect(votePoll('p1', ['opt1', 'opt2'])).rejects.toThrow('Only one option can be selected for this poll')
    })

    test('prevents voting on inactive polls', async () => {
      // Arrange
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

      // Act & Assert
      await expect(votePoll('p1', ['opt1'])).rejects.toThrow('This poll is no longer active')
    })

    test('requires at least one option', async () => {
      // Act & Assert
      await expect(votePoll('p1', [])).rejects.toThrow('At least one option must be selected')
    })
  })

  describe('authentication errors', () => {
    test('requires authentication for voting', async () => {
      mockAuthNone()

      await expect(votePoll('p1', ['opt1'])).rejects.toThrow('Authentication required')
    })
  })

  describe('database errors', () => {
    test('handles poll lookup error', async () => {
      // Arrange
      const existingVoteSelect = makeSelectable({ data: null, error: null })
      const pollSelect = makeSelectable({ data: null, error: new Error('Poll not found') })

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

      // Act & Assert
      await expect(votePoll('p1', ['opt1'])).rejects.toThrow('Failed to check poll status: Poll not found')
    })

    test('handles vote insertion error', async () => {
      // Arrange
      const existingVoteSelect = makeSelectable({ data: null, error: null })
      const pollSelect = makeSelectable({ data: { allow_multiple_votes: false, status: 'active' }, error: null })
      const voteInsert = jest.fn().mockResolvedValue({ error: new Error('Insert failed') })

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

      // Act & Assert
      await expect(votePoll('p1', ['opt1'])).rejects.toThrow('Failed to record vote: Insert failed')
    })
  })
})
