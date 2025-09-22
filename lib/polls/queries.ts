"use server"

import { createServerComponentClient } from "@/lib/supabase-server"
import { Poll, ShareStats } from "@/lib/types/poll"

export async function getPoll(id: string): Promise<Poll | null> {
  try {
    const supabase = await createServerComponentClient()
    const { data, error } = await supabase
      .from("polls")
      .select(`
        *,
        poll_options (
          id,
          text,
          votes,
          order_index
        )
      `)
      .eq("id", id)
      .single()

    if (error || !data) return null

    return {
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
        percentage: data.total_votes > 0 ? Math.round((option.votes / data.total_votes) * 100) : 0,
      })) || [],
    }
  } catch {
    return null
  }
}

export async function getPollShareStats(pollId: string): Promise<ShareStats> {
  try {
    const supabase = await createServerComponentClient()
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [{ count: total }, { count: today }] = await Promise.all([
      supabase.from("poll_shares").select("id", { count: "exact", head: true }).eq("poll_id", pollId),
      supabase
        .from("poll_shares")
        .select("id", { count: "exact", head: true })
        .eq("poll_id", pollId)
        .gte("created_at", startOfToday.toISOString()),
    ])

    return { total: total || 0, today: today || 0 }
  } catch {
    return { total: 0, today: 0 }
  }
}



