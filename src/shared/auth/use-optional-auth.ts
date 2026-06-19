import { useAuth, useClerk } from '@clerk/tanstack-react-start'

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

type OptionalAuth = Pick<ReturnType<typeof useAuth>, 'getToken' | 'isSignedIn'>
type OptionalClerk = Pick<
  ReturnType<typeof useClerk>,
  'openSignIn' | 'openUserProfile' | 'session' | 'user'
>

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

/**
 * Clerk's `useAuth` throws if called outside a `<ClerkProvider>`. Anonymous
 * routes can intentionally avoid that provider even when a Clerk key exists, so
 * this wrapper returns signed-out defaults instead of crashing the page.
 */
export const useOptionalAuth = (): OptionalAuth => {
  if (!isClerkConfigured) return anonymousAuth

  try {
    return useAuth()
  } catch {
    return anonymousAuth
  }
}

export const useOptionalClerk = (): OptionalClerk => {
  if (!isClerkConfigured) return anonymousClerk

  try {
    return useClerk()
  } catch {
    return anonymousClerk
  }
}
