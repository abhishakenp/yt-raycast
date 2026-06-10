import { createFileRoute } from '@tanstack/react-router'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../convex/_generated/api'
import { startGenerationInBackground } from '@/features/generation/server/start-generation'
import {
  buildCreateSessionPayload,
  createSessionWorkspaceKey,
} from '@/features/session/services/session-create-payload'
import { getRuntimeConvexUrl } from '@/shared/env/convex-runtime'

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const randomHex = (length: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2)))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length)
}

export const Route = createFileRoute('/api/sessions')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          prompt?: unknown
          preferredLanguage?: unknown
          isPrivate?: unknown
        } = {}

        try {
          body = await request.json()
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400 })
        }

        const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
        if (!prompt) return json({ error: 'Prompt is required' }, { status: 422 })

        const preferredLanguage =
          typeof body.preferredLanguage === 'string' && body.preferredLanguage.trim()
            ? body.preferredLanguage.trim()
            : 'en'
        const anonOwnerSecret = randomHex(64)
        const client = new ConvexHttpClient(getRuntimeConvexUrl())

        try {
          const { sessionId } = await client.mutation(api.sessions.create, buildCreateSessionPayload({
            prompt,
            preferredLanguage,
            isPrivate: body.isPrivate === true,
            anonymousOwnerSecret: anonOwnerSecret,
            workspace: createSessionWorkspaceKey(),
          }))

          void (async () => {
            try {
              await startGenerationInBackground({
                sessionId,
                prompt,
                anonymousOwnerSecret: anonOwnerSecret,
              })
            } catch (error) {
              try {
                await client.mutation(api.sessions.failGeneration, {
                  sessionId,
                  anonymousOwnerSecret: anonOwnerSecret,
                  message: error instanceof Error ? error.message : 'Generation failed',
                })
              } catch {
                // Session failure reporting is best-effort; do not break the already-created redirect target.
              }
            }
          })()

          return json({
            id: sessionId,
            sessionId,
            anonOwnerSecret,
          })
        } catch (error) {
          return json(
            {
              error: error instanceof Error ? error.message : 'Failed to create session',
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
