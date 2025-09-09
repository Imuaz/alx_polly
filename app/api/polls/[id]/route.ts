import { createServerComponentClient } from "@/lib/supabase-server"
import { Poll } from "@/lib/types/poll"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

// GET /api/polls/[id] - Fetches a single poll by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
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

    if (error) {
      if (error.code === 'PGRST116') { 
        return NextResponse.json({ error: "Poll not found" }, { status: 404 })
      }
      throw new Error(`Failed to fetch poll: ${error.message}`)
    }

    if (!data) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Transform database response with calculated percentages
    const poll: Poll = {
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
        // Calculate percentage for results visualization
        percentage: data.total_votes > 0 ? Math.round((option.votes / data.total_votes) * 100) : 0
      })) || []
    }
    
    return NextResponse.json(poll)
  } catch (error) {
    console.error("Error fetching poll:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE /api/polls/[id] - Deletes a poll
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: pollId } = params
    const supabase = await createServerComponentClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("created_by")
      .eq("id", pollId)
      .single()

    if (pollError || !poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    if (poll.created_by !== user.id) {
      return NextResponse.json({ error: "You can only delete your own polls" }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from("polls")
      .delete()
      .eq("id", pollId)

    if (deleteError) {
      throw new Error(`Failed to delete poll: ${deleteError.message}`)
    }

    revalidatePath("/polls")
    revalidatePath("/dashboard")
    
    return NextResponse.json({ message: "Poll deleted successfully!" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting poll:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}