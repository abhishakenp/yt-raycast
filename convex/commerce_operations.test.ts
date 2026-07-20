import { convexTest } from 'convex-test'
import { describe, expect, test } from 'vitest'
import { internal } from './_generated/api'
import type {
  CommerceOperationKind,
  CommerceOperationResult,
} from './lib/commerce_operation_helpers'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const HASH_A = 'a'.repeat(64)
const HASH_B = 'b'.repeat(64)

type BeginOperationArgs = {
  scope: 'sessions' | 'deployments'
  tenant: string
  cartId: string
  kind: CommerceOperationKind
  idempotencyKeyHash: string
  requestHash: string
  now: number
  leaseMs: number
  retentionMs: number
}

const beginArgs = {
  scope: 'sessions',
  tenant: 'session_123',
  cartId: 'cart_123',
  kind: 'payment-session',
  idempotencyKeyHash: HASH_A,
  requestHash: HASH_B,
  now: 1_000,
  leaseMs: 30_000,
  retentionMs: 259_200_000,
} satisfies BeginOperationArgs

test('commerce operation identity is queryable without storing checkout payloads', async () => {
  const t = convexTest(schema, modules)

  const operationId = await t.run(async (ctx) =>
    ctx.db.insert('commerceOperations', {
      scope: 'sessions',
      tenant: 'session_123',
      cartId: 'cart_123',
      kind: 'payment-session',
      idempotencyKeyHash: HASH_A,
      requestHash: HASH_B,
      state: 'started',
      attempt: 1,
      startedAt: 1_000,
      updatedAt: 1_000,
      leaseExpiresAt: 31_000,
      expiresAt: 259_201_000,
    }),
  )

  const operation = await t.run(async (ctx) =>
    ctx.db
      .query('commerceOperations')
      .withIndex(
        'by_scope_and_tenant_and_cartId_and_kind_and_idempotencyKeyHash',
        (query) =>
          query
            .eq('scope', 'sessions')
            .eq('tenant', 'session_123')
            .eq('cartId', 'cart_123')
            .eq('kind', 'payment-session')
            .eq('idempotencyKeyHash', HASH_A),
      )
      .unique(),
  )

  expect(operation?._id).toBe(operationId)
  expect(operation).not.toHaveProperty('providerPayload')
  expect(operation).not.toHaveProperty('customerEmail')
})

describe('commerce operation ledger', () => {
  test('begins one active attempt and returns in-progress to duplicates', async () => {
    const t = convexTest(schema, modules)

    const first = await t.mutation(
      internal.commerce_operations.begin,
      beginArgs,
    )
    const duplicate = await t.mutation(internal.commerce_operations.begin, {
      ...beginArgs,
      now: 2_000,
    })

    expect(first).toMatchObject({
      type: 'execute',
      attempt: 1,
      leaseExpiresAt: 31_000,
    })
    expect(duplicate).toEqual({
      type: 'in-progress',
      retryAfterMs: 29_000,
    })
  })

  test('conflicts when one key is reused with a different request hash', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(internal.commerce_operations.begin, beginArgs)

    await expect(
      t.mutation(internal.commerce_operations.begin, {
        ...beginArgs,
        requestHash: 'c'.repeat(64),
      }),
    ).resolves.toEqual({ type: 'conflict' })
  })

  test('commits and replays a normalized payment-session result', async () => {
    const t = convexTest(schema, modules)

    const started = await t.mutation(
      internal.commerce_operations.begin,
      beginArgs,
    )
    if (started.type !== 'execute') {
      throw new Error('expected an executable operation')
    }

    const committed = await t.mutation(internal.commerce_operations.commit, {
      operationId: started.operationId,
      attempt: started.attempt,
      now: 2_000,
      result: {
        kind: 'payment-session',
        paymentSessionId: 'payses_123',
        actionType: 'redirect',
      },
    })
    const replayed = await t.query(internal.commerce_operations.replay, {
      operationId: started.operationId,
    })

    expect(committed).toEqual({
      type: 'succeeded',
      result: {
        kind: 'payment-session',
        paymentSessionId: 'payses_123',
        actionType: 'redirect',
      },
    })
    expect(replayed).toEqual({
      type: 'replay',
      result: {
        kind: 'payment-session',
        paymentSessionId: 'payses_123',
        actionType: 'redirect',
      },
    })

    const stored = await t.run((ctx) =>
      ctx.db
        .query('commerceOperations')
        .withIndex(
          'by_scope_and_tenant_and_cartId_and_kind_and_idempotencyKeyHash',
          (query) =>
            query
              .eq('scope', beginArgs.scope)
              .eq('tenant', beginArgs.tenant)
              .eq('cartId', beginArgs.cartId)
              .eq('kind', beginArgs.kind)
              .eq('idempotencyKeyHash', beginArgs.idempotencyKeyHash),
        )
        .unique(),
    )
    expect(stored?.resultJson).toBe(
      '{"kind":"payment-session","paymentSessionId":"payses_123","actionType":"redirect"}',
    )
    expect(stored).not.toHaveProperty('providerPayload')
    expect(stored).not.toHaveProperty('customerEmail')
  })

  test('marks an expired lease unknown instead of executing twice', async () => {
    const t = convexTest(schema, modules)

    const started = await t.mutation(
      internal.commerce_operations.begin,
      beginArgs,
    )
    const afterLease = await t.mutation(internal.commerce_operations.begin, {
      ...beginArgs,
      now: 31_001,
    })
    const repeated = await t.mutation(internal.commerce_operations.begin, {
      ...beginArgs,
      now: 32_000,
    })

    expect(started.type).toBe('execute')
    expect(afterLease).toEqual({ type: 'unknown' })
    expect(repeated).toEqual({ type: 'unknown' })
  })

  test('retries retryable failures only after backoff', async () => {
    const t = convexTest(schema, modules)

    const started = await t.mutation(
      internal.commerce_operations.begin,
      beginArgs,
    )
    if (started.type !== 'execute') {
      throw new Error('expected an executable operation')
    }

    await t.mutation(internal.commerce_operations.fail, {
      operationId: started.operationId,
      attempt: started.attempt,
      now: 2_000,
      outcome: 'failed',
      retryable: true,
      failureCode: 'provider_timeout',
      retryAfterMs: 5_000,
    })

    const duringBackoff = await t.mutation(internal.commerce_operations.begin, {
      ...beginArgs,
      now: 6_000,
    })
    const afterBackoff = await t.mutation(internal.commerce_operations.begin, {
      ...beginArgs,
      now: 7_000,
    })

    expect(duringBackoff).toEqual({
      type: 'failed',
      retryable: true,
      failureCode: 'provider_timeout',
      retryAfterMs: 1_000,
    })
    expect(afterBackoff).toMatchObject({
      type: 'execute',
      attempt: 2,
    })
  })

  test('allows an unknown provider outcome to be reconciled to success', async () => {
    const t = convexTest(schema, modules)
    const completeArgs = {
      ...beginArgs,
      kind: 'complete',
      idempotencyKeyHash: 'd'.repeat(64),
    } satisfies BeginOperationArgs

    const started = await t.mutation(
      internal.commerce_operations.begin,
      completeArgs,
    )
    if (started.type !== 'execute') {
      throw new Error('expected an executable operation')
    }

    await t.mutation(internal.commerce_operations.fail, {
      operationId: started.operationId,
      attempt: started.attempt,
      now: 2_000,
      outcome: 'unknown',
      retryable: false,
      failureCode: 'provider_timeout',
    })
    const unknown = await t.mutation(internal.commerce_operations.begin, {
      ...completeArgs,
      now: 3_000,
    })
    const reconciled = await t.mutation(internal.commerce_operations.commit, {
      operationId: started.operationId,
      attempt: started.attempt,
      now: 4_000,
      result: {
        kind: 'complete',
        orderId: 'order_123',
        displayId: '1001',
      },
    })

    expect(unknown).toEqual({ type: 'unknown' })
    expect(reconciled).toEqual({
      type: 'succeeded',
      result: {
        kind: 'complete',
        orderId: 'order_123',
        displayId: '1001',
      },
    })
  })

  test('makes commit idempotent but rejects a different committed result', async () => {
    const t = convexTest(schema, modules)
    const started = await t.mutation(
      internal.commerce_operations.begin,
      beginArgs,
    )
    if (started.type !== 'execute') {
      throw new Error('expected an executable operation')
    }
    const committedResult = {
      kind: 'payment-session',
      paymentSessionId: 'payses_123',
      actionType: 'none',
    } satisfies CommerceOperationResult
    const commitArgs = {
      operationId: started.operationId,
      attempt: started.attempt,
      now: 2_000,
      result: committedResult,
    }

    await t.mutation(internal.commerce_operations.commit, commitArgs)
    await expect(
      t.mutation(internal.commerce_operations.commit, {
        ...commitArgs,
        now: 3_000,
      }),
    ).resolves.toMatchObject({ type: 'succeeded' })
    await expect(
      t.mutation(internal.commerce_operations.commit, {
        ...commitArgs,
        now: 4_000,
        result: {
          ...commitArgs.result,
          paymentSessionId: 'payses_456',
        },
      }),
    ).rejects.toThrow('different result')
  })

  test('never makes unknown outcomes automatically retryable', async () => {
    const t = convexTest(schema, modules)
    const started = await t.mutation(
      internal.commerce_operations.begin,
      beginArgs,
    )
    if (started.type !== 'execute') {
      throw new Error('expected an executable operation')
    }

    await expect(
      t.mutation(internal.commerce_operations.fail, {
        operationId: started.operationId,
        attempt: started.attempt,
        now: 2_000,
        outcome: 'unknown',
        retryable: true,
        failureCode: 'provider_timeout',
      }),
    ).rejects.toThrow('cannot be retried automatically')
  })

  test('rejects conflicting failure details for the same attempt', async () => {
    const t = convexTest(schema, modules)
    const started = await t.mutation(
      internal.commerce_operations.begin,
      beginArgs,
    )
    if (started.type !== 'execute') {
      throw new Error('expected an executable operation')
    }

    await t.mutation(internal.commerce_operations.fail, {
      operationId: started.operationId,
      attempt: started.attempt,
      now: 2_000,
      outcome: 'failed',
      retryable: false,
      failureCode: 'payment_declined',
    })
    await expect(
      t.mutation(internal.commerce_operations.fail, {
        operationId: started.operationId,
        attempt: started.attempt,
        now: 3_000,
        outcome: 'failed',
        retryable: true,
        failureCode: 'provider_timeout',
      }),
    ).rejects.toThrow('different failure')
  })

  test('refreshes replay retention when a late commit wins the race', async () => {
    const t = convexTest(schema, modules)
    const started = await t.mutation(
      internal.commerce_operations.begin,
      beginArgs,
    )
    if (started.type !== 'execute') {
      throw new Error('expected an executable operation')
    }
    const lateCommitAt = beginArgs.now + beginArgs.retentionMs + 1

    await t.mutation(internal.commerce_operations.commit, {
      operationId: started.operationId,
      attempt: started.attempt,
      now: lateCommitAt,
      result: {
        kind: 'payment-session',
        paymentSessionId: 'payses_late',
        actionType: 'none',
      },
    })
    const replay = await t.mutation(internal.commerce_operations.begin, {
      ...beginArgs,
      now: lateCommitAt + 1,
    })

    expect(replay).toEqual({
      type: 'replay',
      result: {
        kind: 'payment-session',
        paymentSessionId: 'payses_late',
        actionType: 'none',
      },
    })
  })

  test('expires identity before hash comparison and rejects the displaced attempt', async () => {
    const t = convexTest(schema, modules)
    const started = await t.mutation(
      internal.commerce_operations.begin,
      beginArgs,
    )
    if (started.type !== 'execute') {
      throw new Error('expected an executable operation')
    }
    const expiresAt = beginArgs.now + beginArgs.retentionMs

    const reset = await t.mutation(internal.commerce_operations.begin, {
      ...beginArgs,
      requestHash: 'c'.repeat(64),
      now: expiresAt,
    })

    expect(reset).toMatchObject({ type: 'execute', attempt: 2 })
    await expect(
      t.mutation(internal.commerce_operations.commit, {
        operationId: started.operationId,
        attempt: started.attempt,
        now: expiresAt + 1,
        result: {
          kind: 'payment-session',
          paymentSessionId: 'payses_stale',
          actionType: 'none',
        },
      }),
    ).rejects.toThrow('no longer current')
  })

  test('rejects a changed retry delay for an already failed attempt', async () => {
    const t = convexTest(schema, modules)
    const started = await t.mutation(
      internal.commerce_operations.begin,
      beginArgs,
    )
    if (started.type !== 'execute') {
      throw new Error('expected an executable operation')
    }

    const failure = {
      operationId: started.operationId,
      attempt: started.attempt,
      now: 2_000,
      outcome: 'failed',
      retryable: true,
      failureCode: 'provider_timeout',
      retryAfterMs: 5_000,
    } satisfies {
      operationId: typeof started.operationId
      attempt: number
      now: number
      outcome: 'failed' | 'unknown'
      retryable: boolean
      failureCode?: string
      retryAfterMs?: number
    }
    await t.mutation(internal.commerce_operations.fail, failure)
    await expect(
      t.mutation(internal.commerce_operations.fail, {
        ...failure,
        now: 3_000,
        retryAfterMs: 10_000,
      }),
    ).rejects.toThrow('different failure')
  })
})
