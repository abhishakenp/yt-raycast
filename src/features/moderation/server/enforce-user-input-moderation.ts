import type { ConvexHttpClient } from 'convex/browser'
import { makeFunctionReference } from 'convex/server'

import type { Id } from '../../../../convex/_generated/dataModel'
import type { RecordBlockedAttemptArgs } from '../../../../convex/moderation'
import type {
  ModerationField,
  ModerationSurface,
} from '../../../../convex/lib/content_moderation_policy'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { CONTENT_POLICY_CLIENT_MESSAGE } from '@/lib/content-policy'
import {
  classifyUserInput,
  CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
  type ClassifyUserInputOptions,
  type UserInputModerationResult,
} from './moderation-classifier'

type ModerationErrorCode = 'CONTENT_POLICY' | 'CONTENT_MODERATION_UNAVAILABLE'

type ClassifyUserInput = (
  options: ClassifyUserInputOptions,
) => Promise<UserInputModerationResult>

const recordBlockedAttempt = makeFunctionReference<
  'mutation',
  RecordBlockedAttemptArgs,
  { flagId: Id<'contentModerationFlags'> }
>('moderation:recordBlockedAttempt')

export type ModerationAuditClient = {
  mutation: (
    reference: typeof recordBlockedAttempt,
    args: RecordBlockedAttemptArgs,
  ) => Promise<{ flagId: Id<'contentModerationFlags'> }>
  setAuth?: ConvexHttpClient['setAuth']
}

type EnforceUserInputModerationInput = ClassifyUserInputOptions & {
  anonymousClientId?: string
  bearerToken?: string | null
  clientIpHash?: string
  sessionId?: Id<'sessions'>
}

type EnforceUserInputModerationDependencies = {
  classify?: ClassifyUserInput
  createClient?: () => ModerationAuditClient
  mutationSecret?: string
}

export class ContentModerationError extends Error {
  constructor(
    readonly code: ModerationErrorCode,
    message: string,
    readonly status: 422 | 503,
  ) {
    super(message)
    this.name = 'ContentModerationError'
  }
}

const unavailableError = () =>
  new ContentModerationError(
    'CONTENT_MODERATION_UNAVAILABLE',
    CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
    503,
  )

const surfaceByField: Record<ModerationField, ModerationSurface> = {
  cloneBrief: 'clone_brief',
  cloneRegeneration: 'clone_regeneration',
  customLanguage: 'custom_language',
  designReferenceNotes: 'design_reference_notes',
  prompt: 'session_create',
  rewriteInstruction: 'rewrite_instruction',
  rewriteText: 'rewrite_text',
  sectionEdit: 'section_edit',
  translationSource: 'translation_source',
}

export const enforceUserInputModeration = async (
  {
    anonymousClientId,
    bearerToken,
    clientIpHash,
    fields,
    sessionId,
    surface,
  }: EnforceUserInputModerationInput,
  {
    classify = classifyUserInput,
    createClient = createRuntimeConvexHttpClient,
    mutationSecret = process.env.CONTENT_MODERATION_MUTATION_SECRET,
  }: EnforceUserInputModerationDependencies = {},
): Promise<void> => {
  const decision = await classify({ fields, surface })
  if (decision.decision === 'safe') return
  if (decision.decision === 'unavailable') throw unavailableError()

  // Deterministic blocks must be enforced regardless of whether the audit
  // mutation is available. The audit recording is best-effort — a missing
  // mutation secret or a Convex outage must NOT let blocked content through.
  if (decision.source === 'deterministic') {
    if (mutationSecret) {
      try {
        const client = createClient()
        if (bearerToken) client.setAuth?.(bearerToken)
        await client.mutation(recordBlockedAttempt, {
          anonymousClientId,
          category: decision.category,
          classifierModel: undefined,
          clientIpHash,
          decisionSource: decision.source,
          matchedField: decision.matchedField,
          prompt: decision.prompt,
          ruleId: decision.ruleId,
          secret: mutationSecret,
          sessionId,
          surface: surfaceByField[decision.matchedField],
        })
      } catch {
        // Audit recording failed — still block the content.
      }
    }
    throw new ContentModerationError(
      'CONTENT_POLICY',
      CONTENT_POLICY_CLIENT_MESSAGE,
      422,
    )
  }

  // Semantic blocks require the audit mutation to be available so the
  // decision can be reviewed. If the mutation is unavailable, treat as
  // unavailable rather than blocking (to avoid false positives without
  // audit trail).
  if (!mutationSecret) throw unavailableError()

  try {
    const client = createClient()
    if (bearerToken) client.setAuth?.(bearerToken)
    await client.mutation(recordBlockedAttempt, {
      anonymousClientId,
      category: decision.category,
      classifierModel:
        decision.source === 'semantic' ? decision.classifierModel : undefined,
      clientIpHash,
      decisionSource: decision.source,
      matchedField: decision.matchedField,
      prompt: decision.prompt,
      ruleId: decision.ruleId,
      secret: mutationSecret,
      sessionId,
      surface: surfaceByField[decision.matchedField],
    })
  } catch {
    throw unavailableError()
  }

  throw new ContentModerationError(
    'CONTENT_POLICY',
    CONTENT_POLICY_CLIENT_MESSAGE,
    422,
  )
}

export const moderationErrorResponse = (error: unknown): Response | null => {
  if (!(error instanceof ContentModerationError)) return null
  return new Response(
    JSON.stringify({
      code: error.code,
      error: error.message,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: error.status,
    },
  )
}
