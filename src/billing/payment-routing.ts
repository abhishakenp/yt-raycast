export type PaymentGateway = 'razorpay'
export type PaymentCurrency = 'inr'

export const resolvePaymentGateway = (
  _countryCode?: string | null,
): PaymentGateway => 'razorpay'

export const resolvePaymentCurrency = (
  _gateway: PaymentGateway,
): PaymentCurrency => 'inr'

export const isGatewayConfigured = (
  _gateway: PaymentGateway,
  env: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
): boolean => {
  return Boolean(
    env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_PRO_PLAN_ID,
  )
}
