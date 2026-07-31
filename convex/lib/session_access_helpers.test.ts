import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  assertCanReadOwnedSession,
  assertCanReadPrivateSession,
  assertCanMutateSession,
  canReadPrivateSession,
  claimAnonymousSession,
  claimAnonymousSessionsByIp,
  deleteOwnedSessions,
  getUserId,
  hashOwnerSecret,
  isSessionOwner,
  isUserAdmin,
  setSessionBrandLogo,
  setSessionThemeOverride,
} from './session_access_helpers'

vi.mock('./session_export_helpers', () => ({
  areExportPaywallsDisabled: vi.fn(),
  isAuthDisabled: vi.fn(),
}))
import {
  areExportPaywallsDisabled,
  isAuthDisabled,
} from './session_export_helpers'

type AccessCtx = Parameters<typeof getUserId>[0]
type TestIdentity = NonNullable<
  Awaited<ReturnType<AccessCtx['auth']['getUserIdentity']>>
>

function identityFor(
  values: Partial<
    Pick<TestIdentity, 'subject' | 'tokenIdentifier' | 'system_role'> & {
      systemRole?: string
    }
  >,
): TestIdentity {
  return {
    issuer: 'https://convex.test',
    subject: values.subject ?? 'subject',
    tokenIdentifier: values.tokenIdentifier,
    ...(values.system_role !== undefined
      ? { system_role: values.system_role }
      : {}),
    ...(values.systemRole !== undefined
      ? { systemRole: values.systemRole }
      : {}),
  } as TestIdentity
}

function authCtx(identity: TestIdentity | null): AccessCtx {
  return {
    auth: {
      getUserIdentity: async () => identity,
    },
  }
}

const sessionId = 'session_access' as Id<'sessions'>

function sessionDoc(overrides: Partial<Doc<'sessions'>> = {}) {
  return {
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a site',
    workspace: 'default',
    createdAt: 1,
    ...overrides,
  } as Doc<'sessions'>
}

function mutationCtxForSessions(input: {
  sessions: Doc<'sessions'>[]
  identity?: TestIdentity | null
}) {
  const sessions = [...input.sessions]
  const deletedIds: Array<Id<'sessions'>> = []
  const patches: Array<{ id: Id<'sessions'>; patch: Record<string, unknown> }> =
    []

  const db = {
    get: async (id: Id<'sessions'>) =>
      sessions.find((session) => session._id === id) ?? null,
    query: (table: string) => {
      if (table !== 'sessions') {
        const emptyBuilder = {
          withIndex: () => emptyBuilder,
          filter: () => emptyBuilder,
          order: () => emptyBuilder,
          collect: async () => [],
          take: async () => [],
          first: async () => null,
          unique: async () => null,
          [Symbol.asyncIterator]: async function* () {},
        }
        return emptyBuilder
      }
      let rows = [...sessions]

      const builder = {
        withIndex: (
          indexName: string,
          applyIndex: (index: {
            eq: (field: string, value: unknown) => typeof index
          }) => void,
        ) => {
          expect([
            'by_userId',
            'by_anonymousClientIdHash',
            'by_clientIpHash',
          ]).toContain(indexName)
          const filters = new Map<string, unknown>()
          const index = {
            eq: (field: string, value: unknown) => {
              filters.set(field, value)
              return index
            },
          }

          applyIndex(index)
          rows = rows.filter((session) =>
            Array.from(filters.entries()).every(
              ([field, value]) =>
                (session as Record<string, unknown>)[field] === value,
            ),
          )

          return builder
        },
        filter: (fn: (q: unknown) => (row: Doc<'sessions'>) => boolean) => {
          const helper = {
            field: (name: string) => ({ field: name }),
            eq: (a: { field: string }, b: unknown) => (row: Doc<'sessions'>) =>
              (row as Record<string, unknown>)[a.field] === b,
          }
          rows = rows.filter(fn(helper))
          return builder
        },
        collect: async () => rows,
      }

      return builder
    },
    delete: async (id: Id<'sessions'>) => {
      deletedIds.push(id)
      const index = sessions.findIndex((session) => session._id === id)
      if (index >= 0) sessions.splice(index, 1)
    },
    patch: async (id: Id<'sessions'>, patch: Record<string, unknown>) => {
      patches.push({ id, patch })
      const session = sessions.find((next) => next._id === id)
      if (session !== undefined) Object.assign(session, patch)
    },
  } as unknown as MutationCtx['db']

  const ctx = {
    db,
    auth: authCtx(input.identity ?? null).auth,
    storage: {
      delete: async () => undefined,
    },
  } as unknown as MutationCtx

  return { ctx, sessions, deletedIds, patches }
}

describe('session access helpers', () => {
  it('hashes owner secrets with SHA-256 hex encoding', async () => {
    await expect(hashOwnerSecret('owner-secret')).resolves.toBe(
      '03f99ad2bb8f470ab4a6b65dd51dca8f63c4a36d52a66b22d706c14dbfec5983',
    )
  })

  it('uses tokenIdentifier before subject for authenticated ownership', async () => {
    const ctx = authCtx(
      identityFor({ tokenIdentifier: 'token:user', subject: 'subject' }),
    )

    await expect(getUserId(ctx)).resolves.toBe('token:user')
    await expect(isSessionOwner(ctx, { userId: 'token:user' })).resolves.toBe(
      true,
    )
  })

  it('falls back to subject when tokenIdentifier is unavailable', async () => {
    const ctx = authCtx(identityFor({ subject: 'legacy-subject' }))

    await expect(getUserId(ctx)).resolves.toBe('legacy-subject')
    await expect(
      isSessionOwner(ctx, { userId: 'legacy-subject' }),
    ).resolves.toBe(true)
  })

  it('matches anonymous sessions by hashed owner secret only', async () => {
    const anonymousHash = await hashOwnerSecret('anonymous-secret')

    await expect(
      isSessionOwner(
        authCtx(null),
        { anonOwnerSecretHash: anonymousHash },
        'anonymous-secret',
      ),
    ).resolves.toBe(true)
    await expect(
      isSessionOwner(
        authCtx(null),
        { anonOwnerSecretHash: anonymousHash },
        'wrong-secret',
      ),
    ).resolves.toBe(false)
  })

  it('allows public reads but rejects private reads from non-owners', async () => {
    await expect(
      assertCanReadPrivateSession(authCtx(null), { isPrivate: false }),
    ).resolves.toBeUndefined()

    await expect(
      assertCanReadPrivateSession(authCtx(null), {
        isPrivate: true,
        userId: 'owner',
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
        message: 'You do not own this session',
      },
    })
  })

  it('deletes only sessions owned by the authenticated caller', async () => {
    const owned = sessionDoc({
      _id: 'session_owned' as Id<'sessions'>,
      userId: 'token:user',
    })
    const other = sessionDoc({
      _id: 'session_other' as Id<'sessions'>,
      userId: 'token:other',
    })
    const { ctx, patches, sessions } = mutationCtxForSessions({
      identity: identityFor({ tokenIdentifier: 'token:user' }),
      sessions: [owned, other],
    })

    await expect(deleteOwnedSessions(ctx, {})).resolves.toEqual({ deleted: 1 })

    expect(patches).toContainEqual({
      id: owned._id,
      patch: expect.objectContaining({ deletedAt: expect.any(Number) }),
    })
    expect(sessions.find((s) => s._id === owned._id)?.deletedAt).toBeDefined()
    expect(sessions.find((s) => s._id === other._id)?.deletedAt).toBeUndefined()
  })

  it('deletes only anonymous sessions matching the hashed client id', async () => {
    const anonymousClientIdHash = await hashOwnerSecret('anon-client')
    const owned = sessionDoc({
      _id: 'session_anon_owned' as Id<'sessions'>,
      anonymousClientIdHash,
    })
    const other = sessionDoc({
      _id: 'session_anon_other' as Id<'sessions'>,
      anonymousClientIdHash: 'other_hash',
    })
    const { ctx, patches } = mutationCtxForSessions({
      sessions: [owned, other],
    })

    await expect(
      deleteOwnedSessions(ctx, { anonymousClientId: 'anon-client' }),
    ).resolves.toEqual({ deleted: 1 })

    expect(patches).toContainEqual({
      id: owned._id,
      patch: expect.objectContaining({ deletedAt: expect.any(Number) }),
    })
  })

  it('deletes one authenticated session when a matching session id is provided', async () => {
    const owned = sessionDoc({
      _id: 'session_owned_single' as Id<'sessions'>,
      userId: 'token:user',
    })
    const otherOwned = sessionDoc({
      _id: 'session_owned_other' as Id<'sessions'>,
      userId: 'token:user',
    })
    const foreign = sessionDoc({
      _id: 'session_foreign_single' as Id<'sessions'>,
      userId: 'token:other',
    })
    const { ctx, patches, sessions } = mutationCtxForSessions({
      identity: identityFor({ tokenIdentifier: 'token:user' }),
      sessions: [owned, otherOwned, foreign],
    })

    await expect(
      deleteOwnedSessions(ctx, { sessionId: owned._id }),
    ).resolves.toEqual({ deleted: 1 })

    await expect(
      deleteOwnedSessions(ctx, { sessionId: foreign._id }),
    ).resolves.toEqual({ deleted: 0 })

    expect(patches).toContainEqual({
      id: owned._id,
      patch: expect.objectContaining({ deletedAt: expect.any(Number) }),
    })
    expect(sessions.find((s) => s._id === owned._id)?.deletedAt).toBeDefined()
    expect(
      sessions.find((s) => s._id === otherOwned._id)?.deletedAt,
    ).toBeUndefined()
  })

  it('admin bypasses ownership and soft-deletes any session by id', async () => {
    const foreign = sessionDoc({
      _id: 'session_admin_target' as Id<'sessions'>,
      userId: 'token:other',
    })
    const { ctx, patches, sessions } = mutationCtxForSessions({
      identity: identityFor({
        tokenIdentifier: 'token:admin',
        system_role: 'admin',
      }),
      sessions: [foreign],
    })

    await expect(
      deleteOwnedSessions(ctx, { sessionId: foreign._id }),
    ).resolves.toEqual({ deleted: 1 })

    expect(patches).toContainEqual({
      id: foreign._id,
      patch: expect.objectContaining({ deletedAt: expect.any(Number) }),
    })
    expect(sessions.find((s) => s._id === foreign._id)?.deletedAt).toBeDefined()
  })

  it('admin cannot delete an already soft-deleted session', async () => {
    const alreadyDeleted = sessionDoc({
      _id: 'session_admin_gone' as Id<'sessions'>,
      userId: 'token:other',
      deletedAt: 1234,
    })
    const { ctx, patches } = mutationCtxForSessions({
      identity: identityFor({
        tokenIdentifier: 'token:admin',
        system_role: 'admin',
      }),
      sessions: [alreadyDeleted],
    })

    await expect(
      deleteOwnedSessions(ctx, { sessionId: alreadyDeleted._id }),
    ).resolves.toEqual({ deleted: 0 })

    expect(patches).not.toContainEqual(
      expect.objectContaining({ id: alreadyDeleted._id }),
    )
  })

  it('admin bulk delete (no sessionId) stays scoped to own sessions, not all', async () => {
    const own = sessionDoc({
      _id: 'session_admin_own' as Id<'sessions'>,
      userId: 'token:admin',
    })
    const others = sessionDoc({
      _id: 'session_admin_others' as Id<'sessions'>,
      userId: 'token:other',
    })
    const { ctx, patches } = mutationCtxForSessions({
      identity: identityFor({
        tokenIdentifier: 'token:admin',
        system_role: 'admin',
      }),
      sessions: [own, others],
    })

    await expect(deleteOwnedSessions(ctx, {})).resolves.toEqual({ deleted: 1 })

    expect(patches).toContainEqual({
      id: own._id,
      patch: expect.objectContaining({ deletedAt: expect.any(Number) }),
    })
    expect(patches).not.toContainEqual(
      expect.objectContaining({ id: others._id }),
    )
  })

  it('deletes one anonymous session when the session id and client id match', async () => {
    const anonymousClientIdHash = await hashOwnerSecret('anon-client')
    const owned = sessionDoc({
      _id: 'session_anon_single' as Id<'sessions'>,
      anonymousClientIdHash,
    })
    const otherOwned = sessionDoc({
      _id: 'session_anon_other_owned' as Id<'sessions'>,
      anonymousClientIdHash,
    })
    const foreign = sessionDoc({
      _id: 'session_anon_foreign' as Id<'sessions'>,
      anonymousClientIdHash: 'other_hash',
    })
    const { ctx, patches, sessions } = mutationCtxForSessions({
      sessions: [owned, otherOwned, foreign],
    })

    await expect(
      deleteOwnedSessions(ctx, {
        anonymousClientId: 'anon-client',
        sessionId: owned._id,
      }),
    ).resolves.toEqual({ deleted: 1 })

    await expect(
      deleteOwnedSessions(ctx, {
        anonymousClientId: 'anon-client',
        sessionId: foreign._id,
      }),
    ).resolves.toEqual({ deleted: 0 })

    expect(patches).toContainEqual({
      id: owned._id,
      patch: expect.objectContaining({ deletedAt: expect.any(Number) }),
    })
    expect(sessions.find((s) => s._id === owned._id)?.deletedAt).toBeDefined()
    expect(
      sessions.find((s) => s._id === otherOwned._id)?.deletedAt,
    ).toBeUndefined()
  })

  it('claims anonymous sessions for signed-in owners with the matching secret', async () => {
    const anonOwnerSecretHash = await hashOwnerSecret('owner-secret')
    const { ctx, patches } = mutationCtxForSessions({
      identity: identityFor({ tokenIdentifier: 'token:owner' }),
      sessions: [sessionDoc({ anonOwnerSecretHash })],
    })

    await expect(
      claimAnonymousSession(ctx, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
      }),
    ).resolves.toEqual({ sessionId })

    expect(patches).toEqual([
      {
        id: sessionId,
        patch: expect.objectContaining({
          userId: 'token:owner',
          anonOwnerSecretHash: undefined,
          updatedAt: expect.any(Number),
        }),
      },
    ])
  })

  it('rejects anonymous claims without auth, matching sessions, or matching secrets', async () => {
    await expect(
      claimAnonymousSession(
        mutationCtxForSessions({
          sessions: [sessionDoc({ anonOwnerSecretHash: 'hash' })],
        }).ctx,
        { sessionId, anonymousOwnerSecret: 'owner-secret' },
      ),
    ).rejects.toMatchObject({ data: { code: 'AUTH_REQUIRED' } })

    await expect(
      claimAnonymousSession(
        mutationCtxForSessions({
          identity: identityFor({ tokenIdentifier: 'token:owner' }),
          sessions: [],
        }).ctx,
        { sessionId, anonymousOwnerSecret: 'owner-secret' },
      ),
    ).rejects.toMatchObject({ data: { code: 'NOT_FOUND' } })

    await expect(
      claimAnonymousSession(
        mutationCtxForSessions({
          identity: identityFor({ tokenIdentifier: 'token:owner' }),
          sessions: [sessionDoc({ userId: 'token:other' })],
        }).ctx,
        { sessionId, anonymousOwnerSecret: 'owner-secret' },
      ),
    ).rejects.toMatchObject({ data: { code: 'ALREADY_OWNED' } })

    await expect(
      claimAnonymousSession(
        mutationCtxForSessions({
          identity: identityFor({ tokenIdentifier: 'token:owner' }),
          sessions: [sessionDoc({ anonOwnerSecretHash: 'wrong_hash' })],
        }).ctx,
        { sessionId, anonymousOwnerSecret: 'owner-secret' },
      ),
    ).rejects.toMatchObject({ data: { code: 'FORBIDDEN' } })
  })

  it('sets theme overrides only for mutable sessions', async () => {
    const { ctx, patches } = mutationCtxForSessions({
      identity: identityFor({ tokenIdentifier: 'token:owner' }),
      sessions: [sessionDoc({ userId: 'token:owner' })],
    })

    await expect(
      setSessionThemeOverride(ctx, { sessionId, themeOverride: 'noir' }),
    ).resolves.toBeUndefined()
    await expect(
      setSessionThemeOverride(ctx, { sessionId, themeOverride: null }),
    ).resolves.toBeUndefined()
    await expect(
      setSessionThemeOverride(ctx, { sessionId, themeMode: 'light' }),
    ).resolves.toBeUndefined()

    expect(patches).toEqual([
      {
        id: sessionId,
        patch: { themeOverride: 'noir', updatedAt: expect.any(Number) },
      },
      {
        id: sessionId,
        patch: { themeOverride: undefined, updatedAt: expect.any(Number) },
      },
      {
        id: sessionId,
        patch: { themeMode: 'light', updatedAt: expect.any(Number) },
      },
    ])
  })

  it('persists and clears selected brand logos only for mutable sessions', async () => {
    const { ctx, patches } = mutationCtxForSessions({
      identity: identityFor({ tokenIdentifier: 'token:owner' }),
      sessions: [sessionDoc({ userId: 'token:owner' })],
    })

    const brandLogo = {
      name: 'Linear',
      domain: 'linear.app',
      brandId: 'linear-id',
      icon: 'https://cdn.brandfetch.io/linear/icon.webp',
      logo: 'https://cdn.brandfetch.io/linear/logo.svg',
    }

    await expect(
      setSessionBrandLogo(ctx, { sessionId, brandLogo }),
    ).resolves.toBeUndefined()
    await expect(
      setSessionBrandLogo(ctx, { sessionId, brandLogo: null }),
    ).resolves.toBeUndefined()

    expect(patches).toEqual([
      {
        id: sessionId,
        patch: {
          selectedBrandLogo: brandLogo,
          updatedAt: expect.any(Number),
        },
      },
      {
        id: sessionId,
        patch: {
          selectedBrandLogo: undefined,
          updatedAt: expect.any(Number),
        },
      },
    ])
  })

  it('bypasses ownership check when DISABLE_PAYWALL is true', async () => {
    ;(areExportPaywallsDisabled as ReturnType<typeof vi.fn>).mockReturnValue(
      true,
    )
    const { ctx } = mutationCtxForSessions({
      identity: identityFor({ tokenIdentifier: 'token:other' }),
      sessions: [sessionDoc({ userId: 'token:owner' })],
    })

    await expect(
      assertCanMutateSession(ctx, sessionDoc({ userId: 'token:owner' })),
    ).resolves.toBeUndefined()
  })

  it('bypasses mutation ownership check when VITE_DISABLE_CLERK is true', async () => {
    ;(areExportPaywallsDisabled as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )
    ;(isAuthDisabled as ReturnType<typeof vi.fn>).mockReturnValue(true)
    const { ctx } = mutationCtxForSessions({
      identity: identityFor({ tokenIdentifier: 'token:other' }),
      sessions: [sessionDoc({ userId: 'token:owner' })],
    })

    await expect(
      assertCanMutateSession(ctx, sessionDoc({ userId: 'token:owner' })),
    ).resolves.toBeUndefined()
  })

  it('bypasses read ownership check when VITE_DISABLE_CLERK is true', async () => {
    ;(isAuthDisabled as ReturnType<typeof vi.fn>).mockReturnValue(true)
    const ctx = authCtx(identityFor({ tokenIdentifier: 'token:other' }))

    await expect(
      assertCanReadOwnedSession(ctx, { userId: 'token:owner' }, undefined),
    ).resolves.toBeUndefined()
  })
})

describe('isUserAdmin', () => {
  beforeEach(() => {
    ;(isAuthDisabled as ReturnType<typeof vi.fn>).mockReturnValue(false)
  })

  it('returns true when system_role is admin', async () => {
    const ctx = authCtx(
      identityFor({ tokenIdentifier: 'token:admin', system_role: 'admin' }),
    )
    await expect(isUserAdmin(ctx)).resolves.toBe(true)
  })

  it('returns true when systemRole (camelCase) is admin', async () => {
    const ctx = authCtx(
      identityFor({ tokenIdentifier: 'token:admin', systemRole: 'admin' }),
    )
    await expect(isUserAdmin(ctx)).resolves.toBe(true)
  })

  it('returns false when system_role is not admin', async () => {
    const ctx = authCtx(
      identityFor({ tokenIdentifier: 'token:user', system_role: 'user' }),
    )
    await expect(isUserAdmin(ctx)).resolves.toBe(false)
  })

  it('returns false when system_role is absent', async () => {
    const ctx = authCtx(identityFor({ tokenIdentifier: 'token:user' }))
    await expect(isUserAdmin(ctx)).resolves.toBe(false)
  })

  it('returns false when not authenticated', async () => {
    const ctx = authCtx(null)
    await expect(isUserAdmin(ctx)).resolves.toBe(false)
  })

  it('returns true when VITE_DISABLE_CLERK is true, even without identity', async () => {
    ;(isAuthDisabled as ReturnType<typeof vi.fn>).mockReturnValue(true)
    const ctx = authCtx(null)
    await expect(isUserAdmin(ctx)).resolves.toBe(true)
  })
})

describe('assertCanMutateSession admin bypass', () => {
  it('bypasses ownership check when user is admin', async () => {
    ;(areExportPaywallsDisabled as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )
    ;(isAuthDisabled as ReturnType<typeof vi.fn>).mockReturnValue(false)
    const { ctx } = mutationCtxForSessions({
      identity: identityFor({
        tokenIdentifier: 'token:admin',
        system_role: 'admin',
      }),
      sessions: [sessionDoc({ userId: 'token:owner' })],
    })

    await expect(
      assertCanMutateSession(ctx, sessionDoc({ userId: 'token:owner' })),
    ).resolves.toBeUndefined()
  })
})

describe('assertCanReadOwnedSession admin bypass', () => {
  it('bypasses read ownership check when user is admin', async () => {
    ;(isAuthDisabled as ReturnType<typeof vi.fn>).mockReturnValue(false)
    const ctx = authCtx(
      identityFor({
        tokenIdentifier: 'token:admin',
        system_role: 'admin',
      }),
    )

    await expect(
      assertCanReadOwnedSession(ctx, { userId: 'token:owner' }, undefined),
    ).resolves.toBeUndefined()
  })

  it('bypasses read ownership check when systemRole is admin (camelCase)', async () => {
    ;(isAuthDisabled as ReturnType<typeof vi.fn>).mockReturnValue(false)
    const ctx = authCtx(
      identityFor({
        tokenIdentifier: 'token:admin',
        systemRole: 'admin',
      }),
    )

    await expect(
      assertCanReadOwnedSession(ctx, { userId: 'token:owner' }, undefined),
    ).resolves.toBeUndefined()
  })

  it('rejects non-admin non-owner from reading owned session', async () => {
    ;(isAuthDisabled as ReturnType<typeof vi.fn>).mockReturnValue(false)
    const ctx = authCtx(identityFor({ tokenIdentifier: 'token:other' }))

    await expect(
      assertCanReadOwnedSession(ctx, { userId: 'token:owner' }, undefined),
    ).rejects.toThrow()
  })
})

describe('canReadPrivateSession admin bypass', () => {
  it('returns true for admin reading a private session they do not own', async () => {
    ;(isAuthDisabled as ReturnType<typeof vi.fn>).mockReturnValue(false)
    const ctx = authCtx(
      identityFor({
        tokenIdentifier: 'token:admin',
        system_role: 'admin',
      }),
    )

    await expect(
      canReadPrivateSession(
        ctx,
        { isPrivate: true, userId: 'token:owner' },
        undefined,
      ),
    ).resolves.toBe(true)
  })

  it('returns false for non-admin reading a private session they do not own', async () => {
    ;(isAuthDisabled as ReturnType<typeof vi.fn>).mockReturnValue(false)
    const ctx = authCtx(identityFor({ tokenIdentifier: 'token:other' }))

    await expect(
      canReadPrivateSession(
        ctx,
        { isPrivate: true, userId: 'token:owner' },
        undefined,
      ),
    ).resolves.toBe(false)
  })
})

describe('claimAnonymousSessionsByIp', () => {
  beforeEach(() => {
    vi.stubEnv('SHARE_BONUS_MUTATION_SECRET', 'test-secret')
  })

  it('links all unclaimed anonymous sessions on the IP to the signed-in userId', async () => {
    const { ctx, sessions, patches } = mutationCtxForSessions({
      identity: identityFor({ tokenIdentifier: 'token:user' }),
      sessions: [
        sessionDoc({
          _id: 's1' as Id<'sessions'>,
          clientIpHash: 'ip_a',
        }),
        sessionDoc({
          _id: 's2' as Id<'sessions'>,
          clientIpHash: 'ip_a',
        }),
        sessionDoc({
          _id: 's3' as Id<'sessions'>,
          clientIpHash: 'ip_b',
        }),
      ],
    })

    const result = await claimAnonymousSessionsByIp(ctx, {
      clientIpHash: 'ip_a',
      secret: 'test-secret',
    })

    expect(result).toEqual({ claimed: 2 })
    expect(patches).toHaveLength(2)
    expect(patches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 's1' as Id<'sessions'>,
          patch: expect.objectContaining({
            userId: 'token:user',
            anonOwnerSecretHash: undefined,
          }),
        }),
        expect.objectContaining({
          id: 's2' as Id<'sessions'>,
          patch: expect.objectContaining({
            userId: 'token:user',
            anonOwnerSecretHash: undefined,
          }),
        }),
      ]),
    )
    // s3 (different IP) is untouched.
    expect(sessions.find((s) => s._id === 's3')?.userId).toBeUndefined()
  })

  it('skips sessions already owned by anyone (including the caller)', async () => {
    const { ctx, patches } = mutationCtxForSessions({
      identity: identityFor({ tokenIdentifier: 'token:user' }),
      sessions: [
        sessionDoc({
          _id: 'owned_by_other' as Id<'sessions'>,
          clientIpHash: 'ip_a',
          userId: 'token:other',
        }),
        sessionDoc({
          _id: 'owned_by_self' as Id<'sessions'>,
          clientIpHash: 'ip_a',
          userId: 'token:user',
        }),
        sessionDoc({
          _id: 'unclaimed' as Id<'sessions'>,
          clientIpHash: 'ip_a',
        }),
      ],
    })

    const result = await claimAnonymousSessionsByIp(ctx, {
      clientIpHash: 'ip_a',
      secret: 'test-secret',
    })

    expect(result).toEqual({ claimed: 1 })
    expect(patches).toHaveLength(1)
    expect(patches[0]?.id).toBe('unclaimed' as Id<'sessions'>)
  })

  it('skips soft-deleted sessions', async () => {
    const { ctx, patches } = mutationCtxForSessions({
      identity: identityFor({ tokenIdentifier: 'token:user' }),
      sessions: [
        sessionDoc({
          _id: 'deleted' as Id<'sessions'>,
          clientIpHash: 'ip_a',
          deletedAt: 1000,
        }),
        sessionDoc({
          _id: 'alive' as Id<'sessions'>,
          clientIpHash: 'ip_a',
        }),
      ],
    })

    const result = await claimAnonymousSessionsByIp(ctx, {
      clientIpHash: 'ip_a',
      secret: 'test-secret',
    })

    expect(result).toEqual({ claimed: 1 })
    expect(patches[0]?.id).toBe('alive' as Id<'sessions'>)
  })

  it('throws AUTH_REQUIRED when not authenticated', async () => {
    const { ctx } = mutationCtxForSessions({
      identity: null,
      sessions: [],
    })

    await expect(
      claimAnonymousSessionsByIp(ctx, {
        clientIpHash: 'ip_a',
        secret: 'test-secret',
      }),
    ).rejects.toMatchObject({
      data: { code: 'AUTH_REQUIRED' },
    })
  })

  it('is idempotent: a second call claims nothing new', async () => {
    const { ctx } = mutationCtxForSessions({
      identity: identityFor({ tokenIdentifier: 'token:user' }),
      sessions: [
        sessionDoc({
          _id: 's1' as Id<'sessions'>,
          clientIpHash: 'ip_a',
        }),
      ],
    })

    const first = await claimAnonymousSessionsByIp(ctx, {
      clientIpHash: 'ip_a',
      secret: 'test-secret',
    })
    expect(first).toEqual({ claimed: 1 })

    // After the first claim, the session now has userId, so a second call
    // skips it.
    const second = await claimAnonymousSessionsByIp(ctx, {
      clientIpHash: 'ip_a',
      secret: 'test-secret',
    })
    expect(second).toEqual({ claimed: 0 })
  })
})
