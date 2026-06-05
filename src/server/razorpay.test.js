import { afterEach, describe, expect, it } from 'vitest'
import { __setRazorpayTestOverrides, razorpayStartHandler } from './razorpay.js'

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

describe('razorpayStartHandler partner coupons', () => {
  afterEach(() => {
    __setRazorpayTestOverrides(null)
    delete process.env.SHIP_FAST_PARTNER_COUPONS
  })

  it('passes Razorpay offer and coupon notes to subscription checkout', async () => {
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
            return { id: 'sub_123' }
          },
        },
      },
    })

    const res = createRes()
    await razorpayStartHandler(
      {
        body: { mode: 'subscription', tier: 'pro', couponCode: 'partner20' },
        user: { uid: 'user_1', email: 'buyer@example.com' },
      },
      res,
    )

    expect(res.statusCode).toBe(200)
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
    expect(res.body).toMatchObject({
      key_id: 'rzp_test',
      subscription_id: 'sub_123',
      coupon: { code: 'PARTNER20', percentOff: 20 },
    })
  })

  it('passes Razorpay offer and coupon notes to credit-pack checkout', async () => {
    setPartnerCoupons()
    let orderPayload = null
    __setRazorpayTestOverrides({
      keyId: 'rzp_test',
      keySecret: 'secret',
      credits10Paise: 10000,
      client: {
        orders: {
          create: async (payload) => {
            orderPayload = payload
            return { id: 'order_123', amount: payload.amount, currency: payload.currency }
          },
        },
      },
    })

    const res = createRes()
    await razorpayStartHandler(
      {
        body: { mode: 'credit_pack', packId: '10_credits', couponCode: 'PARTNER20' },
        user: { uid: 'user_2', email: 'buyer@example.com' },
      },
      res,
    )

    expect(res.statusCode).toBe(200)
    expect(orderPayload).toMatchObject({
      amount: 10000,
      currency: 'INR',
      offer_id: 'offer_partner20',
      notes: {
        uid: 'user_2',
        pack: '10',
        coupon_code: 'PARTNER20',
        coupon_percent_off: '20',
      },
    })
    expect(res.body).toMatchObject({
      key_id: 'rzp_test',
      order_id: 'order_123',
      coupon: { code: 'PARTNER20', percentOff: 20 },
    })
  })

  it('rejects invalid coupons before creating provider checkout objects', async () => {
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

    const res = createRes()
    await razorpayStartHandler(
      {
        body: { mode: 'subscription', tier: 'pro', couponCode: 'NOPE' },
        user: { uid: 'user_1', email: 'buyer@example.com' },
      },
      res,
    )

    expect(res.statusCode).toBe(400)
    expect(res.body).toMatchObject({ code: 'INVALID_COUPON' })
    expect(createCalls).toBe(0)
  })
})
