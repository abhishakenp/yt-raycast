import { getClientIp, hashClientIp } from '@/lib/client-ip'

export const userHits: Map<string, number[]> = new Map()
export const ipHits: Map<string, number[]> = new Map()
export const userMonthlyHits: Map<string, number[]> = new Map()
export const anonIpDailyHits: Map<string, number[]> = new Map()
export const exportHits: Map<string, number[]> = new Map()
export const ipMonthlyHits: Map<string, number[]> = new Map()
export const activeGenerations: Map<string, number> = new Map()
export const downloadHits: Map<string, number[]> = new Map()
export const checkoutConfirmHits: Map<string, number[]> = new Map()
export const aiEditHits: Map<string, number[]> = new Map()
export const translateHits: Map<string, number[]> = new Map()
export const cloneHits: Map<string, number[]> = new Map()
export const generationHits: Map<string, number[]> = new Map()
export const sessionCreateHits: Map<string, number[]> = new Map()
export const githubConnectHits: Map<string, number[]> = new Map()
export const referralHits: Map<string, number[]> = new Map()
export const previewHtmlHits: Map<string, number[]> = new Map()
export const stockImageHits: Map<string, number[]> = new Map()
export const rewriteHits: Map<string, number[]> = new Map()
// Rejected anonymous owner-secret attempts, keyed by session.
export const ownerSecretFailureHits: Map<string, number[]> = new Map()
// Checkout start needs its own budget: it previously shared `exportHits`, so
// starting checkouts silently consumed the caller's export allowance.
export const checkoutStartHits: Map<string, number[]> = new Map()

export function checkRateLimit(
  key: string,
  hitsMap: Map<string, number[]>,
  max: number,
  windowMs = 10 * 60 * 1000,
): boolean {
  const now = Date.now()
  const hits = (hitsMap.get(key) || []).filter((t) => now - t < windowMs)
  if (hits.length >= max) {
    hitsMap.set(key, hits)
    return false
  }
  hits.push(now)
  hitsMap.set(key, hits)
  return true
}

export function refundRateLimit(
  key: string,
  hitsMap: Map<string, number[]>,
): void {
  const hits = hitsMap.get(key)
  if (hits?.length) hits.pop()
}

export function cleanupMap(map: Map<string, number[]>, windowMs: number): void {
  const now = Date.now()
  for (const [key, hits] of map) {
    const valid = hits.filter((t) => now - t < windowMs)
    if (valid.length === 0) map.delete(key)
    else map.set(key, valid)
  }
}

/** Standard 10-minute window in milliseconds. */
const TEN_MINUTES = 10 * 60 * 1000

/**
 * Reusable IP-based rate limit guard for HTTP route handlers. Returns a 429
 * Response if the caller's IP has exceeded `max` requests in `windowMs`, or
 * `null` if the request is allowed. Uses a hashed IP so the raw IP is never
 * stored in the hits map.
 */
export function rateLimitByIp(
  request: Request,
  hitsMap: Map<string, number[]>,
  max: number,
  windowMs = TEN_MINUTES,
): Response | null {
  const ipHash = hashClientIp(getClientIp(request))
  if (!checkRateLimit(ipHash, hitsMap, max, windowMs)) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please wait a few minutes.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      },
    )
  }
  return null
}
