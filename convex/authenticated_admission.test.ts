/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'
import {
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  RATE_WINDOW_MS,
} from '../src/billing/constants'

const modules = import.meta.glob('./**/*.ts')

function identityFor(userId: string) {
  return {
    issuer: 'https://convex.test',
    subject: userId,
    tokenIdentifier: `https://convex.test|${userId}`,
  }
}

function createPayload(stamp: string) {
  return {
    prompt: `Authenticated quota verifier site ${stamp}`,
    preferredLanguage: 'en',
    preferredExportTarget: 'html' as const,
    isPrivate: false,
    workspace: `workspace_authenticated_quota_${stamp}`,
  }
}

afterEach(() => {
  delete process.env.IS_DEV
  delete process.env.DISABLE_LIMIT
})

test('authenticated free users are capped by monthly quota at the live mutation boundary', async () => {
  const t = convexTest(schema, modules)
  const identity = identityFor('free-user')
  const authed = t.withIdentity(identity)
  const now = Date.now()

  await t.run(async (ctx) => {
    for (let index = 0; index < MAX_FREE_PER_MONTH; index += 1) {
      await ctx.db.insert('sessions', {
        userId: identity.tokenIdentifier,
        prompt: `Seeded free quota session ${index}`,
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        createdAt: now - RATE_WINDOW_MS - 1000 - index,
      })
    }
  })

  await expect(
    authed.mutation(api.sessions.create, createPayload('free-blocked')),
  ).rejects.toMatchObject({
    data: expect.objectContaining({
      code: 'QUOTA_EXCEEDED',
      message: 'Monthly quota exhausted',
    }),
  })
})

test('authenticated paid users use the paid monthly quota and store auth ownership', async () => {
  const t = convexTest(schema, modules)
  const identity = identityFor('paid-user')
  const authed = t.withIdentity(identity)
  const now = Date.now()

  await t.run(async (ctx) => {
    for (let index = 0; index < MAX_FREE_PER_MONTH; index += 1) {
      await ctx.db.insert('sessions', {
        userId: identity.tokenIdentifier,
        prompt: `Seeded paid quota session ${index}`,
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        createdAt: now - RATE_WINDOW_MS - 1000 - index,
      })
    }

    await ctx.db.insert('subscriptions', {
      userId: identity.tokenIdentifier,
      provider: 'stripe',
      status: 'active',
      planId: 'pro',
      providerSubscriptionId: 'sub_paid_user',
      createdAt: now,
      updatedAt: now,
    })
  })

  const created = await authed.mutation(
    api.sessions.create,
    createPayload('paid-allowed'),
  )

  expect(created.remaining).toBe(MAX_PAID_PER_MONTH - MAX_FREE_PER_MONTH - 1)

  const stored = await t.run(async (ctx) => ctx.db.get(created.sessionId))
  expect(stored?.userId).toBe(identity.tokenIdentifier)
  expect(stored?.anonymousClientIdHash).toBeUndefined()
  expect(stored?.anonOwnerSecretHash).toBeUndefined()
})

test('Convex dev mode bypasses anonymous daily quota at the live mutation boundary', async () => {
  process.env.IS_DEV = 'true'

  const t = convexTest(schema, modules)
  const now = Date.now()
  const anonymousClientId = 'dev-mode-anonymous-client'

  await t.run(async (ctx) => {
    for (let index = 0; index < 3; index += 1) {
      await ctx.db.insert('sessions', {
        anonymousClientIdHash: await crypto.subtle
          .digest('SHA-256', new TextEncoder().encode(anonymousClientId))
          .then((buffer) =>
            Array.from(new Uint8Array(buffer), (byte) =>
              byte.toString(16).padStart(2, '0'),
            ).join(''),
          ),
        prompt: `Seeded anonymous quota session ${index}`,
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        createdAt: now - RATE_WINDOW_MS - 1000 - index,
      })
    }
  })

  await expect(
    t.mutation(api.sessions.create, {
      ...createPayload('anonymous-dev-mode-allowed'),
      anonymousClientId,
      anonymousOwnerSecret: 'owner-secret',
    }),
  ).resolves.toMatchObject({
    remaining: expect.any(Number),
  })
})
