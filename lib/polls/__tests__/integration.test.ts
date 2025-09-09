import { createPoll, votePoll, deletePoll } from '@/lib/polls/actions'
import {
  setupCommonMocks,
  buildPollFormData,
  buildInsertMock,
  makeSelectable,
  mockFrom,
} from '@/lib/__mocks__/test-utils'

// Import mocked functions
const { revalidatePath } = require('next/cache')

describe('integration scenarios', () => {
  beforeEach(() => {
    setupCommonMocks()
  })

  describe('complete poll lifecycle', () => {
    test('create, vote, and delete poll successfully', async () => {
      // Test poll creation
      const insertMock = buildInsertMock({ id: 'p1' })
      const optionsInsertMock = jest.fn().mockResolvedValue({ error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') return { insert: insertMock }
        if (table === 'poll_options') return { insert: optionsInsertMock }
        return {}
      })

      const formData = buildPollFormData({
        title: 'Integration Test Poll',
        category: 'test',
        options: ['Yes', 'No']
      })

      // Should create poll successfully
      await expect(createPoll(formData)).rejects.toMatchObject({ digest: 'NEXT_REDIRECT' })
      expect(insertMock).toHaveBeenCalled()
      expect(optionsInsertMock).toHaveBeenCalledWith([
        { poll_id: 'p1', text: 'Yes', votes: 0, order_index: 0 },
        { poll_id: 'p1', text: 'No', votes: 0, order_index: 1 }
      ])
    })
  })

  describe('concurrent voting scenarios', () => {
    test('handles concurrent voting attempts', async () => {
      // First vote succeeds
      const existingVoteSelect1 = makeSelectable({ data: null, error: null })
      const pollSelect = makeSelectable({ 
        data: { allow_multiple_votes: false, status: 'active' }, 
        error: null 
      })
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

      // First vote should succeed
      const result1 = await votePoll('p1', ['opt1'])
      expect(result1).toEqual({ success: true })

      // Second vote should fail
      await expect(votePoll('p1', ['opt2'])).rejects.toThrow('You have already voted on this poll')
    })

    test('handles multiple users voting on same poll', async () => {
      const existingVoteSelect = makeSelectable({ data: null, error: null })
      const pollSelect = makeSelectable({ 
        data: { allow_multiple_votes: false, status: 'active' }, 
        error: null 
      })
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

      // Both users should be able to vote
      const result1 = await votePoll('p1', ['opt1'])
      const result2 = await votePoll('p1', ['opt2'])

      expect(result1).toEqual({ success: true })
      expect(result2).toEqual({ success: true })
      expect(voteInsert).toHaveBeenCalledTimes(2)
    })
  })

  describe('error recovery scenarios', () => {
    test('handles partial poll creation failure', async () => {
      // Poll creation succeeds but options creation fails
      const insertMock = buildInsertMock({ id: 'p1' })
      const optionsInsertMock = jest.fn().mockResolvedValue({ 
        error: new Error('Options creation failed') 
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') return { insert: insertMock }
        if (table === 'poll_options') return { insert: optionsInsertMock }
        return {}
      })

      const formData = buildPollFormData()

      await expect(createPoll(formData)).rejects.toThrow('Failed to create poll options: Options creation failed')
    })

    test('handles vote on deleted poll', async () => {
      const existingVoteSelect = makeSelectable({ data: null, error: null })
      const pollSelect = makeSelectable({ 
        data: null, 
        error: new Error('Poll not found') 
      })

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

      await expect(votePoll('deleted-poll', ['opt1'])).rejects.toThrow('Failed to check poll status: Poll not found')
    })
  })

  describe('complex workflow scenarios', () => {
    test('multiple choice poll with multiple votes', async () => {
      const existingVoteSelect = makeSelectable({ data: null, error: null })
      const pollSelect = makeSelectable({ 
        data: { allow_multiple_votes: true, status: 'active' }, 
        error: null 
      })
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

      const result = await votePoll('p1', ['opt1', 'opt2', 'opt3'])

      expect(result).toEqual({ success: true })
      expect(voteInsert).toHaveBeenCalledWith([
        { poll_id: 'p1', option_id: 'opt1', user_id: 'u1' },
        { poll_id: 'p1', option_id: 'opt2', user_id: 'u1' },
        { poll_id: 'p1', option_id: 'opt3', user_id: 'u1' }
      ])
      expect(revalidatePath).toHaveBeenCalledWith('/polls/p1')
    })

    test('poll creation with complex options', async () => {
      const insertMock = buildInsertMock({ id: 'complex-poll' })
      const optionsInsertMock = jest.fn().mockResolvedValue({ error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') return { insert: insertMock }
        if (table === 'poll_options') return { insert: optionsInsertMock }
        return {}
      })

      const formData = buildPollFormData({
        title: 'Complex Poll',
        description: 'A poll with many options',
        category: 'survey',
        allowMultipleVotes: true,
        anonymousVoting: true,
        options: [
          'Strongly Agree',
          'Agree', 
          'Neutral',
          'Disagree',
          'Strongly Disagree'
        ]
      })

      await expect(createPoll(formData)).rejects.toMatchObject({ digest: 'NEXT_REDIRECT' })

      expect(optionsInsertMock).toHaveBeenCalledWith([
        { poll_id: 'complex-poll', text: 'Strongly Agree', votes: 0, order_index: 0 },
        { poll_id: 'complex-poll', text: 'Agree', votes: 0, order_index: 1 },
        { poll_id: 'complex-poll', text: 'Neutral', votes: 0, order_index: 2 },
        { poll_id: 'complex-poll', text: 'Disagree', votes: 0, order_index: 3 },
        { poll_id: 'complex-poll', text: 'Strongly Disagree', votes: 0, order_index: 4 }
      ])
    })
  })
})
