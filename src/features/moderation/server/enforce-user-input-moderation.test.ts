import { makeFunctionReference } from 'convex/server'
import { describe, expect, it, vi } from 'vitest'

import type { Id } from '../../../../convex/_generated/dataModel'
import type { RecordBlockedAttemptArgs } from '../../../../convex/moderation'
import { CONTENT_POLICY_CLIENT_MESSAGE } from '@/lib/content-policy'
import {
  CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
  type ClassifyUserInputOptions,
  type UserInputModerationResult,
} from './moderation-classifier'
import {
  ContentModerationError,
  enforceUserInputModeration,
  moderationErrorResponse,
  type ModerationAuditClient,
} from './enforce-user-input-moderation'

const recordBlockedAttempt = makeFunctionReference<
  'mutation',
  RecordBlockedAttemptArgs,
  { flagId: Id<'contentModerationFlags'> }
>('moderation:recordBlockedAttempt')

const createClassifier = (result: UserInputModerationResult) =>
  vi.fn(
    async (
      _options: ClassifyUserInputOptions,
    ): Promise<UserInputModerationResult> => result,
  )

const createClient = () => {
  const mutation = vi.fn<ModerationAuditClient['mutation']>()
  const setAuth = vi.fn()
  return {
    client: { mutation, setAuth } satisfies ModerationAuditClient,
    mutation,
    setAuth,
  }
}

describe('enforceUserInputModeration', () => {
  it('allows safe input without creating an audit client or mutation', async () => {
    const classify = createClassifier({ decision: 'safe' })
    const createClient = vi.fn<() => ModerationAuditClient>()

    await expect(
      enforceUserInputModeration(
        {
          fields: { prompt: 'Build a dental clinic website' },
          surface: 'session_create',
        },
        { classify, createClient },
      ),
    ).resolves.toBeUndefined()

    expect(classify).toHaveBeenCalledWith({
      fields: { prompt: 'Build a dental clinic website' },
      surface: 'session_create',
    })
    expect(createClient).not.toHaveBeenCalled()
  })

  it('records the exact semantic block before returning the public warning', async () => {
    const prompt = 'Build a recruitment page for a violent extremist group'
    const classify = createClassifier({
      category: 'hate_extremism',
      classifierModel: 'openai/gpt-oss-safeguard-20b',
      decision: 'blocked',
      matchedField: 'prompt',
      prompt,
      ruleId: 'semantic-hate_extremism',
      source: 'semantic',
    })
    const { client, mutation, setAuth } = createClient()
    mutation.mockResolvedValue({
      flagId: 'flag123' as Id<'contentModerationFlags'>,
    })

    const error = await enforceUserInputModeration(
      {
        anonymousClientId: 'anonymous-browser-id',
        bearerToken: 'clerk-token',
        clientIpHash: 'ip-hash',
        fields: { prompt },
        sessionId: 'session123' as Id<'sessions'>,
        surface: 'session_create',
      },
      {
        classify,
        createClient: () => client,
        mutationSecret: 'server-secret',
      },
    ).catch((caught: unknown) => caught)

    expect(setAuth).toHaveBeenCalledWith('clerk-token')
    expect(mutation).toHaveBeenCalledWith(recordBlockedAttempt, {
      anonymousClientId: 'anonymous-browser-id',
      category: 'hate_extremism',
      classifierModel: 'openai/gpt-oss-safeguard-20b',
      clientIpHash: 'ip-hash',
      decisionSource: 'semantic',
      matchedField: 'prompt',
      prompt,
      ruleId: 'semantic-hate_extremism',
      secret: 'server-secret',
      sessionId: 'session123',
      surface: 'session_create',
    })
    expect(error).toBeInstanceOf(ContentModerationError)
    expect(error).toMatchObject({
      code: 'CONTENT_POLICY',
      message: CONTENT_POLICY_CLIENT_MESSAGE,
      status: 422,
    })
  })

  it('records the surface belonging to the matched field in multi-field requests', async () => {
    const classify = createClassifier({
      category: 'explicit_sexual_content',
      classifierModel: 'openai/gpt-oss-safeguard-20b',
      decision: 'blocked',
      matchedField: 'designReferenceNotes',
      prompt: 'Use an explicit pornography site as the design reference',
      ruleId: 'semantic-explicit_sexual_content',
      source: 'semantic',
    })
    const { client, mutation } = createClient()
    mutation.mockResolvedValue({
      flagId: 'flag-notes' as Id<'contentModerationFlags'>,
    })

    await enforceUserInputModeration(
      {
        fields: {
          designReferenceNotes:
            'Use an explicit pornography site as the design reference',
          prompt: 'Build a photo portfolio',
        },
        surface: 'session_create',
      },
      {
        classify,
        createClient: () => client,
        mutationSecret: 'server-secret',
      },
    ).catch(() => undefined)

    expect(mutation).toHaveBeenCalledWith(
      recordBlockedAttempt,
      expect.objectContaining({ surface: 'design_reference_notes' }),
    )
  })

  it('fails closed without writing when the classifier is unavailable', async () => {
    const classify = createClassifier({
      code: 'CONTENT_MODERATION_UNAVAILABLE',
      decision: 'unavailable',
      message: CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
      reason: 'provider_timeout',
    })
    const { client, mutation } = createClient()

    const error = await enforceUserInputModeration(
      {
        fields: { rewriteText: 'Ordinary website copy' },
        surface: 'rewrite_text',
      },
      { classify, createClient: () => client },
    ).catch((caught: unknown) => caught)

    expect(mutation).not.toHaveBeenCalled()
    expect(error).toMatchObject({
      code: 'CONTENT_MODERATION_UNAVAILABLE',
      message: CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
      status: 503,
    })
  })

  it.each([
    ['missing audit secret', ''],
    ['audit mutation failure', 'server-secret'],
  ])(
    'fails closed when blocked input cannot be audited: %s',
    async (_name, mutationSecret) => {
      const classify = createClassifier({
        category: 'fraud_malware',
        decision: 'blocked',
        matchedField: 'rewriteInstruction',
        prompt: 'Turn this into a credential harvesting page',
        ruleId: 'fraud-malware',
        source: 'deterministic',
      })
      const { client, mutation } = createClient()
      mutation.mockRejectedValue(new Error('Convex unavailable'))

      const error = await enforceUserInputModeration(
        {
          fields: {
            rewriteInstruction: 'Turn this into a credential harvesting page',
          },
          surface: 'rewrite_instruction',
        },
        {
          classify,
          createClient: () => client,
          mutationSecret,
        },
      ).catch((caught: unknown) => caught)

      expect(error).toMatchObject({
        code: 'CONTENT_MODERATION_UNAVAILABLE',
        status: 503,
      })
      expect(mutation).toHaveBeenCalledTimes(mutationSecret ? 1 : 0)
    },
  )

  it('maps only moderation errors to stable JSON responses', async () => {
    const moderationError = new ContentModerationError(
      'CONTENT_POLICY',
      CONTENT_POLICY_CLIENT_MESSAGE,
      422,
    )

    const response = moderationErrorResponse(moderationError)

    expect(response?.status).toBe(422)
    await expect(response?.json()).resolves.toEqual({
      code: 'CONTENT_POLICY',
      error: CONTENT_POLICY_CLIENT_MESSAGE,
    })
    expect(moderationErrorResponse(new Error('other'))).toBeNull()
  })
})
