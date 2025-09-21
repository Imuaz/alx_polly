import { Metadata } from "next";
import { Suspense } from "react";
import { PollsGrid } from "@/components/polls/polls-grid";
import { PollsFilters } from "@/components/polls/polls-filters";
import { CreatePollButton } from "@/components/polls/create-poll-button";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { SuccessMessage } from "@/components/ui/success-message";
import { DashboardContainer } from "@/components/layout/dashboard-shell";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PollCardSkeleton } from "@/components/ui/loading-states";
import { BarChart3, TrendingUp, Users, Filter } from "lucide-react";
import { getPollsServer } from "@/lib/data/polls-server";
import { createServerComponentClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Polls",
  description: "Browse and vote on polls created by the community",
};

export default async function PollsPage() {
  // Fetch polls data server-side for better performance
  const polls = await getPollsServer();
  
  // Calculate stats from real data
  const totalPolls = polls.length;
  const activePolls = polls.filter(poll => poll.status === 'active').length;
  const totalVotes = polls.reduce((sum, poll) => sum + poll.totalVotes, 0);

  return (
    <ProtectedRoute>
      <DashboardContainer>
        <EmailVerificationBanner />

        {/* Success Message */}
        <Suspense fallback={null}>
          <SuccessMessage />
        </Suspense>

        {/* Header Section */}
        <DashboardHeader
          heading="Polls"
          text="Discover and participate in polls from the community"
        >
          <CreatePollButton />
        </DashboardHeader>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Polls
                </p>
                <p className="text-2xl font-bold">{totalPolls}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Polls
                </p>
                <p className="text-2xl font-bold">{activePolls}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Votes
                </p>
                <p className="text-2xl font-bold">{totalVotes.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Filter Polls</h3>
            </div>
          </div>
          <div className="p-6">
            <Suspense
              fallback={
                <div className="flex gap-2">
                  <div className="h-9 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-28 animate-pulse rounded bg-muted" />
                </div>
              }
            >
              <PollsFilters />
            </Suspense>
          </div>
        </div>

        {/* Polls Grid */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold">All Polls</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Browse and vote on polls from the community
            </p>
          </div>
          <div className="p-6">
            <Suspense
              fallback={
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PollCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <PollsGrid />
            </Suspense>
          </div>
        </div>
      </DashboardContainer>
    </ProtectedRoute>
  );
}
