import { ConvexError, v } from 'convex/values'

import { internal } from './_generated/api'
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { SHARE_BONUS_EXTRA } from '../src/billing/constants'
import { getModelConfigurationFailure } from './generationConfig'
import {
  applyCmsPreviewEdit,
  escapeHtml,
  escapeRegExp,
  extractCmsBindingCandidatesFromHtml,
  extractCmsBindingCandidatesFromSiteSpec,
} from './lib/cms_helpers'
import {
  buildChatRefinedOpenUiSource,
  buildChatRefinedPreviewHtml,
  buildChatRefinedSiteSpecJson,
  MAX_CHAT_MESSAGE_LENGTH,
  parseChatRefinementPlanJson,
  replaceFirstJsonText,
  truncateText,
} from './lib/chat_refinement_helpers'
import {
  getGalleryCategories,
  getGalleryCategoryOptions,
  isGalleryVisibleSession,
  matchesGalleryFilters,
} from './lib/gallery_helpers'

const loadOpenUISSR = async () => {
  const { renderOpenUIToHTMLWithTheme } =
    await import('@ship-fast/engine/openui-ssr.js')
  return { renderOpenUIToHTMLWithTheme }
}

const internalFunctions = internal as any

const exportTarget = v.union(
  v.literal('html'),
  v.literal('react'),
  v.literal('next'),
)

const exportTargetFileCount = (target: 'html' | 'react' | 'next'): number => {
  switch (target) {
    case 'html':
      return 5
    case 'react':
    case 'next':
      return 7
  }
}

const activeExportSubscriptionStatuses = new Set([
  'active',
  'trialing',
  'authenticated',
])

type OperationalNotificationPayload = {
  sessionId: Id<'sessions'>
  eventType: string
  message?: string
  elapsedMs?: number
  cost?: number
  provider?: string
  error?: string
  quotaHit?: boolean
  cacheHit?: boolean
}

const shouldNotifyOperationalEvent = (
  event: Pick<
    OperationalNotificationPayload,
    'cacheHit' | 'cost' | 'error' | 'eventType' | 'quotaHit'
  >,
): boolean =>
  event.error !== undefined ||
  event.eventType === 'generation_failed' ||
  event.quotaHit === true ||
  event.cacheHit === true ||
  (event.cost ?? 0) > 0

const formatOperationalNotification = (
  event: OperationalNotificationPayload,
): string => {
  const details = [
    `event=${event.eventType}`,
    `session=${event.sessionId}`,
    event.provider === undefined ? undefined : `provider=${event.provider}`,
    event.elapsedMs === undefined ? undefined : `elapsedMs=${event.elapsedMs}`,
    event.cost === undefined ? undefined : `cost=${event.cost}`,
    event.quotaHit === true ? 'quotaHit=true' : undefined,
    event.cacheHit === true ? 'cacheHit=true' : undefined,
    event.error === undefined ? undefined : `error=${event.error}`,
  ].filter((item): item is string => item !== undefined)

  return [`Ship Fast operational event`, ...details, event.message]
    .filter(Boolean)
    .join('\n')
}

const scheduleOperationalNotification = async (
  ctx: MutationCtx,
  event: OperationalNotificationPayload,
): Promise<void> => {
  if (!shouldNotifyOperationalEvent(event)) return

  await ctx.scheduler.runAfter(
    0,
    internalFunctions.sessions.sendOperationalNotification,
    event,
  )
}

type RecordOperationalGenerationEventInput = OperationalNotificationPayload & {
  userId?: string
  anonymousClientIdHash?: string
  createdAt?: number
}

const recordOperationalGenerationEvent = async (
  ctx: MutationCtx,
  args: RecordOperationalGenerationEventInput,
) => {
  const session = await ctx.db.get(args.sessionId)
  const now = args.createdAt ?? Date.now()

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: args.eventType,
    message: args.message,
    createdAt: now,
    elapsedMs: args.elapsedMs,
    cost: args.cost,
    provider: args.provider,
    error: args.error,
    quotaHit: args.quotaHit,
    cacheHit: args.cacheHit,
  })

  const shouldRecordUsage =
    args.elapsedMs !== undefined ||
    args.cost !== undefined ||
    args.provider !== undefined ||
    args.userId !== undefined ||
    args.anonymousClientIdHash !== undefined

  if (shouldRecordUsage) {
    await ctx.db.insert('usageMetrics', {
      sessionId: args.sessionId,
      eventType: args.eventType,
      timestamp: now,
      elapsedMs: args.elapsedMs ?? 0,
      cost: args.cost ?? 0,
      provider: args.provider ?? 'unknown',
      userId: args.userId ?? session.userId,
      anonymousClientIdHash:
        args.anonymousClientIdHash ?? session.anonymousClientIdHash,
    })
  }

  await scheduleOperationalNotification(ctx, {
    sessionId: args.sessionId,
    eventType: args.eventType,
    message: args.message,
    elapsedMs: args.elapsedMs,
    cost: args.cost,
    provider: args.provider,
    error: args.error,
    quotaHit: args.quotaHit,
    cacheHit: args.cacheHit,
  })

  return {
    recorded: true,
    usageRecorded: shouldRecordUsage,
    alertable: shouldNotifyOperationalEvent(args),
  }
}

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

const MAX_PROMPT_LENGTH = 5000
const MAX_ANON_PER_DAY = 2
const MAX_FREE_PER_MONTH = 10
const MAX_PAID_PER_MONTH = 30
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000
const MONTHLY_WINDOW_MS = 30 * DAILY_WINDOW_MS
const RATE_WINDOW_MS = 10 * 60 * 1000
const SHORT_WINDOW_LIMIT = 5
const areGenerationLimitsDisabled = (): boolean =>
  process.env.DISABLE_LIMIT === 'true' || process.env.IS_DEV === 'true'
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

const normalizePromptCacheKey = (
  prompt: string,
  preferredLanguage = 'en',
): string =>
  `${normalizeSpaces(preferredLanguage).toLowerCase() || 'en'}:${normalizeSpaces(
    prompt,
  )
    .toLowerCase()
    .replace(/[^a-z0-9\p{L}\p{N}]+/gu, ' ')
    .trim()}`

const PROMPT_CACHE_LOOKBACK_LIMIT = 12
const startableGenerationStatuses = new Set<
  Doc<'sessions'>['status'] | undefined
>([undefined, 'created', 'queued', 'validating'])

const findReusablePromptCacheSession = async (
  ctx: MutationCtx,
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

const findIdempotentWorkspaceSession = async (
  ctx: MutationCtx,
  args: {
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
  },
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
    message: 'This generation request was already used for a different session.',
  })
}

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

// Text-level (inline) tags only. The needle is a block's flattened textContent,
// so inline formatting (<strong>, <a>, <br>, …) may be interspersed with the
// text and must be tolerated. Structural/block wrappers (<p>, <li>, <h1>, <div>)
// are deliberately excluded so the match never swallows — and the replacement
// never destroys — the element that contains the edited text.
const INLINE_TAG =
  '<\\/?(?:a|abbr|b|bdi|bdo|big|br|cite|code|data|del|dfn|em|font|i|ins|kbd|label|mark|q|rp|rt|ruby|s|samp|small|span|strong|sub|sup|time|tt|u|var|wbr)\\b[^>]*>'

// Markup that may sit between the characters of a flattened text run without
// being part of it: inline tags AND HTML comments. React renders `<!-- -->`
// separators between adjacent text nodes, so the stored HTML routinely contains
// e.g. `\u201C<!-- -->One paw<!-- -->\u201D` while the DOM textContent is `\u201COne paw\u201D`.
// Block wrappers are deliberately NOT bridged (would let a match swallow the
// element and the replacement destroy it).
const BRIDGE_MARKUP = `(?:${INLINE_TAG}|<!--[\\s\\S]*?-->)`

const createMarkupTolerantTextPattern = (
  value: string,
): RegExp | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  // Guard against pathological backtracking
  if (trimmed.length > 500) return null

  const entityAlternations: Record<string, string> = {
    '&': '(?:&amp;|&)',
    '<': '(?:&lt;|<)',
    '>': '(?:&gt;|>)',
    '"': '(?:&quot;|&#34;|")',
    "'": '(?:&#39;|&apos;|\\u0027)',
    '\u2018': '(?:&#8216;|&lsquo;|\u2018)',
    '\u2019': '(?:&#8217;|&rsquo;|\u2019)',
    '\u201C': '(?:&#8220;|&ldquo;|\u201C)',
    '\u201D': '(?:&#8221;|&rdquo;|\u201D)',
    '\u2014': '(?:&mdash;|&#8212;|\u2014)',
    '\u2013': '(?:&ndash;|&#8211;|\u2013)',
    '\u2026': '(?:&hellip;|&#8230;|\u2026)',
  }

  let pattern = ''
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i]

    // Any whitespace in the needle should tolerate runs of whitespace,
    // nbsp entities, and interspersed inline tags / comments (e.g. <br>).
    if (/\s/.test(char)) {
      pattern += `(?:${INLINE_TAG}|<!--[\\s\\S]*?-->|\\s|&nbsp;|&#160;)+`
      continue
    }

    const entityAlt = entityAlternations[char]
    pattern += entityAlt ?? escapeRegExp(char)

    // Allow optional inline tags / comments between characters
    if (i < trimmed.length - 1) {
      pattern += `(?:${BRIDGE_MARKUP})*`
    }
  }

  // Allow optional inline tags / comments wrapping the start and end of the text
  pattern = `(?:${BRIDGE_MARKUP})*${pattern}(?:${BRIDGE_MARKUP})*`

  return new RegExp(pattern)
}

const applyImageSwap = (
  html: string,
  oldSrc: string | undefined,
  newSrc: string | undefined,
): { html: string; replaced: boolean } => {
  const from = String(oldSrc ?? '')
  const to = String(newSrc ?? '')
  if (!html.trim() || !from.trim()) return { html, replaced: false }

  // Replace src attribute in img tags
  const imgPattern = new RegExp(
    `(<img[^>]*\\s)src=["']${escapeRegExp(from)}["']([^>]*>)`,
    'gi',
  )
  const replaced = html.replace(imgPattern, `$1src="${to}"$2`)

  return { html: replaced, replaced: replaced !== html }
}

// Surgically update only the inline `style` attribute of the element identified
// by its exact `class` attribute (the only stable anchor present in BOTH the
// live editor DOM and the server-rendered stored preview HTML — note the stored
// HTML has no data-tsd-source), leaving the rest of the document intact. Style
// edits must NEVER replace the whole document. `occurrenceIndex` disambiguates
// repeated class strings in document order. Returns replaced:false (never
// throws, never corrupts) when the anchor is missing or not found, so a failed
// style edit leaves the page untouched.
const applyStyleEdit = (
  html: string,
  classAnchor: string | undefined,
  styleValue: string | undefined,
  occurrenceIndex?: number,
): { html: string; replaced: boolean } => {
  const cls = String(classAnchor ?? '').trim()
  if (!html.trim() || !cls) return { html, replaced: false }
  const tagRe = new RegExp(
    `<[a-zA-Z][\\w-]*\\b[^>]*\\bclass="${escapeRegExp(cls)}"[^>]*?>`,
    'g',
  )
  const matches: Array<{ index: number; tag: string }> = []
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(html)) !== null) {
    matches.push({ index: m.index, tag: m[0] })
    if (m[0].length === 0) tagRe.lastIndex += 1
  }
  if (matches.length === 0) return { html, replaced: false }
  const wanted =
    occurrenceIndex !== undefined && occurrenceIndex >= 0
      ? Math.min(occurrenceIndex, matches.length - 1)
      : 0
  const target = matches[wanted]
  const escaped = String(styleValue ?? '').replace(/"/g, '&quot;')
  const styleAttrRe = /\sstyle\s*=\s*"[^"]*"/i
  const selfClose = /\/>$/.test(target.tag)
  let updatedTag: string
  if (styleAttrRe.test(target.tag)) {
    updatedTag = target.tag.replace(styleAttrRe, ` style="${escaped}"`)
  } else if (selfClose) {
    updatedTag = target.tag.replace(/\/>$/, ` style="${escaped}" />`)
  } else {
    updatedTag = target.tag.replace(/>$/, ` style="${escaped}">`)
  }
  const edited =
    html.slice(0, target.index) +
    updatedTag +
    html.slice(target.index + target.tag.length)
  return { html: edited, replaced: true }
}

// Collect every non-overlapping occurrence of `from` in `text`, by exact
// substring first; if there are none, fall back to the markup-tolerant pattern
// (inline tags/entities split the text). Returns matches in document order.
const collectTextMatches = (
  text: string,
  from: string,
): Array<{ index: number; length: number }> => {
  const exact: Array<{ index: number; length: number }> = []
  let cursor = text.indexOf(from)
  while (cursor >= 0) {
    exact.push({ index: cursor, length: from.length })
    cursor = text.indexOf(from, cursor + Math.max(1, from.length))
  }
  if (exact.length > 0) return exact

  const pattern = createMarkupTolerantTextPattern(from)
  if (pattern === null) return []
  const globalPattern = new RegExp(pattern.source, 'g')
  const tolerant: Array<{ index: number; length: number }> = []
  let match: RegExpExecArray | null
  while ((match = globalPattern.exec(text)) !== null) {
    if (match[0].length === 0) {
      globalPattern.lastIndex += 1
      continue
    }
    tolerant.push({ index: match.index, length: match[0].length })
    globalPattern.lastIndex = match.index + match[0].length
  }
  return tolerant
}

// Replace the `occurrenceIndex`-th occurrence of `oldText` with `newText`.
// occurrenceIndex (document order, 0-based) disambiguates repeated text — e.g.
// the same word in the nav vs. a heading — so the edit lands on the element the
// user actually clicked rather than the first textual match. Defaults to the
// first occurrence when omitted (legacy behaviour).
const applyPreviewTextEdit = (
  html: string,
  oldText: string | undefined,
  newText: string | undefined,
  occurrenceIndex?: number,
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

  const matches = collectTextMatches(protectedHtml, from)
  if (matches.length === 0) return { html, replaced: false }

  const wanted =
    occurrenceIndex !== undefined && occurrenceIndex >= 0
      ? Math.min(occurrenceIndex, matches.length - 1)
      : 0
  const target = matches[wanted]
  // Exact matches are byte-for-byte; tolerant matches may span inline markup, so
  // escape the replacement to keep it inert as HTML.
  const isExact = target.length === from.length && protectedHtml.startsWith(from, target.index)
  const replacement = isExact ? to : escapeHtml(to)
  const edited = `${protectedHtml.slice(0, target.index)}${replacement}${protectedHtml.slice(target.index + target.length)}`
  return {
    html: blocks.reduce(
      (current, block) => current.replace(block.token, block.value),
      edited,
    ),
    replaced: true,
  }
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

type AuthCtx = Pick<MutationCtx, 'auth'> | Pick<QueryCtx, 'auth'>

const getUserId = async (ctx: AuthCtx) => {
  const identity = await ctx.auth.getUserIdentity()
  return identity?.tokenIdentifier ?? identity?.subject
}

const isSessionOwner = async (
  ctx: AuthCtx,
  session: { userId?: string; anonOwnerSecretHash?: string },
  anonymousOwnerSecret?: string,
): Promise<boolean> => {
  const userId = await getUserId(ctx)
  const anonymousOwnerSecretHash =
    anonymousOwnerSecret === undefined
      ? undefined
      : await hashOwnerSecret(anonymousOwnerSecret)

  return (
    (session.userId !== undefined && session.userId === userId) ||
    (session.userId === undefined &&
      session.anonOwnerSecretHash !== undefined &&
      session.anonOwnerSecretHash === anonymousOwnerSecretHash)
  )
}

const assertCanReadOwnedSession = async (
  ctx: AuthCtx,
  session: { userId?: string; anonOwnerSecretHash?: string },
  anonymousOwnerSecret?: string,
) => {
  ;(await isSessionOwner(ctx, session, anonymousOwnerSecret)) ||
    (() => {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'You do not own this session',
      })
    })()
}

const assertCanReadPrivateSession = async (
  ctx: AuthCtx,
  session: {
    isPrivate?: boolean
    userId?: string
    anonOwnerSecretHash?: string
  },
  anonymousOwnerSecret?: string,
) => {
  if (session.isPrivate !== true) return
  await assertCanReadOwnedSession(ctx, session, anonymousOwnerSecret)
}

const getExportEntitlement = async (
  ctx: MutationCtx,
  userId: string | undefined,
  sessionId: Id<'sessions'>,
): Promise<
  | {
      status: 'ready'
      requiresPayment: false
      entitlement: 'subscription' | 'credits'
      remainingCredits?: number
    }
  | {
      status: 'payment_required'
      requiresPayment: true
      entitlement: 'anonymous' | 'payment_required'
      message: string
    }
> => {
  if (userId === undefined) {
    return {
      status: 'payment_required',
      requiresPayment: true,
      entitlement: 'anonymous',
      message:
        'Sign in and subscribe to Pro or purchase download credits to export ZIP files.',
    }
  }

  const subscriptions = await ctx.db
    .query('subscriptions')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .take(20)
  const activeSubscription = subscriptions.find((subscription) =>
    activeExportSubscriptionStatuses.has(subscription.status),
  )

  if (activeSubscription !== undefined) {
    return {
      status: 'ready',
      requiresPayment: false,
      entitlement: 'subscription',
    }
  }

  const credits = await ctx.db
    .query('customerCredits')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .first()

  if (credits !== null && credits.remaining > 0) {
    const now = Date.now()
    const remainingCredits = credits.remaining - 1
    await ctx.db.patch(credits._id, {
      remaining: remainingCredits,
      updatedAt: now,
    })
    await ctx.db.insert('creditLedger', {
      userId,
      sessionId,
      amount: -1,
      balanceAfter: remainingCredits,
      reason: 'export',
      createdAt: now,
    })

    return {
      status: 'ready',
      requiresPayment: false,
      entitlement: 'credits',
      remainingCredits,
    }
  }

  return {
    status: 'payment_required',
    requiresPayment: true,
    entitlement: 'payment_required',
    message:
      'Subscribe to Pro or purchase download credits to export ZIP files.',
  }
}


const seedCmsBindingsForGeneratedArtifacts = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  input: { html: string; siteSpecJson?: string },
  now: number,
): Promise<number> => {
  const candidates = [
    ...extractCmsBindingCandidatesFromHtml(input.html),
    ...extractCmsBindingCandidatesFromSiteSpec(input.siteSpecJson),
  ]
  const seen = new Set<string>()
  const seenFields = new Set<string>()
  let created = 0

  for (const candidate of candidates) {
    if (seen.has(candidate.selector)) continue
    const fieldKey = candidate.field?.trim()
    if (fieldKey !== undefined && fieldKey.length > 0) {
      if (seenFields.has(fieldKey)) continue
      seenFields.add(fieldKey)
    }
    seen.add(candidate.selector)

    const existingBinding = await ctx.db
      .query('cmsBindings')
      .withIndex('by_sessionId_selector', (index) =>
        index.eq('sessionId', sessionId).eq('selector', candidate.selector),
      )
      .first()
    const bindingId =
      existingBinding?._id ??
      (await ctx.db.insert('cmsBindings', {
        sessionId,
        selector: candidate.selector,
        type: candidate.type,
        field: candidate.field,
        createdAt: now,
      }))

    if (existingBinding === null) created += 1

    const initialContent = candidate.content?.trim()
    if (initialContent === undefined || initialContent.length === 0) continue

    const existingEntry = await ctx.db
      .query('cmsEntries')
      .withIndex('by_bindingId', (index) => index.eq('bindingId', bindingId))
      .first()

    if (existingEntry === null) {
      await ctx.db.insert('cmsEntries', {
        sessionId,
        bindingId,
        content: initialContent,
        contentType: candidate.contentType,
        updatedAt: now,
      })
    }
  }

  return created
}

const assertCanMutateSession = async (
  ctx: MutationCtx,
  session: { userId?: string; anonOwnerSecretHash?: string },
  anonymousOwnerSecret?: string,
) => {
  ;(await isSessionOwner(ctx, session, anonymousOwnerSecret)) ||
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

const reserveDefaultDeploymentSlug = async (
  ctx: MutationCtx,
  prompt: string,
  sessionId: Id<'sessions'>,
): Promise<string> => {
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

    if (!existing || existing._id === sessionId) break

    const randomSuffix = Math.random().toString(16).slice(2, 6)
    finalSlug = `${baseSlug}-${randomSuffix}`
    attempts++
  }

  await ctx.db.patch(sessionId, { deploymentSlug: finalSlug })
  return finalSlug
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
  engineVersion: session.engineVersion,
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

const getCurrentHomeModuleAndSiteSpec = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
) =>
  await Promise.all([
    ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', sessionId).eq('moduleKey', 'home'),
      )
      .first(),
    ctx.db
      .query('siteSpecs')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .first(),
  ])

const applyTextEditToCurrentArtifacts = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  beforeText: string | undefined,
  afterText: string | undefined,
  now: number,
  occurrenceIndex?: number,
): Promise<{
  openUiSource?: string
  siteSpecJson?: string
  openUiReplaced: boolean
  siteSpecReplaced: boolean
}> => {
  const [homeModule, siteSpec] = await getCurrentHomeModuleAndSiteSpec(
    ctx,
    sessionId,
  )
  let openUiSource = homeModule?.source
  let siteSpecJson = siteSpec?.specJson ?? siteSpec?.spec
  let openUiReplaced = false
  let siteSpecReplaced = false

  if (homeModule !== null) {
    const sourceEdit = applyPreviewTextEdit(
      homeModule.source,
      beforeText,
      afterText,
      occurrenceIndex,
    )
    if (!sourceEdit.replaced) {
      return { openUiSource, siteSpecJson, openUiReplaced, siteSpecReplaced }
    }

    openUiReplaced = true
    openUiSource = sourceEdit.html
    await ctx.db.patch(homeModule._id, {
      source: sourceEdit.html,
      status: 'succeeded',
      errorMessage: undefined,
      updatedAt: now,
    })
  }

  if (siteSpec !== null && siteSpecJson !== undefined) {
    try {
      const parsed: unknown = JSON.parse(siteSpecJson)
      const specEdit = replaceFirstJsonText(
        parsed,
        String(beforeText ?? ''),
        String(afterText ?? ''),
      )
      if (specEdit.replaced) {
        siteSpecReplaced = true
        siteSpecJson = JSON.stringify(specEdit.value)
        await ctx.db.patch(siteSpec._id, {
          specJson: siteSpecJson,
          updatedAt: now,
        })
      }
    } catch {
      const specEdit = applyPreviewTextEdit(siteSpecJson, beforeText, afterText)
      if (specEdit.replaced) {
        siteSpecReplaced = true
        siteSpecJson = specEdit.html
        await ctx.db.patch(siteSpec._id, {
          specJson: siteSpecJson,
          updatedAt: now,
        })
      }
    }
  }

  return { openUiSource, siteSpecJson, openUiReplaced, siteSpecReplaced }
}

const snapshotCurrentArtifacts = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
): Promise<{
  openUiSource?: string
  siteSpecJson?: string
}> => {
  const [homeModule, siteSpec] = await getCurrentHomeModuleAndSiteSpec(
    ctx,
    sessionId,
  )

  return {
    openUiSource: homeModule?.source,
    siteSpecJson: siteSpec?.specJson ?? siteSpec?.spec,
  }
}

const cloneCachedGeneratedArtifacts = async (
  ctx: MutationCtx,
  args: {
    cachedSession: Doc<'sessions'>
    targetSessionId: Id<'sessions'>
    userId?: string
    anonymousClientIdHash?: string
    now: number
  },
): Promise<boolean> => {
  const latestPreview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', args.cachedSession._id),
    )
    .order('desc')
    .first()
  const homeModule = await ctx.db
    .query('generatedModules')
    .withIndex('by_sessionId_moduleKey', (index) =>
      index.eq('sessionId', args.cachedSession._id).eq('moduleKey', 'home'),
    )
    .first()
  const siteSpec = await ctx.db
    .query('siteSpecs')
    .withIndex('by_sessionId', (index) =>
      index.eq('sessionId', args.cachedSession._id),
    )
    .first()

  if (latestPreview === null || homeModule?.source === undefined) {
    return false
  }

  const openUiSource = latestPreview.openUiSource ?? homeModule.source
  const siteSpecJson =
    latestPreview.siteSpecJson ?? siteSpec?.specJson ?? siteSpec?.spec

  await ctx.db.insert('generatedModules', {
    sessionId: args.targetSessionId,
    moduleKey: 'home',
    source: homeModule.source,
    status: 'succeeded',
    createdAt: args.now,
    updatedAt: args.now,
  })

  if (siteSpecJson !== undefined) {
    await ctx.db.insert('siteSpecs', {
      sessionId: args.targetSessionId,
      specJson: siteSpecJson,
      createdAt: args.now,
      updatedAt: args.now,
    })
  }

  const cachedTasks = await ctx.db
    .query('tasks')
    .withIndex('by_sessionId', (index) =>
      index.eq('sessionId', args.cachedSession._id),
    )
    .take(25)
  const tasksToClone =
    cachedTasks.length > 0
      ? cachedTasks
      : [
          {
            taskKey: 'homepage',
            title: 'Generate homepage',
            status: 'succeeded',
            order: 0,
          },
        ]

  for (const [index, task] of tasksToClone.entries()) {
    const taskKey = task.taskKey ?? task.taskId ?? `task-${index}`
    const taskFields = {
      taskKey,
      taskId: task.taskId,
      title: task.title,
      status: task.status === 'failed' ? 'succeeded' : task.status,
      order: task.order ?? index,
      filename: task.filename,
      description: task.description,
      dependsOn: task.dependsOn,
      files: task.files,
      actions: task.actions,
      updatedAt: args.now,
    }
    const existingTask = await ctx.db
      .query('tasks')
      .withIndex('by_sessionId_taskKey', (query) =>
        query.eq('sessionId', args.targetSessionId).eq('taskKey', taskKey),
      )
      .first()

    existingTask === null
      ? await ctx.db.insert('tasks', {
          sessionId: args.targetSessionId,
          ...taskFields,
          createdAt: args.now,
        })
      : await ctx.db.patch(existingTask._id, taskFields)
  }

  await ctx.db.insert('previews', {
    sessionId: args.targetSessionId,
    version: 1,
    html: latestPreview.html,
    openUiSource,
    siteSpecJson,
    source: 'generation',
    createdAt: args.now,
  })

  await seedCmsBindingsForGeneratedArtifacts(
    ctx,
    args.targetSessionId,
    { html: latestPreview.html, siteSpecJson },
    args.now,
  )

  await ctx.db.insert('generationEvents', {
    sessionId: args.targetSessionId,
    eventType: 'preview_ready',
    message: 'Generated preview restored from prompt cache',
    previewVersion: 1,
    createdAt: args.now,
  })

  await recordOperationalGenerationEvent(ctx, {
    sessionId: args.targetSessionId,
    eventType: 'cache_hit',
    message: 'Duplicate prompt cloned cached generated session',
    cacheHit: true,
    provider: 'prompt-cache-clone',
    elapsedMs: 0,
    cost: 0,
    userId: args.userId,
    anonymousClientIdHash: args.anonymousClientIdHash,
    createdAt: args.now,
  })

  await ctx.db.patch(args.targetSessionId, {
    status: 'preview_ready',
    homepageReady: true,
    openuiReady: true,
    previewVersion: 1,
    elapsed: 0,
    cost: 0,
    updatedAt: args.now,
  })

  return true
}

// Easter egg (press D 5x on the home page): delete the caller's own
// generations. Scoped to the owner — authenticated users by userId, anonymous
// users by their stable per-browser anonymousClientId — so it can never touch
// another user's sessions.
export const deleteMine = mutation({
  args: {
    anonymousClientId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx)

    let sessions: Doc<'sessions'>[] = []
    if (userId !== undefined) {
      sessions = await ctx.db
        .query('sessions')
        .withIndex('by_userId', (index) => index.eq('userId', userId))
        .collect()
    } else if (args.anonymousClientId !== undefined) {
      const anonymousClientIdHash = await hashOwnerSecret(args.anonymousClientId)
      sessions = await ctx.db
        .query('sessions')
        .withIndex('by_anonymousClientIdHash', (index) =>
          index.eq('anonymousClientIdHash', anonymousClientIdHash),
        )
        .collect()
    }

    for (const session of sessions) {
      await ctx.db.delete(session._id)
    }

    return { deleted: sessions.length }
  },
})

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
    engineVersion: v.optional(v.string()),
    reusePublicCache: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
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
    const promptCacheKey = normalizePromptCacheKey(
      prompt,
      args.preferredLanguage,
    )
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
      await recordOperationalGenerationEvent(ctx, {
        sessionId: cachedSession._id,
        eventType: 'cache_hit',
        message: 'Duplicate prompt reused existing generated session',
        cacheHit: true,
        provider: 'prompt-cache',
        userId,
        anonymousClientIdHash,
      })
      return { sessionId: cachedSession._id, cached: true, reused: true }
    }

    const recentCutoff = now - RATE_WINDOW_MS
    const quotaCutoff =
      now - (userId === undefined ? DAILY_WINDOW_MS : MONTHLY_WINDOW_MS)
    const sameOwnerSessions =
      userId !== undefined
        ? await ctx.db
            .query('sessions')
            .withIndex('by_userId', (index) => index.eq('userId', userId))
            .take(MAX_PAID_PER_MONTH + SHORT_WINDOW_LIMIT + 1)
        : anonymousClientIdHash === undefined
          ? []
          : await ctx.db
              .query('sessions')
              .withIndex('by_anonymousClientIdHash', (index) =>
                index.eq('anonymousClientIdHash', anonymousClientIdHash),
              )
              .take(MAX_PAID_PER_MONTH + SHORT_WINDOW_LIMIT + 1)
    const recentCount = sameOwnerSessions.filter(
      (session) => session.createdAt >= recentCutoff,
    ).length
    recentCount < SHORT_WINDOW_LIMIT ||
      disableLimits ||
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
        ? MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA
        : activeSubscription === null
          ? MAX_FREE_PER_MONTH
          : MAX_PAID_PER_MONTH
    const quotaCount = sameOwnerSessions.filter(
      (session) => session.createdAt >= quotaCutoff,
    ).length
    quotaCount < quotaLimit ||
      disableLimits ||
      (() => {
        throw new ConvexError({
          code: 'QUOTA_EXCEEDED',
          message:
            userId === undefined
              ? 'Anonymous daily quota exhausted. Share on social media for +1 free generation, or sign in to continue.'
              : 'Monthly quota exhausted',
        })
      })()

    if (cachedSession !== null) {
      if (args.anonymousOwnerSecret === undefined) {
        await recordOperationalGenerationEvent(ctx, {
          sessionId: cachedSession._id,
          eventType: 'cache_hit',
          message: 'Duplicate prompt reused existing generated session',
          cacheHit: true,
          provider: 'prompt-cache',
          userId,
          anonymousClientIdHash,
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
      })

      if (cloned) {
        return {
          sessionId,
          cached: true,
          cloned: true,
          remaining: Math.max(0, quotaLimit - quotaCount - 1),
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
        remaining: Math.max(0, quotaLimit - quotaCount - 1),
      }
    }

    const generationArgs =
      args.anonymousOwnerSecret === undefined
        ? { sessionId }
        : { sessionId, anonymousOwnerSecret: args.anonymousOwnerSecret }

    await ctx.scheduler.runAfter(
      0,
      internal.generation.startGeneration,
      generationArgs,
    )

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
    const session = await ctx.db.get(args.sessionId)

    if (session === null || (session.previewVersion ?? 0) > 0) {
      return {
        started: false,
        reason: session === null ? 'not_found' : 'preview_already_exists',
      }
    }

    if (!startableGenerationStatuses.has(session.status)) {
      return {
        started: false,
        reason:
          session.status === 'streaming'
            ? 'generation_already_started'
            : 'generation_not_startable',
      }
    }

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

    return { started: true }
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
      const session = await ctx.db.get(args.sessionId)

      if (session !== null && (session.previewVersion ?? 0) === 0) {
        await ctx.db.patch(args.sessionId, {
          status: 'streaming',
          updatedAt: now,
        })
      }
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
      directSessionId === null &&
      exportRecord === null &&
      args.lookup !== undefined
        ? await ctx.db
            .query('deployments')
            .withIndex('by_slug', (index) => index.eq('slug', args.lookup))
            .first()
        : null
    const sessionId =
      directSessionId ??
      exportRecord?.sessionId ??
      deployment?.sessionId ??
      null

    if (sessionId === null) return null

    const session = await ctx.db.get(sessionId)

    if (session === null) return null

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .take(100)
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
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
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
    anonymousOwnerSecret: v.optional(v.string()),
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
    await assertCanReadPrivateSession(ctx, session, args.anonymousOwnerSecret)

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
        .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
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
      .take(100)
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
      .take(100)
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

    const preview =
      deployment?.previewVersion === undefined
        ? await ctx.db
            .query('previews')
            .withIndex('by_sessionId_version', (index) =>
              index.eq('sessionId', session._id),
            )
            .order('desc')
            .first()
        : await ctx.db
            .query('previews')
            .withIndex('by_sessionId_version', (index) =>
              index
                .eq('sessionId', session._id)
                .eq('version', deployment.previewVersion),
            )
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

    // Parallelize independent queries for better performance
    const [preview, existingDeployment] = await Promise.all([
      ctx.db
        .query('previews')
        .withIndex('by_sessionId_version', (index) =>
          index.eq('sessionId', args.sessionId),
        )
        .order('desc')
        .first(),
      ctx.db
        .query('deployments')
        .withIndex('by_sessionId', (index) =>
          index.eq('sessionId', args.sessionId),
        )
        .first(),
    ])

    preview !== null ||
      (() => {
        throw new ConvexError({
          code: 'PREVIEW_NOT_READY',
          message: 'Preview is not ready to publish',
        })
      })()

    const slug =
      existingDeployment !== null && args.requestedSlug === undefined
        ? existingDeployment.slug
        : normalizeDeploymentSlug(
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
          previewVersion: preview.version,
          createdAt: now,
          updatedAt: now,
        })
      : await ctx.db.patch(existingDeployment._id, {
          slug,
          url,
          status: 'ready',
          previewVersion: preview.version,
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

export const completeGeneration = internalAction({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    html: v.string(),
    siteSpecJson: v.optional(v.string()),
    openUiSource: v.optional(v.string()),
    tasks: v.array(engineTask),
    elapsed: v.optional(v.number()),
    cost: v.optional(v.number()),
    provider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internalFunctions.sessions.getGenerationSession, {
      sessionId: args.sessionId,
    })

    if (session === null) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    }

    if ((session.previewVersion ?? 0) > 0) {
      return {
        sessionId: args.sessionId,
        previewVersion: session.previewVersion ?? 0,
        skipped: true,
        reason: 'preview_already_exists',
      }
    }

    // Pre-render OpenUI source to HTML for gallery previews
    let renderedHtml = args.html
    const hasCmsAnnotatedHtml = /\sdata-cms\s*=/.test(args.html)
    if (
      !hasCmsAnnotatedHtml &&
      args.openUiSource &&
      args.openUiSource.trim().length > 0
    ) {
      try {
        const { renderOpenUIToHTMLWithTheme } = await loadOpenUISSR()
        const { html } = renderOpenUIToHTMLWithTheme(
          args.openUiSource,
          undefined,
          session.preferredLanguage ?? 'en',
          undefined,
        ) as { html: string; cssVars?: string }
        renderedHtml = html
      } catch (error) {
        console.error('[completeGeneration] Failed to render OpenUI to HTML', {
          sessionId: args.sessionId,
          error: error instanceof Error ? error.message : String(error),
        })
        // Fall back to the provided handoff HTML
      }
    }

    await ctx.runMutation(internalFunctions.sessions.completeGenerationInternal, {
      sessionId: args.sessionId,
      anonymousOwnerSecret: args.anonymousOwnerSecret,
      html: renderedHtml,
      siteSpecJson: args.siteSpecJson,
      openUiSource: args.openUiSource,
      tasks: args.tasks,
      elapsed: args.elapsed,
      cost: args.cost,
      provider: args.provider,
    })

    const previewVersion = (session.previewVersion ?? 0) + 1
    return { sessionId: args.sessionId, previewVersion }
  },
})

export const completeGenerationInternal = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    html: v.string(),
    siteSpecJson: v.optional(v.string()),
    openUiSource: v.optional(v.string()),
    tasks: v.array(engineTask),
    elapsed: v.optional(v.number()),
    cost: v.optional(v.number()),
    provider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()
    const cost = args.cost ?? 0
    const provider = args.provider ?? 'ship-fast-engine'

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
      openUiSource: args.openUiSource,
      siteSpecJson: args.siteSpecJson,
      source: 'generation',
      createdAt: now,
    })

    await seedCmsBindingsForGeneratedArtifacts(
      ctx,
      args.sessionId,
      { html: args.html, siteSpecJson: args.siteSpecJson },
      now,
    )

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'preview_ready',
      message: 'Generated preview ready',
      previewVersion,
      createdAt: now,
    })

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'run_completed',
      message: 'Generation completed',
      previewVersion,
      createdAt: now,
      elapsedMs: args.elapsed,
      cost,
      provider,
      cacheHit: false,
    })

    await ctx.db.insert('usageMetrics', {
      sessionId: args.sessionId,
      eventType: 'run_completed',
      timestamp: now,
      elapsedMs: args.elapsed ?? 0,
      cost,
      provider,
      userId: session.userId,
      anonymousClientIdHash: session.anonymousClientIdHash,
    })

    await scheduleOperationalNotification(ctx, {
      sessionId: args.sessionId,
      eventType: 'run_completed',
      message: 'Generation completed',
      elapsedMs: args.elapsed,
      cost,
      provider,
      cacheHit: false,
    })

    await ctx.db.patch(args.sessionId, {
      status: 'preview_ready',
      previewVersion,
      elapsed: args.elapsed,
      cost,
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

    if ((session.previewVersion ?? 0) > 0) {
      return {
        sessionId: args.sessionId,
        skipped: true,
        reason: 'preview_already_exists',
      }
    }

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

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'generation_failed',
      message: args.message,
      createdAt: now,
      elapsedMs: args.elapsed,
      error: args.message,
    })

    await scheduleOperationalNotification(ctx, {
      sessionId: args.sessionId,
      eventType: 'generation_failed',
      message: args.message,
      elapsedMs: args.elapsed,
      error: args.message,
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

    homeModule?.source.trim().length ||
      (() => {
        throw new ConvexError({
          code: 'ARTIFACT_NOT_READY',
          message: 'Generated source is not ready to export',
        })
      })()

    const existingExport = await ctx.db
      .query('exports')
      .withIndex('by_sessionId_target', (index) =>
        index.eq('sessionId', args.sessionId).eq('target', args.target),
      )
      .first()

    const fileCount = exportTargetFileCount(args.target)
    const alreadyReadyForCurrentPreview =
      existingExport?.status === 'ready' &&
      existingExport.requiresPayment === false &&
      existingExport.previewVersion === preview.version
    const entitlement = alreadyReadyForCurrentPreview
      ? {
          status: 'ready' as const,
          requiresPayment: false as const,
          entitlement: 'existing' as const,
        }
      : await getExportEntitlement(ctx, session.userId, args.sessionId)

    const exportId =
      existingExport !== null
        ? existingExport._id
        : await ctx.db.insert('exports', {
            sessionId: args.sessionId,
            target: args.target,
            status: entitlement.status,
            artifactPath: `preview-${preview.version}.html`,
            previewVersion: preview.version,
            fileCount,
            requiresPayment: entitlement.requiresPayment,
            errorMessage:
              entitlement.status === 'payment_required'
                ? entitlement.message
                : undefined,
            createdAt: now,
            updatedAt: now,
          })

    if (existingExport !== null) {
      await ctx.db.patch(exportId, {
        status: entitlement.status,
        artifactPath: `preview-${preview.version}.html`,
        previewVersion: preview.version,
        fileCount,
        requiresPayment: entitlement.requiresPayment,
        errorMessage:
          entitlement.status === 'payment_required'
            ? entitlement.message
            : undefined,
        updatedAt: now,
      })
    }

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType:
        entitlement.status === 'ready'
          ? 'export_ready'
          : 'export_payment_required',
      message:
        entitlement.status === 'ready'
          ? `Export ready for ${args.target}`
          : entitlement.message,
      previewVersion: preview.version,
      createdAt: now,
    })

    return {
      exportId,
      target: args.target,
      status: entitlement.status,
      previewVersion: preview.version,
      fileCount,
      requiresPayment: entitlement.requiresPayment,
      entitlement: entitlement.entitlement,
      remainingCredits:
        entitlement.status === 'ready' && entitlement.entitlement === 'credits'
          ? entitlement.remainingCredits
          : undefined,
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
          previewVersion: exportRecord.previewVersion,
          requiresPayment: exportRecord.requiresPayment,
          errorMessage: exportRecord.errorMessage,
          createdAt: exportRecord.createdAt,
          updatedAt: exportRecord.updatedAt,
        }
  },
})

export const getOwnedExportDownload = query({
  args: {
    sessionId: v.id('sessions'),
    target: exportTarget,
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

    await assertCanReadOwnedSession(ctx, session, args.anonymousOwnerSecret)

    const exportRecord = await ctx.db
      .query('exports')
      .withIndex('by_sessionId_target', (index) =>
        index.eq('sessionId', args.sessionId).eq('target', args.target),
      )
      .first()

    if (exportRecord === null) return null

    const exportPayload = {
      exportId: exportRecord._id,
      target: exportRecord.target,
      status: exportRecord.status,
      fileCount: exportRecord.fileCount,
      previewVersion: exportRecord.previewVersion,
      requiresPayment: exportRecord.requiresPayment,
      errorMessage: exportRecord.errorMessage,
      createdAt: exportRecord.createdAt,
      updatedAt: exportRecord.updatedAt,
    }

    if (
      exportRecord.status === 'payment_required' ||
      exportRecord.requiresPayment === true ||
      exportRecord.status !== 'ready'
    ) {
      return { export: exportPayload }
    }

    const latestPreview = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .first()
    const homeModule = await ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', args.sessionId).eq('moduleKey', 'home'),
      )
      .first()
    const siteSpec = await ctx.db
      .query('siteSpecs')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first()

    return {
      export: exportPayload,
      source: homeModule?.source,
      siteSpecJson: siteSpec?.specJson,
      previewHtml: latestPreview?.html,
      latestPreviewVersion: latestPreview?.version,
    }
  },
})

export const getOwnedExportForGitHubPush = query({
  args: {
    sessionId: v.id('sessions'),
    target: exportTarget,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.tokenIdentifier ?? identity?.subject

    userId !== undefined ||
      (() => {
        throw new ConvexError({
          code: 'AUTH_REQUIRED',
          message: 'Sign in before pushing to GitHub.',
        })
      })()

    const session = await ctx.db.get(args.sessionId)
    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    session.userId === userId ||
      (() => {
        throw new ConvexError({
          code: 'FORBIDDEN',
          message: 'You do not own this session',
        })
      })()

    const exportRecord = await ctx.db
      .query('exports')
      .withIndex('by_sessionId_target', (index) =>
        index.eq('sessionId', args.sessionId).eq('target', args.target),
      )
      .first()

    exportRecord !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Generate this export before pushing it to GitHub.',
        })
      })()

    exportRecord.status === 'ready' ||
      (() => {
        throw new ConvexError({
          code:
            exportRecord.status === 'payment_required'
              ? 'PAYMENT_REQUIRED'
              : 'NOT_READY',
          message:
            exportRecord.status === 'payment_required'
              ? (exportRecord.errorMessage ??
                'Subscribe to Pro or purchase download credits before pushing to GitHub.')
              : 'Export is not ready for GitHub push.',
        })
      })()

    exportRecord.requiresPayment !== true ||
      (() => {
        throw new ConvexError({
          code: 'PAYMENT_REQUIRED',
          message:
            exportRecord.errorMessage ??
            'Subscribe to Pro or purchase download credits before pushing to GitHub.',
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
          code: 'NOT_FOUND',
          message: 'Preview not found',
        })
      })()

    const exportPreviewVersion = exportRecord.previewVersion
    if (
      exportPreviewVersion !== undefined &&
      exportPreviewVersion !== preview.version
    ) {
      throw new ConvexError({
        code: 'EXPORT_STALE',
        message: 'Regenerate this export before pushing it to GitHub.',
      })
    }

    return {
      sessionId: args.sessionId,
      prompt: session.prompt,
      target: exportRecord.target,
      previewVersion: preview.version,
      html: preview.html,
      includeBadge: exportRecord.requiresPayment !== false,
    }
  },
})

type SessionEditInput = {
  editType: 'text' | 'ai_rewrite' | 'chat' | 'style' | 'image'
  targetLabel?: string
  beforeText?: string
  afterText?: string
  afterHtml?: string
  instruction?: string
  /** 0-based document-order index disambiguating repeated text (nav vs heading). */
  occurrenceIndex?: number
}

// Apply a single edit to a session's latest preview: write a new preview
// version, update the editable artifacts (OpenUI source + site spec), and
// record the edit. The caller is responsible for ownership checks — this is
// shared by createEdit (after asserting ownership) and forkSession (which
// re-applies the pending edit onto the freshly forked, owned copy).
const applySessionEdit = async (
  ctx: MutationCtx,
  session: Doc<'sessions'>,
  args: SessionEditInput,
  now: number,
) => {
  const sessionId = session._id

  const preview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', sessionId),
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
      : args.editType === 'image'
        ? applyImageSwap(preview.html, args.beforeText, args.afterText)
        : args.editType === 'style'
          ? applyStyleEdit(
              preview.html,
              args.beforeText,
              args.afterText,
              args.occurrenceIndex,
            )
          : applyPreviewTextEdit(
              preview.html,
              args.beforeText,
              args.afterText,
              args.occurrenceIndex,
            )

  if (!editedPreview.replaced) {
    throw new ConvexError({
      code: 'TEXT_NOT_FOUND',
      message:
        args.editType === 'image'
          ? 'Image source was not found in the current preview.'
          : 'Selected text was not found in the current preview. Select a smaller text block and try again.',
    })
  }

  const nextPreviewVersion = preview.version + 1

  let openUiSource: string | undefined
  let siteSpecJson: string | undefined
  if (args.afterHtml === undefined && args.editType !== 'style') {
    // The rendered preview HTML already matched (checked above), so the edit is
    // valid and gets saved regardless. Updating the editable OpenUI/site-spec
    // source is best-effort: inline markup (<br>, <span>, …) can split the text
    // across nodes in the source even though it reads contiguously in the HTML,
    // so a miss here must NOT discard the user's edit.
    const artifactSnapshot = await applyTextEditToCurrentArtifacts(
      ctx,
      sessionId,
      args.beforeText,
      args.afterText,
      now,
      args.occurrenceIndex,
    )
    openUiSource = artifactSnapshot.openUiSource
    siteSpecJson = artifactSnapshot.siteSpecJson
  } else {
    const artifactSnapshot = await snapshotCurrentArtifacts(ctx, sessionId)
    openUiSource = artifactSnapshot.openUiSource
    siteSpecJson = artifactSnapshot.siteSpecJson
  }

  await ctx.db.insert('previews', {
    sessionId,
    version: nextPreviewVersion,
    html: editedPreview.html,
    openUiSource,
    siteSpecJson,
    source: args.editType === 'ai_rewrite' ? 'rewrite' : 'edit',
    createdAt: now,
  })
  await ctx.db.patch(sessionId, {
    previewVersion: nextPreviewVersion,
    updatedAt: now,
  })
  await ctx.db.insert('generationEvents', {
    sessionId,
    eventType: 'preview_reload',
    message: 'Preview updated',
    previewVersion: nextPreviewVersion,
    createdAt: now,
  })

  // The edits table only models text-style edits (not image swaps), so record
  // history for those; the preview/artifact updates above apply regardless.
  if (args.editType !== 'image') {
    await ctx.db.insert('edits', {
      sessionId,
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
  }

  return {
    sessionId,
    previewVersion: nextPreviewVersion,
    saved: editedPreview.replaced,
  }
}

export const createEdit = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    editType: v.union(
      v.literal('text'),
      v.literal('ai_rewrite'),
      v.literal('chat'),
      v.literal('style'),
      v.literal('image'),
    ),
    targetLabel: v.optional(v.string()),
    beforeText: v.optional(v.string()),
    afterText: v.optional(v.string()),
    afterHtml: v.optional(v.string()),
    instruction: v.optional(v.string()),
    occurrenceIndex: v.optional(v.number()),
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

    return await applySessionEdit(ctx, session, args, now)
  },
})

// Fork a session the caller does not own into a fresh copy they DO own, then
// optionally re-apply the edit that triggered the fork. Used by the inline
// editor: when createEdit throws FORBIDDEN, the client forks here and lands the
// user on their own editable copy with the change already applied.
export const forkSession = mutation({
  args: {
    sourceSessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    edit: v.optional(
      v.object({
        editType: v.union(
          v.literal('text'),
          v.literal('ai_rewrite'),
          v.literal('chat'),
          v.literal('style'),
          v.literal('image'),
        ),
        targetLabel: v.optional(v.string()),
        beforeText: v.optional(v.string()),
        afterText: v.optional(v.string()),
        afterHtml: v.optional(v.string()),
        instruction: v.optional(v.string()),
        occurrenceIndex: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceSessionId)
    const now = Date.now()

    source !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    const userId = await getUserId(ctx)
    const anonOwnerSecretHash =
      userId === undefined && args.anonymousOwnerSecret !== undefined
        ? await hashOwnerSecret(args.anonymousOwnerSecret)
        : undefined

    userId !== undefined ||
      anonOwnerSecretHash !== undefined ||
      (() => {
        throw new ConvexError({
          code: 'FORBIDDEN',
          message: 'Sign in to save your changes',
        })
      })()

    const targetSessionId = await ctx.db.insert('sessions', {
      userId,
      anonOwnerSecretHash,
      workspace: source.workspace,
      prompt: source.prompt,
      status: 'queued',
      preferredLanguage: source.preferredLanguage,
      preferredExportTarget: source.preferredExportTarget,
      designReferenceUrls: source.designReferenceUrls,
      designReferenceNotes: source.designReferenceNotes,
      cloneUrl: source.cloneUrl,
      engineVersion: source.engineVersion,
      isPrivate: source.isPrivate,
      previewVersion: 0,
      createdAt: now,
      updatedAt: now,
    })

    const cloned = await cloneCachedGeneratedArtifacts(ctx, {
      cachedSession: source,
      targetSessionId,
      userId,
      anonymousClientIdHash: undefined,
      now,
    })

    if (!cloned) {
      // Fallback: the source has no editable home module to clone, so copy at
      // least its latest preview so the fork still renders.
      const latestPreview = await ctx.db
        .query('previews')
        .withIndex('by_sessionId_version', (index) =>
          index.eq('sessionId', source._id),
        )
        .order('desc')
        .first()

      latestPreview !== null ||
        (() => {
          throw new ConvexError({
            code: 'PREVIEW_NOT_READY',
            message: 'Preview is not ready',
          })
        })()

      await ctx.db.insert('previews', {
        sessionId: targetSessionId,
        version: 1,
        html: latestPreview.html,
        openUiSource: latestPreview.openUiSource,
        siteSpecJson: latestPreview.siteSpecJson,
        source: 'generation',
        createdAt: now,
      })
      await ctx.db.patch(targetSessionId, {
        status: 'preview_ready',
        homepageReady: true,
        openuiReady: true,
        previewVersion: 1,
        updatedAt: now,
      })
    }

    let editApplied = false
    if (args.edit !== undefined) {
      const target = await ctx.db.get(targetSessionId)
      if (target !== null) {
        try {
          await applySessionEdit(ctx, target, args.edit, now)
          editApplied = true
        } catch (error) {
          // Never fail the fork because the edit couldn't be re-applied — the
          // user still lands on their own editable copy. Surface non-edit
          // (unexpected) errors.
          if (!(error instanceof ConvexError)) throw error
        }
      }
    }

    return { sessionId: targetSessionId, editApplied }
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
      .take(80)

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
      .take(80)

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
    if (preview.openUiSource !== undefined) {
      await upsertHomeGeneratedModule(
        ctx,
        args.sessionId,
        preview.openUiSource,
        now,
      )
    }
    if (preview.siteSpecJson !== undefined) {
      await upsertSiteSpec(ctx, args.sessionId, preview.siteSpecJson, now)
    }

    await ctx.db.insert('previews', {
      sessionId: args.sessionId,
      version: nextPreviewVersion,
      html: preview.html,
      openUiSource: preview.openUiSource,
      siteSpecJson: preview.siteSpecJson,
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
    refinementPlanJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const now = Date.now()
    const content = truncateText(args.content.trim(), MAX_CHAT_MESSAGE_LENGTH)

    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()

    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)
    assertContentPolicy(content)

    content.length > 0 ||
      (() => {
        throw new ConvexError({
          code: 'EMPTY_MESSAGE',
          message: 'Chat message is required',
        })
      })()

    const latestPreview = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .first()

    latestPreview !== null ||
      (() => {
        throw new ConvexError({
          code: 'PREVIEW_NOT_READY',
          message: 'Preview is not ready for chat refinement',
        })
      })()

    const nextPreviewVersion = latestPreview.version + 1
    const refinementPlan = parseChatRefinementPlanJson(args.refinementPlanJson)

    await ctx.db.insert('chatMessages', {
      sessionId: args.sessionId,
      role: 'user',
      content,
      createdAt: now,
    })

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'chat_refinement_started',
      message: content,
      previewVersion: latestPreview.version,
      createdAt: now,
    })

    const refinement = buildChatRefinedPreviewHtml(
      latestPreview.html,
      content,
      refinementPlan,
    )

    const [homeModule, siteSpec] = await Promise.all([
      ctx.db
        .query('generatedModules')
        .withIndex('by_sessionId_moduleKey', (index) =>
          index.eq('sessionId', args.sessionId).eq('moduleKey', 'home'),
        )
        .first(),
      ctx.db
        .query('siteSpecs')
        .withIndex('by_sessionId', (index) =>
          index.eq('sessionId', args.sessionId),
        )
        .first(),
    ])
    const refinedOpenUiSource = buildChatRefinedOpenUiSource(
      homeModule?.source,
      content,
      refinement.summary,
      nextPreviewVersion,
      refinementPlan,
    )
    const refinedSiteSpecJson = buildChatRefinedSiteSpecJson(
      siteSpec?.specJson ?? siteSpec?.spec,
      content,
      refinement.summary,
      nextPreviewVersion,
      now,
      refinementPlan,
    )

    await ctx.db.insert('previews', {
      sessionId: args.sessionId,
      version: nextPreviewVersion,
      html: refinement.html,
      openUiSource: refinedOpenUiSource,
      siteSpecJson: refinedSiteSpecJson,
      source: 'edit',
      createdAt: now,
    })

    if (homeModule !== null && refinedOpenUiSource !== undefined) {
      await ctx.db.patch(homeModule._id, {
        source: refinedOpenUiSource,
        status: 'succeeded',
        errorMessage: undefined,
        updatedAt: now,
      })
    }

    if (siteSpec !== null && refinedSiteSpecJson !== undefined) {
      await ctx.db.patch(siteSpec._id, {
        specJson: refinedSiteSpecJson,
        updatedAt: now,
      })
    }

    await ctx.db.insert('edits', {
      sessionId: args.sessionId,
      previewVersion: nextPreviewVersion,
      editType: 'chat',
      instruction: content,
      afterHtml: refinement.html,
      createdAt: now,
      userId: session.userId,
    })

    await ctx.db.insert('chatMessages', {
      sessionId: args.sessionId,
      role: 'assistant',
      content: refinement.summary,
      createdAt: now,
    })

    await ctx.db.patch(args.sessionId, {
      previewVersion: nextPreviewVersion,
      updatedAt: now,
    })

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'preview_reload',
      message: 'Preview updated from chat refinement',
      previewVersion: nextPreviewVersion,
      createdAt: now,
    })

    await ctx.db.insert('generationEvents', {
      sessionId: args.sessionId,
      eventType: 'chat_refinement_completed',
      message: 'Chat refinement completed',
      previewVersion: nextPreviewVersion,
      createdAt: now,
    })

    return { sessionId: args.sessionId, previewVersion: nextPreviewVersion }
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
      .take(200)

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
      .take(200)

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

export const saveAgentationSession = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    agentationSessionId: v.string(),
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

    await ctx.db.patch(args.sessionId, {
      agentationEnabled: true,
      agentationEnabledAt: session.agentationEnabledAt ?? now,
      agentationSessionId: args.agentationSessionId,
      updatedAt: now,
    })

    return {
      sessionId: args.sessionId,
      agentationSessionId: args.agentationSessionId,
    }
  },
})

const getSessionIdFromAgentationSessionKey = (
  ctx: MutationCtx,
  agentationSessionKey: string,
): Id<'sessions'> | null => {
  const prefix = 'ship-fast:generate:'
  if (!agentationSessionKey.startsWith(prefix)) return null
  return ctx.db.normalizeId(
    'sessions',
    agentationSessionKey.slice(prefix.length),
  )
}

const assertAgentationSyncEnabled = async (
  ctx: MutationCtx,
  agentationSessionKey: string,
) => {
  const sessionId = getSessionIdFromAgentationSessionKey(
    ctx,
    agentationSessionKey,
  )

  sessionId !== null ||
    (() => {
      throw new ConvexError({
        code: 'INVALID_SESSION',
        message: 'Invalid Agentation session key',
      })
    })()

  const session = await ctx.db.get(sessionId)
  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  const expectedSessionId =
    session.agentationSessionId ?? agentationSessionKey
  expectedSessionId === agentationSessionKey ||
    (() => {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Agentation session key is not enabled for this session',
      })
    })()

  return { session, sessionId }
}

export const upsertAgentationSyncAnnotation = mutation({
  args: {
    agentationSessionKey: v.string(),
    annotationId: v.string(),
    comment: v.string(),
    elementLabel: v.string(),
    elementPath: v.string(),
    url: v.optional(v.string()),
    payloadJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { sessionId } = await assertAgentationSyncEnabled(
      ctx,
      args.agentationSessionKey,
    )
    const now = Date.now()
    const existing = await ctx.db
      .query('agentationAnnotations')
      .withIndex('by_sessionId_annotationId', (index) =>
        index
          .eq('sessionId', sessionId)
          .eq('annotationId', args.annotationId),
      )
      .first()
    const payload = {
      agentationSessionKey: args.agentationSessionKey,
      agentationSessionId: args.agentationSessionKey,
      comment: args.comment,
      elementLabel: args.elementLabel,
      elementPath: args.elementPath,
      url: args.url,
      payloadJson: args.payloadJson,
      updatedAt: now,
    }

    if (existing !== null) {
      await ctx.db.patch(existing._id, payload)
      return { sessionId, annotationId: existing._id }
    }

    const annotationDocId = await ctx.db.insert('agentationAnnotations', {
      sessionId,
      annotationId: args.annotationId,
      ...payload,
      createdAt: now,
    })

    return { sessionId, annotationId: annotationDocId }
  },
})

export const updateAgentationSyncAnnotation = mutation({
  args: {
    annotationId: v.string(),
    comment: v.string(),
    elementLabel: v.string(),
    elementPath: v.string(),
    url: v.optional(v.string()),
    payloadJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const annotation = await ctx.db
      .query('agentationAnnotations')
      .withIndex('by_annotationId', (index) =>
        index.eq('annotationId', args.annotationId),
      )
      .first()

    annotation !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Annotation not found',
        })
      })()

    await ctx.db.patch(annotation._id, {
      comment: args.comment,
      elementLabel: args.elementLabel,
      elementPath: args.elementPath,
      url: args.url,
      payloadJson: args.payloadJson,
      updatedAt: Date.now(),
    })

    return { sessionId: annotation.sessionId, annotationId: annotation._id }
  },
})

export const deleteAgentationSyncAnnotation = mutation({
  args: {
    annotationId: v.string(),
  },
  handler: async (ctx, args) => {
    const annotation = await ctx.db
      .query('agentationAnnotations')
      .withIndex('by_annotationId', (index) =>
        index.eq('annotationId', args.annotationId),
      )
      .first()

    if (annotation !== null) {
      await ctx.db.delete(annotation._id)
    }

    return { annotationId: args.annotationId }
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
      .take(200)

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
    errorMessage: v.optional(v.string()),
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
        errorMessage: args.errorMessage,
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
        errorMessage: args.errorMessage,
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
          id: session._id,
          sessionId: session._id,
          prompt: session.prompt,
          preferredLanguage: session.preferredLanguage,
          status: session.status ?? null,
          previewVersion: preview?.version ?? session.previewVersion ?? 0,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt ?? session.createdAt,
          elapsed: session.elapsed ?? null,
          cost: session.cost ?? null,
          html: preview?.html ?? null,
          moduleSource: homeModule?.source ?? null,
          siteSpecJson: siteSpec?.specJson ?? siteSpec?.spec ?? null,
          categories: getGalleryCategories(session.prompt),
          homepageReady: session.homepageReady ?? null,
          siteSpecReady: session.siteSpecReady ?? null,
          openuiReady: session.openuiReady ?? null,
          readiness: {
            homepageReady: session.homepageReady ?? null,
            siteSpecReady: session.siteSpecReady ?? null,
            openuiReady: session.openuiReady ?? null,
            previewReady:
              session.status === 'preview_ready' || preview !== null,
          },
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
      previewVersion: deployment.previewVersion,
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
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first()

    if (deployment === null) {
      return null
    }

    return {
      slug: deployment.slug,
      url: deployment.url,
      status: deployment.status,
      previewVersion: deployment.previewVersion,
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
    const extracted = await seedCmsBindingsForGeneratedArtifacts(
      ctx,
      args.sessionId,
      { html: args.html },
      Date.now(),
    )

    return { extracted }
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
      .withIndex('by_bindingId', (index) =>
        index.eq('bindingId', args.bindingId),
      )
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
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
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
        status: 'ready',
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
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
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

export const recordOperationalEvent = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    eventType: v.string(),
    message: v.optional(v.string()),
    elapsedMs: v.optional(v.number()),
    cost: v.optional(v.number()),
    provider: v.optional(v.string()),
    error: v.optional(v.string()),
    quotaHit: v.optional(v.boolean()),
    cacheHit: v.optional(v.boolean()),
    userId: v.optional(v.string()),
    anonymousClientIdHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await recordOperationalGenerationEvent(ctx, args)
  },
})

export const getUsageMetrics = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const metrics = await ctx.db
      .query('usageMetrics')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .take(500)

    return {
      totalCost: metrics.reduce((sum, m) => sum + m.cost, 0),
      totalElapsedMs: metrics.reduce((sum, m) => sum + m.elapsedMs, 0),
      count: metrics.length,
      byProvider: metrics.reduce(
        (acc, m) => {
          acc[m.provider] = (acc[m.provider] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
      byEventType: metrics.reduce(
        (acc, m) => {
          acc[m.eventType] = (acc[m.eventType] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }
  },
})

export const getUserUsageMetrics = query({
  args: {
    userId: v.string(),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userMetrics = await ctx.db
      .query('usageMetrics')
      .withIndex('by_userId', (index) => index.eq('userId', args.userId))
      .order('desc')
      .take(500)

    const metrics =
      args.since !== undefined
        ? userMetrics.filter((metric) => metric.timestamp >= args.since!)
        : userMetrics

    return {
      totalCost: metrics.reduce((sum, m) => sum + m.cost, 0),
      totalElapsedMs: metrics.reduce((sum, m) => sum + m.elapsedMs, 0),
      count: metrics.length,
      byProvider: metrics.reduce(
        (acc, m) => {
          acc[m.provider] = (acc[m.provider] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
      byEventType: metrics.reduce(
        (acc, m) => {
          acc[m.eventType] = (acc[m.eventType] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
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
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .take(200)

    return entries
  },
})

export const listCmsContent = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const bindings = await ctx.db
      .query('cmsBindings')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .take(200)
    const entries = await ctx.db
      .query('cmsEntries')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .take(200)
    const entryByBindingId = new Map(
      entries.map((entry) => [entry.bindingId, entry]),
    )

    return bindings.map((binding) => {
      const entry = entryByBindingId.get(binding._id)

      return {
        bindingId: binding._id,
        entryId: entry?._id,
        selector: binding.selector,
        type: binding.type,
        field: binding.field,
        content: entry?.content ?? '',
        contentType: entry?.contentType,
        updatedAt: entry?.updatedAt,
        updatedBy: entry?.updatedBy,
        createdAt: binding.createdAt,
      }
    })
  },
})

export const listCmsEntryRevisions = query({
  args: {
    sessionId: v.id('sessions'),
    entryId: v.id('cmsEntries'),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId)
    if (entry === null || entry.sessionId !== args.sessionId) return []

    const revisions = await ctx.db
      .query('cmsRevisions')
      .withIndex('by_entryId_createdAt', (index) =>
        index.eq('entryId', args.entryId),
      )
      .order('desc')
      .take(50)

    return revisions.map((revision) => ({
      revisionId: revision._id,
      content: revision.content,
      contentType: revision.contentType,
      updatedBy: revision.updatedBy,
      createdAt: revision.createdAt,
    }))
  },
})

export const upsertCmsContentEntry = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    bindingId: v.optional(v.id('cmsBindings')),
    selector: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal('text'),
        v.literal('richtext'),
        v.literal('image'),
        v.literal('link'),
      ),
    ),
    field: v.optional(v.string()),
    content: v.string(),
    contentType: v.optional(v.string()),
    beforeContent: v.optional(v.string()),
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

    let binding: Doc<'cmsBindings'> | null =
      args.bindingId === undefined ? null : await ctx.db.get(args.bindingId)

    if (binding !== null && binding.sessionId !== args.sessionId) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'CMS binding not found',
      })
    }

    if (binding === null) {
      const selector =
        args.selector?.trim() ||
        (args.field === undefined ? undefined : `field:${args.field}`)

      if (selector === undefined || selector.length === 0) {
        throw new ConvexError({
          code: 'INVALID_CMS_BINDING',
          message: 'CMS binding selector or field is required',
        })
      }

      const existingBinding = await ctx.db
        .query('cmsBindings')
        .withIndex('by_sessionId_selector', (index) =>
          index.eq('sessionId', args.sessionId).eq('selector', selector),
        )
        .first()

      binding =
        existingBinding ??
        (await ctx.db
          .insert('cmsBindings', {
            sessionId: args.sessionId,
            selector,
            type: args.type ?? 'text',
            field: args.field,
            createdAt: now,
          })
          .then((id) => ctx.db.get(id)))
    }

    if (binding === null) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'CMS binding not found',
      })
    }

    const currentBinding = binding

    const existingEntry = await ctx.db
      .query('cmsEntries')
      .withIndex('by_bindingId', (index) =>
        index.eq('bindingId', currentBinding._id),
      )
      .first()

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
        updatedBy: session.userId,
      })
    } else {
      await ctx.db.insert('cmsEntries', {
        sessionId: args.sessionId,
        bindingId: currentBinding._id,
        content: args.content,
        contentType: args.contentType,
        updatedAt: now,
        updatedBy: session.userId,
      })
    }

    let previewVersion = session.previewVersion ?? 0
    const shouldPromotePreview =
      args.beforeContent !== undefined &&
      args.beforeContent !== args.content &&
      previewVersion > 0

    if (shouldPromotePreview) {
      const preview = await ctx.db
        .query('previews')
        .withIndex('by_sessionId_version', (index) =>
          index.eq('sessionId', args.sessionId),
        )
        .order('desc')
        .first()

      if (preview !== null) {
        const editedPreview = applyCmsPreviewEdit(
          preview.html,
          currentBinding,
          args.beforeContent,
          args.content,
        )

        if (editedPreview.replaced) {
          previewVersion = preview.version + 1
          const artifactSnapshot = await applyTextEditToCurrentArtifacts(
            ctx,
            args.sessionId,
            args.beforeContent,
            args.content,
            now,
          )

          await ctx.db.insert('previews', {
            sessionId: args.sessionId,
            version: previewVersion,
            html: editedPreview.html,
            openUiSource: artifactSnapshot.openUiSource,
            siteSpecJson: artifactSnapshot.siteSpecJson,
            source: 'edit',
            createdAt: now,
          })
          await ctx.db.patch(args.sessionId, {
            previewVersion,
            updatedAt: now,
          })
          await ctx.db.insert('generationEvents', {
            sessionId: args.sessionId,
            eventType: 'preview_reload',
            message: `CMS content updated: ${currentBinding.field ?? currentBinding.selector}`,
            previewVersion,
            createdAt: now,
          })
        }
      }
    }

    return {
      sessionId: args.sessionId,
      bindingId: currentBinding._id,
      previewVersion,
    }
  },
})

export const restoreCmsContentRevision = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    revisionId: v.id('cmsRevisions'),
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

    const revision = await ctx.db.get(args.revisionId)
    if (revision === null) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'CMS revision not found',
      })
    }

    const entry = await ctx.db.get(revision.entryId)
    if (entry === null || entry.sessionId !== args.sessionId) {
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
      updatedBy: session.userId,
    })

    let previewVersion = session.previewVersion ?? 0
    if (previewVersion > 0 && entry.content !== revision.content) {
      const preview = await ctx.db
        .query('previews')
        .withIndex('by_sessionId_version', (index) =>
          index.eq('sessionId', args.sessionId),
        )
        .order('desc')
        .first()

      if (preview !== null) {
        const editedPreview = applyCmsPreviewEdit(
          preview.html,
          binding,
          entry.content,
          revision.content,
        )

        if (editedPreview.replaced) {
          previewVersion = preview.version + 1
          const artifactSnapshot = await applyTextEditToCurrentArtifacts(
            ctx,
            args.sessionId,
            entry.content,
            revision.content,
            now,
          )

          await ctx.db.insert('previews', {
            sessionId: args.sessionId,
            version: previewVersion,
            html: editedPreview.html,
            openUiSource: artifactSnapshot.openUiSource,
            siteSpecJson: artifactSnapshot.siteSpecJson,
            source: 'cms',
            createdAt: now,
          })
          await ctx.db.patch(args.sessionId, {
            previewVersion,
            updatedAt: now,
          })
          await ctx.db.insert('generationEvents', {
            sessionId: args.sessionId,
            eventType: 'preview_reload',
            message: `CMS revision restored: ${binding.field ?? binding.selector}`,
            previewVersion,
            createdAt: now,
          })
        }
      }
    }

    return {
      sessionId: args.sessionId,
      entryId: entry._id,
      bindingId: binding._id,
      previewVersion,
    }
  },
})

export const insertCmsBinding = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    selector: v.string(),
    type: v.union(
      v.literal('text'),
      v.literal('richtext'),
      v.literal('image'),
      v.literal('link'),
    ),
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
      .take(200)

    return revisions
  },
})

export const sendOperationalNotification = internalAction({
  args: {
    sessionId: v.id('sessions'),
    eventType: v.string(),
    message: v.optional(v.string()),
    elapsedMs: v.optional(v.number()),
    cost: v.optional(v.number()),
    provider: v.optional(v.string()),
    error: v.optional(v.string()),
    quotaHit: v.optional(v.boolean()),
    cacheHit: v.optional(v.boolean()),
  },
  handler: async (_ctx, args) => {
    if (!shouldNotifyOperationalEvent(args)) {
      return {
        sent: false,
        reason: 'not_alertable',
      }
    }

    const notification = formatOperationalNotification(args)
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN
    const telegramChatId = process.env.TELEGRAM_CHAT_ID

    const slack =
      slackWebhookUrl === undefined || slackWebhookUrl.trim().length === 0
        ? { sent: false, reason: 'no_webhook_url' }
        : await fetch(slackWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: notification }),
          })
            .then(() => ({ sent: true }))
            .catch((error: unknown) => ({
              sent: false,
              reason: error instanceof Error ? error.message : 'fetch_failed',
            }))

    const telegram =
      telegramBotToken === undefined ||
      telegramBotToken.trim().length === 0 ||
      telegramChatId === undefined ||
      telegramChatId.trim().length === 0
        ? { sent: false, reason: 'missing_credentials' }
        : await fetch(
            `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: telegramChatId,
                text: notification,
              }),
            },
          )
            .then(() => ({ sent: true }))
            .catch((error: unknown) => ({
              sent: false,
              reason: error instanceof Error ? error.message : 'fetch_failed',
            }))

    return {
      sent: slack.sent || telegram.sent,
      slack,
      telegram,
    }
  },
})

export const sendSlackNotification = internalAction({
  args: {
    message: v.string(),
    webhookUrl: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const webhookUrl = args.webhookUrl || process.env.SLACK_WEBHOOK_URL
    if (!webhookUrl) {
      return { sent: false, reason: 'no_webhook_url' }
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: args.message }),
      })
      return { sent: true }
    } catch (error) {
      return { sent: false, reason: error?.message || 'fetch_failed' }
    }
  },
})

export const sendTelegramNotification = internalAction({
  args: {
    message: v.string(),
    botToken: v.optional(v.string()),
    chatId: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const botToken = args.botToken || process.env.TELEGRAM_BOT_TOKEN
    const chatId = args.chatId || process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      return { sent: false, reason: 'missing_credentials' }
    }

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: args.message }),
      })
      return { sent: true }
    } catch (error) {
      return { sent: false, reason: error?.message || 'fetch_failed' }
    }
  },
})
