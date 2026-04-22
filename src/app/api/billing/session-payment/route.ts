import { NextRequest, NextResponse } from 'next/server'
import { getSessionPaymentDetails } from '@/billing/payments'
import { checkInternalSecret } from '../_internal-auth'

export async function POST(req: NextRequest) {
  if (!checkInternalSecret(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { session, ip, countryCode } = await req.json()
  if (!session) return NextResponse.json({ error: 'session required' }, { status: 400 })
  const details = await getSessionPaymentDetails(session, {
    ip: ip ?? null,
    countryCode: countryCode ?? null,
    headers: {},
  })
  return NextResponse.json(details)
}
