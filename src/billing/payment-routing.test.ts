import { describe, expect, it } from 'vitest'

import {
  isGatewayConfigured,
  resolvePaymentCurrency,
  resolvePaymentGateway,
} from './payment-routing'

describe('payment routing', () => {
  it('routes Indian country hints to Razorpay and all other hints to Stripe', () => {
    expect(resolvePaymentGateway('IN')).toBe('razorpay')
    expect(resolvePaymentGateway('in')).toBe('razorpay')
    expect(resolvePaymentGateway(' In ')).toBe('stripe')
    expect(resolvePaymentGateway('US')).toBe('stripe')
    expect(resolvePaymentGateway('GLOBAL')).toBe('stripe')
    expect(resolvePaymentGateway(null)).toBe('stripe')
    expect(resolvePaymentGateway(undefined)).toBe('stripe')
  })

  it('keeps each gateway paired with its checkout currency', () => {
    expect(resolvePaymentCurrency('stripe')).toBe('usd')
    expect(resolvePaymentCurrency('razorpay')).toBe('inr')
  })

  it('requires the gateway-specific secret and plan configuration', () => {
    expect(
      isGatewayConfigured('stripe', {
        STRIPE_SECRET_KEY: 'sk_test',
        STRIPE_PRO_PRICE_ID: 'price_pro',
      }),
    ).toBe(true)
    expect(
      isGatewayConfigured('stripe', {
        STRIPE_SECRET_KEY: 'sk_test',
      }),
    ).toBe(false)

    expect(
      isGatewayConfigured('razorpay', {
        RAZORPAY_KEY_ID: 'rzp_key',
        RAZORPAY_KEY_SECRET: 'rzp_secret',
        RAZORPAY_PRO_PLAN_ID: 'plan_pro',
      }),
    ).toBe(true)
    expect(
      isGatewayConfigured('razorpay', {
        RAZORPAY_KEY_ID: 'rzp_key',
        RAZORPAY_KEY_SECRET: 'rzp_secret',
      }),
    ).toBe(false)
  })
})
