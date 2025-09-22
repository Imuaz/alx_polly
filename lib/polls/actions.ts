"use server"

/**
 * Poll Management Server Actions
 * 
 * This module handles all poll-related operations including creation, voting,
 * fetching, and deletion. Uses Supabase for data persistence and Next.js
 * Server Actions for form handling with proper error handling and validation.
 */

import { createServerComponentClient } from "@/lib/supabase-server"
import { CreatePollData, Poll, PollFilters, ShareStats } from "@/lib/types/poll"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/**
 * Creates a new poll with options and settings
 * 
 * @param formData - Form data containing poll details and options
 * @throws {Error} When user is not authenticated or poll creation fails
 * 
 * Flow:
 * 1. Authenticate user and extract form data
 * 2. Validate required fields and options
 * 3. Create poll record in database
 * 4. Create associated poll options
 * 5. Redirect to polls page with success message
 */
export async function createPoll(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    // Verify user authentication before allowing poll creation
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("Authentication required")
    }

    // Extract poll metadata from form
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const endDate = formData.get("endDate") as string
    const allowMultipleVotes = formData.get("allowMultipleVotes") === "on"
    const anonymousVoting = formData.get("anonymousVoting") === "on"
    
    // Extract poll options from dynamic form fields
    const options: string[] = []
    let optionIndex = 0
    while (formData.get(`option-${optionIndex}`) !== null) {
      const option = formData.get(`option-${optionIndex}`) as string
      if (option.trim()) {
        options.push(option.trim())
      }
      optionIndex++
    }

    // Validate poll requirements
    if (!title || !category || options.length < 2) {
      throw new Error("Title, category, and at least 2 options are required")
    }

    // Create the main poll record
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        title,
        description: description || null,
        category,
        status: "active", // New polls start as active
        ends_at: endDate || null, // Optional end date
        allow_multiple_votes: allowMultipleVotes,
        anonymous_voting: anonymousVoting,
        created_by: user.id,
        total_votes: 0 // Initialize vote count
      })
      .select()
      .single()

    if (pollError) {
      throw new Error(`Failed to create poll: ${pollError.message}`)
    }

    // Create poll options with proper ordering
    const optionInserts = options.map((optionText, index) => ({
      poll_id: poll.id,
      text: optionText,
      votes: 0, // Initialize vote count for each option
      order_index: index // Maintain option order
    }))

    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(optionInserts)

    if (optionsError) {
      throw new Error(`Failed to create poll options: ${optionsError.message}`)
    }

    // Clear polls cache and redirect with success message
    revalidatePath("/polls")
    redirect("/polls?success=Poll created successfully!")
  } catch (error) {
    console.error("Error creating poll:", error)
    throw error
  }
}

/**
 * Records user votes for a poll
 * 
 * @param pollId - The ID of the poll to vote on
 * @param optionIds - Array of option IDs the user is voting for
 * @returns {Object} Success response
 * @throws {Error} When user is not authenticated, already voted, or voting fails
 * 
 * Flow:
 * 1. Authenticate user and check for existing votes
 * 2. Validate poll status and voting rules
 * 3. Record vote(s) in the database
 * 4. Vote counts are updated automatically via database triggers
 */
export async function votePoll(pollId: string, optionIds: string[]) {
  try {
    const supabase = await createServerComponentClient()
    
    // Verify user authentication before allowing votes
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("Authentication required")
    }

    // Check if user has already voted on this poll
    const { data: existingVote } = await supabase
      .from("poll_votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single()

    if (existingVote) {
      throw new Error("You have already voted on this poll")
    }

    // Get poll configuration to validate voting rules
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("allow_multiple_votes, status")
      .eq("id", pollId)
      .single()

    if (pollError || !poll) {
      throw new Error("Poll not found")
    }

    // Ensure poll is still accepting votes
    if (poll.status !== "active") {
      throw new Error("This poll is no longer active")
    }

    // Validate multiple vote selection against poll settings
    if (!poll.allow_multiple_votes && optionIds.length > 1) {
      throw new Error("Only one option can be selected for this poll")
    }

    // Create vote records - one for each selected option
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

    // Note: Vote counts are automatically updated by database triggers
    // This ensures data consistency and reduces race conditions

    // Clear poll page cache to show updated results
    revalidatePath(`/polls/${pollId}`)
    return { success: true }
  } catch (error) {
    console.error("Error voting on poll:", error)
    throw error
  }
}

/**
 * Server Action: Handles vote submission from a form
 * Expects multiple inputs named "option" containing option IDs
 */
export async function votePollAction(pollId: string, formData: FormData) {
  const optionIds = formData.getAll("option").map(String)
  return votePoll(pollId, optionIds)
}

/**
 * Fetches polls with optional filtering and sorting
 * 
 * @param filters - Optional filters for category, status, search, and sorting
 * @returns {Promise<Poll[]>} Array of polls matching the filters
 * 
 * Features:
 * - Category and status filtering
 * - Text search across title and description
 * - Sorting by creation date, vote count, or end date
 * - Includes poll options with vote counts
 */
export async function getPolls(filters?: PollFilters): Promise<Poll[]> {
  try {
    const supabase = await createServerComponentClient()
    
    // Build base query with poll options included
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

    // Apply category filter if specified
    if (filters?.category) {
      query = query.eq("category", filters.category)
    }

    // Apply status filter if specified
    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    // Apply text search across title and description
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply sorting based on user preference
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

    // Transform database response to match Poll interface
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
    return [] // Return empty array on error for better UX
  }
}

/**
 * Fetches a single poll by ID with detailed information
 * 
 * @param id - The poll ID to fetch
 * @returns {Promise<Poll | null>} Poll object with options and percentages, or null if not found
 * 
 * Features:
 * - Includes all poll options with vote counts
 * - Calculates vote percentages for results display
 * - Returns null for non-existent polls (graceful handling)
 */
export async function getPoll(id: string): Promise<Poll | null> {
  try {
    const supabase = await createServerComponentClient()
    
    // Fetch poll with all associated options
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

    // Transform database response with calculated percentages
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
        // Calculate percentage for results visualization
        percentage: data.total_votes > 0 ? Math.round((option.votes / data.total_votes) * 100) : 0
      })) || []
    }
  } catch (error) {
    console.error("Error fetching poll:", error)
    return null // Return null for graceful error handling
  }
}

// --- QR Share Analytics ---
/**
 * Records a share event for analytics
 */
export async function recordPollShare(pollId: string, platform?: string) {
  try {
    const supabase = await createServerComponentClient()

    const { error } = await supabase.from("poll_shares").insert({
      poll_id: pollId,
      platform: platform || null,
    })

    if (error) {
      throw new Error(`Failed to record share: ${error.message}`)
    }

    revalidatePath(`/polls/${pollId}`)
    return { success: true }
  } catch (error) {
    console.error("Error recording poll share:", error)
    return { success: false }
  }
}

/**
 * Fetches share stats for a poll (total and today)
 */
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
  } catch (error) {
    console.error("Error fetching poll share stats:", error)
    return { total: 0, today: 0 }
  }
}

/**
 * Fetches all polls created by the current user
 * 
 * @returns {Promise<Poll[]>} Array of polls created by the authenticated user
 * 
 * Features:
 * - Only returns polls created by the current user
 * - Ordered by creation date (newest first)
 * - Includes all poll options and vote counts
 * - Returns empty array if user is not authenticated
 */
export async function getUserPolls() {
  try {
    const supabase = await createServerComponentClient()
    
    // Get current user to filter their polls
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return [] // Return empty array if not authenticated
    }



/**
 * Deletes a poll and all associated data
 * 
 * @param pollId - The ID of the poll to delete
 * @throws {Error} When user is not authenticated, doesn't own the poll, or deletion fails
 * 
 * Security:
 * - Only allows users to delete their own polls
 * - Verifies ownership before deletion
 * - Database cascading handles cleanup of options and votes
 * 
 * Flow:
 * 1. Authenticate user and verify poll ownership
 * 2. Delete poll record (cascades to options and votes)
 * 3. Clear relevant caches and redirect with success message
 */
/**
 * Fetches statistics for the current user's polls
 * 
 * @returns {Promise<{totalPolls: number, activePolls: number, totalVotes: number}>} 
 *          An object containing the user's poll statistics
 */
export async function getUserPollsStats() {
  try {
    const supabase = await createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { totalPolls: 0, activePolls: 0, totalVotes: 0 };
    }

    const { data, error } = await supabase
      .from('polls')
      .select('id, status, total_votes')
      .eq('created_by', user.id);

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

    return stats;
  } catch (error) {
    console.error("Error fetching user polls stats:", error);
    return { totalPolls: 0, activePolls: 0, totalVotes: 0 };
  }
}

export async function deletePoll(pollId: string) {
  try {
    const supabase = await createServerComponentClient()
    
    // Verify user authentication before allowing deletion
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("Authentication required")
    }

    // Verify user owns the poll before allowing deletion
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("created_by")
      .eq("id", pollId)
      .single()

    if (pollError) {
      throw new Error(`Failed to find poll: ${pollError.message}`)
    }

    // Security check: only allow deletion of own polls
    if (poll.created_by !== user.id) {
      throw new Error("You can only delete your own polls")
    }

    // Delete the poll - database cascade will handle cleanup of:
    // - poll_options table entries
    // - poll_votes table entries
    const { error: deleteError } = await supabase
      .from("polls")
      .delete()
      .eq("id", pollId)

    if (deleteError) {
      throw new Error(`Failed to delete poll: ${deleteError.message}`)
    }

    // Clear caches for pages that might show this poll
    revalidatePath("/polls")
    revalidatePath("/dashboard")
    redirect("/dashboard?success=Poll deleted successfully!")
  } catch (error) {
    console.error("Error deleting poll:", error)
    throw error
  }
}
