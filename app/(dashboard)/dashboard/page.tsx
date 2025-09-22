import { Metadata } from "next"
import { Suspense } from "react"
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CreatePollButton } from "@/components/polls/create-poll-button";
import { SuccessMessage } from "@/components/ui/success-message";
import { DashboardStatsStreaming } from "@/components/streaming/dashboard-stats-streaming";

export const metadata: Metadata = {
  title: "Dashboard | Polling App",
  description: "Manage your polls and view your account",
}

export default async function DashboardPage() {

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
      
      <DashboardStatsStreaming />
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
