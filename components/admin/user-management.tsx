import React from 'react';
import { UserRole } from '@/lib/types/roles';
import { getUsersWithRoles, updateUserRole } from '@/lib/auth/role-actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const UserRow = ({ 
  user, 
  onRoleChange, 
  disabled 
}: { 
  user: User; 
  onRoleChange: (id: string, role: UserRole) => void; 
  disabled: boolean; 
}) => (
  <TableRow data-testid={`user-row-${user.id}`}>
    <TableCell>{user.name}</TableCell>
    <TableCell>{user.email}</TableCell>
    <TableCell>
      <Select
        value={user.role}
        onValueChange={(value: UserRole) => onRoleChange(user.id, value)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="moderator">Moderator</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </TableCell>
    <TableCell>
      {/* Add additional actions here if needed */}
    </TableCell>
  </TableRow>
);

export function UserManagement() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setIsLoading(true);
      const users = await getUsersWithRoles();
      setUsers(users);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setIsLoading(true);
      await updateUserRole(userId, newRole);
      await loadUsers(); // Reload users to get updated data
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onRoleChange={handleRoleChange}
                disabled={isLoading}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}