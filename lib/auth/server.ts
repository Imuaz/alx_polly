import { createServerComponentClient } from "@/lib/supabase-server";
import { cache } from "react";

/**
 * Server-side authentication utilities
 *
 * These functions provide server-side authentication state management
 * without client-side loading states or hydration mismatches.
 * Uses React's cache() to prevent multiple calls per request.
 */

/**
 * Gets the current user from server-side session
 * Cached per request to avoid multiple database calls
 */
export const getUser = cache(async () => {
  try {
    const supabase = await createServerComponentClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in getUser:", error);
    return null;
  }
});

/**
 * Gets the current session from server-side
 * Cached per request to avoid multiple database calls
 */
export const getSession = cache(async () => {
  try {
    const supabase = await createServerComponentClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error in getSession:", error);
    return null;
  }
});

/**
 * Gets user profile data from the profiles table
 * Includes user metadata like full_name, bio, etc.
 */
export const getUserProfile = cache(async (userId?: string) => {
  try {
    const supabase = await createServerComponentClient();

    // If no userId provided, get current user first
    let targetUserId = userId;
    if (!targetUserId) {
      const user = await getUser();
      if (!user) return null;
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", targetUserId)
      .single();

    if (error) {
      console.error("Error getting user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
});

/**
 * Checks if current user is authenticated
 * Returns boolean for simple auth checks
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getUser();
  return !!user;
};

/**
 * Checks if current user has verified their email
 */
export const isEmailVerified = async (): Promise<boolean> => {
  const user = await getUser();
  return !!(user?.email_confirmed_at);
};

/**
 * Gets user display name from auth user or profile
 * Falls back to email if no display name is available
 */
export const getUserDisplayName = async (): Promise<string | null> => {
  const user = await getUser();
  if (!user) return null;

  // Try to get full name from user metadata first
  const fullName = user.user_metadata?.full_name;
  if (fullName) return fullName;

  // Try to get from profiles table
  const profile = await getUserProfile(user.id);
  if (profile?.full_name) return profile.full_name;

  // Fall back to email
  return user.email || null;
};

/**
 * Type definitions for server auth
 */
export type ServerUser = Awaited<ReturnType<typeof getUser>>;
export type ServerSession = Awaited<ReturnType<typeof getSession>>;
export type UserProfile = Awaited<ReturnType<typeof getUserProfile>>;
