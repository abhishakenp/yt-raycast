/**
 * Client helpers for the referral program.
 *
 * Auth tokens are read from the global Clerk SDK (`window.Clerk`) when it has
 * been loaded by an explicit sign-in action. Public routes intentionally avoid
 * loading Clerk on first paint.
 */

export const REFERRAL_PENDING_KEY = 'shipfast_ref_pending'
export const REFERRAL_DONE_KEY = 'shipfast_ref_recorded'
export const REFERRAL_QUERY_PARAM = 'ref'

type ClerkGlobal = {
  loaded?: boolean
  user?: { primaryEmailAddress?: { emailAddress?: string } | null } | null
  session?: {
    getToken?: (options?: { template?: string }) => Promise<string | null>
  } | null
}

const getClerk = (): ClerkGlobal | null => {
  if (typeof window === 'undefined') return null
  return (window as unknown as { Clerk?: ClerkGlobal }).Clerk ?? null
}

export const isClerkSignedIn = (): boolean => Boolean(getClerk()?.user)

/**
 * Resolve once the global Clerk SDK has finished hydrating (`loaded`), so
 * callers don't mistake "still booting" for "signed out". Bounded so a truly
 * signed-out / unconfigured page still proceeds. Returns whether a session is
 * present at the time it settles.
 */
export const waitForClerkReady = async (
  timeoutMs = 10000,
): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  if (!getClerk()) return false
  const start = Date.now()
  let elapsed = 0
  while (elapsed < timeoutMs) {
    const clerk = getClerk()
    if (clerk?.loaded === true || clerk?.user || clerk?.session) {
      return Boolean(clerk?.session || clerk?.user)
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
    elapsed = Date.now() - start
  }
  return false
}

export const getClerkUserEmail = (): string | null =>
  getClerk()?.user?.primaryEmailAddress?.emailAddress ?? null

/** Convex-templated session token, or null when signed out / SDK not ready. */
export const getReferralAuthToken = async (): Promise<string | null> => {
  const clerk = getClerk()
  if (!clerk?.session?.getToken) return null
  try {
    return (await clerk.session.getToken({ template: 'convex' })) ?? null
  } catch {
    try {
      return (await clerk.session.getToken()) ?? null
    } catch {
      return null
    }
  }
}

const safeStorage = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

/** Normalize a raw ?ref value to the canonical stored code (A–Z0–9, ≤8). */
export const normalizeRefParam = (value: string | null): string =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)

export const readPendingReferral = (): string | null =>
  safeStorage()?.getItem(REFERRAL_PENDING_KEY) ?? null

export const storePendingReferral = (code: string): void => {
  const storage = safeStorage()
  if (!storage || !code) return
  // Don't overwrite an already-recorded attribution.
  if (storage.getItem(REFERRAL_DONE_KEY)) return
  storage.setItem(REFERRAL_PENDING_KEY, code)
}

export const clearPendingReferral = (): void => {
  safeStorage()?.removeItem(REFERRAL_PENDING_KEY)
}

export const markReferralRecorded = (): void => {
  const storage = safeStorage()
  if (!storage) return
  storage.setItem(REFERRAL_DONE_KEY, '1')
  storage.removeItem(REFERRAL_PENDING_KEY)
}

export const hasRecordedReferral = (): boolean =>
  Boolean(safeStorage()?.getItem(REFERRAL_DONE_KEY))

/** POST the captured code to the server to attribute the signed-in user. */
export const postReferralRecord = async (
  code: string,
): Promise<{ recorded: boolean; reason: string } | null> => {
  const token = await getReferralAuthToken()
  if (!token) return null
  try {
    const response = await fetch('/api/referrals/record', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, email: getClerkUserEmail() ?? undefined }),
    })
    if (!response.ok) return null
    return (await response.json()) as { recorded: boolean; reason: string }
  } catch {
    return null
  }
}
