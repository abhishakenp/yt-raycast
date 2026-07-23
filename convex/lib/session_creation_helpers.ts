import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { getModelConfigurationFailure } from '../generationConfig'
import {
  DAILY_WINDOW_MS,
  MAX_ANON_PER_DAY,
  MAX_ANON_PER_MONTH,
  MAX_FREE_AUTH_PER_DAY,
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  MONTHLY_WINDOW_MS,
  RATE_WINDOW_MS,
  SHARE_BONUS_EXTRA,
} from '../../src/billing/constants'
import {
  getUserEmail,
  getUserId,
  hashOwnerSecret,
  isUserAdmin,
} from './session_access_helpers'
import { cloneCachedGeneratedArtifacts } from './session_artifact_helpers'
import { reserveDefaultDeploymentSlug } from './session_deployment_helpers'
import { deleteSessionGraph } from './session_delete_helpers'
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
const DRAFT_SESSION_TTL_MS = 15 * 60 * 1_000

export function areGenerationLimitsDisabled(
  env: GenerationLimitEnv = process.env,
): boolean {
  return env.DISABLE_LIMIT === 'true' || env.IS_DEV === 'true'
}

export async function findReusablePromptCacheSession(
  ctx: SessionCreationCtx,
  promptCacheKey: string,
): Promise<Doc<'sessions'> | null> {
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
        session.deletedAt === undefined &&
        session.isPrivate === false &&
        session.isDraft !== true &&
        (session.previewVersion ?? 0) > 0,
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
  clientIpHash?: string
}

export async function findIdempotentWorkspaceSession(
  ctx: SessionCreationCtx,
  args: FindIdempotentWorkspaceSessionArgs,
): Promise<Doc<'sessions'> | null> {
  const existing = await ctx.db
    .query('sessions')
    .withIndex('by_workspace', (index) => index.eq('workspace', args.workspace))
    .unique()

  if (existing === null || existing.deletedAt !== undefined) return null

  const sameOwner =
    existing.userId === args.userId &&
    existing.anonymousClientIdHash === args.anonymousClientIdHash &&
    existing.clientIpHash === args.clientIpHash
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
  clientIpHash?: string
  now: number
  disableLimits: boolean
  isAdmin?: boolean
}

export type GenerationAdmission = {
  quotaLimit: number
  quotaCount: number
  remaining: number
}

export async function loadGenerationAdmission(
  ctx: SessionCreationCtx,
  args: GenerationAdmissionInput,
): Promise<GenerationAdmission> {
  if (args.userId === undefined && args.clientIpHash === undefined) {
    throw new ConvexError({
      code: 'CLIENT_IP_REQUIRED',
      message: 'Anonymous generation requires a server IP bucket.',
    })
  }

  const recentCutoff = args.now - RATE_WINDOW_MS
  const dailyCutoff = args.now - DAILY_WINDOW_MS
  const monthlyCutoff = args.now - MONTHLY_WINDOW_MS
  const sameOwnerSessions =
    args.userId !== undefined
      ? await ctx.db
          .query('sessions')
          .withIndex('by_userId_createdAt', (index) =>
            index.eq('userId', args.userId),
          )
          .order('desc')
          .take(MAX_PAID_PER_MONTH + SHORT_WINDOW_LIMIT + 1)
      : await ctx.db
          .query('sessions')
          .withIndex('by_clientIpHash_createdAt', (index) =>
            index.eq('clientIpHash', args.clientIpHash),
          )
          .order('desc')
          .take(MAX_PAID_PER_MONTH + SHORT_WINDOW_LIMIT + 1)
  const recentCount = sameOwnerSessions.filter(
    (session) => session.createdAt >= recentCutoff,
  ).length

  recentCount < SHORT_WINDOW_LIMIT ||
    args.disableLimits ||
    args.isAdmin ||
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

  const isPaid = activeSubscription !== null
  const monthlyLimit =
    args.userId === undefined
      ? MAX_ANON_PER_MONTH
      : isPaid
        ? MAX_PAID_PER_MONTH
        : MAX_FREE_PER_MONTH
  const dailyLimit =
    args.userId === undefined
      ? MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA
      : isPaid
        ? undefined
        : MAX_FREE_AUTH_PER_DAY

  const monthlyCount = sameOwnerSessions.filter(
    (session) => session.createdAt >= monthlyCutoff,
  ).length

  monthlyCount < monthlyLimit ||
    args.disableLimits ||
    args.isAdmin ||
    (() => {
      throw new ConvexError({
        code: 'QUOTA_EXCEEDED',
        message: 'Monthly quota exhausted',
      })
    })()

  if (dailyLimit !== undefined) {
    const dailyCount = sameOwnerSessions.filter(
      (session) => session.createdAt >= dailyCutoff,
    ).length

    dailyCount < dailyLimit ||
      args.disableLimits ||
      args.isAdmin ||
      (() => {
        throw new ConvexError({
          code: 'QUOTA_EXCEEDED',
          message:
            args.userId === undefined
              ? 'Anonymous daily quota exhausted. Share on social media for +1 free generation.'
              : 'Daily limit reached. Come back tomorrow, or upgrade for unlimited daily generations.',
        })
      })()
  }

  return {
    quotaLimit: monthlyLimit,
    quotaCount: monthlyCount,
    remaining: Math.max(0, monthlyLimit - monthlyCount - 1),
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
  clientIpHash?: string
  designReferenceUrls?: string[]
  designReferenceNotes?: string
  cloneUrl?: string
  engineVersion?: string
  isDraft?: boolean
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

export async function createGenerationSession(
  ctx: MutationCtx,
  args: CreateGenerationSessionInput,
  references: CreateGenerationSessionReferences,
): Promise<CreateGenerationSessionResult> {
  const disableLimits = areGenerationLimitsDisabled()
  const prompt = args.prompt.trim()
  const isDraft = args.isDraft === true
  const userId = await getUserId(ctx)
  const ownerEmail = userId === undefined ? undefined : await getUserEmail(ctx)
  const isAdmin = userId !== undefined && (await isUserAdmin(ctx))
  const anonOwnerSecretHash =
    userId === undefined && args.anonymousOwnerSecret !== undefined
      ? await hashOwnerSecret(args.anonymousOwnerSecret)
      : undefined
  const anonymousClientIdHash =
    userId === undefined && args.anonymousClientId !== undefined
      ? await hashOwnerSecret(args.anonymousClientId)
      : undefined
  const clientIpHash =
    userId === undefined && args.clientIpHash !== undefined
      ? args.clientIpHash
      : undefined
  const now = Date.now()

  assertPrompt(prompt)

  if (!isDraft) {
    await deleteExpiredDraftSessions(ctx, now)
  }

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
    clientIpHash,
  })

  if (idempotentSession !== null) {
    if (idempotentSession.isDraft === true && !isDraft) {
      await ctx.db.patch(idempotentSession._id, {
        isDraft: false,
        updatedAt: now,
      })
    }

    return {
      sessionId: idempotentSession._id,
      cached: (idempotentSession.previewVersion ?? 0) > 0,
      idempotent: true,
    }
  }

  // Whole-session reuse (return/clone a finished public preview verbatim) is the
  // default for any public, non-reference, anonymous prompt: we always reuse a
  // ready public preview for the same prompt+language. The per-prompt content
  // cache still makes fresh generations cheap; the per-session seed re-randomizes
  // layout so unseen prompts still vary.
  const canUsePromptCache =
    designReferenceFingerprint === undefined &&
    args.isPrivate === false &&
    userId === undefined
  const cachedSession = canUsePromptCache
    ? await findReusablePromptCacheSession(ctx, promptCacheKey)
    : null

  // No-ownership replay: an anonymous viewer (no owner secret) reuses the ready
  // public preview as-is — no new session and no quota spend. A requester with an
  // owner secret instead gets their own clone below (so they can edit/deploy it).
  if (cachedSession !== null && args.anonymousOwnerSecret === undefined) {
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
    clientIpHash,
    now,
    disableLimits,
    isAdmin,
  })

  const sessionId = await ctx.db.insert('sessions', {
    userId,
    ownerEmail,
    anonOwnerSecretHash,
    anonymousClientIdHash,
    clientIpHash,
    workspace: args.workspace,
    prompt,
    status: 'queued',
    preferredLanguage: args.preferredLanguage,
    preferredExportTarget: args.preferredExportTarget,
    designReferenceUrls,
    designReferenceNotes,
    cloneUrl,
    // A clone request is a verbatim scrape — mark it immediately so the AI
    // generation path (startGeneration) is skipped from the start; the clone
    // job owns the preview. (Without this, AI gen races the scrape.)
    cloneMode: cloneUrl !== undefined ? true : undefined,
    designReferenceFingerprint,
    promptCacheKey,
    engineVersion: args.engineVersion,
    isPrivate: args.isPrivate,
    isDraft,
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

async function deleteExpiredDraftSessions(
  ctx: MutationCtx,
  now: number,
): Promise<void> {
  const cutoff = now - DRAFT_SESSION_TTL_MS
  const expiredDrafts = ctx.db
    .query('sessions')
    .withIndex('by_isDraft_createdAt', (index) => index.eq('isDraft', true))
    .order('asc')

  for await (const session of expiredDrafts) {
    if (session.createdAt >= cutoff) break
    if (session.deletedAt !== undefined) continue
    await deleteSessionGraph(ctx, session._id)
  }
}
