import type { ReactNode } from 'react'

import { isClerkClientEnabled } from '@/shared/auth/clerk-runtime'
import {
  useIsAdmin,
  useOptionalAuth,
  useOptionalClerk,
} from '@/shared/auth/use-optional-auth'

type SignInGateValue = {
  isLoaded: boolean
  isSignedIn: boolean | undefined
  isGated: boolean
  openSignIn: () => void
  requireSignIn: () => boolean
}

/**
 * Clerk-aware sign-in gate. Returns the current auth state plus a
 * `requireSignIn()` guard that opens the Clerk sign-in modal and returns
 * `false` when the user is signed out, or returns `true` when signed in.
 *
 * When Clerk is not configured (e.g. local dev without a publishable key) the
 * gate is a no-op: `isGated` is always `false` and `requireSignIn()` always
 * returns `true`, so gated controls keep working. Mirrors the `WaitlistGate`
 * and `useOptionalAuth` anonymous-fallback patterns.
 */
export function useSignInGate(): SignInGateValue {
  const clerkEnabled = isClerkClientEnabled()
  const isAdmin = useIsAdmin()
  const { isLoaded, isSignedIn } = useOptionalAuth()
  const clerk = useOptionalClerk()

  const isGated = clerkEnabled && !isAdmin && !(isLoaded && isSignedIn)
  const openSignIn = () => {
    if (clerkEnabled) clerk.openSignIn()
  }
  const requireSignIn = () => {
    if (!isGated) return true
    openSignIn()
    return false
  }

  return { isLoaded, isSignedIn, isGated, openSignIn, requireSignIn }
}

type SignInGateProps = {
  /** Shown when the user is signed out (or auth is still loading). */
  locked: ReactNode
  /** Shown when the user is signed in, or when Clerk is disabled. */
  children: ReactNode
}

/**
 * Declarative sign-in gate. Renders `locked` when the user is signed out or
 * auth is still resolving, and `children` otherwise. Use to swap an entire
 * control (e.g. a Radix Popover or ThemePicker) for a locked fallback so the
 * real control never mounts while gated — no click interception needed.
 */
export function SignInGate({ locked, children }: SignInGateProps) {
  const { isGated } = useSignInGate()
  return <>{isGated ? locked : children}</>
}
