import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react'
import { UserManagement } from '../user-management'
import { getUsersWithRoles, updateUserRole } from '@/lib/auth/role-actions'
import { UserRole } from '@/lib/types/roles'
import { RoleContext } from '@/contexts/role-context'
import '@testing-library/jest-dom'

// Mock the role actions
jest.mock('@/lib/auth/role-actions', () => ({
  getUsersWithRoles: jest.fn(),
  updateUserRole: jest.fn()
}))

const mockRoleContextValue = {
  userRole: UserRole.ADMIN,
  permissions: {
    canCreatePolls: true,
    canDeletePolls: true,
    canManageUsers: true,
    canModerateComments: true,
    canAccessAdminPanel: true
  },
  isAdmin: true,
  isModerator: false,
  hasPermission: jest.fn().mockReturnValue(true),
  updateRole: jest.fn()
}

const renderWithRoleContext = (ui: React.ReactElement) => {
  return render(
    <RoleContext.Provider value={mockRoleContextValue}>
      {ui}
    </RoleContext.Provider>
  )
}

describe('UserManagement', () => {
  const mockUsers = [
    {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.USER
    },
    {
      id: '2',
      name: 'Admin User',
      email: 'admin@example.com',
      role: UserRole.ADMIN
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Setup default mock implementation
    ;(getUsersWithRoles as jest.Mock).mockResolvedValue(mockUsers)
  })

  it('should render user list', async () => {
    renderWithRoleContext(<UserManagement />)
    
    // Wait for users to load
    await screen.findByTestId('user-row-1')
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Admin User')).toBeInTheDocument()
  })

  it('should handle role update', async () => {
    ;(updateUserRole as jest.Mock).mockResolvedValue(undefined)
    
    renderWithRoleContext(<UserManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    await act(async () => {
      const userRow = await screen.findByTestId('user-row-1')
      const roleSelect = within(userRow).getByRole('combobox')
      fireEvent.click(roleSelect)

      const moderatorOption = await screen.findByRole('option', { name: /moderator/i })
      fireEvent.click(moderatorOption)
    })

    await waitFor(() => {
      expect(updateUserRole).toHaveBeenCalledWith('1', UserRole.MODERATOR)
    })

    await waitFor(() => {
      expect(getUsersWithRoles).toHaveBeenCalledTimes(2) // Initial load + after update
    })
  })

  it('should handle error states', async () => {
    const errorMessage = 'Failed to load users'
    ;(getUsersWithRoles as jest.Mock).mockRejectedValue(new Error(errorMessage))

    renderWithRoleContext(<UserManagement />)

    await waitFor(async () => {
      expect(await screen.findByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should handle loading states', async () => {
    // Delay the mock response to test loading state
    ;(getUsersWithRoles as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockUsers), 100))
    )

    renderWithRoleContext(<UserManagement />)

    // Check loading state
    expect(await screen.findByRole('status')).toBeInTheDocument()

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })

  it('should disable role select for own user', async () => {
    const currentUserMock = [...mockUsers, {
      id: 'current-user',
      name: 'Current Admin',
      email: 'current@example.com',
      role: UserRole.ADMIN
    }]
    ;(getUsersWithRoles as jest.Mock).mockResolvedValue(currentUserMock)
    mockRoleContextValue.userRole = UserRole.ADMIN

    renderWithRoleContext(<UserManagement />)

    await waitFor(async () => {
      const currentUserRow = await screen.findByTestId('user-row-current-user')
      const roleSelect = within(currentUserRow).getByRole('combobox')
      expect(roleSelect).toBeDisabled()
    })
  })

  it('should show confirmation dialog for admin role changes', async () => {
    renderWithRoleContext(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    await act(async () => {
      // Find and click the role select
      const userRow = await screen.findByTestId('user-row-1')
      const roleSelect = within(userRow).getByRole('combobox')
      fireEvent.click(roleSelect)

      // Select admin role
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
    })
  })

  it('should handle role update errors gracefully', async () => {
    const errorMessage = 'Failed to update role'
    ;(updateUserRole as jest.Mock).mockRejectedValue(new Error(errorMessage))

    renderWithRoleContext(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    await act(async () => {
      // Find and click the role select
      const userRow = await screen.findByTestId('user-row-1')
      const roleSelect = within(userRow).getByRole('combobox')
      fireEvent.click(roleSelect)

      // Select moderator role
      const moderatorOption = await screen.findByRole('option', { name: /moderator/i })
      fireEvent.click(moderatorOption)
    })

    await waitFor(async () => {
      expect(await screen.findByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should filter users by role', async () => {
    renderWithRoleContext(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    await act(async () => {
      // Find and use the role filter
      const filterSelect = await screen.findByRole('combobox', { name: /filter by role/i })
      fireEvent.click(filterSelect)

      // Select admin filter
      const adminOption = await screen.findByRole('option', { name: /admin/i })
      fireEvent.click(adminOption)
    })

    // Should only show admin user
    await waitFor(() => {
      expect(screen.queryByTestId('user-row-1')).not.toBeInTheDocument()
      expect(screen.getByTestId('user-row-2')).toBeInTheDocument()
    })
  })

  it('should sort users by name', async () => {
    const unsortedUsers = [
      { ...mockUsers[1] }, // Admin User
      { ...mockUsers[0] }, // Test User
    ]
    ;(getUsersWithRoles as jest.Mock).mockResolvedValue(unsortedUsers)

    renderWithRoleContext(<UserManagement />)

    await waitFor(async () => {
      const userRows = await screen.findAllByTestId(/user-row-/)
      expect(userRows[0]).toHaveTextContent('Admin User')
      expect(userRows[1]).toHaveTextContent('Test User')
    })

    await act(async () => {
      // Click sort button
      const sortButton = await screen.findByRole('button', { name: /sort by name/i })
      fireEvent.click(sortButton)
    })

    // Check reversed order
    await waitFor(async () => {
      const userRows = await screen.findAllByTestId(/user-row-/)
      expect(userRows[0]).toHaveTextContent('Test User')
      expect(userRows[1]).toHaveTextContent('Admin User')
    })
  })
})