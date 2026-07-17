/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api, internal } from './_generated/api'
import { DUB_RETRY_DELAYS_MS } from './lib/dub_outbox'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const ISSUER = 'https://clerk.test'

vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })

const setupEvent = async () => {
  const t = convexTest(schema, modules)
  vi.stubEnv('DUB_PARTNERS_ENABLED', 'true')
  await t
    .withIdentity({
      email: 'alice@example.com',
      issuer: ISSUER,
      subject: 'alice',
      tokenIdentifier: `${ISSUER}|alice`,
    })
    .mutation(api.partners.claimDubAttribution, { clickId: 'click_123' })
  const event = await t.run(async (ctx) =>
    ctx.db.query('dubEventOutbox').first(),
  )
  if (!event) throw new Error('Expected a queued Dub event')
  return { event, t }
}

describe('Dub event outbox', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubEnv('DUB_PARTNERS_ENABLED', 'true')
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('uses the approved retry schedule', () => {
    expect(DUB_RETRY_DELAYS_MS).toEqual([
      60_000, 300_000, 1_800_000, 7_200_000, 21_600_000, 43_200_000, 86_400_000,
      172_800_000,
    ])
  })

  it('leases once, blocks concurrent work, and recovers an expired lease', async () => {
    const { event, t } = await setupEvent()
    const first = await t.mutation(internal.partners.claimOutboxEvent, {
      eventId: event._id,
      now: event.nextAttemptAt,
    })
    expect(first).toMatchObject({
      attemptCount: 1,
      status: 'processing',
    })
    const scheduled = await t.run(async (ctx) =>
      ctx.db.system.query('_scheduled_functions').take(10),
    )
    expect(scheduled).toHaveLength(2)

    await expect(
      t.mutation(internal.partners.claimOutboxEvent, {
        eventId: event._id,
        now: event.nextAttemptAt + 1,
      }),
    ).resolves.toBeNull()

    const recovered = await t.mutation(internal.partners.claimOutboxEvent, {
      eventId: event._id,
      now: first?.leaseExpiresAt ?? 0,
    })
    expect(recovered).toMatchObject({
      attemptCount: 2,
      status: 'processing',
    })
  })

  it('completes a leased event idempotently', async () => {
    const { event, t } = await setupEvent()
    const claimed = await t.mutation(internal.partners.claimOutboxEvent, {
      eventId: event._id,
      now: event.nextAttemptAt,
    })
    expect(claimed).not.toBeNull()

    await t.mutation(internal.partners.completeOutboxEvent, {
      eventId: event._id,
      now: event.nextAttemptAt + 10,
    })
    await t.mutation(internal.partners.completeOutboxEvent, {
      eventId: event._id,
      now: event.nextAttemptAt + 20,
    })

    const completed = await t.run(async (ctx) => ctx.db.get(event._id))
    expect(completed).toMatchObject({
      attemptCount: 1,
      status: 'completed',
    })
  })

  it('schedules a retry and dead-letters the ninth failed attempt', async () => {
    const { event, t } = await setupEvent()
    const firstAttemptAt = event.nextAttemptAt
    await t.mutation(internal.partners.claimOutboxEvent, {
      eventId: event._id,
      now: firstAttemptAt,
    })

    await expect(
      t.mutation(internal.partners.failOutboxEvent, {
        error: 'temporary failure',
        eventId: event._id,
        now: firstAttemptAt + 10,
        terminal: false,
      }),
    ).resolves.toEqual({
      deadLetter: false,
      nextAttemptAt: firstAttemptAt + 10 + DUB_RETRY_DELAYS_MS[0],
    })

    await t.run(async (ctx) => {
      await ctx.db.patch(event._id, {
        attemptCount: 9,
        status: 'processing',
      })
    })
    await expect(
      t.mutation(internal.partners.failOutboxEvent, {
        error: 'exhausted',
        eventId: event._id,
        now: firstAttemptAt + 20,
        terminal: false,
      }),
    ).resolves.toEqual({
      deadLetter: true,
      nextAttemptAt: null,
    })

    const deadLetter = await t.run(async (ctx) => ctx.db.get(event._id))
    expect(deadLetter).toMatchObject({
      attemptCount: 9,
      lastError: 'exhausted',
      status: 'dead_letter',
    })
  })
})
