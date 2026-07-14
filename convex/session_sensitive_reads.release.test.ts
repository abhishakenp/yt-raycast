/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const issuer = 'https://clerk.release.test'

function sensitiveReadsTest() {
  return convexTest(schema, modules)
}

type SensitiveReader = Pick<ReturnType<typeof sensitiveReadsTest>, 'query'>

function asUser(t: ReturnType<typeof sensitiveReadsTest>, userId: string) {
  return t.withIdentity({
    issuer,
    subject: userId,
    tokenIdentifier: `${issuer}|${userId}`,
  })
}

async function insertSensitiveSession(
  t: ReturnType<typeof sensitiveReadsTest>,
) {
  return await t.run(async (ctx) => {
    const now = Date.now()
    const userId = `${issuer}|alice`
    const sessionId = await ctx.db.insert('sessions', {
      userId,
      prompt: 'Confidential release customer',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: true,
      status: 'preview_ready',
      previewVersion: 3,
      createdAt: now,
    })
    await ctx.db.insert('exports', {
      sessionId,
      target: 'html',
      status: 'ready',
      previewVersion: 3,
      downloadUrl: `/api/sessions/${sessionId}/exports/html/download`,
      githubUrl: 'https://github.com/release-owner/private-repository',
      fileCount: 4,
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('exportArtifacts', {
      sessionId,
      target: 'html',
      previewVersion: 3,
      status: 'ready',
      filename: 'confidential-export.zip',
      contentType: 'application/zip',
      fileCount: 4,
      byteLength: 2048,
      hash: 'confidential-artifact-hash',
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('deployments', {
      sessionId,
      slug: 'confidential-release',
      url: 'https://confidential-release.lakebed.test',
      status: 'ready',
      provider: 'lakebed',
      previewVersion: 3,
      lakebedDeployId: 'private-deploy-id',
      lakebedClaimUrl: 'https://claim.lakebed.test/private-capability',
      lakebedArtifactHash: 'private-lakebed-hash',
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('usageMetrics', {
      sessionId,
      eventType: 'generation',
      timestamp: now,
      elapsedMs: 12_345,
      cost: 4.25,
      provider: 'private-provider',
      userId,
    })
    return sessionId
  })
}

function emptyUsageSummary() {
  return {
    totalCost: 0,
    totalElapsedMs: 0,
    count: 0,
    byProvider: {},
    byEventType: {},
  }
}

async function assertPrivateSessionReadsAreHidden(
  t: SensitiveReader,
  sessionId: Id<'sessions'>,
) {
  const [exportRecord, exportTargets, deployment, deploymentLookup, usage] =
    await Promise.all([
      t.query(api.sessions.getExport, { sessionId, target: 'html' }),
      t.query(api.sessions.getExportTargets, { lookup: sessionId }),
      t.query(api.sessions.getDeploymentStatus, { sessionId }),
      t.query(api.sessions.getDeploymentStatusByLookup, { lookup: sessionId }),
      t.query(api.sessions.getUsageMetrics, { sessionId }),
    ])

  expect({
    deployment,
    deploymentLookup,
    exportRecord,
    exportTargets,
    usage,
  }).toEqual({
    deployment: null,
    deploymentLookup: null,
    exportRecord: null,
    exportTargets: {
      sessionId,
      previewReady: false,
      isPrivate: null,
      targets: [],
    },
    usage: emptyUsageSummary(),
  })
}

describe('private session sensitive read boundaries', () => {
  it('hides export, deployment, and usage details from anonymous callers', async () => {
    const t = sensitiveReadsTest()
    const sessionId = await insertSensitiveSession(t)

    await assertPrivateSessionReadsAreHidden(t, sessionId)
  })

  it('hides export, deployment, and usage details from another user', async () => {
    const t = sensitiveReadsTest()
    const sessionId = await insertSensitiveSession(t)

    await assertPrivateSessionReadsAreHidden(asUser(t, 'bob'), sessionId)
  })

  it('does not expose arbitrary users usage totals', async () => {
    const t = sensitiveReadsTest()
    await insertSensitiveSession(t)
    const aliceId = `${issuer}|alice`

    const anonymous = await Promise.allSettled([
      t.query(api.sessions.getUserUsageMetrics, { userId: aliceId }),
    ])
    const foreign = await Promise.allSettled([
      asUser(t, 'bob').query(api.sessions.getUserUsageMetrics, {
        userId: aliceId,
      }),
    ])

    expect({
      anonymous: anonymous.map((entry) => entry.status),
      foreign: foreign.map((entry) => entry.status),
    }).toEqual({ anonymous: ['rejected'], foreign: ['rejected'] })
  })

  it('keeps sensitive reads available to the private session owner', async () => {
    const t = sensitiveReadsTest()
    const sessionId = await insertSensitiveSession(t)
    const alice = asUser(t, 'alice')

    await expect(
      alice.query(api.sessions.getExport, { sessionId, target: 'html' }),
    ).resolves.toMatchObject({ status: 'ready', fileCount: 4 })
    await expect(
      alice.query(api.sessions.getExportTargets, { lookup: sessionId }),
    ).resolves.toMatchObject({
      sessionId,
      previewReady: true,
      isPrivate: true,
    })
    await expect(
      alice.query(api.sessions.getDeploymentStatus, { sessionId }),
    ).resolves.toMatchObject({
      provider: 'lakebed',
      lakebedDeployId: 'private-deploy-id',
      lakebedClaimUrl: 'https://claim.lakebed.test/private-capability',
    })
    await expect(
      alice.query(api.sessions.getUsageMetrics, { sessionId }),
    ).resolves.toEqual({
      totalCost: 4.25,
      totalElapsedMs: 12_345,
      count: 1,
      byProvider: { 'private-provider': 1 },
      byEventType: { generation: 1 },
    })
  })
})
