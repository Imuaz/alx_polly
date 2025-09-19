import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseConfig, assertSupabaseConfig } from './supabase-config'

function getCookieHelpers(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // `setAll` may run in a Server Component where setting cookies
          // is not allowed. This is safe to ignore if your middleware
          // refreshes sessions (as in Next Auth examples).
        }
      },
    },
  }
}

// Using getSupabaseConfig and assertSupabaseConfig from lib/supabase-config
// to ensure consistent behavior across client, server and middleware.

export async function createServerComponentClient() {
  const { url, anon } = getSupabaseConfig()

  assertSupabaseConfig(url, anon)

  const cookieStore = await cookies()

  return createServerClient(url as string, anon as string, getCookieHelpers(cookieStore))
}

export async function createRouteHandlerClient() {
  const { url, anon } = getSupabaseConfig()

  assertSupabaseConfig(url, anon)

  const cookieStore = await cookies()

  return createServerClient(url as string, anon as string, getCookieHelpers(cookieStore))
}
