'use node'

import { action } from './_generated/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return null
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export const createCreditPackOrder = action({
  args: {
    userId: v.string(),
    packId: v.union(v.literal('3_credits'), v.literal('10_credits')),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const rzp = getRazorpay()
    if (!rzp) throw new Error('Razorpay is not configured')

    const receipt = `sf_${args.userId}_${Date.now()}`.slice(0, 40)
    const order = await rzp.orders.create({
      amount: args.amount,
      currency: 'INR',
      receipt,
      notes: { uid: args.userId, pack: args.packId === '10_credits' ? '10' : '3' },
    })

    return {
      key_id: process.env.RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
    }
  },
})

export const createSubscription = action({
  args: {
    userId: v.string(),
    planId: v.string(),
    tier: v.union(v.literal('pro'), v.literal('early_adopter')),
  },
  handler: async (ctx, args) => {
    const rzp = getRazorpay()
    if (!rzp) throw new Error('Razorpay is not configured')

    const sub = await rzp.subscriptions.create({
      plan_id: args.planId,
      total_count: 120,
      quantity: 1,
      notes: { uid: args.userId, tier: args.tier },
    })

    return {
      key_id: process.env.RAZORPAY_KEY_ID,
      subscription_id: sub.id,
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
    // Validate signature if provided
    if (rawSig && webhookSecret) {
      const bodyString = JSON.stringify(payload)
      const expectedSig = crypto.createHmac('sha256', webhookSecret).update(bodyString).digest('hex')
      if (rawSig !== expectedSig) {
        throw new Error('Invalid signature')
      }
    }

    const idempotencyKey = `${eventName}_${payload.payment?.entity?.id || payload.subscription?.entity?.id}`
    const processed = await ctx.runMutation(internal.billing.markWebhookProcessed, {
      idempotencyKey,
      provider: 'razorpay',
    })
    if (!processed) return

    switch (eventName) {
      case 'payment.captured': {
        const pay = payload.payment?.entity
        if (!pay?.notes?.uid || !pay.notes.pack) return
        const credits = pay.notes.pack === '10' ? 10 : 3
        await ctx.runMutation(internal.billing.addUserCredits, {
          userId: pay.notes.uid,
          amount: credits,
          paymentRef: pay.id,
        })
        break
      }

      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = payload.subscription?.entity
        if (!sub?.notes?.uid) return
        await ctx.runMutation(internal.billing.upsertSubscription, {
          userId: sub.notes.uid,
          provider: 'razorpay',
          status: 'active',
          planId: sub.plan_id,
          razorpaySubscriptionId: sub.id,
          rawStatus: sub.status,
        })

        if (sub.plan_id === process.env.RAZORPAY_EARLY_ADOPTER_PLAN_ID) {
          await ctx.runMutation(internal.billing.incrementEarlyAdopterCount, {
            userId: sub.notes.uid,
          })
        }
        break
      }

      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.halted': {
        const sub = payload.subscription?.entity
        if (!sub?.notes?.uid) return
        await ctx.runMutation(internal.billing.upsertSubscription, {
          userId: sub.notes.uid,
          provider: 'razorpay',
          status: 'cancelled',
          planId: sub.plan_id,
          razorpaySubscriptionId: sub.id,
          rawStatus: sub.status,
        })
        break
      }

      case 'refund.processed':
      case 'refund.created': {
        const refund = payload.refund?.entity
        if (!refund?.payment_id) return
        try {
          const rzp = getRazorpay()
          if (!rzp) return
          const payment = await rzp.payments.fetch(refund.payment_id)
          if (payment?.notes?.uid && (payment.notes.pack === '3' || payment.notes.pack === '10')) {
            await ctx.runMutation(internal.billing.zeroUserCredits, {
              userId: payment.notes.uid,
            })
          }
        } catch (err) {
          console.error('[razorpay/refund]', (err as Error)?.message ?? err)
        }
        break
      }
    }
  },
})
