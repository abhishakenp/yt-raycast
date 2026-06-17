import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { getModelConfigurationFailure } from '../generationConfig'
import {
  DAILY_WINDOW_MS,
  MAX_ANON_PER_DAY,
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  MONTHLY_WINDOW_MS,
  RATE_WINDOW_MS,
  SHARE_BONUS_EXTRA,
} from '../../src/billing/constants'
import { getUserId, hashOwnerSecret } from './session_access_helpers'
import { cloneCachedGeneratedArtifacts } from './session_artifact_helpers'
import { reserveDefaultDeploymentSlug } from './session_deployment_helpers'
import { recordOperationalGenerationEvent } from './session_operational_notifications'
import {
  assertPrompt,
  createFingerprint,
  normalizeOptionalHttpsUrl,
  normalizePromptCacheKey,
  normalizeSpaces,
} from './session_prompt_helpers'

type SessionCreationCtx = Pick<MutationCtx, 'db'>
type ScheduledFunctionReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]

type GenerationLimitEnv = {
  DISABLE_LIMIT?: string
  IS_DEV?: string
}

export const SHORT_WINDOW_LIMIT = 5
export const PROMPT_CACHE_LOOKBACK_LIMIT = 12

export const areGenerationLimitsDisabled = (
  env: GenerationLimitEnv = process.env,
): boolean => env.DISABLE_LIMIT === 'true' || env.IS_DEV === 'true'

export const findReusablePromptCacheSession = async (
  ctx: SessionCreationCtx,
  promptCacheKey: string,
): Promise<Doc<'sessions'> | null> => {
  const candidates = await ctx.db
    .query('sessions')
    .withIndex('by_promptCacheKey', (index) =>
      index.eq('promptCacheKey', promptCacheKey),
    )
    .order('desc')
    .take(PROMPT_CACHE_LOOKBACK_LIMIT)

  return (
    candidates.find(
      (session) =>
        session.isPrivate === false && (session.previewVersion ?? 0) > 0,
    ) ?? null
  )
}

export type FindIdempotentWorkspaceSessionArgs = {
  workspace: string
  prompt: string
  preferredLanguage: string
  preferredExportTarget: string
  designReferenceFingerprint?: string
  cloneUrl?: string
  engineVersion?: string
  isPrivate: boolean
  userId?: string
  anonymousClientIdHash?: string
}

export const findIdempotentWorkspaceSession = async (
  ctx: SessionCreationCtx,
  args: FindIdempotentWorkspaceSessionArgs,
): Promise<Doc<'sessions'> | null> => {
  const existing = await ctx.db
    .query('sessions')
    .withIndex('by_workspace', (index) => index.eq('workspace', args.workspace))
    .unique()

  if (existing === null) return null

  const sameOwner =
    existing.userId === args.userId &&
    existing.anonymousClientIdHash === args.anonymousClientIdHash
  const sameRequest =
    existing.prompt === args.prompt &&
    existing.preferredLanguage === args.preferredLanguage &&
    existing.preferredExportTarget === args.preferredExportTarget &&
    existing.designReferenceFingerprint === args.designReferenceFingerprint &&
    existing.cloneUrl === args.cloneUrl &&
    existing.engineVersion === args.engineVersion &&
    existing.isPrivate === args.isPrivate

  if (sameOwner && sameRequest) return existing

  throw new ConvexError({
    code: 'DUPLICATE_WORKSPACE',
    message:
      'This generation request was already used for a different session.',
  })
}

export type GenerationAdmissionInput = {
  userId?: string
  anonymousClientIdHash?: string
  now: number
  disableLimits: boolean
}

export type GenerationAdmission = {
  quotaLimit: number
  quotaCount: number
  remaining: number
}

export const loadGenerationAdmission = async (
  ctx: SessionCreationCtx,
  args: GenerationAdmissionInput,
): Promise<GenerationAdmission> => {
  const recentCutoff = args.now - RATE_WINDOW_MS
  const quotaCutoff =
    args.now - (args.userId === undefined ? DAILY_WINDOW_MS : MONTHLY_WINDOW_MS)
  const sameOwnerSessions =
    args.userId !== undefined
      ? await ctx.db
          .query('sessions')
          .withIndex('by_userId', (index) => index.eq('userId', args.userId))
          .take(MAX_PAID_PER_MONTH + SHORT_WINDOW_LIMIT + 1)
      : args.anonymousClientIdHash === undefined
        ? []
        : await ctx.db
            .query('sessions')
            .withIndex('by_anonymousClientIdHash', (index) =>
              index.eq('anonymousClientIdHash', args.anonymousClientIdHash),
            )
            .take(MAX_PAID_PER_MONTH + SHORT_WINDOW_LIMIT + 1)
  const recentCount = sameOwnerSessions.filter(
    (session) => session.createdAt >= recentCutoff,
  ).length

  recentCount < SHORT_WINDOW_LIMIT ||
    args.disableLimits ||
    (() => {
      throw new ConvexError({
        code: 'RATE_LIMITED',
        message:
          'Too many generation requests. Please wait a few minutes and try again.',
      })
    })()

  const userId = args.userId
  const activeSubscription =
    userId === undefined
      ? null
      : await ctx.db
          .query('subscriptions')
          .withIndex('by_userId', (index) => index.eq('userId', userId))
          .filter((subscriptionQuery) =>
            subscriptionQuery.or(
              subscriptionQuery.eq(subscriptionQuery.field('status'), 'active'),
              subscriptionQuery.eq(
                subscriptionQuery.field('status'),
                'trialing',
              ),
              subscriptionQuery.eq(
                subscriptionQuery.field('status'),
                'authenticated',
              ),
            ),
          )
          .first()
  const quotaLimit =
    args.userId === undefined
      ? MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA
      : activeSubscription === null
        ? MAX_FREE_PER_MONTH
        : MAX_PAID_PER_MONTH
  const quotaCount = sameOwnerSessions.filter(
    (session) => session.createdAt >= quotaCutoff,
  ).length

  quotaCount < quotaLimit ||
    args.disableLimits ||
    (() => {
      throw new ConvexError({
        code: 'QUOTA_EXCEEDED',
        message:
          args.userId === undefined
            ? 'Anonymous daily quota exhausted. Share on social media for +1 free generation, or sign in to continue.'
            : 'Monthly quota exhausted',
      })
    })()

  return {
    quotaLimit,
    quotaCount,
    remaining: Math.max(0, quotaLimit - quotaCount - 1),
  }
}

export type CreateGenerationSessionInput = {
  prompt: string
  preferredLanguage: string
  preferredExportTarget: string
  isPrivate: boolean
  workspace: string
  anonymousOwnerSecret?: string
  anonymousClientId?: string
  designReferenceUrls?: string[]
  designReferenceNotes?: string
  cloneUrl?: string
  engineVersion?: string
  reusePublicCache?: boolean
}

export type CreateGenerationSessionReferences = {
  startGeneration: ScheduledFunctionReference
  sendOperationalNotification: ScheduledFunctionReference
}

export type CreateGenerationSessionResult = {
  sessionId: Id<'sessions'>
  cached: boolean
  remaining?: number
  idempotent?: boolean
  reused?: boolean
  cloned?: boolean
}

export const createGenerationSession = async (
  ctx: MutationCtx,
  args: CreateGenerationSessionInput,
  references: CreateGenerationSessionReferences,
): Promise<CreateGenerationSessionResult> => {
  const disableLimits = areGenerationLimitsDisabled()
  const prompt = args.prompt.trim()
  const userId = await getUserId(ctx)
  const anonOwnerSecretHash =
    userId === undefined && args.anonymousOwnerSecret !== undefined
      ? await hashOwnerSecret(args.anonymousOwnerSecret)
      : undefined
  const anonymousClientIdHash =
    userId === undefined && args.anonymousClientId !== undefined
      ? await hashOwnerSecret(args.anonymousClientId)
      : undefined
  const now = Date.now()

  assertPrompt(prompt)

  const designReferenceUrls = (args.designReferenceUrls ?? [])
    .slice(0, 4)
    .map((url) => normalizeOptionalHttpsUrl(url, 'Design reference URL'))
    .filter((url): url is string => url !== undefined)
  const designReferenceNotes = normalizeSpaces(
    args.designReferenceNotes ?? '',
  ).slice(0, 800)
  const cloneUrl = normalizeOptionalHttpsUrl(args.cloneUrl, 'cloneUrl')
  const designReferenceFingerprint = createFingerprint([
    ...designReferenceUrls,
    cloneUrl ?? '',
    designReferenceNotes,
  ])
  const promptCacheKey = normalizePromptCacheKey(prompt, args.preferredLanguage)
  const idempotentSession = await findIdempotentWorkspaceSession(ctx, {
    workspace: args.workspace,
    prompt,
    preferredLanguage: args.preferredLanguage,
    preferredExportTarget: args.preferredExportTarget,
    designReferenceFingerprint,
    cloneUrl,
    engineVersion: args.engineVersion,
    isPrivate: args.isPrivate,
    userId,
    anonymousClientIdHash,
  })

  if (idempotentSession !== null) {
    return {
      sessionId: idempotentSession._id,
      cached: (idempotentSession.previewVersion ?? 0) > 0,
      idempotent: true,
    }
  }

  const canUsePromptCache =
    designReferenceFingerprint === undefined &&
    args.isPrivate === false &&
    userId === undefined &&
    args.engineVersion !== 'v2'
  const cachedSession = canUsePromptCache
    ? await findReusablePromptCacheSession(ctx, promptCacheKey)
    : null

  if (cachedSession !== null && args.reusePublicCache === true) {
    await recordOperationalGenerationEvent(
      ctx,
      {
        sessionId: cachedSession._id,
        eventType: 'cache_hit',
        message: 'Duplicate prompt reused existing generated session',
        cacheHit: true,
        provider: 'prompt-cache',
        userId,
        anonymousClientIdHash,
      },
      references.sendOperationalNotification,
    )
    return { sessionId: cachedSession._id, cached: true, reused: true }
  }

  const admission = await loadGenerationAdmission(ctx, {
    userId,
    anonymousClientIdHash,
    now,
    disableLimits,
  })

  if (cachedSession !== null) {
    if (args.anonymousOwnerSecret === undefined) {
      await recordOperationalGenerationEvent(
        ctx,
        {
          sessionId: cachedSession._id,
          eventType: 'cache_hit',
          message: 'Duplicate prompt reused existing generated session',
          cacheHit: true,
          provider: 'prompt-cache',
          userId,
          anonymousClientIdHash,
        },
        references.sendOperationalNotification,
      )
      return { sessionId: cachedSession._id, cached: true }
    }
  }

  const sessionId = await ctx.db.insert('sessions', {
    userId,
    anonOwnerSecretHash,
    anonymousClientIdHash,
    workspace: args.workspace,
    prompt,
    status: 'queued',
    preferredLanguage: args.preferredLanguage,
    preferredExportTarget: args.preferredExportTarget,
    designReferenceUrls,
    designReferenceNotes,
    cloneUrl,
    designReferenceFingerprint,
    promptCacheKey,
    engineVersion: args.engineVersion,
    isPrivate: args.isPrivate,
    previewVersion: 0,
    createdAt: now,
    updatedAt: now,
  })

  const homepageTaskId = await ctx.db.insert('tasks', {
    sessionId,
    taskKey: 'homepage',
    title: 'Generate homepage',
    status: 'pending',
    order: 0,
    createdAt: now,
    updatedAt: now,
  })

  await ctx.db.insert('generationEvents', {
    sessionId,
    eventType: 'queued',
    message: 'Generation queued',
    createdAt: now,
  })

  await reserveDefaultDeploymentSlug(ctx, prompt, sessionId)

  if (cachedSession !== null && args.anonymousOwnerSecret !== undefined) {
    const cloned = await cloneCachedGeneratedArtifacts(ctx, {
      cachedSession,
      targetSessionId: sessionId,
      userId,
      anonymousClientIdHash,
      now,
      sendOperationalNotification: references.sendOperationalNotification,
    })

    if (cloned) {
      return {
        sessionId,
        cached: true,
        cloned: true,
        remaining: admission.remaining,
      }
    }
  }

  const modelConfigurationFailure = getModelConfigurationFailure()
  if (modelConfigurationFailure !== null) {
    await ctx.db.patch(sessionId, {
      status: 'failed',
      errorCode: 'GENERATION_CONFIG_MISSING',
      errorMessage: modelConfigurationFailure,
      updatedAt: now,
    })
    await ctx.db.patch(homepageTaskId, {
      status: 'failed',
      errorMessage: modelConfigurationFailure,
      updatedAt: now,
    })
    await ctx.db.insert('generationEvents', {
      sessionId,
      eventType: 'failed',
      message: modelConfigurationFailure,
      createdAt: now,
    })
    await ctx.db.insert('generationEvents', {
      sessionId,
      eventType: 'generation_failed',
      message: modelConfigurationFailure,
      createdAt: now,
      elapsedMs: 0,
      error: modelConfigurationFailure,
    })

    return {
      sessionId,
      cached: false,
      remaining: admission.remaining,
    }
  }

  const generationArgs =
    args.anonymousOwnerSecret === undefined
      ? { sessionId }
      : { sessionId, anonymousOwnerSecret: args.anonymousOwnerSecret }

  await ctx.scheduler.runAfter(0, references.startGeneration, generationArgs)

  return {
    sessionId,
    cached: false,
    remaining: admission.remaining,
  }
}
