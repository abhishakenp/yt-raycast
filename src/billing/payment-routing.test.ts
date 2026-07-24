import { describe, expect, it } from 'vitest'

import {
  isGatewayConfigured,
  resolvePaymentCurrency,
  resolvePaymentGateway,
} from './payment-routing'

describe('payment routing', () => {
  it('routes every checkout to Razorpay', () => {
    expect(resolvePaymentGateway('IN')).toBe('razorpay')
    expect(resolvePaymentGateway('in')).toBe('razorpay')
    expect(resolvePaymentGateway('US')).toBe('razorpay')
    expect(resolvePaymentGateway('GLOBAL')).toBe('razorpay')
    expect(resolvePaymentGateway(null)).toBe('razorpay')
    expect(resolvePaymentGateway(undefined)).toBe('razorpay')
  })

  it('uses INR for checkout currency', () => {
    expect(resolvePaymentCurrency('razorpay')).toBe('inr')
  })

  it('requires Razorpay secret and plan configuration', () => {
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
