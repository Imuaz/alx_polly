import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { UserManagement } from '../../../components/admin/user-management';
import { getUsersWithRoles, updateUserRole } from '../role-actions';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock data
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
  { id: '2', name: 'Admin User', email: 'admin@example.com', role: 'admin' }
];

// Mock the role actions
jest.mock('../role-actions', () => ({
  getUsersWithRoles: jest.fn(),
  updateUserRole: jest.fn()
}));

describe('UserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementation
    (getUsersWithRoles as jest.Mock).mockResolvedValue(mockUsers);
    (updateUserRole as jest.Mock).mockResolvedValue({ success: true });
  });

  it('renders user list correctly', async () => {
    render(<UserManagement />);
    
    // Should show loading state initially
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('handles role update correctly', async () => {
    render(<UserManagement />);

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click the role select
    const roleSelect = screen.getAllByRole('combobox')[0];
    fireEvent.click(roleSelect);

    // Select moderator role
    fireEvent.click(screen.getByText('Moderator'));

    // Verify updateUserRole was called with correct params
    expect(updateUserRole).toHaveBeenCalledWith('1', 'moderator');

    // Should show success state
    await waitFor(() => {
      expect(getUsersWithRoles).toHaveBeenCalledTimes(2); // Initial load + after update
    });
  });

  it('handles errors appropriately', async () => {
    // Mock error for getUsersWithRoles
    const errorMessage = 'Failed to load users';
    (getUsersWithRoles as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<UserManagement />);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('disables controls during loading', async () => {
    (getUsersWithRoles as jest.Mock).mockResolvedValue(mockUsers);
    render(<UserManagement />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Trigger a loading state by updating a role
    (updateUserRole as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.click(select);
    
    const options = screen.getAllByText('Admin');
    fireEvent.click(options[1]); // Click the option, not the current value

    // Verify loading state
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        expect(select).toBeDisabled();
      });
    });
  });
});