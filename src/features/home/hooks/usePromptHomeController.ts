import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from 'convex/react'
import { useMemo, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import { startGeneration } from '@/features/generation/server/start-generation'
import { examplePrompts, normalizePromptDraft } from '@/features/home/services/home-prompts'
import {
  createAnonymousOwnerSecret,
  persistAnonymousOwnerSecret,
} from '@/features/session/services/anonymous-owner-secret'

export const usePromptHomeController = () => {
  const navigate = useNavigate()
  const createSession = useMutation(api.sessions.create)
  const runGeneration = useServerFn(startGeneration)
  const [prompt, setPrompt] = useState('')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizedPrompt = useMemo(() => normalizePromptDraft(prompt), [prompt])
  const canSubmit = normalizedPrompt.length > 0 && !isSubmitting
  const runSubmit = async (opts?: {
    preferredLanguage?: string
    isPrivate?: boolean
    prompt?: string
  }) => {
    const runtimePrompt = normalizePromptDraft(opts?.prompt ?? prompt)
    const preferredLanguage = opts?.preferredLanguage?.trim() || 'en'
    const isPrivate = opts?.isPrivate ?? false
    const hasPrompt = runtimePrompt.length > 0

    if (!hasPrompt || isSubmitting) {
      return
    }

    setErrorMessage(undefined)
    setIsSubmitting(true)

    try {
      const anonymousOwnerSecret = createAnonymousOwnerSecret()
      const { sessionId } = await createSession({
        prompt: runtimePrompt,
        preferredLanguage,
        preferredExportTarget: 'html',
        isPrivate,
        anonymousOwnerSecret,
      })

      persistAnonymousOwnerSecret(window.localStorage, sessionId, anonymousOwnerSecret)
      void runGeneration({
        data: {
          sessionId,
          prompt: runtimePrompt,
          anonymousOwnerSecret,
        },
      }).catch(() => undefined)

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

  const submitButtonLabel = isSubmitting ? 'Starting generation' : 'Start generating'

  return {
    canSubmit,
    errorMessage,
    examplePrompts,
    isSubmitting,
    prompt,
    selectExamplePrompt,
    setPrompt,
    submitButtonLabel,
    submitPrompt: runSubmit,
  }
}
