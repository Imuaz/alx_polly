import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react'
import { UserManagement } from '../user-management'
import { RoleContext } from '@/contexts/role-context'
import { UserRole, RolePermissions } from '@/lib/types/roles'
import { getUsersWithRoles, updateUserRole } from '@/lib/auth/role-actions'
import '@testing-library/jest-dom'

jest.mock('@/lib/auth/role-actions')

describe('UserManagement Component Integration', () => {
  const defaultPermissions: RolePermissions = {
    canCreatePolls: true,
    canDeletePolls: true,
    canManageUsers: true,
    canModerateComments: true,
    canAccessAdminPanel: true
  }

  const mockRoleContextValue = {
    userRole: UserRole.ADMIN,
    permissions: defaultPermissions,
    isAdmin: true,
    isModerator: false,
    hasPermission: jest.fn().mockReturnValue(true),
    updateRole: jest.fn()
  }

  const mockUsers = [
    { id: '1', name: 'User One', email: 'user1@example.com', role: UserRole.USER },
    { id: '2', name: 'Admin One', email: 'admin1@example.com', role: UserRole.ADMIN },
    { id: '3', name: 'Mod One', email: 'mod1@example.com', role: UserRole.MODERATOR }
  ]

  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <RoleContext.Provider value={mockRoleContextValue}>
        {component}
      </RoleContext.Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getUsersWithRoles as jest.Mock).mockResolvedValue(mockUsers)
  })

  it('should restrict access for non-admin users', async () => {
    const nonAdminContext = {
      ...mockRoleContextValue,
      userRole: UserRole.USER,
      isAdmin: false,
      permissions: { ...defaultPermissions, canManageUsers: false }
    }

    render(
      <RoleContext.Provider value={nonAdminContext}>
        <UserManagement />
      </RoleContext.Provider>
    )

    expect(await screen.findByText(/access denied/i)).toBeInTheDocument()
  })

  it('should handle role updates with confirmation', async () => {
    renderWithContext(<UserManagement />)

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument()
    })

    await act(async () => {
      // Attempt to change user role to admin
      const userRow = await screen.findByTestId('user-row-1')
      const roleSelect = within(userRow).getByRole('combobox')
      fireEvent.click(roleSelect)
      const adminOption = await screen.findByRole('option', { name: /admin/i })
      fireEvent.click(adminOption)
    })

    // Check for confirmation dialog
    await waitFor(async () => {
      expect(await screen.findByRole('dialog')).toBeInTheDocument()
      expect(await screen.findByText(/are you sure/i)).toBeInTheDocument()
    })

    // Confirm the change
    const confirmButton = await screen.findByRole('button', { name: /confirm/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(updateUserRole).toHaveBeenCalledWith('1', UserRole.ADMIN)
      expect(getUsersWithRoles).toHaveBeenCalledTimes(2)
    })
  })

  it('should prevent self-role modification', async () => {
    const currentUserId = '2' // Admin One's ID
    renderWithContext(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Admin One')).toBeInTheDocument()
    })

    // Try to modify admin's own role
    const adminRow = await screen.findByTestId('user-row-2')
    const adminRoleSelect = within(adminRow).getByRole('combobox')
    expect(adminRoleSelect).toBeDisabled()
  })

  it('should filter users by role', async () => {
    renderWithContext(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument()
    })

    await act(async () => {
      // Use role filter
      const filterSelect = await screen.findByRole('combobox', { name: /filter by role/i })
      fireEvent.change(filterSelect, { target: { value: UserRole.ADMIN } })
    })

    // Should only show admin users
    await waitFor(() => {
      expect(screen.queryByText('User One')).not.toBeInTheDocument()
      expect(screen.getByText('Admin One')).toBeInTheDocument()
      expect(screen.queryByText('Mod One')).not.toBeInTheDocument()
    })
  })

  it('should handle errors gracefully', async () => {
    const error = new Error('Failed to fetch users')
    ;(getUsersWithRoles as jest.Mock).mockRejectedValueOnce(error)

    renderWithContext(<UserManagement />)

    await waitFor(async () => {
      expect(await screen.findByText(/failed to fetch users/i)).toBeInTheDocument()
    })

    // Should show retry button
    const retryButton = await screen.findByRole('button', { name: /retry/i })
    ;(getUsersWithRoles as jest.Mock).mockResolvedValueOnce(mockUsers)
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument()
    })
  })

  it('should sort users by name and role', async () => {
    renderWithContext(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument()
    })

    await act(async () => {
      // Toggle name sort
      const nameSortButton = await screen.findByRole('button', { name: /sort by name/i })
      fireEvent.click(nameSortButton)
    })

    let userNames = await screen.findAllByTestId('user-name')
    expect(userNames[0]).toHaveTextContent('Admin One')
    expect(userNames[1]).toHaveTextContent('Mod One')
    expect(userNames[2]).toHaveTextContent('User One')

    await act(async () => {
      // Toggle role sort
      const roleSortButton = await screen.findByRole('button', { name: /sort by role/i })
      fireEvent.click(roleSortButton)
    })

    const roles = await screen.findAllByTestId('user-role')
    expect(roles[0]).toHaveTextContent('Admin')
    expect(roles[1]).toHaveTextContent('Moderator')
    expect(roles[2]).toHaveTextContent('User')
  })
})