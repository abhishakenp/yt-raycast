import { afterEach, describe, expect, it } from 'vitest'
import { __setStripeTestOverrides, stripeStartHandler } from './stripe.js'

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

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

describe('stripeStartHandler', () => {
  afterEach(() => {
    __setStripeTestOverrides(null)
    delete process.env.SHIP_FAST_PARTNER_COUPONS
  })

  it('creates an international subscription Checkout Session with partner coupon', async () => {
    setPartnerCoupons()
    let checkoutPayload = null
    __setStripeTestOverrides({
      secretKey: 'sk_test',
      proPriceId: 'price_pro',
      client: {
        checkout: {
          sessions: {
            create: async (payload) => {
              checkoutPayload = payload
              return { id: 'cs_sub', url: 'https://checkout.stripe.test/sub' }
            },
          },
        },
      },
    })

    const res = createRes()
    await stripeStartHandler(
      {
        body: { mode: 'subscription', tier: 'pro', couponCode: 'partner20', sessionId: 'abc123' },
        headers: { origin: 'https://ship-fast.io' },
        user: { uid: 'user_1', email: 'buyer@example.com' },
      },
      res,
    )

    expect(res.statusCode).toBe(200)
    expect(checkoutPayload).toMatchObject({
      mode: 'subscription',
      line_items: [{ price: 'price_pro', quantity: 1 }],
      client_reference_id: 'user_1',
      customer_email: 'buyer@example.com',
      discounts: [{ promotion_code: 'promo_partner20' }],
      metadata: {
        uid: 'user_1',
        provider: 'stripe',
        mode: 'subscription',
        tier: 'pro',
        price_id: 'price_pro',
        coupon_code: 'PARTNER20',
        coupon_percent_off: '20',
      },
      success_url: 'https://ship-fast.io/session/abc123?checkout=stripe_success',
      cancel_url: 'https://ship-fast.io/session/abc123?checkout=stripe_cancelled',
    })
    expect(res.body).toMatchObject({
      provider: 'stripe',
      checkout_session_id: 'cs_sub',
      url: 'https://checkout.stripe.test/sub',
      coupon: { code: 'PARTNER20', percentOff: 20 },
    })
  })

  it('creates a credit-pack Checkout Session', async () => {
    let checkoutPayload = null
    __setStripeTestOverrides({
      secretKey: 'sk_test',
      credits10PriceId: 'price_credits_10',
      client: {
        checkout: {
          sessions: {
            create: async (payload) => {
              checkoutPayload = payload
              return { id: 'cs_pack', url: 'https://checkout.stripe.test/pack' }
            },
          },
        },
      },
    })

    const res = createRes()
    await stripeStartHandler(
      {
        body: { mode: 'credit_pack', packId: '10_credits' },
        headers: { origin: 'https://ship-fast.io' },
        user: { uid: 'user_2', email: 'buyer@example.com' },
      },
      res,
    )

    expect(res.statusCode).toBe(200)
    expect(checkoutPayload).toMatchObject({
      mode: 'payment',
      line_items: [{ price: 'price_credits_10', quantity: 1 }],
      metadata: {
        uid: 'user_2',
        mode: 'credit_pack',
        pack: '10',
        price_id: 'price_credits_10',
      },
    })
    expect(res.body).toMatchObject({
      provider: 'stripe',
      checkout_session_id: 'cs_pack',
      url: 'https://checkout.stripe.test/pack',
    })
  })

  it('rejects invalid coupons before creating Checkout Sessions', async () => {
    setPartnerCoupons()
    let createCalls = 0
    __setStripeTestOverrides({
      secretKey: 'sk_test',
      proPriceId: 'price_pro',
      client: {
        checkout: {
          sessions: {
            create: async () => {
              createCalls += 1
              return { id: 'cs_should_not_exist' }
            },
          },
        },
      },
    })

    const res = createRes()
    await stripeStartHandler(
      {
        body: { mode: 'subscription', tier: 'pro', couponCode: 'NOPE' },
        headers: { origin: 'https://ship-fast.io' },
        user: { uid: 'user_1', email: 'buyer@example.com' },
      },
      res,
    )

    expect(res.statusCode).toBe(400)
    expect(res.body).toMatchObject({ code: 'INVALID_COUPON' })
    expect(createCalls).toBe(0)
  })
})
