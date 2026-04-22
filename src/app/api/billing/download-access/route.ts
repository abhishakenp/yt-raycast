import { NextRequest, NextResponse } from 'next/server'
import { getDownloadAccessDecision } from '@/billing/payments'
import { checkInternalSecret } from '../_internal-auth'

export async function POST(req: NextRequest) {
  if (!checkInternalSecret(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { session, target } = await req.json()
  if (!session) return NextResponse.json({ error: 'session required' }, { status: 400 })
  const decision = await getDownloadAccessDecision(session, target)
  return NextResponse.json(decision)
}
