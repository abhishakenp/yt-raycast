import { describe, expect, test } from 'vitest'
import {
  decideCommerceOperationBegin,
  normalizeCommerceOperationResult,
  parseCommerceOperationResult,
  validateCommerceOperationFailureCode,
  validateCommerceOperationIdentity,
} from './commerce_operation_helpers'
import type { CommerceOperationSnapshot } from './commerce_operation_helpers'

const HASH_A = 'a'.repeat(64)
const HASH_B = 'b'.repeat(64)

describe('commerce operation identity', () => {
  test('accepts bounded identifiers and SHA-256 hashes', () => {
    expect(
      validateCommerceOperationIdentity({
        tenant: 'session_123',
        cartId: 'cart_123',
        idempotencyKeyHash: HASH_A,
        requestHash: HASH_B,
      }),
    ).toEqual({
      tenant: 'session_123',
      cartId: 'cart_123',
      idempotencyKeyHash: HASH_A,
      requestHash: HASH_B,
    })
  })

  test('rejects raw idempotency keys and oversized identifiers', () => {
    expect(() =>
      validateCommerceOperationIdentity({
        tenant: 'session_123',
        cartId: 'cart_123',
        idempotencyKeyHash: 'checkout-key',
        requestHash: HASH_B,
      }),
    ).toThrow('idempotencyKeyHash')

    expect(() =>
      validateCommerceOperationIdentity({
        tenant: 'x'.repeat(129),
        cartId: 'cart_123',
        idempotencyKeyHash: HASH_A,
        requestHash: HASH_B,
      }),
    ).toThrow('tenant')
  })

  test('allows only bounded machine-readable failure codes', () => {
    expect(validateCommerceOperationFailureCode('provider_timeout')).toBe(
      'provider_timeout',
    )
    expect(() =>
      validateCommerceOperationFailureCode('customer@example.com'),
    ).toThrow('failureCode')
  })
})

describe('commerce operation result normalization', () => {
  test('round-trips only the bounded payment-session replay contract', () => {
    const result = normalizeCommerceOperationResult('payment-session', {
      kind: 'payment-session',
      paymentSessionId: 'payses_123',
      actionType: 'redirect',
    })

    expect(parseCommerceOperationResult('payment-session', result)).toEqual({
      kind: 'payment-session',
      paymentSessionId: 'payses_123',
      actionType: 'redirect',
    })
  })

  test('rejects provider payloads and customer data', () => {
    expect(() =>
      normalizeCommerceOperationResult('payment-session', {
        kind: 'payment-session',
        paymentSessionId: 'payses_123',
        actionType: 'redirect',
        providerPayload: { clientSecret: 'secret' },
      }),
    ).toThrow('unsupported fields')

    expect(() =>
      normalizeCommerceOperationResult('complete', {
        kind: 'complete',
        orderId: 'order_123',
        customerEmail: 'customer@example.com',
      }),
    ).toThrow('unsupported fields')
  })
})

describe('commerce operation begin policy', () => {
  const baseOperation = {
    requestHash: HASH_B,
    state: 'started',
    attempt: 1,
    leaseExpiresAt: 2_000,
    expiresAt: 100_000,
  } satisfies CommerceOperationSnapshot

  test('conflicts when the same key is reused for another request', () => {
    expect(decideCommerceOperationBegin(baseOperation, HASH_A, 1_000)).toEqual({
      type: 'conflict',
    })
  })

  test('keeps active attempts single-flight and makes expired leases unknown', () => {
    expect(decideCommerceOperationBegin(baseOperation, HASH_B, 1_000)).toEqual({
      type: 'in-progress',
      retryAfterMs: 1_000,
    })
    expect(decideCommerceOperationBegin(baseOperation, HASH_B, 2_001)).toEqual({
      type: 'unknown',
      markUnknown: true,
    })
  })

  test('replays success and does not automatically retry unknown outcomes', () => {
    const resultJson = normalizeCommerceOperationResult('complete', {
      kind: 'complete',
      orderId: 'order_123',
      displayId: '1001',
    })

    expect(
      decideCommerceOperationBegin(
        {
          ...baseOperation,
          state: 'succeeded',
          resultJson,
        },
        HASH_B,
        1_000,
      ),
    ).toEqual({
      type: 'replay',
      resultJson,
    })
    expect(
      decideCommerceOperationBegin(
        { ...baseOperation, state: 'unknown' },
        HASH_B,
        1_000,
      ),
    ).toEqual({ type: 'unknown', markUnknown: false })
  })

  test('retries only retryable failures after their backoff', () => {
    expect(
      decideCommerceOperationBegin(
        {
          ...baseOperation,
          state: 'failed',
          retryable: true,
          retryAfterAt: 2_000,
          failureCode: 'provider_timeout',
        },
        HASH_B,
        1_000,
      ),
    ).toEqual({
      type: 'failed',
      retryable: true,
      failureCode: 'provider_timeout',
      retryAfterMs: 1_000,
    })

    expect(
      decideCommerceOperationBegin(
        {
          ...baseOperation,
          state: 'failed',
          retryable: true,
          retryAfterAt: 2_000,
        },
        HASH_B,
        2_000,
      ),
    ).toEqual({ type: 'execute', attempt: 2, reset: false })
  })

  test('keeps permanent failures terminal and resets only after retention expiry', () => {
    expect(
      decideCommerceOperationBegin(
        {
          ...baseOperation,
          state: 'failed',
          retryable: false,
          failureCode: 'payment_declined',
        },
        HASH_B,
        1_000,
      ),
    ).toEqual({
      type: 'failed',
      retryable: false,
      failureCode: 'payment_declined',
    })

    expect(
      decideCommerceOperationBegin(
        {
          ...baseOperation,
          state: 'unknown',
          expiresAt: 1_000,
        },
        HASH_B,
        1_000,
      ),
    ).toEqual({ type: 'execute', attempt: 2, reset: true })
  })

  test('allows a new request hash once retention expires', () => {
    expect(
      decideCommerceOperationBegin(
        {
          ...baseOperation,
          expiresAt: 1_000,
        },
        HASH_A,
        1_000,
      ),
    ).toEqual({ type: 'execute', attempt: 2, reset: true })
  })
})
