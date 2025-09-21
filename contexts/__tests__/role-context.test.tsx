import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import {
  RoleProvider,
  useRole,
  usePermissions,
  useIsAdmin,
  useIsModerator,
} from '../role-context'
import { UserRole } from '@/lib/types/roles'
import { updateUserRole } from '@/lib/auth/role-actions'

jest.mock('@/lib/auth/role-actions', () => ({
  updateUserRole: jest.fn(),
}))

describe('RoleContext', () => {
  const userId = 'test-user-id'
  const wrapper = ({ children }: { children: ReactNode }) => (
    <RoleProvider userId={userId} initialRole={UserRole.USER}>
      {children}
    </RoleProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides default role and permissions', () => {
    const { result } = renderHook(() => useRole(), { wrapper })

    expect(result.current.userRole).toBe(UserRole.USER)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isModerator).toBe(false)
    expect(result.current.permissions.canCreatePolls).toBe(true)
    expect(result.current.permissions.canManageUsers).toBe(false)
  })

  it('correctly identifies admin roles', () => {
    const adminWrapper = ({ children }: { children: ReactNode }) => (
      <RoleProvider userId={userId} initialRole={UserRole.ADMIN}>
        {children}
      </RoleProvider>
    )

    const { result } = renderHook(() => useRole(), { wrapper: adminWrapper })

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.permissions.canManageUsers).toBe(true)
  })

  it('handles role updates', async () => {
    ;(updateUserRole as jest.Mock).mockResolvedValue(undefined)
    
    const { result } = renderHook(() => useRole(), { wrapper })

    await act(async () => {
      await result.current.updateRole(userId, UserRole.MODERATOR)
    })

    expect(updateUserRole).toHaveBeenCalledWith(userId, UserRole.MODERATOR)
    expect(result.current.userRole).toBe(UserRole.MODERATOR)
    expect(result.current.isModerator).toBe(true)
  })

  it('provides permission checking', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.hasPermission('canCreatePolls')).toBe(true)
    expect(result.current.hasPermission('canManageUsers')).toBe(false)
  })

  it('provides role-specific hooks', () => {
    const { result: adminResult } = renderHook(() => useIsAdmin(), {
      wrapper: ({ children }) => (
        <RoleProvider userId={userId} initialRole={UserRole.ADMIN}>
          {children}
        </RoleProvider>
      ),
    })

    const { result: moderatorResult } = renderHook(() => useIsModerator(), {
      wrapper: ({ children }) => (
        <RoleProvider userId={userId} initialRole={UserRole.MODERATOR}>
          {children}
        </RoleProvider>
      ),
    })

    expect(adminResult.current).toBe(true)
    expect(moderatorResult.current).toBe(true)
  })

  it('handles role update errors', async () => {
    const error = new Error('Update failed')
    ;(updateUserRole as jest.Mock).mockRejectedValue(error)

    const { result } = renderHook(() => useRole(), { wrapper })

    try {
      await act(async () => {
        await result.current.updateRole(userId, UserRole.MODERATOR)
      })
    } catch (e) {
      expect(e).toBe(error)
    }

    // Role should not change if update fails
    expect(result.current.userRole).toBe(UserRole.USER)
  })

  it('only updates local state for own user', async () => {
    ;(updateUserRole as jest.Mock).mockResolvedValue(undefined)
    
    const { result } = renderHook(() => useRole(), { wrapper })

    const otherUserId = 'other-user-id'
    await act(async () => {
      await result.current.updateRole(otherUserId, UserRole.MODERATOR)
    })

    expect(updateUserRole).toHaveBeenCalledWith(otherUserId, UserRole.MODERATOR)
    // Local state should not change when updating other users
    expect(result.current.userRole).toBe(UserRole.USER)
  })
})