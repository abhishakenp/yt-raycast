import { convexTest } from 'convex-test'
import { afterEach, expect, test, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const convexApi = api as any
const ownerSecret = 'lakebed-owner-secret'

afterEach(() => {
  vi.unstubAllEnvs()
})

function identityFor(userId: string) {
  return {
    issuer: 'https://convex.test',
    subject: userId,
    tokenIdentifier: `https://convex.test|${userId}`,
  }
}

async function createSession(
  t: any,
  {
    identity,
    anonymousClientId,
    prompt,
  }: {
    identity?: ReturnType<typeof identityFor>
    anonymousClientId: string
    prompt: string
  },
) {
  const args = {
    anonymousClientId,
    anonymousOwnerSecret: ownerSecret,
    isPrivate: false,
    preferredExportTarget: 'html',
    preferredLanguage: 'en',
    prompt,
    workspace: `workspace_${anonymousClientId}`,
  }

  return identity === undefined
    ? await t.mutation(api.sessions.create, args)
    : await t.withIdentity(identity).mutation(api.sessions.create, args)
}

test('lakebed session data is isolated by session, capsule, and user', async () => {
  const t = convexTest(schema, modules) as any
  const firstUser = identityFor('lakebed-user-one')
  const secondUser = identityFor('lakebed-user-two')

  const firstSession = await createSession(t, {
    identity: firstUser,
    anonymousClientId: 'lakebed-one',
    prompt: 'Lakebed capsule store',
  })
  const secondSession = await createSession(t, {
    identity: firstUser,
    anonymousClientId: 'lakebed-two',
    prompt: 'Other capsule store',
  })

  await t.withIdentity(firstUser).mutation(convexApi.lakebed.mergeSessionData, {
    capsule: 'Cart',
    patch: { count: 1 },
    sessionId: firstSession.sessionId,
  })
  await t
    .withIdentity(secondUser)
    .mutation(convexApi.lakebed.mergeSessionData, {
      capsule: 'Cart',
      patch: { count: 7 },
      sessionId: firstSession.sessionId,
    })
  await t.withIdentity(firstUser).mutation(convexApi.lakebed.mergeSessionData, {
    capsule: 'Cart',
    patch: { count: 2 },
    sessionId: secondSession.sessionId,
  })
  await t.withIdentity(firstUser).mutation(convexApi.lakebed.mergeSessionData, {
    capsule: 'Wishlist',
    patch: { count: 3 },
    sessionId: firstSession.sessionId,
  })

  await expect(
    t.withIdentity(firstUser).query(convexApi.lakebed.getSessionData, {
      capsule: 'Cart',
      sessionId: firstSession.sessionId,
    }),
  ).resolves.toEqual({ count: 1 })
  await expect(
    t.withIdentity(secondUser).query(convexApi.lakebed.getSessionData, {
      capsule: 'Cart',
      sessionId: firstSession.sessionId,
    }),
  ).resolves.toEqual({ count: 7 })
  await expect(
    t.withIdentity(firstUser).query(convexApi.lakebed.getSessionData, {
      capsule: 'Cart',
      sessionId: secondSession.sessionId,
    }),
  ).resolves.toEqual({ count: 2 })
  await expect(
    t.withIdentity(firstUser).query(convexApi.lakebed.getSessionData, {
      capsule: 'Wishlist',
      sessionId: firstSession.sessionId,
    }),
  ).resolves.toEqual({ count: 3 })
})

test('lakebed session data can be listed for generated admin views', async () => {
  const t = convexTest(schema, modules) as any

  const { sessionId } = await createSession(t, {
    anonymousClientId: 'lakebed-admin-list',
    prompt: 'Lakebed admin data',
  })

  await t.mutation(convexApi.lakebed.replaceSessionData, {
    anonymousOwnerSecret: ownerSecret,
    capsule: 'Store',
    data: {
      products: [{ id: 'p1', name: 'Desk' }],
    },
    sessionId,
  })
  await t.mutation(convexApi.lakebed.mergeSessionData, {
    anonymousOwnerSecret: ownerSecret,
    capsule: 'Cart',
    patch: { items: [{ productId: 'p1', quantity: 1 }] },
    sessionId,
  })

  const docs = await t.query(convexApi.lakebed.listSessionData, {
    anonymousOwnerSecret: ownerSecret,
    sessionId,
  })

  expect(docs).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        capsule: 'Store',
        data: { products: [{ id: 'p1', name: 'Desk' }] },
      }),
      expect.objectContaining({
        capsule: 'Cart',
        data: { items: [{ productId: 'p1', quantity: 1 }] },
      }),
    ]),
  )
})

test('lakebed admin listing includes legacy session data without owner keys', async () => {
  const t = convexTest(schema, modules) as any

  const { sessionId } = await createSession(t, {
    anonymousClientId: 'lakebed-admin-legacy-list',
    prompt: 'Lakebed legacy admin data',
  })

  await t.mutation(convexApi.lakebed.mergeSessionData, {
    anonymousOwnerSecret: ownerSecret,
    capsule: 'Store',
    patch: {
      cartItems: [{ id: 'cart_1', quantity: 1 }],
      favorites: [{ id: 'favorite_1' }],
      products: [{ id: 'product_1', name: 'Desk' }],
    },
    sessionId,
  })

  const legacyDocs = await t.run(async (ctx) => {
    const docs = await ctx.db
      .query('sessionData')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', sessionId))
      .collect()

    for (const doc of docs) {
      await ctx.db.patch(doc._id, {
        anonymousOwnerSecretHash: undefined,
        ownerKey: undefined,
      })
    }

    return docs
  })

  expect(legacyDocs).toHaveLength(1)

  await expect(
    t.query(convexApi.lakebed.listSessionData, {
      anonymousOwnerSecret: ownerSecret,
      sessionId,
    }),
  ).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        capsule: 'Store',
        data: expect.objectContaining({
          cartItems: [{ id: 'cart_1', quantity: 1 }],
          favorites: [{ id: 'favorite_1' }],
          products: [{ id: 'product_1', name: 'Desk' }],
        }),
      }),
    ]),
  )
})

test('lakebed writes succeed without identity or owner secret when VITE_DISABLE_CLERK is true', async () => {
  vi.stubEnv('VITE_DISABLE_CLERK', 'true')
  const t = convexTest(schema, modules) as any

  const { sessionId } = await createSession(t, {
    anonymousClientId: 'lakebed-disabled-clerk',
    prompt: 'Lakebed disabled-clerk flow',
  })

  // No identity, no anonymousOwnerSecret — would throw UNAUTHENTICATED without
  // the isAuthDisabled() bypass in getSessionActor.
  await expect(
    t.mutation(convexApi.lakebed.mergeSessionData, {
      capsule: 'Cart',
      patch: { count: 4 },
      sessionId,
    }),
  ).resolves.toEqual({ count: 4 })

  await expect(
    t.query(convexApi.lakebed.getSessionData, {
      capsule: 'Cart',
      sessionId,
    }),
  ).resolves.toEqual({ count: 4 })

  // getSessionState should report canWrite: true under disabled-clerk mode.
  await expect(
    t.query(convexApi.lakebed.getSessionState, {
      capsule: 'Cart',
      sessionId,
    }),
  ).resolves.toMatchObject({ canWrite: true, data: { count: 4 } })
})

test('lakebed writes still require auth when VITE_DISABLE_CLERK is false', async () => {
  vi.stubEnv('VITE_DISABLE_CLERK', 'false')
  const t = convexTest(schema, modules) as any

  const { sessionId } = await createSession(t, {
    anonymousClientId: 'lakebed-clerk-enabled',
    prompt: 'Lakebed clerk-enabled flow',
  })

  await expect(
    t.mutation(convexApi.lakebed.mergeSessionData, {
      capsule: 'Cart',
      patch: { count: 9 },
      sessionId,
    }),
  ).rejects.toMatchObject({ data: { code: 'UNAUTHENTICATED' } })
})
