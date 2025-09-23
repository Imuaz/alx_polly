"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ error: any }>;
  isEmailVerified: boolean;
  isEmailConfirmationSent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEmailConfirmationSent, setIsEmailConfirmationSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Get the origin safely
  const getOrigin = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes - simplified to avoid redirect loops
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        console.log('Auth state change:', event, !!session?.user);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setIsInitializing(false);

        // Handle email verification confirmation status
        if (event === "USER_UPDATED" && session?.user?.email_confirmed_at) {
          setIsEmailConfirmationSent(false);
        } else if (event === "SIGNED_OUT") {
          setIsEmailConfirmationSent(false);
        }

        // Let middleware handle redirects to prevent conflicts
        // Only refresh the router to update UI state
        router.refresh();
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${getOrigin()}/auth/callback`,
        },
      });

      // Check if email confirmation was sent
      if (!error && data?.user && !data?.session) {
        setIsEmailConfirmationSent(true);
      }

      return { error, data };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${getOrigin()}/auth/callback`,
        },
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const isEmailVerified =
    user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined;

  const value = {
    user,
    session,
    loading,
    isInitializing,
    signIn,
    signUp,
    signOut,
    resendVerificationEmail,
    isEmailVerified,
    isEmailConfirmationSent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
