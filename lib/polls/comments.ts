"use server"

import { createServerComponentClient } from "@/lib/supabase-server"

export async function addComment(pollId: string, text: string) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")
  const body = (text || "").trim()
  if (!body) throw new Error("Comment cannot be empty")
  if (body.length > 500) throw new Error("Comment is too long (max 500 characters)")
  const { error } = await supabase.from("comments").insert({
    poll_id: pollId,
    user_id: user.id,
    text: body,
  })
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function getComments(pollId: string) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase
    .from("comments")
    .select("id, text, created_at")
    .eq("poll_id", pollId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}


