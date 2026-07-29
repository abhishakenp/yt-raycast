import { describe, expect, it, vi } from 'vitest'

import {
  sendBusinessNotification,
  userRegisteredEvent,
  paywallTriggeredEvent,
  paymentDoneEvent,
  generationDoneEvent,
  inviteSentEvent,
  inviteeJoinedEvent,
  subscriptionCancelledEvent,
  referralRewardUnlockedEvent,
  exportCompletedEvent,
  generationFailedEvent,
  formatUser,
  SLACK_COLORS,
} from './slack-business'

describe('sendBusinessNotification', () => {
  it('returns no_webhook_url when SLACK_WEBHOOK_URL is not set', async () => {
    const result = await sendBusinessNotification(
      userRegisteredEvent({ userId: 'u1' }),
      {},
      vi.fn(),
    )
    expect(result).toEqual({ sent: false, reason: 'no_webhook_url' })
  })

  it('sends a POST to the webhook URL and returns sent: true on ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    const result = await sendBusinessNotification(
      userRegisteredEvent({ userId: 'u1' }),
      { SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test', NODE_ENV: 'production' },
      fetchMock as unknown as typeof fetch,
    )
    expect(result).toEqual({ sent: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://hooks.slack.com/test')
    expect(init).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const body = JSON.parse(init.body as string)
    expect(body.text).toBe('👋 New User Registered')
    expect(body.attachments).toHaveLength(1)
    expect(body.attachments[0].color).toBe(SLACK_COLORS.SUCCESS_GREEN)
    // No header block — title is in `text`, attachment only has fields
    const blockTypes = body.attachments[0].blocks.map((b: { type: string }) => b.type)
    expect(blockTypes).not.toContain('header')
  })

  it('adds [DEV] after emoji when NODE_ENV is not production', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    await sendBusinessNotification(
      userRegisteredEvent({ userId: 'u1' }),
      { SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test', NODE_ENV: 'development' },
      fetchMock as unknown as typeof fetch,
    )
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.text).toBe('👋 [DEV] New User Registered')
  })

  it('returns sent: false on non-ok response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    const result = await sendBusinessNotification(
      userRegisteredEvent({ userId: 'u1' }),
      { SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test' },
      fetchMock as unknown as typeof fetch,
    )
    expect(result).toEqual({ sent: false, reason: 'http_500' })
  })

  it('returns sent: false on fetch error', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network error'))
    const result = await sendBusinessNotification(
      userRegisteredEvent({ userId: 'u1' }),
      { SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test' },
      fetchMock as unknown as typeof fetch,
    )
    expect(result).toEqual({ sent: false, reason: 'network error' })
  })
})

describe('formatUser', () => {
  it('formats as "*Name* email (userId)" when all fields present', () => {
    expect(
      formatUser({
        userId: 'user_123',
        userName: 'Jane Doe',
        userEmail: 'jane@example.com',
      }),
    ).toBe('*Jane Doe* jane@example.com (`user_123`)')
  })

  it('formats as "*Name* (userId)" when email missing', () => {
    expect(
      formatUser({ userId: 'user_123', userName: 'Jane Doe' }),
    ).toBe('*Jane Doe* (`user_123`)')
  })

  it('formats as "email (userId)" when name missing', () => {
    expect(
      formatUser({ userId: 'user_123', userEmail: 'jane@example.com' }),
    ).toBe('jane@example.com (`user_123`)')
  })

  it('formats as "(userId)" when only userId present', () => {
    expect(formatUser({ userId: 'user_123' })).toBe('(`user_123`)')
  })

  it('returns _Anonymous_ when no fields present', () => {
    expect(formatUser({})).toBe('_Anonymous_')
  })
})

describe('event builders', () => {
  it('userRegisteredEvent includes emoji, green color, and formatted user', () => {
    const event = userRegisteredEvent({
      userId: 'user_123',
      userName: 'Jane Doe',
      userEmail: 'test@example.com',
      ipHash: 'abcdef0123456789',
    })
    expect(event.emoji).toBe('👋')
    expect(event.color).toBe(SLACK_COLORS.SUCCESS_GREEN)
    const userField = event.fields.find((f) => f.label === 'User')
    expect(userField?.value).toBe('*Jane Doe* test@example.com (`user_123`)')
  })

  it('paywallTriggeredEvent uses amber color and warning emoji', () => {
    const event = paywallTriggeredEvent({
      sessionId: 's1',
      entitlement: 'anonymous',
      reason: 'no subscription',
    })
    expect(event.emoji).toBe('⚠️')
    expect(event.color).toBe(SLACK_COLORS.CONFIG_AMBER)
  })

  it('paymentDoneEvent includes provider, type, and green color', () => {
    const event = paymentDoneEvent({
      provider: 'stripe',
      userId: 'u1',
      type: 'subscription',
      planId: 'pro',
      amount: 999,
      currency: 'usd',
    })
    expect(event.emoji).toBe('💰')
    expect(event.color).toBe(SLACK_COLORS.SUCCESS_GREEN)
    expect(event.fields).toContainEqual({
      label: 'Amount',
      value: '9.99 USD',
    })
  })

  it('generationDoneEvent uses blue color and party emoji', () => {
    const event = generationDoneEvent({
      sessionId: 's1',
      userId: 'u1',
      elapsedMs: 5000,
      provider: 'ship-fast-engine-v3-vps',
    })
    expect(event.emoji).toBe('🎉')
    expect(event.color).toBe(SLACK_COLORS.OMNI_BLUE)
    expect(event.fields).toContainEqual({ label: 'Elapsed', value: '5.0s' })
  })

  it('generationDoneEvent includes prompt and links when provided', () => {
    const event = generationDoneEvent({
      sessionId: 's1',
      userId: 'u1',
      prompt: 'A modern SaaS landing page',
      publicUrl: 'https://ship-fast.ai/preview/s1',
      privateUrl: 'https://ship-fast.ai/generate/s1/',
    })
    const promptField = event.fields.find((f) => f.label === 'Prompt')
    expect(promptField?.value).toBe('A modern SaaS landing page')
    const publicField = event.fields.find((f) => f.label === 'Public Link')
    expect(publicField?.value).toBe('https://ship-fast.ai/preview/s1')
    const privateField = event.fields.find((f) => f.label === 'Private Link')
    expect(privateField?.value).toBe('https://ship-fast.ai/generate/s1/')
  })

  it('generationDoneEvent truncates long prompts', () => {
    const longPrompt = 'A'.repeat(600)
    const event = generationDoneEvent({
      sessionId: 's1',
      prompt: longPrompt,
    })
    const promptField = event.fields.find((f) => f.label === 'Prompt')
    expect(promptField?.value).toHaveLength(501) // 500 + ellipsis char
    expect(promptField?.value).toMatch(/…$/)
  })

  it('generationDoneEvent shows IP hash for anonymous users', () => {
    const event = generationDoneEvent({
      sessionId: 's1',
      ipHash: 'abcdef0123456789abcdef',
    })
    const ownerField = event.fields.find((f) => f.label === 'Owner')
    expect(ownerField?.value).toContain('IP')
  })

  it('inviteSentEvent uses purple color', () => {
    const event = inviteSentEvent({
      referrerUserId: 'u1',
      code: 'ABC123',
    })
    expect(event.emoji).toBe('📨')
    expect(event.color).toBe(SLACK_COLORS.LIFECYCLE_PURPLE)
  })

  it('inviteeJoinedEvent uses green color', () => {
    const event = inviteeJoinedEvent({
      referredUserId: 'u2',
      referrerUserId: 'u1',
      code: 'ABC123',
    })
    expect(event.emoji).toBe('🤝')
    expect(event.color).toBe(SLACK_COLORS.SUCCESS_GREEN)
  })

  it('subscriptionCancelledEvent uses red color', () => {
    const event = subscriptionCancelledEvent({
      userId: 'u1',
      provider: 'stripe',
    })
    expect(event.emoji).toBe('❌')
    expect(event.color).toBe(SLACK_COLORS.BLOCKER_RED)
  })

  it('referralRewardUnlockedEvent uses purple color', () => {
    const event = referralRewardUnlockedEvent({
      userId: 'u1',
      qualifiedCount: 3,
      threshold: 3,
    })
    expect(event.emoji).toBe('🎁')
    expect(event.color).toBe(SLACK_COLORS.LIFECYCLE_PURPLE)
  })

  it('exportCompletedEvent uses slate color', () => {
    const event = exportCompletedEvent({
      sessionId: 's1',
      target: 'zip',
    })
    expect(event.emoji).toBe('📦')
    expect(event.color).toBe(SLACK_COLORS.COMPLETE_SLATE)
  })

  it('generationFailedEvent uses red color and blocker emoji', () => {
    const event = generationFailedEvent({
      sessionId: 's1',
      error: 'Engine timeout',
    })
    expect(event.emoji).toBe('⛔')
    expect(event.color).toBe(SLACK_COLORS.BLOCKER_RED)
  })

  it('generationFailedEvent includes prompt and links when provided', () => {
    const event = generationFailedEvent({
      sessionId: 's1',
      error: 'Engine timeout',
      prompt: 'A complex e-commerce site',
      publicUrl: 'https://ship-fast.ai/preview/s1',
      privateUrl: 'https://ship-fast.ai/generate/s1/',
    })
    const promptField = event.fields.find((f) => f.label === 'Prompt')
    expect(promptField?.value).toBe('A complex e-commerce site')
    const publicField = event.fields.find((f) => f.label === 'Public Link')
    expect(publicField?.value).toBe('https://ship-fast.ai/preview/s1')
    const privateField = event.fields.find((f) => f.label === 'Private Link')
    expect(privateField?.value).toBe('https://ship-fast.ai/generate/s1/')
  })
})
