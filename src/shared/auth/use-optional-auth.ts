import { useEffect, useMemo, useState } from 'react'

import { isClerkClientEnabled } from './clerk-runtime'

/**
 * Build-time constant: whether Clerk is actually enabled for this bundle.
 * Delegates to `isClerkClientEnabled` so that `VITE_DISABLE_CLERK=true` is
 * honoured even when a publishable key is still present in the environment.
 * Mirrors the `isClerkConfigured` checks in HomePage/TopActions so the whole
 * app agrees on whether Clerk is mounted.
 */
const isClerkConfigured = isClerkClientEnabled()

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
  // Synchronous snapshot model has no async load phase: the auth state is always
  // resolved (absent Clerk global => anonymous). Kept for parity with consumers
  // (WaitlistGate/SignInGate) that branch on Clerk's `isLoaded`.
  isLoaded: boolean
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
  isLoaded: true,
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
            isLoaded: true,
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
