/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const dubMocks = vi.hoisted(() => {
  const client = {
    commissions: {
      list: vi.fn(async () => ({ result: [] })),
      update: vi.fn(async () => ({})),
    },
    track: {
      lead: vi.fn(async () => ({})),
      sale: vi.fn(async () => ({})),
    },
  }
  return {
    client,
    constructor: vi.fn(function DubMock() {
      return client
    }),
  }
})

const notificationMocks = vi.hoisted(() => ({
  slack: vi.fn(async () => ({ sent: true })),
  telegram: vi.fn(async () => ({ sent: false })),
}))

vi.mock('dub', () => ({
  Dub: dubMocks.constructor,
}))

vi.mock('./lib/session_operational_notifications', () => ({
  sendSlackOperationalMessage: notificationMocks.slack,
  sendTelegramOperationalMessage: notificationMocks.telegram,
}))

async function setupEvent(attemptCount = 0) {
  const t = convexTest(schema, modules)
  const event = await t.run(async (ctx) => {
    const eventId = await ctx.db.insert('dubEventOutbox', {
      attemptCount,
      clickId: 'click_123',
      createdAt: 100,
      customerEmail: 'alice@example.com',
      idempotencyKey: 'dub:lead:https://clerk.test|alice',
      kind: 'lead',
      nextAttemptAt: 0,
      status: 'pending',
      updatedAt: 100,
      userId: 'https://clerk.test|alice',
    })
    return await ctx.db.get(eventId)
  })
  if (!event) throw new Error('Expected a queued Dub event')
  return { event, t }
}

describe('partners outbox worker', () => {
  beforeEach(() => {
    vi.stubEnv('DUB_API_KEY', 'dub_test_token')
    vi.stubEnv('DUB_PARTNERS_ENABLED', 'true')
    dubMocks.constructor.mockClear()
    dubMocks.client.track.lead.mockReset()
    dubMocks.client.track.lead.mockResolvedValue({})
    notificationMocks.slack.mockClear()
    notificationMocks.telegram.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('claims, delivers, and completes an event', async () => {
    const { event, t } = await setupEvent()

    await expect(
      t.action(internal.partners_worker.processOutboxEvent, {
        eventId: event._id,
      }),
    ).resolves.toEqual({ processed: true })

    expect(dubMocks.constructor).toHaveBeenCalledWith({
      token: 'dub_test_token',
    })
    expect(dubMocks.client.track.lead).toHaveBeenCalledTimes(1)
    const completed = await t.run(async (ctx) => ctx.db.get(event._id))
    expect(completed).toMatchObject({
      attemptCount: 1,
      status: 'completed',
    })
    expect(notificationMocks.slack).not.toHaveBeenCalled()
    expect(notificationMocks.telegram).not.toHaveBeenCalled()
  })

  it('records transient failure and schedules the next attempt', async () => {
    dubMocks.client.track.lead.mockRejectedValueOnce(
      new Error('Dub unavailable'),
    )
    const { event, t } = await setupEvent()

    await expect(
      t.action(internal.partners_worker.processOutboxEvent, {
        eventId: event._id,
      }),
    ).resolves.toEqual({ processed: false })

    const state = await t.run(async (ctx) => ({
      event: await ctx.db.get(event._id),
      scheduled: await ctx.db.system.query('_scheduled_functions').take(10),
    }))
    expect(state.event).toMatchObject({
      attemptCount: 1,
      lastError: 'Dub unavailable',
      status: 'pending',
    })
    expect(
      state.scheduled.filter(
        (scheduled) => scheduled.name === 'partners_worker:processOutboxEvent',
      ),
    ).toHaveLength(2)
    expect(notificationMocks.slack).not.toHaveBeenCalled()
    expect(notificationMocks.telegram).not.toHaveBeenCalled()
  })

  it('alerts operations when delivery reaches dead letter', async () => {
    dubMocks.client.track.lead.mockRejectedValueOnce(
      new Error('Dub unavailable'),
    )
    const { event, t } = await setupEvent(8)

    await expect(
      t.action(internal.partners_worker.processOutboxEvent, {
        eventId: event._id,
      }),
    ).resolves.toEqual({ processed: false })

    const deadLetter = await t.run(async (ctx) => ctx.db.get(event._id))
    expect(deadLetter).toMatchObject({
      attemptCount: 9,
      lastError: 'Dub unavailable',
      status: 'dead_letter',
    })
    const message = [
      'Ship Fast partner event requires attention',
      `event=${event._id}`,
      'kind=lead',
      'idempotencyKey=dub:lead:https://clerk.test|alice',
      'error=Dub unavailable',
    ].join('\n')
    expect(notificationMocks.slack).toHaveBeenCalledWith({ message })
    expect(notificationMocks.telegram).toHaveBeenCalledWith({ message })
  })
})
