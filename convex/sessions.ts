import { ConvexError, v } from 'convex/values'

import { internal } from './_generated/api'
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'

const exportTarget = v.union(
  v.literal('html'),
  v.literal('react'),
  v.literal('next'),
)

const engineTaskStatus = v.union(
  v.literal('PENDING'),
  v.literal('IN_PROGRESS'),
  v.literal('DONE'),
  v.literal('FAILED'),
)

const taskStatus = v.union(
  v.literal('pending'),
  v.literal('running'),
  v.literal('succeeded'),
  v.literal('failed'),
)

const ongoingGalleryStatuses = new Set([
  'created',
  'queued',
  'validating',
  'streaming',
])

const MAX_PROMPT_LENGTH = 5000
const MAX_ANON_PER_DAY = 2
const MAX_FREE_PER_MONTH = 10
const MAX_PAID_PER_MONTH = 30
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000
const MONTHLY_WINDOW_MS = 30 * DAILY_WINDOW_MS
const RATE_WINDOW_MS = 10 * 60 * 1000
const SHORT_WINDOW_LIMIT = 5
const genericPromptWords = new Set([
  'website',
  'site',
  'page',
  'landing',
  'app',
  'make',
  'build',
  'create',
  'generate',
  'nice',
  'good',
  'cool',
])

const blockedPolicyPatterns = [
  /\b(phishing|spoof|fake)\b[\s\S]{0,40}\b(login|checkout|bank|paypal|stripe|coinbase|wallet|oauth|2fa|password)\b/i,
  /\b(child|kid|minor|underage)\w*\b[\s\S]{0,48}\b(porn|xxx|nude|naked|sexual|erotic)\b/i,
  /\b(porn|xxx|escort|brothel|explicit|onlyfans)\b[\s\S]{0,64}\b(site|website|app|landing|marketplace|directory|booking|clone|gallery|store)\b/i,
  /\b(steal|harvest|collect)\b[\s\S]{0,40}\b(passwords?|credentials?|credit\s*cards?|private\s*keys?|seed\s*phrases?)\b/i,
  /\b(malware|ransomware|keylogger|trojan|botnet)\b[\s\S]{0,40}\b(site|website|landing|download|builder|dashboard|panel)\b/i,
]

const normalizeSpaces = (value: string): string =>
  value.replace(/\s+/g, ' ').trim()

const normalizePromptCacheKey = (prompt: string): string =>
  normalizeSpaces(prompt)
    .toLowerCase()
    .replace(/[^a-z0-9\p{L}\p{N}]+/gu, ' ')
    .trim()

const isLikelyGibberishPrompt = (prompt: string): boolean => {
  const text = normalizeSpaces(prompt)
  if (text.length < 8) return true
  const letters = (text.match(/[\p{L}]/gu) ?? []).length
  const alnum = (text.match(/[\p{L}\p{N}]/gu) ?? []).length
  if (alnum === 0 || letters / Math.max(1, text.length) < 0.35) return true
  const tokens = text.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? []
  if (tokens.length <= 1 && text.length < 18) return true
  if (
    tokens.length <= 2 &&
    tokens.every((token) => genericPromptWords.has(token))
  )
    return true
  const collapsed = text.toLowerCase().replace(/[^a-z]/g, '')
  return collapsed.length >= 8 && /(.)\1{5,}/.test(collapsed)
}

const assertContentPolicy = (prompt: string) => {
  blockedPolicyPatterns.some((pattern) => pattern.test(prompt)) &&
    (() => {
      throw new ConvexError({
        code: 'CONTENT_POLICY',
        message: 'This prompt is blocked by the content policy.',
      })
    })()
}

const normalizeOptionalHttpsUrl = (
  value: string | undefined,
  label: string,
): string | undefined => {
  const raw = value?.trim()
  if (!raw) return undefined
  try {
    const parsed = new URL(raw)
    parsed.hash = ''
    parsed.protocol === 'https:' ||
      (() => {
        throw new Error('HTTPS required')
      })()
    return parsed.toString()
  } catch {
    throw new ConvexError({
      code: 'INVALID_DESIGN_REFERENCE',
      message: `${label} must be a valid HTTPS URL.`,
    })
  }
}

const createFingerprint = (values: string[]): string | undefined => {
  const input = values.filter(Boolean).join('\n')
  if (!input) return undefined
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

const SCRIPT_STYLE_BLOCK_RE =
  /<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi

const applyPreviewTextEdit = (
  html: string,
  oldText: string | undefined,
  newText: string | undefined,
): { html: string; replaced: boolean } => {
  const from = String(oldText ?? '')
  const to = String(newText ?? '')
  if (!html.trim() || !from.trim()) return { html, replaced: false }
  const blocks: Array<{ token: string; value: string }> = []
  const protectedHtml = html.replace(SCRIPT_STYLE_BLOCK_RE, (value) => {
    const token = `__SHIP_FAST_PROTECTED_${blocks.length}__`
    blocks.push({ token, value })
    return token
  })
  const index = protectedHtml.indexOf(from)
  if (index < 0) return { html, replaced: false }
  const edited = `${protectedHtml.slice(0, index)}${to}${protectedHtml.slice(index + from.length)}`
  return {
    html: blocks.reduce(
      (current, block) => current.replace(block.token, block.value),
      edited,
    ),
    replaced: true,
  }
}

const hasGalleryReadySignal = (session: Doc<'sessions'>): boolean =>
  session.genuiStatus === 'done' ||
  session.homepageReady === true ||
  session.siteSpecReady === true ||
  session.openuiReady === true ||
  (session.previewVersion ?? 0) > 0

const isGalleryVisibleSession = (session: Doc<'sessions'>): boolean => {
  const status = session.status
  if (status !== undefined && ongoingGalleryStatuses.has(status))
    return hasGalleryReadySignal(session)
  if (status !== undefined) return true

  return hasGalleryReadySignal(session)
}

const galleryCategoryTerms = {
  saas: [
    'saas',
    'software',
    'platform',
    'dashboard',
    'analytics',
    'copilot',
    'ai',
  ],
  commerce: [
    'store',
    'shop',
    'ecommerce',
    'commerce',
    'product',
    'checkout',
    'subscription',
  ],
  portfolio: [
    'portfolio',
    'studio',
    'agency',
    'consultancy',
    'case studies',
    'architecture',
  ],
  blog: ['blog', 'publication', 'news', 'story', 'stories', 'article'],
  service: [
    'service',
    'booking',
    'local',
    'gym',
    'wellness',
    'grooming',
    'restaurant',
  ],
  app: ['app', 'mobile', 'tool', 'planner', 'manager', 'studio'],
} as const

const getGalleryCategories = (prompt: string): string[] => {
  const normalizedPrompt = prompt.toLowerCase()

  return Object.entries(galleryCategoryTerms)
    .filter(([, terms]) =>
      terms.some((term) => normalizedPrompt.includes(term)),
    )
    .map(([category]) => category)
}

const formatGalleryCategory = (category: string): string =>
  category
    .split(/[-_\s]+/)
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')

const getGalleryCategoryOptions = (sessions: Doc<'sessions'>[]) => {
  const counts = new Map<string, number>()

  for (const session of sessions) {
    for (const category of getGalleryCategories(session.prompt)) {
      counts.set(category, (counts.get(category) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .sort(
      ([categoryA, countA], [categoryB, countB]) =>
        countB - countA || categoryA.localeCompare(categoryB),
    )
    .map(([value, count]) => ({
      value,
      label: formatGalleryCategory(value),
      count,
    }))
}

const matchesGalleryFilters = (
  session: Doc<'sessions'>,
  search: string | undefined,
  category: string | undefined,
): boolean => {
  const categories = getGalleryCategories(session.prompt)
  const normalizedCategory = category?.trim().toLowerCase()
  if (
    normalizedCategory !== undefined &&
    normalizedCategory.length > 0 &&
    !categories.includes(normalizedCategory)
  ) {
    return false
  }

  const normalizedSearch = search?.trim().toLowerCase()
  if (normalizedSearch === undefined || normalizedSearch.length === 0)
    return true

  return [
    session._id,
    session.prompt,
    session.status,
    session.genuiStatus,
    ...(categories.length > 0 ? categories : ['website']),
  ]
    .filter((value): value is string => typeof value === 'string')
    .some((value) => value.toLowerCase().includes(normalizedSearch))
}

const engineTask = v.object({
  id: v.string(),
  label: v.string(),
  status: engineTaskStatus,
  filename: v.optional(v.string()),
  files: v.optional(v.array(v.string())),
})

const textEncoder = new TextEncoder()

const toHex = (bytes: ArrayBuffer): string =>
  Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

const hashOwnerSecret = async (ownerSecret: string): Promise<string> =>
  toHex(await crypto.subtle.digest('SHA-256', textEncoder.encode(ownerSecret)))

const getUserId = async (ctx: MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity()
  return identity?.tokenIdentifier ?? identity?.subject
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const renderInitialPreviewHtml = (prompt: string): string =>
  `<main style="font-family:Inter,system-ui,sans-serif;padding:48px;min-height:100vh;background:#f8fafc;color:#0f172a"><p style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#0891b2;font-weight:700">Generated by Ship Fast</p><h1 style="max-width:760px;font-size:44px;line-height:1.05;margin:16px 0 20px">${escapeHtml(prompt)}</h1><p style="max-width:680px;font-size:18px;line-height:1.7;color:#475569">This durable preview was written through self-hosted Convex. The GenUI engine will replace this placeholder with the full generated site pipeline.</p></main>`

const assertCanMutateSession = async (
  ctx: MutationCtx,
  session: { userId?: string; anonOwnerSecretHash?: string },
  anonymousOwnerSecret?: string,
) => {
  const userId = await getUserId(ctx)
  const anonymousOwnerSecretHash =
    anonymousOwnerSecret === undefined
      ? undefined
      : await hashOwnerSecret(anonymousOwnerSecret)
  const isUserOwner = session.userId !== undefined && session.userId === userId
  const isAnonymousOwner =
    session.userId === undefined &&
    session.anonOwnerSecretHash !== undefined &&
    session.anonOwnerSecretHash === anonymousOwnerSecretHash

  isUserOwner ||
    isAnonymousOwner ||
    (() => {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'You do not own this session',
      })
    })()
}

const assertPrompt = (prompt: string): void => {
  prompt.trim().length > 0 ||
    (() => {
      throw new ConvexError({
        code: 'INVALID_PROMPT',
        message: 'Prompt is required',
      })
    })()

  prompt.length <= MAX_PROMPT_LENGTH ||
    (() => {
      throw new ConvexError({
        code: 'PROMPT_TOO_LONG',
        message: `Prompt must be under ${MAX_PROMPT_LENGTH} characters`,
      })
    })()

  !isLikelyGibberishPrompt(prompt) ||
    (() => {
      throw new ConvexError({
        code: 'GIBBERISH_PROMPT',
        message: 'Describe a real website before generating',
      })
    })()

  assertContentPolicy(prompt)
}

const normalizeDeploymentSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 63)

const createDefaultDeploymentSlug = (
  prompt: string,
  sessionId: string,
): string => {
  const fromPrompt = normalizeDeploymentSlug(prompt)
    .split('-')
    .slice(0, 4)
    .join('-')
  const fallback = normalizeDeploymentSlug(sessionId).slice(0, 20)

  return fromPrompt || fallback || 'generated-site'
}

const createDeploymentUrl = (slug: string): string =>
  `https://${slug}.ship-fast.io`

const serializeSession = (session: Doc<'sessions'>) => ({
  sessionId: session._id,
  userId: session.userId,
  canClaimAnonymous:
    session.userId === undefined && session.anonOwnerSecretHash !== undefined,
  prompt: session.prompt,
  workspace: session.workspace,
  status:
    session.status ??
    (session.genuiStatus === 'done' ? 'preview_ready' : 'queued'),
  preferredLanguage: session.preferredLanguage,
  preferredExportTarget: session.preferredExportTarget,
  isPrivate: session.isPrivate,
  previewVersion: session.previewVersion ?? 0,
  elapsed: session.elapsed ?? null,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt ?? session.createdAt,
  errorCode: session.errorCode,
  errorMessage: session.errorMessage,
  deploymentSlug: session.deploymentSlug,
  designReferenceUrls: session.designReferenceUrls ?? [],
  designReferenceNotes: session.designReferenceNotes ?? '',
  cloneUrl: session.cloneUrl,
  designReferenceFingerprint: session.designReferenceFingerprint,
})

const toTaskStatus = (status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED') =>
  ({
    PENDING: 'pending',
    IN_PROGRESS: 'running',
    DONE: 'succeeded',
    FAILED: 'failed',
  })[status] as 'pending' | 'running' | 'succeeded' | 'failed'

const toTaskKey = (engineTaskId: string): string =>
  engineTaskId === 'home.openui' ? 'homepage' : engineTaskId

const upsertTask = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  task: {
    id: string
    label: string
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED'
  },
  order: number,
  now: number,
) => {
  const taskKey = toTaskKey(task.id)
  const existingTask = await ctx.db
    .query('tasks')
    .withIndex('by_sessionId_taskKey', (index) =>
      index.eq('sessionId', sessionId).eq('taskKey', taskKey),
    )
    .first()

  existingTask === null
    ? await ctx.db.insert('tasks', {
        sessionId,
        taskKey,
        title: task.label,
        status: toTaskStatus(task.status),
        order,
        createdAt: now,
        updatedAt: now,
      })
    : await ctx.db.patch(existingTask._id, {
        title: task.label,
        status: toTaskStatus(task.status),
        order,
        updatedAt: now,
      })
}

const upsertSiteSpec = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  specJson: string | undefined,
  now: number,
) => {
  if (specJson === undefined) return

  const existingSpec = await ctx.db
    .query('siteSpecs')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .first()

  existingSpec === null
    ? await ctx.db.insert('siteSpecs', {
        sessionId,
        specJson,
        createdAt: now,
        updatedAt: now,
      })
    : await ctx.db.patch(existingSpec._id, {
        specJson,
        updatedAt: now,
      })
}

const upsertHomeGeneratedModule = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  source: string | undefined,
  now: number,
) => {
  if (source === undefined) return

  const existingModule = await ctx.db
    .query('generatedModules')
    .withIndex('by_sessionId_moduleKey', (index) =>
      index.eq('sessionId', sessionId).eq('moduleKey', 'home'),
    )
    .first()

  existingModule === null
    ? await ctx.db.insert('generatedModules', {
        sessionId,
        moduleKey: 'home',
        source,
        status: 'succeeded',
        createdAt: now,
        updatedAt: now,
      })
    : await ctx.db.patch(existingModule._id, {
        source,
        status: 'succeeded',
        updatedAt: now,
      })
}

export const create = mutation({
  args: {
    prompt: v.string(),
    preferredLanguage: v.string(),
    preferredExportTarget: exportTarget,
    isPrivate: v.boolean(),
    workspace: v.string(),
    anonymousOwnerSecret: v.optional(v.string()),
    anonymousClientId: v.optional(v.string()),
    designReferenceUrls: v.optional(v.array(v.string())),
    designReferenceNotes: v.optional(v.string()),
    cloneUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
    const promptCacheKey = normalizePromptCacheKey(prompt)

    const recentCutoff = now - RATE_WINDOW_MS
    const quotaCutoff =
      now - (userId === undefined ? DAILY_WINDOW_MS : MONTHLY_WINDOW_MS)
    const sameOwnerSessions =
      userId !== undefined
        ? await ctx.db
            .query('sessions')
            .withIndex('by_userId', (index) => index.eq('userId', userId))
            .collect()
        : anonymousClientIdHash === undefined
          ? []
          : await ctx.db
              .query('sessions')
              .withIndex('by_anonymousClientIdHash', (index) =>
                index.eq('anonymousClientIdHash', anonymousClientIdHash),
              )
              .collect()
    const recentCount = sameOwnerSessions.filter(
      (session) => session.createdAt >= recentCutoff,
    ).length
    recentCount < SHORT_WINDOW_LIMIT ||
      (() => {
        throw new ConvexError({
          code: 'RATE_LIMITED',
          message:
            'Too many generation requests. Please wait a few minutes and try again.',
        })
      })()
    const activeSubscription =
      userId === undefined
        ? null
        : await ctx.db
            .query('subscriptions')
            .withIndex('by_userId', (index) => index.eq('userId', userId))
            .filter((query) =>
              query.or(
                query.eq(query.field('status'), 'active'),
                query.eq(query.field('status'), 'trialing'),
                query.eq(query.field('status'), 'authenticated'),
              ),
            )
            .first()
    const quotaLimit =
      userId === undefined
        ? MAX_ANON_PER_DAY
        : activeSubscription === null
          ? MAX_FREE_PER_MONTH
          : MAX_PAID_PER_MONTH
    const quotaCount = sameOwnerSessions.filter(
      (session) => session.createdAt >= quotaCutoff,
    ).length
    quotaCount < quotaLimit ||
      (() => {
        throw new ConvexError({
          code: 'QUOTA_EXCEEDED',
          message:
            userId === undefined
              ? 'Anonymous daily quota exhausted'
              : 'Monthly quota exhausted',
        })
      })()

    if (designReferenceFingerprint === undefined && args.isPrivate === false) {
      const cachedSession = await ctx.db
        .query('sessions')
        .withIndex('by_promptCacheKey', (index) =>
          index.eq('promptCacheKey', promptCacheKey),
        )
        .order('desc')
        .first()
      if (
        cachedSession !== null &&
        cachedSession.isPrivate === false &&
        (cachedSession.previewVersion ?? 0) > 0
      ) {
        await ctx.db.insert('generationEvents', {
          sessionId: cachedSession._id,
          eventType: 'cache_hit',
          message: 'Duplicate prompt reused existing generated session',
          createdAt: now,
        })
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
      isPrivate: args.isPrivate,
      previewVersion: 0,
      createdAt: now,
      updatedAt: now,
    })

    await ctx.db.insert('tasks', {
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

    const generationArgs =
      args.anonymousOwnerSecret === undefined
        ? { sessionId }
        : { sessionId, anonymousOwnerSecret: args.anonymousOwnerSecret }

    await ctx.scheduler.runAfter(
      0,
      internal.generation.startGeneration,
      generationArgs,
    )

    // Generate unique slug for session (fire-and-forget, no await)
    ;(async () => {
      const baseSlug = createDefaultDeploymentSlug(prompt, sessionId)
      let finalSlug = baseSlug
      let attempts = 0
      const maxAttempts = 10

      while (attempts < maxAttempts) {
        const existing = await ctx.db
          .query('sessions')
          .withIndex('by_deploymentSlug', (index) =>
            index.eq('deploymentSlug', finalSlug),
          )
          .first()

        if (!existing || existing._id === sessionId) {
          break
        }

        const randomSuffix = Math.random().toString(16).slice(2, 6)
        finalSlug = `${baseSlug}-${randomSuffix}`
        attempts++
      }

      await ctx.db.patch(sessionId, { deploymentSlug: finalSlug })
    })()

    return {
      sessionId,
      cached: false,
      remaining: Math.max(0, quotaLimit - quotaCount - 1),
    }
  },
})

export const getGenerationSession = internalQuery({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => await ctx.db.get(args.sessionId),
})

export const markGenerationStarted = internalMutation({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.patch(args.sessionId, {
      status: 'streaming',
      errorCode: undefined,
      errorMessage: undefined,
      updatedAt: now,
    })

    await upsertTask(
      ctx,
      args.sessionId,
      {
        id: 'homepage',
        label: 'Generate homepage',
        status: 'IN_PROGRESS',
      },
      0,
      now,
    )

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'status',
      message: 'Generation started',
      createdAt: now,
    })
  },
})

export const upsertGenerationTask = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    task: engineTask,
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await upsertTask(ctx, args.sessionId, args.task, args.order, Date.now())
  },
})

export const upsertGeneratedModule = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    moduleKey: v.string(),
    source: v.string(),
    status: v.optional(taskStatus),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const existingModule = await ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', args.sessionId).eq('moduleKey', args.moduleKey),
      )
      .first()

    existingModule === null
      ? await ctx.db.insert('generatedModules', {
          sessionId: args.sessionId,
          moduleKey: args.moduleKey,
          source: args.source,
          status: args.status ?? 'succeeded',
          createdAt: now,
          updatedAt: now,
        })
      : await ctx.db.patch(existingModule._id, {
          source: args.source,
          status: args.status ?? 'succeeded',
          errorMessage: undefined,
          updatedAt: now,
        })
  },
})

export const addGenerationEvent = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    eventType: v.string(),
    message: v.optional(v.string()),
    previewVersion: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: args.eventType,
      message: args.message,
      previewVersion: args.previewVersion,
      createdAt: now,
    })

    if (args.eventType === 'status') {
      await ctx.db.patch(args.sessionId, {
        status: 'streaming',
        updatedAt: now,
      })
    }
  },
})

export const getGenerationView = query({
  args: {
    sessionId: v.optional(v.id('sessions')),
    lookup: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const directSessionId: Id<'sessions'> | null =
      args.sessionId ??
      (args.lookup === undefined
        ? null
        : ctx.db.normalizeId('sessions', args.lookup))
    const exportId =
      directSessionId === null && args.lookup !== undefined
        ? ctx.db.normalizeId('exports', args.lookup)
        : null
    const exportRecord = exportId === null ? null : await ctx.db.get(exportId)
    const deployment =
      directSessionId === null && exportRecord === null && args.lookup !== undefined
        ? await ctx.db
          .query('deployments')
          .withIndex('by_slug', (index) => index.eq('slug', args.lookup))
          .first()
        : null
    const sessionId = directSessionId ?? exportRecord?.sessionId ?? deployment?.sessionId ?? null

    if (sessionId === null) return null

    const session = await ctx.db.get(sessionId)

    if (session === null) return null

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', sessionId),
      )
      .collect()
    const events = await ctx.db
      .query('generationEvents')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', sessionId),
      )
      .order('desc')
      .take(80)
    const homeModule = await ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', sessionId).eq('moduleKey', 'home'),
      )
      .first()
    const siteSpec = await ctx.db
      .query('siteSpecs')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', sessionId),
      )
      .first()
    const latestPreview = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', sessionId),
      )
      .order('desc')
      .first()

    return {
      session: serializeSession(session),
      tasks: tasks.sort(
        (left, right) => (left.order ?? 0) - (right.order ?? 0),
      ),
      events: events.reverse(),
      homeModule,
      siteSpec,
      latestPreview,
    }
  },
})

export const getEventStream = query({
  args: {
    sessionId: v.optional(v.id('sessions')),
    lookup: v.optional(v.string()),
    since: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sessionId: Id<'sessions'> | null =
      args.sessionId ??
      (args.lookup === undefined
        ? null
        : ctx.db.normalizeId('sessions', args.lookup))

    if (sessionId === null) return null

    const session = await ctx.db.get(sessionId)
    if (session === null) return null

    const limit = Math.max(1, Math.min(args.limit ?? 100, 250))
    const events = await ctx.db
      .query('generationEvents')
      .withIndex('by_sessionId_createdAt', (index) => {
        const scoped = index.eq('sessionId', sessionId)
        return args.since === undefined
          ? scoped
          : scoped.gt('createdAt', args.since)
      })
      .order('asc')
      .take(limit)

    return {
      session: serializeSession(session),
      events,
      cursor:
        events.length === 0 ? (args.since ?? null) : events.at(-1)!.createdAt,
    }
  },
})

export const getSessionApiResponse = query({
  args: {
    lookup: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    if (sessionId === null) return null

    const session = await ctx.db.get(sessionId)
    if (session === null) return null

    const [tasks, exports, deployment] = await Promise.all([
      ctx.db
        .query('tasks')
        .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
        .take(200),
      ctx.db
        .query('exports')
        .withIndex('by_sessionId_target', (index) =>
          index.eq('sessionId', sessionId),
        )
        .take(20),
      ctx.db
        .query('deployments')
        .withIndex('by_sessionId', (index) =>
          index.eq('sessionId', sessionId),
        )
        .order('desc')
        .first(),
    ])

    const sortedTasks = tasks.sort(
      (left, right) => (left.order ?? 0) - (right.order ?? 0),
    )
    const done = sortedTasks.filter(
      (task) => task.status === 'succeeded' || task.status === 'failed',
    ).length

    return {
      id: session._id,
      sessionId: session._id,
      prompt: session.prompt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt ?? session.createdAt,
      status:
        session.status ??
        (session.genuiStatus === 'done' ? 'preview_ready' : 'queued'),
      deployment:
        deployment === null
          ? session.deploymentSlug !== undefined &&
            session.deploymentUrl !== undefined
            ? {
                slug: session.deploymentSlug,
                url: session.deploymentUrl,
                status: 'ready',
              }
            : null
          : {
              slug: deployment.slug,
              url: deployment.url,
              status: deployment.status,
            },
      homepageReady: session.homepageReady === true,
      siteSpecReady: session.siteSpecReady === true,
      preferredExportTarget: session.preferredExportTarget,
      preferredLanguage: session.preferredLanguage,
      exportTargets: exports.map((exportRecord) => exportRecord.target),
      payment: null,
      themeOverride: session.themeOverride ?? null,
      taskCount: sortedTasks.length,
      done,
      tasks: sortedTasks.map((task) => ({
        id: task._id,
        title: task.title,
        status: task.status,
        order: task.order ?? 0,
        errorMessage: task.errorMessage ?? null,
      })),
      elapsed: session.elapsed ?? null,
      cost: session.cost ?? null,
      isAnonymous: session.userId === undefined,
      ecommerce: session.medusaConfig !== undefined,
      openuiReady: session.openuiReady === true,
      integrations: {
        sanity:
          session.sanityConfig === undefined
            ? null
            : { enabled: true, config: session.sanityConfig },
        medusa:
          session.medusaConfig === undefined
            ? null
            : { enabled: true, config: session.medusaConfig },
      },
      medusaAdminEmbed: {
        show: false,
        url: null,
      },
    }
  },
})

export const getWorkspace = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .collect()
    const preview = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .first()
    const deployment = await ctx.db
      .query('deployments')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first()
    const events = await ctx.db
      .query('generationEvents')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .take(12)

    return session === null
      ? null
      : {
          session: serializeSession(session),
          tasks: tasks.sort((left, right) => left.order - right.order),
          preview,
          deployment,
          events: events.reverse(),
        }
  },
})

export const getSessionReadiness = query({
  args: {
    lookup: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)

    if (sessionId === null) return null

    const session = await ctx.db.get(sessionId)

    if (session === null) return null

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const preview = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', sessionId),
      )
      .order('desc')
      .first()
    const siteSpec = await ctx.db
      .query('siteSpecs')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .first()
    const openUiModule = await ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', sessionId).eq('moduleKey', 'home'),
      )
      .first()
    const sortedTasks = tasks.sort((left, right) => left.order - right.order)
    const done = sortedTasks.filter(
      (task) => task.status === 'succeeded',
    ).length

    return {
      session: serializeSession(session),
      readiness: {
        homepageReady:
          session.status === 'homepage_ready' ||
          session.status === 'site_spec_ready' ||
          session.status === 'preview_ready' ||
          sortedTasks.some(
            (task) =>
              task.taskKey === 'homepage' && task.status === 'succeeded',
          ),
        openuiReady:
          preview !== null ||
          (openUiModule !== null && openUiModule.status === 'succeeded'),
        siteSpecReady:
          siteSpec !== null ||
          session.status === 'site_spec_ready' ||
          session.status === 'preview_ready',
        done,
        taskCount: sortedTasks.length,
      },
    }
  },
})

export const getPublicPreview = query({
  args: {
    lookup: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    const directSession =
      sessionId === null ? null : await ctx.db.get(sessionId)
    const deployment =
      directSession === null
        ? await ctx.db
            .query('deployments')
            .withIndex('by_slug', (index) => index.eq('slug', args.lookup))
            .first()
        : null
    const session =
      directSession ??
      (deployment === null ? null : await ctx.db.get(deployment.sessionId))

    if (session === null || session.isPrivate) return null

    const preview = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', session._id),
      )
      .order('desc')
      .first()

    return preview === null
      ? {
          sessionId: session._id,
          slug: deployment?.slug,
          status: session.status,
          previewVersion: session.previewVersion,
          html: undefined,
        }
      : {
          sessionId: session._id,
          slug: deployment?.slug,
          status: session.status,
          previewVersion: preview.version,
          html: preview.html,
        }
  },
})

export const publishPreview = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    requestedSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'log',
      message: 'Persisting generated homepage',
      createdAt: now,
    })

    session.isPrivate === false ||
      (() => {
        throw new ConvexError({
          code: 'PRIVATE_SESSION',
          message: 'Private sessions cannot be published',
        })
      })()

    session.status === 'preview_ready' ||
      (() => {
        throw new ConvexError({
          code: 'PREVIEW_NOT_READY',
          message: 'Preview is not ready to publish',
        })
      })()

    const preview = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .first()

    preview !== null ||
      (() => {
        throw new ConvexError({
          code: 'PREVIEW_NOT_READY',
          message: 'Preview is not ready to publish',
        })
      })()

    const existingDeployment = await ctx.db
      .query('deployments')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first()

    if (existingDeployment !== null && args.requestedSlug === undefined) {
      return {
        sessionId: args.sessionId,
        slug: existingDeployment.slug,
        url: existingDeployment.url,
        status: existingDeployment.status,
      }
    }

    const slug = normalizeDeploymentSlug(
      args.requestedSlug ??
        createDefaultDeploymentSlug(session.prompt, args.sessionId),
    )

    slug.length > 0 ||
      (() => {
        throw new ConvexError({
          code: 'INVALID_SLUG',
          message: 'Deployment slug is required',
        })
      })()

    const existingBySlug = await ctx.db
      .query('deployments')
      .withIndex('by_slug', (index) => index.eq('slug', slug))
      .first()

    existingBySlug === null ||
      existingBySlug.sessionId === args.sessionId ||
      (() => {
        throw new ConvexError({
          code: 'SLUG_TAKEN',
          message: 'Deployment slug is already taken',
        })
      })()

    const url = createDeploymentUrl(slug)

    existingDeployment === null
      ? await ctx.db.insert('deployments', {
          sessionId: args.sessionId,
          slug,
          url,
          status: 'ready',
          createdAt: now,
          updatedAt: now,
        })
      : await ctx.db.patch(existingDeployment._id, {
          slug,
          url,
          status: 'ready',
          errorMessage: undefined,
          updatedAt: now,
        })

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'published',
      message: `Published preview to ${url}`,
      previewVersion: preview.version,
      createdAt: now,
    })

    return {
      sessionId: args.sessionId,
      slug,
      url,
      status: 'ready' as const,
    }
  },
})

export const completeMockGeneration = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    const homepageTask = await ctx.db
      .query('tasks')
      .withIndex('by_sessionId_taskKey', (index) =>
        index.eq('sessionId', args.sessionId).eq('taskKey', 'homepage'),
      )
      .first()
    const html = renderInitialPreviewHtml(session.prompt)

    homepageTask !== null &&
      (await ctx.db.patch(homepageTask._id, {
        status: 'succeeded',
        updatedAt: now,
      }))

    await ctx.db.insert('previews', {
      sessionId: args.sessionId,
      version: 1,
      html,
      source: 'generation',
      createdAt: now,
    })

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'preview_ready',
      message: 'Initial preview ready',
      previewVersion: 1,
      createdAt: now,
    })

    await ctx.db.patch(args.sessionId, {
      status: 'preview_ready',
      previewVersion: 1,
      updatedAt: now,
    })

    return { sessionId: args.sessionId, previewVersion: 1 }
  },
})

export const completeGeneration = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    html: v.string(),
    siteSpecJson: v.optional(v.string()),
    openUiSource: v.optional(v.string()),
    tasks: v.array(engineTask),
    elapsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await Promise.all(
      args.tasks.map((task, index) =>
        upsertTask(ctx, args.sessionId, task, index, now),
      ),
    )
    await upsertSiteSpec(ctx, args.sessionId, args.siteSpecJson, now)
    await upsertHomeGeneratedModule(ctx, args.sessionId, args.openUiSource, now)

    const previewVersion = (session.previewVersion ?? 0) + 1

    await ctx.db.insert('previews', {
      sessionId: args.sessionId,
      version: previewVersion,
      html: args.html,
      source: 'generation',
      createdAt: now,
    })

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'preview_ready',
      message: 'Generated preview ready',
      previewVersion,
      createdAt: now,
    })

    await ctx.db.patch(args.sessionId, {
      status: 'preview_ready',
      previewVersion,
      elapsed: args.elapsed,
      updatedAt: now,
    })

    return { sessionId: args.sessionId, previewVersion }
  },
})

export const failGeneration = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    message: v.string(),
    elapsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    const homepageTask = await ctx.db
      .query('tasks')
      .withIndex('by_sessionId_taskKey', (index) =>
        index.eq('sessionId', args.sessionId).eq('taskKey', 'homepage'),
      )
      .first()

    homepageTask !== null &&
      (await ctx.db.patch(homepageTask._id, {
        status: 'failed',
        errorMessage: args.message,
        updatedAt: now,
      }))

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'failed',
      message: args.message,
      createdAt: now,
    })

    await ctx.db.patch(args.sessionId, {
      status: 'failed',
      errorCode: 'GENERATION_FAILED',
      errorMessage: args.message,
      elapsed: args.elapsed,
      updatedAt: now,
    })

    return { sessionId: args.sessionId }
  },
})

export const claimAnonymous = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx)
    const session = await ctx.db.get(args.sessionId)
    const anonymousOwnerSecretHash = await hashOwnerSecret(
      args.anonymousOwnerSecret,
    )

    userId !== undefined ||
      (() => {
        throw new ConvexError({
          code: 'AUTH_REQUIRED',
          message: 'Sign in to claim this session',
        })
      })()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    session.userId === undefined ||
      (() => {
        throw new ConvexError({
          code: 'ALREADY_OWNED',
          message: 'Session is already owned',
        })
      })()

    session.anonOwnerSecretHash === anonymousOwnerSecretHash ||
      (() => {
        throw new ConvexError({
          code: 'FORBIDDEN',
          message: 'Invalid anonymous owner secret',
        })
      })()

    await ctx.db.patch(args.sessionId, {
      userId,
      anonOwnerSecretHash: undefined,
      updatedAt: Date.now(),
    })

    return { sessionId: args.sessionId }
  },
})

export const createExport = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    target: exportTarget,
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    session.status === 'preview_ready' ||
      (() => {
        throw new ConvexError({
          code: 'PREVIEW_NOT_READY',
          message: 'Preview is not ready to export',
        })
      })()

    const preview = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .first()

    preview !== null ||
      (() => {
        throw new ConvexError({
          code: 'PREVIEW_NOT_READY',
          message: 'Preview is not ready to export',
        })
      })()

    const homeModule = await ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', args.sessionId).eq('moduleKey', 'home'),
      )
      .first()

    homeModule?.source?.trim().length ||
      (() => {
        throw new ConvexError({ code: 'ARTIFACT_NOT_READY', message: 'Generated source is not ready to export' })
      })()

    const fileCount = args.target === 'html' ? 1 : args.target === 'react' ? 5 : 6

    const existingExport = await ctx.db
      .query('exports')
      .withIndex('by_sessionId_target', (index) =>
        index.eq('sessionId', args.sessionId).eq('target', args.target),
      )
      .first()

    if (existingExport !== null && existingExport.status === 'ready') {
      return {
        exportId: existingExport._id,
        target: existingExport.target,
        status: existingExport.status,
        fileCount: existingExport.fileCount,
      }
    }

    const exportId =
      existingExport !== null
        ? existingExport._id
        : await ctx.db.insert('exports', {
          sessionId: args.sessionId,
          target: args.target,
          status: 'ready',
          fileCount,
          requiresPayment: false,
          createdAt: now,
          updatedAt: now,
        })

    if (existingExport !== null) {
      await ctx.db.patch(exportId, {
        status: 'ready',
        artifactPath: undefined,
        fileCount,
        errorMessage: undefined,
        updatedAt: now,
      })
    }

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'export_ready',
      message: `Export ready for ${args.target}`,
      previewVersion: preview.version,
      createdAt: now,
    })

    return {
      exportId,
      target: args.target,
      status: 'ready' as const,
      fileCount,
    }
  },
})

export const getExport = query({
  args: {
    sessionId: v.id('sessions'),
    target: exportTarget,
  },
  handler: async (ctx, args) => {
    const exportRecord = await ctx.db
      .query('exports')
      .withIndex('by_sessionId_target', (index) =>
        index.eq('sessionId', args.sessionId).eq('target', args.target),
      )
      .first()

    return exportRecord === null
      ? null
      : {
          exportId: exportRecord._id,
          target: exportRecord.target,
          status: exportRecord.status,
          fileCount: exportRecord.fileCount,
          requiresPayment: exportRecord.requiresPayment,
          errorMessage: exportRecord.errorMessage,
          createdAt: exportRecord.createdAt,
          updatedAt: exportRecord.updatedAt,
        }
  },
})

export const createEdit = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    editType: v.union(
      v.literal('text'),
      v.literal('ai_rewrite'),
      v.literal('chat'),
      v.literal('style'),
    ),
    targetLabel: v.optional(v.string()),
    beforeText: v.optional(v.string()),
    afterText: v.optional(v.string()),
    afterHtml: v.optional(v.string()),
    instruction: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    const preview = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .first()

    preview !== null ||
      (() => {
        throw new ConvexError({
          code: 'PREVIEW_NOT_READY',
          message: 'Preview is not ready',
        })
      })()

    const editedPreview =
      args.afterHtml !== undefined
        ? { html: args.afterHtml, replaced: true }
        : applyPreviewTextEdit(preview.html, args.beforeText, args.afterText)
    const nextPreviewVersion = editedPreview.replaced
      ? preview.version + 1
      : preview.version

    if (editedPreview.replaced) {
      await ctx.db.insert('previews', {
        sessionId: args.sessionId,
        version: nextPreviewVersion,
        html: editedPreview.html,
        source: args.editType === 'ai_rewrite' ? 'rewrite' : 'edit',
        createdAt: now,
      })
      await ctx.db.patch(args.sessionId, {
        previewVersion: nextPreviewVersion,
        updatedAt: now,
      })
      await ctx.db.insert('generationEvents', {
        sessionId: args.sessionId,
        eventType: 'preview_reload',
        message: 'Preview updated',
        previewVersion: nextPreviewVersion,
        createdAt: now,
      })
    }

    await ctx.db.insert('edits', {
      sessionId: args.sessionId,
      previewVersion: nextPreviewVersion,
      editType: args.editType,
      targetLabel: args.targetLabel,
      beforeText: args.beforeText,
      afterText: args.afterText,
      afterHtml: args.afterHtml,
      instruction: args.instruction,
      createdAt: now,
      userId: session.userId,
    })

    return {
      sessionId: args.sessionId,
      previewVersion: nextPreviewVersion,
      saved: editedPreview.replaced,
    }
  },
})

export const listEdits = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const edits = await ctx.db
      .query('edits')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .collect()

    return edits.map((edit) => ({
      editId: edit._id,
      editType: edit.editType,
      targetLabel: edit.targetLabel,
      beforeText: edit.beforeText,
      afterText: edit.afterText,
      afterHtml: edit.afterHtml,
      instruction: edit.instruction,
      previewVersion: edit.previewVersion,
      createdAt: edit.createdAt,
      userId: edit.userId,
    }))
  },
})

export const listPreviewHistory = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const previews = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .collect()

    return previews.map((preview) => ({
      previewId: preview._id,
      version: preview.version,
      source: preview.source,
      createdAt: preview.createdAt,
    }))
  },
})

export const restorePreviewVersion = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    const preview = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId).eq('version', args.version),
      )
      .first()

    preview !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Preview version not found',
        })
      })()

    const nextPreviewVersion = (session.previewVersion ?? preview.version) + 1
    await ctx.db.insert('previews', {
      sessionId: args.sessionId,
      version: nextPreviewVersion,
      html: preview.html,
      source: 'history_restore',
      createdAt: now,
    })
    await ctx.db.patch(args.sessionId, {
      previewVersion: nextPreviewVersion,
      updatedAt: now,
    })
    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'preview_reload',
      message: `Restored preview version ${args.version}`,
      previewVersion: nextPreviewVersion,
      createdAt: now,
    })

    return { sessionId: args.sessionId, previewVersion: nextPreviewVersion }
  },
})

export const sendChatMessage = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    await ctx.db.insert('chatMessages', {
      sessionId: args.sessionId,
      role: 'user',
      content: args.content,
      createdAt: now,
    })

    return { sessionId: args.sessionId }
  },
})

export const listChatMessages = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('chatMessages')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('asc')
      .collect()

    return messages.map((msg) => ({
      messageId: msg._id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    }))
  },
})

export const createAnnotation = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    annotationId: v.string(),
    agentationSessionKey: v.string(),
    comment: v.string(),
    elementLabel: v.string(),
    elementPath: v.string(),
    url: v.optional(v.string()),
    payloadJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    await ctx.db.insert('agentationAnnotations', {
      sessionId: args.sessionId,
      annotationId: args.annotationId,
      agentationSessionKey: args.agentationSessionKey,
      comment: args.comment,
      elementLabel: args.elementLabel,
      elementPath: args.elementPath,
      url: args.url,
      payloadJson: args.payloadJson,
      createdAt: now,
      updatedAt: now,
    })

    return { sessionId: args.sessionId }
  },
})

export const upsertAnnotation = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    annotationId: v.string(),
    agentationSessionKey: v.string(),
    comment: v.string(),
    elementLabel: v.string(),
    elementPath: v.string(),
    url: v.optional(v.string()),
    payloadJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    const existing = await ctx.db
      .query('agentationAnnotations')
      .withIndex('by_sessionId_annotationId', (index) =>
        index
          .eq('sessionId', args.sessionId)
          .eq('annotationId', args.annotationId),
      )
      .first()

    const payload = {
      agentationSessionKey: args.agentationSessionKey,
      comment: args.comment,
      elementLabel: args.elementLabel,
      elementPath: args.elementPath,
      url: args.url,
      payloadJson: args.payloadJson,
      updatedAt: now,
    }

    if (existing !== null) {
      await ctx.db.patch(existing._id, payload)
      return { sessionId: args.sessionId, annotationId: existing._id }
    }

    const annotationId = await ctx.db.insert('agentationAnnotations', {
      sessionId: args.sessionId,
      annotationId: args.annotationId,
      ...payload,
      createdAt: now,
    })

    return { sessionId: args.sessionId, annotationId }
  },
})

export const listAnnotations = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const annotations = await ctx.db
      .query('agentationAnnotations')
      .withIndex('by_sessionId_annotationId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .collect()

    return annotations.map((ann) => ({
      annotationId: ann._id,
      agentationSessionKey: ann.agentationSessionKey,
      comment: ann.comment,
      elementLabel: ann.elementLabel,
      elementPath: ann.elementPath,
      url: ann.url,
      payloadJson: ann.payloadJson,
      createdAt: ann.createdAt,
      updatedAt: ann.updatedAt,
    }))
  },
})

export const deleteAnnotation = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    annotationId: v.id('agentationAnnotations'),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    const annotation = await ctx.db.get(args.annotationId)

    annotation !== null && annotation.sessionId === args.sessionId
      ? await ctx.db.delete(args.annotationId)
      : (() => {
          throw new ConvexError({
            code: 'NOT_FOUND',
            message: 'Annotation not found for this session',
          })
        })()

    return { sessionId: args.sessionId }
  },
})

export const deleteAnnotationByAgentationId = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    annotationId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    const annotation = await ctx.db
      .query('agentationAnnotations')
      .withIndex('by_sessionId_annotationId', (index) =>
        index
          .eq('sessionId', args.sessionId)
          .eq('annotationId', args.annotationId),
      )
      .first()

    if (annotation !== null) {
      await ctx.db.delete(annotation._id)
    }

    return { sessionId: args.sessionId }
  },
})

export const clearAnnotations = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    const annotations = await ctx.db
      .query('agentationAnnotations')
      .withIndex('by_sessionId_annotationId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .collect()

    await Promise.all(
      annotations.map((annotation) => ctx.db.delete(annotation._id)),
    )

    return { sessionId: args.sessionId }
  },
})

export const upsertCmsConfig = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    projectId: v.optional(v.string()),
    dataset: v.optional(v.string()),
    configJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    const existing = await ctx.db
      .query('cmsConfigs')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first()

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        projectId: args.projectId,
        dataset: args.dataset,
        configJson: args.configJson,
        status: 'ready',
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('cmsConfigs', {
        sessionId: args.sessionId,
        status: 'ready',
        projectId: args.projectId,
        dataset: args.dataset,
        configJson: args.configJson,
        createdAt: now,
        updatedAt: now,
      })
    }

    return { sessionId: args.sessionId }
  },
})

export const getCmsConfig = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('cmsConfigs')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first()

    return config === null
      ? null
      : {
          configId: config._id,
          status: config.status,
          projectId: config.projectId,
          dataset: config.dataset,
          configJson: config.configJson,
          errorMessage: config.errorMessage,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt,
        }
  },
})

export const upsertCommerceConfig = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    backendUrl: v.optional(v.string()),
    adminUrl: v.optional(v.string()),
    storefrontUrl: v.optional(v.string()),
    configJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

    const existing = await ctx.db
      .query('commerceConfigs')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first()

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        backendUrl: args.backendUrl,
        adminUrl: args.adminUrl,
        storefrontUrl: args.storefrontUrl,
        configJson: args.configJson,
        status: 'ready',
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('commerceConfigs', {
        sessionId: args.sessionId,
        status: 'ready',
        backendUrl: args.backendUrl,
        adminUrl: args.adminUrl,
        storefrontUrl: args.storefrontUrl,
        configJson: args.configJson,
        createdAt: now,
        updatedAt: now,
      })
    }

    return { sessionId: args.sessionId }
  },
})

export const getCommerceConfig = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('commerceConfigs')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first()

    return config === null
      ? null
      : {
          configId: config._id,
          status: config.status,
          backendUrl: config.backendUrl,
          adminUrl: config.adminUrl,
          storefrontUrl: config.storefrontUrl,
          productCount: config.productCount,
          configJson: config.configJson,
          errorMessage: config.errorMessage,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt,
        }
  },
})

export const listPublicSessions = query({
  args: {
    limit: v.optional(v.number()),
    page: v.optional(v.number()),
    search: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 12, 1), 48)
    const requestedPage = Math.max(args.page ?? 1, 1)
    const scanLimit = Math.min(
      Math.max((requestedPage + 1) * limit * 6, 96),
      300,
    )
    const publicSessions = await ctx.db
      .query('sessions')
      .withIndex('by_public_createdAt', (index) => index.eq('isPrivate', false))
      .order('desc')
      .take(scanLimit)
    const visibleSessions = publicSessions.filter(isGalleryVisibleSession)
    const searchFilteredSessions = visibleSessions.filter((session) =>
      matchesGalleryFilters(session, args.search, undefined),
    )
    const availableCategories = getGalleryCategoryOptions(
      searchFilteredSessions,
    )
    const filteredSessions = searchFilteredSessions.filter((session) =>
      matchesGalleryFilters(session, undefined, args.category),
    )

    const total = filteredSessions.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(requestedPage, totalPages)
    const sessions = filteredSessions.slice((page - 1) * limit, page * limit)
    const items = await Promise.all(
      sessions.map(async (session) => {
        const [preview, homeModule, siteSpec] = await Promise.all([
          ctx.db
            .query('previews')
            .withIndex('by_sessionId_version', (index) =>
              index.eq('sessionId', session._id),
            )
            .order('desc')
            .first(),
          ctx.db
            .query('generatedModules')
            .withIndex('by_sessionId_moduleKey', (index) =>
              index.eq('sessionId', session._id).eq('moduleKey', 'home'),
            )
            .first(),
          ctx.db
            .query('siteSpecs')
            .withIndex('by_sessionId', (index) =>
              index.eq('sessionId', session._id),
            )
            .first(),
        ])

        return {
          sessionId: session._id,
          prompt: session.prompt,
          preferredLanguage: session.preferredLanguage,
          status: session.status ?? null,
          previewVersion: preview?.version ?? session.previewVersion ?? 0,
          createdAt: session.createdAt,
          elapsed: session.elapsed ?? null,
          html: preview?.html ?? null,
          moduleSource: homeModule?.source ?? null,
          siteSpecJson: siteSpec?.specJson ?? siteSpec?.spec ?? null,
          categories: getGalleryCategories(session.prompt),
        }
      }),
    )

    return {
      items,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      availableCategories,
    }
  },
})

export const getPublicGallerySession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.sessionId)
    if (sessionId === null) return null

    const session = await ctx.db.get(sessionId)
    if (
      session === null ||
      session.isPrivate === true ||
      !isGalleryVisibleSession(session)
    ) {
      return null
    }

    const [preview, homeModule, siteSpec] = await Promise.all([
      ctx.db
        .query('previews')
        .withIndex('by_sessionId_version', (index) =>
          index.eq('sessionId', session._id),
        )
        .order('desc')
        .first(),
      ctx.db
        .query('generatedModules')
        .withIndex('by_sessionId_moduleKey', (index) =>
          index.eq('sessionId', session._id).eq('moduleKey', 'home'),
        )
        .first(),
      ctx.db
        .query('siteSpecs')
        .withIndex('by_sessionId', (index) =>
          index.eq('sessionId', session._id),
        )
        .first(),
    ])

    const previewVersion = preview?.version ?? session.previewVersion ?? 0

    return {
      id: session._id,
      sessionId: session._id,
      prompt: session.prompt,
      preferredLanguage: session.preferredLanguage,
      status: session.status ?? null,
      previewVersion,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt ?? session.createdAt,
      html: preview?.html ?? null,
      moduleSource: homeModule?.source ?? null,
      siteSpecJson: siteSpec?.specJson ?? null,
      categories: getGalleryCategories(session.prompt),
      elapsed: session.elapsed ?? null,
      cost: session.cost ?? null,
      homepageReady: session.homepageReady ?? null,
      siteSpecReady: session.siteSpecReady ?? null,
      openuiReady: session.openuiReady ?? null,
      readiness: {
        homepageReady: session.homepageReady ?? null,
        siteSpecReady: session.siteSpecReady ?? null,
        openuiReady: session.openuiReady ?? null,
        previewReady: session.status === 'preview_ready',
      },
    }
  },
})

export const getDeploymentBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const deployment = await ctx.db
      .query('deployments')
      .withIndex('by_slug', (index) => index.eq('slug', args.slug))
      .first()

    if (deployment === null) {
      return null
    }

    const session = await ctx.db.get(deployment.sessionId)
    if (session === null) {
      return null
    }

    return {
      slug: deployment.slug,
      url: deployment.url,
      status: deployment.status,
      sessionId: deployment.sessionId,
      session: {
        id: session._id,
        prompt: session.prompt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt ?? session.createdAt,
        status: session.status ?? null,
      },
    }
  },
})

export const getDeploymentStatus = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const deployment = await ctx.db
      .query('deployments')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
      .first()

    if (deployment === null) {
      return null
    }

    return {
      slug: deployment.slug,
      url: deployment.url,
      status: deployment.status,
      createdAt: deployment.createdAt,
      updatedAt: deployment.updatedAt,
    }
  },
})

export const extractCmsBindings = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    const selectorRegex = /data-cms="([^"]+)"/g
    const bindings: Array<{ selector: string; type: string; field?: string }> = []
    let match

    while ((match = selectorRegex.exec(args.html)) !== null) {
      const selector = match[1]
      const typeMatch = selector.match(/type:(text|richtext|image|link)/)
      const fieldMatch = selector.match(/field:([a-zA-Z0-9_-]+)/)
      const type = typeMatch ? typeMatch[1] : 'text'
      const field = fieldMatch ? fieldMatch[1] : undefined

      bindings.push({ selector, type, field })
    }

    const now = Date.now()
    for (const binding of bindings) {
      await ctx.db.insert('cmsBindings', {
        sessionId: args.sessionId,
        selector: binding.selector,
        type: binding.type as 'text' | 'richtext' | 'image' | 'link',
        field: binding.field,
        createdAt: now,
      })
    }

    return { extracted: bindings.length }
  },
})

export const updateCmsEntry = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    bindingId: v.id('cmsBindings'),
    content: v.string(),
    contentType: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const binding = await ctx.db.get(args.bindingId)
    if (binding === null || binding.sessionId !== args.sessionId) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'CMS binding not found',
      })
    }

    const existingEntry = await ctx.db
      .query('cmsEntries')
      .withIndex('by_bindingId', (index) => index.eq('bindingId', args.bindingId))
      .first()

    const now = Date.now()

    if (existingEntry !== null) {
      await ctx.db.insert('cmsRevisions', {
        entryId: existingEntry._id,
        content: existingEntry.content,
        contentType: existingEntry.contentType,
        updatedBy: existingEntry.updatedBy,
        createdAt: now,
      })

      await ctx.db.patch(existingEntry._id, {
        content: args.content,
        contentType: args.contentType,
        updatedAt: now,
        updatedBy: args.updatedBy,
      })
    } else {
      await ctx.db.insert('cmsEntries', {
        sessionId: args.sessionId,
        bindingId: args.bindingId,
        content: args.content,
        contentType: args.contentType,
        updatedAt: now,
        updatedBy: args.updatedBy,
      })
    }

    return { success: true }
  },
})

export const restoreCmsRevision = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    revisionId: v.id('cmsRevisions'),
  },
  handler: async (ctx, args) => {
    const revision = await ctx.db.get(args.revisionId)
    if (revision === null) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'CMS revision not found',
      })
    }

    const entry = await ctx.db.get(revision.entryId)
    if (entry === null) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'CMS entry not found',
      })
    }

    const binding = await ctx.db.get(entry.bindingId)
    if (binding === null || binding.sessionId !== args.sessionId) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'CMS binding not found',
      })
    }

    const now = Date.now()

    await ctx.db.insert('cmsRevisions', {
      entryId: entry._id,
      content: entry.content,
      contentType: entry.contentType,
      updatedBy: entry.updatedBy,
      createdAt: now,
    })

    await ctx.db.patch(entry._id, {
      content: revision.content,
      contentType: revision.contentType,
      updatedAt: now,
      updatedBy: revision.updatedBy,
    })

    return { success: true }
  },
})

export const provisionMedusaTenant = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    backendUrl: v.string(),
    adminUrl: v.string(),
    storefrontUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const existingConfig = await ctx.db
      .query('commerceConfigs')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
      .first()

    if (existingConfig !== null) {
      await ctx.db.patch(existingConfig._id, {
        backendUrl: args.backendUrl,
        adminUrl: args.adminUrl,
        storefrontUrl: args.storefrontUrl,
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('commerceConfigs', {
        sessionId: args.sessionId,
        status: 'connected',
        backendUrl: args.backendUrl,
        adminUrl: args.adminUrl,
        storefrontUrl: args.storefrontUrl,
        productCount: 0,
        createdAt: now,
        updatedAt: now,
      })
    }

    return { success: true }
  },
})

export const syncMedusaProducts = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    products: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        handle: v.string(),
        price: v.number(),
        description: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('commerceConfigs')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
      .first()

    if (config === null) {
      throw new ConvexError({
        code: 'NOT_CONFIGURED',
        message: 'Medusa commerce config not found',
      })
    }

    const now = Date.now()
    await ctx.db.patch(config._id, {
      productCount: args.products.length,
      updatedAt: now,
    })

    return { synced: args.products.length }
  },
})

export const recordUsageMetric = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    eventType: v.string(),
    elapsedMs: v.number(),
    cost: v.number(),
    provider: v.string(),
    userId: v.optional(v.string()),
    anonymousClientIdHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.insert('usageMetrics', {
      sessionId: args.sessionId,
      eventType: args.eventType,
      timestamp: now,
      elapsedMs: args.elapsedMs,
      cost: args.cost,
      provider: args.provider,
      userId: args.userId,
      anonymousClientIdHash: args.anonymousClientIdHash,
    })
    return { recorded: true }
  },
})

export const getUsageMetrics = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const metrics = await ctx.db
      .query('usageMetrics')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
      .collect()

    return {
      totalCost: metrics.reduce((sum, m) => sum + m.cost, 0),
      totalElapsedMs: metrics.reduce((sum, m) => sum + m.elapsedMs, 0),
      count: metrics.length,
      byProvider: metrics.reduce((acc, m) => {
        acc[m.provider] = (acc[m.provider] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byEventType: metrics.reduce((acc, m) => {
        acc[m.eventType] = (acc[m.eventType] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }
  },
})

export const getUserUsageMetrics = query({
  args: {
    userId: v.string(),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query('usageMetrics')
      .withIndex('by_userId', (index) => index.eq('userId', args.userId))

    const metrics =
      args.since !== undefined
        ? await query.filter((m) => m.timestamp >= args.since).collect()
        : await query.collect()

    return {
      totalCost: metrics.reduce((sum, m) => sum + m.cost, 0),
      totalElapsedMs: metrics.reduce((sum, m) => sum + m.elapsedMs, 0),
      count: metrics.length,
      byProvider: metrics.reduce((acc, m) => {
        acc[m.provider] = (acc[m.provider] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byEventType: metrics.reduce((acc, m) => {
        acc[m.eventType] = (acc[m.eventType] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }
  },
})

export const listCmsEntries = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query('cmsEntries')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
      .collect()

    return entries
  },
})

export const insertCmsBinding = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    selector: v.string(),
    type: v.union(v.literal('text'), v.literal('richtext'), v.literal('image'), v.literal('link')),
    field: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const bindingId = await ctx.db.insert('cmsBindings', {
      sessionId: args.sessionId,
      selector: args.selector,
      type: args.type,
      field: args.field,
      createdAt: now,
    })
    return bindingId
  },
})

export const listCmsRevisions = internalQuery({
  args: {
    entryId: v.id('cmsEntries'),
  },
  handler: async (ctx, args) => {
    const revisions = await ctx.db
      .query('cmsRevisions')
      .withIndex('by_entryId', (index) => index.eq('entryId', args.entryId))
      .collect()

    return revisions
  },
})

export const getCommerceConfig = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('commerceConfigs')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
      .first()

    return config
  },
})
