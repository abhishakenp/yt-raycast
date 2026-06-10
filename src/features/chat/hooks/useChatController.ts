import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

export const useChatController = (sessionId: string) => {
  const sendMessage = useMutation(api.sessions.sendChatMessage)
  const messages = useQuery(api.sessions.listChatMessages, { sessionId: sessionId as Id<'sessions'> })
  const [chatError, setChatError] = useState<string>()
  const [isSending, setIsSending] = useState(false)

  const send = async (content: string) => {
    setChatError(undefined)
    setIsSending(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await sendMessage({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        content,
      })
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Send failed')
    } finally {
      setIsSending(false)
    }
  }

  return {
    chatError,
    isSending,
    messages,
    send,
  }
}
