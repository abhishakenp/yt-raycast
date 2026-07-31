import { defineEventHandler, getRequestURL, setResponseHeaders } from 'h3'

/**
 * Baseline security headers for every response the app serves.
 *
 * Routes that serve untrusted generated HTML (the raw preview, deployment
 * previews) set their own, stricter, `Content-Security-Policy`; anything a
 * handler sets explicitly wins over what is applied here, so this only fills
 * in the pages that would otherwise ship with no policy at all.
 */

const isProduction = (): boolean => process.env.NODE_ENV === 'production'

/**
 * The app itself is a React SPA served by TanStack Start. It inlines
 * hydration state and styles, so `'unsafe-inline'` is unavoidable for
 * script/style without a nonce pipeline; everything else is locked down.
 */
const APP_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self' https:",
  // Generated previews are rendered in sandboxed iframes on our own origin.
  "frame-src 'self' https: blob: data:",
  "frame-ancestors 'self'",
  "img-src 'self' https: data: blob:",
  "font-src 'self' https: data:",
  "media-src 'self' https: data: blob:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "connect-src 'self' https: wss:",
  'upgrade-insecure-requests',
].join('; ')

const BASE_HEADERS: Record<string, string> = {
  'Content-Security-Policy': APP_CONTENT_SECURITY_POLICY,
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=()',
}

/**
 * Paths that serve generated/untrusted documents and manage their own headers.
 * Applying the app policy here would either weaken theirs (a second CSP header
 * is intersected, not replaced — but X-Frame-Options is not) or break the
 * sandboxing they rely on.
 */
const SELF_MANAGED_PATH_PATTERN =
  /^\/(?:deployed\/|api\/sessions\/[^/]+\/preview-raw)/

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (SELF_MANAGED_PATH_PATTERN.test(path)) return

  setResponseHeaders(event, {
    ...BASE_HEADERS,
    // HSTS only in production: sending it from a local http:// dev server
    // pins the browser to https for localhost and breaks development.
    ...(isProduction()
      ? {
          'Strict-Transport-Security':
            'max-age=31536000; includeSubDomains; preload',
        }
      : {}),
  })
})
