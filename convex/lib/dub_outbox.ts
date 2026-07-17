import type { Doc } from '../_generated/dataModel'

export const DUB_RETRY_DELAYS_MS = Object.freeze([
  60_000, 300_000, 1_800_000, 7_200_000, 21_600_000, 43_200_000, 86_400_000,
  172_800_000,
])

export function getDubRetryDelayMs(attemptCount: number): number | null {
  return DUB_RETRY_DELAYS_MS[attemptCount - 1] ?? null
}

type DubLeadInput = {
  clickId: string
  customerExternalId: string
  customerName?: string
  customerEmail?: string
  customerAvatar?: string
  eventName: string
}

type DubSaleInput = {
  amount: number
  currency: string
  customerExternalId: string
  eventName: string
  invoiceId: string
  metadata: Record<string, unknown>
  paymentProcessor: 'custom'
}

type DubCommissionStatus =
  | 'pending'
  | 'processed'
  | 'paid'
  | 'refunded'
  | 'duplicate'
  | 'fraud'
  | 'canceled'

export type DubDeliveryClient = {
  track: {
    lead: (input: DubLeadInput) => Promise<unknown>
    sale: (input: DubSaleInput) => Promise<unknown>
  }
  commissions: {
    list: (input: { invoiceId: string; pageSize?: number }) => Promise<{
      result: Array<{
        amount: number
        currency: string
        id: string
        status: DubCommissionStatus
      }>
    }>
    update: (input: {
      id: string
      requestBody:
        | { status: 'refunded' }
        | { currency: string; saleAmount: number }
    }) => Promise<unknown>
  }
}

export class DubTerminalDeliveryError extends Error {
  override readonly name = 'DubTerminalDeliveryError'
  readonly terminal = true
}

export async function deliverDubOutboxEvent(
  event: Doc<'dubEventOutbox'>,
  client: DubDeliveryClient,
): Promise<void> {
  if (event.kind === 'lead') {
    await client.track.lead({
      clickId: event.clickId,
      customerExternalId: event.userId,
      eventName: 'Partner signup',
      ...(event.customerName ? { customerName: event.customerName } : {}),
      ...(event.customerEmail ? { customerEmail: event.customerEmail } : {}),
      ...(event.customerAvatar ? { customerAvatar: event.customerAvatar } : {}),
    })
    return
  }

  if (event.kind === 'sale') {
    await client.track.sale({
      amount: event.amount,
      currency: event.currency,
      customerExternalId: event.userId,
      eventName: 'Invoice paid',
      invoiceId: event.invoiceId,
      metadata: {
        provider: event.provider,
        providerSubscriptionId: event.providerSubscriptionId,
        ...(event.providerPaymentId
          ? { paymentId: event.providerPaymentId }
          : {}),
      },
      paymentProcessor: event.paymentProcessor,
    })
    return
  }

  const commissions = await client.commissions.list({
    invoiceId: event.invoiceId,
    pageSize: 1,
  })
  const commission = commissions.result[0]
  if (!commission) {
    throw new Error(`Dub commission not found for invoice ${event.invoiceId}`)
  }
  if (commission.status === 'refunded') return
  if (commission.status === 'paid') {
    throw new DubTerminalDeliveryError(
      `Paid Dub commission ${commission.id} requires manual recovery`,
    )
  }

  if (event.remainingAmount > 0) {
    if (commission.amount <= event.remainingAmount) return
    await client.commissions.update({
      id: commission.id,
      requestBody: {
        currency: event.currency,
        saleAmount: event.remainingAmount,
      },
    })
    return
  }

  await client.commissions.update({
    id: commission.id,
    requestBody: { status: 'refunded' },
  })
}
