import { describe, expect, test } from 'vitest'

import type { CommercePaymentSession, CommerceStoreRef } from '../contracts'
import {
  MedusaCheckoutNormalizationError,
  normalizeMedusaCart,
  normalizeMedusaOrder,
  normalizeMedusaPaymentAction,
  normalizeMedusaPaymentProviders,
  normalizeMedusaPaymentSessions,
  normalizeMedusaShippingOptions,
} from './medusa-store-checkout'

const store = {
  deploymentSlug: 'trusted-store',
  kind: 'deployments',
} satisfies CommerceStoreRef

const medusaLine = {
  id: 'item_real_123',
  product: {
    handle: 'provider-handle',
    id: 'prod_real_123',
    metadata: {
      ship_fast_generated_handle: 'linen-shirt',
      ship_fast_generated_source_id: 'product_linen',
    },
    title: 'Linen Shirt',
  },
  product_handle: 'provider-handle',
  product_id: 'prod_real_123',
  product_title: 'Linen Shirt',
  quantity: 2,
  thumbnail: 'https://cdn.example.com/linen.jpg',
  total: 58,
  unit_price: 29,
  variant: {
    id: 'variant_real_123',
    metadata: {
      ship_fast_generated_source_id: 'variant_linen_m',
    },
    options: [
      {
        option: { title: 'Size' },
        value: 'Medium',
      },
    ],
    sku: 'LINEN-M',
    title: 'Medium',
  },
  variant_id: 'variant_real_123',
  variant_sku: 'LINEN-M',
  variant_title: 'Medium',
}

describe('normalizeMedusaCart', () => {
  test('preserves major-unit totals and real line identities', () => {
    expect(
      normalizeMedusaCart(store, {
        currency_code: 'USD',
        discount_total: 3,
        id: 'cart_real_123',
        items: [medusaLine],
        region_id: 'reg_123',
        shipping_total: 5,
        status: 'open',
        subtotal: 58,
        tax_total: 4.5,
        total: 64.5,
      }),
    ).toEqual({
      currencyCode: 'usd',
      discountTotal: { amount: 3, currencyCode: 'usd' },
      id: 'cart_real_123',
      lines: [
        {
          id: 'item_real_123',
          product: {
            handle: 'linen-shirt',
            sourceId: 'product_linen',
            thumbnail: 'https://cdn.example.com/linen.jpg',
            title: 'Linen Shirt',
          },
          quantity: 2,
          total: { amount: 58, currencyCode: 'usd' },
          unitPrice: { amount: 29, currencyCode: 'usd' },
          variant: {
            calculatedPrice: { amount: 29, currencyCode: 'usd' },
            id: 'variant_real_123',
            manageInventory: false,
            optionValues: { Size: 'Medium' },
            prices: [{ amount: 29, currencyCode: 'usd' }],
            sku: 'LINEN-M',
            sourceId: 'variant_linen_m',
            title: 'Medium',
          },
        },
      ],
      regionId: 'reg_123',
      shippingTotal: { amount: 5, currencyCode: 'usd' },
      status: 'active',
      store,
      subtotal: { amount: 58, currencyCode: 'usd' },
      taxTotal: { amount: 4.5, currencyCode: 'usd' },
      total: { amount: 64.5, currencyCode: 'usd' },
    })
  })

  test('rejects oversized line collections with a stable safe failure', () => {
    expect(() =>
      normalizeMedusaCart(store, {
        currency_code: 'usd',
        id: 'cart_123',
        items: Array.from({ length: 101 }, () => medusaLine),
        subtotal: 0,
        total: 0,
      }),
    ).toThrowError(
      expect.objectContaining({
        code: 'MEDUSA_CHECKOUT_PAYLOAD_TOO_LARGE',
        message: 'Medusa checkout payload exceeds safe limits.',
      }),
    )
  })
})

describe('checkout option normalization', () => {
  test('normalizes shipping options and payment providers', () => {
    expect(
      normalizeMedusaShippingOptions('usd', {
        shipping_options: [
          {
            amount: 12.5,
            id: 'so_express',
            name: 'Express',
            service_zone: { name: 'Private provider data' },
          },
        ],
      }),
    ).toEqual([
      {
        amount: { amount: 12.5, currencyCode: 'usd' },
        id: 'so_express',
        name: 'Express',
      },
    ])

    expect(
      normalizeMedusaPaymentProviders({
        payment_providers: [
          { id: 'pp_stripe_stripe', name: 'Stripe' },
          { id: 'pp_manual_manual', name: 'Manual' },
        ],
      }),
    ).toEqual([
      { id: 'pp_stripe_stripe', name: 'Stripe' },
      { id: 'pp_manual_manual', name: 'Manual' },
    ])
  })
})

describe('payment session normalization', () => {
  test('maps provider statuses and emits a safe client action', () => {
    const sessions = normalizeMedusaPaymentSessions({
      payment_sessions: [
        {
          data: {
            client_secret: 'client_secret_123',
            customer_email: 'private@example.com',
            error_message: 'Provider internals',
            payment_intent_id: 'pi_123',
          },
          id: 'payses_123',
          provider_id: 'pp_stripe_stripe',
          status: 'requires_more',
        },
      ],
    })

    expect(sessions).toEqual([
      {
        data: {
          client_secret: 'client_secret_123',
          payment_intent_id: 'pi_123',
        },
        id: 'payses_123',
        provider: 'pp_stripe_stripe',
        status: 'requires_action',
      },
    ])
    expect(normalizeMedusaPaymentAction(sessions[0])).toEqual({
      data: {
        client_secret: 'client_secret_123',
        payment_intent_id: 'pi_123',
      },
      provider: 'pp_stripe_stripe',
      type: 'client-session',
    })
  })

  test('accepts only bounded credential-free HTTP(S) redirects', () => {
    const validSession = {
      data: { redirect_url: 'https://pay.example.com/continue?id=123' },
      id: 'payses_redirect',
      provider: 'pp_redirect',
      status: 'requires_action',
    } satisfies CommercePaymentSession
    const credentialedSession = {
      ...validSession,
      data: { redirect_url: 'https://user:secret@pay.example.com/continue' },
    }

    expect(normalizeMedusaPaymentAction(validSession)).toEqual({
      type: 'redirect',
      url: 'https://pay.example.com/continue?id=123',
    })
    expect(() =>
      normalizeMedusaPaymentAction(credentialedSession),
    ).toThrowError(
      expect.objectContaining({
        code: 'MEDUSA_PAYMENT_ACTION_UNAVAILABLE',
        message: 'Payment action is unavailable.',
      }),
    )
  })

  test('fails safely when requires-action has no usable action', () => {
    expect(() =>
      normalizeMedusaPaymentAction({
        id: 'payses_empty',
        provider: 'pp_unknown',
        status: 'requires_action',
      }),
    ).toThrowError(
      expect.objectContaining({
        code: 'MEDUSA_PAYMENT_ACTION_UNAVAILABLE',
        message: 'Payment action is unavailable.',
      }),
    )
  })
})

describe('normalizeMedusaOrder', () => {
  test('binds trusted store identity and maps provider statuses without PII', () => {
    const order = normalizeMedusaOrder(store, 'cart_real_123', {
      cart_id: 'cart_real_123',
      currency_code: 'usd',
      display_id: 1042,
      email: 'private@example.com',
      fulfillment_status: 'partially_shipped',
      id: 'order_real_123',
      items: [medusaLine],
      payment_status: 'captured',
      provider_message: 'Internal provider detail',
      status: 'completed',
      subtotal: 58,
      total: 58,
    })

    expect(order).toMatchObject({
      displayId: '1042',
      fulfillmentStatus: 'partially_fulfilled',
      id: 'order_real_123',
      paymentStatus: 'captured',
      status: 'completed',
      store,
    })
    expect(JSON.stringify(order)).not.toContain('private@example.com')
    expect(JSON.stringify(order)).not.toContain('Internal provider detail')
  })

  test('rejects an order for another cart with a stable failure', () => {
    try {
      normalizeMedusaOrder(store, 'cart_expected', {
        cart_id: 'cart_other',
        currency_code: 'usd',
        id: 'order_123',
        items: [],
        status: 'pending',
        subtotal: 0,
        total: 0,
      })
      throw new Error('expected cart mismatch')
    } catch (error) {
      expect(error).toBeInstanceOf(MedusaCheckoutNormalizationError)
      if (!(error instanceof MedusaCheckoutNormalizationError)) throw error
      expect(error).toMatchObject({
        code: 'MEDUSA_ORDER_CART_MISMATCH',
        message: 'Order does not belong to the requested cart.',
      })
      expect(error.message).not.toContain('cart_other')
      expect(error.message).not.toContain('cart_expected')
    }
  })
})
