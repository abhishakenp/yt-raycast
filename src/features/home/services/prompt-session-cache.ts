/**
 * Unified localStorage cache for the prompt box + speculative generation.
 *
 * Stores the last prompt the user typed along with the speculative session
 * that was created for it (if any). On reload, the controller reads this
 * cache to:
 *   1. Restore the prompt text in the textarea
 *   2. Prevent a duplicate speculative draft from firing for the same
 *      fingerprint
 *   3. Reuse the existing speculative session when the user hits Generate
 *
 * The cache auto-expires after `DRAFT_SESSION_TTL_MS` (shared with the
 * Convex draft-session cleanup cron — single source of truth in
 * convex/lib/session_ttl_constants.ts). When the user hits Generate, the
 * cache is deleted so returning to the home page shows an empty prompt.
 */

import { DRAFT_SESSION_TTL_MS } from '../../../../convex/lib/session_ttl_constants'

export const PROMPT_SESSION_CACHE_KEY = 'ship-fast:prompt-session-cache'
export const PROMPT_SESSION_CACHE_TTL_MS = DRAFT_SESSION_TTL_MS

export type PromptSessionCache = {
  prompt: string
  fingerprint: string
  preferredLanguage: string
  sessionId?: string
  anonymousOwnerSecret?: string
  workspace?: string
  createdAt: number
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isValidCache(value: unknown): value is PromptSessionCache {
  if (!isRecord(value)) return false
  if (typeof value.prompt !== 'string') return false
  if (typeof value.fingerprint !== 'string') return false
  if (typeof value.preferredLanguage !== 'string') return false
  if (typeof value.createdAt !== 'number') return false
  if (value.sessionId !== undefined && typeof value.sessionId !== 'string')
    return false
  if (
    value.anonymousOwnerSecret !== undefined &&
    typeof value.anonymousOwnerSecret !== 'string'
  )
    return false
  if (value.workspace !== undefined && typeof value.workspace !== 'string')
    return false
  return true
}

export function isExpired(cache: PromptSessionCache, now: number): boolean {
  return now - cache.createdAt > PROMPT_SESSION_CACHE_TTL_MS
}

export function readPromptSessionCache(
  storage: StorageLike,
  now: number = Date.now(),
): PromptSessionCache | null {
  try {
    const raw = storage.getItem(PROMPT_SESSION_CACHE_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isValidCache(parsed)) {
      storage.removeItem(PROMPT_SESSION_CACHE_KEY)
      return null
    }
    if (isExpired(parsed, now)) {
      storage.removeItem(PROMPT_SESSION_CACHE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function writePromptSessionCache(
  storage: StorageLike,
  cache: PromptSessionCache,
): void {
  try {
    storage.setItem(PROMPT_SESSION_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Storage may be blocked; prompt still works in-session.
  }
}

export function updatePromptInCache(
  storage: StorageLike,
  prompt: string,
  now: number = Date.now(),
): void {
  const existing = readPromptSessionCache(storage, now)
  if (existing === null) {
    writePromptSessionCache(storage, {
      prompt,
      fingerprint: '',
      preferredLanguage: 'en',
      createdAt: now,
    })
    return
  }
  if (existing.prompt === prompt) return
  writePromptSessionCache(storage, { ...existing, prompt })
}

export function updateSessionInCache(
  storage: StorageLike,
  fields: {
    sessionId: string
    anonymousOwnerSecret: string
    workspace: string
    fingerprint: string
    preferredLanguage: string
  },
  now: number = Date.now(),
): void {
  const existing = readPromptSessionCache(storage, now)
  const prompt = existing?.prompt ?? ''
  writePromptSessionCache(storage, {
    prompt,
    fingerprint: fields.fingerprint,
    preferredLanguage: fields.preferredLanguage,
    sessionId: fields.sessionId,
    anonymousOwnerSecret: fields.anonymousOwnerSecret,
    workspace: fields.workspace,
    createdAt: existing?.createdAt ?? now,
  })
}

export function clearPromptSessionCache(storage: StorageLike): void {
  try {
    storage.removeItem(PROMPT_SESSION_CACHE_KEY)
  } catch {
    // Storage may be blocked; non-critical.
  }
}
