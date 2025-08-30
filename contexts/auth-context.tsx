"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any, data?: any }>
  signOut: () => Promise<void>
  resendVerificationEmail: (email: string) => Promise<{ error: any }>
  isEmailVerified: boolean
  isEmailConfirmationSent: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEmailConfirmationSent, setIsEmailConfirmationSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Get the origin safely
  const getOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN') {
          // Always redirect to polls after successful login
          router.push('/polls')
        } else if (event === 'SIGNED_OUT') {
          router.push('/login')
          setIsEmailConfirmationSent(false)
        } else if (event === 'USER_UPDATED') {
          // Handle email verification updates
          if (session?.user?.email_confirmed_at) {
            setIsEmailConfirmationSent(false)
            // If user was on verification page, redirect to polls
            if (window.location.pathname === '/verify-email') {
              router.push('/polls')
            }
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${getOrigin()}/auth/callback`,
      },
    })

    // Check if email confirmation was sent
    if (!error && data?.user && !data?.session) {
      setIsEmailConfirmationSent(true)
    }

    return { error, data }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${getOrigin()}/auth/callback`,
      },
    })
    return { error }
  }

  const isEmailVerified = user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resendVerificationEmail,
    isEmailVerified,
    isEmailConfirmationSent,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
