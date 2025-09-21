import { Metadata } from "next"
import { Suspense } from "react"
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CreatePollButton } from "@/components/polls/create-poll-button";
import { SuccessMessage } from "@/components/ui/success-message";
import { getUserPollsStatsServer } from "@/lib/data/polls-server";
import { createServerComponentClient } from "@/lib/supabase-server";
import { DashboardStatsSkeleton } from "@/components/ui/loading-states";

export const metadata: Metadata = {
  title: "Dashboard | Polling App",
  description: "Manage your polls and view your account",
}

export default async function DashboardPage() {
  const supabase = await createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  const stats = await getUserPollsStatsServer(user.id);
  const totalPolls = stats?.totalPolls || 0;
  const activePolls = stats?.activePolls || 0;
  const totalVotes = stats?.totalVotes || 0;
  const avgVotes = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;

  return (
    <DashboardShell
      heading="Dashboard"
      text="Welcome back! Here's an overview of your polls and activity."
    >
      {/* Success Message */}
      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>
      
      <div className="flex justify-end">
        <CreatePollButton />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards with real data */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Polls</h3>
          </div>
          <div className="text-2xl font-bold">{totalPolls}</div>
          <p className="text-xs text-muted-foreground">
            Polls you've created
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Votes</h3>
          </div>
          <div className="text-2xl font-bold">{totalVotes}</div>
          <p className="text-xs text-muted-foreground">
            Across all your polls
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active Polls</h3>
          </div>
          <div className="text-2xl font-bold">{activePolls}</div>
          <p className="text-xs text-muted-foreground">
            Currently accepting votes
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Avg. Votes</h3>
          </div>
          <div className="text-2xl font-bold">{avgVotes}</div>
          <p className="text-xs text-muted-foreground">
            Per poll average
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                Quick Actions
              </h3>
              <p className="text-sm text-muted-foreground">
                Common tasks and shortcuts
              </p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <CreatePollButton variant="outline" className="w-full" />
              {/* More quick actions will be added here */}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
