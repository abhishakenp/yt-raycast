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

  it('routes non-India users to Razorpay for international checkout', () => {
    expect(resolvePaymentGateway('US')).toBe('razorpay')
    expect(resolvePaymentGateway('GLOBAL')).toBe('razorpay')
    expect(resolvePaymentCurrency('razorpay')).toBe('inr')
  })

  it('reports provider configuration from environment', () => {
    expect(
      isGatewayConfigured('razorpay', {
        RAZORPAY_KEY_ID: 'key',
        RAZORPAY_KEY_SECRET: 'secret',
        RAZORPAY_PRO_PLAN_ID: 'plan',
      }),
    ).toBe(true)
    expect(isGatewayConfigured('razorpay', { RAZORPAY_KEY_ID: 'key' })).toBe(
      false,
    )
  })
})
