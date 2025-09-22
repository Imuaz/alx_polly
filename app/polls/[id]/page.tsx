import { Metadata } from "next"
import { notFound } from "next/navigation"
import { PollView } from "@/components/polls/poll-view"
import { PollResults } from "@/components/polls/poll-results"
import { SharePoll } from "@/components/polls/share-poll"
import { getPoll, getPollShareStats, votePoll, recordPollShare } from "@/lib/polls/actions"

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
    const optionIds = formData.getAll("option").map(String)
    await votePoll(id, optionIds)
  }

  async function recordShare(platform?: string) {
    "use server"
    await recordPollShare(id, platform)
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
