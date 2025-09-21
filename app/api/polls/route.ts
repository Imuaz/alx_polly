import { NextRequest, NextResponse } from 'next/server';
import { getPollsServer } from '@/lib/data/polls-server';
import { PollFilters } from '@/lib/types/poll';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');
    
    const filters: PollFilters = {
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (sortBy === 'created' || sortBy === 'votes' || sortBy === 'ending') ? sortBy as 'created' | 'votes' | 'ending' : undefined,
      sortOrder: (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder as 'asc' | 'desc' : undefined,
    };

    const polls = await getPollsServer(filters);
    
    return NextResponse.json(polls, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    );
  }
}