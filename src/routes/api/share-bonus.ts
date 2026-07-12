import { createFileRoute } from '@tanstack/react-router'

import { shareBonusIps } from '@/lib/rate-limit'

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

function getShareBonusStatus(request: Request) {
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
  const stored = shareBonusIps.get(ip)
  const today = new Date().toISOString().slice(0, 10)
  const claimed = stored === today

  return json({ claimed })
}

function claimShareBonus(request: Request) {
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
