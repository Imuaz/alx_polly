import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getComments } from "@/lib/polls/comments"

export async function CommentList({ pollId }: { pollId: string }) {
  const comments = await getComments(pollId).catch(() => [])
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comments</CardTitle>
        <CardDescription>What people are saying</CardDescription>
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <ul className="space-y-3 max-h-72 overflow-auto" aria-label="Comments list">
            {comments.map((c: any) => (
              <li key={c.id} className="text-sm">
                <div>{c.text}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}


