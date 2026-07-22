import { useNavigate, useRouter } from '@tanstack/react-router'
import { useConvex } from 'convex/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
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
import {
  forgetReadySession,
  readReadySessionCache,
  rememberReadySession,
  verifyReadySession,
} from '@/features/session/services/ready-session-cache'
import { rememberGenerationLaunchHandoff } from '@/features/session/services/generation-launch-handoff'
import { AppError } from '@/shared/errors/app-error'

const CREATE_SESSION_TIMEOUT_MS = 12_000
const CREATE_SESSION_RETRY_DELAY_MS = 450
const MIN_LAUNCH_FEEDBACK_MS = 1_200
const SPECULATIVE_GENERATION_DELAY_MS = 500
const SPECULATIVE_READY_NAVIGATION_GRACE_MS = 1_500
const SPECULATIVE_READY_NAVIGATION_MIN_AGE_MS = 2_500

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
  cleanupPrewarm?: () => void
  isPrewarmReady?: () => boolean
  prewarmed: boolean
  prewarmStartedAt: number
  readyPromise?: Promise<boolean>
  request: Promise<CreateSessionResult>
}
type PreloadedGenerationRoute = {
  cleanup: () => void
  isReady: () => boolean
  ready: Promise<boolean>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const hasRenderableGenerationSource = (view: Record<string, unknown>) => {
  const homeModule = view.homeModule
  if (
    isRecord(homeModule) &&
    typeof homeModule.source === 'string' &&
    homeModule.source.trim().length > 0
  ) {
    return true
  }

  const latestPreview = view.latestPreview
  return (
    isRecord(latestPreview) &&
    typeof latestPreview.html === 'string' &&
    latestPreview.html.trim().length > 0
  )
}

const isPreviewReadyGenerationView = (value: unknown) => {
  if (!isRecord(value)) return false
  const session = value.session
  return (
    isRecord(session) &&
    session.status === 'preview_ready' &&
    hasRenderableGenerationSource(value)
  )
}

const admissionErrorFromResponse = (data: unknown): AppError | null => {
  if (!isRecord(data) || typeof data.error !== 'string') return null
  if (data.code === 'AUTH_REQUIRED') {
    return new AppError('UNAUTHENTICATED', data.error)
  }
  if (data.code === 'QUOTA_EXCEEDED') {
    return new AppError('QUOTA_EXCEEDED', data.error)
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

async function waitForSpeculativePrewarmReady(
  speculativeGeneration: SpeculativeGeneration | null,
) {
  if (speculativeGeneration === null) return false
  if (
    speculativeGeneration.prewarmed ||
    speculativeGeneration.isPrewarmReady?.() === true
  ) {
    return true
  }

  const speculativeAgeMs = Date.now() - speculativeGeneration.prewarmStartedAt
  if (
    speculativeAgeMs < SPECULATIVE_READY_NAVIGATION_MIN_AGE_MS ||
    speculativeGeneration.readyPromise === undefined
  ) {
    return false
  }

  await Promise.race([
    speculativeGeneration.readyPromise,
    delay(SPECULATIVE_READY_NAVIGATION_GRACE_MS),
  ])

  return (
    speculativeGeneration.prewarmed ||
    speculativeGeneration.isPrewarmReady?.() === true
  )
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
  const response = await fetch('/api/sessions/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).catch(() => null)

  if (response !== null) {
    const contentType = response.headers?.get('content-type') ?? ''
    const isHtml = contentType.includes('text/html')
    const data = isHtml
      ? null
      : ((await response.json().catch(() => null)) as
          | CreateSessionResult
          | CreateSessionErrorResult
          | null)
    const disabled =
      response.status === 404 &&
      data !== null &&
      'error' in data &&
      data.error === 'Public preview session creation is disabled.'

    const hasSessionId =
      data !== null &&
      'sessionId' in data &&
      typeof data.sessionId === 'string' &&
      data.sessionId.trim() !== ''

    // A 200 response with a non-JSON/HTML body, or JSON missing a session id,
    // is a malformed success — fall back to the Convex mutation instead of
    // navigating with an undefined id.
    const malformedSuccess = response.ok && (data === null || !hasSessionId)

    if (response.ok && hasSessionId) return data as CreateSessionResult
    if (!disabled && !malformedSuccess) {
      const admissionError = admissionErrorFromResponse(data)
      if (admissionError) throw admissionError
      throw new Error(
        data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error
          ? data.error
          : 'Generation could not start.',
      )
    }
  }

  const [{ api: convexApi }, { createRuntimeConvexHttpClient }] =
    await Promise.all([
      import('../../../../convex/_generated/api'),
      import('@/shared/convex/http-client'),
    ])
  const client = createRuntimeConvexHttpClient(CREATE_SESSION_TIMEOUT_MS)
  return (await client.mutation(
    convexApi.sessions.create,
    payload,
  )) as CreateSessionResult
}

async function publishDraftSessionFromHttp(
  payload: CreateSessionPayload,
): Promise<CreateSessionResult> {
  return await createSessionFromHttp({ ...payload, isDraft: false })
}

const getGeneratedSessionPath = (sessionId: string): string =>
  `/generate/${encodeURIComponent(sessionId)}/`

export const usePromptHomeController = () => {
  const convex = useConvex()
  const navigate = useNavigate()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
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
    (sessionId: string, markReady: () => void): PreloadedGenerationRoute => {
      void router
        .preloadRoute({
          to: '/generate/$sessionId/$',
          params: { sessionId },
        })
        .catch(() => undefined)

      let unsubscribe: (() => void) | null = null
      let cleanupTimer: number | null = null
      let cleanedUp = false
      let readPrewarmedResult = () => false
      let resolveReady: (ready: boolean) => void = () => undefined
      const ready = new Promise<boolean>((resolve) => {
        resolveReady = resolve
      })
      const cleanup = () => {
        if (cleanedUp) return
        cleanedUp = true
        resolveReady(false)
        if (cleanupTimer !== null) {
          window.clearTimeout(cleanupTimer)
          cleanupTimer = null
        }
        unsubscribe?.()
        unsubscribe = null
      }
      const checkReady = (read: () => unknown) => {
        const ready = isPreviewReadyGenerationView(read())
        if (!ready) return false
        markReady()
        resolveReady(true)
        cleanup()
        return true
      }

      try {
        convex.prewarmQuery({
          query: api.sessions.getGenerationView,
          args: { lookup: sessionId },
          extendSubscriptionFor: 30_000,
        })
        const watch = convex.watchQuery(api.sessions.getGenerationView, {
          lookup: sessionId,
        })
        readPrewarmedResult = () => checkReady(() => watch.localQueryResult())
        unsubscribe = watch.onUpdate(() => {
          readPrewarmedResult()
        })
        cleanupTimer = window.setTimeout(cleanup, 30_000)
        readPrewarmedResult()
      } catch {
        resolveReady(false)
        cleanup()
      }
      return {
        cleanup,
        isReady: readPrewarmedResult,
        ready,
      }
    },
    [convex, router],
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
    speculativeGenerationRef.current?.cleanupPrewarm?.()
    speculativeGenerationRef.current = null
  }, [clearSpeculativeGenerationTimer])

  useEffect(
    () => () => {
      invalidateSpeculativeGeneration()
    },
    [invalidateSpeculativeGeneration],
  )

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
          prewarmed: false,
          prewarmStartedAt: Date.now(),
          request,
        }
        speculativeGenerationRef.current = speculativeGeneration
        void request
          .then((result) => {
            if (typeof result.sessionId === 'string' && result.sessionId) {
              if (!submitInFlightRef.current) {
                const preloaded = preloadGenerationRoute(
                  result.sessionId,
                  () => {
                    speculativeGeneration.prewarmed = true
                  },
                )
                speculativeGeneration.cleanupPrewarm = preloaded.cleanup
                speculativeGeneration.isPrewarmReady = preloaded.isReady
                speculativeGeneration.readyPromise = preloaded.ready
                return
              }
              const preloaded = preloadGenerationRoute(result.sessionId, () => {
                speculativeGeneration.prewarmed = true
              })
              speculativeGeneration.cleanupPrewarm = preloaded.cleanup
              speculativeGeneration.isPrewarmReady = preloaded.isReady
              speculativeGeneration.readyPromise = preloaded.ready
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
      const canUseVerifiedReadyCache =
        !isPrivate &&
        (opts?.designReferenceUrls ?? []).filter((url) => url.trim()).length ===
          0 &&
        !(opts?.designReferenceNotes ?? '').trim() &&
        !(opts?.cloneUrl ?? '').trim() &&
        opts?.engineVersion !== 'v2' &&
        opts?.engineVersion !== 'v3'
      if (canUseVerifiedReadyCache) {
        const cached = readReadySessionCache(window.localStorage, {
          prompt: runtimePrompt,
          preferredLanguage,
        })
        if (cached !== null) {
          void verifyReadySession({
            sessionId: cached.sessionId,
            prompt: runtimePrompt,
            preferredLanguage,
          })
            .then((verifiedSessionId) => {
              if (verifiedSessionId !== null) return
              forgetReadySession(window.localStorage, {
                prompt: runtimePrompt,
                preferredLanguage,
              })
            })
            .catch(() => {
              forgetReadySession(window.localStorage, {
                prompt: runtimePrompt,
                preferredLanguage,
              })
            })
          try {
            await navigate({
              to: '/generate/$sessionId/$',
              params: { sessionId: cached.sessionId },
            })
          } catch {
            window.location.assign(getGeneratedSessionPath(cached.sessionId))
          }
          return
        }
      }

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

      const speculativePrewarmReady =
        speculativeGeneration?.prewarmed === true ||
        speculativeGeneration?.isPrewarmReady?.() === true ||
        (await waitForSpeculativePrewarmReady(speculativeGeneration))

      if (result.cached !== true && !speculativePrewarmReady) {
        try {
          rememberGenerationLaunchHandoff(window.sessionStorage, sessionId)
        } catch {
          // Storage can be blocked; session launch should still continue.
        }
      } else if (canUseVerifiedReadyCache) {
        try {
          rememberReadySession(window.localStorage, {
            sessionId,
            prompt: runtimePrompt,
            preferredLanguage,
          })
        } catch {
          // Storage can be blocked; session launch should still continue.
        }
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
      setErrorMessage(
        error instanceof AppError &&
          (error.code === 'UNAUTHENTICATED' || error.code === 'QUOTA_EXCEEDED')
          ? error.message
          : 'Generation could not start. Try again.',
      )
      setIsSubmitting(false)
    }
  }

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
