import { createFileRoute } from '@tanstack/react-router'

import { createReferralStatusApiResponse } from '@/features/referrals/server/referral-api-response'

export const Route = createFileRoute('/api/referrals/status')({
  server: {
    handlers: {
      GET: async ({ request }) => await createReferralStatusApiResponse(request),
    },
  },
})
