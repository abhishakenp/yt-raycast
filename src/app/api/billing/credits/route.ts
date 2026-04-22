import { NextRequest, NextResponse } from 'next/server'
import { getUserCredits } from '@/billing/payments'
import { checkInternalSecret } from '../_internal-auth'

export async function GET(req: NextRequest) {
  if (!checkInternalSecret(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = req.nextUrl.searchParams.get('uid')
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })
  const credits = await getUserCredits(uid)
  return NextResponse.json({ credits })
}
