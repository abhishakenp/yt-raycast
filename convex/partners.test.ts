/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const ISSUER = 'https://clerk.test'

vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })

function userId(subject: string): string {
  return `${ISSUER}|${subject}`
}

function asUser(
  t: ReturnType<typeof convexTest>,
  subject: string,
  email = `${subject}@example.com`,
) {
  return t.withIdentity({
    email,
    issuer: ISSUER,
    subject,
    tokenIdentifier: userId(subject),
  })
}

describe('partners attribution', () => {
  beforeEach(() => {
    vi.stubEnv('DUB_PARTNERS_ENABLED', 'true')
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('returns the authenticated email verification claim', async () => {
    const t = convexTest(schema, modules)
    const identity = t.withIdentity({
      email: 'alice@example.com',
      emailVerified: true,
      issuer: ISSUER,
      subject: 'alice',
      tokenIdentifier: userId('alice'),
    })

    await expect(
      identity.query(api.partners.getMyPartnerIdentity, {}),
    ).resolves.toMatchObject({
      email: 'alice@example.com',
      emailVerified: true,
      tenantId: userId('alice'),
    })
  })

  it('claims Dub attribution and enqueues one durable lead event', async () => {
    vi.useFakeTimers()
    const t = convexTest(schema, modules)

    await expect(
      asUser(t, 'alice').mutation(api.partners.claimDubAttribution, {
        clickId: 'click_123',
      }),
    ).resolves.toEqual({ claimed: true, reason: 'claimed' })

    const state = await t.run(async (ctx) => ({
      attributions: await ctx.db.query('acquisitionAttributions').take(10),
      outbox: await ctx.db.query('dubEventOutbox').take(10),
      scheduled: await ctx.db.system.query('_scheduled_functions').take(10),
    }))

    expect(state.attributions).toHaveLength(1)
    expect(state.attributions[0]).toMatchObject({
      source: 'dub_partner',
      sourceKey: 'click_123',
      userId: userId('alice'),
    })
    expect(state.outbox).toHaveLength(1)
    expect(state.outbox[0]).toMatchObject({
      attemptCount: 0,
      clickId: 'click_123',
      idempotencyKey: `dub:lead:${userId('alice')}`,
      kind: 'lead',
      status: 'pending',
      userId: userId('alice'),
    })
    expect(state.scheduled).toEqual([
      expect.objectContaining({
        name: 'partners_worker:processOutboxEvent',
        state: { kind: 'pending' },
      }),
    ])
  })

  it('does not duplicate attribution or lead events', async () => {
    const t = convexTest(schema, modules)
    const alice = asUser(t, 'alice')

    await alice.mutation(api.partners.claimDubAttribution, {
      clickId: 'click_first',
    })
    await expect(
      alice.mutation(api.partners.claimDubAttribution, {
        clickId: 'click_second',
      }),
    ).resolves.toEqual({ claimed: false, reason: 'already_claimed' })

    const counts = await t.run(async (ctx) => ({
      attributions: (await ctx.db.query('acquisitionAttributions').take(10))
        .length,
      outbox: (await ctx.db.query('dubEventOutbox').take(10)).length,
    }))

    expect(counts).toEqual({ attributions: 1, outbox: 1 })
  })

  it('lazily backfills a legacy native referral and lets it win', async () => {
    const t = convexTest(schema, modules)
    await t.run(async (ctx) => {
      await ctx.db.insert('referrals', {
        code: 'NATIVE01',
        createdAt: 100,
        emailSource: 'identity',
        referredUserId: userId('alice'),
        referrerUserId: userId('owner'),
        status: 'pending',
        updatedAt: 100,
      })
    })

    await expect(
      asUser(t, 'alice').mutation(api.partners.claimDubAttribution, {
        clickId: 'click_late',
      }),
    ).resolves.toEqual({
      claimed: false,
      reason: 'native_referral_won',
    })

    const attribution = await t.run(async (ctx) =>
      ctx.db
        .query('acquisitionAttributions')
        .withIndex('by_userId', (index) => index.eq('userId', userId('alice')))
        .unique(),
    )
    expect(attribution).toMatchObject({
      claimedAt: 100,
      source: 'native_referral',
      sourceKey: 'NATIVE01',
    })
  })

  it('prevents a later native referral from replacing Dub attribution', async () => {
    const t = convexTest(schema, modules)
    await asUser(t, 'alice').mutation(api.partners.claimDubAttribution, {
      clickId: 'click_first',
    })
    const { code } = await asUser(t, 'owner').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )

    await expect(
      asUser(t, 'alice').mutation(api.referrals.recordReferralSignup, {
        code,
      }),
    ).resolves.toEqual({ recorded: false, reason: 'already_referred' })

    const referrals = await t.run(async (ctx) =>
      ctx.db.query('referrals').take(10),
    )
    expect(referrals).toHaveLength(0)
  })

  it('rejects unauthenticated attribution claims', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.partners.claimDubAttribution, {
        clickId: 'click_123',
      }),
    ).rejects.toThrow('Sign in to access partners')
  })
})
