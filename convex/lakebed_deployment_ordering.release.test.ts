/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

function deploymentOrderingTest() {
  return convexTest(schema, modules)
}

async function insertReleaseSession(
  t: ReturnType<typeof deploymentOrderingTest>,
) {
  return await t.run(async (ctx) => {
    const now = Date.now()
    return await ctx.db.insert('sessions', {
      userId: 'release-owner',
      prompt: 'Lakebed ordering release fixture',
      preferredLanguage: 'en',
      preferredExportTarget: 'lakebed',
      isPrivate: true,
      status: 'preview_ready',
      previewVersion: 4,
      createdAt: now,
    })
  })
}

function successArgs(
  sessionId: Id<'sessions'>,
  previewVersion: number,
  suffix: string,
) {
  return {
    sessionId,
    previewVersion,
    url: `https://release-${suffix}.lakebed.test`,
    deployId: `deploy-${suffix}`,
    claimUrl: `https://claim.lakebed.test/${suffix}`,
    artifactHash: `artifact-${suffix}`,
    clientBundleHash: `client-${suffix}`,
    clientBundleBytes: previewVersion * 100,
    requestBodyBytes: previewVersion * 200,
    serverBundleBytes: previewVersion * 300,
    sourceFileCount: previewVersion,
    expiresAt: `2026-07-${String(previewVersion).padStart(2, '0')}T00:00:00Z`,
    inspectPolicy: `policy-${suffix}`,
  }
}

async function persistedDeploymentState(
  t: ReturnType<typeof deploymentOrderingTest>,
  sessionId: Id<'sessions'>,
) {
  return await t.run(async (ctx) => {
    const deployments = await ctx.db
      .query('deployments')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const exportsForSession = await ctx.db
      .query('exports')
      .withIndex('by_sessionId_target', (index) =>
        index.eq('sessionId', sessionId).eq('target', 'lakebed'),
      )
      .collect()
    const events = await ctx.db
      .query('generationEvents')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', sessionId),
      )
      .collect()

    return {
      deployments: deployments.map((deployment) => ({
        artifactHash: deployment.lakebedArtifactHash,
        deployId: deployment.lakebedDeployId,
        errorMessage: deployment.errorMessage ?? null,
        previewVersion: deployment.previewVersion,
        provider: deployment.provider,
        status: deployment.status,
        url: deployment.url,
      })),
      events: events.map((event) => ({
        eventType: event.eventType,
        previewVersion: event.previewVersion,
      })),
      exports: exportsForSession.map((exportRecord) => ({
        deployedUrl: exportRecord.deployedUrl,
        previewVersion: exportRecord.previewVersion,
        status: exportRecord.status,
      })),
    }
  })
}

describe('Lakebed deployment ordering and replay boundaries', () => {
  it('does not let an older success regress a newer ready deployment', async () => {
    const t = deploymentOrderingTest()
    const sessionId = await insertReleaseSession(t)

    await t.mutation(
      internal.sessions.recordLakebedDeploymentSuccess,
      successArgs(sessionId, 2, 'newer'),
    )
    await t.mutation(
      internal.sessions.recordLakebedDeploymentSuccess,
      successArgs(sessionId, 1, 'stale'),
    )

    await expect(persistedDeploymentState(t, sessionId)).resolves.toEqual({
      deployments: [
        {
          artifactHash: 'artifact-newer',
          deployId: 'deploy-newer',
          errorMessage: null,
          previewVersion: 2,
          provider: 'lakebed',
          status: 'ready',
          url: 'https://release-newer.lakebed.test',
        },
      ],
      events: [{ eventType: 'published', previewVersion: 2 }],
      exports: [
        {
          deployedUrl: 'https://release-newer.lakebed.test',
          previewVersion: 2,
          status: 'ready',
        },
      ],
    })
  })

  it('keeps the last-known-good deployment ready when a late failure arrives', async () => {
    const t = deploymentOrderingTest()
    const sessionId = await insertReleaseSession(t)

    await t.mutation(
      internal.sessions.recordLakebedDeploymentSuccess,
      successArgs(sessionId, 4, 'ready'),
    )
    await t.mutation(internal.sessions.recordLakebedDeploymentFailure, {
      sessionId,
      errorMessage: 'late worker failure',
    })

    await expect(persistedDeploymentState(t, sessionId)).resolves.toEqual({
      deployments: [
        {
          artifactHash: 'artifact-ready',
          deployId: 'deploy-ready',
          errorMessage: null,
          previewVersion: 4,
          provider: 'lakebed',
          status: 'ready',
          url: 'https://release-ready.lakebed.test',
        },
      ],
      events: [{ eventType: 'published', previewVersion: 4 }],
      exports: [
        {
          deployedUrl: 'https://release-ready.lakebed.test',
          previewVersion: 4,
          status: 'ready',
        },
      ],
    })
  })

  it('treats an identical success replay as idempotent', async () => {
    const t = deploymentOrderingTest()
    const sessionId = await insertReleaseSession(t)
    const args = successArgs(sessionId, 4, 'replay')

    await t.mutation(internal.sessions.recordLakebedDeploymentSuccess, args)
    await t.mutation(internal.sessions.recordLakebedDeploymentSuccess, args)

    await expect(persistedDeploymentState(t, sessionId)).resolves.toEqual({
      deployments: [
        {
          artifactHash: 'artifact-replay',
          deployId: 'deploy-replay',
          errorMessage: null,
          previewVersion: 4,
          provider: 'lakebed',
          status: 'ready',
          url: 'https://release-replay.lakebed.test',
        },
      ],
      events: [{ eventType: 'published', previewVersion: 4 }],
      exports: [
        {
          deployedUrl: 'https://release-replay.lakebed.test',
          previewVersion: 4,
          status: 'ready',
        },
      ],
    })
  })
})
