import { createServerComponentClient } from "@/lib/supabase-server";
import { Poll, PollFilters } from "@/lib/types/poll";

/**
 * Server-side data fetching for polls with caching and optimization
 */

// Cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetches polls with server-side caching and optimization
 */
export async function getPollsServer(filters?: PollFilters): Promise<Poll[]> {
  const cacheKey = `polls-${JSON.stringify(filters || {})}`;
  
  // Check cache first
  const cached = getCachedData<Poll[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const supabase = await createServerComponentClient();
    
    // Build optimized query with single request
    let query = supabase
      .from("polls")
      .select(`
        id,
        title,
        description,
        category,
        status,
        created_at,
        ends_at,
        total_votes,
        allow_multiple_votes,
        anonymous_voting,
        created_by,
        poll_options (
          id,
          text,
          votes,
          order_index
        )
      `);

    // Apply filters
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "created_at";
    const sortOrder = filters?.sortOrder || "desc";
    
    if (sortBy === "votes") {
      query = query.order("total_votes", { ascending: sortOrder === "asc" });
    } else if (sortBy === "ending") {
      query = query.order("ends_at", { ascending: sortOrder === "asc" });
    } else {
      query = query.order("created_at", { ascending: sortOrder === "asc" });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch polls: ${error.message}`);
    }

    // Transform data
    const polls = data?.map(poll => ({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      category: poll.category,
      status: poll.status,
      createdAt: poll.created_at,
      endsAt: poll.ends_at,
      totalVotes: poll.total_votes,
      allowMultipleVotes: poll.allow_multiple_votes,
      anonymousVoting: poll.anonymous_voting,
      createdBy: poll.created_by,
      options: poll.poll_options?.map((option: any) => ({
        id: option.id,
        text: option.text,
        votes: option.votes,
        orderIndex: option.order_index
      })) || []
    })) || [];

    // Cache the result
    setCachedData(cacheKey, polls);
    return polls;
  } catch (error) {
    console.error("Error fetching polls:", error);
    return [];
  }
}

/**
 * Fetches a single poll with server-side caching
 */
export async function getPollServer(id: string): Promise<Poll | null> {
  const cacheKey = `poll-${id}`;
  
  // Check cache first
  const cached = getCachedData<Poll>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const supabase = await createServerComponentClient();
    
    const { data, error } = await supabase
      .from("polls")
      .select(`
        id,
        title,
        description,
        category,
        status,
        created_at,
        ends_at,
        total_votes,
        allow_multiple_votes,
        anonymous_voting,
        created_by,
        poll_options (
          id,
          text,
          votes,
          order_index
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch poll: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    // Transform data with percentages
    const poll = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      createdAt: data.created_at,
      endsAt: data.ends_at,
      totalVotes: data.total_votes,
      allowMultipleVotes: data.allow_multiple_votes,
      anonymousVoting: data.anonymous_voting,
      createdBy: data.created_by,
      options: data.poll_options?.map((option: any) => ({
        id: option.id,
        text: option.text,
        votes: option.votes,
        orderIndex: option.order_index,
        percentage: data.total_votes > 0 ? Math.round((option.votes / data.total_votes) * 100) : 0
      })) || []
    };

    // Cache the result
    setCachedData(cacheKey, poll);
    return poll;
  } catch (error) {
    console.error("Error fetching poll:", error);
    return null;
  }
}

/**
 * Fetches user poll statistics with caching
 */
export async function getUserPollsStatsServer(userId: string): Promise<{ totalPolls: number; activePolls: number; totalVotes: number }> {
  const cacheKey = `user-stats-${userId}`;
  
  // Check cache first
  const cached = getCachedData<{ totalPolls: number; activePolls: number; totalVotes: number }>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const supabase = await createServerComponentClient();

    const { data, error } = await supabase
      .from('polls')
      .select('id, status, total_votes')
      .eq('created_by', userId);

    if (error) {
      throw new Error(`Failed to fetch user polls stats: ${error.message}`);
    }

    const now = new Date().toISOString();
    const stats = data.reduce(
      (acc, poll) => {
        acc.totalPolls += 1;
        if (poll.status === 'active') {
          acc.activePolls += 1;
        }
        acc.totalVotes += poll.total_votes;
        return acc;
      },
      { totalPolls: 0, activePolls: 0, totalVotes: 0 }
    );

    // Cache the result
    setCachedData(cacheKey, stats);
    return stats;
  } catch (error) {
    console.error("Error fetching user polls stats:", error);
    return { totalPolls: 0, activePolls: 0, totalVotes: 0 };
  }
}

/**
 * Fetches user profile with role information
 */
export async function getUserProfileServer(userId: string) {
  const cacheKey = `user-profile-${userId}`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const supabase = await createServerComponentClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, email")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    // Cache the result
    setCachedData(cacheKey, profile);
    return profile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
