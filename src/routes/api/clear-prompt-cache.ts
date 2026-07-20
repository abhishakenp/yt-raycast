import { createFileRoute } from '@tanstack/react-router'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const Route = createFileRoute('/api/clear-prompt-cache')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body: unknown = await request.json().catch(() => null)

        if (
          !isRecord(body) ||
          typeof body.prompt !== 'string' ||
          body.prompt.trim().length === 0
        ) {
          return Response.json({ error: 'Missing prompt' }, { status: 400 })
        }

        // Browser storage is unavailable on the server. This response asks the
        // requesting browser to clear its own origin storage instead.
        return Response.json(
          { success: true },
          {
            headers: {
              'Clear-Site-Data': '"storage"',
            },
          },
        )
      },
    },
  },
})
