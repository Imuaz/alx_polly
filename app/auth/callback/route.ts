import { createRouteHandlerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createRouteHandlerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Always redirect to polls after successful authentication
      return NextResponse.redirect(`${requestUrl.origin}/polls`)
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
