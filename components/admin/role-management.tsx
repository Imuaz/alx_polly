import React from 'react';
import { UserRole, RolePermissions, DEFAULT_ROLE_PERMISSIONS } from '@/lib/types/roles';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function RoleManagement() {
  const [rolePermissions, setRolePermissions] = React.useState(DEFAULT_ROLE_PERMISSIONS);

  const handlePermissionChange = (role: UserRole, permission: keyof RolePermissions) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission],
      },
    }));
  };

  return (
    <div className="space-y-6">
      {(Object.keys(rolePermissions) as UserRole[]).map((role) => (
        <Card key={role}>
          <CardHeader>
            <CardTitle className="capitalize">{role}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(rolePermissions[role]).map(([permission, enabled]) => (
                <div key={permission} className="flex items-center justify-between">
                  <Label htmlFor={`${role}-${permission}`} className="flex-1">
                    {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Label>
                  <Switch
                    id={`${role}-${permission}`}
                    checked={enabled}
                    onCheckedChange={() => handlePermissionChange(role, permission as keyof RolePermissions)}
                    disabled={role === 'admin'} // Admin permissions cannot be modified
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}