import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

async function createGeneratedSession(
  t: ReturnType<typeof convexTest>,
  {
    prompt,
    isPrivate = false,
    anonymousClientId,
  }: {
    prompt: string
    isPrivate?: boolean
    anonymousClientId: string
  },
) {
  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate,
    workspace: `workspace_${anonymousClientId}_${Math.random().toString(36).slice(2)}`,
    anonymousClientId,
  })

  await t.mutation(internal.sessions.completeGenerationInternal, {
    sessionId,
    siteSpecJson: JSON.stringify({ brand: prompt, modules: {} }),
    openUiSource: `$page = "Home"\nroot = Text("${prompt}")`,
    tasks: [
      {
        id: 'homepage',
        label: 'Generate homepage',
        status: 'DONE',
      },
    ],
    elapsed: 12345,
  })

  return sessionId
}

test('listPublicSessions returns only public visible sessions with gallery metadata', async () => {
  const t = convexTest(schema, modules)

  const publicSessionId = await createGeneratedSession(t, {
    prompt: 'SaaS analytics dashboard for product teams',
    anonymousClientId: 'gallery-public',
  })
  await createGeneratedSession(t, {
    prompt: 'Private portfolio studio preview',
    isPrivate: true,
    anonymousClientId: 'gallery-private',
  })

  const gallery = await t.query(api.sessions.listPublicSessions, {
    limit: 12,
    page: 1,
  })

  expect(gallery.items).toHaveLength(1)
  expect(gallery.items[0]).toMatchObject({
    sessionId: publicSessionId,
    prompt: 'SaaS analytics dashboard for product teams',
    elapsed: 12345,
    openuiReady: true,
  })
  expect(gallery.items[0].categories).toContain('saas')
  expect(gallery.availableCategories).toContainEqual({
    value: 'saas',
    label: 'Saas',
    count: 1,
  })
  expect(gallery.total).toBe(1)
  expect(gallery.hasNext).toBe(false)
  expect(gallery.hasPrev).toBe(false)
}, 15_000)

test("listOwnedSessions returns the caller's public AND private sessions (anonymous owner)", async () => {
  const t = convexTest(schema, modules)

  const minePublic = await createGeneratedSession(t, {
    prompt: 'My public SaaS dashboard',
    anonymousClientId: 'owner-anon',
  })
  const minePrivate = await createGeneratedSession(t, {
    prompt: 'My private portfolio studio',
    isPrivate: true,
    anonymousClientId: 'owner-anon',
  })
  // Another user's sessions — must NOT appear.
  await createGeneratedSession(t, {
    prompt: 'Someone else public blog',
    anonymousClientId: 'other-anon',
  })
  await createGeneratedSession(t, {
    prompt: 'Someone else private store',
    isPrivate: true,
    anonymousClientId: 'other-anon',
  })

  const mine = await t.query(api.sessions.listOwnedSessions, {
    anonymousClientId: 'owner-anon',
    limit: 12,
    page: 1,
  })

  expect(mine.items.map((item) => item.sessionId).sort()).toEqual(
    [minePublic, minePrivate].sort(),
  )
  expect(mine.total).toBe(2)
  // Private session is included for the owner.
  expect(mine.items.some((item) => item.sessionId === minePrivate)).toBe(true)
}, 15_000)

test("listOwnedSessions returns the caller's sessions (signed-in owner) and excludes others", async () => {
  const t = convexTest(schema, modules)
  const ISS = 'https://clerk.test'
  const asUser = (tt: ReturnType<typeof convexTest>, user: string) =>
    tt.withIdentity({
      tokenIdentifier: `${ISS}|${user}`,
      subject: user,
      issuer: ISS,
    })

  const minePublic = await asUser(t, 'alice').mutation(api.sessions.create, {
    prompt: 'Alice public analytics',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_alice',
  })
  await asUser(t, 'alice').mutation(
    internal.sessions.completeGenerationInternal,
    {
      sessionId: minePublic.sessionId,
      siteSpecJson: JSON.stringify({ brand: 'Alice', modules: {} }),
      openUiSource: `$page = "Home"\nroot = Text("Alice")`,
      tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
      elapsed: 1000,
    },
  )

  // Bob's session — must not appear for Alice.
  const bobSession = await asUser(t, 'bob').mutation(api.sessions.create, {
    prompt: 'Bob private dashboard',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: true,
    workspace: 'workspace_bob',
  })
  await asUser(t, 'bob').mutation(
    internal.sessions.completeGenerationInternal,
    {
      sessionId: bobSession.sessionId,
      siteSpecJson: JSON.stringify({ brand: 'Bob', modules: {} }),
      openUiSource: `$page = "Home"\nroot = Text("Bob")`,
      tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
      elapsed: 1000,
    },
  )

  const aliceMine = await asUser(t, 'alice').query(
    api.sessions.listOwnedSessions,
    {
      limit: 12,
      page: 1,
    },
  )

  expect(
    aliceMine.items.map((item: Record<string, unknown>) => item.sessionId),
  ).toEqual([minePublic.sessionId])
  expect(aliceMine.total).toBe(1)
}, 15_000)

test('listOwnedSessions returns empty when no identity and no anonymousClientId', async () => {
  const t = convexTest(schema, modules)

  await createGeneratedSession(t, {
    prompt: 'Anon public session',
    anonymousClientId: 'someone-anon',
  })

  const mine = await t.query(api.sessions.listOwnedSessions, {
    limit: 12,
    page: 1,
  })

  expect(mine.items).toHaveLength(0)
  expect(mine.total).toBe(0)
}, 15_000)

test('listOwnedSessions returns sessions sorted newest-first by createdAt', async () => {
  const t = convexTest(schema, modules)

  const first = await createGeneratedSession(t, {
    prompt: 'Oldest generation',
    anonymousClientId: 'sort-anon',
  })
  // Small delay so createdAt differs. convexTest uses real Date.now().
  await new Promise((resolve) => setTimeout(resolve, 5))
  const second = await createGeneratedSession(t, {
    prompt: 'Middle generation',
    anonymousClientId: 'sort-anon',
  })
  await new Promise((resolve) => setTimeout(resolve, 5))
  const third = await createGeneratedSession(t, {
    prompt: 'Newest generation',
    anonymousClientId: 'sort-anon',
  })

  const mine = await t.query(api.sessions.listOwnedSessions, {
    anonymousClientId: 'sort-anon',
    limit: 12,
    page: 1,
  })

  expect(mine.items.map((item) => item.sessionId)).toEqual([
    third,
    second,
    first,
  ])
}, 15_000)

test('claimAnonymousSessionsByClientIdMutation links all anon sessions to signed-in userId and skips already-owned', async () => {
  const t = convexTest(schema, modules)
  const ISS = 'https://clerk.test'
  const asUser = (tt: ReturnType<typeof convexTest>, user: string) =>
    tt.withIdentity({
      tokenIdentifier: `${ISS}|${user}`,
      subject: user,
      issuer: ISS,
    })

  // Create two anonymous sessions with the same anon client id.
  const anonSession1 = await createGeneratedSession(t, {
    prompt: 'Anon session one',
    anonymousClientId: 'link-anon',
  })
  const anonSession2 = await createGeneratedSession(t, {
    prompt: 'Anon session two',
    anonymousClientId: 'link-anon',
  })

  // Create a session owned by a different (already-signed-in) user with the
  // SAME anonymousClientId — this shouldn't happen in practice but the claim
  // must skip already-owned sessions.
  const bobSession = await asUser(t, 'bob').mutation(api.sessions.create, {
    prompt: 'Bob already owns this',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_bob_link',
    anonymousClientId: 'link-anon',
  })
  await asUser(t, 'bob').mutation(
    internal.sessions.completeGenerationInternal,
    {
      sessionId: bobSession.sessionId,
      siteSpecJson: JSON.stringify({ brand: 'Bob', modules: {} }),
      openUiSource: '$page = "Home"',
      tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
      elapsed: 1000,
    },
  )

  // Alice signs in and claims all her anon sessions.
  const result = await asUser(t, 'alice').mutation(
    api.sessions.claimAnonymousSessionsByClientIdMutation,
    { anonymousClientId: 'link-anon' },
  )

  expect(result.claimed).toBe(2)

  // Alice's /mine now includes the two claimed sessions.
  const aliceMine = await asUser(t, 'alice').query(
    api.sessions.listOwnedSessions,
    {
      limit: 12,
      page: 1,
    },
  )
  expect(aliceMine.total).toBe(2)
  expect(
    aliceMine.items
      .map((item: Record<string, unknown>) => item.sessionId)
      .sort(),
  ).toEqual([anonSession1, anonSession2].sort())

  // Bob's session is still Bob's — not claimed by Alice.
  const bobMine = await asUser(t, 'bob').query(api.sessions.listOwnedSessions, {
    limit: 12,
    page: 1,
  })
  expect(bobMine.total).toBe(1)
  expect(bobMine.items[0].sessionId).toBe(bobSession.sessionId)

  // Idempotent: claiming again claims 0 more.
  const result2 = await asUser(t, 'alice').mutation(
    api.sessions.claimAnonymousSessionsByClientIdMutation,
    { anonymousClientId: 'link-anon' },
  )
  expect(result2.claimed).toBe(0)
}, 15_000)

test('claimAnonymousSessionsByClientIdMutation throws AUTH_REQUIRED when not signed in', async () => {
  const t = convexTest(schema, modules)

  await createGeneratedSession(t, {
    prompt: 'Anon session',
    anonymousClientId: 'auth-required-anon',
  })

  await expect(
    t.mutation(api.sessions.claimAnonymousSessionsByClientIdMutation, {
      anonymousClientId: 'auth-required-anon',
    }),
  ).rejects.toThrow(/Sign in to claim anonymous sessions/)
}, 15_000)
