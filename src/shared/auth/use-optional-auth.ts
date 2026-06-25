import { useEffect, useMemo, useState } from 'react'

/**
 * Build-time constant: whether a Clerk publishable key was baked into this
 * bundle. Mirrors the `isClerkConfigured` checks in HomePage/TopActions so the
 * whole app agrees on whether Clerk is mounted.
 *
 * Vite only exposes `VITE_`-prefixed vars to `import.meta.env`; the bare
 * `CLERK_PUBLISHABLE_KEY` fallback exists for parity with server-side reads but
 * is normally undefined in the client bundle.
 */
const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
  import.meta.env.CLERK_PUBLISHABLE_KEY
const isClerkConfigured =
  typeof clerkPublishableKey === 'string' &&
  clerkPublishableKey.trim().length > 0

type ClerkTokenOptions = {
  template?: string
  [key: string]: unknown
}

type ClerkSession = {
  getToken?: (options?: ClerkTokenOptions) => Promise<string | null>
}

type ClerkGlobal = {
  addListener?: (
    listener: (state: {
      session?: ClerkSession | null
      user?: unknown | null
    }) => void,
  ) => void | (() => void)
  openSignIn?: () => unknown
  openUserProfile?: () => unknown
  session?: ClerkSession | null
  user?: unknown | null
}

type ClerkWindow = Window & {
  Clerk?: ClerkGlobal
}

type OptionalAuth = {
  getToken: (options?: ClerkTokenOptions) => Promise<string | null>
  isSignedIn: boolean
}

type OptionalClerk = {
  openSignIn: () => void
  openUserProfile: () => void
  session: ClerkSession | null
  user: unknown | null
}

const anonymousAuth: OptionalAuth = {
  getToken: async () => null,
  isSignedIn: false,
}
const anonymousClerk: OptionalClerk = {
  openSignIn: () => undefined,
  openUserProfile: () => undefined,
  session: null,
  user: null,
}

export const openSignInEventName = 'ship-fast:open-sign-in'

const getClerk = (): ClerkGlobal | undefined =>
  typeof window === 'undefined' ? undefined : (window as ClerkWindow).Clerk

const readClerkSnapshot = () => {
  const clerk = getClerk()
  return {
    isSignedIn: Boolean(clerk?.user || clerk?.session),
    session: clerk?.session ?? null,
    user: clerk?.user ?? null,
  }
}

const isMissingJwtTemplateError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error)
  return /No JWT template exists with name/i.test(message)
}

const getOptionalToken = async (
  options?: ClerkTokenOptions,
): Promise<string | null> => {
  const session = getClerk()?.session
  if (typeof session?.getToken !== 'function') return null

  try {
    return await session.getToken(options)
  } catch (error) {
    if (!isMissingJwtTemplateError(error)) throw error
    return await session.getToken()
  }
}

export const requestClerkSignIn = (): void => {
  if (!isClerkConfigured || typeof window === 'undefined') return

  const clerk = getClerk()
  if (typeof clerk?.openSignIn === 'function') {
    void clerk.openSignIn()
    return
  }

  window.dispatchEvent(new CustomEvent(openSignInEventName))
}

const requestClerkUserProfile = (): void => {
  if (!isClerkConfigured) return

  const clerk = getClerk()
  if (typeof clerk?.openUserProfile === 'function') {
    void clerk.openUserProfile()
    return
  }

  requestClerkSignIn()
}

const useClerkSnapshot = () => {
  const [snapshot, setSnapshot] = useState(readClerkSnapshot)

  useEffect(() => {
    if (!isClerkConfigured || typeof window === 'undefined') return

    let cancelled = false
    const scheduledSyncs: number[] = []
    const syncSnapshot = () => {
      if (cancelled) return
      const nextSnapshot = readClerkSnapshot()
      setSnapshot((current) =>
        current.isSignedIn === nextSnapshot.isSignedIn &&
        current.session === nextSnapshot.session &&
        current.user === nextSnapshot.user
          ? current
          : nextSnapshot,
      )
    }
    const scheduleSyncWindow = () => {
      syncSnapshot()
      for (const delay of [50, 250, 750, 1500, 3000, 6000, 10000]) {
        scheduledSyncs.push(window.setTimeout(syncSnapshot, delay))
      }
    }
    const clerk = getClerk()
    const unsubscribe = clerk?.addListener?.(syncSnapshot)

    scheduleSyncWindow()
    window.addEventListener('focus', syncSnapshot)
    window.addEventListener(openSignInEventName, scheduleSyncWindow)

    return () => {
      cancelled = true
      if (typeof unsubscribe === 'function') unsubscribe()
      for (const handle of scheduledSyncs) window.clearTimeout(handle)
      window.removeEventListener('focus', syncSnapshot)
      window.removeEventListener(openSignInEventName, scheduleSyncWindow)
    }
  }, [])

  return snapshot
}

/** Anonymous routes must not import Clerk React hooks until sign-in is explicit. */
export const useOptionalAuth = (): OptionalAuth => {
  const snapshot = useClerkSnapshot()

  return useMemo(
    () =>
      isClerkConfigured
        ? {
            getToken: getOptionalToken,
            isSignedIn: snapshot.isSignedIn,
          }
        : anonymousAuth,
    [snapshot.isSignedIn],
  )
}

export const useOptionalClerk = (): OptionalClerk => {
  const snapshot = useClerkSnapshot()

  return useMemo(
    () =>
      isClerkConfigured
        ? {
            openSignIn: requestClerkSignIn,
            openUserProfile: requestClerkUserProfile,
            session: snapshot.session,
            user: snapshot.user,
          }
        : anonymousClerk,
    [snapshot.session, snapshot.user],
  )
}
