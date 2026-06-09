'use node'

import { action } from './_generated/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import Stripe from 'stripe'

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return null
  return new Stripe(secretKey, { apiVersion: '2024-11-20.acacia' as any })
}

export const createCheckoutSession = action({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
    mode: v.union(v.literal('subscription'), v.literal('payment')),
    tier: v.optional(v.union(v.literal('pro'), v.literal('early_adopter'))),
    packId: v.optional(v.union(v.literal('3_credits'), v.literal('10_credits'))),
    priceId: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
    couponCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe()
    if (!stripe) throw new Error('Stripe is not configured')

    const { userId, email, mode, tier, packId, priceId, successUrl, cancelUrl, couponCode } = args

    const metadata: Record<string, string> = {
      uid: userId,
      provider: 'stripe',
      mode,
      price_id: priceId,
    }

    if (tier) metadata.tier = tier
    if (packId) metadata.pack = packId === '10_credits' ? '10' : '3'
    if (couponCode) metadata.coupon_code = couponCode

    const session = await stripe.checkout.sessions.create({
      mode: mode as any,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId,
      customer_email: email || undefined,
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: !couponCode,
    })

    return {
      checkoutSessionId: session.id,
      url: session.url,
    }
  },
})

export const handleWebhook = action({
  args: {
    eventName: v.string(),
    payload: v.any(),
    rawSig: v.optional(v.string()),
    webhookSecret: v.optional(v.string()),
  },
  handler: async (ctx, { eventName, payload, rawSig, webhookSecret }) => {
    const stripe = getStripe()
    if (!stripe) throw new Error('Stripe is not configured')

    // For raw webhook validation
    if (eventName === 'raw' && payload.body && rawSig && webhookSecret) {
      let event: any
      try {
        event = stripe.webhooks.constructEvent(payload.body, rawSig, webhookSecret)
      } catch (err) {
        throw new Error(`Invalid signature: ${(err as Error).message}`)
      }

      // Process the actual event
      const idempotencyKey = `${event.type}_${event.data?.object?.id || event.id}`
      const processed = await ctx.runMutation(internal.billing.markWebhookProcessed, {
        idempotencyKey,
        provider: 'stripe',
      })
      if (!processed) return

      const session: any = event.data?.object

      if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
        const mode = session?.mode || session?.metadata?.mode
        const uid = session?.client_reference_id || session?.metadata?.uid

        if (!uid) return

        if (mode === 'subscription') {
          const subscriptionId = session?.subscription || session?.id
          const planId = session?.metadata?.price_id || ''
          const tier = session?.metadata?.tier

          await ctx.runMutation(internal.billing.upsertSubscription, {
            userId: uid,
            provider: 'stripe',
            status: 'active',
            planId,
            stripeSubscriptionId: String(subscriptionId),
            stripeCheckoutSessionId: session?.id,
            rawStatus: session?.status,
          })

          if (tier === 'early_adopter') {
            await ctx.runMutation(internal.billing.incrementEarlyAdopterCount, { userId: uid })
          }
        } else if (mode === 'payment') {
          const pack = session?.metadata?.pack
          const credits = pack === '10' ? 10 : pack === '3' ? 3 : 0
          if (credits > 0) {
            await ctx.runMutation(internal.billing.addUserCredits, {
              userId: uid,
              amount: credits,
              paymentRef: session?.payment_intent || session?.id,
            })
          }
        }
      }
      return
    }

    // Legacy direct event processing (for testing)
    const idempotencyKey = `${eventName}_${payload.data?.object?.id || payload.id}`
    const processed = await ctx.runMutation(internal.billing.markWebhookProcessed, {
      idempotencyKey,
      provider: 'stripe',
    })
    if (!processed) return

    const session: any = payload.data?.object

    if (eventName === 'checkout.session.completed' || eventName === 'checkout.session.async_payment_succeeded') {
      const mode = session?.mode || session?.metadata?.mode
      const uid = session?.client_reference_id || session?.metadata?.uid

      if (!uid) return

      if (mode === 'subscription') {
        const subscriptionId = session?.subscription || session?.id
        const planId = session?.metadata?.price_id || ''
        const tier = session?.metadata?.tier

        await ctx.runMutation(internal.billing.upsertSubscription, {
          userId: uid,
          provider: 'stripe',
          status: 'active',
          planId,
          stripeSubscriptionId: String(subscriptionId),
          stripeCheckoutSessionId: session?.id,
          rawStatus: session?.status,
        })

        if (tier === 'early_adopter') {
          await ctx.runMutation(internal.billing.incrementEarlyAdopterCount, { userId: uid })
        }
      } else if (mode === 'payment') {
        const pack = session?.metadata?.pack
        const credits = pack === '10' ? 10 : pack === '3' ? 3 : 0
        if (credits > 0) {
          await ctx.runMutation(internal.billing.addUserCredits, {
            userId: uid,
            amount: credits,
            paymentRef: session?.payment_intent || session?.id,
          })
        }
      }
    }
  },
})
