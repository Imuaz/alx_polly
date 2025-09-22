"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

/**
 * Minimal Auth Context for Client Components
 *
 * This is a lightweight auth context that only provides user data
 * for UI components that need it (like UserProfile dropdown).
 *
 * It does NOT handle:
 * - Loading states
 * - Redirects
 * - Authentication checks
 * - Session management
 *
 * All of the above is handled by middleware and server components.
 */

interface MinimalAuthContextType {
  user: User | null;
  signOut: () => Promise<void>;
}

const MinimalAuthContext = createContext<MinimalAuthContextType | undefined>(
  undefined,
);

interface MinimalAuthProviderProps {
  children: React.ReactNode;
  user: User | null;
  signOut: () => Promise<void>;
}

export function MinimalAuthProvider({
  children,
  user: initialUser,
  signOut,
}: MinimalAuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const supabase = createClient();

  useEffect(() => {
    // Get user on mount if not provided
    if (!initialUser) {
      supabase.auth
        .getUser()
        .then(({ data: { user } }: { data: { user: User | null } }) => {
          setUser(user);
        });
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      },
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth, initialUser]);

  const value = {
    user,
    signOut,
  };

  return (
    <MinimalAuthContext.Provider value={value}>
      {children}
    </MinimalAuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(MinimalAuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a MinimalAuthProvider");
  }
  return context;
}

// Hook to check if user is authenticated (client-side only)
export function useIsAuthenticated(): boolean {
  const { user } = useAuth();
  return !!user;
}

// Hook to check if email is verified (client-side only)
export function useIsEmailVerified(): boolean {
  const { user } = useAuth();
  return !!user?.email_confirmed_at;
}

// Hook to get user display name (client-side only)
export function useUserDisplayName(): string | null {
  const { user } = useAuth();

  if (!user) return null;

  // Try user metadata first
  const fullName = user.user_metadata?.full_name;
  if (fullName) return fullName;

  // Fall back to email
  return user.email || null;
}
