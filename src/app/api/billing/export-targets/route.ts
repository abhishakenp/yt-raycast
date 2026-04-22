import { NextRequest, NextResponse } from 'next/server'
import { decorateExportTargetsForRequest } from '@/billing/payments'
import { checkInternalSecret } from '../_internal-auth'

export async function POST(req: NextRequest) {
  if (!checkInternalSecret(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { session, targets } = await req.json()
  if (!session || !targets)
    return NextResponse.json({ error: 'session and targets required' }, { status: 400 })
  const decorated = await decorateExportTargetsForRequest(session, targets)
  return NextResponse.json({ targets: decorated })
}
