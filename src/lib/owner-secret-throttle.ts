import { checkRateLimit, ownerSecretFailureHits } from '@/lib/rate-limit'

/**
 * Throttle for anonymous owner-secret guessing.
 *
 * This cannot live inside the Convex mutation: mutations are atomic, so the
 * `FORBIDDEN` throw rolls back any counter the same mutation just wrote and
 * the count would permanently read zero. The HTTP layer sees the rejection
 * *after* the transaction has unwound, so it is the only place a failed
 * attempt can actually be recorded.
 *
 * Keyed by session so one attacker cannot lock every session at once, and so
 * a shared NAT egress IP does not lock out unrelated users.
 */
const MAX_FAILURES_PER_SESSION = 20
const WINDOW_MS = 15 * 60 * 1000

const key = (sessionId: string): string => `owner-secret:${sessionId}`

/** True when this session has burned its guess budget for the window. */
export function isOwnerSecretGuessingBlocked(sessionId: string): boolean {
  const hits = ownerSecretFailureHits.get(key(sessionId)) ?? []
  const now = Date.now()
  return (
    hits.filter((at) => now - at < WINDOW_MS).length >= MAX_FAILURES_PER_SESSION
  )
}

/** Record one rejected owner-secret attempt. */
export function recordOwnerSecretFailure(sessionId: string): void {
  checkRateLimit(
    key(sessionId),
    ownerSecretFailureHits,
    MAX_FAILURES_PER_SESSION,
    WINDOW_MS,
  )
}

/** Clear the counter after a successful, authorized operation. */
export function clearOwnerSecretFailures(sessionId: string): void {
  ownerSecretFailureHits.delete(key(sessionId))
}

/** Convex surfaces ownership rejections as a FORBIDDEN ConvexError. */
export function isOwnershipRejection(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return message.includes('FORBIDDEN')
}

export const ownerSecretThrottleResponse = (): Response =>
  new Response(
    JSON.stringify({
      error: 'Too many failed attempts for this session. Try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    },
  )

/**
 * Run an operation that authorizes with an anonymous owner secret, counting
 * rejections and refusing further attempts once the budget is spent.
 */
export async function withOwnerSecretThrottle<T>(
  sessionId: string | undefined,
  anonymousOwnerSecret: string | undefined,
  operation: () => Promise<T>,
): Promise<T> {
  if (sessionId === undefined || anonymousOwnerSecret === undefined) {
    return await operation()
  }
  if (isOwnerSecretGuessingBlocked(sessionId)) {
    throw new OwnerSecretThrottledError()
  }
  try {
    const result = await operation()
    clearOwnerSecretFailures(sessionId)
    return result
  } catch (error) {
    if (isOwnershipRejection(error)) recordOwnerSecretFailure(sessionId)
    throw error
  }
}

export class OwnerSecretThrottledError extends Error {
  constructor() {
    super('Too many failed attempts for this session.')
    this.name = 'OwnerSecretThrottledError'
  }
}

export function isOwnerSecretThrottledError(
  error: unknown,
): error is OwnerSecretThrottledError {
  return error instanceof OwnerSecretThrottledError
}
