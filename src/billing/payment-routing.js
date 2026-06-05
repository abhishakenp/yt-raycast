const INDIA_COUNTRY_CODE = 'IN'

export function resolvePaymentGateway(countryCode) {
  return String(countryCode || '').toUpperCase() === INDIA_COUNTRY_CODE ? 'razorpay' : 'stripe'
}

export function resolvePaymentCurrency(gateway) {
  return gateway === 'stripe' ? 'usd' : 'inr'
}

export function isGatewayConfigured(gateway, env = process.env) {
  if (gateway === 'stripe') {
    return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRO_PRICE_ID)
  }
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_PRO_PLAN_ID)
}
