export type PaymentGateway = 'stripe' | 'razorpay'
export type PaymentCurrency = 'usd' | 'inr'

const INDIA_COUNTRY_CODE = 'IN'

export const resolvePaymentGateway = (countryCode: string | null | undefined): PaymentGateway =>
  String(countryCode || '').toUpperCase() === INDIA_COUNTRY_CODE ? 'razorpay' : 'stripe'

export const resolvePaymentCurrency = (gateway: PaymentGateway): PaymentCurrency =>
  gateway === 'stripe' ? 'usd' : 'inr'

export const isGatewayConfigured = (
  gateway: PaymentGateway,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): boolean => {
  if (gateway === 'stripe') {
    return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRO_PRICE_ID)
  }
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_PRO_PLAN_ID)
}
