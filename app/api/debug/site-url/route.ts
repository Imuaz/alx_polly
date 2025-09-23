import { getSiteUrl } from '@/lib/utils/site-url';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the site URL using our utility
    const siteUrl = getSiteUrl();
    
    // Collect environment information for debugging
    const debugInfo = {
      siteUrl,
      env: {
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT_SET',
        VERCEL_URL: process.env.VERCEL_URL || 'NOT_SET',
        NETLIFY_URL: process.env.NETLIFY_URL || 'NOT_SET',
        RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN || 'NOT_SET',
        RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || 'NOT_SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      },
      callbackUrl: `${siteUrl}/auth/callback`,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get site URL', 
        message: error instanceof Error ? error.message : 'Unknown error',
        env: {
          NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT_SET',
          NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
        }
      },
      { status: 500 }
    );
  }
}