import { createServer } from 'node:http'
import express from 'express'
import { afterEach, describe, expect, it } from 'vitest'
import { __setRazorpayTestOverrides } from './razorpay.js'
import { __setStripeTestOverrides } from './stripe.js'
import { mountNextApiPort } from './next-api-port.js'

function setPartnerCoupons() {
  process.env.SHIP_FAST_PARTNER_COUPONS = JSON.stringify([
    {
      code: 'PARTNER20',
      percentOff: 20,
      razorpayOfferId: 'offer_partner20',
      stripePromotionCode: 'promo_partner20',
    },
  ])
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, () => {
      server.off('error', reject)
      resolve(server.address().port)
    })
  })
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()))
  })
}

async function withMountedApi(callback) {
  const app = express()
  app.use(express.json())
  const requireAuth = (req, _res, next) => {
    req.user = { uid: 'user_1', email: 'buyer@example.com' }
    next()
  }
  mountNextApiPort(app, { requireAuth })

  const server = createServer(app)
  const port = await listen(server)
  try {
    return await callback(`http://127.0.0.1:${port}`)
  } finally {
    await close(server)
  }
}

describe('mountNextApiPort Razorpay checkout route', () => {
  afterEach(() => {
    __setRazorpayTestOverrides(null)
    __setStripeTestOverrides(null)
    delete process.env.SHIP_FAST_PARTNER_COUPONS
  })

  it('uses the central Razorpay handler for subscription coupons and offers', async () => {
    setPartnerCoupons()
    let subscriptionPayload = null
    __setRazorpayTestOverrides({
      keyId: 'rzp_test',
      keySecret: 'secret',
      proPlanId: 'plan_pro',
      client: {
        subscriptions: {
          create: async (payload) => {
            subscriptionPayload = payload
            return { id: 'sub_route' }
          },
        },
      },
    })

    await withMountedApi(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/payments/razorpay/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'subscription',
          tier: 'pro',
          couponCode: 'partner20',
        }),
      })
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toMatchObject({
        key_id: 'rzp_test',
        subscription_id: 'sub_route',
        coupon: { code: 'PARTNER20', percentOff: 20 },
      })
      expect(subscriptionPayload).toMatchObject({
        plan_id: 'plan_pro',
        offer_id: 'offer_partner20',
        notes: {
          uid: 'user_1',
          coupon_code: 'PARTNER20',
          coupon_percent_off: '20',
        },
        notify_info: { notify_email: 'buyer@example.com' },
      })
    })
  })

  it('rejects invalid route coupons before creating Razorpay objects', async () => {
    setPartnerCoupons()
    let createCalls = 0
    __setRazorpayTestOverrides({
      keyId: 'rzp_test',
      keySecret: 'secret',
      proPlanId: 'plan_pro',
      client: {
        subscriptions: {
          create: async () => {
            createCalls += 1
            return { id: 'sub_should_not_exist' }
          },
        },
      },
    })

    await withMountedApi(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/payments/razorpay/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'subscription',
          tier: 'pro',
          couponCode: 'NOPE',
        }),
      })
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body).toMatchObject({ code: 'INVALID_COUPON' })
      expect(createCalls).toBe(0)
    })
  })

  it('mounts Stripe checkout start behind the same authenticated API port', async () => {
    let checkoutPayload = null
    __setStripeTestOverrides({
      secretKey: 'sk_test',
      proPriceId: 'price_pro',
      client: {
        checkout: {
          sessions: {
            create: async (payload) => {
              checkoutPayload = payload
              return { id: 'cs_route', url: 'https://checkout.stripe.test/route' }
            },
          },
        },
      },
    })

    await withMountedApi(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/payments/stripe/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://ship-fast.io',
        },
        body: JSON.stringify({
          mode: 'subscription',
          tier: 'pro',
          sessionId: 'abc123',
        }),
      })
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toMatchObject({
        provider: 'stripe',
        checkout_session_id: 'cs_route',
        url: 'https://checkout.stripe.test/route',
      })
      expect(checkoutPayload).toMatchObject({
        mode: 'subscription',
        line_items: [{ price: 'price_pro', quantity: 1 }],
        client_reference_id: 'user_1',
        success_url: 'https://ship-fast.io/session/abc123?checkout=stripe_success',
      })
    })
  })
})
