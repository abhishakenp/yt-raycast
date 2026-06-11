import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'

import { EcommerceKimiPage } from '../packages/ship-fast-blocks/src/capsules/ecommerce'
import { buildSeedPatchFromProps } from '../packages/ship-fast-lakebed/src/react'
import { createLakebedHandlerContext } from '../packages/ship-fast-lakebed/src/server'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const convexApi = api as any

const createSession = async (
  t: any,
  {
    anonymousClientId,
    prompt,
  }: {
    anonymousClientId: string
    prompt: string
  },
) =>
  await t.runMutation(api.sessions.create, {
    anonymousClientId,
    isPrivate: false,
    preferredExportTarget: 'html',
    preferredLanguage: 'en',
    prompt,
    workspace: `workspace_${anonymousClientId}`,
  })

test('lakebed session data is isolated by session and capsule', async () => {
  const t = convexTest(schema, modules) as any

  const firstSession = await createSession(t, {
    anonymousClientId: 'lakebed-one',
    prompt: 'Lakebed capsule store',
  })
  const secondSession = await createSession(t, {
    anonymousClientId: 'lakebed-two',
    prompt: 'Other capsule store',
  })

  await t.runMutation(convexApi.lakebed.mergeSessionData, {
    capsule: 'Cart',
    patch: { count: 1 },
    sessionId: firstSession.sessionId,
  })
  await t.runMutation(convexApi.lakebed.mergeSessionData, {
    capsule: 'Cart',
    patch: { count: 2 },
    sessionId: secondSession.sessionId,
  })
  await t.runMutation(convexApi.lakebed.mergeSessionData, {
    capsule: 'Wishlist',
    patch: { count: 3 },
    sessionId: firstSession.sessionId,
  })

  await expect(
    t.runQuery(convexApi.lakebed.getSessionData, {
      capsule: 'Cart',
      sessionId: firstSession.sessionId,
    }),
  ).resolves.toEqual({ count: 1 })
  await expect(
    t.runQuery(convexApi.lakebed.getSessionData, {
      capsule: 'Cart',
      sessionId: secondSession.sessionId,
    }),
  ).resolves.toEqual({ count: 2 })
  await expect(
    t.runQuery(convexApi.lakebed.getSessionData, {
      capsule: 'Wishlist',
      sessionId: firstSession.sessionId,
    }),
  ).resolves.toEqual({ count: 3 })
})

test('ecommerce capsule favorite mutation persists through lakebed session data', async () => {
  const t = convexTest(schema, modules) as any
  const { sessionId } = await createSession(t, {
    anonymousClientId: 'ecommerce-favorites',
    prompt: 'Ecommerce favorite button proof',
  })
  const capsuleName = EcommerceKimiPage.client.name
  const lakebed = EcommerceKimiPage.lakebed as any
  const product = {
    alt: 'Nike Air Max 97 Off-White sneaker in black and metallic silver colorway',
    badge: 'New',
    brand: 'Nike',
    image: '',
    name: 'Air Max 97 Off-White',
    oldPrice: '$230',
    price: '$195',
  }

  const readData = async () =>
    await t.runQuery(convexApi.lakebed.getSessionData, {
      capsule: capsuleName,
      sessionId,
    })
  const makeCtx = async () => ({
    data: await readData(),
    props: {},
  })
  const runQuery = async (name: string) => {
    const { context } = createLakebedHandlerContext({
      data: await readData(),
      props: {},
      schema: lakebed.schema,
    })

    return lakebed.queries[name](context)
  }
  const runMutation = async (name: string, ...args: unknown[]) => {
    const { context, getPatch } = createLakebedHandlerContext({
      ...(await makeCtx()),
      replaceData: (data: Record<string, unknown>) =>
        t.runMutation(convexApi.lakebed.replaceSessionData, {
          capsule: capsuleName,
          data,
          sessionId,
        }),
      schema: lakebed.schema,
      setData: (patch: Record<string, unknown>) =>
        t.runMutation(convexApi.lakebed.mergeSessionData, {
          capsule: capsuleName,
          patch,
          sessionId,
        }),
      writable: true,
    })
    const result = await lakebed.mutations[name](context, ...args)
    const patch = getPatch()

    if (Object.keys(patch).length > 0) {
      await t.runMutation(convexApi.lakebed.mergeSessionData, {
        capsule: capsuleName,
        patch,
        sessionId,
      })
    }

    return result
  }

  const seedPatch = buildSeedPatchFromProps({
    data: await readData(),
    definition: lakebed,
    props: { products: { items: [product] } },
  })
  expect(seedPatch).toMatchObject({
    products: [
      {
        brand: 'Nike',
        id: 'product-air-max-97-off-white',
        name: 'Air Max 97 Off-White',
        price: '$195',
      },
    ],
  })

  await t.runMutation(convexApi.lakebed.mergeSessionData, {
    capsule: capsuleName,
    patch: seedPatch,
    sessionId,
  })
  await expect(runQuery('products')).resolves.toHaveLength(1)

  await runMutation('addToCart', product.name)
  await runMutation('addToCart', product.name)
  await expect(runQuery('cartLines')).resolves.toMatchObject([
    {
      product: {
        name: 'Air Max 97 Off-White',
      },
      quantity: 2,
    },
  ])

  await expect(runMutation('toggleFavorite', product.name)).resolves.toBe(true)
  await expect(runQuery('favoriteProductNames')).resolves.toEqual(
    new Set([product.name]),
  )

  await expect(runMutation('toggleFavorite', product.name)).resolves.toBe(false)
  await expect(runQuery('favoriteProductNames')).resolves.toEqual(new Set())
})
