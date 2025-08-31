"use server"

import { createServerComponentClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signInAction(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/", "layout")
    redirect("/polls")
  } catch (error) {
    console.error("Sign in error:", error)
    throw error
  }
}

export async function signUpAction(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    if (!email || !password || !fullName) {
      throw new Error("All fields are required")
    }

    // Get the origin for email redirect
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    // If email confirmation is required, redirect to verification page
    if (data?.user && !data?.session) {
      redirect("/verify-email?email=" + encodeURIComponent(email))
    }

    revalidatePath("/", "layout")
    redirect("/polls")
  } catch (error) {
    console.error("Sign up error:", error)
    throw error
  }
}

export async function signOutAction() {
  try {
    const supabase = await createServerComponentClient()
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/", "layout")
    redirect("/login")
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

export async function resendVerificationAction(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    const email = formData.get("email") as string

    if (!email) {
      throw new Error("Email is required")
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

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

export async function getCurrentUser() {
  try {
    const supabase = await createServerComponentClient()
    
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

export async function getUserProfile(userId: string) {
  try {
    const supabase = await createServerComponentClient()
    
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

export async function updateUserProfile(formData: FormData) {
  try {
    const supabase = await createServerComponentClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("Authentication required")
    }

    const fullName = formData.get("fullName") as string
    const bio = formData.get("bio") as string

    if (!fullName) {
      throw new Error("Full name is required")
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        bio: bio || null,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    revalidatePath("/profile")
    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Update profile error:", error)
    throw error
  }
}
