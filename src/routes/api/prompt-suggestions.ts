import { createFileRoute } from '@tanstack/react-router'

import { PROMPT_PARTIAL_MAX } from './-prompt-suggestions-contract.js'
import { getPartialPromptSuggestions } from './-prompt-suggestions-logic.js'

const PROMPT_SUGGESTION_TIMEOUT_MS = 5_000
const PROMPT_SUGGESTION_TIMEOUT = Symbol('prompt-suggestion-timeout')

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

export const Route = createFileRoute('/api/prompt-suggestions')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return json({ suggestions: [] }, { status: 400 })
        }

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          return json({ suggestions: [] }, { status: 422 })
        }

        const requestBody = body as Record<string, unknown>
        if (typeof requestBody.partial !== 'string') {
          return json({ suggestions: [] }, { status: 422 })
        }
        if (requestBody.partial.length > PROMPT_PARTIAL_MAX) {
          return json({ suggestions: [] }, { status: 413 })
        }
        if (
          requestBody.language !== undefined &&
          typeof requestBody.language !== 'string'
        ) {
          return json({ suggestions: [] }, { status: 422 })
        }

        const partial = requestBody.partial
        const language =
          typeof requestBody.language === 'string'
            ? requestBody.language
            : undefined
        let timeoutId: ReturnType<typeof setTimeout> | undefined
        try {
          const suggestions = await Promise.race([
            getPartialPromptSuggestions(partial, { language }),
            new Promise<typeof PROMPT_SUGGESTION_TIMEOUT>((resolve) => {
              timeoutId = setTimeout(
                () => resolve(PROMPT_SUGGESTION_TIMEOUT),
                PROMPT_SUGGESTION_TIMEOUT_MS,
              )
            }),
          ])
          if (suggestions === PROMPT_SUGGESTION_TIMEOUT) {
            return json({ suggestions: [] }, { status: 504 })
          }
          return json({ suggestions })
        } catch {
          return json({ suggestions: [] }, { status: 500 })
        } finally {
          if (timeoutId !== undefined) clearTimeout(timeoutId)
        }
      },
    },
  },
})
