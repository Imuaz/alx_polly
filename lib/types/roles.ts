// Role types and utilities
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export interface RolePermissions {
  canCreatePolls: boolean;
  canDeletePolls: boolean;
  canManageUsers: boolean;
  canModerateComments: boolean;
  canAccessAdminPanel: boolean;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.USER]: {
    canCreatePolls: true,
    canDeletePolls: false,
    canManageUsers: false,
    canModerateComments: false,
    canAccessAdminPanel: false,
  },
  [UserRole.MODERATOR]: {
    canCreatePolls: true,
    canDeletePolls: true,
    canManageUsers: false,
    canModerateComments: true,
    canAccessAdminPanel: true,
  },
  [UserRole.ADMIN]: {
    canCreatePolls: true,
    canDeletePolls: true,
    canManageUsers: true,
    canModerateComments: true,
    canAccessAdminPanel: true,
  },
};