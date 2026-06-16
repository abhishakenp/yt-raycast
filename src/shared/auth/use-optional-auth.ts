import { useAuth } from '@clerk/tanstack-react-start'

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
  typeof clerkPublishableKey === 'string' && clerkPublishableKey.trim().length > 0

type OptionalAuth = Pick<ReturnType<typeof useAuth>, 'getToken' | 'isSignedIn'>

const anonymousAuth: OptionalAuth = {
  getToken: async () => null,
  isSignedIn: false,
}

/**
 * Clerk's `useAuth` throws if called outside a `<ClerkProvider>`. When the build
 * has no Clerk key (anonymous mode) no provider is mounted, which previously
 * white-screened the whole generate dashboard. This wrapper returns safe
 * signed-out defaults in that case so the page degrades gracefully instead of
 * crashing. `isClerkConfigured` is a build-time constant, so the conditional
 * hook call is stable for the lifetime of the bundle.
 */
export const useOptionalAuth = (): OptionalAuth =>
  isClerkConfigured ? useAuth() : anonymousAuth
