import { createServerComponentClient } from "@/lib/supabase-server"
import { Poll, PollFilters } from "@/lib/types/poll"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

// GET /api/polls - Fetches polls with optional filtering and sorting
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filters: PollFilters = {
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "created_at",
      sortOrder: searchParams.get("sortOrder") || "desc",
    }

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
    const polls: Poll[] = data?.map(poll => ({
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
    console.error("Error fetching polls:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// POST /api/polls - Creates a new poll
export async function POST(request: Request) {
  try {
    const supabase = await createServerComponentClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const endDate = formData.get("endDate") as string
    const allowMultipleVotes = formData.get("allowMultipleVotes") === "on"
    const anonymousVoting = formData.get("anonymousVoting") === "on"
    
    const options: string[] = []
    let optionIndex = 0
    while (formData.get(`option-${optionIndex}`) !== null) {
      const option = formData.get(`option-${optionIndex}`) as string
      if (option.trim()) {
        options.push(option.trim())
      }
      optionIndex++
    }

    if (!title || !category || options.length < 2) {
      return NextResponse.json({ error: "Title, category, and at least 2 options are required" }, { status: 400 })
    }

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

    revalidatePath("/polls")
    
    return NextResponse.json({ message: "Poll created successfully!", pollId: poll.id }, { status: 201 })
  } catch (error) {
    console.error("Error creating poll:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}