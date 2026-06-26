import { Waitlist } from '@clerk/tanstack-react-start'
import type { ReactNode } from 'react'

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
 * In Clerk Waitlist mode, only approved users can sign in. `isSignedIn === true`
 * means the user has been approved from the waitlist (or was an existing user).
 * Non-approved users see the `<Waitlist />` component instead of the prompt form.
 *
 * A loading state is shown while Clerk resolves auth state to prevent a flash
 * of the waitlist form for signed-in users.
 */
export const WaitlistGate = ({ children }: WaitlistGateProps) => {
  const { isLoaded, isSignedIn } = useOptionalAuth()

  if (!isLoaded) return <WaitlistLoading />
  if (!isSignedIn) return <Waitlist afterJoinWaitlistUrl="/" />

  return <>{children}</>
}
