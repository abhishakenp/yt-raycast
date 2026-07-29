import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import schema from '../schema'
import { runCommerceLifecycleSweep } from './commerce_lifecycle_helpers'

const modules = import.meta.glob('../**/*.ts')

async function insertInstance(
  t: ReturnType<typeof convexTest>,
  overrides: Partial<{
    ownerUserId: string
    status:
      | 'provisioning'
      | 'ready'
      | 'degraded'
      | 'suspending'
      | 'suspended'
      | 'resuming'
      | 'failed'
      | 'deleting'
      | 'deleted'
    suspendedAt: number
  }> = {},
) {
  return t.run((ctx) =>
    ctx.db.insert('commerceInstances', {
      ownerUserId: overrides.ownerUserId ?? 'owner-default',
      status: overrides.status ?? 'ready',
      provider: 'medusa',
      suspendedAt: overrides.suspendedAt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  )
}

async function grantEntitlement(
  t: ReturnType<typeof convexTest>,
  ownerUserId: string,
  currentPeriodEnd: number,
) {
  await t.run((ctx) =>
    ctx.db.insert('subscriptions', {
      userId: ownerUserId,
      provider: 'stripe',
      status: 'active',
      planId: 'pro',
      providerSubscriptionId: `sub_${ownerUserId}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentPeriodEnd,
    }),
  )
}

describe('runCommerceLifecycleSweep', () => {
  it('suspends a ready instance whose owner has no active entitlement', async () => {
    const t = convexTest(schema, modules)
    const instanceId = await insertInstance(t, {
      ownerUserId: 'owner-expired',
      status: 'ready',
    })

    const result = await t.run((ctx) => runCommerceLifecycleSweep(ctx))

    expect(result).toEqual({ suspended: 1, deleted: 0 })
    const instance = await t.run((ctx) => ctx.db.get(instanceId))
    expect(instance?.status).toBe('suspending')
  })

  it('does not suspend a ready instance whose owner is still entitled', async () => {
    const t = convexTest(schema, modules)
    const now = Date.now()
    await grantEntitlement(t, 'owner-still-paid', now + 86_400_000)
    const instanceId = await insertInstance(t, {
      ownerUserId: 'owner-still-paid',
      status: 'ready',
    })

    const result = await t.run((ctx) => runCommerceLifecycleSweep(ctx, now))

    expect(result).toEqual({ suspended: 0, deleted: 0 })
    const instance = await t.run((ctx) => ctx.db.get(instanceId))
    expect(instance?.status).toBe('ready')
  })

  it('also sweeps degraded instances, not only ready ones', async () => {
    const t = convexTest(schema, modules)
    const instanceId = await insertInstance(t, {
      ownerUserId: 'owner-degraded-expired',
      status: 'degraded',
    })

    const result = await t.run((ctx) => runCommerceLifecycleSweep(ctx))

    expect(result).toEqual({ suspended: 1, deleted: 0 })
    const instance = await t.run((ctx) => ctx.db.get(instanceId))
    expect(instance?.status).toBe('suspending')
  })

  it('deletes a suspended instance past the 30-day retention window when still unentitled', async () => {
    const t = convexTest(schema, modules)
    const now = Date.now()
    const thirtyOneDaysAgo = now - 31 * 24 * 60 * 60 * 1000
    const instanceId = await insertInstance(t, {
      ownerUserId: 'owner-retention-expired',
      status: 'suspended',
      suspendedAt: thirtyOneDaysAgo,
    })

    const result = await t.run((ctx) => runCommerceLifecycleSweep(ctx, now))

    expect(result).toEqual({ suspended: 0, deleted: 1 })
    const instance = await t.run((ctx) => ctx.db.get(instanceId))
    expect(instance?.status).toBe('deleting')
  })

  it('does not delete a suspended instance still inside the 30-day retention window', async () => {
    const t = convexTest(schema, modules)
    const now = Date.now()
    const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000
    const instanceId = await insertInstance(t, {
      ownerUserId: 'owner-within-retention',
      status: 'suspended',
      suspendedAt: tenDaysAgo,
    })

    const result = await t.run((ctx) => runCommerceLifecycleSweep(ctx, now))

    expect(result).toEqual({ suspended: 0, deleted: 0 })
    const instance = await t.run((ctx) => ctx.db.get(instanceId))
    expect(instance?.status).toBe('suspended')
  })

  it('resumes-in-place instead of deleting when repayment lands during the retention window', async () => {
    const t = convexTest(schema, modules)
    const now = Date.now()
    const thirtyOneDaysAgo = now - 31 * 24 * 60 * 60 * 1000
    await grantEntitlement(t, 'owner-repaid-during-retention', now + 86_400_000)
    const instanceId = await insertInstance(t, {
      ownerUserId: 'owner-repaid-during-retention',
      status: 'suspended',
      suspendedAt: thirtyOneDaysAgo,
    })

    const result = await t.run((ctx) => runCommerceLifecycleSweep(ctx, now))

    expect(result).toEqual({ suspended: 0, deleted: 0 })
    const instance = await t.run((ctx) => ctx.db.get(instanceId))
    expect(instance?.status).toBe('suspended')
  })

  it('ignores instances in unrelated states (provisioning, deleted)', async () => {
    const t = convexTest(schema, modules)
    await insertInstance(t, {
      ownerUserId: 'owner-provisioning',
      status: 'provisioning',
    })
    await insertInstance(t, { ownerUserId: 'owner-deleted', status: 'deleted' })

    const result = await t.run((ctx) => runCommerceLifecycleSweep(ctx))

    expect(result).toEqual({ suspended: 0, deleted: 0 })
  })

  it('is safe to run repeatedly (already-suspending instances are not re-processed)', async () => {
    const t = convexTest(schema, modules)
    await insertInstance(t, { ownerUserId: 'owner-idempotent', status: 'ready' })

    const first = await t.run((ctx) => runCommerceLifecycleSweep(ctx))
    const second = await t.run((ctx) => runCommerceLifecycleSweep(ctx))

    expect(first).toEqual({ suspended: 1, deleted: 0 })
    expect(second).toEqual({ suspended: 0, deleted: 0 })
  })
})
