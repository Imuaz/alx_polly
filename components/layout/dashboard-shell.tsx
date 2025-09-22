"use client";

import { ReactNode, Suspense, useEffect } from "react";
import { DashboardLayout } from "./main-layout";
import { PageLoading, Skeleton } from "@/components/ui/loading-screen";
import { MinimalAuthProvider } from "@/contexts/auth-context-minimal";
import { useAuth as useFullAuth } from "@/contexts/auth-context";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuthLoading } from "@/components/providers/simple-loading-provider";
import { createClient } from "@/lib/supabase";

import { DashboardHeader } from "./dashboard-header";

interface DashboardShellProps {
  children: ReactNode;
  loading?: boolean;
  heading?: string;
  text?: string;
}

export function DashboardShell({
  children,
  loading = false,
  heading,
  text,
}: DashboardShellProps) {
  const { user, loading: authLoading, isInitializing, signOut } = useFullAuth();
  const { showAuthLoading, hideAuthLoading } = useAuthLoading();
  const supabase = createClient();

  useEffect(() => {
    if (isInitializing) {
      showAuthLoading("loading");
    } else {
      hideAuthLoading();
    }
  }, [isInitializing, showAuthLoading, hideAuthLoading]);

  const handleSignOut = async () => {
    showAuthLoading("signout");
    try {
      await supabase.auth.signOut();
    } finally {
      hideAuthLoading();
    }
  };

  if (isInitializing) {
    return (
      <LoadingScreen
        show={true}
        message="Loading your dashboard..."
        variant="logo"
      />
    );
  }

  return (
    <MinimalAuthProvider user={user} signOut={handleSignOut}>
      <DashboardLayout loading={loading || authLoading}>
        <div className="flex-1 space-y-6 p-0">
          {heading && <DashboardHeader heading={heading} text={text} />}
          <Suspense fallback={<DashboardSkeletonLoader />}>{children}</Suspense>
        </div>
      </DashboardLayout>
    </MinimalAuthProvider>
  );
}

// Enhanced dashboard shell with custom container
interface DashboardContainerProps {
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

export function DashboardContainer({
  children,
  className = "",
  loading = false,
}: DashboardContainerProps) {
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
        <DashboardSkeletonLoader />
      </div>
    );
  }

  return (
    <div
      className={`container mx-auto px-4 py-6 max-w-screen-2xl ${className}`}
    >
      <Suspense fallback={<DashboardSkeletonLoader />}>{children}</Suspense>
    </div>
  );
}

// Skeleton loader for dashboard content
function DashboardSkeletonLoader() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
