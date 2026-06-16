import { createFileRoute } from '@tanstack/react-router'

import { shareBonusIps } from '@/lib/rate-limit'

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('cf-connecting-ip') || 'unknown'
}

const getShareBonusStatus = (request: Request) => {
  const ip = getClientIp(request)
  const stored = shareBonusIps.get(ip)
  const today = new Date().toISOString().slice(0, 10)
  const claimed = stored === today

  return json({ claimed })
}

const claimShareBonus = (request: Request) => {
  const ip = getClientIp(request)
  const today = new Date().toISOString().slice(0, 10)
  const stored = shareBonusIps.get(ip)

  // Already claimed today
  if (stored === today) {
    return json({ claimed: true, success: false })
  }

  // Grant bonus
  shareBonusIps.set(ip, today)
  return json({ claimed: true, success: true })
}

export const Route = createFileRoute('/api/share-bonus')({
  server: {
    handlers: {
      GET: async ({ request }) => getShareBonusStatus(request),
      POST: async ({ request }) => claimShareBonus(request),
    },
  },
})
