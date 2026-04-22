import { NextResponse } from 'next/server'
import { requireAuthUser } from '@/lib/auth/server'
import { hasActiveSubscription } from '@/billing/payments'

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request)
    const active = await hasActiveSubscription(user.uid)
    return NextResponse.json({ active })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[subscription-status]', err)
    return NextResponse.json({ error: 'Unable to check subscription status' }, { status: 500 })
  }
}
