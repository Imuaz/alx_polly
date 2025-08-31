import { Metadata } from "next"
import { Suspense } from "react"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { PollsList } from "@/components/polls/polls-list"
import { CreatePollButton } from "@/components/polls/create-poll-button"
import { SuccessMessage } from "@/components/ui/success-message"
import { getUserPolls } from "@/lib/polls/actions"

export const metadata: Metadata = {
  title: "Dashboard | Polling App",
  description: "Manage your polls and view your account",
}

export default async function DashboardPage() {
  const polls = await getUserPolls()
  
  // Calculate statistics
  const totalPolls = polls.length
  const totalVotes = polls.reduce((sum, poll) => sum + poll.totalVotes, 0)
  const activePolls = polls.filter(poll => poll.status === 'active').length
  const avgVotes = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0

  return (
    <DashboardShell>
      {/* Success Message */}
      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>
      
      <DashboardHeader
        heading="Dashboard"
        text="Welcome back! Here's an overview of your polls and activity."
      >
        <CreatePollButton />
      </DashboardHeader>
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
        <div className="col-span-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                Recent Polls
              </h3>
              <p className="text-sm text-muted-foreground">
                Your latest polls and their current status
              </p>
            </div>
            <div className="p-6 pt-0">
              <PollsList />
            </div>
          </div>
        </div>
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
