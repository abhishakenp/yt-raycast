import { createFileRoute } from '@tanstack/react-router'

import { createReferralRecordApiResponse } from '@/features/referrals/server/referral-api-response'

export const Route = createFileRoute('/api/referrals/record')({
  server: {
    handlers: {
      POST: async ({ request }) => await createReferralRecordApiResponse(request),
    },
  },
})
