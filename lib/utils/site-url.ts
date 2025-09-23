/**
 * Utility for getting the correct site URL in all environments
 * Handles server-side, client-side, development, and production environments
 */

/**
 * Get the site URL for server-side operations (like email verification)
 * This function works in both development and production environments
 */
export function getSiteUrl(): string {
  // 1. First try the explicit NEXT_PUBLIC_SITE_URL (most reliable for production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // 2. Try other common deployment platform environment variables
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NETLIFY_URL) {
    return process.env.NETLIFY_URL;
  }

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }

  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }

  // 3. For development, fall back to localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // 4. Last resort: throw an error in production if no URL is configured
  console.error('❌ No site URL configured! Please set NEXT_PUBLIC_SITE_URL environment variable.');
  throw new Error(
    'Site URL not configured. Please set NEXT_PUBLIC_SITE_URL in your environment variables.'
  );
}

/**
 * Get the site URL for client-side operations
 * Uses window.location.origin when available, falls back to getSiteUrl()
 */
export function getClientSiteUrl(): string {
  // On client-side, prefer window.location.origin for accuracy
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // On server-side, fall back to getSiteUrl()
  return getSiteUrl();
}

/**
 * Get the auth callback URL for email verification
 */
export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}

/**
 * Get the client-side auth callback URL for email verification
 */
export function getClientAuthCallbackUrl(): string {
  return `${getClientSiteUrl()}/auth/callback`;
}