import { ConvexHttpClient } from 'convex/browser'
import { validatePartnerCoupon } from '../billing/coupons.js'

const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL || process.env.CONVEX_URL)

const proPlanId = process.env.RAZORPAY_PRO_PLAN_ID || ''
const earlyAdopterPlanId = process.env.RAZORPAY_EARLY_ADOPTER_PLAN_ID || ''
const credits3Paise = parseInt(process.env.RAZORPAY_CREDITS_3_PAISE || '0', 10)
const credits10Paise = parseInt(process.env.RAZORPAY_CREDITS_10_PAISE || '0', 10)

const getRazorpayConfig = () => ({
  proPlanId,
  earlyAdopterPlanId,
  credits3Paise,
  credits10Paise,
})

const notesUid = (notes) => {
  if (!notes || typeof notes !== 'object') return ''
  return String(notes.uid || notes.user_id || '')
}

export async function razorpayStartHandler(req, res) {
  const mode = String(req.body?.mode || '')
  const uid = req.user.uid
  const email = req.user.email || ''
  const cfg = getRazorpayConfig()

  try {
    if (mode === 'subscription') {
      const tier = String(req.body?.tier || 'pro')
      const planId = tier === 'early_adopter' ? cfg.earlyAdopterPlanId : cfg.proPlanId
      if (!planId) return res.status(503).json({ error: 'Subscription plan is not configured' })

      const result = await convex.action('razorpay:createSubscription', {
        userId: uid,
        planId,
        tier,
      })

      return res.json({
        key_id: result.key_id,
        subscription_id: result.subscription_id,
        name: 'Ship Fast Pro',
        description: tier === 'early_adopter' ? 'Early adopter Pro' : 'Pro subscription',
        prefill: email ? { email } : {},
      })
    }

    if (mode === 'credit_pack') {
      const packId = String(req.body?.packId || '')
      const amount =
        packId === '10_credits'
          ? cfg.credits10Paise
          : packId === '3_credits'
            ? cfg.credits3Paise
            : 0
      if (!amount) return res.status(400).json({ error: 'Invalid or unconfigured credit pack' })

      const result = await convex.action('razorpay:createCreditPackOrder', {
        userId: uid,
        packId: packId === '10_credits' ? '10_credits' : '3_credits',
        amount,
      })

      return res.json({
        key_id: result.key_id,
        order_id: result.order_id,
        amount: result.amount,
        currency: result.currency || 'INR',
        name: 'Ship Fast',
        description: packId === '10_credits' ? '10 download credits' : '3 download credits',
        prefill: email ? { email } : {},
      })
    }

    return res.status(400).json({ error: 'Invalid mode' })
  } catch (err) {
    console.error('[razorpay/start]', err?.message ?? err)
    return res.status(500).json({ error: err?.message || 'Razorpay error' })
  }
}

// Webhooks are now handled by Convex HTTP endpoint at /razorpay-webhook
export async function razorpayWebhookHandler(req, res) {
  return res.status(503).json({ error: 'Razorpay webhooks are now handled by Convex. Update your webhook endpoint to the Convex URL.' })
}
