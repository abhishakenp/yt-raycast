import { ConvexError, v } from 'convex/values'
import { internalMutation, internalQuery } from './_generated/server'
import {
  decideCommerceOperationBegin,
  normalizeCommerceOperationResult,
  parseCommerceOperationResult,
  validateCommerceOperationFailureCode,
  validateCommerceOperationIdentity,
} from './lib/commerce_operation_helpers'

const MIN_LEASE_MS = 1_000
const MAX_LEASE_MS = 300_000
const MIN_RETENTION_MS = 3_600_000
const MAX_RETENTION_MS = 2_592_000_000
const MAX_RETRY_AFTER_MS = 3_600_000

const scopeValidator = v.union(v.literal('sessions'), v.literal('deployments'))
const kindValidator = v.union(
  v.literal('payment-session'),
  v.literal('complete'),
)
const resultValidator = v.union(
  v.object({
    kind: v.literal('payment-session'),
    paymentSessionId: v.string(),
    actionType: v.union(
      v.literal('none'),
      v.literal('redirect'),
      v.literal('client-session'),
    ),
  }),
  v.object({
    kind: v.literal('complete'),
    orderId: v.string(),
    displayId: v.optional(v.string()),
  }),
)

type LedgerError = (code: string, message: string) => never
type ValidateInteger = (
  label: string,
  value: number,
  minimum: number,
  maximum?: number,
) => number

const ledgerError: LedgerError = (code, message) => {
  throw new ConvexError({ code, message })
}

const validateInteger: ValidateInteger = (
  label,
  value,
  minimum,
  maximum = Number.MAX_SAFE_INTEGER,
) => {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    ledgerError(
      'INVALID_COMMERCE_OPERATION',
      `${label} must be an integer between ${minimum} and ${maximum}`,
    )
  }
  return value
}

export const begin = internalMutation({
  args: {
    scope: scopeValidator,
    tenant: v.string(),
    cartId: v.string(),
    kind: kindValidator,
    idempotencyKeyHash: v.string(),
    requestHash: v.string(),
    now: v.number(),
    leaseMs: v.number(),
    retentionMs: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = validateCommerceOperationIdentity(args)
    const now = validateInteger('now', args.now, 0)
    const leaseMs = validateInteger(
      'leaseMs',
      args.leaseMs,
      MIN_LEASE_MS,
      MAX_LEASE_MS,
    )
    const retentionMs = validateInteger(
      'retentionMs',
      args.retentionMs,
      MIN_RETENTION_MS,
      MAX_RETENTION_MS,
    )
    if (retentionMs <= leaseMs) {
      ledgerError(
        'INVALID_COMMERCE_OPERATION',
        'retentionMs must be longer than leaseMs',
      )
    }

    const existing = await ctx.db
      .query('commerceOperations')
      .withIndex(
        'by_scope_and_tenant_and_cartId_and_kind_and_idempotencyKeyHash',
        (query) =>
          query
            .eq('scope', args.scope)
            .eq('tenant', identity.tenant)
            .eq('cartId', identity.cartId)
            .eq('kind', args.kind)
            .eq('idempotencyKeyHash', identity.idempotencyKeyHash),
      )
      .unique()
    const decision = decideCommerceOperationBegin(
      existing,
      identity.requestHash,
      now,
    )

    if (decision.type === 'conflict') {
      return { type: 'conflict' } satisfies { type: 'conflict' }
    }
    if (decision.type === 'in-progress') {
      return decision
    }
    if (decision.type === 'unknown') {
      if (existing !== null && decision.markUnknown) {
        await ctx.db.patch(existing._id, {
          state: 'unknown',
          retryable: false,
          failureCode: 'lease_expired',
          updatedAt: now,
        })
      }
      return { type: 'unknown' } satisfies { type: 'unknown' }
    }
    if (decision.type === 'failed') {
      return decision
    }
    if (decision.type === 'replay') {
      return {
        type: 'replay',
        result: parseCommerceOperationResult(args.kind, decision.resultJson),
      } satisfies {
        type: 'replay'
        result: ReturnType<typeof parseCommerceOperationResult>
      }
    }

    const leaseExpiresAt = now + leaseMs
    const expiresAt = now + retentionMs
    if (existing === null) {
      const operationId = await ctx.db.insert('commerceOperations', {
        scope: args.scope,
        tenant: identity.tenant,
        cartId: identity.cartId,
        kind: args.kind,
        idempotencyKeyHash: identity.idempotencyKeyHash,
        requestHash: identity.requestHash,
        state: 'started',
        attempt: decision.attempt,
        startedAt: now,
        updatedAt: now,
        leaseExpiresAt,
        expiresAt,
      })
      return {
        type: 'execute',
        operationId,
        attempt: decision.attempt,
        leaseExpiresAt,
      } satisfies {
        type: 'execute'
        operationId: typeof operationId
        attempt: number
        leaseExpiresAt: number
      }
    }

    await ctx.db.patch(existing._id, {
      requestHash: identity.requestHash,
      state: 'started',
      attempt: decision.attempt,
      retryable: undefined,
      failureCode: undefined,
      resultJson: undefined,
      startedAt: now,
      updatedAt: now,
      leaseExpiresAt,
      retryAfterAt: undefined,
      expiresAt,
    })
    return {
      type: 'execute',
      operationId: existing._id,
      attempt: decision.attempt,
      leaseExpiresAt,
    } satisfies {
      type: 'execute'
      operationId: typeof existing._id
      attempt: number
      leaseExpiresAt: number
    }
  },
})

export const commit = internalMutation({
  args: {
    operationId: v.id('commerceOperations'),
    attempt: v.number(),
    now: v.number(),
    result: resultValidator,
  },
  handler: async (ctx, args) => {
    const attempt = validateInteger('attempt', args.attempt, 1)
    const now = validateInteger('now', args.now, 0)
    const operation = await ctx.db.get(args.operationId)
    if (operation === null) {
      return ledgerError(
        'COMMERCE_OPERATION_NOT_FOUND',
        'operation was not found',
      )
    }
    if (operation.attempt !== attempt) {
      ledgerError(
        'COMMERCE_OPERATION_STALE',
        'operation attempt is no longer current',
      )
    }

    const resultJson = normalizeCommerceOperationResult(
      operation.kind,
      args.result,
    )
    const result = parseCommerceOperationResult(operation.kind, resultJson)
    if (operation.state === 'succeeded') {
      if (operation.resultJson !== resultJson) {
        ledgerError(
          'COMMERCE_OPERATION_CONFLICT',
          'operation already succeeded with a different result',
        )
      }
      return { type: 'succeeded', result } satisfies {
        type: 'succeeded'
        result: typeof result
      }
    }
    if (operation.state === 'failed') {
      ledgerError(
        'COMMERCE_OPERATION_CONFLICT',
        'failed operation must begin a new attempt before commit',
      )
    }
    const replayRetentionMs = validateInteger(
      'stored retentionMs',
      operation.expiresAt - operation.startedAt,
      MIN_RETENTION_MS,
      MAX_RETENTION_MS,
    )

    await ctx.db.patch(operation._id, {
      state: 'succeeded',
      retryable: undefined,
      failureCode: undefined,
      resultJson,
      updatedAt: now,
      retryAfterAt: undefined,
      expiresAt: now + replayRetentionMs,
    })
    return { type: 'succeeded', result } satisfies {
      type: 'succeeded'
      result: typeof result
    }
  },
})

export const fail = internalMutation({
  args: {
    operationId: v.id('commerceOperations'),
    attempt: v.number(),
    now: v.number(),
    outcome: v.union(v.literal('failed'), v.literal('unknown')),
    retryable: v.boolean(),
    failureCode: v.optional(v.string()),
    retryAfterMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const attempt = validateInteger('attempt', args.attempt, 1)
    const now = validateInteger('now', args.now, 0)
    const operation = await ctx.db.get(args.operationId)
    if (operation === null) {
      return ledgerError(
        'COMMERCE_OPERATION_NOT_FOUND',
        'operation was not found',
      )
    }
    if (operation.attempt !== attempt) {
      ledgerError(
        'COMMERCE_OPERATION_STALE',
        'operation attempt is no longer current',
      )
    }
    if (operation.state === 'succeeded') {
      ledgerError(
        'COMMERCE_OPERATION_CONFLICT',
        'succeeded operation cannot be failed',
      )
    }
    if (args.outcome === 'unknown' && args.retryable) {
      ledgerError(
        'INVALID_COMMERCE_OPERATION',
        'unknown outcomes cannot be retried automatically',
      )
    }
    if (!args.retryable && args.retryAfterMs !== undefined) {
      ledgerError(
        'INVALID_COMMERCE_OPERATION',
        'retryAfterMs requires a retryable failure',
      )
    }

    const failureCode =
      args.failureCode === undefined
        ? undefined
        : validateCommerceOperationFailureCode(args.failureCode)
    const retryAfterMs =
      args.retryAfterMs === undefined
        ? undefined
        : validateInteger(
            'retryAfterMs',
            args.retryAfterMs,
            0,
            MAX_RETRY_AFTER_MS,
          )
    const retryAfterAt = args.retryable ? now + (retryAfterMs ?? 0) : undefined

    if (operation.state === args.outcome) {
      const expectedRetryable = args.outcome === 'failed' && args.retryable
      const expectedRetryAfterMs = expectedRetryable
        ? (retryAfterMs ?? 0)
        : undefined
      const recordedRetryAfterMs =
        operation.retryAfterAt === undefined
          ? undefined
          : operation.retryAfterAt - operation.updatedAt
      if (
        operation.retryable !== expectedRetryable ||
        operation.failureCode !== failureCode ||
        recordedRetryAfterMs !== expectedRetryAfterMs
      ) {
        ledgerError(
          'COMMERCE_OPERATION_CONFLICT',
          'operation already recorded a different failure',
        )
      }
      return {
        type: args.outcome,
        retryable: expectedRetryable,
      }
    }
    if (operation.state === 'failed') {
      ledgerError(
        'COMMERCE_OPERATION_CONFLICT',
        'failed operation must begin a new attempt before another outcome',
      )
    }

    await ctx.db.patch(operation._id, {
      state: args.outcome,
      retryable: args.outcome === 'failed' && args.retryable,
      failureCode,
      resultJson: undefined,
      updatedAt: now,
      retryAfterAt,
    })
    return {
      type: args.outcome,
      retryable: args.outcome === 'failed' && args.retryable,
    }
  },
})

export const replay = internalQuery({
  args: {
    operationId: v.id('commerceOperations'),
  },
  handler: async (ctx, { operationId }) => {
    const operation = await ctx.db.get(operationId)
    if (operation === null) {
      return ledgerError(
        'COMMERCE_OPERATION_NOT_FOUND',
        'operation was not found',
      )
    }
    if (operation.state !== 'succeeded' || operation.resultJson === undefined) {
      return {
        type: 'not-replayable',
        state: operation.state,
      } satisfies {
        type: 'not-replayable'
        state: typeof operation.state
      }
    }

    return {
      type: 'replay',
      result: parseCommerceOperationResult(
        operation.kind,
        operation.resultJson,
      ),
    } satisfies {
      type: 'replay'
      result: ReturnType<typeof parseCommerceOperationResult>
    }
  },
})
