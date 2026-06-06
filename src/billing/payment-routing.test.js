import { describe, expect, it } from 'vitest'
import {
  isGatewayConfigured,
  resolvePaymentCurrency,
  resolvePaymentGateway,
} from './payment-routing.js'

describe('payment routing', () => {
  it('routes India to Razorpay for UPI support', () => {
    expect(resolvePaymentGateway('IN')).toBe('razorpay')
    expect(resolvePaymentCurrency('razorpay')).toBe('inr')
  })

  it('routes non-India users to Stripe for international checkout', () => {
    expect(resolvePaymentGateway('US')).toBe('stripe')
    expect(resolvePaymentGateway('GLOBAL')).toBe('stripe')
    expect(resolvePaymentCurrency('stripe')).toBe('usd')
  })

  it('reports provider configuration from environment', () => {
    expect(
      isGatewayConfigured('razorpay', {
        RAZORPAY_KEY_ID: 'key',
        RAZORPAY_KEY_SECRET: 'secret',
        RAZORPAY_PRO_PLAN_ID: 'plan',
      }),
    ).toBe(true)
    expect(
      isGatewayConfigured('stripe', {
        STRIPE_SECRET_KEY: 'sk_test',
        STRIPE_PRO_PRICE_ID: 'price_pro',
      }),
    ).toBe(true)
    expect(isGatewayConfigured('stripe', { STRIPE_SECRET_KEY: 'sk_test' })).toBe(false)
  })
})
