import { ConvexError } from 'convex/values'

export const MAX_PROMPT_LENGTH = 5000

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

const blockedPolicyPatterns = [
  /\b(phishing|spoof|fake)\b[\s\S]{0,40}\b(login|checkout|bank|paypal|stripe|coinbase|wallet|oauth|2fa|password)\b/i,
  /\b(child|kid|minor|underage)\w*\b[\s\S]{0,48}\b(porn|xxx|nude|naked|sexual|erotic)\b/i,
  /\b(porn|xxx|escort|brothel|explicit|onlyfans)\b[\s\S]{0,64}\b(site|website|app|landing|marketplace|directory|booking|clone|gallery|store)\b/i,
  /\b(steal|harvest|collect)\b[\s\S]{0,40}\b(passwords?|credentials?|credit\s*cards?|private\s*keys?|seed\s*phrases?)\b/i,
  /\b(malware|ransomware|keylogger|trojan|botnet)\b[\s\S]{0,40}\b(site|website|landing|download|builder|dashboard|panel)\b/i,
]

export const normalizeSpaces = (value: string): string =>
  value.replace(/\s+/g, ' ').trim()

export const normalizePromptCacheKey = (
  prompt: string,
  preferredLanguage = 'en',
): string =>
  `${normalizeSpaces(preferredLanguage).toLowerCase() || 'en'}:${normalizeSpaces(
    prompt,
  )
    .toLowerCase()
    .replace(/[^a-z0-9\p{L}\p{N}]+/gu, ' ')
    .trim()}`

export const isLikelyGibberishPrompt = (prompt: string): boolean => {
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

  // Detect keyboard-mashing patterns (e.g. "asdf jkl", "qwerty zxcv")
  if (
    tokens.length > 0 &&
    tokens.every((token) => keyboardMashPatterns.has(token))
  )
    return true

  const lower = text.toLowerCase()
  if (keyboardMashSequences.some((seq) => lower.includes(seq))) {
    if (text.length <= 24) return true
    if (
      tokens.length > 0 &&
      tokens.every((token) => keyboardMashPatterns.has(token))
    )
      return true
  }

  const collapsed = lower.replace(/[^a-z]/g, '')
  return collapsed.length >= 8 && /(.)\1{5,}/.test(collapsed)
}

export const assertContentPolicy = (prompt: string) => {
  blockedPolicyPatterns.some((pattern) => pattern.test(prompt)) &&
    (() => {
      throw new ConvexError({
        code: 'CONTENT_POLICY',
        message: 'This prompt is blocked by the content policy.',
      })
    })()
}

export const normalizeOptionalHttpsUrl = (
  value: string | undefined,
  label: string,
): string | undefined => {
  const raw = value?.trim()
  if (!raw) return undefined
  try {
    const upgraded = raw.replace(/^http:\/\//i, 'https://')
    const parsed = new URL(upgraded)
    parsed.hash = ''
    return parsed.toString()
  } catch {
    throw new ConvexError({
      code: 'INVALID_DESIGN_REFERENCE',
      message: `${label} must be a valid HTTPS URL.`,
    })
  }
}

export const createFingerprint = (values: string[]): string | undefined => {
  const input = values.filter(Boolean).join('\n')
  if (!input) return undefined
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export const assertPrompt = (prompt: string): void => {
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
