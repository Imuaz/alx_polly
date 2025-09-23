"use server";

import { createServerComponentClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

/**
 * Improved server action for handling poll votes
 * Handles duplicate votes, vote changes, and provides meaningful feedback
 */
export async function submitVoteAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createServerComponentClient();
    const pollId = formData.get("pollId") as string;
    const optionIds = formData.getAll("option").map(String);

    if (!pollId || optionIds.length === 0) {
      throw new Error("Poll ID and at least one option are required");
    }

    // Auth check
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Authentication required");
    }

    // Validate poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("allow_multiple_votes, status, title")
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
      throw new Error("Poll not found");
    }

    if (poll.status !== "active") {
      throw new Error("This poll is no longer active");
    }

    if (!poll.allow_multiple_votes && optionIds.length > 1) {
      throw new Error("Only one option can be selected for this poll");
    }

    // Check for existing votes
    const { data: existingVotes } = await supabase
      .from("poll_votes")
      .select("option_id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id);

    const existingOptionIds = existingVotes?.map(vote => vote.option_id) || [];
    
    // If poll doesn't allow multiple votes, remove all existing votes first
    if (!poll.allow_multiple_votes && existingVotes && existingVotes.length > 0) {
      const { error: deleteError } = await supabase
        .from("poll_votes")
        .delete()
        .eq("poll_id", pollId)
        .eq("user_id", user.id);
      
      if (deleteError) {
        throw new Error(`Failed to update vote: ${deleteError.message}`);
      }
    }

    // Filter out options that the user has already voted for (prevents duplicates)
    const newVoteOptions = poll.allow_multiple_votes 
      ? optionIds.filter(optionId => !existingOptionIds.includes(optionId))
      : optionIds;

    // Only insert new votes if there are any
    if (newVoteOptions.length > 0) {
      const voteInserts = newVoteOptions.map(optionId => ({
        poll_id: pollId,
        user_id: user.id,
        option_id: optionId
      }));

      const { error: voteError } = await supabase.from("poll_votes").insert(voteInserts);
      if (voteError) {
        throw new Error(`Failed to record vote: ${voteError.message}`);
      }
    }

    // Clear poll page cache to show updated results
    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/polls");

    // Provide appropriate feedback message
    if (!poll.allow_multiple_votes && existingVotes && existingVotes.length > 0) {
      return { success: true, message: "Vote updated successfully!" };
    } else if (newVoteOptions.length > 0) {
      return { success: true, message: "Vote recorded successfully!" };
    } else {
      return { success: true, message: "You have already voted for the selected option(s)" };
    }

  } catch (error) {
    console.error("Error submitting vote:", error);
    throw error;
  }
}