import { createClient } from "@/lib/supabase";
import { UserRole, RolePermissions } from "@/lib/types/roles";

interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  auth: {
    email: string;
  };
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
): Promise<void> {
  const supabase = createClient();

  try {
    // Validate user ID
    if (!userId || userId.trim() === "") {
      throw new Error("Invalid user ID");
    }

    // Validate role
    if (!Object.values(UserRole).includes(newRole)) {
      throw new Error("Invalid role provided");
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to update user role: ${message}`);
  }
}

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export async function getUsersWithRoles(): Promise<UserWithRole[]> {
  const supabase = createClient();

  try {
    // Get all profiles with email addresses
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, role, email")
      .order("full_name");

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return [];
    }

    // Map profiles to user format with real email addresses
    return profiles.map((profile: any) => ({
      id: profile.id,
      name: profile.full_name || "Unknown User",
      email: profile.email || "No email available",
      role: profile.role,
    }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to fetch users: ${message}`);
  }
}

export async function updateRolePermissions(
  role: UserRole,
  permissions: RolePermissions,
): Promise<{ role: UserRole; permissions: RolePermissions }> {
  const supabase = createClient();

  try {
    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      throw new Error("Invalid role provided");
    }

    // Validate that all required permission fields are present
    const requiredPermissions: (keyof RolePermissions)[] = [
      "canCreatePolls",
      "canDeletePolls",
      "canManageUsers",
      "canModerateComments",
      "canAccessAdminPanel",
    ];

    for (const perm of requiredPermissions) {
      if (typeof permissions[perm] !== "boolean") {
        throw new Error(`Missing or invalid permission: ${perm}`);
      }
    }

    const { data, error } = await supabase
      .from("role_permissions")
      .upsert({
        role,
        permissions,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update role permissions: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned after updating role permissions");
    }

    return {
      role: data.role,
      permissions: data.permissions,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to update role permissions: ${message}`);
  }
}
