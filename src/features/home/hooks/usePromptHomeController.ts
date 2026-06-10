import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useMemo, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import { checkPromptContentPolicy, CONTENT_POLICY_CLIENT_MESSAGE } from '@/lib/content-policy'
import { examplePrompts, normalizePromptDraft } from '@/features/home/services/home-prompts'
import {
  createAnonymousOwnerSecret,
  persistAnonymousOwnerSecret,
} from '@/features/session/services/anonymous-owner-secret'
import {
  buildCreateSessionPayload,
  createSessionWorkspaceKey,
} from '@/features/session/services/session-create-payload'

export const usePromptHomeController = () => {
  const navigate = useNavigate()
  const createSession = useMutation(api.sessions.create)
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
    if (!checkPromptContentPolicy(runtimePrompt).ok) {
      setErrorMessage(CONTENT_POLICY_CLIENT_MESSAGE)
      return
    }

    setErrorMessage(undefined)
    setIsSubmitting(true)

    try {
      const anonymousOwnerSecret = createAnonymousOwnerSecret()
      const { sessionId } = await createSession(buildCreateSessionPayload({
        prompt: runtimePrompt,
        preferredLanguage,
        isPrivate,
        anonymousOwnerSecret,
        workspace: createSessionWorkspaceKey(),
      }))

      persistAnonymousOwnerSecret(window.localStorage, sessionId, anonymousOwnerSecret)

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
