/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api, internal } from './_generated/api'
import { hashOwnerSecret } from './lib/session_access_helpers'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const issuer = 'https://clerk.release.test'

function identityFor(userId: string) {
  return {
    issuer,
    subject: userId,
    tokenIdentifier: `${issuer}|${userId}`,
  }
}

function asUser(t: ReturnType<typeof convexTest>, userId: string) {
  return t.withIdentity(identityFor(userId))
}

async function createSession(
  t: ReturnType<typeof convexTest>,
  options: {
    anonymousOwnerSecretHash?: string
    isPrivate?: boolean
    userId?: string
  } = {},
) {
  return await t.run(
    async (ctx) =>
      await ctx.db.insert('sessions', {
        userId: options.userId,
        anonOwnerSecretHash: options.anonymousOwnerSecretHash,
        prompt: 'Lakebed persistence boundary',
        preferredLanguage: 'en',
        preferredExportTarget: 'lakebed',
        isPrivate: options.isPrivate ?? false,
        createdAt: Date.now(),
      }),
  )
}

async function seedShared(
  t: ReturnType<typeof convexTest>,
  sessionId: Awaited<ReturnType<typeof createSession>>,
) {
  await t.mutation(internal.lakebed.seedSharedSessionData, {
    sessionId,
    capsule: 'Store',
    data: { catalogVersion: 'seed-v1' },
  })
}

describe('Lakebed ownership and shared persistence boundaries', () => {
  it('serves shared seed data to a public unauthenticated reader', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await createSession(t)
    await seedShared(t, sessionId)

    const data = await t.query(api.lakebed.getSessionData, {
      sessionId,
      capsule: 'Store',
    })
    const state = await t.query(api.lakebed.getSessionState, {
      sessionId,
      capsule: 'Store',
    })

    expect({ data, state }).toMatchObject({
      data: { catalogVersion: 'seed-v1' },
      state: {
        canWrite: false,
        data: { catalogVersion: 'seed-v1' },
      },
    })
  })

  it('keeps the shared seed row intact when an actor merges local state', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await createSession(t)
    await seedShared(t, sessionId)

    await asUser(t, 'visitor-one').mutation(api.lakebed.mergeSessionData, {
      sessionId,
      capsule: 'Store',
      patch: { cartCount: 2 },
    })

    const firstVisitor = await asUser(t, 'visitor-one').query(
      api.lakebed.getSessionData,
      { sessionId, capsule: 'Store' },
    )
    const secondVisitor = await asUser(t, 'visitor-two').query(
      api.lakebed.getSessionData,
      { sessionId, capsule: 'Store' },
    )
    const rows = await t.run(
      async (ctx) =>
        await ctx.db
          .query('sessionData')
          .withIndex('by_sessionId_capsule', (index) =>
            index.eq('sessionId', sessionId).eq('capsule', 'Store'),
          )
          .collect(),
    )

    expect({ firstVisitor, secondVisitor, rows: rows.length }).toEqual({
      firstVisitor: { catalogVersion: 'seed-v1', cartCount: 2 },
      secondVisitor: { catalogVersion: 'seed-v1' },
      rows: 2,
    })
  })

  it('keeps the shared seed row intact when an actor replaces local state', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await createSession(t)
    await seedShared(t, sessionId)

    await asUser(t, 'visitor-one').mutation(api.lakebed.replaceSessionData, {
      sessionId,
      capsule: 'Store',
      data: { selectedProduct: 'product-1' },
    })

    const firstVisitor = await asUser(t, 'visitor-one').query(
      api.lakebed.getSessionData,
      { sessionId, capsule: 'Store' },
    )
    const secondVisitor = await asUser(t, 'visitor-two').query(
      api.lakebed.getSessionData,
      { sessionId, capsule: 'Store' },
    )

    expect({ firstVisitor, secondVisitor }).toEqual({
      firstVisitor: { selectedProduct: 'product-1' },
      secondVisitor: { catalogVersion: 'seed-v1' },
    })
  })

  it('rejects every private-session data operation from a non-owner', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await createSession(t, {
      isPrivate: true,
      userId: `${issuer}|owner`,
    })
    const attacker = asUser(t, 'attacker')
    const results = await Promise.allSettled([
      attacker.query(api.lakebed.getSessionData, {
        sessionId,
        capsule: 'Store',
      }),
      attacker.query(api.lakebed.getSessionState, {
        sessionId,
        capsule: 'Store',
      }),
      attacker.query(api.lakebed.listSessionData, { sessionId }),
      attacker.mutation(api.lakebed.mergeSessionData, {
        sessionId,
        capsule: 'Store',
        patch: { compromised: true },
      }),
      attacker.mutation(api.lakebed.replaceSessionData, {
        sessionId,
        capsule: 'Store',
        data: { compromised: true },
      }),
    ])

    expect(results.map((result) => result.status)).toEqual([
      'rejected',
      'rejected',
      'rejected',
      'rejected',
      'rejected',
    ])
  })

  it('allows only the matching anonymous owner secret on a private session', async () => {
    const t = convexTest(schema, modules)
    const ownerSecret = 'anonymous-lakebed-owner'
    const sessionId = await createSession(t, {
      isPrivate: true,
      anonymousOwnerSecretHash: await hashOwnerSecret(ownerSecret),
    })

    await expect(
      t.mutation(api.lakebed.mergeSessionData, {
        sessionId,
        capsule: 'Store',
        anonymousOwnerSecret: ownerSecret,
        patch: { count: 1 },
      }),
    ).resolves.toEqual({ count: 1 })
    await expect(
      t.query(api.lakebed.getSessionData, {
        sessionId,
        capsule: 'Store',
        anonymousOwnerSecret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({ data: { code: 'FORBIDDEN' } })
  })
})
