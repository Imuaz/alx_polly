import { Suspense } from 'react';
import { getCachedUserSession, getUserStatsOptimized } from '@/lib/data/optimized-polls-server';
import { DashboardStatsSkeleton } from '@/components/ui/loading-states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3, TrendingUp, Activity } from 'lucide-react';

async function DashboardStats() {
  const session = await getCachedUserSession();
  
  if (!session?.user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to view your dashboard</p>
      </div>
    );
  }

  const stats = await getUserStatsOptimized(session.user.id).catch(() => ({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0,
    avgVotes: 0
  })) as { totalPolls: number; activePolls: number; totalVotes: number; avgVotes: number };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPolls}</div>
          <p className="text-xs text-muted-foreground">
            All time polls created
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activePolls}</div>
          <p className="text-xs text-muted-foreground">
            Currently running polls
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVotes}</div>
          <p className="text-xs text-muted-foreground">
            Votes across all polls
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Votes</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgVotes}</div>
          <p className="text-xs text-muted-foreground">
            Votes per poll average
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardStatsStreaming() {
  return (
    <Suspense fallback={<DashboardStatsSkeleton />}>
      <DashboardStats />
    </Suspense>
  );
}
