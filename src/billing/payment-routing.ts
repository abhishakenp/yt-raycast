export type PaymentGateway = 'stripe' | 'razorpay'
export type PaymentCurrency = 'usd' | 'inr'

const INDIA_COUNTRY_CODE = 'IN'

export function resolvePaymentGateway(
  countryCode: string | null | undefined,
): PaymentGateway {
  return String(countryCode || '').toUpperCase() === INDIA_COUNTRY_CODE
    ? 'razorpay'
    : 'stripe'
}

export function resolvePaymentCurrency(
  gateway: PaymentGateway,
): PaymentCurrency {
  return gateway === 'stripe' ? 'usd' : 'inr'
}

export function isGatewayConfigured(
  gateway: PaymentGateway,
  env: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
): boolean {
  if (gateway === 'stripe') {
    return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRO_PRICE_ID)
  }
  return Boolean(
    env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_PRO_PLAN_ID,
  )
}
