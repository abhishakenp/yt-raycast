import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/session/$sessionId')({
  server: {
    handlers: {
      GET: async ({ params }) =>
        new Response(null, {
          status: 302,
          headers: {
            Location: `/generate/${encodeURIComponent(params.sessionId)}`,
          },
        }),
    },
  },
})
