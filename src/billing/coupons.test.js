import { describe, expect, it } from 'vitest'
import { getPartnerCoupons, validatePartnerCoupon } from './coupons.js'

describe('partner coupons', () => {
  it('parses JSON coupon config with gateway IDs', () => {
    const env = {
      SHIP_FAST_PARTNER_COUPONS: JSON.stringify([
        {
          code: 'partner20',
          percentOff: 20,
          razorpayOfferId: 'offer_rzp',
          stripePromotionCode: 'promo_stripe',
        },
      ]),
    }

    expect(getPartnerCoupons(env)).toEqual([
      {
        code: 'PARTNER20',
        percentOff: 20,
        label: '20% partner discount',
        razorpayOfferId: 'offer_rzp',
        stripePromotionCode: 'promo_stripe',
        active: true,
      },
    ])
  })

  it('validates active provider-specific coupons', () => {
    const env = {
      SHIP_FAST_PARTNER_COUPONS:
        '[{"code":"SHIP25","percentOff":25,"razorpayOfferId":"offer_25","stripePromotionCode":"promo_25"}]',
    }

    expect(
      validatePartnerCoupon(' ship25 ', { provider: 'razorpay', env }),
    ).toMatchObject({
      ok: true,
      code: 'SHIP25',
      percentOff: 25,
      providerCouponId: 'offer_25',
    })
    expect(
      validatePartnerCoupon('SHIP25', { provider: 'stripe', env }),
    ).toMatchObject({
      ok: true,
      providerCouponId: 'promo_25',
    })
  })

  it('rejects unknown or provider-incomplete coupons', () => {
    const env = {
      SHIP_FAST_PARTNER_COUPONS:
        '[{"code":"SHIP25","percentOff":25,"razorpayOfferId":"offer_25"}]',
    }

    expect(
      validatePartnerCoupon('missing', { provider: 'razorpay', env }),
    ).toMatchObject({
      ok: false,
      error: 'Coupon code is not valid.',
    })
    expect(
      validatePartnerCoupon('SHIP25', { provider: 'stripe', env }),
    ).toMatchObject({
      ok: false,
      error: 'Coupon is not configured for stripe.',
    })
  })
})
