/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { makeFunctionReference } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from './_generated/dataModel'
import { hashOwnerSecret } from './lib/session_access_helpers'
import type {
  BlockedAttemptNotificationArgs,
  RecordBlockedAttemptArgs,
} from './moderation'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const secret = 'content-moderation-secret'

const recordBlockedAttempt = makeFunctionReference<
  'mutation',
  RecordBlockedAttemptArgs,
  { flagId: Id<'contentModerationFlags'> }
>('moderation:recordBlockedAttempt')

const notifySlackOfBlockedAttempt = makeFunctionReference<
  'action',
  BlockedAttemptNotificationArgs,
  null
>('moderation:notifySlackOfBlockedAttempt')

const blockedAttempt = {
  category: 'sexual_minors',
  clientIpHash: 'client-ip-hash',
  decisionSource: 'deterministic',
  matchedField: 'prompt',
  prompt:
    'Full raw blocked prompt — preserve punctuation, spacing, and every detail.',
  ruleId: 'sexual-minors',
  secret,
  surface: 'session_create',
} satisfies RecordBlockedAttemptArgs

type ModerationState = {
  flags: Doc<'contentModerationFlags'>[]
  scheduled: Array<{ name: string; state: { kind: string } }>
}

const moderationState: (
  t: ReturnType<typeof convexTest>,
) => Promise<ModerationState> = async (t) =>
  await t.run(async (ctx) => ({
    flags: await ctx.db.query('contentModerationFlags').take(10),
    scheduled: await ctx.db.system.query('_scheduled_functions').take(10),
  }))

describe('content moderation flag persistence', () => {
  beforeEach(() => {
    vi.stubEnv('CONTENT_MODERATION_MUTATION_SECRET', secret)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('defines the durable moderation flag record and audit indexes', async () => {
    const t = convexTest(schema, modules)
    const { flagId: storedFlagId, sessionId: auditSessionId } = await t.run(
      async (ctx) => {
        const sessionId = await ctx.db.insert('sessions', {
          createdAt: 1,
          isPrivate: true,
          preferredExportTarget: 'html',
          preferredLanguage: 'en',
          prompt: 'Moderation audit session',
        })
        const flagId = await ctx.db.insert('contentModerationFlags', {
          anonymousClientIdHash: 'anonymous-hash',
          category: 'other_policy_violation',
          clientIpHash: 'ip-hash',
          decisionSource: 'deterministic',
          matchedField: 'prompt',
          prompt: 'Exact audit prompt',
          ruleId: 'test-rule',
          sessionId,
          surface: 'session_create',
          userId: 'user-id',
          createdAt: 1,
        })
        return { flagId, sessionId }
      },
    )

    await expect(
      t.run((ctx) => ctx.db.get(storedFlagId)),
    ).resolves.toMatchObject({
      prompt: 'Exact audit prompt',
    })
    await expect(
      t.run(async (ctx) => ({
        anonymous: await ctx.db
          .query('contentModerationFlags')
          .withIndex('by_anonymousClientIdHash_and_createdAt', (index) =>
            index
              .eq('anonymousClientIdHash', 'anonymous-hash')
              .eq('createdAt', 1),
          )
          .take(1),
        category: await ctx.db
          .query('contentModerationFlags')
          .withIndex('by_category_and_createdAt', (index) =>
            index.eq('category', 'other_policy_violation').eq('createdAt', 1),
          )
          .take(1),
        created: await ctx.db
          .query('contentModerationFlags')
          .withIndex('by_createdAt', (index) => index.eq('createdAt', 1))
          .take(1),
        ip: await ctx.db
          .query('contentModerationFlags')
          .withIndex('by_clientIpHash_and_createdAt', (index) =>
            index.eq('clientIpHash', 'ip-hash').eq('createdAt', 1),
          )
          .take(1),
        session: await ctx.db
          .query('contentModerationFlags')
          .withIndex('by_sessionId_and_createdAt', (index) =>
            index.eq('sessionId', auditSessionId).eq('createdAt', 1),
          )
          .take(1),
        user: await ctx.db
          .query('contentModerationFlags')
          .withIndex('by_userId_and_createdAt', (index) =>
            index.eq('userId', 'user-id').eq('createdAt', 1),
          )
          .take(1),
      })),
    ).resolves.toEqual({
      anonymous: [expect.objectContaining({ _id: storedFlagId })],
      category: [expect.objectContaining({ _id: storedFlagId })],
      created: [expect.objectContaining({ _id: storedFlagId })],
      ip: [expect.objectContaining({ _id: storedFlagId })],
      session: [expect.objectContaining({ _id: storedFlagId })],
      user: [expect.objectContaining({ _id: storedFlagId })],
    })
  })

  it('rejects invalid moderation categories at the schema boundary', async () => {
    const t = convexTest(schema, modules)
    const invalidFlag = JSON.parse(
      JSON.stringify({
        category: 'not_a_policy_category',
        decisionSource: 'deterministic',
        matchedField: 'prompt',
        prompt: 'Invalid audit prompt',
        ruleId: 'invalid-rule',
        surface: 'session_create',
        createdAt: 1,
      }),
    )

    await expect(
      t.run((ctx) => ctx.db.insert('contentModerationFlags', invalidFlag)),
    ).rejects.toThrow()
  })

  it('stores the exact blocked prompt and authenticated identity, then schedules one Slack action', async () => {
    const t = convexTest(schema, modules)
    const user = t.withIdentity({
      email: 'moderator@example.com',
      issuer: 'https://clerk.test',
      name: 'Safety Tester',
      subject: 'subject-fallback',
      tokenIdentifier: 'https://clerk.test|moderator',
    })

    const result = await user.mutation(recordBlockedAttempt, blockedAttempt)
    const state = await moderationState(t)

    expect(result.flagId).toBe(state.flags[0]?._id)
    expect(state.flags).toEqual([
      expect.objectContaining({
        category: 'sexual_minors',
        clientIpHash: 'client-ip-hash',
        decisionSource: 'deterministic',
        matchedField: 'prompt',
        prompt: blockedAttempt.prompt,
        ruleId: 'sexual-minors',
        surface: 'session_create',
        userEmail: 'moderator@example.com',
        userId: 'https://clerk.test|moderator',
        userName: 'Safety Tester',
      }),
    ])
    expect(state.flags[0]?.sessionId).toBeUndefined()
    expect(state.flags[0]?.createdAt).toEqual(expect.any(Number))
    expect(state.scheduled).toEqual([
      expect.objectContaining({
        name: 'moderation:notifySlackOfBlockedAttempt',
        state: { kind: 'pending' },
      }),
    ])
  })

  it('hashes anonymous client identifiers without storing their raw value', async () => {
    const t = convexTest(schema, modules)
    const anonymousClientId = 'anonymous-browser-secret'

    await t.mutation(recordBlockedAttempt, {
      ...blockedAttempt,
      anonymousClientId,
      clientIpHash: undefined,
      decisionSource: 'semantic',
      classifierModel: 'openai/gpt-oss-safeguard-20b',
      surface: 'custom_language',
      matchedField: 'customLanguage',
    })
    const state = await moderationState(t)

    expect(state.flags).toHaveLength(1)
    expect(state.flags[0]).toMatchObject({
      anonymousClientIdHash: await hashOwnerSecret(anonymousClientId),
      classifierModel: 'openai/gpt-oss-safeguard-20b',
      decisionSource: 'semantic',
      matchedField: 'customLanguage',
      surface: 'custom_language',
    })
    expect(JSON.stringify(state.flags[0])).not.toContain(anonymousClientId)
  })

  it('rejects an invalid server secret before writing or scheduling', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(recordBlockedAttempt, {
        ...blockedAttempt,
        secret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'FORBIDDEN' }),
    })

    await expect(moderationState(t)).resolves.toEqual({
      flags: [],
      scheduled: [],
    })
  })

  it('sends the scheduled Slack notification through the shared sender', async () => {
    vi.stubEnv('SLACK_WEBHOOK_URL', 'https://hooks.slack.test/moderation')
    vi.stubEnv('NODE_ENV', 'test')
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const t = convexTest(schema, modules)

    await t.action(notifySlackOfBlockedAttempt, {
      anonymousClientIdHash: 'anonymous-hash',
      category: blockedAttempt.category,
      clientIpHash: blockedAttempt.clientIpHash,
      decisionSource: blockedAttempt.decisionSource,
      flagId: 'flag-id',
      matchedField: blockedAttempt.matchedField,
      prompt: blockedAttempt.prompt,
      ruleId: blockedAttempt.ruleId,
      surface: blockedAttempt.surface,
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://hooks.slack.test/moderation',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('executes the exact scheduled payload without validator failures', async () => {
    vi.useFakeTimers()
    vi.stubEnv('SLACK_WEBHOOK_URL', 'https://hooks.slack.test/moderation')
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const t = convexTest(schema, modules)

    try {
      await t.mutation(recordBlockedAttempt, blockedAttempt)
      await t.finishAllScheduledFunctions(vi.runAllTimers)

      expect(fetchMock).toHaveBeenCalled()
      expect(
        fetchMock.mock.calls.some((call) => {
          const init = (call as unknown[])[1] as { body?: string } | undefined
          return String(init?.body).includes(blockedAttempt.prompt)
        }),
      ).toBe(true)
      await expect(moderationState(t)).resolves.toMatchObject({
        scheduled: [expect.objectContaining({ state: { kind: 'success' } })],
      })
    } finally {
      vi.useRealTimers()
    }
  })
})
