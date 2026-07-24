import { createHash } from 'node:crypto'

import { createAppError } from '@/shared/errors/app-error'
import { devFlags } from '@/lib/dev-flags'

export type SessionOwnerState = {
  userId?: string
  anonOwnerSecretHash?: string
}

export type SessionActor = {
  userId?: string
  anonOwnerSecret?: string
}

export function hashOwnerSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

export function canReadSession(
  session: SessionOwnerState,
  actor: SessionActor,
): boolean {
  return (
    session.userId === undefined ||
    session.userId === actor.userId ||
    session.anonOwnerSecretHash === hashOwnerSecret(actor.anonOwnerSecret ?? '')
  )
}

export function assertCanMutateSession(
  session: SessionOwnerState,
  actor: SessionActor,
  isAdmin = false,
): void {
  if (devFlags.disablePaywall || isAdmin) return

  const isUserOwner =
    session.userId !== undefined && session.userId === actor.userId
  const isAnonymousOwner =
    session.userId === undefined &&
    session.anonOwnerSecretHash !== undefined &&
    session.anonOwnerSecretHash === hashOwnerSecret(actor.anonOwnerSecret ?? '')

  isUserOwner ||
    isAnonymousOwner ||
    (() => {
      throw createAppError('FORBIDDEN', 'You do not own this session')
    })()
}

export function claimAnonymousSession(
  session: SessionOwnerState,
  actor: Required<Pick<SessionActor, 'userId' | 'anonOwnerSecret'>>,
): SessionOwnerState {
  const secretMatches =
    session.anonOwnerSecretHash === hashOwnerSecret(actor.anonOwnerSecret)

  return session.userId !== undefined
    ? (() => {
        throw createAppError('FORBIDDEN', 'Session is already owned')
      })()
    : secretMatches
      ? {
          userId: actor.userId,
        }
      : (() => {
          throw createAppError('FORBIDDEN', 'Invalid anonymous owner secret')
        })()
}
