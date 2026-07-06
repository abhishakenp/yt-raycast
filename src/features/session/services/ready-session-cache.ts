import { normalizePromptDraft } from '@/features/home/services/home-prompts'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'

const READY_SESSION_CACHE_PREFIX = 'ship-fast:ready-session:v1:'
const READY_SESSION_PREVIEW_CACHE_PREFIX = 'ship-fast:ready-session-preview:v1:'
const READY_SESSION_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const READY_SESSION_VERIFY_TIMEOUT_MS = 1_800

type ReadySessionCacheEntry = {
  sessionId: string
  prompt: string
  preferredLanguage: string
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
  preview?: { html?: unknown; source?: unknown } | null
  homeModule?: { source?: unknown } | null
}

export type ReadySessionPreviewCacheEntry = {
  sessionId: string
  status: 'preview_ready'
  prompt: string
  preferredLanguage: string
  preferredExportTarget?: string
  previewVersion?: number
  elapsed?: number | null
  themeOverride?: string | null
  selectedBrandLogo?: {
    name: string
    domain: string | null
    brandId: string | null
    icon: string | null
    logo: string | null
  } | null
  homeModule: {
    moduleKey?: string
    source: string
    status?: string
    updatedAt?: number
  }
  preview?: {
    html?: string
    openUiSource?: string
    siteSpecJson?: string
    version?: number
  }
  siteSpec?: {
    specJson?: string
    updatedAt?: number
  }
  tasks?: Array<{
    id?: string
    title: string
    status: string
    order?: number
  }>
  createdAt: number
}

const normalizeLanguage = (value: string) =>
  String(value || 'en')
    .trim()
    .toLowerCase() || 'en'

const normalizePromptForCache = (value: string) =>
  normalizePromptDraft(value).toLowerCase()

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout?: () => void,
): Promise<T> =>
  await new Promise<T>((resolve, reject) => {
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

export const getReadySessionCacheKey = (
  prompt: string,
  preferredLanguage = 'en',
): string =>
  `${READY_SESSION_CACHE_PREFIX}${normalizeLanguage(preferredLanguage)}:${normalizePromptDraft(
    prompt,
  )
    .toLowerCase()
    .replace(/[^a-z0-9\p{L}\p{N}]+/gu, ' ')
    .trim()}`

export const rememberReadySession = (
  storage: Pick<Storage, 'setItem'>,
  input: {
    sessionId: string
    prompt: string
    preferredLanguage?: string
    now?: number
  },
) => {
  const prompt = normalizePromptDraft(input.prompt)
  const sessionId = input.sessionId.trim()
  if (!prompt || !sessionId) return

  const entry: ReadySessionCacheEntry = {
    sessionId,
    prompt,
    preferredLanguage: normalizeLanguage(input.preferredLanguage ?? 'en'),
    createdAt: input.now ?? Date.now(),
  }

  try {
    storage.setItem(
      getReadySessionCacheKey(entry.prompt, entry.preferredLanguage),
      JSON.stringify(entry),
    )
  } catch {
    // localStorage quota exceeded or unavailable (private mode / disabled).
    // The ready-session cache is a best-effort optimization; a failed write
    // must never crash the dashboard or break preview rendering.
  }
}

export const readReadySessionCache = (
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  input: { prompt: string; preferredLanguage?: string; now?: number },
): ReadySessionCacheEntry | null => {
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

export const forgetReadySession = (
  storage: Pick<Storage, 'removeItem'>,
  input: { prompt: string; preferredLanguage?: string },
) => {
  storage.removeItem(
    getReadySessionCacheKey(input.prompt, input.preferredLanguage),
  )
}

const getReadySessionPreviewCacheKey = (sessionId: string): string =>
  `${READY_SESSION_PREVIEW_CACHE_PREFIX}${sessionId.trim()}`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const rememberReadySessionPreview = (
  storage: Pick<Storage, 'setItem'>,
  input: Omit<ReadySessionPreviewCacheEntry, 'createdAt'> & {
    createdAt?: number
  },
) => {
  const sessionId = input.sessionId.trim()
  const prompt = normalizePromptDraft(input.prompt)
  const preferredLanguage = normalizeLanguage(input.preferredLanguage)
  const source = input.homeModule.source.trim()

  if (!sessionId || input.status !== 'preview_ready' || !prompt || !source) {
    return
  }

  // Reject snapshots whose home module source or preview HTML is real OpenUI
  // renderer-error output — these are broken artifacts that must never be
  // cached for reuse.
  if (
    isUnsafePublicPreviewHtml(source) ||
    isUnsafePublicPreviewHtml(input.preview?.html)
  ) {
    return
  }

  const entry: ReadySessionPreviewCacheEntry = {
    ...input,
    sessionId,
    prompt,
    preferredLanguage,
    homeModule: {
      ...input.homeModule,
      source,
    },
    createdAt: input.createdAt ?? Date.now(),
  }

  try {
    storage.setItem(
      getReadySessionPreviewCacheKey(sessionId),
      JSON.stringify(entry),
    )
  } catch {
    // localStorage quota exceeded or unavailable (private mode / disabled).
    // The ready-session preview cache is a best-effort optimization; a failed
    // write must never crash the dashboard or break preview rendering.
  }
}

export const readReadySessionPreview = (
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  input: { sessionId: string; now?: number },
): ReadySessionPreviewCacheEntry | null => {
  const sessionId = input.sessionId.trim()
  if (!sessionId) return null

  const key = getReadySessionPreviewCacheKey(sessionId)
  const raw = storage.getItem(key)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as unknown
    const now = input.now ?? Date.now()

    if (
      !isRecord(parsed) ||
      parsed.sessionId !== sessionId ||
      parsed.status !== 'preview_ready' ||
      typeof parsed.prompt !== 'string' ||
      typeof parsed.preferredLanguage !== 'string' ||
      typeof parsed.createdAt !== 'number' ||
      !isRecord(parsed.homeModule) ||
      typeof parsed.homeModule.source !== 'string' ||
      parsed.homeModule.source.trim().length === 0 ||
      now - parsed.createdAt > READY_SESSION_CACHE_TTL_MS
    ) {
      storage.removeItem(key)
      return null
    }

    return parsed as ReadySessionPreviewCacheEntry
  } catch {
    storage.removeItem(key)
    return null
  }
}

export const forgetReadySessionPreview = (
  storage: Pick<Storage, 'removeItem'>,
  input: { sessionId: string },
) => {
  storage.removeItem(getReadySessionPreviewCacheKey(input.sessionId))
}

export const verifyReadySession = async (
  input: {
    sessionId: string
    prompt: string
    preferredLanguage?: string
    timeoutMs?: number
  },
  fetchSession: typeof fetch = fetch,
): Promise<string | null> => {
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

  // Reject sessions whose preview HTML is real OpenUI renderer-error output
  // or whose preview content is entirely empty (no renderable HTML or module
  // source). These are broken or incomplete artifacts that must not be reused.
  // Only apply this check when the API response explicitly includes preview or
  // homeModule fields — a minimal response without them is still valid.
  const hasPreview = data.preview !== undefined && data.preview !== null
  const hasHomeModule =
    data.homeModule !== undefined && data.homeModule !== null

  if (hasPreview || hasHomeModule) {
    const previewHtml =
      typeof data.preview?.html === 'string' ? data.preview.html : ''
    const homeModuleSource =
      typeof data.homeModule?.source === 'string' ? data.homeModule.source : ''

    if (
      isUnsafePublicPreviewHtml(previewHtml) ||
      isUnsafePublicPreviewHtml(homeModuleSource)
    ) {
      return null
    }

    if (
      previewHtml.trim().length === 0 &&
      homeModuleSource.trim().length === 0
    ) {
      return null
    }
  }

  return responseSessionId
}
