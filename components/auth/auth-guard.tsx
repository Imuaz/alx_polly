"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icons } from "@/components/ui/icons";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * AuthGuard component that handles client-side authentication checks
 * and redirects users appropriately to prevent auth page access when already logged in
 */
export function AuthGuard({ 
  children, 
  redirectTo = "/polls",
  requireAuth = false 
}: AuthGuardProps) {
  const { user, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while still initializing
    if (isInitializing) return;

    // If user is authenticated and on auth pages, redirect away
    if (user && !requireAuth) {
      router.replace(redirectTo);
      return;
    }

    // If user is not authenticated and auth is required, redirect to login
    if (!user && requireAuth) {
      router.replace("/login");
      return;
    }
  }, [user, isInitializing, requireAuth, redirectTo, router]);

  // Show loading while initializing or while redirecting
  if (isInitializing || (user && !requireAuth) || (!user && requireAuth)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <div className="text-center space-y-4">
          <Icons.spinner className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-muted-foreground">
            {isInitializing ? "Loading..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}