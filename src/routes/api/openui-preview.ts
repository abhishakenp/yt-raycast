import { createFileRoute } from '@tanstack/react-router'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import { GeneratedModulePreview } from '@/features/generation/components/GeneratedModulePreview'

const MAX_SOURCE_LENGTH = 900_000

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const normalizeLocale = (value: unknown) => {
  const locale = typeof value === 'string' ? value.trim() : ''
  return locale.length > 0 && locale.length < 24 ? locale : 'en'
}

export const Route = createFileRoute('/api/openui-preview')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          locale?: unknown
          sessionId?: unknown
          siteSpecJson?: unknown
          source?: unknown
        } = {}

        try {
          body = await request.json()
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400 })
        }

        const source = typeof body.source === 'string' ? body.source : ''
        if (source.trim().length === 0 || source.length > MAX_SOURCE_LENGTH) {
          return json({ error: 'Invalid OpenUI source' }, { status: 422 })
        }

        const sessionId = typeof body.sessionId === 'string' && body.sessionId.length > 0 ? body.sessionId : 'gallery'
        const siteSpecJson = typeof body.siteSpecJson === 'string' ? body.siteSpecJson : undefined

        try {
          const html = renderToString(
            createElement(GeneratedModulePreview, {
              source,
              sessionId,
              siteSpecJson,
              locale: normalizeLocale(body.locale),
              isDark: true,
            }),
          )

          return json({ html })
        } catch (error) {
          return json(
            { error: error instanceof Error ? error.message : 'OpenUI preview render failed' },
            { status: 500 },
          )
        }
      },
    },
  },
})
