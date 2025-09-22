import { createServerComponentClient } from '@/lib/supabase-server';
import { sessionCache } from '@/lib/cache/session-cache';

// Cache for data queries
const dataCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds for data cache

function getCachedData<T>(key: string): T | null {
  const cached = dataCache.get(key);
  if (!cached || Date.now() > cached.expiresAt) {
    dataCache.delete(key);
    return null;
  }
  return cached.data as T;
}

function setCachedData<T>(key: string, data: T): void {
  dataCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL
  });
}

/**
 * Get user session with caching
 */
export async function getCachedUserSession() {
  const supabase = await createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Check session cache first
  const cached = sessionCache.get(user.id);
  if (cached) {
    return cached;
  }

  // Fetch profile if not cached
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  // Cache the session
  if (profile) {
    sessionCache.set(user.id, user, profile);
  }

  return { user, profile };
}

/**
 * Optimized polls fetching with streaming support
 */
export async function getPollsOptimized(filters?: {
  category?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const cacheKey = `polls-${JSON.stringify(filters || {})}`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const supabase = await createServerComponentClient();
    
    let query = supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        ends_at,
        category,
        created_by,
        total_votes,
        poll_options(id, text, votes, order_index)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters?.sortBy) {
      const ascending = filters.sortOrder === 'asc';
      query = query.order(filters.sortBy as any, { ascending });
    }

    const { data: polls, error } = await query;

    if (error) {
      console.error('Error fetching polls:', error);
      return [];
    }

    if (!polls) {
      return [];
    }

    // Transform data for better performance
    const transformedPolls = polls?.map((poll: any) => ({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      status: poll.status,
      created_at: poll.created_at,
      ends_at: poll.ends_at,
      category: poll.category,
      created_by: poll.created_by,
      total_votes: poll.total_votes || 0,
      options: poll.poll_options?.map((option: any) => ({
        id: option.id,
        text: option.text,
        votes: option.votes,
        order_index: option.order_index
      })) || []
    })) || [];

    // Cache the result
    setCachedData(cacheKey, transformedPolls);
    
    return transformedPolls;
  } catch (error) {
    console.error('Error in getPollsOptimized:', error);
    return [];
  }
}

/**
 * Optimized single poll fetching
 */
export async function getPollOptimized(pollId: string) {
  const cacheKey = `poll-${pollId}`;
  
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const supabase = await createServerComponentClient();
    
    const { data: poll, error } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        ends_at,
        category,
        created_by,
        total_votes,
        poll_options(id, text, votes, order_index)
      `)
      .eq('id', pollId)
      .single();

    if (error || !poll) {
      return null;
    }

    const transformedPoll = {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      status: poll.status,
      created_at: poll.created_at,
      ends_at: poll.ends_at,
      category: poll.category,
      created_by: poll.created_by,
      total_votes: poll.total_votes || 0,
      options: poll.poll_options?.map((option: any) => ({
        id: option.id,
        text: option.text,
        votes: option.votes,
        order_index: option.order_index
      })) || []
    };

    setCachedData(cacheKey, transformedPoll);
    return transformedPoll;
  } catch (error) {
    console.error('Error in getPollOptimized:', error);
    return null;
  }
}

/**
 * Optimized user stats with aggregation
 */
export async function getUserStatsOptimized(userId: string) {
  const cacheKey = `user-stats-${userId}`;
  
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const supabase = await createServerComponentClient();

    // Use aggregate queries for better performance
    const [pollsResult, votesResult] = await Promise.all([
      supabase
        .from('polls')
        .select('id, status', { count: 'exact' })
        .eq('user_id', userId),
      supabase
        .from('poll_votes')
        .select('poll_id', { count: 'exact' })
        .in('poll_id', 
          (await supabase
            .from('polls')
            .select('id')
            .eq('user_id', userId)).data?.map(p => p.id) || []
        )
    ]);

    const totalPolls = pollsResult.count || 0;
    const activePolls = pollsResult.data?.filter(poll => poll.status === 'active').length || 0;
    const totalVotes = votesResult.count || 0;

    const stats = {
      totalPolls,
      activePolls,
      totalVotes,
      avgVotes: totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0
    };

    setCachedData(cacheKey, stats);
    return stats;
  } catch (error) {
    console.error('Error in getUserStatsOptimized:', error);
    return {
      totalPolls: 0,
      activePolls: 0,
      totalVotes: 0,
      avgVotes: 0
    };
  }
}

/**
 * Clear cache for a specific user (useful after updates)
 */
export function clearUserCache(userId: string) {
  sessionCache.invalidate(userId);
  // Clear all data cache entries for this user
  for (const [key] of dataCache) {
    if (key.includes(userId)) {
      dataCache.delete(key);
    }
  }
}
