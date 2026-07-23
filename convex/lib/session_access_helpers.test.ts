import { describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  assertCanReadOwnedSession,
  assertCanReadPrivateSession,
  assertCanMutateSession,
  claimAnonymousSession,
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
    Pick<TestIdentity, 'subject' | 'tokenIdentifier' | 'system_role'>
  >,
): TestIdentity {
  return {
    issuer: 'https://convex.test',
    subject: values.subject ?? 'subject',
    tokenIdentifier: values.tokenIdentifier,
    ...(values.system_role !== undefined
      ? { system_role: values.system_role }
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
          expect(['by_userId', 'by_anonymousClientIdHash']).toContain(indexName)
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
  it('returns true when system_role is admin', async () => {
    const ctx = authCtx(
      identityFor({ tokenIdentifier: 'token:admin', system_role: 'admin' }),
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
