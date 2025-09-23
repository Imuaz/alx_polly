import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in your .env.local file.')
    
    // Return a mock client to prevent runtime errors
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ error: { message: 'Supabase not configured' }, data: null }),
        signOut: async () => ({ error: null }),
        resend: async () => ({ error: { message: 'Supabase not configured' } }),
      }
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      // Enable session persistence across tabs and page reloads
      persistSession: true,
      // Automatically detect authentication storage
      detectSessionInUrl: true,
      // Configure storage for better cross-tab sync
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      // Automatically refresh sessions before they expire
      autoRefreshToken: true,
    }
  })
}
