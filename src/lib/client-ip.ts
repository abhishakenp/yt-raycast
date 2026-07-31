import { createHash } from 'node:crypto'

/**
 * Client IP extraction and hashing.
 *
 * Lives in its own module (rather than in `session-create-response.ts`) so the
 * rate limiter can import it statically. It previously used `require()` inside
 * an ESM module to dodge a circular import, which would have thrown at the
 * first call.
 */

const DEFAULT_TRUSTED_PROXY_HEADERS = [
  'cf-connecting-ip',
  'fly-client-ip',
  'x-real-ip',
]

/**
 * Headers we accept as authoritative for the client IP.
 *
 * ANY client can send `x-real-ip: 1.2.3.4`; the header is only trustworthy
 * because the proxy in front of us overwrites it. Deployments that are not
 * behind such a proxy — or that front the app with a different one — must
 * narrow this list via `TRUSTED_PROXY_IP_HEADERS` (comma-separated; set it to
 * an empty value to trust none of them and fall back to X-Forwarded-For).
 */
function trustedProxyHeaders(): string[] {
  const configured = process.env.TRUSTED_PROXY_IP_HEADERS
  if (configured === undefined) return DEFAULT_TRUSTED_PROXY_HEADERS
  return configured
    .split(',')
    .map((header) => header.trim().toLowerCase())
    .filter(Boolean)
}

export function getClientIp(request: Request): string {
  for (const header of trustedProxyHeaders()) {
    const value = request.headers.get(header)?.trim()
    if (value) return value
  }

  // X-Forwarded-For is a comma-separated chain: `client, proxy1, proxy2`.
  // The LEFTMOST entry is client-controlled and spoofable. The RIGHTMOST
  // entry is appended by the closest trusted proxy, so it is the IP as seen
  // by our own edge rather than the one the caller claims to have.
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const parts = forwarded
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]!
  }

  return 'unknown'
}

export const IP_HASH_SALT_MISSING_ERROR =
  'SHIP_FAST_IP_HASH_SALT must be set in production: an unsalted IP hash is a rainbow-table lookup away from the raw address.'

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Hash a client IP for storage. The salt is mandatory in production — the
 * entire IPv4 space can be hashed in seconds, so an unsalted digest is
 * equivalent to storing the address in plaintext.
 */
export function hashClientIp(
  ip: string,
  salt = process.env.SHIP_FAST_IP_HASH_SALT ?? '',
): string {
  if (salt.length === 0 && isProduction()) {
    throw new Error(IP_HASH_SALT_MISSING_ERROR)
  }
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 48)
}
