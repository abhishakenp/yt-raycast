import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/sessions/$sessionId/section-edit')({
  server: {
    handlers: {
      // Dynamic import keeps esbuild (and its native fsevents dep) out of
      // Vite's client-side dependency scan — the module is only loaded when
      // a section-edit request actually arrives.
      POST: async ({ request, params }) => {
        const { createSectionEditResponse } =
          await import('@/features/editing/server/section-edit-response')
        return createSectionEditResponse(params.sessionId, request)
      },
    },
  },
})
