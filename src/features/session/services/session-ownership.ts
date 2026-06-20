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

export const hashOwnerSecret = (secret: string): string =>
  createHash('sha256').update(secret).digest('hex')

export const canReadSession = (session: SessionOwnerState, actor: SessionActor): boolean =>
  session.userId === undefined ||
  session.userId === actor.userId ||
  session.anonOwnerSecretHash === hashOwnerSecret(actor.anonOwnerSecret ?? '')

export const assertCanMutateSession = (session: SessionOwnerState, actor: SessionActor): void => {
  if (devFlags.disablePaywall) return

  const isUserOwner = session.userId !== undefined && session.userId === actor.userId
  const isAnonymousOwner =
    session.userId === undefined &&
    session.anonOwnerSecretHash !== undefined &&
    session.anonOwnerSecretHash === hashOwnerSecret(actor.anonOwnerSecret ?? '')

  ;(isUserOwner || isAnonymousOwner) || (() => {
    throw createAppError('FORBIDDEN', 'You do not own this session')
  })()
}

export const claimAnonymousSession = (
  session: SessionOwnerState,
  actor: Required<Pick<SessionActor, 'userId' | 'anonOwnerSecret'>>,
): SessionOwnerState => {
  const secretMatches = session.anonOwnerSecretHash === hashOwnerSecret(actor.anonOwnerSecret)

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
