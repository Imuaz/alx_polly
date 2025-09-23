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
import { getAuthCallbackUrl } from "@/lib/utils/site-url"

/**
 * Helper function to check if an error is a Next.js redirect error
 * @param error - The error to check
 * @returns boolean indicating if this is a redirect error
 */
function isNextRedirectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message === "NEXT_REDIRECT" &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  )
}

/**
 * Handles user sign-in with email and password
 * 
 * @param formData - Form data containing email and password fields
 * @returns {Object} Success or error response object
 * 
 * Flow:
 * 1. Extract and validate email/password from form data
 * 2. Authenticate user with Supabase Auth
 * 3. Return structured response instead of throwing errors
 * 4. On success, revalidate cache and redirect to polls page
 */
export async function signInAction(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    // Extract credentials from form data
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Validate required fields
    if (!email || !password) {
      return { 
        success: false, 
        error: "Email and password are required. Please fill in all fields." 
      }
    }

    // Attempt authentication with Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { 
        success: false, 
        error: "Invalid login credentials. Please check your email and password and try again." 
      }
    }

    // Clear cache on successful login - do NOT redirect here to avoid loops
    revalidatePath("/", "layout")
    revalidatePath("/polls")
    
    return { 
      success: true, 
      message: "Login successful" 
    }
  } catch (error) {
    console.error("Sign in error:", error)
    // Return error response for unexpected errors instead of throwing
    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again later." 
    }
  }
}

/**
 * Handles new user registration with email verification
 * 
 * @param formData - Form data containing email, password, and fullName fields
 * @returns {Object} Success or error response object
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
      return { 
        success: false, 
        error: "All fields are required. Please fill in your email, password, and full name." 
      }
    }

    // Get callback URL and log for debugging
    const callbackUrl = getAuthCallbackUrl();
    console.log('📧 Email verification callback URL:', callbackUrl);
    
    // Create new user account with metadata
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // Store full name in user metadata
        },
        emailRedirectTo: callbackUrl, // Redirect after email confirmation
      },
    })

    if (error) {
      return { 
        success: false, 
        error: error.message || "Registration failed. Please try again." 
      }
    }

    // Check if email confirmation is required (user created but no session)
    if (data?.user && !data?.session) {
      redirect("/verify-email?email=" + encodeURIComponent(email))
    }

    // If no email confirmation needed, proceed to main app
    revalidatePath("/", "layout")
    redirect("/polls")
  } catch (error) {
    // Check if it's the special redirect error from Next.js
    if (isNextRedirectError(error)) {
      throw error // Re-throw it so Next.js can handle the redirect
    }
    
    console.error("Sign up error:", error)
    // Return error response for unexpected errors instead of throwing
    return { 
      success: false, 
      error: "An unexpected error occurred during registration. Please try again later." 
    }
  }
}

/**
 * Handles user sign-out and session cleanup
 * 
 * @throws {Error} When sign-out fails (re-throws redirect errors for Next.js handling)
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
    // Check if it's the special redirect error from Next.js
    if (isNextRedirectError(error)) {
      throw error // Re-throw it so Next.js can handle the redirect
    }
    
    console.error("Sign out error:", error)
    throw error
  }
}

/**
 * Resends email verification for unverified accounts
 * 
 * @param formData - Form data containing the email address
 * @returns {Object} Success or error response object
 * 
 * Used when users need to receive a new verification email
 */
export async function resendVerificationAction(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    // Extract email from form data
    const email = formData.get("email") as string

    if (!email) {
      return { 
        success: false, 
        error: "Email is required to resend verification." 
      }
    }

    // Get callback URL and log for debugging
    const callbackUrl = getAuthCallbackUrl();
    console.log('📧 Resend verification callback URL:', callbackUrl);
    
    // Resend verification email with proper redirect URL
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: callbackUrl,
      },
    })

    if (error) {
      return { 
        success: false, 
        error: error.message || "Failed to resend verification email. Please try again." 
      }
    }

    return { success: true, message: "Verification email sent successfully" }
  } catch (error) {
    console.error("Resend verification error:", error)
    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again later." 
    }
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
 * @returns {Object} Success or error response object
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
      return { 
        success: false, 
        error: "Authentication required. Please sign in and try again." 
      }
    }

    // Extract profile data from form
    const fullName = formData.get("fullName") as string
    const bio = formData.get("bio") as string

    // Validate required fields
    if (!fullName) {
      return { 
        success: false, 
        error: "Full name is required." 
      }
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
      return { 
        success: false, 
        error: `Failed to update profile: ${error.message}` 
      }
    }

    // Clear profile page cache to show updated data
    revalidatePath("/profile")
    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Update profile error:", error)
    return { 
      success: false, 
      error: "An unexpected error occurred while updating your profile. Please try again later." 
    }
  }
}
