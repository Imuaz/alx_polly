import { Metadata } from "next"
import { notFound } from "next/navigation"
import { PollView } from "@/components/polls/poll-view"
import { PollResults } from "@/components/polls/poll-results"
import { SharePoll } from "@/components/polls/share-poll"

interface PollPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PollPageProps): Promise<Metadata> {
  const { id } = await params
  // TODO: Fetch poll data and generate metadata
  return {
    title: `Poll | Polling App`,
    description: "Vote on this poll and see the results",
  }
}

export default async function PollPage({ params }: PollPageProps) {
  const { id } = await params
  
  // TODO: Fetch poll data by ID
  const pollId = id
  
  // Placeholder - replace with actual data fetching
  if (!pollId) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="space-y-6">
        <PollView pollId={pollId} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <PollResults pollId={pollId} />
          <SharePoll pollId={pollId} />
        </div>
      </div>
    </div>
  )
}
