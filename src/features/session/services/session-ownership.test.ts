import { describe, expect, it } from 'vitest'

import {
  assertCanMutateSession,
  canReadSession,
  claimAnonymousSession,
  hashOwnerSecret,
} from '@/features/session/services/session-ownership'

describe('session ownership', () => {
  it('allows a Clerk owner to mutate their session', () => {
    expect(() => assertCanMutateSession({ userId: 'user_1' }, { userId: 'user_1' })).not.toThrow()
  })

  it('allows anonymous mutation with a matching owner secret', () => {
    expect(() =>
      assertCanMutateSession(
        { anonOwnerSecretHash: hashOwnerSecret('secret') },
        { anonOwnerSecret: 'secret' },
      ),
    ).not.toThrow()
  })

  it('rejects wrong owners', () => {
    expect(() => assertCanMutateSession({ userId: 'user_1' }, { userId: 'user_2' })).toThrow(
      'You do not own this session',
    )
  })

  it('claims anonymous sessions for signed-in users', () => {
    const claimed = claimAnonymousSession(
      { anonOwnerSecretHash: hashOwnerSecret('secret') },
      { userId: 'user_1', anonOwnerSecret: 'secret' },
    )

    expect(claimed).toEqual({ userId: 'user_1' })
  })

  it('keeps public read available for unowned sessions', () => {
    expect(canReadSession({}, {})).toBe(true)
  })
})
