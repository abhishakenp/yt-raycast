import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'
import { requireAuthUser } from '@/lib/auth/server'

function getRzp() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return null
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export async function POST(request: Request) {
  const rzp = getRzp()
  if (!rzp) return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 503 })

  const body = (await request.json()) as Record<string, unknown>
  const mode = String(body?.mode || '')

  try {
    const user = await requireAuthUser(request)
    const uid = user.uid
    const email = user.email || ''

    if (mode === 'subscription') {
      const tier = String(body?.tier || 'pro')
      const planId =
        tier === 'early_adopter'
          ? process.env.RAZORPAY_EARLY_ADOPTER_PLAN_ID
          : process.env.RAZORPAY_PRO_PLAN_ID
      if (!planId)
        return NextResponse.json({ error: 'Subscription plan is not configured' }, { status: 503 })

      const sub = await rzp.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 120,
        quantity: 1,
        notes: { uid },
        ...(email ? { notify_info: { notify_email: email } } : {}),
      })

      return NextResponse.json({
        key_id: process.env.RAZORPAY_KEY_ID,
        subscription_id: sub.id,
        name: 'Ship Fast Pro',
        description: tier === 'early_adopter' ? 'Early adopter Pro' : 'Pro subscription',
        prefill: email ? { email } : {},
      })
    }

    if (mode === 'credit_pack') {
      const packId = String(body?.packId || '')
      const amount =
        packId === '10_credits'
          ? Number(process.env.RAZORPAY_CREDITS_10_PAISE || 0)
          : packId === '3_credits'
            ? Number(process.env.RAZORPAY_CREDITS_3_PAISE || 0)
            : 0
      if (!amount)
        return NextResponse.json({ error: 'Invalid or unconfigured credit pack' }, { status: 400 })

      const receipt = `sf_${uid}_${Date.now()}`.slice(0, 40)
      const order = await rzp.orders.create({
        amount,
        currency: 'INR',
        receipt,
        notes: { uid, pack: packId === '10_credits' ? '10' : '3' },
      })

      return NextResponse.json({
        key_id: process.env.RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Ship Fast',
        description: packId === '10_credits' ? '10 download credits' : '3 download credits',
        prefill: email ? { email } : {},
      })
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Razorpay error'
    console.error('[razorpay/start]', message)
    return NextResponse.json({ error: message || 'Razorpay error' }, { status: 500 })
  }
}
