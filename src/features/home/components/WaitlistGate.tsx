import { Waitlist } from '@clerk/tanstack-react-start'
import type { ReactNode } from 'react'

import { isClerkClientEnabled } from '@/shared/auth/clerk-runtime'
import { useClerkSignUpMode } from '@/shared/auth/use-clerk-signup-mode'
import { useOptionalAuth } from '@/shared/auth/use-optional-auth'

type WaitlistGateProps = {
  children: ReactNode
}

const WaitlistLoading = () => (
  <div
    className="flex min-h-[200px] w-full items-center justify-center"
    aria-label="Loading"
  >
    <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-cyan-300" />
  </div>
)

/**
 * Gates the prompt input behind Clerk's waitlist mode.
 *
 * Reads the **live** sign-up mode from Clerk's Frontend API environment
 * (`window.Clerk.__internal_environment.userSettings.signUp.mode`), which
 * reflects the dashboard "Enable waitlist" toggle in real time — no redeploy
 * needed to turn the waitlist UI on/off.
 *
 * - `mode === 'waitlist'`: only approved users (signed in) see the prompt form;
 *   non-approved users see `<Waitlist />`.
 * - `mode === 'public' | 'restricted'`: everyone sees the prompt form.
 * - `mode === undefined` (SSR or Clerk still loading): loading spinner shown
 *   to avoid a flash of the wrong UI.
 */
export function WaitlistGate({ children }: WaitlistGateProps) {
  const isClerkEnabled = isClerkClientEnabled()
  const { isLoaded, isSignedIn } = useOptionalAuth()
  const signUpMode = useClerkSignUpMode()

  // Bypass waitlist on localhost for development (skip in test environment)
  if (
    typeof window !== 'undefined' &&
    import.meta.env.MODE !== 'test' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return <>{children}</>
  }

  if (!isClerkEnabled) return <>{children}</>

  // Waitlist mode is OFF — let everyone through
  if (signUpMode && signUpMode !== 'waitlist') return <>{children}</>

  // Waitlist mode is ON — gate behind auth
  if (signUpMode === 'waitlist') {
    if (!isLoaded) return <WaitlistLoading />
    if (!isSignedIn) return <Waitlist afterJoinWaitlistUrl="/" />
    return <>{children}</>
  }

  // Mode unknown (SSR or Clerk still loading) — show loading to avoid flash
  return <WaitlistLoading />
}
