import { NextRequest, NextResponse } from 'next/server'
import { consumeUserCredit } from '@/billing/payments'
import { checkInternalSecret } from '../../_internal-auth'

export async function POST(req: NextRequest) {
  if (!checkInternalSecret(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { uid } = await req.json()
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })
  const consumed = await consumeUserCredit(uid)
  return NextResponse.json({ ok: consumed })
}
