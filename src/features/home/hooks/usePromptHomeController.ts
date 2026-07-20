import { useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo, useRef, useState } from 'react'

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

  const [{ api }, { createRuntimeConvexHttpClient }] = await Promise.all([
    import('../../../../convex/_generated/api'),
    import('@/shared/convex/http-client'),
  ])
  const client = createRuntimeConvexHttpClient(CREATE_SESSION_TIMEOUT_MS)
  return (await client.mutation(
    api.sessions.create,
    payload,
  )) as CreateSessionResult
}

export const usePromptHomeController = () => {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shareBonusClaimed, setShareBonusClaimed] = useState(false)
  const submitInFlightRef = useRef(false)
  const shareBonusClaimedRef = useRef(false)
  const shareBonusHydratedRef = useRef(false)
  const shareBonusRefreshInFlightRef = useRef<Promise<void> | null>(null)
  const shareBonusClaimInFlightRef = useRef<Promise<void> | null>(null)

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
          await navigate({
            to: '/generate/$sessionId/$',
            params: { sessionId: cached.sessionId },
          })
          return
        }
      }

      const anonymousOwnerSecret = createAnonymousOwnerSecret()
      const anonymousClientId = createAnonymousClientId(window.localStorage)
      const workspace = createSessionWorkspaceKey()
      const result = await createSessionWithRetry(
        createSessionFromHttp,
        buildCreateSessionPayload({
          prompt: runtimePrompt,
          preferredLanguage,
          isPrivate,
          anonymousOwnerSecret,
          anonymousClientId,
          workspace,
          designReferenceUrls: opts?.designReferenceUrls,
          designReferenceNotes: opts?.designReferenceNotes,
          cloneUrl: opts?.cloneUrl,
          engineVersion: opts?.engineVersion,
        }),
      )
      const sessionId = result.sessionId

      if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
        throw new Error('Session creation returned no session id.')
      }

      const isOwnedCachedClone =
        result.cached === true && result.cloned === true

      if (result.cached !== true || isOwnedCachedClone) {
        persistAnonymousOwnerSecret(
          window.localStorage,
          sessionId,
          anonymousOwnerSecret,
        )
      }

      if (result.cached !== true) {
        rememberGenerationLaunchHandoff(window.sessionStorage, sessionId)
      } else if (canUseVerifiedReadyCache) {
        rememberReadySession(window.localStorage, {
          sessionId,
          prompt: runtimePrompt,
          preferredLanguage,
        })
      }

      await navigate({
        to: '/generate/$sessionId/$',
        params: {
          sessionId,
        },
      })
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
    setPrompt,
    shareBonusClaimed,
    submitButtonLabel,
    submitPrompt: runSubmit,
  }
}
