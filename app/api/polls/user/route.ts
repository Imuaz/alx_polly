import { createServerComponentClient } from "@/lib/supabase-server"
import { Poll } from "@/lib/types/poll"
import { NextResponse } from "next/server"

// GET /api/polls/user - Fetches all polls created by the current user
export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json([], { status: 200 }) // Return empty array if not authenticated
    }

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
      .eq("created_by", user.id)
      .order("created_at", { ascending: false }) // Newest first

    if (error) {
      throw new Error(`Failed to fetch user polls: ${error.message}`)
    }

    // Transform database response to match Poll interface
    const polls: Poll[] = data?.map((poll: any) => ({
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
    })) || []

    return NextResponse.json(polls)
  } catch (error) {
    console.error("Error fetching user polls:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}