import { readFileSync } from 'node:fs'

import { describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  formatOperationalNotification,
  recordOperationalGenerationEvent,
  scheduleOperationalNotification,
  sendOperationalNotificationAdapters,
  sendSlackOperationalMessage,
  sendTelegramOperationalMessage,
  shouldNotifyOperationalEvent,
  type OperationalNotificationPayload,
} from './session_operational_notifications'

type InsertedRecord = {
  table: string
  value: Record<string, unknown>
}

type ScheduledRecord = {
  delay: number
  args: OperationalNotificationPayload
}

const sessionId = 'session_operational' as Id<'sessions'>
const sendOperationalNotification =
  'internal.sessions.sendOperationalNotification' as unknown as Parameters<
    MutationCtx['scheduler']['runAfter']
  >[1]

const sessionDoc = (overrides: Partial<Doc<'sessions'>> = {}) =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a site',
    workspace: 'default',
    createdAt: 1,
    userId: 'user_1',
    anonymousClientIdHash: 'anon_hash',
    ...overrides,
  }) as Doc<'sessions'>

const ctxFor = (session: Doc<'sessions'> | null) => {
  const inserted: InsertedRecord[] = []
  const scheduled: ScheduledRecord[] = []
  const ctx = {
    db: {
      get: async (id: Id<'sessions'>) => (id === sessionId ? session : null),
      insert: async (table: string, value: Record<string, unknown>) => {
        inserted.push({ table, value })
        return `${table}_id`
      },
    },
    scheduler: {
      runAfter: async (
        delay: number,
        _functionReference: typeof sendOperationalNotification,
        args: OperationalNotificationPayload,
      ) => {
        scheduled.push({ delay, args })
      },
    },
  } as unknown as Pick<MutationCtx, 'db' | 'scheduler'>

  return { ctx, inserted, scheduled }
}

describe('session operational notifications', () => {
  it('classifies alertable operational events', () => {
    expect(
      shouldNotifyOperationalEvent({ eventType: 'generation_failed' }),
    ).toBe(true)
    expect(
      shouldNotifyOperationalEvent({ eventType: 'done', error: 'boom' }),
    ).toBe(true)
    expect(
      shouldNotifyOperationalEvent({ eventType: 'done', quotaHit: true }),
    ).toBe(true)
    expect(
      shouldNotifyOperationalEvent({ eventType: 'done', cacheHit: true }),
    ).toBe(true)
    expect(
      shouldNotifyOperationalEvent({ eventType: 'done', cost: 0.01 }),
    ).toBe(true)
    expect(shouldNotifyOperationalEvent({ eventType: 'done', cost: 0 })).toBe(
      false,
    )
  })

  it('formats notification details without undefined fields', () => {
    expect(
      formatOperationalNotification({
        sessionId,
        eventType: 'generation_failed',
        provider: 'groq',
        elapsedMs: 42,
        cost: 0.12,
        quotaHit: true,
        error: 'timeout',
        message: 'Generation failed',
      }),
    ).toBe(
      [
        'Ship Fast operational event',
        'event=generation_failed',
        `session=${sessionId}`,
        'provider=groq',
        'elapsedMs=42',
        'cost=0.12',
        'quotaHit=true',
        'error=timeout',
        'Generation failed',
      ].join('\n'),
    )
  })

  it('sends Slack messages through a configured webhook', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))

    await expect(
      sendSlackOperationalMessage(
        {
          message: 'Quota limit reached',
          webhookUrl: 'https://hooks.slack.test/services/ship-fast',
        },
        {},
        fetchMock as unknown as typeof fetch,
      ),
    ).resolves.toEqual({ sent: true })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://hooks.slack.test/services/ship-fast',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Quota limit reached' }),
      },
    )
  })

  it('skips Slack messages without a configured webhook', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))

    await expect(
      sendSlackOperationalMessage(
        { message: 'Quota limit reached' },
        { SLACK_WEBHOOK_URL: '   ' },
        fetchMock as unknown as typeof fetch,
      ),
    ).resolves.toEqual({ sent: false, reason: 'no_webhook_url' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends Telegram messages through configured credentials', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))

    await expect(
      sendTelegramOperationalMessage(
        { message: 'Quota limit reached' },
        {
          TELEGRAM_BOT_TOKEN: 'telegram-token',
          TELEGRAM_CHAT_ID: 'chat-123',
        },
        fetchMock as unknown as typeof fetch,
      ),
    ).resolves.toEqual({ sent: true })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.org/bottelegram-token/sendMessage',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: 'chat-123',
          text: 'Quota limit reached',
        }),
      },
    )
  })

  it('skips Telegram messages without configured credentials', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))

    await expect(
      sendTelegramOperationalMessage(
        { message: 'Quota limit reached', botToken: 'telegram-token' },
        {},
        fetchMock as unknown as typeof fetch,
      ),
    ).resolves.toEqual({ sent: false, reason: 'missing_credentials' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends alertable operational events to both notification adapters', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))

    await expect(
      sendOperationalNotificationAdapters(
        {
          sessionId,
          eventType: 'generation_failed',
          provider: 'groq',
          error: 'provider_timeout',
        },
        {
          SLACK_WEBHOOK_URL: 'https://hooks.slack.test/services/ship-fast',
          TELEGRAM_BOT_TOKEN: 'telegram-token',
          TELEGRAM_CHAT_ID: 'chat-123',
        },
        fetchMock as unknown as typeof fetch,
      ),
    ).resolves.toMatchObject({
      sent: true,
      slack: { sent: true },
      telegram: { sent: true },
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const fetchCalls = fetchMock.mock.calls as unknown as Array<
      [input: RequestInfo | URL, init?: RequestInit]
    >
    expect(fetchCalls[0]?.[0]).toBe(
      'https://hooks.slack.test/services/ship-fast',
    )
    expect(fetchCalls[1]?.[0]).toBe(
      'https://api.telegram.org/bottelegram-token/sendMessage',
    )
  })

  it('does not send quiet operational events through adapters', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))

    await expect(
      sendOperationalNotificationAdapters(
        {
          sessionId,
          eventType: 'generation_started',
        },
        {
          SLACK_WEBHOOK_URL: 'https://hooks.slack.test/services/ship-fast',
          TELEGRAM_BOT_TOKEN: 'telegram-token',
          TELEGRAM_CHAT_ID: 'chat-123',
        },
        fetchMock as unknown as typeof fetch,
      ),
    ).resolves.toEqual({ sent: false, reason: 'not_alertable' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('keeps Convex action handlers delegated to operational notification helpers', () => {
    const sessionsSource = readFileSync('convex/sessions.ts', 'utf8')

    expect(sessionsSource).toContain(
      'return sendOperationalNotificationAdapters(args)',
    )
    expect(sessionsSource).toContain('return sendSlackOperationalMessage(args)')
    expect(sessionsSource).toContain(
      'return sendTelegramOperationalMessage(args)',
    )
    expect(sessionsSource).not.toContain(
      '`https://api.telegram.org/bot${telegramBotToken}/sendMessage`',
    )
  })

  it('schedules only alertable notifications', async () => {
    const quiet = ctxFor(sessionDoc())
    await scheduleOperationalNotification(
      quiet.ctx,
      { sessionId, eventType: 'generation_succeeded' },
      sendOperationalNotification,
    )
    expect(quiet.scheduled).toHaveLength(0)

    const alertable = ctxFor(sessionDoc())
    await scheduleOperationalNotification(
      alertable.ctx,
      { sessionId, eventType: 'generation_succeeded', cacheHit: true },
      sendOperationalNotification,
    )
    expect(alertable.scheduled).toEqual([
      {
        delay: 0,
        args: {
          sessionId,
          eventType: 'generation_succeeded',
          cacheHit: true,
        },
      },
    ])
  })

  it('records generation events without usage or notification for quiet events', async () => {
    const { ctx, inserted, scheduled } = ctxFor(sessionDoc())

    await expect(
      recordOperationalGenerationEvent(
        ctx,
        {
          sessionId,
          eventType: 'generation_started',
          message: 'Started',
          createdAt: 100,
        },
        sendOperationalNotification,
      ),
    ).resolves.toEqual({
      recorded: true,
      usageRecorded: false,
      alertable: false,
    })

    expect(inserted).toEqual([
      {
        table: 'generationEvents',
        value: {
          sessionId,
          eventType: 'generation_started',
          message: 'Started',
          createdAt: 100,
          elapsedMs: undefined,
          cost: undefined,
          provider: undefined,
          error: undefined,
          quotaHit: undefined,
          cacheHit: undefined,
        },
      },
    ])
    expect(scheduled).toHaveLength(0)
  })

  it('records usage with session fallbacks and schedules alertable events', async () => {
    const { ctx, inserted, scheduled } = ctxFor(
      sessionDoc({
        userId: 'session_user',
        anonymousClientIdHash: 'session_anon',
      }),
    )

    await expect(
      recordOperationalGenerationEvent(
        ctx,
        {
          sessionId,
          eventType: 'generation_succeeded',
          elapsedMs: 1234,
          cost: 0.5,
          provider: 'groq',
          createdAt: 200,
        },
        sendOperationalNotification,
      ),
    ).resolves.toEqual({
      recorded: true,
      usageRecorded: true,
      alertable: true,
    })

    expect(inserted.map((entry) => entry.table)).toEqual([
      'generationEvents',
      'usageMetrics',
    ])
    expect(inserted[1]?.value).toMatchObject({
      sessionId,
      eventType: 'generation_succeeded',
      timestamp: 200,
      elapsedMs: 1234,
      cost: 0.5,
      provider: 'groq',
      userId: 'session_user',
      anonymousClientIdHash: 'session_anon',
    })
    expect(scheduled).toEqual([
      {
        delay: 0,
        args: {
          sessionId,
          eventType: 'generation_succeeded',
          elapsedMs: 1234,
          cost: 0.5,
          provider: 'groq',
          error: undefined,
          quotaHit: undefined,
          cacheHit: undefined,
          message: undefined,
        },
      },
    ])
  })

  it('rejects missing sessions', async () => {
    const { ctx } = ctxFor(null)

    await expect(
      recordOperationalGenerationEvent(
        ctx,
        { sessionId, eventType: 'generation_started' },
        sendOperationalNotification,
      ),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
        message: 'Session not found',
      },
    })
  })
})
