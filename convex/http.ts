import { httpRouter } from 'convex/server'
import { internal, api } from './_generated/api'

const http = httpRouter()

http.route({
  path: '/stripe-webhook',
  method: 'POST',
  // @ts-expect-error - httpRouter handler types are strict
  handler: async (ctx, request) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return new Response('Stripe webhook not configured', { status: 503 })
    }

    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    try {
      await ctx.runAction(api.stripe, {
        eventName: 'raw',
        payload: { body, sig, webhookSecret },
      })
      return new Response('OK', { status: 200 })
    } catch (err) {
      console.error('[stripe/webhook]', (err as Error).message)
      return new Response('Webhook handler failed', { status: 500 })
    }
  },
})

http.route({
  path: '/razorpay-webhook',
  method: 'POST',
  // @ts-expect-error - httpRouter handler types are strict
  handler: async (ctx, request) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      return new Response('Razorpay webhook not configured', { status: 503 })
    }

    const body = await request.text()
    const sig = request.headers.get('x-razorpay-signature') || request.headers.get('X-Razorpay-Signature')

    if (!sig) {
      return new Response('Missing signature', { status: 400 })
    }

    let payload
    try {
      payload = JSON.parse(body)
    } catch {
      return new Response('Invalid JSON', { status: 400 })
    }

    const eventName = payload.event
    if (!eventName) return new Response('Missing event', { status: 400 })
    if (payload.payload == null) return new Response('Missing payload', { status: 400 })

    try {
      await ctx.runAction(api.razorpay, {
        eventName,
        payload: payload.payload,
        rawSig: sig,
        webhookSecret,
      })
      return new Response('OK', { status: 200 })
    } catch (err) {
      console.error('[razorpay/webhook]', eventName, (err as Error).message)
      return new Response('Webhook handler failed', { status: 500 })
    }
  },
})

export default http
