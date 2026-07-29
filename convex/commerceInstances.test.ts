import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const issuer = 'https://clerk.commerce-access.test'

function commerceAccessTest() {
  return convexTest(schema, modules)
}

function asUser(t: ReturnType<typeof commerceAccessTest>, userId: string) {
  return t.withIdentity({
    issuer,
    subject: userId,
    tokenIdentifier: `${issuer}|${userId}`,
    email: `${userId}@example.com`,
  })
}

async function insertSession(
  t: ReturnType<typeof commerceAccessTest>,
  userId: string,
) {
  return t.run((ctx) =>
    ctx.db.insert('sessions', {
      userId: `${issuer}|${userId}`,
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

async function grantEntitlement(
  t: ReturnType<typeof commerceAccessTest>,
  userId: string,
  currentPeriodEnd: number,
) {
  await t.run((ctx) =>
    ctx.db.insert('subscriptions', {
      userId: `${issuer}|${userId}`,
      provider: 'stripe',
      status: 'active',
      planId: 'pro',
      providerSubscriptionId: `sub_${userId}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentPeriodEnd,
    }),
  )
}

describe('getCommerceAccess', () => {
  it('reports signed-out for anonymous callers', async () => {
    const t = commerceAccessTest()
    const sessionId = await insertSession(t, 'owner-signed-out')

    const result = await t.query(api.commerceInstances.getCommerceAccess, {
      sessionId,
    })
    expect(result).toEqual({ authState: 'signed-out' })
  })

  it('reports unpaid for a signed-in user without an active subscription', async () => {
    const t = commerceAccessTest()
    const sessionId = await insertSession(t, 'owner-unpaid')

    const result = await asUser(t, 'owner-unpaid').query(
      api.commerceInstances.getCommerceAccess,
      { sessionId },
    )
    expect(result).toEqual({ authState: 'unpaid' })
  })

  it('reports paid + not enabled for a paid user who has not enabled commerce yet', async () => {
    const t = commerceAccessTest()
    const sessionId = await insertSession(t, 'owner-paid')
    await grantEntitlement(t, 'owner-paid', Date.now() + 86_400_000)

    const result = await asUser(t, 'owner-paid').query(
      api.commerceInstances.getCommerceAccess,
      { sessionId },
    )
    expect(result).toEqual({
      authState: 'paid',
      enabled: false,
      instanceStatus: null,
      storeStatus: null,
    })
  })

  it('remains paid+entitled after cancellation is scheduled but before the period ends', async () => {
    const t = commerceAccessTest()
    const sessionId = await insertSession(t, 'owner-scheduled-cancel')
    const periodEnd = Date.now() + 86_400_000
    await t.run((ctx) =>
      ctx.db.insert('subscriptions', {
        userId: `${issuer}|owner-scheduled-cancel`,
        provider: 'stripe',
        status: 'cancelled',
        planId: 'pro',
        providerSubscriptionId: 'sub_scheduled_cancel',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        canceledAt: Date.now(),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: true,
      }),
    )

    const result = await asUser(t, 'owner-scheduled-cancel').query(
      api.commerceInstances.getCommerceAccess,
      { sessionId },
    )
    expect(result).toMatchObject({ authState: 'paid' })
  })

  it('rejects a signed-in user reading a session they do not own', async () => {
    const t = commerceAccessTest()
    const sessionId = await insertSession(t, 'session-owner')
    await grantEntitlement(t, 'other-user', Date.now() + 86_400_000)

    await expect(
      asUser(t, 'other-user').query(api.commerceInstances.getCommerceAccess, {
        sessionId,
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'FORBIDDEN' }),
    })
  })
})

describe('enableCommerce', () => {
  it('requires authentication', async () => {
    const t = commerceAccessTest()
    const sessionId = await insertSession(t, 'owner-anon')

    await expect(
      t.mutation(api.commerceInstances.enableCommerce, { sessionId }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'AUTH_REQUIRED' }),
    })
  })

  it('requires a paid subscription before creating any infrastructure state', async () => {
    const t = commerceAccessTest()
    const sessionId = await insertSession(t, 'owner-unpaid-enable')

    await expect(
      asUser(t, 'owner-unpaid-enable').mutation(
        api.commerceInstances.enableCommerce,
        { sessionId },
      ),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'PAYMENT_REQUIRED' }),
    })

    const instances = await t.run((ctx) => ctx.db.query('commerceInstances').collect())
    expect(instances).toHaveLength(0)
  })

  it('creates exactly one instance and one store for a paid user enabling their first session', async () => {
    const t = commerceAccessTest()
    const sessionId = await insertSession(t, 'owner-first-enable')
    await grantEntitlement(t, 'owner-first-enable', Date.now() + 86_400_000)

    const result = await asUser(t, 'owner-first-enable').mutation(
      api.commerceInstances.enableCommerce,
      { sessionId },
    )
    expect(result.instanceCreated).toBe(true)
    expect(result.storeCreated).toBe(true)

    const access = await asUser(t, 'owner-first-enable').query(
      api.commerceInstances.getCommerceAccess,
      { sessionId },
    )
    expect(access).toMatchObject({ authState: 'paid', enabled: true })
  })

  it('reuses the same instance and creates only a new store for a second session from the same paid customer', async () => {
    const t = commerceAccessTest()
    const userId = 'owner-multi-session'
    await grantEntitlement(t, userId, Date.now() + 86_400_000)
    const sessionA = await insertSession(t, userId)
    const sessionB = await insertSession(t, userId)
    const owner = asUser(t, userId)

    const first = await owner.mutation(api.commerceInstances.enableCommerce, {
      sessionId: sessionA,
    })
    const second = await owner.mutation(api.commerceInstances.enableCommerce, {
      sessionId: sessionB,
    })

    expect(second.commerceInstanceId).toBe(first.commerceInstanceId)
    expect(second.commerceStoreId).not.toBe(first.commerceStoreId)
    expect(second.instanceCreated).toBe(false)
    expect(second.storeCreated).toBe(true)

    const instances = await t.run((ctx) => ctx.db.query('commerceInstances').collect())
    expect(instances).toHaveLength(1)
  })

  it('is idempotent for repeated enable calls on the same session', async () => {
    const t = commerceAccessTest()
    const userId = 'owner-idempotent-enable'
    await grantEntitlement(t, userId, Date.now() + 86_400_000)
    const sessionId = await insertSession(t, userId)
    const owner = asUser(t, userId)

    const first = await owner.mutation(api.commerceInstances.enableCommerce, {
      sessionId,
    })
    const duplicate = await owner.mutation(
      api.commerceInstances.enableCommerce,
      { sessionId },
    )

    expect(duplicate).toEqual({
      ...first,
      instanceCreated: false,
      storeCreated: false,
    })
    const stores = await t.run((ctx) => ctx.db.query('commerceStores').collect())
    expect(stores).toHaveLength(1)
  })

  it('never lets customer A resolve or enable commerce inside customer B session', async () => {
    const t = commerceAccessTest()
    await grantEntitlement(t, 'customer-a', Date.now() + 86_400_000)
    await grantEntitlement(t, 'customer-b', Date.now() + 86_400_000)
    const sessionB = await insertSession(t, 'customer-b')

    await expect(
      asUser(t, 'customer-a').mutation(api.commerceInstances.enableCommerce, {
        sessionId: sessionB,
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'FORBIDDEN' }),
    })
  })
})

describe('requestAdminSso', () => {
  it('fails with COMMERCE_NOT_READY before commerce has been enabled', async () => {
    const t = commerceAccessTest()
    const userId = 'owner-not-ready'
    await grantEntitlement(t, userId, Date.now() + 86_400_000)
    const sessionId = await insertSession(t, userId)

    await expect(
      asUser(t, userId).mutation(api.commerceInstances.requestAdminSso, {
        sessionId,
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'COMMERCE_NOT_READY' }),
    })
  })

  it('rejects a caller who does not own the session', async () => {
    const t = commerceAccessTest()
    await grantEntitlement(t, 'owner-sso', Date.now() + 86_400_000)
    const sessionId = await insertSession(t, 'owner-sso')

    await expect(
      asUser(t, 'someone-else').mutation(
        api.commerceInstances.requestAdminSso,
        { sessionId },
      ),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'FORBIDDEN' }),
    })
  })
})
