import { Metadata } from "next"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { PollsList } from "@/components/polls/polls-list"
import { CreatePollButton } from "@/components/polls/create-poll-button"

export const metadata: Metadata = {
  title: "Dashboard | Polling App",
  description: "Manage your polls and view your account",
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Welcome back! Here's an overview of your polls and activity."
      >
        <CreatePollButton />
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards will go here */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Polls</h3>
          </div>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            +2 from last month
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Votes</h3>
          </div>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">
            +180 from last month
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active Polls</h3>
          </div>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">
            3 ending this week
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Avg. Participation</h3>
          </div>
          <div className="text-2xl font-bold">89%</div>
          <p className="text-xs text-muted-foreground">
            +2.1% from last month
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
