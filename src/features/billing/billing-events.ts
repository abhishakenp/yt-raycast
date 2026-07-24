export const billingStatusChangedEventName = 'ship-fast:billing-status-changed'

export const dispatchBillingStatusChanged = (): void => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(billingStatusChangedEventName))
}
