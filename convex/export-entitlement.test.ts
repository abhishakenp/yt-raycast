/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const identityFor = (userId: string) => ({
  issuer: 'https://convex.test',
  subject: userId,
  tokenIdentifier: `https://convex.test|${userId}`,
})

const createReadySession = async (
  t: ReturnType<typeof convexTest>,
  identity?: ReturnType<typeof identityFor>,
  options: { isPrivate?: boolean } = {},
) => {
  const createArgs = {
    prompt: `Export entitlement verifier ${identity?.subject ?? 'anonymous'}`,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: options.isPrivate ?? false,
    workspace: `workspace_export_entitlement_${identity?.subject ?? 'anonymous'}`,
    ...(identity === undefined
      ? {
          anonymousClientId: 'anon-export-entitlement',
          anonymousOwnerSecret: 'owner-secret',
        }
      : {}),
  }
  const created =
    identity === undefined
      ? await t.runMutation(api.sessions.create, createArgs)
      : await t.withIdentity(identity).mutation(api.sessions.create, createArgs)

  await t.runMutation(internal.sessions.completeGeneration, {
    sessionId: created.sessionId,
    html: '<html><body><main><h1>Export entitlement</h1></main></body></html>',
    openUiSource: '$page = "Home"\nroot = Text("Export entitlement")',
    siteSpecJson: JSON.stringify({
      projectName: 'Export entitlement',
      hero: { headline: 'Export entitlement' },
    }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  })

  return created.sessionId
}

test('anonymous exports are recorded as payment-required instead of badge-free ready', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await createReadySession(t)

  const result = await t.runMutation(api.sessions.createExport, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    target: 'html',
  })
  const exportRecord = await t.runQuery(api.sessions.getExport, {
    sessionId,
    target: 'html',
  })
  const stream = await t.runQuery(api.sessions.getEventStream, {
    lookup: sessionId,
  })

  expect(result).toMatchObject({
    status: 'payment_required',
    requiresPayment: true,
    entitlement: 'anonymous',
  })
  expect(exportRecord).toMatchObject({
    status: 'payment_required',
    requiresPayment: true,
  })
  expect(stream.events.map((event) => event.eventType)).toContain(
    'export_payment_required',
  )
})

test('subscribed users create badge-free ready exports', async () => {
  const t = convexTest(schema, modules)
  const identity = identityFor('subscribed-export-user')
  const sessionId = await createReadySession(t, identity)

  await t.run(async (ctx) => {
    await ctx.db.insert('subscriptions', {
      userId: identity.tokenIdentifier,
      provider: 'stripe',
      status: 'active',
      planId: 'pro',
      providerSubscriptionId: 'sub_export_entitlement',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  })

  const result = await t
    .withIdentity(identity)
    .mutation(api.sessions.createExport, {
      sessionId,
      target: 'html',
    })

  expect(result).toMatchObject({
    status: 'ready',
    requiresPayment: false,
    entitlement: 'subscription',
  })
})

test('credited users consume one credit only for a new current-preview export', async () => {
  const t = convexTest(schema, modules)
  const identity = identityFor('credited-export-user')
  const sessionId = await createReadySession(t, identity)

  await t.run(async (ctx) => {
    await ctx.db.insert('customerCredits', {
      userId: identity.tokenIdentifier,
      remaining: 2,
      updatedAt: Date.now(),
    })
  })

  const authed = t.withIdentity(identity)
  const first = await authed.mutation(api.sessions.createExport, {
    sessionId,
    target: 'next',
  })
  const second = await authed.mutation(api.sessions.createExport, {
    sessionId,
    target: 'next',
  })
  const ledger = await t.run(async (ctx) =>
    ctx.db
      .query('creditLedger')
      .withIndex('by_userId', (index) =>
        index.eq('userId', identity.tokenIdentifier),
      )
      .take(10),
  )

  expect(first).toMatchObject({
    status: 'ready',
    requiresPayment: false,
    entitlement: 'credits',
    remainingCredits: 1,
  })
  expect(second).toMatchObject({
    status: 'ready',
    requiresPayment: false,
    entitlement: 'existing',
  })
  expect(ledger).toHaveLength(1)
  expect(ledger[0]).toMatchObject({
    sessionId,
    amount: -1,
    balanceAfter: 1,
    reason: 'export',
  })
})

test('private event streams require the session owner', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await createReadySession(t, undefined, { isPrivate: true })

  await expect(
    t.runQuery(api.sessions.getEventStream, {
      lookup: sessionId,
    }),
  ).rejects.toThrow(/own this session/)

  const stream = await t.runQuery(api.sessions.getEventStream, {
    lookup: sessionId,
    anonymousOwnerSecret: 'owner-secret',
  })

  expect(stream.events.map((event) => event.eventType)).toContain(
    'preview_ready',
  )
})
