"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { MinimalAuthProvider } from "@/contexts/auth-context-minimal";
import { useAuth as useFullAuth } from "@/contexts/auth-context";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { createClient } from "@/lib/supabase";

interface PollsLayoutProps {
  children: React.ReactNode;
}

export default function PollsLayout({ children }: PollsLayoutProps) {
  const { user, loading, signOut } = useFullAuth();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <LoadingScreen message="Loading polls..." />;
  }

  return (
    <MinimalAuthProvider user={user} signOut={handleSignOut}>
      <MainLayout>{children}</MainLayout>
    </MinimalAuthProvider>
  );
}
