import {
  DAILY_WINDOW_MS,
  MAX_ANON_PER_DAY,
  MAX_ANON_PER_MONTH,
  MAX_ANON_PER_DAY_WITH_BONUS,
  MAX_FREE_AUTH_PER_DAY,
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  MONTHLY_WINDOW_MS,
  RATE_WINDOW_MS,
} from '@/billing/constants'
import { checkPromptContentPolicy } from '@/lib/content-policy'
import { devFlags } from '@/lib/dev-flags'

const MAX_PROMPT_LENGTH = 5000
const MAX_DESIGN_REFERENCE_URLS = 4
const MAX_DESIGN_REFERENCE_NOTES = 800
const SHORT_WINDOW_LIMIT = 5

export type AdmissionErrorCode =
  | 'INVALID_PROMPT'
  | 'PROMPT_TOO_LONG'
  | 'GIBBERISH_PROMPT'
  | 'CONTENT_POLICY'
  | 'INVALID_DESIGN_REFERENCE'
  | 'RATE_LIMITED'
  | 'QUOTA_EXCEEDED'

export type SessionAdmissionInput = {
  prompt: unknown
  preferredLanguage?: unknown
  preferredExportTarget?: unknown
  designReferenceUrls?: unknown
  designReferenceNotes?: unknown
  cloneUrl?: unknown
}

export type SessionAdmissionUsage = {
  now?: number
  isAuthenticated?: boolean
  isPaid?: boolean
  recentTimestamps?: number[]
  anonymousDailyTimestamps?: number[]
  authenticatedMonthlyTimestamps?: number[]
  bypassLimits?: boolean
}

export type SessionAdmissionAccepted = {
  ok: true
  data: {
    prompt: string
    preferredLanguage: string
    preferredExportTarget: 'html' | 'react' | 'next'
    designReferenceUrls: string[]
    designReferenceNotes: string
    cloneUrl?: string
    promptCacheKey: string
    designReferenceFingerprint?: string
  }
  quota: {
    limit: number
    used: number
    remaining: number
    window: 'day' | 'month'
  }
}

export type SessionAdmissionRejected = {
  ok: false
  code: AdmissionErrorCode
  message: string
  status: number
}

const exportTargets = new Set(['html', 'react', 'next'])
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

const keyboardMashPatterns = new Set([
  'asdf',
  'jkl',
  'jkl;',
  'asdfgh',
  'asdfghjkl',
  'asdfjkl',
  'qwerty',
  'qwertz',
  'azerty',
  'zxcv',
  'zxcvbn',
  'zxcvbnm',
  'qwertyuiop',
  'poiuytrewq',
  'lkjhgfdsa',
  'mnbvcxz',
  'hjkl',
  'ghjkl',
  'fghjkl',
  'dfghjkl',
  '123456',
  '12345678',
  '123456789',
  '111111',
  '000000',
])

const keyboardMashSequences = [
  'asdf',
  'jkl',
  'qwerty',
  'zxcv',
  'asdfgh',
  'hjkl',
  'ghjkl',
]

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeUrl(value: string): string {
  const parsed = new URL(value)
  parsed.hash = ''
  return parsed.toString()
}

function simpleHash(value: string): string {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function normalizePromptCacheKey(
  prompt: string,
  preferredLanguage = 'en',
): string {
  return `${normalizeSpaces(preferredLanguage).toLowerCase() || 'en'}:${normalizeSpaces(
    prompt,
  )
    .toLowerCase()
    .replace(/[^a-z0-9\p{L}\p{N}]+/gu, ' ')
    .trim()}`
}

export function isLikelyGibberishPrompt(prompt: string): boolean {
  const text = normalizeSpaces(prompt)
  if (text.length < 8) return true

  const letters = (text.match(/[\p{L}]/gu) ?? []).length
  const alnum = (text.match(/[\p{L}\p{N}]/gu) ?? []).length
  if (alnum === 0) return true
  if (letters / Math.max(1, text.length) < 0.35) return true

  const tokens = text.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? []
  if (tokens.length <= 1 && text.length < 18) return true
  if (
    tokens.length <= 2 &&
    tokens.every((token) => genericPromptWords.has(token))
  )
    return true

  // Detect keyboard-mashing patterns (e.g. "asdf jkl", "qwerty zxcv")
  if (
    tokens.length > 0 &&
    tokens.every((token) => keyboardMashPatterns.has(token))
  )
    return true

  const lower = text.toLowerCase()
  if (keyboardMashSequences.some((seq) => lower.includes(seq))) {
    // If the prompt is short and contains a keyboard-mash sequence, treat as gibberish
    if (text.length <= 24) return true
    // For longer prompts, if all alphanumeric tokens are mash patterns, reject
    if (
      tokens.length > 0 &&
      tokens.every((token) => keyboardMashPatterns.has(token))
    )
      return true
  }

  const collapsed = lower.replace(/[^a-z]/g, '')
  if (collapsed.length >= 8 && /(.)\1{5,}/.test(collapsed)) return true

  return false
}

export function parseSessionAdmission(
  input: SessionAdmissionInput,
  usage: SessionAdmissionUsage = {},
): SessionAdmissionAccepted | SessionAdmissionRejected {
  const now = usage.now ?? Date.now()
  const disableLimits =
    devFlags.disableGenerationLimits || usage.bypassLimits === true
  const prompt = normalizeSpaces(
    typeof input.prompt === 'string' ? input.prompt : '',
  )

  if (!prompt) {
    return {
      ok: false,
      code: 'INVALID_PROMPT',
      message: 'Prompt is required.',
      status: 400,
    }
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return {
      ok: false,
      code: 'PROMPT_TOO_LONG',
      message: `Prompt must be under ${MAX_PROMPT_LENGTH} characters.`,
      status: 400,
    }
  }

  if (isLikelyGibberishPrompt(prompt)) {
    return {
      ok: false,
      code: 'GIBBERISH_PROMPT',
      message:
        'Describe a real website, product, audience, or goal before generating.',
      status: 422,
    }
  }

  if (!checkPromptContentPolicy(prompt).ok) {
    return {
      ok: false,
      code: 'CONTENT_POLICY',
      message: 'This prompt is blocked by the content policy.',
      status: 422,
    }
  }

  const rawDesignReferenceUrls = Array.isArray(input.designReferenceUrls)
    ? input.designReferenceUrls
    : []
  if (
    input.designReferenceUrls != null &&
    !Array.isArray(input.designReferenceUrls)
  ) {
    return {
      ok: false,
      code: 'INVALID_DESIGN_REFERENCE',
      message: 'designReferenceUrls must be an array.',
      status: 400,
    }
  }
  if (rawDesignReferenceUrls.length > MAX_DESIGN_REFERENCE_URLS) {
    return {
      ok: false,
      code: 'INVALID_DESIGN_REFERENCE',
      message: `Use at most ${MAX_DESIGN_REFERENCE_URLS} design reference URLs.`,
      status: 400,
    }
  }

  const designReferenceUrls: string[] = []
  for (const entry of rawDesignReferenceUrls) {
    if (typeof entry !== 'string' || entry.trim().length === 0) continue
    try {
      const normalized = normalizeUrl(entry.trim())
      if (!normalized.startsWith('https://')) throw new Error('HTTPS required')
      designReferenceUrls.push(normalized)
    } catch {
      return {
        ok: false,
        code: 'INVALID_DESIGN_REFERENCE',
        message: 'Design reference URLs must be valid HTTPS URLs.',
        status: 400,
      }
    }
  }

  let cloneUrl: string | undefined
  if (typeof input.cloneUrl === 'string' && input.cloneUrl.trim().length > 0) {
    try {
      cloneUrl = normalizeUrl(input.cloneUrl.trim())
      if (!cloneUrl.startsWith('https://')) throw new Error('HTTPS required')
    } catch {
      return {
        ok: false,
        code: 'INVALID_DESIGN_REFERENCE',
        message: 'cloneUrl must be a valid HTTPS URL.',
        status: 400,
      }
    }
  }

  const recentUsed = (usage.recentTimestamps ?? []).filter(
    (timestamp) => now - timestamp < RATE_WINDOW_MS,
  ).length
  if (
    !usage.bypassLimits &&
    !disableLimits &&
    recentUsed >= SHORT_WINDOW_LIMIT
  ) {
    return {
      ok: false,
      code: 'RATE_LIMITED',
      message:
        'Too many generation requests. Please wait a few minutes and try again.',
      status: 429,
    }
  }

  const isAuthenticated = usage.isAuthenticated === true
  const isPaid = usage.isPaid === true
  const monthlyTimestamps = isAuthenticated
    ? (usage.authenticatedMonthlyTimestamps ?? [])
    : (usage.anonymousDailyTimestamps ?? [])
  const monthlyUsed = monthlyTimestamps.filter(
    (timestamp) => now - timestamp < MONTHLY_WINDOW_MS,
  ).length
  const monthlyLimit = isAuthenticated
    ? isPaid
      ? MAX_PAID_PER_MONTH
      : MAX_FREE_PER_MONTH
    : MAX_ANON_PER_MONTH

  if (!usage.bypassLimits && !disableLimits && monthlyUsed >= monthlyLimit) {
    return {
      ok: false,
      code: 'QUOTA_EXCEEDED',
      message: 'Your monthly generation quota is exhausted.',
      status: 429,
    }
  }

  const dailyLimit = isAuthenticated
    ? isPaid
      ? undefined
      : MAX_FREE_AUTH_PER_DAY
    : MAX_ANON_PER_DAY_WITH_BONUS

  if (dailyLimit !== undefined) {
    const dailyUsed = monthlyTimestamps.filter(
      (timestamp) => now - timestamp < DAILY_WINDOW_MS,
    ).length

    if (!usage.bypassLimits && !disableLimits && dailyUsed >= dailyLimit) {
      return {
        ok: false,
        code: 'QUOTA_EXCEEDED',
        message: isAuthenticated
          ? 'Daily limit reached. Come back tomorrow, or upgrade for unlimited daily generations.'
          : 'Your anonymous daily generation quota is exhausted. Share on social media for +1 free generation.',
        status: 429,
      }
    }
  }

  if (
    typeof input.preferredExportTarget === 'string' &&
    input.preferredExportTarget.trim().length > 0 &&
    !exportTargets.has(input.preferredExportTarget)
  ) {
    return {
      ok: false,
      code: 'INVALID_PROMPT',
      message: `Invalid export target "${input.preferredExportTarget}". Valid targets: html, react, next.`,
      status: 400,
    }
  }

  const preferredExportTarget =
    typeof input.preferredExportTarget === 'string' &&
    exportTargets.has(input.preferredExportTarget)
      ? (input.preferredExportTarget as 'html' | 'react' | 'next')
      : 'html'
  const preferredLanguage =
    normalizeSpaces(
      typeof input.preferredLanguage === 'string'
        ? input.preferredLanguage
        : '',
    ) || 'en'
  const designReferenceNotes = normalizeSpaces(
    typeof input.designReferenceNotes === 'string'
      ? input.designReferenceNotes.slice(0, MAX_DESIGN_REFERENCE_NOTES)
      : '',
  )
  const fingerprintInput = [
    ...designReferenceUrls,
    cloneUrl ?? '',
    designReferenceNotes,
  ]
    .filter(Boolean)
    .join('\n')
  const promptCacheKey = normalizePromptCacheKey(prompt, preferredLanguage)

  return {
    ok: true,
    data: {
      prompt,
      preferredLanguage,
      preferredExportTarget,
      designReferenceUrls,
      designReferenceNotes,
      cloneUrl,
      promptCacheKey,
      designReferenceFingerprint: fingerprintInput
        ? simpleHash(fingerprintInput)
        : undefined,
    },
    quota: {
      limit: monthlyLimit,
      used: monthlyUsed,
      remaining: Math.max(0, monthlyLimit - monthlyUsed - 1),
      window: 'month',
    },
  }
}
