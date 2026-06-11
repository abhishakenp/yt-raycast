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
import type { MutationCtx } from './_generated/server'

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
  event: Pick<OperationalNotificationPayload, 'cacheHit' | 'cost' | 'error' | 'eventType' | 'quotaHit'>,
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

  return [`Ship Fast operational event`, ...details, event.message].filter(Boolean).join('\n')
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

const normalizePromptCacheKey = (
  prompt: string,
  preferredLanguage = 'en',
): string =>
  `${normalizeSpaces(preferredLanguage).toLowerCase() || 'en'}:${normalizeSpaces(prompt)
    .toLowerCase()
    .replace(/[^a-z0-9\p{L}\p{N}]+/gu, ' ')
    .trim()}`

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

const MAX_CHAT_MESSAGE_LENGTH = 4000
const CHAT_REFINEMENT_RE =
  /\s*<!-- ship-fast-chat-refinement:\d+ -->\s*<section\b[^>]*data-ship-fast-chat-refinement="1"[\s\S]*?<\/section>/gi

const CHAT_LEGACY_REFINEMENT_NOTE_RE =
  /\s*<!-- ship-fast-chat-refinement-note:\d+ -->\s*<section\b[^>]*data-ship-fast-chat-note="1"[\s\S]*?<\/section>/gi

const CHAT_OPENUI_REFINEMENT_RE =
  /\n*\/\/ ship-fast-chat-refinement:\d+\n\/\/ instruction: .*\n\/\/ summary: .*/g

const truncateText = (value: string, max: number): string =>
  value.length <= max ? value : value.slice(0, max)

type ChatPreviewRefinement = {
  html: string
  summary: string
  changed: boolean
}

type ChatRefinementPlan = {
  headline?: string
  ctaLabel?: string
  replacements?: Array<{
    oldText?: string
    newText?: string
  }>
  sections?: Array<{
    kind?: string
    title?: string
    body?: string
  }>
  assistantSummary?: string
}

type ChatInstructionIntent =
  | {
      kind: 'headline' | 'cta'
      targetText: string
    }
  | {
      kind: 'replace'
      oldText: string
      newText: string
    }
  | {
      kind: 'section'
      sectionKind: string
    }
  | {
      kind: 'note'
    }

type JsonObject = Record<string, unknown>

const extractQuotedText = (instruction: string): string | undefined =>
  instruction.match(/["“]([^"”]{2,180})["”]/)?.[1]?.trim()

const extractTargetText = (instruction: string): string | undefined => {
  const quoted = extractQuotedText(instruction)
  if (quoted) return quoted

  const match = instruction.match(
    /\b(?:to|say|read|headline|title|cta|button|copy)\s*:?\s+(.{3,180})$/i,
  )
  return match?.[1]?.replace(/[.!?]\s*$/, '').trim()
}

const getChatInstructionIntent = (instruction: string): ChatInstructionIntent => {
  const normalized = normalizeSpaces(instruction).toLowerCase()
  const targetText = extractTargetText(instruction)

  if (/\b(headline|hero title|h1|title)\b/.test(normalized) && targetText) {
    return { kind: 'headline', targetText }
  }

  if (
    /\b(cta|button|call to action|call-to-action)\b/.test(normalized) &&
    targetText
  ) {
    return { kind: 'cta', targetText }
  }

  const changeMatch = instruction.match(
    /\b(?:change|replace|rename)\s+["“]([^"”]{2,180})["”]\s+(?:to|with)\s+["“]([^"”]{2,180})["”]/i,
  )
  if (changeMatch) {
    return {
      kind: 'replace',
      oldText: changeMatch[1],
      newText: changeMatch[2],
    }
  }

  const sectionKind = normalized.match(
    /\b(add|include|create)\s+(?:a|an|the)?\s*(testimonial|testimonials|pricing|faq|contact|features?|gallery|team|stats?)\b/,
  )?.[2]
  if (sectionKind) return { kind: 'section', sectionKind }

  return { kind: 'note' }
}

const replaceFirstElementText = (
  html: string,
  tagNames: string[],
  text: string,
): { html: string; replaced: boolean } => {
  const safeText = escapeHtml(truncateText(text, 180))
  for (const tagName of tagNames) {
    const pattern = new RegExp(
      `<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`,
      'i',
    )
    const match = html.match(pattern)
    if (!match) continue

    return {
      html: html.replace(pattern, `<${tagName}${match[1]}>${safeText}</${tagName}>`),
      replaced: true,
    }
  }

  return { html, replaced: false }
}

const appendHtmlBeforeClose = (html: string, addition: string): string => {
  if (/<\/main>/i.test(html)) return html.replace(/<\/main>/i, `${addition}</main>`)
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${addition}</body>`)
  return `${html}${addition}`
}

const buildGeneratedRefinementSection = (
  title: string,
  body: string,
): string =>
  `<section style="margin:32px auto;padding:24px;max-width:960px;border:1px solid rgba(15,23,42,.12);border-radius:16px;background:rgba(248,250,252,.92);color:#0f172a"><p style="margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#0891b2;font-weight:700">${escapeHtml(title)}</p><p style="margin:0;font-size:16px;line-height:1.65">${escapeHtml(truncateText(body, 420))}</p></section>`

const applyInstructionDrivenHtmlRefinement = (
  html: string,
  instruction: string,
): ChatPreviewRefinement => {
  const intent = getChatInstructionIntent(instruction)

  if (intent.kind === 'headline') {
    const result = replaceFirstElementText(html, ['h1', 'h2'], intent.targetText)
    if (result.replaced) {
      return {
        html: result.html,
        summary: 'Updated the primary headline in the preview.',
        changed: true,
      }
    }
  }

  if (intent.kind === 'cta') {
    const result = replaceFirstElementText(html, ['button', 'a'], intent.targetText)
    if (result.replaced) {
      return {
        html: result.html,
        summary: 'Updated the first call-to-action label in the preview.',
        changed: true,
      }
    }
  }

  if (intent.kind === 'replace') {
    const result = applyPreviewTextEdit(html, intent.oldText, intent.newText)
    if (result.replaced) {
      return {
        html: result.html,
        summary: `Replaced "${truncateText(intent.oldText, 48)}" in the preview.`,
        changed: true,
      }
    }
  }

  if (intent.kind === 'section') {
    const sectionKind = intent.sectionKind
    const title = `${sectionKind.replace(/s$/, '')} section`
    const addition = buildGeneratedRefinementSection(title, instruction)
    return {
      html: appendHtmlBeforeClose(html, addition),
      summary: `Added a ${sectionKind} section to the preview.`,
      changed: true,
    }
  }

  const addition = buildGeneratedRefinementSection(
    'Latest updates',
    instruction,
  )
  return {
    html: appendHtmlBeforeClose(html, addition),
    summary:
      'Added the requested update to the preview.',
    changed: true,
  }
}

const buildChatRefinedPreviewHtml = (
  html: string,
  instruction: string,
  plan?: ChatRefinementPlan,
): ChatPreviewRefinement => {
  const cleanHtml = String(html || '')
    .replace(CHAT_REFINEMENT_RE, '')
    .replace(CHAT_LEGACY_REFINEMENT_NOTE_RE, '')

  if (plan !== undefined) {
    const planned = applyPlanDrivenHtmlRefinement(
      cleanHtml,
      instruction,
      plan,
    )
    if (planned.changed) return planned
  }

  return applyInstructionDrivenHtmlRefinement(
    cleanHtml,
    instruction,
  )
}

const normalizePlanString = (value: unknown, max: number): string | undefined =>
  typeof value === 'string' && value.trim()
    ? truncateText(value.trim(), max)
    : undefined

const normalizeChatRefinementPlan = (
  value: unknown,
): ChatRefinementPlan | undefined => {
  if (!isJsonObject(value)) return undefined

  const replacements = Array.isArray(value.replacements)
    ? value.replacements
        .map((entry) =>
          isJsonObject(entry)
            ? {
                oldText: normalizePlanString(entry.oldText, 500),
                newText: normalizePlanString(entry.newText, 500),
              }
            : {},
        )
        .filter((entry) => entry.oldText !== undefined && entry.newText !== undefined)
        .slice(0, 8)
    : undefined

  const sections = Array.isArray(value.sections)
    ? value.sections
        .map((entry) =>
          isJsonObject(entry)
            ? {
                kind: normalizePlanString(entry.kind, 80),
                title: normalizePlanString(entry.title, 140),
                body: normalizePlanString(entry.body, 800),
              }
            : {},
        )
        .filter((entry) => entry.title !== undefined || entry.body !== undefined)
        .slice(0, 4)
    : undefined

  const plan: ChatRefinementPlan = {
    headline: normalizePlanString(value.headline, 180),
    ctaLabel: normalizePlanString(value.ctaLabel, 120),
    replacements,
    sections,
    assistantSummary: normalizePlanString(value.assistantSummary, 500),
  }

  return plan.headline !== undefined ||
    plan.ctaLabel !== undefined ||
    (plan.replacements?.length ?? 0) > 0 ||
    (plan.sections?.length ?? 0) > 0
    ? plan
    : undefined
}

const parseChatRefinementPlanJson = (
  value: string | undefined,
): ChatRefinementPlan | undefined => {
  if (value === undefined || !value.trim()) return undefined

  try {
    return normalizeChatRefinementPlan(JSON.parse(value))
  } catch {
    return undefined
  }
}

const applyPlanDrivenHtmlRefinement = (
  html: string,
  instruction: string,
  plan: ChatRefinementPlan,
): ChatPreviewRefinement => {
  let refinedHtml = html
  const summaries: string[] = []

  for (const replacement of plan.replacements ?? []) {
    if (replacement.oldText === undefined || replacement.newText === undefined) continue
    const result = applyPreviewTextEdit(
      refinedHtml,
      replacement.oldText,
      replacement.newText,
    )
    if (result.replaced) {
      refinedHtml = result.html
      summaries.push(`replaced "${truncateText(replacement.oldText, 48)}"`)
    }
  }

  if (plan.headline !== undefined) {
    const result = replaceFirstElementText(refinedHtml, ['h1', 'h2'], plan.headline)
    if (result.replaced) {
      refinedHtml = result.html
      summaries.push('updated the primary headline')
    }
  }

  if (plan.ctaLabel !== undefined) {
    const result = replaceFirstElementText(refinedHtml, ['button', 'a'], plan.ctaLabel)
    if (result.replaced) {
      refinedHtml = result.html
      summaries.push('updated the main call-to-action')
    }
  }

  for (const section of plan.sections ?? []) {
    const title =
      section.title ??
      `${section.kind ?? 'AI'} refinement`
    const body = section.body ?? instruction
    refinedHtml = appendHtmlBeforeClose(
      refinedHtml,
      buildGeneratedRefinementSection(title, body),
    )
    summaries.push(`added ${truncateText(title, 48)}`)
  }

  return {
    html: refinedHtml,
    summary:
      plan.assistantSummary ??
      (summaries.length > 0
        ? `Applied AI refinement plan: ${summaries.join(', ')}.`
        : 'AI refinement plan did not match an editable target.'),
    changed: refinedHtml !== html,
  }
}

const escapeOpenUiString = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const sanitizeOpenUiComment = (value: string): string =>
  truncateText(normalizeSpaces(value), 240).replace(/\*\//g, '* /')

const replaceFirstOpenUiCallText = (
  source: string,
  callNames: string[],
  text: string,
): { source: string; replaced: boolean } => {
  const safeText = escapeOpenUiString(truncateText(text, 180))

  for (const callName of callNames) {
    const pattern = new RegExp(`\\b${callName}\\(\\s*"([^"]*)"`, 'i')
    if (!pattern.test(source)) continue

    return {
      source: source.replace(pattern, `${callName}("${safeText}"`),
      replaced: true,
    }
  }

  return { source, replaced: false }
}

const appendOpenUiRefinementNote = (
  source: string,
  instruction: string,
  summary: string,
  previewVersion: number,
): string => {
  const cleanSource = source.replace(CHAT_OPENUI_REFINEMENT_RE, '').trimEnd()
  const note = [
    `// ship-fast-chat-refinement:${previewVersion}`,
    `// instruction: ${sanitizeOpenUiComment(instruction)}`,
    `// summary: ${sanitizeOpenUiComment(summary)}`,
  ].join('\n')

  return cleanSource.length > 0 ? `${cleanSource}\n${note}` : note
}

const buildChatRefinedOpenUiSource = (
  source: string | undefined,
  instruction: string,
  summary: string,
  previewVersion: number,
  plan?: ChatRefinementPlan,
): string | undefined => {
  if (source === undefined) return undefined

  const intent = getChatInstructionIntent(instruction)
  const cleanSource = source.replace(CHAT_OPENUI_REFINEMENT_RE, '').trimEnd()
  let refinedSource = cleanSource

  for (const replacement of plan?.replacements ?? []) {
    if (replacement.oldText === undefined || replacement.newText === undefined) continue
    refinedSource = applyPreviewTextEdit(
      refinedSource,
      replacement.oldText,
      replacement.newText,
    ).html
  }

  if (plan?.headline !== undefined) {
    const result = replaceFirstOpenUiCallText(
      refinedSource,
      ['Text', 'Heading', 'HeroTitle', 'Title'],
      plan.headline,
    )
    refinedSource = result.source
  } else if (intent.kind === 'headline') {
    const result = replaceFirstOpenUiCallText(
      refinedSource,
      ['Text', 'Heading', 'HeroTitle', 'Title'],
      intent.targetText,
    )
    refinedSource = result.source
  }

  if (plan?.ctaLabel !== undefined) {
    const result = replaceFirstOpenUiCallText(
      refinedSource,
      ['Button', 'Link', 'Action', 'Text'],
      plan.ctaLabel,
    )
    refinedSource = result.source
  } else if (intent.kind === 'cta') {
    const result = replaceFirstOpenUiCallText(
      refinedSource,
      ['Button', 'Link', 'Action', 'Text'],
      intent.targetText,
    )
    refinedSource = result.source
  } else if (intent.kind === 'replace') {
    refinedSource = applyPreviewTextEdit(
      refinedSource,
      intent.oldText,
      intent.newText,
    ).html
  }

  return appendOpenUiRefinementNote(
    refinedSource,
    instruction,
    summary,
    previewVersion,
  )
}

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const replaceFirstMatchingJsonString = (
  value: unknown,
  keyPattern: RegExp,
  newText: string,
): { value: unknown; replaced: boolean } => {
  if (Array.isArray(value)) {
    let replaced = false
    const next = value.map((item) => {
      if (replaced) return item
      const result = replaceFirstMatchingJsonString(item, keyPattern, newText)
      replaced = result.replaced
      return result.value
    })
    return { value: next, replaced }
  }

  if (!isJsonObject(value)) return { value, replaced: false }

  let replaced = false
  const next: JsonObject = {}
  for (const [key, item] of Object.entries(value)) {
    if (!replaced && keyPattern.test(key) && typeof item === 'string') {
      next[key] = truncateText(newText, 500)
      replaced = true
      continue
    }

    if (!replaced) {
      const result = replaceFirstMatchingJsonString(item, keyPattern, newText)
      next[key] = result.value
      replaced = result.replaced
      continue
    }

    next[key] = item
  }

  return { value: next, replaced }
}

const replaceFirstJsonText = (
  value: unknown,
  oldText: string,
  newText: string,
): { value: unknown; replaced: boolean } => {
  if (typeof value === 'string') {
    const result = applyPreviewTextEdit(value, oldText, newText)
    return { value: result.html, replaced: result.replaced }
  }

  if (Array.isArray(value)) {
    let replaced = false
    const next = value.map((item) => {
      if (replaced) return item
      const result = replaceFirstJsonText(item, oldText, newText)
      replaced = result.replaced
      return result.value
    })
    return { value: next, replaced }
  }

  if (!isJsonObject(value)) return { value, replaced: false }

  let replaced = false
  const next: JsonObject = {}
  for (const [key, item] of Object.entries(value)) {
    if (replaced) {
      next[key] = item
      continue
    }

    const result = replaceFirstJsonText(item, oldText, newText)
    next[key] = result.value
    replaced = result.replaced
  }

  return { value: next, replaced }
}

const appendChatRefinementToSiteSpec = (
  spec: JsonObject,
  instruction: string,
  summary: string,
  previewVersion: number,
  now: number,
): JsonObject => {
  const existing = spec.shipFastChatRefinements
  const refinements = Array.isArray(existing) ? existing : []

  return {
    ...spec,
    shipFastChatRefinements: [
      ...refinements.slice(-24),
      {
        instruction: truncateText(instruction, 1000),
        summary,
        previewVersion,
        createdAt: now,
      },
    ],
  }
}

const buildChatRefinedSiteSpecJson = (
  specJson: string | undefined,
  instruction: string,
  summary: string,
  previewVersion: number,
  now: number,
  plan?: ChatRefinementPlan,
): string | undefined => {
  if (specJson === undefined) return undefined

  try {
    const parsed: unknown = JSON.parse(specJson)
    if (!isJsonObject(parsed)) return specJson

    const intent = getChatInstructionIntent(instruction)
    let nextSpec: unknown = parsed

    for (const replacement of plan?.replacements ?? []) {
      if (replacement.oldText === undefined || replacement.newText === undefined) continue
      nextSpec = replaceFirstJsonText(
        nextSpec,
        replacement.oldText,
        replacement.newText,
      ).value
    }

    if (plan?.headline !== undefined) {
      nextSpec = replaceFirstMatchingJsonString(
        nextSpec,
        /headline|heading|heroTitle|title|name/i,
        plan.headline,
      ).value
    } else if (intent.kind === 'headline') {
      nextSpec = replaceFirstMatchingJsonString(
        nextSpec,
        /headline|heading|heroTitle|title|name/i,
        intent.targetText,
      ).value
    }

    if (plan?.ctaLabel !== undefined) {
      nextSpec = replaceFirstMatchingJsonString(
        nextSpec,
        /cta|button|label|action|callToAction/i,
        plan.ctaLabel,
      ).value
    } else if (intent.kind === 'cta') {
      nextSpec = replaceFirstMatchingJsonString(
        nextSpec,
        /cta|button|label|action|callToAction/i,
        intent.targetText,
      ).value
    } else if (intent.kind === 'replace') {
      nextSpec = replaceFirstJsonText(nextSpec, intent.oldText, intent.newText).value
    }

    if (!isJsonObject(nextSpec)) return specJson

    return JSON.stringify(
      appendChatRefinementToSiteSpec(
        nextSpec,
        instruction,
        summary,
        previewVersion,
        now,
      ),
    )
  } catch {
    return specJson
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
      message: 'Sign in and subscribe to Pro or purchase download credits to export ZIP files.',
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
    message: 'Subscribe to Pro or purchase download credits to export ZIP files.',
  }
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

type CmsBindingType = 'text' | 'richtext' | 'image' | 'link'

type CmsBindingCandidate = {
  selector: string
  type: CmsBindingType
  field?: string
  content?: string
  contentType?: string
}

const cmsSiteSpecSkipKeys = new Set([
  '_id',
  'id',
  'key',
  'kind',
  'type',
  'variant',
  'template',
  'component',
  'layout',
  'style',
  'className',
  'theme',
])

const CMS_SITE_SPEC_MAX_DEPTH = 6
const CMS_SITE_SPEC_MAX_CANDIDATES = 120

const stripHtml = (value: string): string =>
  value
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const readHtmlAttribute = (
  attributes: string,
  name: string,
): string | undefined => {
  const match = attributes.match(
    new RegExp(`\\s${name}\\s*=\\s*["']([^"']+)["']`, 'i'),
  )
  return match?.[1]?.trim() || undefined
}

const inferCmsBindingType = (field: string | undefined): CmsBindingType => {
  const normalized = field?.toLowerCase() ?? ''
  if (/\b(image|img|photo|avatar|logo|media|poster|thumbnail)\b/.test(normalized)) return 'image'
  if (/\b(url|href|link|cta|button)\b/.test(normalized)) return 'link'
  if (/\b(body|content|summary|description|paragraph|story|bio|faq|answer|excerpt)\b/.test(normalized)) return 'richtext'
  return 'text'
}

const replaceCmsBoundAttribute = (
  html: string,
  selector: string,
  attributeName: 'src' | 'href',
  newValue: string,
): { html: string; replaced: boolean } => {
  const selectorPattern = escapeRegExp(selector)
  const attributePattern = escapeRegExp(attributeName)
  const tagPattern = new RegExp(
    `<([a-z][a-z0-9:-]*)([^>]*\\sdata-cms\\s*=\\s*["']${selectorPattern}["'][^>]*)>`,
    'i',
  )
  const match = html.match(tagPattern)
  if (match === null) return { html, replaced: false }

  const attributes = match[2]
  const attrPattern = new RegExp(
    `(\\s${attributePattern}\\s*=\\s*)(["'])([^"']*)(\\2)`,
    'i',
  )
  const safeValue = escapeHtml(newValue)
  const nextAttributes = attrPattern.test(attributes)
    ? attributes.replace(attrPattern, `$1$2${safeValue}$4`)
    : `${attributes} ${attributeName}="${safeValue}"`

  return {
    html: html.replace(match[0], `<${match[1]}${nextAttributes}>`),
    replaced: true,
  }
}

const isCmsSiteSpecContentPath = (path: string[]): boolean => {
  const leaf = path.at(-1)
  if (leaf === undefined) return false
  if (cmsSiteSpecSkipKeys.has(leaf)) return false
  if (/^(aria|data|meta|seo|schema|openGraph|twitter)$/i.test(path[0] ?? '')) return false
  return !/^[_$]/.test(leaf)
}

const siteSpecContentType = (field: string, type: CmsBindingType): string =>
  type === 'image' || type === 'link'
    ? 'text/uri-list'
    : /\b(body|content|description|summary|excerpt|bio|answer|paragraph|copy)\b/i.test(field)
      ? 'text/markdown'
      : 'text/plain'

const addCmsSiteSpecLeafCandidate = (
  candidates: CmsBindingCandidate[],
  path: string[],
  value: unknown,
): void => {
  if (typeof value !== 'string') return
  const content = normalizeSpaces(value)
  if (content.length === 0) return
  if (!isCmsSiteSpecContentPath(path)) return

  const field = path.join('.')
  const type = inferCmsBindingType(field)
  candidates.push({
    selector: `field:${field}`,
    field,
    type,
    content,
    contentType: siteSpecContentType(field, type),
  })
}

const collectCmsSiteSpecCandidates = (
  value: unknown,
  path: string[],
  candidates: CmsBindingCandidate[],
  depth = 0,
): void => {
  if (
    candidates.length >= CMS_SITE_SPEC_MAX_CANDIDATES ||
    depth > CMS_SITE_SPEC_MAX_DEPTH
  ) {
    return
  }

  if (typeof value === 'string') {
    addCmsSiteSpecLeafCandidate(candidates, path, value)
    return
  }

  if (Array.isArray(value)) {
    value.slice(0, 24).forEach((item, index) => {
      collectCmsSiteSpecCandidates(
        item,
        [...path, String(index)],
        candidates,
        depth + 1,
      )
    })
    return
  }

  if (!isJsonObject(value)) return

  Object.entries(value)
    .slice(0, 80)
    .forEach(([key, nested]) => {
      collectCmsSiteSpecCandidates(nested, [...path, key], candidates, depth + 1)
    })
}

const applyCmsPreviewEdit = (
  html: string,
  binding: Pick<Doc<'cmsBindings'>, 'selector' | 'type'>,
  oldContent: string | undefined,
  newContent: string,
): { html: string; replaced: boolean } => {
  if (binding.type === 'image') {
    const result = replaceCmsBoundAttribute(html, binding.selector, 'src', newContent)
    if (result.replaced) return result
  }

  if (binding.type === 'link') {
    const result = replaceCmsBoundAttribute(html, binding.selector, 'href', newContent)
    if (result.replaced) return result
  }

  return applyPreviewTextEdit(html, oldContent, newContent)
}

const parseCmsSelector = (
  selector: string,
): Pick<CmsBindingCandidate, 'selector' | 'type' | 'field'> | null => {
  const normalized = selector.trim()
  if (normalized.length === 0) return null

  const type = normalized.match(/(?:^|\s)type:(text|richtext|image|link)(?:\s|$)/)?.[1] as
    | CmsBindingType
    | undefined
  const field =
    normalized.match(/(?:^|\s)field:([a-zA-Z0-9_.-]+)(?:\s|$)/)?.[1] ??
    (normalized.includes('type:') ? undefined : normalized)

  return {
    selector: normalized,
    type: type ?? inferCmsBindingType(field),
    field,
  }
}

const extractCmsBindingCandidatesFromHtml = (
  html: string,
): CmsBindingCandidate[] => {
  const candidates = new Map<string, CmsBindingCandidate>()
  const pairedTagPattern =
    /<([a-z][a-z0-9:-]*)([^>]*\sdata-cms\s*=\s*(["'])(.*?)\3[^>]*)>([\s\S]*?)<\/\1>/gi
  let pairedMatch: RegExpExecArray | null

  while ((pairedMatch = pairedTagPattern.exec(html)) !== null) {
    const parsed = parseCmsSelector(pairedMatch[4])
    if (parsed === null) continue

    const attributes = pairedMatch[2]
    const attributeContent =
      parsed.type === 'image'
        ? readHtmlAttribute(attributes, 'src')
        : parsed.type === 'link'
          ? readHtmlAttribute(attributes, 'href')
          : undefined
    const textContent = stripHtml(pairedMatch[5])
    candidates.set(parsed.selector, {
      ...parsed,
      content: attributeContent ?? textContent,
      contentType: parsed.type === 'image' || parsed.type === 'link' ? 'text/uri-list' : 'text/plain',
    })
  }

  const tagPattern =
    /<([a-z][a-z0-9:-]*)([^>]*\sdata-cms\s*=\s*(["'])(.*?)\3[^>]*)\/?>/gi
  let tagMatch: RegExpExecArray | null

  while ((tagMatch = tagPattern.exec(html)) !== null) {
    const parsed = parseCmsSelector(tagMatch[4])
    if (parsed === null || candidates.has(parsed.selector)) continue

    const attributes = tagMatch[2]
    const attributeContent =
      parsed.type === 'image'
        ? readHtmlAttribute(attributes, 'src')
        : parsed.type === 'link'
          ? readHtmlAttribute(attributes, 'href')
          : undefined

    candidates.set(parsed.selector, {
      ...parsed,
      content: attributeContent,
      contentType: parsed.type === 'image' || parsed.type === 'link' ? 'text/uri-list' : 'text/plain',
    })
  }

  return Array.from(candidates.values()).slice(0, 120)
}

const extractCmsBindingCandidatesFromSiteSpec = (
  siteSpecJson: string | undefined,
): CmsBindingCandidate[] => {
  if (siteSpecJson === undefined) return []

  try {
    const spec = JSON.parse(siteSpecJson) as Record<string, unknown>
    const candidates: CmsBindingCandidate[] = []
    const add = (field: string, value: unknown, type: CmsBindingType = inferCmsBindingType(field)) => {
      if (typeof value !== 'string' || value.trim().length === 0) return
      candidates.push({
        selector: `field:${field}`,
        field,
        type,
        content: value.trim(),
        contentType: 'text/plain',
      })
    }

    add('brand.name', spec.brand ?? spec.projectName ?? spec.name)
    add('site.title', spec.title ?? spec.projectName ?? spec.brand)
    add('site.tagline', spec.tagline ?? spec.description, 'richtext')

    const hero = typeof spec.hero === 'object' && spec.hero !== null ? spec.hero as Record<string, unknown> : undefined
    if (hero !== undefined) {
      add('hero.headline', hero.headline ?? hero.title)
      add('hero.subheadline', hero.subheadline ?? hero.description, 'richtext')
      add('hero.cta', hero.cta ?? hero.primaryCta ?? hero.primaryCTA, 'link')
    }

    const pages = Array.isArray(spec.pages) ? spec.pages : []
    const home = pages.find((page): page is Record<string, unknown> =>
      typeof page === 'object' && page !== null,
    )
    if (home !== undefined) {
      add('home.title', home.title ?? home.name)
      add('home.description', home.description, 'richtext')
    }

    collectCmsSiteSpecCandidates(spec, [], candidates)

    return candidates.slice(0, CMS_SITE_SPEC_MAX_CANDIDATES)
  } catch {
    return []
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
  let created = 0

  for (const candidate of candidates) {
    if (seen.has(candidate.selector)) continue
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

const escapeOpenUiText = (value: string): string =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\n', '\\n')

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
): Promise<{
  openUiSource?: string
  siteSpecJson?: string
}> => {
  const [homeModule, siteSpec] = await getCurrentHomeModuleAndSiteSpec(
    ctx,
    sessionId,
  )
  let openUiSource = homeModule?.source
  let siteSpecJson = siteSpec?.specJson ?? siteSpec?.spec

  if (homeModule !== null) {
    const sourceEdit = applyPreviewTextEdit(
      homeModule.source,
      beforeText,
      afterText,
    )
    if (sourceEdit.replaced) {
      openUiSource = sourceEdit.html
      await ctx.db.patch(homeModule._id, {
        source: sourceEdit.html,
        status: 'succeeded',
        errorMessage: undefined,
        updatedAt: now,
      })
    }
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
        siteSpecJson = JSON.stringify(specEdit.value)
        await ctx.db.patch(siteSpec._id, {
          specJson: siteSpecJson,
          updatedAt: now,
        })
      }
    } catch {
      const specEdit = applyPreviewTextEdit(siteSpecJson, beforeText, afterText)
      if (specEdit.replaced) {
        siteSpecJson = specEdit.html
        await ctx.db.patch(siteSpec._id, {
          specJson: siteSpecJson,
          updatedAt: now,
        })
      }
    }
  }

  return { openUiSource, siteSpecJson }
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
    const promptCacheKey = normalizePromptCacheKey(
      prompt,
      args.preferredLanguage,
    )

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

    const canReuseCachedSession =
      designReferenceFingerprint === undefined &&
      args.isPrivate === false &&
      userId === undefined &&
      args.anonymousOwnerSecret === undefined

    if (canReuseCachedSession) {
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

export const completeGeneration = internalMutation({
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

    if ((session.previewVersion ?? 0) > 0) {
      return {
        sessionId: args.sessionId,
        previewVersion: session.previewVersion ?? 0,
        skipped: true,
        reason: 'preview_already_exists',
      }
    }

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

    homeModule?.source?.trim().length ||
      (() => {
        throw new ConvexError({ code: 'ARTIFACT_NOT_READY', message: 'Generated source is not ready to export' })
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
      const artifactSnapshot =
        args.afterHtml === undefined
          ? await applyTextEditToCurrentArtifacts(
              ctx,
              args.sessionId,
              args.beforeText,
              args.afterText,
              now,
            )
          : await snapshotCurrentArtifacts(ctx, args.sessionId)

      await ctx.db.insert('previews', {
        sessionId: args.sessionId,
        version: nextPreviewVersion,
        html: editedPreview.html,
        openUiSource: artifactSnapshot.openUiSource,
        siteSpecJson: artifactSnapshot.siteSpecJson,
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
            previewReady: session.status === 'preview_ready' || preview !== null,
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
      .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
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
      .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
      .take(500)

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
      .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
      .take(200)
    const entries = await ctx.db
      .query('cmsEntries')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
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
    type: v.optional(v.union(v.literal('text'), v.literal('richtext'), v.literal('image'), v.literal('link'))),
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
        : await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: telegramChatId, text: notification }),
          })
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
