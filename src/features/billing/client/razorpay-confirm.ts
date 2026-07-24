import {
  billingStatusChangedEventName,
  dispatchBillingStatusChanged,
} from '@/features/billing/billing-events'

export { billingStatusChangedEventName }

export type RazorpaySubscriptionPaymentResponse = {
  razorpay_payment_id?: string
  razorpay_subscription_id?: string
  razorpay_signature?: string
}

type ConfirmedSubscription = {
  active: boolean
  status: string
  planId: string
  providerSubscriptionId: string
}

type ConfirmResponse = {
  error?: string
  provider?: string
  subscription?: ConfirmedSubscription
}

export const confirmRazorpaySubscriptionPayment = async (
  token: string,
  response: RazorpaySubscriptionPaymentResponse,
): Promise<ConfirmedSubscription> => {
  const subscriptionId = response.razorpay_subscription_id
  const paymentId = response.razorpay_payment_id
  const signature = response.razorpay_signature

  if (!subscriptionId || !paymentId || !signature) {
    throw new Error('Razorpay payment confirmation is incomplete.')
  }

  const confirmResponse = await fetch('/api/payments/razorpay/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriptionId,
      paymentId,
      signature,
    }),
  })
  const data = (await confirmResponse
    .json()
    .catch(() => ({}))) as ConfirmResponse

  if (!confirmResponse.ok || !data.subscription) {
    throw new Error(data.error ?? 'Razorpay payment confirmation failed.')
  }

  dispatchBillingStatusChanged()
  return data.subscription
}
