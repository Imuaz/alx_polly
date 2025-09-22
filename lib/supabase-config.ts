/**
 * Shared Supabase config resolver
 * Centralizes logic for resolving SUPABASE / NEXT_PUBLIC env vars and
 * ensures we only warn once per process when variables are missing.
 */

let warned = false

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if ((!url || !anon) && !warned) {
    // Only warn once to avoid log spam
    console.warn(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in your .env.local.'
    )
    warned = true
  }

  return { url: url ?? null, anon: anon ?? null }
}

export function assertSupabaseConfig(url?: string | null, anon?: string | null) {
  if (!url || !anon) {
    throw new Error(
      'Supabase environment variables are not configured. See .env.local.example for required variables.'
    )
  }
}
