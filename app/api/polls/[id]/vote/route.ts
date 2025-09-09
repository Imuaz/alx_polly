import { createServerComponentClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

// POST /api/polls/[id]/vote - Records user votes for a poll
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: pollId } = params
    const { optionIds } = await request.json()

    if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
        return NextResponse.json({ error: "At least one optionId is required" }, { status: 400 })
    }

    const supabase = await createServerComponentClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user has already voted on this poll
    const { data: existingVote } = await supabase
      .from("poll_votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .limit(1)

    if (existingVote && existingVote.length > 0) {
      return NextResponse.json({ error: "You have already voted on this poll" }, { status: 409 }) // 409 Conflict
    }

    // Get poll configuration to validate voting rules
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("allow_multiple_votes, status")
      .eq("id", pollId)
      .single()

    if (pollError || !poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Ensure poll is still accepting votes
    if (poll.status !== "active") {
      return NextResponse.json({ error: "This poll is no longer active" }, { status: 403 })
    }

    // Validate multiple vote selection against poll settings
    if (!poll.allow_multiple_votes && optionIds.length > 1) {
      return NextResponse.json({ error: "Only one option can be selected for this poll" }, { status: 400 })
    }

    // Create vote records - one for each selected option
    const voteInserts = optionIds.map((optionId: string) => ({
      poll_id: pollId,
      user_id: user.id,
      option_id: optionId
    }))

    const { error: voteError } = await supabase
      .from("poll_votes")
      .insert(voteInserts)

    if (voteError) {
      throw new Error(`Failed to record vote: ${voteError.message}`)
    }

    revalidatePath(`/polls/${pollId}`)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error voting on poll:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}