/**
 * Tests for shared Slack notification functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sendSharedNotification,
  formatUser,
  paywallTriggeredEvent,
  inviteSentEvent,
  inviteeJoinedEvent,
  userRegisteredEvent,
  paymentDoneEvent,
  generationDoneEvent,
  generationFailedEvent,
  contentModerationBlockedEvent,
  subscriptionCancelledEvent,
  referralRewardUnlockedEvent,
  exportCompletedEvent,
  SLACK_COLORS,
  type SharedNotificationEvent,
} from './slack_notifications_shared'

// Mock fetch for testing
const mockFetch = vi.fn()

describe('formatUser', () => {
  it('should format user with all fields', () => {
    const result = formatUser({
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
    })
    expect(result).toBe('*John Doe* john@example.com (`user123`)')
  })

  it('should format user with partial fields', () => {
    const result = formatUser({
      userId: 'user123',
      userName: 'John Doe',
    })
    expect(result).toBe('*John Doe* (`user123`)')
  })

  it('should format user with only userId', () => {
    const result = formatUser({
      userId: 'user123',
    })
    expect(result).toBe('(`user123`)')
  })

  it('should return Anonymous for missing all fields', () => {
    const result = formatUser({})
    expect(result).toBe('_Anonymous_')
  })

  it('should return Unknown for empty parts', () => {
    const result = formatUser({
      userId: '',
      userName: '',
      userEmail: '',
    })
    expect(result).toBe('_Anonymous_') // Empty strings are treated as missing
  })
})

describe('paywallTriggeredEvent', () => {
  it('should build paywall triggered event', () => {
    const result = paywallTriggeredEvent({
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      sessionId: 'session456',
      entitlement: 'generations',
      reason: 'Limit exceeded',
    })

    expect(result.emoji).toBe('⚠️')
    expect(result.title).toBe('Paywall Triggered')
    expect(result.color).toBe(SLACK_COLORS.CONFIG_AMBER)
    expect(result.footer).toBe('Ship Fast • Paywall')
    expect(result.fields).toHaveLength(4)
    expect(result.fields[0]).toEqual({
      label: 'Session',
      value: '`session456`',
    })
    expect(result.fields[1]).toEqual({
      label: 'Entitlement',
      value: '`generations`',
    })
    expect(result.fields[2].label).toBe('User')
    expect(result.fields[3]).toEqual({
      label: 'Reason',
      value: 'Limit exceeded',
    })
  })
})

describe('inviteSentEvent', () => {
  it('should build invite sent event', () => {
    const result = inviteSentEvent({
      referrerUserId: 'referrer123',
      referrerUserName: 'Jane Doe',
      referrerUserEmail: 'jane@example.com',
      code: 'REFERRAL123',
    })

    expect(result.emoji).toBe('📨')
    expect(result.title).toBe('Referral Invite Created')
    expect(result.color).toBe(SLACK_COLORS.LIFECYCLE_PURPLE)
    expect(result.footer).toBe('Ship Fast • Referrals')
    expect(result.fields).toHaveLength(2)
    expect(result.fields[0].label).toBe('Referrer')
    expect(result.fields[1]).toEqual({
      label: 'Code',
      value: '`REFERRAL123`',
    })
  })
})

describe('inviteeJoinedEvent', () => {
  it('should build invitee joined event', () => {
    const result = inviteeJoinedEvent({
      referredUserId: 'referred123',
      referredUserName: 'New User',
      referredUserEmail: 'new@example.com',
      referrerUserId: 'referrer123',
      referrerUserName: 'Jane Doe',
      referrerUserEmail: 'jane@example.com',
      code: 'REFERRAL123',
    })

    expect(result.emoji).toBe('🤝')
    expect(result.title).toBe('Referral Joined')
    expect(result.color).toBe(SLACK_COLORS.SUCCESS_GREEN)
    expect(result.footer).toBe('Ship Fast • Referrals')
    expect(result.fields).toHaveLength(3)
    expect(result.fields[0].label).toBe('New User')
    expect(result.fields[1].label).toBe('Referrer')
    expect(result.fields[2]).toEqual({
      label: 'Code',
      value: '`REFERRAL123`',
    })
  })
})

describe('userRegisteredEvent', () => {
  it('should build user registered event', () => {
    const result = userRegisteredEvent({
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      ipHash:
        'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    })

    expect(result.emoji).toBe('👋')
    expect(result.title).toBe('New User Registered')
    expect(result.color).toBe(SLACK_COLORS.SUCCESS_GREEN)
    expect(result.footer).toBe('Ship Fast • User Registration')
    expect(result.fields).toHaveLength(2)
    expect(result.fields[0].label).toBe('User')
    expect(result.fields[1].value).toContain('abcdef1234567890…')
  })

  it('should build user registered event without IP hash', () => {
    const result = userRegisteredEvent({
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
    })

    expect(result.fields).toHaveLength(1)
    expect(result.fields[0].label).toBe('User')
  })
})

describe('paymentDoneEvent', () => {
  it('should build payment done event for subscription', () => {
    const result = paymentDoneEvent({
      provider: 'stripe',
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      type: 'subscription',
      planId: 'pro_monthly',
      amount: 1999,
      currency: 'usd',
    })

    expect(result.emoji).toBe('💰')
    expect(result.title).toBe('Payment Completed')
    expect(result.color).toBe(SLACK_COLORS.SUCCESS_GREEN)
    expect(result.footer).toBe('Ship Fast • Payment')
    expect(result.fields).toHaveLength(5)
    expect(result.fields[0]).toEqual({
      label: 'Provider',
      value: '`stripe`',
    })
    expect(result.fields[2]).toEqual({
      label: 'Type',
      value: '`subscription`',
    })
    expect(result.fields[3]).toEqual({
      label: 'Plan',
      value: '`pro_monthly`',
    })
    expect(result.fields[4]).toEqual({
      label: 'Amount',
      value: '19.99 USD',
    })
  })

  it('should build payment done event for credit pack', () => {
    const result = paymentDoneEvent({
      provider: 'stripe',
      userId: 'user123',
      type: 'credit_pack',
      credits: 100,
      amount: 999,
      currency: 'usd',
    })

    expect(result.fields).toHaveLength(5) // provider, user, type, credits, amount
    expect(result.fields[2]).toEqual({
      label: 'Type',
      value: '`credit_pack`',
    })
    expect(result.fields[3]).toEqual({
      label: 'Credits',
      value: '100',
    })
    expect(result.fields[4]).toEqual({
      label: 'Amount',
      value: '9.99 USD',
    })
  })

  it('should build payment done event with minimal fields', () => {
    const result = paymentDoneEvent({
      provider: 'stripe',
      userId: 'user123',
      type: 'subscription',
    })

    expect(result.fields).toHaveLength(3)
    expect(result.fields[0]).toEqual({
      label: 'Provider',
      value: '`stripe`',
    })
    expect(result.fields[1].label).toBe('User')
    expect(result.fields[2]).toEqual({
      label: 'Type',
      value: '`subscription`',
    })
  })
})

describe('generationDoneEvent', () => {
  it('should build generation done event with all fields', () => {
    const result = generationDoneEvent({
      sessionId: 'session123',
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      elapsedMs: 15000,
      provider: 'groq',
      prompt: 'Build a todo app',
      publicUrl: 'https://example.com/public/session123',
      privateUrl: 'https://example.com/private/session123',
    })

    expect(result.emoji).toBe('🎉')
    expect(result.title).toBe('Generation Completed')
    expect(result.color).toBe(SLACK_COLORS.OMNI_BLUE)
    expect(result.footer).toBe('Ship Fast • Generation')
    expect(result.fields).toHaveLength(7)
    expect(result.fields[0]).toEqual({
      label: 'Session',
      value: '`session123`',
    })
    expect(result.fields[1].label).toBe('Owner')
    expect(result.fields[2]).toEqual({
      label: 'Public Link',
      value: 'https://example.com/public/session123',
    })
    expect(result.fields[3]).toEqual({
      label: 'Private Link',
      value: 'https://example.com/private/session123',
    })
    expect(result.fields[4]).toEqual({
      label: 'Provider',
      value: '`groq`',
    })
    expect(result.fields[5]).toEqual({
      label: 'Elapsed',
      value: '15.0s',
    })
    expect(result.fields[6]).toEqual({
      label: 'Prompt',
      value: 'Build a todo app',
    })
  })

  it('should truncate long prompts', () => {
    const longPrompt = 'A'.repeat(600)
    const result = generationDoneEvent({
      sessionId: 'session123',
      userId: 'user123',
      prompt: longPrompt,
    })

    const promptField = result.fields.find((f) => f.label === 'Prompt')
    expect(promptField).toBeDefined()
    expect(promptField?.value).toHaveLength(501) // 500 + '…'
    expect(promptField?.value.endsWith('…')).toBe(true)
  })

  it('should build generation done event with IP hash fallback', () => {
    const result = generationDoneEvent({
      sessionId: 'session123',
      ipHash:
        'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    })

    const ownerField = result.fields.find((f) => f.label === 'Owner')
    expect(ownerField).toBeDefined()
    expect(ownerField?.value).toContain('abcdef1234567890…')
  })

  it('should build generation done event with unknown owner', () => {
    const result = generationDoneEvent({
      sessionId: 'session123',
    })

    const ownerField = result.fields.find((f) => f.label === 'Owner')
    expect(ownerField).toBeDefined()
    expect(ownerField?.value).toBe('_Unknown_')
  })
})

describe('generationFailedEvent', () => {
  it('should build generation failed event with all fields', () => {
    const result = generationFailedEvent({
      sessionId: 'session123',
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      error: 'Provider timeout',
      elapsedMs: 30000,
      prompt: 'Build a todo app',
      publicUrl: 'https://example.com/public/session123',
      privateUrl: 'https://example.com/private/session123',
    })

    expect(result.emoji).toBe('⛔')
    expect(result.title).toBe('Generation Failed')
    expect(result.color).toBe(SLACK_COLORS.BLOCKER_RED)
    expect(result.footer).toBe('Ship Fast • Generation')
    expect(result.fields).toHaveLength(7)
    expect(result.fields[0]).toEqual({
      label: 'Session',
      value: '`session123`',
    })
    expect(result.fields[1].label).toBe('Owner')
    expect(result.fields[4]).toEqual({
      label: 'Error',
      value: 'Provider timeout',
    })
    expect(result.fields[5]).toEqual({
      label: 'Elapsed',
      value: '30.0s',
    })
  })

  it('should truncate long prompts in failure event', () => {
    const longPrompt = 'B'.repeat(600)
    const result = generationFailedEvent({
      sessionId: 'session123',
      error: 'Failed',
      prompt: longPrompt,
    })

    const promptField = result.fields.find((f) => f.label === 'Prompt')
    expect(promptField).toBeDefined()
    expect(promptField?.value).toHaveLength(501) // 500 + '…'
    expect(promptField?.value.endsWith('…')).toBe(true)
  })
})

describe('contentModerationBlockedEvent', () => {
  it('builds a red blocker alert with authenticated moderation context', () => {
    const prompt = `Build <!channel> <https://attacker.test|click> & ${'A'.repeat(600)}`
    const result = contentModerationBlockedEvent({
      flagId: 'flag123',
      category: 'hate_extremism',
      surface: 'session_create',
      matchedField: 'prompt',
      ruleId: 'semantic-hate',
      decisionSource: 'semantic',
      classifierModel: 'openai/gpt-oss-safeguard-20b',
      userId: 'user<123>',
      userName: 'A <!channel> User',
      userEmail: 'a&b@example.com',
      anonymousClientIdHash: 'unused-anonymous-hash',
      clientIpHash: 'client-ip-hash',
      sessionId: 'session123',
      prompt,
    })

    expect(result).toEqual({
      emoji: '🛑',
      title: 'Harmful Prompt Blocked',
      color: SLACK_COLORS.BLOCKER_RED,
      fields: [
        { label: 'Flag ID', value: '`flag123`' },
        { label: 'Category', value: '`hate_extremism`' },
        { label: 'Surface', value: '`session_create`' },
        { label: 'Matched Field', value: '`prompt`' },
        { label: 'Rule', value: '`semantic-hate`' },
        { label: 'Source', value: '`semantic`' },
        {
          label: 'Model',
          value: '`openai/gpt-oss-safeguard-20b`',
        },
        {
          label: 'User',
          value:
            '*A &lt;!channel&gt; User* a&amp;b@example.com (`user&lt;123&gt;`)',
        },
        { label: 'IP Hash', value: '`client-ip-hash`' },
        { label: 'Session', value: '`session123`' },
        {
          label: 'Prompt',
          value: `${prompt
            .slice(0, 500)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')}…`,
        },
      ],
      footer: 'Ship Fast • Content Moderation',
    })
  })

  it('uses the anonymous hash and omits absent optional context', () => {
    const result = contentModerationBlockedEvent({
      flagId: 'flag456',
      category: 'explicit_sexual_content',
      surface: 'rewrite_text',
      matchedField: 'text',
      decisionSource: 'deterministic',
      anonymousClientIdHash: 'anonymous-hash',
      prompt: 'Unsafe <script> request',
    })

    expect(result.fields).toEqual([
      { label: 'Flag ID', value: '`flag456`' },
      { label: 'Category', value: '`explicit_sexual_content`' },
      { label: 'Surface', value: '`rewrite_text`' },
      { label: 'Matched Field', value: '`text`' },
      { label: 'Source', value: '`deterministic`' },
      { label: 'Anonymous', value: '`anonymous-hash`' },
      { label: 'Prompt', value: 'Unsafe &lt;script&gt; request' },
    ])
  })
})

describe('subscriptionCancelledEvent', () => {
  it('should build subscription cancelled event', () => {
    const result = subscriptionCancelledEvent({
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      provider: 'stripe',
      planId: 'pro_monthly',
    })

    expect(result.emoji).toBe('❌')
    expect(result.title).toBe('Subscription Cancelled')
    expect(result.color).toBe(SLACK_COLORS.BLOCKER_RED)
    expect(result.footer).toBe('Ship Fast • Billing')
    expect(result.fields).toHaveLength(3)
    expect(result.fields[0].label).toBe('User')
    expect(result.fields[1]).toEqual({
      label: 'Provider',
      value: '`stripe`',
    })
    expect(result.fields[2]).toEqual({
      label: 'Plan',
      value: '`pro_monthly`',
    })
  })

  it('should build subscription cancelled event without plan', () => {
    const result = subscriptionCancelledEvent({
      userId: 'user123',
      provider: 'stripe',
    })

    expect(result.fields).toHaveLength(2)
    expect(result.fields[0].label).toBe('User')
    expect(result.fields[1]).toEqual({
      label: 'Provider',
      value: '`stripe`',
    })
  })
})

describe('referralRewardUnlockedEvent', () => {
  it('should build referral reward unlocked event', () => {
    const result = referralRewardUnlockedEvent({
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      qualifiedCount: 5,
      threshold: 3,
    })

    expect(result.emoji).toBe('🎁')
    expect(result.title).toBe('Referral Reward Unlocked!')
    expect(result.color).toBe(SLACK_COLORS.LIFECYCLE_PURPLE)
    expect(result.footer).toBe('Ship Fast • Referrals')
    expect(result.fields).toHaveLength(3)
    expect(result.fields[0].label).toBe('User')
    expect(result.fields[1]).toEqual({
      label: 'Qualified',
      value: '5',
    })
    expect(result.fields[2]).toEqual({
      label: 'Threshold',
      value: '3',
    })
  })
})

describe('exportCompletedEvent', () => {
  it('should build export completed event with user', () => {
    const result = exportCompletedEvent({
      sessionId: 'session123',
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      target: 'github',
    })

    expect(result.emoji).toBe('📦')
    expect(result.title).toBe('Export Completed')
    expect(result.color).toBe(SLACK_COLORS.COMPLETE_SLATE)
    expect(result.footer).toBe('Ship Fast • Exports')
    expect(result.fields).toHaveLength(3)
    expect(result.fields[0]).toEqual({
      label: 'Session',
      value: '`session123`',
    })
    expect(result.fields[1]).toEqual({
      label: 'Target',
      value: '`github`',
    })
    expect(result.fields[2].label).toBe('Owner')
  })

  it('should build export completed event with IP hash', () => {
    const result = exportCompletedEvent({
      sessionId: 'session123',
      ipHash:
        'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      target: 'github',
    })

    const ownerField = result.fields.find((f) => f.label === 'Owner')
    expect(ownerField).toBeDefined()
    expect(ownerField?.value).toContain('abcdef1234567890…')
  })

  it('should build export completed event with anonymous owner', () => {
    const result = exportCompletedEvent({
      sessionId: 'session123',
      target: 'github',
    })

    const ownerField = result.fields.find((f) => f.label === 'Owner')
    expect(ownerField).toBeDefined()
    expect(ownerField?.value).toBe('_Anonymous_')
  })
})

describe('sendSharedNotification', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should send notification successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    })

    const event: SharedNotificationEvent = {
      emoji: '🎉',
      title: 'Test Event',
      color: SLACK_COLORS.SUCCESS_GREEN,
      fields: [{ label: 'Test', value: 'Value' }],
    }

    const result = await sendSharedNotification(
      event,
      {
        SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test',
        NODE_ENV: 'production',
      },
      mockFetch as any,
    )

    expect(result).toEqual({ sent: true })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith('https://hooks.slack.com/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('Test Event'),
    })
  })

  it('should return no_webhook_url when missing webhook URL', async () => {
    const event: SharedNotificationEvent = {
      emoji: '🎉',
      title: 'Test Event',
      color: SLACK_COLORS.SUCCESS_GREEN,
      fields: [{ label: 'Test', value: 'Value' }],
    }

    const result = await sendSharedNotification(event, {})

    expect(result).toEqual({ sent: false, reason: 'no_webhook_url' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should return http_status on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const event: SharedNotificationEvent = {
      emoji: '🎉',
      title: 'Test Event',
      color: SLACK_COLORS.SUCCESS_GREEN,
      fields: [{ label: 'Test', value: 'Value' }],
    }

    const result = await sendSharedNotification(
      event,
      { SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test' },
      mockFetch as any,
    )

    expect(result).toEqual({ sent: false, reason: 'http_500' })
  })

  it('should return error message on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const event: SharedNotificationEvent = {
      emoji: '🎉',
      title: 'Test Event',
      color: SLACK_COLORS.SUCCESS_GREEN,
      fields: [{ label: 'Test', value: 'Value' }],
    }

    const result = await sendSharedNotification(
      event,
      { SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test' },
      mockFetch as any,
    )

    expect(result).toEqual({ sent: false, reason: 'Network error' })
  })

  it('should add [DEV] prefix in development', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    })

    const event: SharedNotificationEvent = {
      emoji: '🎉',
      title: 'Test Event',
      color: SLACK_COLORS.SUCCESS_GREEN,
      fields: [{ label: 'Test', value: 'Value' }],
    }

    await sendSharedNotification(
      event,
      {
        SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test',
        NODE_ENV: 'development',
      },
      mockFetch as any,
    )

    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(requestBody.text).toBe('🎉 [DEV] Test Event')
  })

  it('should not add [DEV] prefix in production', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    })

    const event: SharedNotificationEvent = {
      emoji: '🎉',
      title: 'Test Event',
      color: SLACK_COLORS.SUCCESS_GREEN,
      fields: [{ label: 'Test', value: 'Value' }],
    }

    await sendSharedNotification(
      event,
      {
        SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test',
        NODE_ENV: 'production',
      },
      mockFetch as any,
    )

    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(requestBody.text).toBe('🎉 Test Event')
  })
})
