import { ConvexHttpClient } from 'convex/browser'
import { SITE_URL } from '../config.js'
import { validatePartnerCoupon } from '../billing/coupons.js'

const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL || process.env.CONVEX_URL)

const proPriceId = process.env.STRIPE_PRO_PRICE_ID || ''
const earlyAdopterPriceId = process.env.STRIPE_EARLY_ADOPTER_PRICE_ID || ''
const credits3PriceId = process.env.STRIPE_CREDITS_3_PRICE_ID || ''
const credits10PriceId = process.env.STRIPE_CREDITS_10_PRICE_ID || ''

const getStripeConfig = () => ({
  proPriceId,
  earlyAdopterPriceId,
  credits3PriceId,
  credits10PriceId,
})

const checkoutReturnUrls = (req) => {
  const origin = String(req.headers?.origin || SITE_URL || '').replace(/\/+$/, '')
  const safeOrigin = origin || SITE_URL
  const sessionId = String(req.body?.sessionId || req.query?.sessionId || '').trim()
  const sessionPath = sessionId ? `/session/${encodeURIComponent(sessionId)}` : '/'
  return {
    success_url: `${safeOrigin}${sessionPath}?checkout=stripe_success`,
    cancel_url: `${safeOrigin}${sessionPath}?checkout=stripe_cancelled`,
  }
}

const metadataFromRequest = (req, extra = {}) => ({
  uid: req.user.uid,
  email: req.user.email || '',
  provider: 'stripe',
  ...extra,
})


export async function stripeStartHandler(req, res) {
  const mode = String(req.body?.mode || '')
  const uid = req.user.uid
  const email = req.user.email || ''
  const couponCode = String(req.body?.couponCode || '').trim()
  const cfg = getStripeConfig()
  
  const checkoutUrls = checkoutReturnUrls(req)

  try {
    const result = await convex.action('stripe:createCheckoutSession', {
      userId: uid,
      email,
      mode: mode === 'credit_pack' ? 'payment' : mode,
      tier: req.body?.tier,
      packId: req.body?.packId,
      priceId: mode === 'subscription' 
        ? (req.body?.tier === 'early_adopter' ? cfg.earlyAdopterPriceId : cfg.proPriceId)
        : (req.body?.packId === '10_credits' ? cfg.credits10PriceId : cfg.credits3PriceId),
      successUrl: checkoutUrls.success_url,
      cancelUrl: checkoutUrls.cancel_url,
      couponCode,
    })

    return res.json({
      provider: 'stripe',
      checkout_session_id: result.checkoutSessionId,
      url: result.url,
    })
  } catch (err) {
    console.error('[stripe/start]', err?.message ?? err)
    return res.status(500).json({ error: err?.message || 'Stripe error' })
  }
}

// Webhooks are now handled by Convex HTTP endpoint at /stripe-webhook
export async function stripeWebhookHandler(req, res) {
  return res.status(503).json({ error: 'Stripe webhooks are now handled by Convex. Update your webhook endpoint to the Convex URL.' })
}
