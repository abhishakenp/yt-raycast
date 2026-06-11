import { createFileRoute } from '@tanstack/react-router'

import { createTranslateResponse } from '@/features/localization/server/translate-response'

export const Route = createFileRoute('/api/translate')({
  server: {
    handlers: {
      POST: async ({ request }) => await createTranslateResponse(request),
    },
  },
})
