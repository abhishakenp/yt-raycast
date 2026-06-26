import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useCallback, useMemo, useRef, useState } from 'react'

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
import {
  forgetReadySession,
  readReadySessionCache,
  rememberReadySession,
  verifyReadySession,
} from '@/features/session/services/ready-session-cache'
import { rememberGenerationLaunchHandoff } from '@/features/session/services/generation-launch-handoff'
import { parseClonePrompt } from '@/features/clone/services/parse-clone-url'
import { useOptionalAuth } from '@/shared/auth/use-optional-auth'

const CREATE_SESSION_TIMEOUT_MS = 12_000
const CREATE_SESSION_RETRY_DELAY_MS = 450
const delay = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> =>
  await new Promise<T>((resolve, reject) => {
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

const createSessionWithRetry = async <Payload, Result>(
  createSession: (payload: Payload) => Promise<Result>,
  payload: Payload,
): Promise<Result> => {
  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await withTimeout(
        createSession(payload),
        CREATE_SESSION_TIMEOUT_MS,
      )
    } catch (error) {
      lastError = error
      if (attempt === 1) break
      await delay(CREATE_SESSION_RETRY_DELAY_MS)
    }
  }

  throw lastError
}

export const usePromptHomeController = () => {
  const navigate = useNavigate()
  const createSession = useMutation(api.sessions.create)
  const { getToken, isSignedIn } = useOptionalAuth()
  const [prompt, setPrompt] = useState('')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shareBonusClaimed, setShareBonusClaimed] = useState(false)
  const submitInFlightRef = useRef(false)
  const shareBonusHydratedRef = useRef(false)

  const refreshShareBonusStatus = useCallback(async () => {
    if (shareBonusHydratedRef.current) return
    shareBonusHydratedRef.current = true

    try {
      const resp = await fetch('/api/share-bonus')
      if (!resp.ok) return
      const data = await resp.json()
      if (data.claimed) setShareBonusClaimed(true)
    } catch {
      shareBonusHydratedRef.current = false
    }
  }, [])

  const claimShareBonus = async () => {
    if (shareBonusClaimed) return
    try {
      const resp = await fetch('/api/share-bonus', { method: 'POST' })
      if (resp.ok) {
        shareBonusHydratedRef.current = true
        setShareBonusClaimed(true)
      }
    } catch {
      // Ignore network errors
    }
  }

  const normalizedPrompt = useMemo(() => normalizePromptDraft(prompt), [prompt])
  const canSubmit = normalizedPrompt.length > 0 && !isSubmitting
  const runSubmit = async (opts?: {
    preferredLanguage?: string
    isPrivate?: boolean
    prompt?: string
    designReferenceUrls?: string[]
    designReferenceNotes?: string
    cloneUrl?: string
    engineVersion?: 'v1' | 'v2'
  }) => {
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
    setErrorMessage(undefined)
    setIsSubmitting(true)

    const { isClone, seedUrls, brief } = parseClonePrompt(runtimePrompt)
    const explicitCloneUrl = opts?.cloneUrl?.trim() || ''
    const targetCloneUrl = isClone ? seedUrls[0] : explicitCloneUrl
    const targetCloneBrief = isClone ? brief : runtimePrompt

    try {
      const canUseVerifiedReadyCache =
        !isPrivate &&
        (opts?.designReferenceUrls ?? []).filter((url) => url.trim()).length ===
          0 &&
        !(opts?.designReferenceNotes ?? '').trim() &&
        !(opts?.cloneUrl ?? '').trim() &&
        !isClone &&
        opts?.engineVersion !== 'v2'
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
            to: '/generate/$sessionId',
            params: { sessionId: cached.sessionId },
          })
          return
        }
      }

      const anonymousOwnerSecret = createAnonymousOwnerSecret()
      const anonymousClientId = createAnonymousClientId(window.localStorage)
      const workspace = createSessionWorkspaceKey()
      const result = await createSessionWithRetry(
        createSession,
        buildCreateSessionPayload({
          prompt: runtimePrompt,
          preferredLanguage,
          isPrivate,
          anonymousOwnerSecret,
          anonymousClientId,
          workspace,
          designReferenceUrls: opts?.designReferenceUrls,
          designReferenceNotes: opts?.designReferenceNotes,
          cloneUrl: targetCloneUrl,
          engineVersion: targetCloneUrl ? 'v1' : opts?.engineVersion,
        }),
      )
      const sessionId = result.sessionId

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

      if (targetCloneUrl) {
        const headers: Record<string, string> = {
          'content-type': 'application/json',
        }
        if (isSignedIn) {
          const token = await getToken({ template: 'convex' })
          if (token) headers.Authorization = `Bearer ${token}`
        }
        void fetch('/api/clone', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sessionId,
            anonymousOwnerSecret,
            seedUrl: targetCloneUrl,
            brief: targetCloneBrief,
          }),
        }).catch(() => {})
      }

      await navigate({
        to: '/generate/$sessionId',
        params: {
          sessionId,
        },
      })
    } catch {
      submitInFlightRef.current = false
      setErrorMessage('Generation could not start. Try again.')
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
