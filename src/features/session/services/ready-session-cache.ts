import { normalizePromptDraft } from '@/features/home/services/home-prompts'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'

const READY_SESSION_CACHE_PREFIX = 'ship-fast:ready-session:v1:'
const READY_SESSION_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const READY_SESSION_VERIFY_TIMEOUT_MS = 1_800
const READY_SESSION_CACHE_MAX_ENTRIES = 24
const READY_SESSION_CACHE_MAX_BYTES = 64 * 1024

type ReadySessionCacheEntry = {
  sessionId: string
  prompt: string
  preferredLanguage: string
  createdAt: number
}

type WritableReadySessionStorage = Pick<Storage, 'setItem'> &
  Partial<Pick<Storage, 'getItem' | 'removeItem' | 'key' | 'length'>>

type CacheEntryMeta = {
  key: string
  bytes: number
  createdAt: number
}

type ReadySessionApiResponse = {
  sessionId?: unknown
  id?: unknown
  prompt?: unknown
  preferredLanguage?: unknown
  status?: unknown
  homepageReady?: unknown
  openuiReady?: unknown
  preview?: { openUiSource?: unknown; source?: unknown } | null
  homeModule?: { source?: unknown } | null
}

function normalizeLanguage(value: string) {
  return (
    String(value || 'en')
      .trim()
      .toLowerCase() || 'en'
  )
}

function normalizePromptForCache(value: string) {
  return normalizePromptDraft(value).toLowerCase()
}

function estimateStorageBytes(key: string, value: string): number {
  return (key.length + value.length) * 2
}

function canEnumerateStorage(
  storage: WritableReadySessionStorage,
): storage is WritableReadySessionStorage &
  Pick<Storage, 'getItem' | 'removeItem' | 'key' | 'length'> {
  return (
    typeof storage.getItem === 'function' &&
    typeof storage.removeItem === 'function' &&
    typeof storage.key === 'function' &&
    typeof storage.length === 'number'
  )
}

function readCreatedAt(raw: string): number | null {
  try {
    const parsed = JSON.parse(raw) as { createdAt?: unknown }
    return typeof parsed.createdAt === 'number' ? parsed.createdAt : null
  } catch {
    return null
  }
}

function pruneReadySessionStorage(
  storage: WritableReadySessionStorage,
  input: {
    pendingKey: string
    pendingValue: string
    maxEntries: number
    maxBytes: number
    now?: number
  },
) {
  if (!canEnumerateStorage(storage)) return

  const now = input.now ?? Date.now()
  const entries: CacheEntryMeta[] = []

  for (let i = storage.length - 1; i >= 0; i -= 1) {
    const key = storage.key(i)
    if (key === null || !key.startsWith(READY_SESSION_CACHE_PREFIX)) continue
    if (key === input.pendingKey) continue

    const raw = storage.getItem(key)
    if (raw === null) continue

    const createdAt = readCreatedAt(raw)
    if (createdAt === null || now - createdAt > READY_SESSION_CACHE_TTL_MS) {
      storage.removeItem(key)
      continue
    }

    entries.push({
      key,
      bytes: estimateStorageBytes(key, raw),
      createdAt,
    })
  }

  entries.sort((a, b) => a.createdAt - b.createdAt)

  let totalBytes =
    estimateStorageBytes(input.pendingKey, input.pendingValue) +
    entries.reduce((sum, entry) => sum + entry.bytes, 0)
  let totalEntries = entries.length + 1

  for (const entry of entries) {
    if (totalEntries <= input.maxEntries && totalBytes <= input.maxBytes) break

    storage.removeItem(entry.key)
    totalBytes -= entry.bytes
    totalEntries -= 1
  }
}

function writeReadySessionCacheEntry(
  storage: WritableReadySessionStorage,
  input: { key: string; value: string; now?: number },
) {
  try {
    pruneReadySessionStorage(storage, {
      pendingKey: input.key,
      pendingValue: input.value,
      maxEntries: READY_SESSION_CACHE_MAX_ENTRIES,
      maxBytes: READY_SESSION_CACHE_MAX_BYTES,
      now: input.now,
    })
    storage.setItem(input.key, input.value)
  } catch {
    pruneReadySessionStorage(storage, {
      pendingKey: input.key,
      pendingValue: input.value,
      maxEntries: 1,
      maxBytes: READY_SESSION_CACHE_MAX_BYTES,
      now: input.now,
    })
    try {
      storage.setItem(input.key, input.value)
    } catch {
      // localStorage quota exceeded or unavailable (private mode / disabled).
      // The ready-session cache is a best-effort optimization; a failed write
      // must never crash the dashboard or break preview rendering.
    }
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout?: () => void,
): Promise<T> {
  return await new Promise<T>((resolve, reject) => {
    const timer = globalThis.setTimeout(() => {
      onTimeout?.()
      reject(new Error('ready_session_verify_timeout'))
    }, timeoutMs)

    promise.then(
      (value) => {
        globalThis.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        globalThis.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

export function getReadySessionCacheKey(
  prompt: string,
  preferredLanguage = 'en',
): string {
  return `${READY_SESSION_CACHE_PREFIX}${normalizeLanguage(preferredLanguage)}:${normalizePromptDraft(
    prompt,
  )
    .toLowerCase()
    .replace(/[^a-z0-9\p{L}\p{N}]+/gu, ' ')
    .trim()}`
}

export function rememberReadySession(
  storage: WritableReadySessionStorage,
  input: {
    sessionId: string
    prompt: string
    preferredLanguage?: string
    now?: number
  },
) {
  const prompt = normalizePromptDraft(input.prompt)
  const sessionId = input.sessionId.trim()
  if (!prompt || !sessionId) return

  const entry: ReadySessionCacheEntry = {
    sessionId,
    prompt,
    preferredLanguage: normalizeLanguage(input.preferredLanguage ?? 'en'),
    createdAt: input.now ?? Date.now(),
  }

  const key = getReadySessionCacheKey(entry.prompt, entry.preferredLanguage)
  writeReadySessionCacheEntry(storage, {
    key,
    value: JSON.stringify(entry),
    now: entry.createdAt,
  })
}

export function readReadySessionCache(
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  input: { prompt: string; preferredLanguage?: string; now?: number },
): ReadySessionCacheEntry | null {
  const key = getReadySessionCacheKey(input.prompt, input.preferredLanguage)
  const raw = storage.getItem(key)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<ReadySessionCacheEntry>
    const now = input.now ?? Date.now()
    const prompt = normalizePromptDraft(input.prompt)
    const preferredLanguage = normalizeLanguage(input.preferredLanguage ?? 'en')
    if (
      typeof parsed.sessionId !== 'string' ||
      typeof parsed.prompt !== 'string' ||
      typeof parsed.preferredLanguage !== 'string' ||
      typeof parsed.createdAt !== 'number' ||
      normalizePromptForCache(parsed.prompt) !==
        normalizePromptForCache(prompt) ||
      normalizeLanguage(parsed.preferredLanguage) !== preferredLanguage ||
      now - parsed.createdAt > READY_SESSION_CACHE_TTL_MS
    ) {
      storage.removeItem(key)
      return null
    }

    return {
      sessionId: parsed.sessionId,
      prompt,
      preferredLanguage,
      createdAt: parsed.createdAt,
    }
  } catch {
    storage.removeItem(key)
    return null
  }
}

export function forgetReadySession(
  storage: Pick<Storage, 'removeItem'>,
  input: { prompt: string; preferredLanguage?: string },
) {
  storage.removeItem(
    getReadySessionCacheKey(input.prompt, input.preferredLanguage),
  )
}

export async function verifyReadySession(
  input: {
    sessionId: string
    prompt: string
    preferredLanguage?: string
    timeoutMs?: number
  },
  fetchSession: typeof fetch = fetch,
): Promise<string | null> {
  const sessionId = input.sessionId.trim()
  if (!sessionId) return null

  const controller = new AbortController()
  let response: Response
  try {
    response = await withTimeout(
      fetchSession(`/api/sessions/${encodeURIComponent(sessionId)}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }),
      input.timeoutMs ?? READY_SESSION_VERIFY_TIMEOUT_MS,
      () => controller.abort(),
    )
  } catch {
    return null
  }

  if (!response.ok) return null

  let data: ReadySessionApiResponse
  try {
    data = (await response.json()) as ReadySessionApiResponse
  } catch {
    return null
  }
  const responseSessionId =
    typeof data.sessionId === 'string'
      ? data.sessionId
      : typeof data.id === 'string'
        ? data.id
        : ''
  const status = typeof data.status === 'string' ? data.status : ''
  const prompt = typeof data.prompt === 'string' ? data.prompt : ''
  const preferredLanguage =
    typeof data.preferredLanguage === 'string' ? data.preferredLanguage : 'en'

  if (
    responseSessionId !== sessionId ||
    status !== 'preview_ready' ||
    normalizePromptForCache(prompt) !== normalizePromptForCache(input.prompt) ||
    normalizeLanguage(preferredLanguage) !==
      normalizeLanguage(input.preferredLanguage ?? 'en')
  ) {
    return null
  }

  // Reject sessions whose preview source is real OpenUI renderer-error output
  // or whose preview content is entirely empty (no renderable module source).
  // These are broken or incomplete artifacts that must not be reused.
  // Only apply this check when the API response explicitly includes preview or
  // homeModule fields — a minimal response without them is still valid.
  const hasPreview = data.preview !== undefined && data.preview !== null
  const hasHomeModule =
    data.homeModule !== undefined && data.homeModule !== null

  if (hasPreview || hasHomeModule) {
    const previewOpenUiSource =
      typeof data.preview?.openUiSource === 'string'
        ? data.preview.openUiSource
        : ''
    const homeModuleSource =
      typeof data.homeModule?.source === 'string' ? data.homeModule.source : ''

    if (
      isUnsafePublicPreviewHtml(previewOpenUiSource) ||
      isUnsafePublicPreviewHtml(homeModuleSource)
    ) {
      return null
    }

    if (
      previewOpenUiSource.trim().length === 0 &&
      homeModuleSource.trim().length === 0
    ) {
      return null
    }
  }

  return responseSessionId
}
