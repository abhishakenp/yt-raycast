import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { hashClientIp } from '@/features/session/server/session-create-response'

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim()
    if (ip) return ip
  }
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()
  return null
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

async function getShareBonusStatus(request: Request) {
  const ip = getClientIp(request)
  if (ip === null) {
    return json(
      {
        claimed: false,
        error: 'Unable to identify client IP.',
        success: false,
      },
      { status: 400 },
    )
  }

  const clientIpHash = hashClientIp(ip)
  const client = createRuntimeConvexHttpClient()
  const claimed = await client.query(api.shareBonus.getShareBonusStatus, {
    clientIpHash,
    date: getToday(),
  })

  return json({ claimed })
}

async function claimShareBonus(request: Request) {
  const ip = getClientIp(request)
  if (ip === null) {
    return json(
      {
        claimed: false,
        error: 'Unable to identify client IP.',
        success: false,
      },
      { status: 400 },
    )
  }

  const clientIpHash = hashClientIp(ip)
  const client = createRuntimeConvexHttpClient()
  const result = await client.mutation(api.shareBonus.claimShareBonus, {
    clientIpHash,
    date: getToday(),
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
