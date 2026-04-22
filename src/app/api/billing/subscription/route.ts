import { NextRequest, NextResponse } from 'next/server'
import { hasActiveSubscription } from '@/billing/payments'
import { checkInternalSecret } from '../_internal-auth'

export async function GET(req: NextRequest) {
  if (!checkInternalSecret(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = req.nextUrl.searchParams.get('uid')
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })
  const active = await hasActiveSubscription(uid)
  return NextResponse.json({ active })
}
