import { NextRequest } from 'next/server'

export function checkInternalSecret(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[billing] INTERNAL_API_SECRET is not set — rejecting request')
      return false
    }
    const host = req.headers.get('host') ?? ''
    return host.startsWith('127.0.0.1') || host.startsWith('localhost')
  }
  return req.headers.get('authorization') === `Bearer ${secret}`
}
