import { NextResponse } from 'next/server'
import { getEarlyAdopterStatus } from '@/billing/payments'

export async function GET() {
  try {
    const status = await getEarlyAdopterStatus()
    return NextResponse.json(status)
  } catch (err) {
    console.error('[early-adopter-status]', err)
    return NextResponse.json({ error: 'Unable to get early adopter status' }, { status: 500 })
  }
}
