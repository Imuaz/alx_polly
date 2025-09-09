"use server"

/**
 * Authentication Server Actions
 * 
 * This module contains all server-side authentication actions for the polling app.
 * Uses Supabase Auth for user management and Next.js Server Actions for form handling.
 * All actions include proper error handling and redirect users appropriately.
 */

import { createServerComponentClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/**
 * Handles user sign-in with email and password
 * 
 * @param formData - Form data containing email and password fields
 * @throws {Error} When email/password are missing or authentication fails
 * 
 * Flow:
 * 1. Extract and validate email/password from form data
 * 2. Authenticate user with Supabase Auth
 * 3. Revalidate layout cache and redirect to polls page on success
 */
export async function signInAction(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    // Extract credentials from form data
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Validate required fields
    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    // Attempt authentication with Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    // Clear cache and redirect to main app on successful login
    revalidatePath("/", "layout")
    redirect("/polls")
  } catch (error) {
    console.error("Sign in error:", error)
    throw error
  }
}

/**
 * Handles new user registration with email verification
 * 
 * @param formData - Form data containing email, password, and fullName fields
 * @throws {Error} When required fields are missing or registration fails
 * 
 * Flow:
 * 1. Extract and validate user registration data
 * 2. Create new user account with Supabase Auth
 * 3. Set up email confirmation redirect URL
 * 4. Handle email verification flow or direct login based on Supabase config
 */
export async function signUpAction(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    // Extract user data from form
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    // Validate all required fields are present
    if (!email || !password || !fullName) {
      throw new Error("All fields are required")
    }

    // Get the origin URL for email confirmation redirect
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // Create new user account with metadata
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // Store full name in user metadata
        },
        emailRedirectTo: `${origin}/auth/callback`, // Redirect after email confirmation
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    // Check if email confirmation is required (user created but no session)
    if (data?.user && !data?.session) {
      redirect("/verify-email?email=" + encodeURIComponent(email))
    }

    // If no email confirmation needed, proceed to main app
    revalidatePath("/", "layout")
    redirect("/polls")
  } catch (error) {
    console.error("Sign up error:", error)
    throw error
  }
}

/**
 * Handles user sign-out and session cleanup
 * 
 * @throws {Error} When sign-out fails
 * 
 * Flow:
 * 1. Sign out user from Supabase Auth
 * 2. Clear all cached data
 * 3. Redirect to login page
 */
export async function signOutAction() {
  try {
    const supabase = await createServerComponentClient()
    
    // Sign out the current user session
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }

    // Clear all cached data and redirect to login
    revalidatePath("/", "layout")
    redirect("/login")
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

/**
 * Resends email verification for unverified accounts
 * 
 * @param formData - Form data containing the email address
 * @returns {Object} Success response with confirmation message
 * @throws {Error} When email is missing or resend fails
 * 
 * Used when users need to receive a new verification email
 */
export async function resendVerificationAction(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    // Extract email from form data
    const email = formData.get("email") as string

    if (!email) {
      throw new Error("Email is required")
    }

    // Get the origin URL for email confirmation redirect
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // Resend verification email with proper redirect URL
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, message: "Verification email sent successfully" }
  } catch (error) {
    console.error("Resend verification error:", error)
    throw error
  }
}

/**
 * Retrieves the currently authenticated user
 * 
 * @returns {User | null} Current user object or null if not authenticated
 * 
 * Used throughout the app to check authentication status and get user data.
 * Returns null instead of throwing errors for better UX.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createServerComponentClient()
    
    // Get current user from Supabase Auth session
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Get user error:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

/**
 * Retrieves user profile data from the profiles table
 * 
 * @param userId - The user ID to fetch profile for
 * @returns {Object | null} User profile data or null if not found
 * 
 * Fetches extended user information stored in the profiles table,
 * including full name, bio, and other user metadata.
 */
export async function getUserProfile(userId: string) {
  try {
    const supabase = await createServerComponentClient()
    
    // Query the profiles table for user-specific data
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Get user profile error:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Get user profile error:", error)
    return null
  }
}

/**
 * Updates user profile information in the profiles table
 * 
 * @param formData - Form data containing fullName and bio fields
 * @returns {Object} Success response with confirmation message
 * @throws {Error} When user is not authenticated or update fails
 * 
 * Flow:
 * 1. Verify user authentication
 * 2. Extract and validate profile data
 * 3. Upsert profile data (insert or update)
 * 4. Revalidate profile page cache
 */
export async function updateUserProfile(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    // Verify user is authenticated before allowing profile updates
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("Authentication required")
    }

    // Extract profile data from form
    const fullName = formData.get("fullName") as string
    const bio = formData.get("bio") as string

    // Validate required fields
    if (!fullName) {
      throw new Error("Full name is required")
    }

    // Update or insert profile data using upsert
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        bio: bio || null, // Allow empty bio
        updated_at: new Date().toISOString(),
      })

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    // Clear profile page cache to show updated data
    revalidatePath("/profile")
    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Update profile error:", error)
    throw error
  }
}
