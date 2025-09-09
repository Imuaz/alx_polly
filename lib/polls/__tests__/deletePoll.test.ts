import { deletePoll } from '@/lib/polls/actions'
import {
  setupCommonMocks,
  makeSelectable,
  mockFrom,
  mockAuthNone,
} from '@/lib/__mocks__/test-utils'

// Import mocked functions
const { redirect } = require('next/navigation')
const { revalidatePath } = require('next/cache')

describe('deletePoll', () => {
  beforeEach(() => {
    setupCommonMocks()
  })

  describe('successful deletion', () => {
    test('deletes own poll and redirects', async () => {
      // Arrange
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

      // Act & Assert
      await expect(deletePoll('p1')).rejects.toMatchObject({ digest: 'NEXT_REDIRECT' })
      
      expect(deleteEq).toHaveBeenCalledWith('id', 'p1')
      expect(revalidatePath).toHaveBeenCalledWith('/polls')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(redirect).toHaveBeenCalledWith('/dashboard?success=Poll deleted successfully!')
    })
  })

  describe('authorization errors', () => {
    test('prevents deleting others\' polls', async () => {
      // Arrange - Poll owned by different user
      const ownerSelect = makeSelectable({ data: { created_by: 'u2' }, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: jest.fn(() => ownerSelect),
          }
        }
        return {}
      })

      // Act & Assert
      await expect(deletePoll('p1')).rejects.toThrow('You can only delete your own polls')
    })

    test('requires authentication', async () => {
      mockAuthNone()

      await expect(deletePoll('p1')).rejects.toThrow('Authentication required')
    })
  })

  describe('database errors', () => {
    test('handles poll not found error', async () => {
      // Arrange
      const ownerSelect = makeSelectable({ data: null, error: new Error('Poll not found') })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: jest.fn(() => ownerSelect),
          }
        }
        return {}
      })

      // Act & Assert
      await expect(deletePoll('nonexistent')).rejects.toThrow('Failed to find poll: Poll not found')
    })

    test('handles poll not found (null data)', async () => {
      // Arrange
      const ownerSelect = makeSelectable({ data: null, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: jest.fn(() => ownerSelect),
          }
        }
        return {}
      })

      // Act & Assert
      await expect(deletePoll('nonexistent')).rejects.toThrow('Poll not found')
    })

    test('handles database error during deletion', async () => {
      // Arrange
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

      // Act & Assert
      await expect(deletePoll('p1')).rejects.toThrow('Failed to delete poll: Delete failed')
    })
  })
})
