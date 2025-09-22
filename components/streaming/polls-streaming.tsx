import { Suspense } from 'react';
import { getPollsOptimized } from '@/lib/data/optimized-polls-server';
import { PollCardSkeleton } from '@/components/ui/loading-states';
import { PollView } from '@/components/polls/poll-view';

interface PollsStreamingProps {
  filters?: {
    category?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

async function PollsList({ filters }: PollsStreamingProps) {
  const polls = await getPollsOptimized(filters).catch(() => []);

  if (!Array.isArray(polls) || polls.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No polls found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or create a new poll
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <PollView key={poll.id} poll={poll} />
      ))}
    </div>
  );
}

export function PollsStreaming({ filters }: PollsStreamingProps) {
  return (
    <Suspense fallback={<PollsListSkeleton />}>
      <PollsList filters={filters} />
    </Suspense>
  );
}

function PollsListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <PollCardSkeleton key={i} />
      ))}
    </div>
  );
}
