import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const convexApi = api as any
const ownerSecret = 'lakebed-owner-secret'

const identityFor = (userId: string) => ({
  issuer: 'https://convex.test',
  subject: userId,
  tokenIdentifier: `https://convex.test|${userId}`,
})

const createSession = async (
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
) => {
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

  const legacyDocs = await t.run(async (ctx: any) => {
    const docs = await ctx.db
      .query('sessionData')
      .withIndex('by_sessionId', (q: any) => q.eq('sessionId', sessionId))
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
