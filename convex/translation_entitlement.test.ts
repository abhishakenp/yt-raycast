/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

function identityFor(userId: string) {
  return {
    issuer: 'https://convex.test',
    subject: userId,
    tokenIdentifier: `https://convex.test|${userId}`,
  }
}

async function createReadySession(
  t: ReturnType<typeof convexTest>,
  identity?: ReturnType<typeof identityFor>,
  options: { isPrivate?: boolean } = {},
) {
  const createArgs = {
    prompt: `Translation entitlement ${identity?.subject ?? 'anonymous'}`,
    preferredLanguage: 'en',
    preferredExportTarget: 'html' as const,
    isPrivate: options.isPrivate ?? false,
    workspace: `workspace_translation_entitlement_${identity?.subject ?? 'anonymous'}`,
    ...(identity === undefined
      ? {
          anonymousClientId: 'anon-translation-entitlement',
          anonymousOwnerSecret: 'owner-secret',
        }
      : {}),
  }
  const created =
    identity === undefined
      ? await t.mutation(api.sessions.create, createArgs)
      : await t.withIdentity(identity).mutation(api.sessions.create, createArgs)
  return created.sessionId
}

test('anonymous owner without Pro is payment_required', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await createReadySession(t)

  const result = await t.query(api.sessions.checkTranslationEntitlementQuery, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
  })

  expect(result).toMatchObject({ allowed: false, code: 'payment_required' })
})

test('anonymous caller with wrong owner secret is forbidden', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await createReadySession(t)

  const result = await t.query(api.sessions.checkTranslationEntitlementQuery, {
    sessionId,
    anonymousOwnerSecret: 'wrong-secret',
  })

  // No signed identity + wrong secret → not an owner → auth_required (prompt sign-in).
  expect(result.allowed).toBe(false)
  expect(['auth_required', 'forbidden']).toContain(result.code)
})

test('subscribed owner is allowed', async () => {
  const t = convexTest(schema, modules)
  const identity = identityFor('subscribed-translation-user')
  const sessionId = await createReadySession(t, identity)

  await t.run(async (ctx) => {
    await ctx.db.insert('subscriptions', {
      userId: identity.tokenIdentifier,
      provider: 'stripe',
      status: 'active',
      planId: 'pro',
      providerSubscriptionId: 'sub_translation_entitlement',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  })

  const result = await t
    .withIdentity(identity)
    .query(api.sessions.checkTranslationEntitlementQuery, {
      sessionId,
    })

  expect(result).toMatchObject({ allowed: true, code: 'ok' })
})

test('credited owner is allowed (credits grant Pro-tier export entitlement)', async () => {
  const t = convexTest(schema, modules)
  const identity = identityFor('credited-translation-user')
  const sessionId = await createReadySession(t, identity)

  await t.run(async (ctx) => {
    await ctx.db.insert('customerCredits', {
      userId: identity.tokenIdentifier,
      remaining: 2,
      updatedAt: Date.now(),
    })
  })

  const result = await t
    .withIdentity(identity)
    .query(api.sessions.checkTranslationEntitlementQuery, {
      sessionId,
    })

  expect(result).toMatchObject({ allowed: true, code: 'ok' })
})

test('non-owner signed-in user is forbidden', async () => {
  const t = convexTest(schema, modules)
  const ownerId = identityFor('translation-owner')
  const sessionId = await createReadySession(t, ownerId)

  const otherIdentity = identityFor('translation-other-user')
  const result = await t
    .withIdentity(otherIdentity)
    .query(api.sessions.checkTranslationEntitlementQuery, {
      sessionId,
    })

  expect(result).toMatchObject({ allowed: false, code: 'forbidden' })
})

test('deleted session is not_found', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await createReadySession(t)

  await t.run(async (ctx) => {
    await ctx.db.patch(sessionId, { deletedAt: Date.now() })
  })

  const result = await t.query(api.sessions.checkTranslationEntitlementQuery, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
  })

  expect(result).toMatchObject({ allowed: false, code: 'not_found' })
})

test('private session requires owner secret', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await createReadySession(t, undefined, { isPrivate: true })

  // No secret → not an owner.
  const blocked = await t.query(api.sessions.checkTranslationEntitlementQuery, {
    sessionId,
  })
  expect(blocked.allowed).toBe(false)

  // Correct secret → owner (still subject to Pro check → payment_required for anon).
  const withSecret = await t.query(
    api.sessions.checkTranslationEntitlementQuery,
    {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
    },
  )
  expect(withSecret.code).toBe('payment_required')
})
