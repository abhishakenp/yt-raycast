import { afterEach, describe, expect, it } from 'vitest'

import {
  assertCanMutateSession,
  canReadSession,
  claimAnonymousSession,
  hashOwnerSecret,
} from '@/features/session/services/session-ownership'

describe('session ownership', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
  })

  it('allows a Clerk owner to mutate their session', () => {
    expect(() =>
      assertCanMutateSession({ userId: 'user_1' }, { userId: 'user_1' }),
    ).not.toThrow()
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
    process.env.DISABLE_PAYWALL = 'false'
    process.env.NODE_ENV = 'production'
    expect(() =>
      assertCanMutateSession({ userId: 'user_1' }, { userId: 'user_2' }),
    ).toThrow('You do not own this session')
  })

  it('bypasses ownership check when DISABLE_PAYWALL is true', () => {
    process.env.DISABLE_PAYWALL = 'true'
    process.env.NODE_ENV = 'development'
    expect(() =>
      assertCanMutateSession({ userId: 'user_1' }, { userId: 'user_2' }),
    ).not.toThrow()
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
