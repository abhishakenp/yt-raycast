import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import type { Id } from '../_generated/dataModel'
import schema from '../schema'
import {
  assertCommerceInstanceOwnedBy,
  beginCommerceInstanceOperation,
  completeCommerceInstanceOperation,
  ensureCommerceInstanceForOwner,
  ensureCommerceStoreForSession,
  resolveCommerceStoreGatewayByDeployment,
  resolveCommerceStoreGatewayBySession,
  transitionCommerceInstanceStatus,
} from './commerce_instance_helpers'

const modules = import.meta.glob('../**/*.ts')

async function insertSession(
  t: ReturnType<typeof convexTest>,
  userId: string,
): Promise<Id<'sessions'>> {
  return t.run((ctx) =>
    ctx.db.insert('sessions', {
      userId,
      prompt: 'test',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      status: 'preview_ready',
      previewVersion: 1,
      createdAt: Date.now(),
    }),
  )
}

describe('ensureCommerceInstanceForOwner', () => {
  it('creates one instance per owner and reuses it for later calls', async () => {
    const t = convexTest(schema, modules)
    const ownerUserId = 'owner-1'

    const first = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId,
        provider: 'medusa',
      }),
    )
    const second = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId,
        provider: 'medusa',
      }),
    )

    expect(first.created).toBe(true)
    expect(second.created).toBe(false)
    expect(second.instanceId).toBe(first.instanceId)
  })
})

describe('transitionCommerceInstanceStatus', () => {
  it('allows the documented lifecycle path', async () => {
    const t = convexTest(schema, modules)
    const { instanceId } = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId: 'owner-lifecycle',
        provider: 'medusa',
      }),
    )

    await t.run((ctx) =>
      transitionCommerceInstanceStatus(ctx, instanceId, 'ready'),
    )
    await t.run((ctx) =>
      transitionCommerceInstanceStatus(ctx, instanceId, 'degraded'),
    )
    await t.run((ctx) =>
      transitionCommerceInstanceStatus(ctx, instanceId, 'suspending'),
    )
    await t.run((ctx) =>
      transitionCommerceInstanceStatus(ctx, instanceId, 'suspended'),
    )
    await t.run((ctx) =>
      transitionCommerceInstanceStatus(ctx, instanceId, 'resuming'),
    )
    const final = await t.run((ctx) =>
      transitionCommerceInstanceStatus(ctx, instanceId, 'ready'),
    )

    expect(final.status).toBe('ready')
  })

  it('rejects a transition that skips required states', async () => {
    const t = convexTest(schema, modules)
    const { instanceId } = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId: 'owner-illegal',
        provider: 'medusa',
      }),
    )
    await t.run((ctx) =>
      transitionCommerceInstanceStatus(ctx, instanceId, 'ready'),
    )
    await t.run((ctx) =>
      transitionCommerceInstanceStatus(ctx, instanceId, 'suspending'),
    )
    await t.run((ctx) =>
      transitionCommerceInstanceStatus(ctx, instanceId, 'suspended'),
    )

    // suspended must go through resuming, not straight back to ready.
    await expect(
      t.run((ctx) =>
        transitionCommerceInstanceStatus(ctx, instanceId, 'ready'),
      ),
    ).rejects.toMatchObject({
      data: expect.objectContaining({
        code: 'INVALID_COMMERCE_INSTANCE_TRANSITION',
      }),
    })
  })

  it('treats setting the same status as a no-op success', async () => {
    const t = convexTest(schema, modules)
    const { instanceId } = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId: 'owner-noop',
        provider: 'medusa',
      }),
    )

    const result = await t.run((ctx) =>
      transitionCommerceInstanceStatus(ctx, instanceId, 'provisioning'),
    )
    expect(result.status).toBe('provisioning')
  })
})

describe('assertCommerceInstanceOwnedBy', () => {
  it('throws FORBIDDEN when the instance belongs to a different customer', async () => {
    const t = convexTest(schema, modules)
    const { instanceId } = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId: 'owner-a',
        provider: 'medusa',
      }),
    )
    const instance = await t.run((ctx) => ctx.db.get(instanceId))

    expect(() =>
      assertCommerceInstanceOwnedBy(instance!, 'owner-b'),
    ).toThrowError(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'FORBIDDEN' }),
      }),
    )
    expect(() =>
      assertCommerceInstanceOwnedBy(instance!, 'owner-a'),
    ).not.toThrow()
  })
})

describe('multi-store reuse and cross-customer isolation', () => {
  it('reuses one instance across two sessions for the same owner, with distinct stores', async () => {
    const t = convexTest(schema, modules)
    const ownerUserId = 'owner-multi-store'
    const { instanceId } = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId,
        provider: 'medusa',
      }),
    )
    const sessionA = await insertSession(t, ownerUserId)
    const sessionB = await insertSession(t, ownerUserId)

    const storeA = await t.run((ctx) =>
      ensureCommerceStoreForSession(ctx, {
        sessionId: sessionA,
        commerceInstanceId: instanceId,
      }),
    )
    const storeB = await t.run((ctx) =>
      ensureCommerceStoreForSession(ctx, {
        sessionId: sessionB,
        commerceInstanceId: instanceId,
      }),
    )
    // Re-enabling commerce for the same session must not create a duplicate.
    const storeAAgain = await t.run((ctx) =>
      ensureCommerceStoreForSession(ctx, {
        sessionId: sessionA,
        commerceInstanceId: instanceId,
      }),
    )

    expect(storeA.created).toBe(true)
    expect(storeB.created).toBe(true)
    expect(storeA.storeId).not.toBe(storeB.storeId)
    expect(storeAAgain.created).toBe(false)
    expect(storeAAgain.storeId).toBe(storeA.storeId)

    const gatewayA = await t.run((ctx) =>
      resolveCommerceStoreGatewayBySession(ctx, sessionA),
    )
    const gatewayB = await t.run((ctx) =>
      resolveCommerceStoreGatewayBySession(ctx, sessionB),
    )
    expect(gatewayA?.instance._id).toBe(instanceId)
    expect(gatewayB?.instance._id).toBe(instanceId)
    expect(gatewayA?.store._id).toBe(storeA.storeId)
    expect(gatewayB?.store._id).toBe(storeB.storeId)
  })

  it('never resolves one customer store gateway through another customer instance', async () => {
    const t = convexTest(schema, modules)
    const { instanceId: instanceA } = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId: 'owner-isolation-a',
        provider: 'medusa',
      }),
    )
    const { instanceId: instanceB } = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId: 'owner-isolation-b',
        provider: 'medusa',
      }),
    )
    const sessionA = await insertSession(t, 'owner-isolation-a')
    const sessionB = await insertSession(t, 'owner-isolation-b')
    await t.run((ctx) =>
      ensureCommerceStoreForSession(ctx, {
        sessionId: sessionA,
        commerceInstanceId: instanceA,
      }),
    )
    await t.run((ctx) =>
      ensureCommerceStoreForSession(ctx, {
        sessionId: sessionB,
        commerceInstanceId: instanceB,
      }),
    )

    const gatewayA = await t.run((ctx) =>
      resolveCommerceStoreGatewayBySession(ctx, sessionA),
    )
    const gatewayB = await t.run((ctx) =>
      resolveCommerceStoreGatewayBySession(ctx, sessionB),
    )

    expect(gatewayA?.instance._id).toBe(instanceA)
    expect(gatewayA?.instance._id).not.toBe(instanceB)
    expect(gatewayB?.instance._id).toBe(instanceB)
    expect(gatewayB?.instance._id).not.toBe(instanceA)
  })

  it('resolves the same gateway via a deployment binding', async () => {
    const t = convexTest(schema, modules)
    const ownerUserId = 'owner-deployment-binding'
    const { instanceId } = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId,
        provider: 'medusa',
      }),
    )
    const sessionId = await insertSession(t, ownerUserId)
    const deploymentId = await t.run((ctx) =>
      ctx.db.insert('deployments', {
        sessionId,
        slug: 'deployment-binding',
        url: 'https://deployment-binding.example',
        status: 'ready',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    )
    const { storeId } = await t.run((ctx) =>
      ensureCommerceStoreForSession(ctx, {
        sessionId,
        commerceInstanceId: instanceId,
        deploymentId,
      }),
    )

    const gateway = await t.run((ctx) =>
      resolveCommerceStoreGatewayByDeployment(ctx, deploymentId),
    )
    expect(gateway?.store._id).toBe(storeId)
    expect(gateway?.instance._id).toBe(instanceId)
  })
})

describe('instance-lifecycle operation idempotency', () => {
  it('replays the stored result for a duplicate idempotency key + request', async () => {
    const t = convexTest(schema, modules)
    const { instanceId } = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId: 'owner-op-replay',
        provider: 'medusa',
      }),
    )
    const begin = await t.run((ctx) =>
      beginCommerceInstanceOperation(ctx, {
        commerceInstanceId: instanceId,
        kind: 'provision_instance',
        idempotencyKey: 'idem-1',
        requestHash: 'hash-a',
        leaseMs: 60_000,
        ttlMs: 3_600_000,
      }),
    )
    expect(begin.decision).toEqual({ type: 'execute', attempt: 1 })

    await t.run((ctx) =>
      completeCommerceInstanceOperation(ctx, begin.operationId, {
        state: 'succeeded',
        resultJson: JSON.stringify({ providerReference: 'stack-1' }),
      }),
    )

    const replay = await t.run((ctx) =>
      beginCommerceInstanceOperation(ctx, {
        commerceInstanceId: instanceId,
        kind: 'provision_instance',
        idempotencyKey: 'idem-1',
        requestHash: 'hash-a',
        leaseMs: 60_000,
        ttlMs: 3_600_000,
      }),
    )

    expect(replay.decision).toEqual({
      type: 'replay',
      resultJson: JSON.stringify({ providerReference: 'stack-1' }),
    })
    expect(replay.operationId).toBe(begin.operationId)
  })

  it('reports in-progress while a lease is held and conflict on a mismatched request', async () => {
    const t = convexTest(schema, modules)
    const { instanceId } = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId: 'owner-op-inflight',
        provider: 'medusa',
      }),
    )
    await t.run((ctx) =>
      beginCommerceInstanceOperation(ctx, {
        commerceInstanceId: instanceId,
        kind: 'suspend',
        idempotencyKey: 'idem-2',
        requestHash: 'hash-a',
        leaseMs: 60_000,
        ttlMs: 3_600_000,
      }),
    )

    const duplicateSameRequest = await t.run((ctx) =>
      beginCommerceInstanceOperation(ctx, {
        commerceInstanceId: instanceId,
        kind: 'suspend',
        idempotencyKey: 'idem-2',
        requestHash: 'hash-a',
        leaseMs: 60_000,
        ttlMs: 3_600_000,
      }),
    )
    expect(duplicateSameRequest.decision.type).toBe('in-progress')

    const conflictingRequest = await t.run((ctx) =>
      beginCommerceInstanceOperation(ctx, {
        commerceInstanceId: instanceId,
        kind: 'suspend',
        idempotencyKey: 'idem-2',
        requestHash: 'hash-b',
        leaseMs: 60_000,
        ttlMs: 3_600_000,
      }),
    )
    expect(conflictingRequest.decision).toEqual({ type: 'conflict' })
  })

  it('does not retry a failed, non-retryable operation', async () => {
    const t = convexTest(schema, modules)
    const { instanceId } = await t.run((ctx) =>
      ensureCommerceInstanceForOwner(ctx, {
        ownerUserId: 'owner-op-failed',
        provider: 'medusa',
      }),
    )
    const begin = await t.run((ctx) =>
      beginCommerceInstanceOperation(ctx, {
        commerceInstanceId: instanceId,
        kind: 'delete',
        idempotencyKey: 'idem-3',
        requestHash: 'hash-a',
        leaseMs: 60_000,
        ttlMs: 3_600_000,
      }),
    )
    await t.run((ctx) =>
      completeCommerceInstanceOperation(ctx, begin.operationId, {
        state: 'failed',
        retryable: false,
        failureCode: 'PROVIDER_REJECTED',
      }),
    )

    const retry = await t.run((ctx) =>
      beginCommerceInstanceOperation(ctx, {
        commerceInstanceId: instanceId,
        kind: 'delete',
        idempotencyKey: 'idem-3',
        requestHash: 'hash-a',
        leaseMs: 60_000,
        ttlMs: 3_600_000,
      }),
    )
    expect(retry.decision).toEqual({
      type: 'failed',
      retryable: false,
      failureCode: 'PROVIDER_REJECTED',
    })
  })
})
