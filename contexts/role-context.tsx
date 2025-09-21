"use client";

import React from "react";
import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useState,
} from "react";
import {
  UserRole,
  RolePermissions,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/lib/types/roles";
import { updateUserRole } from "@/lib/auth/role-actions";

interface RoleContextType {
  userRole: UserRole;
  permissions: RolePermissions;
  isAdmin: boolean;
  isModerator: boolean;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  updateRole: (userId: string, newRole: UserRole) => Promise<void>;
}

interface RoleProviderProps {
  children: ReactNode;
  userId: string;
  initialRole?: UserRole;
}

export const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({
  children,
  userId,
  initialRole = UserRole.USER,
}: RoleProviderProps) {
  const [userRole, setUserRole] = useState<UserRole>(initialRole);
  const permissions = DEFAULT_ROLE_PERMISSIONS[userRole];
  const isAdmin = userRole === UserRole.ADMIN;
  const isModerator = userRole === UserRole.MODERATOR;

  const hasPermission = useCallback(
    (permission: keyof RolePermissions) => {
      return permissions[permission];
    },
    [permissions],
  );

  const updateRole = useCallback(
    async (targetUserId: string, newRole: UserRole) => {
      try {
        await updateUserRole(targetUserId, newRole);
        // Only update local state if we're updating our own role
        if (targetUserId === userId) {
          setUserRole(newRole);
        }
      } catch (error) {
        console.error("Failed to update role:", error);
        throw error;
      }
    },
    [userId],
  );

  const value = {
    userRole,
    permissions,
    isAdmin,
    isModerator,
    hasPermission,
    updateRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

export function usePermissions() {
  const { permissions, hasPermission } = useRole();
  return { permissions, hasPermission };
}

export function useIsAdmin() {
  const { isAdmin } = useRole();
  return isAdmin;
}

export function useIsModerator() {
  const { isModerator } = useRole();
  return isModerator;
}
