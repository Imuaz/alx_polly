import { Metadata } from "next"
import { notFound } from "next/navigation"
import { PollView } from "@/components/polls/poll-view"
import { PollResults } from "@/components/polls/poll-results"
import { SharePoll } from "@/components/polls/share-poll"
import { getPoll, getPollShareStats } from "@/lib/polls/queries"
import { createServerComponentClient } from "@/lib/supabase-server"

interface PollPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PollPageProps): Promise<Metadata> {
  const { id } = await params
  const poll = await getPoll(id)
  
  if (!poll) {
    return {
      title: "Poll Not Found | Polling App",
      description: "The requested poll could not be found",
    }
  }

  return {
    title: `${poll.title} | Polling App`,
    description: poll.description || "Vote on this poll and see the results",
  }
}

export default async function PollPage({ params }: PollPageProps) {
  const { id } = await params
  const poll = await getPoll(id)
  const shareStats = await getPollShareStats(id)
  
  if (!poll) {
    notFound()
  }

  async function submitVote(formData: FormData) {
    "use server"
    const supabase = await createServerComponentClient()
    const optionIds = formData.getAll("option").map(String)

    // Auth check
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("Authentication required")
    }

    // Validate poll
    const { data: poll } = await supabase
      .from("polls")
      .select("allow_multiple_votes, status")
      .eq("id", id)
      .single()

    if (!poll) throw new Error("Poll not found")
    if (poll.status !== "active") throw new Error("This poll is no longer active")
    if (!poll.allow_multiple_votes && optionIds.length > 1) {
      throw new Error("Only one option can be selected for this poll")
    }

    const voteInserts = optionIds.map(optionId => ({
      poll_id: id,
      user_id: user.id,
      option_id: optionId
    }))

    const { error: voteError } = await supabase.from("poll_votes").insert(voteInserts)
    if (voteError) throw new Error(`Failed to record vote: ${voteError.message}`)
  }

  async function recordShare(platform?: string) {
    "use server"
    const supabase = await createServerComponentClient()
    await supabase.from("poll_shares").insert({ poll_id: id, platform: platform || null })
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="space-y-6">
        <PollView poll={poll} submitVote={submitVote} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <PollResults poll={poll} />
          <SharePoll poll={poll} initialShareStats={shareStats} recordShare={recordShare} />
        </div>
      </div>
    </div>
  )
}
