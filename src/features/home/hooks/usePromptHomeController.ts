import { useNavigate, useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  checkPromptContentPolicy,
  CONTENT_POLICY_CLIENT_MESSAGE,
} from '@/lib/content-policy'
import {
  examplePrompts,
  normalizePromptDraft,
} from '@/features/home/services/home-prompts'
import {
  createAnonymousOwnerSecret,
  persistAnonymousOwnerSecret,
} from '@/features/session/services/anonymous-owner-secret'
import {
  buildCreateSessionPayload,
  createAnonymousClientId,
  createSessionWorkspaceKey,
} from '@/features/session/services/session-create-payload'
import type { BuildCreateSessionPayloadInput } from '@/features/session/services/session-create-payload'
import { getReferralAuthToken } from '@/features/referrals/lib/referral-client'
import { AppError } from '@/shared/errors/app-error'

const LAST_PROMPT_STORAGE_KEY = 'ship-fast:last-prompt'

const CREATE_SESSION_TIMEOUT_MS = 12_000
const CREATE_SESSION_RETRY_DELAY_MS = 450
const MIN_LAUNCH_FEEDBACK_MS = 1_200
const SPECULATIVE_GENERATION_DELAY_MS = 500

type CreateSessionPayload = ReturnType<typeof buildCreateSessionPayload>
type RunSubmitOptions = Partial<
  Pick<
    BuildCreateSessionPayloadInput,
    | 'prompt'
    | 'preferredLanguage'
    | 'isPrivate'
    | 'designReferenceUrls'
    | 'designReferenceNotes'
    | 'cloneUrl'
    | 'engineVersion'
  >
>
type CreateSessionResult = {
  sessionId: string
  cached?: boolean
  cloned?: boolean
}
type CreateSessionErrorResult = {
  code?: unknown
  error?: unknown
}
type SessionLaunch = {
  anonymousOwnerSecret: string
  fingerprint: string
  payload: CreateSessionPayload
}
type SpeculativeGeneration = SessionLaunch & {
  request: Promise<CreateSessionResult>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const admissionErrorFromResponse = (data: unknown): AppError | null => {
  if (!isRecord(data) || typeof data.error !== 'string') return null
  if (data.code === 'AUTH_REQUIRED') {
    return new AppError('UNAUTHENTICATED', data.error)
  }
  if (data.code === 'QUOTA_EXCEEDED') {
    return new AppError('QUOTA_EXCEEDED', data.error)
  }
  if (
    data.code === 'ANON_DAILY_LIMIT_REACHED' ||
    data.code === 'ANON_DAILY_EXHAUSTED' ||
    data.code === 'AUTH_DAILY_LIMIT_REACHED'
  ) {
    return new AppError('DAILY_LIMIT_REACHED', data.error)
  }
  return null
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function waitForMinimumLaunchFeedback(startedAt: number) {
  const remainingMs = MIN_LAUNCH_FEEDBACK_MS - (Date.now() - startedAt)
  if (remainingMs > 0) await delay(remainingMs)
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return await new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error('create_session_timeout'))
    }, timeoutMs)

    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function isRetryableCreateSessionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return (
    error.message === 'create_session_timeout' ||
    error.name === 'NetworkError' ||
    /\b(?:network|failed to fetch|fetch failed|temporarily unavailable)\b/i.test(
      error.message,
    )
  )
}

async function createSessionWithRetry<Payload, Result>(
  createSession: (payload: Payload) => Promise<Result>,
  payload: Payload,
): Promise<Result> {
  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await withTimeout(
        createSession(payload),
        CREATE_SESSION_TIMEOUT_MS,
      )
    } catch (error) {
      lastError = error
      if (attempt === 1 || !isRetryableCreateSessionError(error)) break
      await delay(CREATE_SESSION_RETRY_DELAY_MS)
    }
  }

  throw lastError
}

function createSessionLaunch(
  opts: RunSubmitOptions | undefined,
  fallbackPrompt: string,
  isDraft = false,
): SessionLaunch {
  const prompt = normalizePromptDraft(opts?.prompt ?? fallbackPrompt)
  const preferredLanguage = opts?.preferredLanguage?.trim() || 'en'
  const isPrivate = opts?.isPrivate ?? false
  const designReferenceUrls = (opts?.designReferenceUrls ?? [])
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 4)
  const designReferenceNotes = (opts?.designReferenceNotes ?? '').trim()
  const cloneUrl = (opts?.cloneUrl ?? '').trim()
  const engineVersion = opts?.engineVersion
  const fingerprint = JSON.stringify({
    cloneUrl,
    designReferenceNotes,
    designReferenceUrls,
    engineVersion: engineVersion ?? 'v1',
    isPrivate,
    preferredLanguage,
    prompt,
  })
  const anonymousOwnerSecret = createAnonymousOwnerSecret()
  const anonymousClientId = createAnonymousClientId(window.localStorage)
  const workspace = createSessionWorkspaceKey()

  return {
    anonymousOwnerSecret,
    fingerprint,
    payload: buildCreateSessionPayload({
      prompt,
      preferredLanguage,
      isPrivate,
      anonymousOwnerSecret,
      anonymousClientId,
      workspace,
      designReferenceUrls,
      designReferenceNotes,
      cloneUrl,
      engineVersion,
      isDraft,
    }),
  }
}

async function createSessionFromHttp(
  payload: CreateSessionPayload,
): Promise<CreateSessionResult> {
  const token = await getReferralAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch('/api/sessions/create', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  const contentType = response.headers?.get('content-type') ?? ''
  const isHtml = contentType.includes('text/html')
  const data = isHtml
    ? null
    : ((await response.json().catch(() => null)) as
        | CreateSessionResult
        | CreateSessionErrorResult
        | null)

  const hasSessionId =
    data !== null &&
    'sessionId' in data &&
    typeof data.sessionId === 'string' &&
    data.sessionId.trim() !== ''

  if (response.ok && hasSessionId) return data as CreateSessionResult

  const admissionError = admissionErrorFromResponse(data)
  if (admissionError) throw admissionError
  throw new Error(
    data !== null &&
      'error' in data &&
      typeof data.error === 'string' &&
      data.error
      ? data.error
      : 'Generation could not start. Try again.',
  )
}

async function publishDraftSessionFromHttp(
  payload: CreateSessionPayload,
): Promise<CreateSessionResult> {
  return await createSessionFromHttp({ ...payload, isDraft: false })
}

const getGeneratedSessionPath = (sessionId: string): string =>
  `/generate/${encodeURIComponent(sessionId)}/`

export const usePromptHomeController = () => {
  const navigate = useNavigate()
  const router = useRouter()
  const [prompt, setPromptState] = useState(() => {
    try {
      return window.localStorage.getItem(LAST_PROMPT_STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shareBonusClaimed, setShareBonusClaimed] = useState(false)
  const submitInFlightRef = useRef(false)
  const shareBonusClaimedRef = useRef(false)
  const shareBonusHydratedRef = useRef(false)
  const shareBonusRefreshInFlightRef = useRef<Promise<void> | null>(null)
  const shareBonusClaimInFlightRef = useRef<Promise<void> | null>(null)
  const speculativeGenerationRef = useRef<SpeculativeGeneration | null>(null)
  const speculativeGenerationTimerRef = useRef<number | null>(null)
  const speculativeGenerationTimerFingerprintRef = useRef<string | null>(null)

  const preloadGenerationRoute = useCallback(
    (sessionId: string) => {
      void router
        .preloadRoute({
          to: '/generate/$sessionId/$',
          params: { sessionId },
        })
        .catch(() => undefined)
    },
    [router],
  )

  const clearSpeculativeGenerationTimer = useCallback(() => {
    if (speculativeGenerationTimerRef.current !== null) {
      window.clearTimeout(speculativeGenerationTimerRef.current)
      speculativeGenerationTimerRef.current = null
    }
    speculativeGenerationTimerFingerprintRef.current = null
  }, [])

  const invalidateSpeculativeGeneration = useCallback(() => {
    clearSpeculativeGenerationTimer()
    speculativeGenerationRef.current = null
  }, [clearSpeculativeGenerationTimer])

  useEffect(
    () => () => {
      invalidateSpeculativeGeneration()
    },
    [invalidateSpeculativeGeneration],
  )

  // Clean up stale ready-session cache entries on mount.
  // These are no longer written, but old entries from previous visits
  // should be purged to free up localStorage space.
  useEffect(() => {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i)
        if (key?.startsWith('ship-fast:ready-session:v1:')) {
          keysToRemove.push(key)
        }
      }
      for (const key of keysToRemove) {
        window.localStorage.removeItem(key)
      }
    } catch {
      // Storage may be blocked; non-critical.
    }
  }, [])

  const refreshShareBonusStatus = useCallback(() => {
    if (shareBonusHydratedRef.current) return Promise.resolve()
    if (shareBonusRefreshInFlightRef.current) {
      return shareBonusRefreshInFlightRef.current
    }

    const request = (async () => {
      try {
        const resp = await fetch('/api/share-bonus')
        if (!resp.ok) return
        const data: unknown = await resp.json()
        if (!isRecord(data) || typeof data.claimed !== 'boolean') return
        shareBonusHydratedRef.current = true
        shareBonusClaimedRef.current = data.claimed
        setShareBonusClaimed(data.claimed)
      } catch {
        // Keep hydration retryable after network and parsing failures.
      } finally {
        shareBonusRefreshInFlightRef.current = null
      }
    })()
    shareBonusRefreshInFlightRef.current = request
    return request
  }, [])

  const claimShareBonus = useCallback(() => {
    if (shareBonusClaimedRef.current) return Promise.resolve()
    if (shareBonusClaimInFlightRef.current) {
      return shareBonusClaimInFlightRef.current
    }

    const request = (async () => {
      try {
        const resp = await fetch('/api/share-bonus', { method: 'POST' })
        if (!resp.ok) return
        const data: unknown = await resp.json()
        if (!isRecord(data) || data.claimed !== true) return
        shareBonusHydratedRef.current = true
        shareBonusClaimedRef.current = true
        setShareBonusClaimed(true)
      } catch {
        // Leave the claim retryable after network and parsing failures.
      } finally {
        shareBonusClaimInFlightRef.current = null
      }
    })()
    shareBonusClaimInFlightRef.current = request
    return request
  }, [])

  const normalizedPrompt = useMemo(() => normalizePromptDraft(prompt), [prompt])
  const canSubmit = normalizedPrompt.length > 0 && !isSubmitting
  const scheduleSpeculativeGeneration = useCallback(
    (opts?: RunSubmitOptions) => {
      const runtimePrompt = normalizePromptDraft(opts?.prompt ?? prompt)
      if (!runtimePrompt || !checkPromptContentPolicy(runtimePrompt).ok) {
        invalidateSpeculativeGeneration()
        return
      }
      const launch = createSessionLaunch(opts, prompt, true)

      if (
        speculativeGenerationRef.current?.fingerprint === launch.fingerprint ||
        speculativeGenerationTimerFingerprintRef.current === launch.fingerprint
      ) {
        return
      }

      invalidateSpeculativeGeneration()
      speculativeGenerationTimerFingerprintRef.current = launch.fingerprint
      speculativeGenerationTimerRef.current = window.setTimeout(() => {
        speculativeGenerationTimerRef.current = null
        if (
          speculativeGenerationTimerFingerprintRef.current !==
          launch.fingerprint
        ) {
          return
        }
        speculativeGenerationTimerFingerprintRef.current = null

        const request = createSessionWithRetry(
          createSessionFromHttp,
          launch.payload,
        )
        const speculativeGeneration: SpeculativeGeneration = {
          ...launch,
          request,
        }
        speculativeGenerationRef.current = speculativeGeneration
        void request
          .then((result) => {
            if (typeof result.sessionId === 'string' && result.sessionId) {
              preloadGenerationRoute(result.sessionId)
            }
          })
          .catch(() => {
            if (speculativeGenerationRef.current === speculativeGeneration) {
              speculativeGenerationRef.current = null
            }
          })
      }, SPECULATIVE_GENERATION_DELAY_MS)
    },
    [invalidateSpeculativeGeneration, preloadGenerationRoute, prompt],
  )

  const runSubmit = async (opts?: RunSubmitOptions) => {
    const runtimePrompt = normalizePromptDraft(opts?.prompt ?? prompt)
    const preferredLanguage = opts?.preferredLanguage?.trim() || 'en'
    const isPrivate = opts?.isPrivate ?? false
    const hasPrompt = runtimePrompt.length > 0

    if (!hasPrompt || isSubmitting || submitInFlightRef.current) {
      return
    }
    if (!checkPromptContentPolicy(runtimePrompt).ok) {
      setErrorMessage(CONTENT_POLICY_CLIENT_MESSAGE)
      return
    }

    submitInFlightRef.current = true
    clearSpeculativeGenerationTimer()
    const launchFeedbackStartedAt = Date.now()
    setErrorMessage(undefined)
    setIsSubmitting(true)

    try {
      const launch = createSessionLaunch(opts, prompt)
      const speculativeGeneration =
        speculativeGenerationRef.current?.fingerprint === launch.fingerprint
          ? speculativeGenerationRef.current
          : null
      if (speculativeGeneration === null) {
        speculativeGenerationRef.current = null
      }
      const result = await (speculativeGeneration?.request ??
        createSessionWithRetry(createSessionFromHttp, launch.payload))
      const sessionId = result.sessionId

      if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
        throw new Error('Session creation returned no session id.')
      }

      const isOwnedCachedClone =
        result.cached === true && result.cloned === true

      if (speculativeGeneration !== null && result.cached !== true) {
        void publishDraftSessionFromHttp(speculativeGeneration.payload).catch(
          () => undefined,
        )
      }

      if (result.cached !== true || isOwnedCachedClone) {
        try {
          persistAnonymousOwnerSecret(
            window.localStorage,
            sessionId,
            speculativeGeneration?.anonymousOwnerSecret ??
              launch.anonymousOwnerSecret,
          )
        } catch {
          // Storage can be blocked; session launch should still continue.
        }
      }

      setPrompt('')
      try {
        window.localStorage.removeItem(LAST_PROMPT_STORAGE_KEY)
      } catch {
        // Storage may be blocked; session launch should still continue.
      }

      try {
        await navigate({
          to: '/generate/$sessionId/$',
          params: {
            sessionId,
          },
        })
      } catch {
        window.location.assign(getGeneratedSessionPath(sessionId))
      }
    } catch (error) {
      await waitForMinimumLaunchFeedback(launchFeedbackStartedAt)
      submitInFlightRef.current = false
      const isQuotaOrAuthError =
        error instanceof AppError &&
        (error.code === 'UNAUTHENTICATED' ||
          error.code === 'QUOTA_EXCEEDED' ||
          error.code === 'DAILY_LIMIT_REACHED')
      if (isQuotaOrAuthError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Generation could not start. Try again.')
      }
      setIsSubmitting(false)
    }
  }

  const setPrompt = useCallback((value: string) => {
    setPromptState(value)
    try {
      window.localStorage.setItem(LAST_PROMPT_STORAGE_KEY, value)
    } catch {
      // Storage may be blocked; prompt still works in-session.
    }
  }, [])

  const selectExamplePrompt = (value: string) => {
    setPrompt(value)
  }

  const submitButtonLabel = isSubmitting
    ? 'Starting generation'
    : 'Start generating'

  return {
    canSubmit,
    claimShareBonus,
    errorMessage,
    examplePrompts,
    isSubmitting,
    prompt,
    refreshShareBonusStatus,
    selectExamplePrompt,
    scheduleSpeculativeGeneration,
    setPrompt,
    shareBonusClaimed,
    submitButtonLabel,
    submitPrompt: runSubmit,
  }
}
