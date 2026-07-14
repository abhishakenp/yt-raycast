/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'
import { hashOwnerSecret } from './lib/session_access_helpers'

const modules = import.meta.glob('./**/*.ts')
const ownerSecret = 'commerce-release-owner-secret'

function commerceReleaseTest() {
  return convexTest(schema, modules)
}

async function insertOwnedSession(
  t: ReturnType<typeof commerceReleaseTest>,
  suffix: string,
) {
  const anonOwnerSecretHash = await hashOwnerSecret(ownerSecret)
  return await t.run(async (ctx) =>
    ctx.db.insert('sessions', {
      anonOwnerSecretHash,
      prompt: `Commerce release fixture ${suffix}`,
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      status: 'preview_ready',
      previewVersion: 1,
      createdAt: 1,
    }),
  )
}

async function insertOwnedDeployment(
  t: ReturnType<typeof commerceReleaseTest>,
  suffix: string,
) {
  const sessionId = await insertOwnedSession(t, suffix)
  const deploymentSlug = `commerce-release-${suffix}`
  await t.run(async (ctx) => {
    await ctx.db.insert('deployments', {
      sessionId,
      slug: deploymentSlug,
      url: `https://${deploymentSlug}.example.test`,
      status: 'ready',
      provider: 'ship-fast',
      previewVersion: 1,
      createdAt: 1,
      updatedAt: 1,
    })
  })
  return { deploymentSlug, sessionId }
}

async function tenantCount(
  t: ReturnType<typeof commerceReleaseTest>,
  deploymentSlug: string,
) {
  return await t.run(async (ctx) =>
    ctx.db
      .query('commerceTenants')
      .withIndex('by_deploymentSlug', (index) =>
        index.eq('deploymentSlug', deploymentSlug),
      )
      .collect()
      .then((tenants) => tenants.length),
  )
}

describe('commerce persistence validation release boundaries', () => {
  it('rejects invalid session-commerce counts and URLs before writing config', async () => {
    const t = commerceReleaseTest()
    const sessionId = await insertOwnedSession(t, 'session-config')
    const attempts = await Promise.allSettled([
      t.mutation(api.sessions.upsertCommerceConfig, {
        sessionId,
        anonymousOwnerSecret: ownerSecret,
        productCount: -1,
      }),
      t.mutation(api.sessions.upsertCommerceConfig, {
        sessionId,
        anonymousOwnerSecret: ownerSecret,
        productCount: 1.5,
      }),
      t.mutation(api.sessions.upsertCommerceConfig, {
        sessionId,
        anonymousOwnerSecret: ownerSecret,
        backendUrl: 'javascript:alert(1)',
      }),
    ])

    expect({
      attemptStatuses: attempts.map((attempt) => attempt.status),
      config: await t.query(api.sessions.getCommerceConfig, { sessionId }),
    }).toEqual({
      attemptStatuses: ['rejected', 'rejected', 'rejected'],
      config: null,
    })
  })

  it('rejects malformed tenant provisioning atomically', async () => {
    const t = commerceReleaseTest()
    const { deploymentSlug } = await insertOwnedDeployment(t, 'tenant-input')
    const baseArgs = {
      deploymentSlug,
      anonymousOwnerSecret: ownerSecret,
      provider: 'manual',
      backendUrl: 'https://backend.example.test',
      adminUrl: 'https://admin.example.test',
      storefrontUrl: 'https://store.example.test',
    }
    const attempts = await Promise.allSettled([
      t.mutation(api.sessions.upsertCommerceTenant, {
        ...baseArgs,
        provider: '   ',
      }),
      t.mutation(api.sessions.upsertCommerceTenant, {
        ...baseArgs,
        backendUrl: 'file:///etc/passwd',
      }),
      t.mutation(api.sessions.upsertCommerceTenant, {
        ...baseArgs,
        productCount: -1,
      }),
      t.mutation(api.sessions.upsertCommerceTenant, {
        ...baseArgs,
        productCount: 0.5,
      }),
    ])

    expect({
      attemptStatuses: attempts.map((attempt) => attempt.status),
      tenantCount: await tenantCount(t, deploymentSlug),
    }).toEqual({
      attemptStatuses: ['rejected', 'rejected', 'rejected', 'rejected'],
      tenantCount: 0,
    })
  })

  it('rejects invalid pull counts without regressing persisted tenant state', async () => {
    const t = commerceReleaseTest()
    const { deploymentSlug } = await insertOwnedDeployment(t, 'pull-count')
    await t.mutation(api.sessions.upsertCommerceTenant, {
      deploymentSlug,
      anonymousOwnerSecret: ownerSecret,
      provider: 'manual',
      backendUrl: 'https://backend.example.test',
      adminUrl: 'https://admin.example.test',
      storefrontUrl: 'https://store.example.test',
      productCount: 4,
    })

    const attempts = await Promise.allSettled([
      t.mutation(api.sessions.recordCommerceTenantPull, {
        deploymentSlug,
        anonymousOwnerSecret: ownerSecret,
        source: 'manual',
        productCount: -1,
      }),
      t.mutation(api.sessions.recordCommerceTenantPull, {
        deploymentSlug,
        anonymousOwnerSecret: ownerSecret,
        source: 'manual',
        productCount: 2.5,
      }),
    ])
    const tenant = await t.query(
      api.sessions.getCommerceTenantByDeploymentSlug,
      { deploymentSlug },
    )

    expect({
      attemptStatuses: attempts.map((attempt) => attempt.status),
      productCount: tenant?.productCount,
    }).toEqual({
      attemptStatuses: ['rejected', 'rejected'],
      productCount: 4,
    })
  })
})
