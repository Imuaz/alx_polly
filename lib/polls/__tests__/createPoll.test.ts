import { createPoll } from '@/lib/polls/actions'
import {
  setupCommonMocks,
  buildPollFormData,
  buildInsertMock,
  mockFrom,
  mockAuthNone,
} from '@/lib/__mocks__/test-utils'

// Import mocked functions
const { redirect } = require('next/navigation')
const { revalidatePath } = require('next/cache')

describe('createPoll', () => {
  beforeEach(() => {
    setupCommonMocks()
  })

  describe('successful creation', () => {
    test('creates poll and options then redirects on success', async () => {
      // Arrange
      const insertMock = buildInsertMock({ id: 'p1' })
      const optionsInsertMock = jest.fn().mockResolvedValue({ error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') return { insert: insertMock }
        if (table === 'poll_options') return { insert: optionsInsertMock }
        return {}
      })

      const formData = buildPollFormData({
        title: 'My Poll',
        description: 'Desc',
        allowMultipleVotes: true,
        options: ['A', 'B']
      })

      // Act & Assert
      await expect(createPoll(formData)).rejects.toMatchObject({ digest: 'NEXT_REDIRECT' })

      expect(insertMock).toHaveBeenCalledWith({
        title: 'My Poll',
        description: 'Desc',
        category: 'general',
        ends_at: null,
        allow_multiple_votes: true,
        anonymous_voting: false,
        created_by: 'u1'
      })
      expect(optionsInsertMock).toHaveBeenCalledWith([
        { poll_id: 'p1', text: 'A', votes: 0, order_index: 0 },
        { poll_id: 'p1', text: 'B', votes: 0, order_index: 1 }
      ])
      expect(revalidatePath).toHaveBeenCalledWith('/polls')
      expect(redirect).toHaveBeenCalledWith('/polls?success=Poll created successfully!')
    })

    test('filters out empty options', async () => {
      // Arrange
      const insertMock = buildInsertMock({ id: 'p1' })
      const optionsInsertMock = jest.fn().mockResolvedValue({ error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') return { insert: insertMock }
        if (table === 'poll_options') return { insert: optionsInsertMock }
        return {}
      })

      const formData = buildPollFormData({
        options: ['Option A', '   ', 'Option B', ''] // Mixed empty and valid options
      })

      // Act
      await expect(createPoll(formData)).rejects.toMatchObject({ digest: 'NEXT_REDIRECT' })

      // Assert - Should only insert non-empty options
      expect(optionsInsertMock).toHaveBeenCalledWith([
        { poll_id: 'p1', text: 'Option A', votes: 0, order_index: 0 },
        { poll_id: 'p1', text: 'Option B', votes: 0, order_index: 1 }
      ])
    })
  })

  describe('validation errors', () => {
    test('validates required fields', async () => {
      const formData = buildPollFormData({
        title: '',
        options: [] // No options provided
      })

      await expect(createPoll(formData)).rejects.toThrow(
        'Title, category, and at least 2 options are required'
      )
    })

    test('requires at least 2 options', async () => {
      const formData = buildPollFormData({
        options: ['Single Option'] // Only one option
      })

      await expect(createPoll(formData)).rejects.toThrow(
        'Title, category, and at least 2 options are required'
      )
    })
  })

  describe('authentication errors', () => {
    test('requires authentication', async () => {
      mockAuthNone()
      
      const formData = buildPollFormData()

      await expect(createPoll(formData)).rejects.toThrow('Authentication required')
    })
  })

  describe('database errors', () => {
    test('handles database error during poll creation', async () => {
      const insertMock = jest.fn(() => ({
        select: () => ({
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
        }),
      }))

      mockFrom.mockReturnValue({ insert: insertMock })

      const formData = buildPollFormData()

      await expect(createPoll(formData)).rejects.toThrow('Failed to create poll: DB Error')
    })

    test('handles database error during options creation', async () => {
      const insertMock = buildInsertMock({ id: 'p1' })
      const optionsInsertMock = jest.fn().mockResolvedValue({ error: new Error('Options Error') })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') return { insert: insertMock }
        if (table === 'poll_options') return { insert: optionsInsertMock }
        return {}
      })

      const formData = buildPollFormData()

      await expect(createPoll(formData)).rejects.toThrow('Failed to create poll options: Options Error')
    })
  })
})
