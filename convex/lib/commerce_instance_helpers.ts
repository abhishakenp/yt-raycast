import { ConvexError } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

type ReadCtx = Pick<QueryCtx | MutationCtx, 'db'>
type WriteCtx = Pick<MutationCtx, 'db'>

export type CommerceInstanceStatus = Doc<'commerceInstances'>['status']
export type CommerceInstanceOperationKind =
  Doc<'commerceInstanceOperations'>['kind']

// provisioning -> ready -> degraded -> suspending -> suspended -> resuming -> ready,
// with failed/deleting/deleted reachable as terminal states. Mirrors the
// lifecycle diagram in specs/architecture/customer-isolated-medusa-dokploy-swarm.md.
const ALLOWED_TRANSITIONS: Record<
  CommerceInstanceStatus,
  ReadonlySet<CommerceInstanceStatus>
> = {
  provisioning: new Set(['ready', 'failed', 'deleting']),
  ready: new Set(['degraded', 'suspending', 'deleting']),
  degraded: new Set(['ready', 'suspending', 'deleting', 'failed']),
  suspending: new Set(['suspended', 'failed', 'deleting']),
  suspended: new Set(['resuming', 'deleting']),
  resuming: new Set(['ready', 'failed']),
  failed: new Set(['provisioning', 'deleting']),
  deleting: new Set(['deleted', 'failed']),
  deleted: new Set([]),
}

function commerceError(code: string, message: string): never {
  throw new ConvexError({ code, message })
}

export async function getCommerceInstanceForOwner(
  ctx: ReadCtx,
  ownerUserId: string,
): Promise<Doc<'commerceInstances'> | null> {
  return ctx.db
    .query('commerceInstances')
    .withIndex('by_ownerUserId', (index) =>
      index.eq('ownerUserId', ownerUserId),
    )
    .first()
}

export async function ensureCommerceInstanceForOwner(
  ctx: WriteCtx,
  args: { ownerUserId: string; provider: string },
  now = Date.now(),
): Promise<{ instanceId: Id<'commerceInstances'>; created: boolean }> {
  const existing = await getCommerceInstanceForOwner(ctx, args.ownerUserId)
  if (existing !== null) {
    return { instanceId: existing._id, created: false }
  }

  const instanceId = await ctx.db.insert('commerceInstances', {
    ownerUserId: args.ownerUserId,
    status: 'provisioning',
    provider: args.provider,
    createdAt: now,
    updatedAt: now,
  })
  return { instanceId, created: true }
}

// Idempotent: only fails when the transition is illegal. Setting a status
// equal to the current one is a no-op success (safe for provisioner retries).
export async function transitionCommerceInstanceStatus(
  ctx: WriteCtx,
  instanceId: Id<'commerceInstances'>,
  nextStatus: CommerceInstanceStatus,
  patch: Partial<
    Pick<
      Doc<'commerceInstances'>,
      | 'providerReference'
      | 'backendUrl'
      | 'adminUrl'
      | 'secretRef'
      | 'entitlementExpiry'
      | 'suspendedAt'
      | 'deletedAt'
      | 'errorMessage'
    >
  > = {},
  now = Date.now(),
): Promise<Doc<'commerceInstances'>> {
  const instance = await ctx.db.get(instanceId)
  if (instance === null) {
    commerceError('COMMERCE_INSTANCE_NOT_FOUND', 'Commerce instance not found.')
  }

  if (
    instance.status !== nextStatus &&
    !ALLOWED_TRANSITIONS[instance.status].has(nextStatus)
  ) {
    commerceError(
      'INVALID_COMMERCE_INSTANCE_TRANSITION',
      `Cannot transition commerce instance from ${instance.status} to ${nextStatus}.`,
    )
  }

  await ctx.db.patch(instanceId, {
    status: nextStatus,
    updatedAt: now,
    ...patch,
  })

  const updated = await ctx.db.get(instanceId)
  if (updated === null) {
    commerceError('COMMERCE_INSTANCE_NOT_FOUND', 'Commerce instance not found.')
  }
  return updated
}

export function assertCommerceInstanceOwnedBy(
  instance: Doc<'commerceInstances'>,
  ownerUserId: string,
): void {
  if (instance.ownerUserId !== ownerUserId) {
    commerceError(
      'FORBIDDEN',
      'Commerce instance belongs to another customer.',
    )
  }
}

export async function getCommerceStoreForSession(
  ctx: ReadCtx,
  sessionId: Id<'sessions'>,
): Promise<Doc<'commerceStores'> | null> {
  return ctx.db
    .query('commerceStores')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .first()
}

export async function getCommerceStoreForDeployment(
  ctx: ReadCtx,
  deploymentId: Id<'deployments'>,
): Promise<Doc<'commerceStores'> | null> {
  return ctx.db
    .query('commerceStores')
    .withIndex('by_deploymentId', (index) =>
      index.eq('deploymentId', deploymentId),
    )
    .first()
}

// Later sessions for an already-provisioned customer reuse the existing
// instance and only create another store binding (plan: multi-store reuse).
export async function ensureCommerceStoreForSession(
  ctx: WriteCtx,
  args: {
    sessionId: Id<'sessions'>
    commerceInstanceId: Id<'commerceInstances'>
    deploymentId?: Id<'deployments'>
  },
  now = Date.now(),
): Promise<{ storeId: Id<'commerceStores'>; created: boolean }> {
  const existing = await getCommerceStoreForSession(ctx, args.sessionId)
  if (existing !== null) {
    return { storeId: existing._id, created: false }
  }

  const storeId = await ctx.db.insert('commerceStores', {
    commerceInstanceId: args.commerceInstanceId,
    sessionId: args.sessionId,
    deploymentId: args.deploymentId,
    status: 'not_enabled',
    syncStatus: 'idle',
    createdAt: now,
    updatedAt: now,
  })
  return { storeId, created: true }
}

export type CommerceStoreGateway = {
  instance: Doc<'commerceInstances'>
  store: Doc<'commerceStores'>
}

async function toGateway(
  ctx: ReadCtx,
  store: Doc<'commerceStores'> | null,
): Promise<CommerceStoreGateway | null> {
  if (store === null) return null
  const instance = await ctx.db.get(store.commerceInstanceId)
  if (instance === null) return null
  return { instance, store }
}

// The plan's required resolution hop: session/deployment -> commerce store ->
// customer instance. Never returns another customer's instance/store.
export async function resolveCommerceStoreGatewayBySession(
  ctx: ReadCtx,
  sessionId: Id<'sessions'>,
): Promise<CommerceStoreGateway | null> {
  return toGateway(ctx, await getCommerceStoreForSession(ctx, sessionId))
}

export async function resolveCommerceStoreGatewayByDeployment(
  ctx: ReadCtx,
  deploymentId: Id<'deployments'>,
): Promise<CommerceStoreGateway | null> {
  return toGateway(ctx, await getCommerceStoreForDeployment(ctx, deploymentId))
}

// --- Idempotent instance-lifecycle operation ledger -----------------------
// Mirrors the begin/replay/in-progress/conflict decision shape used by
// convex/lib/commerce_operation_helpers.ts for cart operations, adapted for
// longer-running instance lifecycle operations (provision/suspend/resume/
// upgrade/delete) keyed by (commerceInstanceId, kind, idempotencyKey) instead
// of (tenant, cartId, kind).

export type CommerceInstanceOperationDecision =
  | { type: 'execute'; attempt: number }
  | { type: 'conflict' }
  | { type: 'in-progress'; retryAfterMs: number }
  | { type: 'replay'; resultJson?: string }
  | { type: 'failed'; retryable: boolean; failureCode?: string }

function decideCommerceInstanceOperationBegin(
  operation: Doc<'commerceInstanceOperations'> | null,
  requestHash: string,
  now: number,
): CommerceInstanceOperationDecision {
  if (operation === null || operation.expiresAt <= now) {
    return { type: 'execute', attempt: (operation?.attempt ?? 0) + 1 }
  }
  if (operation.requestHash !== requestHash) {
    return { type: 'conflict' }
  }
  if (operation.state === 'succeeded') {
    return { type: 'replay', resultJson: operation.resultJson }
  }
  if (operation.state === 'started') {
    if (operation.leaseExpiresAt <= now) {
      return { type: 'execute', attempt: operation.attempt + 1 }
    }
    return {
      type: 'in-progress',
      retryAfterMs: operation.leaseExpiresAt - now,
    }
  }
  if (operation.state === 'unknown') {
    return { type: 'in-progress', retryAfterMs: 0 }
  }
  // state === 'failed'
  if (operation.retryable !== true) {
    return {
      type: 'failed',
      retryable: false,
      failureCode: operation.failureCode,
    }
  }
  if (operation.retryAfterAt !== undefined && operation.retryAfterAt > now) {
    return {
      type: 'in-progress',
      retryAfterMs: operation.retryAfterAt - now,
    }
  }
  return { type: 'execute', attempt: operation.attempt + 1 }
}

export type BeginCommerceInstanceOperationResult = {
  operationId: Id<'commerceInstanceOperations'>
  decision: CommerceInstanceOperationDecision
}

export async function beginCommerceInstanceOperation(
  ctx: WriteCtx,
  args: {
    commerceInstanceId: Id<'commerceInstances'>
    commerceStoreId?: Id<'commerceStores'>
    kind: CommerceInstanceOperationKind
    idempotencyKey: string
    requestHash: string
    leaseMs: number
    ttlMs: number
  },
  now = Date.now(),
): Promise<BeginCommerceInstanceOperationResult> {
  const existing = await ctx.db
    .query('commerceInstanceOperations')
    .withIndex('by_commerceInstanceId_and_kind_and_idempotencyKey', (index) =>
      index
        .eq('commerceInstanceId', args.commerceInstanceId)
        .eq('kind', args.kind)
        .eq('idempotencyKey', args.idempotencyKey),
    )
    .first()

  const decision = decideCommerceInstanceOperationBegin(
    existing,
    args.requestHash,
    now,
  )

  if (decision.type !== 'execute') {
    if (existing === null) {
      commerceError(
        'COMMERCE_INSTANCE_OPERATION_STATE_INCONSISTENT',
        'Expected an existing operation for a non-execute decision.',
      )
    }
    return { operationId: existing._id, decision }
  }

  const row = {
    commerceInstanceId: args.commerceInstanceId,
    commerceStoreId: args.commerceStoreId,
    kind: args.kind,
    idempotencyKey: args.idempotencyKey,
    requestHash: args.requestHash,
    state: 'started' as const,
    attempt: decision.attempt,
    startedAt: existing?.startedAt ?? now,
    updatedAt: now,
    leaseExpiresAt: now + args.leaseMs,
    expiresAt: now + args.ttlMs,
  }

  if (existing === null) {
    const operationId = await ctx.db.insert('commerceInstanceOperations', row)
    return { operationId, decision }
  }

  await ctx.db.patch(existing._id, row)
  return { operationId: existing._id, decision }
}

export async function completeCommerceInstanceOperation(
  ctx: WriteCtx,
  operationId: Id<'commerceInstanceOperations'>,
  result:
    | { state: 'succeeded'; resultJson?: string }
    | {
        state: 'failed'
        retryable: boolean
        failureCode?: string
        retryAfterAt?: number
      },
  now = Date.now(),
): Promise<void> {
  await ctx.db.patch(operationId, { ...result, updatedAt: now })
}
