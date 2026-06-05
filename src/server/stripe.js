import Stripe from 'stripe'
import { FieldValue } from 'firebase-admin/firestore'
import { SITE_URL } from '../config.js'
import { db } from '../auth/firebase-admin.js'
import { addUserCredits, incrementEarlyAdopterCount } from '../billing/payments.js'
import { validatePartnerCoupon } from '../billing/coupons.js'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
const proPriceId = process.env.STRIPE_PRO_PRICE_ID || ''
const earlyAdopterPriceId = process.env.STRIPE_EARLY_ADOPTER_PRICE_ID || ''
const credits3PriceId = process.env.STRIPE_CREDITS_3_PRICE_ID || ''
const credits10PriceId = process.env.STRIPE_CREDITS_10_PRICE_ID || ''

let stripeTestOverrides = null

export const __setStripeTestOverrides = (overrides = null) => {
  stripeTestOverrides = overrides
}

const getStripeConfig = () => ({
  secretKey: stripeTestOverrides?.secretKey ?? stripeSecretKey,
  webhookSecret: stripeTestOverrides?.webhookSecret ?? stripeWebhookSecret,
  proPriceId: stripeTestOverrides?.proPriceId ?? proPriceId,
  earlyAdopterPriceId: stripeTestOverrides?.earlyAdopterPriceId ?? earlyAdopterPriceId,
  credits3PriceId: stripeTestOverrides?.credits3PriceId ?? credits3PriceId,
  credits10PriceId: stripeTestOverrides?.credits10PriceId ?? credits10PriceId,
})

const getStripe = () => {
  if (stripeTestOverrides?.client) return stripeTestOverrides.client
  const cfg = getStripeConfig()
  if (!cfg.secretKey) return null
  return new Stripe(cfg.secretKey, { apiVersion: '2025-11-17.clover' })
}

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

const subscriptionDocRef = (uid, sessionId) =>
  db.collection('customers').doc(uid).collection('subscriptions').doc(sessionId)

async function markStripeSubscriptionActive(session) {
  const uid = String(session.client_reference_id || session.metadata?.uid || '').trim()
  const subscriptionId = String(session.subscription || session.id || '').trim()
  if (!uid || !subscriptionId) return
  await subscriptionDocRef(uid, subscriptionId).set(
    {
      provider: 'stripe',
      status: 'active',
      planId: session.metadata?.price_id || '',
      price: session.metadata?.price_id || '',
      stripeSubscriptionId: subscriptionId,
      stripeCheckoutSessionId: session.id,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )
  if (session.metadata?.tier === 'early_adopter') {
    await incrementEarlyAdopterCount(uid)
  }
}

async function handleStripeCheckoutCompleted(session) {
  const mode = String(session.mode || session.metadata?.mode || '').toLowerCase()
  if (mode === 'subscription') {
    await markStripeSubscriptionActive(session)
    return
  }

  const uid = String(session.client_reference_id || session.metadata?.uid || '').trim()
  const pack = String(session.metadata?.pack || '').trim()
  const credits = pack === '10' ? 10 : pack === '3' ? 3 : 0
  if (!uid || !credits) return
  await addUserCredits(uid, credits, session.payment_intent || session.id)
}

export async function stripeStartHandler(req, res) {
  const stripe = getStripe()
  if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' })
  const cfg = getStripeConfig()

  const mode = String(req.body?.mode || '')
  const uid = req.user.uid
  const email = req.user.email || ''
  const couponCode = String(req.body?.couponCode || '').trim()
  const coupon = couponCode
    ? validatePartnerCoupon(couponCode, { provider: 'stripe' })
    : { ok: true, code: '', percentOff: 0, stripePromotionCode: '' }
  if (!coupon.ok) return res.status(400).json({ error: coupon.error, code: 'INVALID_COUPON' })

  try {
    if (mode === 'subscription') {
      const tier = String(req.body?.tier || 'pro')
      const priceId = tier === 'early_adopter' ? cfg.earlyAdopterPriceId : cfg.proPriceId
      if (!priceId) return res.status(503).json({ error: 'Stripe subscription price is not configured' })

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: uid,
        customer_email: email || undefined,
        allow_promotion_codes: !coupon.code,
        discounts: coupon.stripePromotionCode
          ? [{ promotion_code: coupon.stripePromotionCode }]
          : undefined,
        metadata: metadataFromRequest(req, {
          mode: 'subscription',
          tier,
          price_id: priceId,
          ...(coupon.code
            ? {
                coupon_code: coupon.code,
                coupon_percent_off: String(coupon.percentOff),
              }
            : {}),
        }),
        subscription_data: {
          metadata: metadataFromRequest(req, {
            tier,
            price_id: priceId,
          }),
        },
        ...checkoutReturnUrls(req),
      })

      return res.json({
        provider: 'stripe',
        checkout_session_id: session.id,
        url: session.url,
        coupon: coupon.code ? { code: coupon.code, percentOff: coupon.percentOff } : null,
      })
    }

    if (mode === 'credit_pack') {
      const packId = String(req.body?.packId || '')
      const priceId =
        packId === '10_credits'
          ? cfg.credits10PriceId
          : packId === '3_credits'
            ? cfg.credits3PriceId
            : ''
      if (!priceId) return res.status(400).json({ error: 'Invalid or unconfigured Stripe credit pack' })
      const pack = packId === '10_credits' ? '10' : '3'

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: uid,
        customer_email: email || undefined,
        allow_promotion_codes: !coupon.code,
        discounts: coupon.stripePromotionCode
          ? [{ promotion_code: coupon.stripePromotionCode }]
          : undefined,
        metadata: metadataFromRequest(req, {
          mode: 'credit_pack',
          pack,
          price_id: priceId,
          ...(coupon.code
            ? {
                coupon_code: coupon.code,
                coupon_percent_off: String(coupon.percentOff),
              }
            : {}),
        }),
        ...checkoutReturnUrls(req),
      })

      return res.json({
        provider: 'stripe',
        checkout_session_id: session.id,
        url: session.url,
        coupon: coupon.code ? { code: coupon.code, percentOff: coupon.percentOff } : null,
      })
    }

    return res.status(400).json({ error: 'Invalid mode' })
  } catch (err) {
    console.error('[stripe/start]', err?.message ?? err)
    return res.status(500).json({ error: err?.message || 'Stripe error' })
  }
}

export async function stripeWebhookHandler(req, res) {
  const stripe = getStripe()
  const cfg = getStripeConfig()
  if (!stripe || !cfg.webhookSecret) {
    return res.status(503).json({ error: 'Stripe webhook is not configured' })
  }

  let event
  try {
    const signature = req.headers['stripe-signature']
    event = stripe.webhooks.constructEvent(req.body, signature, cfg.webhookSecret)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err?.message || 'invalid signature'}`)
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      await handleStripeCheckoutCompleted(event.data?.object)
    }
    return res.json({ received: true })
  } catch (err) {
    console.error('[stripe/webhook]', event.type, err?.message ?? err)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}
