/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import type { WithoutSystemFields } from 'convex/server'
import { describe, expect, it, vi } from 'vitest'

import type { Doc } from '../_generated/dataModel'
import schema from '../schema'
import { deliverDubOutboxEvent, DubTerminalDeliveryError } from './dub_outbox'
import type { DubDeliveryClient } from './dub_outbox'

const modules = import.meta.glob('../**/*.ts')

const base = Object.freeze({
  attemptCount: 1,
  createdAt: 100,
  nextAttemptAt: 100,
  status: 'processing',
  updatedAt: 100,
  userId: 'https://clerk.test|alice',
})

async function createEvent(
  value: WithoutSystemFields<Doc<'dubEventOutbox'>>,
): Promise<Doc<'dubEventOutbox'>> {
  const t = convexTest(schema, modules)
  const event = await t.run(async (ctx) => {
    const eventId = await ctx.db.insert('dubEventOutbox', value)
    return await ctx.db.get(eventId)
  })
  if (!event) throw new Error('Expected a persisted Dub event')
  return event
}

function createClient(): DubDeliveryClient {
  return {
    commissions: {
      list: vi.fn(async () => ({ result: [] })),
      update: vi.fn(async () => ({})),
    },
    track: {
      lead: vi.fn(async () => ({})),
      sale: vi.fn(async () => ({})),
    },
  }
}

describe('Dub outbox delivery', () => {
  it('delivers a lead with the canonical customer identity', async () => {
    const client = createClient()
    const event = await createEvent({
      ...base,
      clickId: 'click_123',
      customerAvatar: 'https://example.com/avatar.png',
      customerEmail: 'alice@example.com',
      customerName: 'Alice',
      idempotencyKey: 'dub:lead:https://clerk.test|alice',
      kind: 'lead',
    })

    await deliverDubOutboxEvent(event, client)

    expect(client.track.lead).toHaveBeenCalledWith({
      clickId: 'click_123',
      customerAvatar: 'https://example.com/avatar.png',
      customerEmail: 'alice@example.com',
      customerExternalId: 'https://clerk.test|alice',
      customerName: 'Alice',
      eventName: 'Partner signup',
    })
  })

  it('delivers a Razorpay sale with invoice idempotency metadata', async () => {
    const client = createClient()
    const event = await createEvent({
      ...base,
      amount: 4900,
      currency: 'inr',
      idempotencyKey: 'dub:sale:razorpay:inv_123',
      invoiceId: 'inv_123',
      kind: 'sale',
      paymentProcessor: 'custom',
      provider: 'razorpay',
      providerPaymentId: 'pay_123',
      providerSubscriptionId: 'sub_123',
    })

    await deliverDubOutboxEvent(event, client)

    expect(client.track.sale).toHaveBeenCalledWith({
      amount: 4900,
      currency: 'inr',
      customerExternalId: 'https://clerk.test|alice',
      eventName: 'Invoice paid',
      invoiceId: 'inv_123',
      metadata: {
        paymentId: 'pay_123',
        provider: 'razorpay',
        providerSubscriptionId: 'sub_123',
      },
      paymentProcessor: 'custom',
    })
  })

  it('refunds an unpaid commission and treats an existing refund as done', async () => {
    const client = createClient()
    const event = await createEvent({
      ...base,
      amount: 4900,
      currency: 'inr',
      idempotencyKey: 'dub:refund:razorpay:rfnd_123',
      invoiceId: 'inv_123',
      kind: 'refund',
      provider: 'razorpay',
      providerPaymentId: 'pay_123',
      remainingAmount: 0,
      refundId: 'rfnd_123',
    })
    vi.mocked(client.commissions.list).mockResolvedValueOnce({
      result: [
        {
          amount: 4900,
          currency: 'inr',
          id: 'comm_123',
          status: 'processed',
        },
      ],
    })

    await deliverDubOutboxEvent(event, client)
    expect(client.commissions.update).toHaveBeenCalledWith({
      id: 'comm_123',
      requestBody: { status: 'refunded' },
    })

    vi.mocked(client.commissions.list).mockResolvedValueOnce({
      result: [
        {
          amount: 0,
          currency: 'inr',
          id: 'comm_123',
          status: 'refunded',
        },
      ],
    })
    vi.mocked(client.commissions.update).mockClear()

    await deliverDubOutboxEvent(event, client)
    expect(client.commissions.update).not.toHaveBeenCalled()
  })

  it('sets an absolute remaining sale amount for partial refunds without replaying or increasing it', async () => {
    const client = createClient()
    const event = await createEvent({
      ...base,
      amount: 1200,
      currency: 'inr',
      idempotencyKey: 'dub:refund:razorpay:rfnd_partial',
      invoiceId: 'inv_partial',
      kind: 'refund',
      provider: 'razorpay',
      providerPaymentId: 'pay_partial',
      remainingAmount: 3700,
      refundId: 'rfnd_partial',
    })
    vi.mocked(client.commissions.list).mockResolvedValueOnce({
      result: [
        {
          amount: 4900,
          currency: 'inr',
          id: 'comm_partial',
          status: 'processed',
        },
      ],
    })

    await deliverDubOutboxEvent(event, client)
    expect(client.commissions.update).toHaveBeenCalledWith({
      id: 'comm_partial',
      requestBody: { currency: 'inr', saleAmount: 3700 },
    })

    for (const amount of [3700, 2500]) {
      vi.mocked(client.commissions.list).mockResolvedValueOnce({
        result: [
          {
            amount,
            currency: 'inr',
            id: 'comm_partial',
            status: 'processed',
          },
        ],
      })
      vi.mocked(client.commissions.update).mockClear()

      await deliverDubOutboxEvent(event, client)
      expect(client.commissions.update).not.toHaveBeenCalled()
    }
  })

  it('marks a paid commission as a terminal manual-recovery failure', async () => {
    const client = createClient()
    const event = await createEvent({
      ...base,
      amount: 4900,
      currency: 'inr',
      idempotencyKey: 'dub:refund:razorpay:rfnd_paid',
      invoiceId: 'inv_paid',
      kind: 'refund',
      provider: 'razorpay',
      remainingAmount: 0,
      refundId: 'rfnd_paid',
    })
    vi.mocked(client.commissions.list).mockResolvedValueOnce({
      result: [
        {
          amount: 4900,
          currency: 'inr',
          id: 'comm_paid',
          status: 'paid',
        },
      ],
    })

    await expect(deliverDubOutboxEvent(event, client)).rejects.toEqual(
      expect.objectContaining<DubTerminalDeliveryError>({
        message: 'Paid Dub commission comm_paid requires manual recovery',
        name: 'DubTerminalDeliveryError',
        terminal: true,
      }),
    )
    expect(client.commissions.update).not.toHaveBeenCalled()
  })
})
