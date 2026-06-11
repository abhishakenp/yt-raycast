import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

test('provisionMedusaTenant creates or updates commerce config', async () => {
  const t = convexTest(schema, modules)

  const sessionId = await t.runMutation(api.sessions.create, {
    prompt: 'Test store',
    anonymousClientIdHash: 'test-hash',
  })

  const result = await t.runMutation(internal.sessions.provisionMedusaTenant, {
    sessionId,
    backendUrl: 'https://backend.medusa.com',
    adminUrl: 'https://admin.medusa.com',
    storefrontUrl: 'https://store.medusa.com',
  })

  expect(result.success).toBe(true)

  const config = await t.runQuery(api.sessions.getCommerceConfig, { sessionId })
  expect(config?.backendUrl).toBe('https://backend.medusa.com')
})

test('syncMedusaProducts updates product count', async () => {
  const t = convexTest(schema, modules)

  const sessionId = await t.runMutation(api.sessions.create, {
    prompt: 'Test store',
    anonymousClientIdHash: 'test-hash',
  })

  await t.runMutation(internal.sessions.provisionMedusaTenant, {
    sessionId,
    backendUrl: 'https://backend.medusa.com',
    adminUrl: 'https://admin.medusa.com',
    storefrontUrl: 'https://store.medusa.com',
  })

  const products = [
    { id: 'prod-1', title: 'Product 1', handle: 'product-1', price: 99.99 },
    { id: 'prod-2', title: 'Product 2', handle: 'product-2', price: 149.99 },
  ]

  const result = await t.runMutation(internal.sessions.syncMedusaProducts, {
    sessionId,
    products,
  })

  expect(result.synced).toBe(2)
})
