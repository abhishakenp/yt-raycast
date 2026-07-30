/**
 * React hook that identifies the current Clerk user in LogRocket.
 *
 * Watches the Clerk snapshot and calls `identifyLogRocketUser` whenever
 * the signed-in user changes. In production, this tags every session
 * with the user's Clerk ID, name, and email so sessions are searchable
 * in the LogRocket dashboard.
 */

import { useEffect } from 'react'

import { useOptionalClerk } from '@/shared/auth/use-optional-auth'
import { identifyLogRocketUser, isLogRocketEnabled } from './logrocket-init'

export function useLogRocketIdentify(): void {
  const clerk = useOptionalClerk()

  useEffect(() => {
    if (!isLogRocketEnabled()) return
    if (!clerk.user) return

    const user = clerk.user
    const name =
      (user as unknown as { firstName?: string; lastName?: string })
        .firstName ??
      (user as unknown as { username?: string }).username ??
      undefined
    const fullName =
      name &&
      (user as unknown as { lastName?: string }).lastName
        ? `${name} ${(user as unknown as { lastName?: string }).lastName}`
        : name

    identifyLogRocketUser({
      userId: user.id,
      name: fullName,
      email: (user as unknown as { primaryEmailAddress?: { emailAddress?: string } })
        .primaryEmailAddress?.emailAddress,
      traits: {
        clerkId: user.id,
        isAdmin:
          user.publicMetadata?.system_role === 'admin' ||
          user.publicMetadata?.systemRole === 'admin',
      },
    })
  }, [clerk.user])
}
