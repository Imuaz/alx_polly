"use client";

import { ReactNode, Suspense } from "react";
import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import { LoadingScreen, PageLoading } from "@/components/ui/loading-screen";
import { useLoading } from "@/components/providers/simple-loading-provider";

interface MainLayoutProps {
  children: ReactNode;
  loading?: boolean;
}

export function MainLayout({ children, loading = false }: MainLayoutProps) {
  const { isLoading } = useLoading();

  if (loading || isLoading) {
    return (
      <LoadingScreen
        show={true}
        message="Loading your dashboard..."
        variant="default"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <Navbar />

      {/* Mobile Navigation (only visible on mobile) */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <MobileNav />
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <Suspense fallback={<PageLoading />}>{children}</Suspense>
      </main>
    </div>
  );
}

// Layout variant without navbar for auth pages
interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">{children}</main>
    </div>
  );
}

// Layout with container for dashboard pages
interface DashboardLayoutProps {
  children: ReactNode;
  loading?: boolean;
}

export function DashboardLayout({
  children,
  loading = false,
}: DashboardLayoutProps) {
  const { isLoading } = useLoading();

  if (loading || isLoading) {
    return (
      <LoadingScreen
        show={true}
        message="Loading your dashboard..."
        variant="logo"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <Navbar />

      {/* Mobile Navigation (only visible on mobile) */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <MobileNav />
      </div>

      {/* Main Content with Container */}
      <main className="container mx-auto px-4 py-6 max-w-screen-2xl">
        <Suspense fallback={<PageLoading />}>{children}</Suspense>
      </main>
    </div>
  );
}
