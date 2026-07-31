import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import {
  getClientIp,
  hashClientIp,
} from '@/features/session/server/session-create-response'

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

async function getShareBonusStatus(request: Request) {
  const clientIpHash = hashClientIp(getClientIp(request))
  const client = createRuntimeConvexHttpClient()
  const claimed = await client.query(api.shareBonus.getShareBonusStatus, {
    clientIpHash,
    date: getToday(),
    secret: process.env.SHARE_BONUS_MUTATION_SECRET,
  })

  return json({ claimed })
}

async function claimShareBonus(request: Request) {
  const clientIpHash = hashClientIp(getClientIp(request))
  const client = createRuntimeConvexHttpClient()
  const result = await client.mutation(api.shareBonus.claimShareBonus, {
    clientIpHash,
    date: getToday(),
    secret: process.env.SHARE_BONUS_MUTATION_SECRET,
  })

  return json(result)
}

export const Route = createFileRoute('/api/share-bonus')({
  server: {
    handlers: {
      GET: async ({ request }) => getShareBonusStatus(request),
      POST: async ({ request }) => claimShareBonus(request),
    },
  },
})
