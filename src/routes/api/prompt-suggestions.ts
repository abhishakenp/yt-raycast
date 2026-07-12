import { createFileRoute } from '@tanstack/react-router'

import { getPartialPromptSuggestions } from './-prompt-suggestions-logic.js'

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
        let body: { partial?: unknown; language?: unknown } = {}
        try {
          body = await request.json()
        } catch {
          return json({ suggestions: [] }, { status: 400 })
        }

        const partial = typeof body.partial === 'string' ? body.partial : ''
        const language =
          typeof body.language === 'string' ? body.language : undefined
        try {
          const suggestions = await getPartialPromptSuggestions(partial, {
            language,
          })
          return json({ suggestions })
        } catch {
          return json({ suggestions: [] }, { status: 500 })
        }
      },
    },
  },
})
