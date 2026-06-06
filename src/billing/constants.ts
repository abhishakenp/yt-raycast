/** Hard monthly cap for free (no subscription) users */
export const MAX_FREE_PER_MONTH = 10

/** Hard monthly cap for paid (subscribed) users */
export const MAX_PAID_PER_MONTH = 30

/** Unlimited credits sentinel used for paywalled-free access */
export const UNLIMITED_CREDITS = 999

/** Per-day cap for anonymous (unauthenticated) users */
export const MAX_ANON_PER_DAY = 2

/** +1 daily generation granted when anonymous user shares on social */
export const SHARE_BONUS_EXTRA = 1

/** Per 10-min window per authenticated user */
export const MAX_PER_USER = 5

/** Per 10-min window per IP */
export const MAX_PER_IP = 10

/** Per 10-min window per IP when authenticated */
export const MAX_PER_IP_AUTHED = 30

/** Monthly cap for free users by IP */
export const MAX_FREE_PER_IP_MONTHLY = 15

/** Max concurrent in-progress generations per user/IP */
export const MAX_CONCURRENT_PER_USER = 2

/** Rate limit sliding window (10 minutes) */
export const RATE_WINDOW_MS = 10 * 60 * 1000

/** Monthly window (30 days) */
export const MONTHLY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

/** Daily window (24 hours) */
export const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000

/** IP addresses whitelisted from rate limiting (comma-separated in env, or array) */
export function parseWhitelistedIps(raw: string | null | undefined): string[] {
  return raw ? raw.split(',').map((ip) => ip.trim()).filter(Boolean) : []
}

const rawWhitelist = process.env.WHITELISTED_IPS || ''
export const WHITELISTED_IPS = parseWhitelistedIps(rawWhitelist)

export function isIpWhitelisted(
  ip: string | null | undefined,
  whitelist = WHITELISTED_IPS,
): boolean {
  if (!ip) {
    return false
  }
  return whitelist.includes(ip)
}
