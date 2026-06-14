import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'

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

const generationLaunchStoragePrefix = 'ship-fast:generation-launch:'

export const usePromptHomeController = () => {
  const navigate = useNavigate()
  const createSession = useMutation(api.sessions.create)
  const [prompt, setPrompt] = useState('')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shareBonusClaimed, setShareBonusClaimed] = useState(false)

  // Hydrate share bonus state from server
  useEffect(() => {
    const checkShareBonus = async () => {
      try {
        const resp = await fetch('/api/share-bonus')
        if (resp.ok) {
          const data = await resp.json()
          if (data.claimed) setShareBonusClaimed(true)
        }
      } catch {
        // Ignore network errors
      }
    }
    checkShareBonus()
  }, [])

  const claimShareBonus = async () => {
    if (shareBonusClaimed) return
    try {
      const resp = await fetch('/api/share-bonus', { method: 'POST' })
      if (resp.ok) setShareBonusClaimed(true)
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

    if (!hasPrompt || isSubmitting) {
      return
    }
    if (!checkPromptContentPolicy(runtimePrompt).ok) {
      setErrorMessage(CONTENT_POLICY_CLIENT_MESSAGE)
      return
    }

    setErrorMessage(undefined)
    setIsSubmitting(true)

    try {
      const anonymousOwnerSecret = createAnonymousOwnerSecret()
      const anonymousClientId = createAnonymousClientId(window.localStorage)
      const result = await createSession(
        buildCreateSessionPayload({
          prompt: runtimePrompt,
          preferredLanguage,
          isPrivate,
          anonymousOwnerSecret,
          anonymousClientId,
          workspace: createSessionWorkspaceKey(),
          designReferenceUrls: opts?.designReferenceUrls,
          designReferenceNotes: opts?.designReferenceNotes,
          cloneUrl: opts?.cloneUrl,
          engineVersion: opts?.engineVersion,
        }),
      )
      const sessionId = result.sessionId

      if (result.cached !== true) {
        persistAnonymousOwnerSecret(
          window.localStorage,
          sessionId,
          anonymousOwnerSecret,
        )
        window.sessionStorage.setItem(
          `${generationLaunchStoragePrefix}${sessionId}`,
          '1',
        )
      }

      await navigate({
        to: '/generate/$sessionId',
        params: {
          sessionId,
        },
      })
    } catch {
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
    selectExamplePrompt,
    setPrompt,
    shareBonusClaimed,
    submitButtonLabel,
    submitPrompt: runSubmit,
  }
}
