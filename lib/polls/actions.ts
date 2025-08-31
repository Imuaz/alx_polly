"use server"

import { createServerComponentClient } from "@/lib/supabase-server"
import { CreatePollData, Poll, PollFilters } from "@/lib/types/poll"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPoll(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("Authentication required")
    }

    // Extract form data
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const endDate = formData.get("endDate") as string
    const allowMultipleVotes = formData.get("allowMultipleVotes") === "on"
    const anonymousVoting = formData.get("anonymousVoting") === "on"
    
    // Get options from form data
    const options: string[] = []
    let optionIndex = 0
    while (formData.get(`option-${optionIndex}`) !== null) {
      const option = formData.get(`option-${optionIndex}`) as string
      if (option.trim()) {
        options.push(option.trim())
      }
      optionIndex++
    }

    // Validate required fields
    if (!title || !category || options.length < 2) {
      throw new Error("Title, category, and at least 2 options are required")
    }

    // Create poll in database
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        title,
        description: description || null,
        category,
        status: "active",
        ends_at: endDate || null,
        allow_multiple_votes: allowMultipleVotes,
        anonymous_voting: anonymousVoting,
        created_by: user.id,
        total_votes: 0
      })
      .select()
      .single()

    if (pollError) {
      throw new Error(`Failed to create poll: ${pollError.message}`)
    }

    // Create poll options
    const optionInserts = options.map((optionText, index) => ({
      poll_id: poll.id,
      text: optionText,
      votes: 0,
      order_index: index
    }))

    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(optionInserts)

    if (optionsError) {
      throw new Error(`Failed to create poll options: ${optionsError.message}`)
    }

    revalidatePath("/polls")
    redirect("/polls?success=Poll created successfully!")
  } catch (error) {
    console.error("Error creating poll:", error)
    throw error
  }
}

export async function votePoll(pollId: string, optionIds: string[]) {
  try {
    const supabase = await createServerComponentClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("Authentication required")
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("poll_votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single()

    if (existingVote) {
      throw new Error("You have already voted on this poll")
    }

    // Get poll details to check if multiple votes are allowed
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("allow_multiple_votes, status")
      .eq("id", pollId)
      .single()

    if (pollError || !poll) {
      throw new Error("Poll not found")
    }

    if (poll.status !== "active") {
      throw new Error("This poll is no longer active")
    }

    if (!poll.allow_multiple_votes && optionIds.length > 1) {
      throw new Error("Only one option can be selected for this poll")
    }

    // Record the vote(s) - create separate records for each option
    const voteInserts = optionIds.map(optionId => ({
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

    // Vote counts are automatically updated by database triggers

    revalidatePath(`/polls/${pollId}`)
    return { success: true }
  } catch (error) {
    console.error("Error voting on poll:", error)
    throw error
  }
}

export async function getPolls(filters?: PollFilters): Promise<Poll[]> {
  try {
    const supabase = await createServerComponentClient()
    
    let query = supabase
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

    // Apply filters
    if (filters?.category) {
      query = query.eq("category", filters.category)
    }

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "created_at"
    const sortOrder = filters?.sortOrder || "desc"
    
    if (sortBy === "votes") {
      query = query.order("total_votes", { ascending: sortOrder === "asc" })
    } else if (sortBy === "ending") {
      query = query.order("ends_at", { ascending: sortOrder === "asc" })
    } else {
      query = query.order("created_at", { ascending: sortOrder === "asc" })
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch polls: ${error.message}`)
    }

    // Transform data to match Poll interface
    return data?.map(poll => ({
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
  } catch (error) {
    console.error("Error fetching polls:", error)
    return []
  }
}

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

    if (error) {
      throw new Error(`Failed to fetch poll: ${error.message}`)
    }

    if (!data) {
      return null
    }

    // Transform data to match Poll interface
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
        percentage: data.total_votes > 0 ? Math.round((option.votes / data.total_votes) * 100) : 0
      })) || []
    }
  } catch (error) {
    console.error("Error fetching poll:", error)
    return null
  }
}

export async function getUserPolls() {
  try {
    const supabase = await createServerComponentClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return []
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
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch user polls: ${error.message}`)
    }

    // Transform data to match Poll interface
    return data?.map((poll: any) => ({
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
  } catch (error) {
    console.error("Error fetching user polls:", error)
    return []
  }
}

export async function deletePoll(pollId: string) {
  try {
    const supabase = await createServerComponentClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("Authentication required")
    }

    // Check if user owns the poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("created_by")
      .eq("id", pollId)
      .single()

    if (pollError) {
      throw new Error(`Failed to find poll: ${pollError.message}`)
    }

    if (poll.created_by !== user.id) {
      throw new Error("You can only delete your own polls")
    }

    // Delete the poll (cascade will handle options and votes)
    const { error: deleteError } = await supabase
      .from("polls")
      .delete()
      .eq("id", pollId)

    if (deleteError) {
      throw new Error(`Failed to delete poll: ${deleteError.message}`)
    }

    revalidatePath("/polls")
    revalidatePath("/dashboard")
    redirect("/dashboard?success=Poll deleted successfully!")
  } catch (error) {
    console.error("Error deleting poll:", error)
    throw error
  }
}
