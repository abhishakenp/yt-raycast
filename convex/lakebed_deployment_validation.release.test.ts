/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

function deploymentValidationTest() {
  return convexTest(schema, modules)
}

async function insertSession(t: ReturnType<typeof deploymentValidationTest>) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('sessions', {
      userId: 'lakebed-validation-owner',
      prompt: 'Lakebed deployment validation fixture',
      preferredLanguage: 'en',
      preferredExportTarget: 'lakebed',
      isPrivate: true,
      status: 'preview_ready',
      previewVersion: 2,
      createdAt: Date.now(),
    })
  })
}

function validSuccessArgs(sessionId: Id<'sessions'>) {
  return {
    sessionId,
    previewVersion: 2,
    url: 'https://valid-release.lakebed.test',
    deployId: 'valid-deploy-id',
    claimUrl: 'https://claim.lakebed.test/valid-capability',
    artifactHash: 'valid-artifact-hash',
    clientBundleHash: 'valid-client-hash',
    clientBundleBytes: 1_024,
    requestBodyBytes: 2_048,
    serverBundleBytes: 512,
    sourceFileCount: 4,
  }
}

async function deploymentWriteCounts(
  t: ReturnType<typeof deploymentValidationTest>,
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
      deployments: deployments.length,
      events: events.length,
      exports: exportsForSession.length,
    }
  })
}

describe('Lakebed deployment payload validation', () => {
  it('rejects blank durable identifiers, URLs, and hashes atomically', async () => {
    const harnesses = Array.from({ length: 6 }, () =>
      deploymentValidationTest(),
    )
    const sessionIds = await Promise.all(harnesses.map(insertSession))
    const attempts = await Promise.all([
      Promise.allSettled([
        harnesses[0].mutation(
          internal.sessions.recordLakebedDeploymentSuccess,
          { ...validSuccessArgs(sessionIds[0]), url: '   ' },
        ),
      ]),
      Promise.allSettled([
        harnesses[1].mutation(
          internal.sessions.recordLakebedDeploymentSuccess,
          { ...validSuccessArgs(sessionIds[1]), deployId: '' },
        ),
      ]),
      Promise.allSettled([
        harnesses[2].mutation(
          internal.sessions.recordLakebedDeploymentSuccess,
          { ...validSuccessArgs(sessionIds[2]), claimUrl: 'not-a-url' },
        ),
      ]),
      Promise.allSettled([
        harnesses[3].mutation(
          internal.sessions.recordLakebedDeploymentSuccess,
          { ...validSuccessArgs(sessionIds[3]), artifactHash: '\n' },
        ),
      ]),
      Promise.allSettled([
        harnesses[4].mutation(
          internal.sessions.recordLakebedDeploymentSuccess,
          { ...validSuccessArgs(sessionIds[4]), clientBundleHash: '  ' },
        ),
      ]),
      Promise.allSettled([
        harnesses[5].mutation(
          internal.sessions.recordLakebedDeploymentSuccess,
          { ...validSuccessArgs(sessionIds[5]), requestedSlug: '   ' },
        ),
      ]),
    ])
    const states = await Promise.all(
      harnesses.map((harness, index) =>
        deploymentWriteCounts(harness, sessionIds[index]),
      ),
    )

    expect({
      attempts: attempts.flat().map((attempt) => attempt.status),
      states,
    }).toEqual({
      attempts: [
        'rejected',
        'rejected',
        'rejected',
        'rejected',
        'rejected',
        'rejected',
      ],
      states: Array.from({ length: 6 }, () => ({
        deployments: 0,
        events: 0,
        exports: 0,
      })),
    })
  })

  it('rejects negative and fractional artifact measurements atomically', async () => {
    const harnesses = Array.from({ length: 5 }, () =>
      deploymentValidationTest(),
    )
    const sessionIds = await Promise.all(harnesses.map(insertSession))
    const attempts = await Promise.all([
      Promise.allSettled([
        harnesses[0].mutation(
          internal.sessions.recordLakebedDeploymentSuccess,
          { ...validSuccessArgs(sessionIds[0]), clientBundleBytes: -1 },
        ),
      ]),
      Promise.allSettled([
        harnesses[1].mutation(
          internal.sessions.recordLakebedDeploymentSuccess,
          { ...validSuccessArgs(sessionIds[1]), requestBodyBytes: -1 },
        ),
      ]),
      Promise.allSettled([
        harnesses[2].mutation(
          internal.sessions.recordLakebedDeploymentSuccess,
          { ...validSuccessArgs(sessionIds[2]), serverBundleBytes: -1 },
        ),
      ]),
      Promise.allSettled([
        harnesses[3].mutation(
          internal.sessions.recordLakebedDeploymentSuccess,
          { ...validSuccessArgs(sessionIds[3]), sourceFileCount: -1 },
        ),
      ]),
      Promise.allSettled([
        harnesses[4].mutation(
          internal.sessions.recordLakebedDeploymentSuccess,
          { ...validSuccessArgs(sessionIds[4]), sourceFileCount: 1.5 },
        ),
      ]),
    ])
    const states = await Promise.all(
      harnesses.map((harness, index) =>
        deploymentWriteCounts(harness, sessionIds[index]),
      ),
    )

    expect({
      attempts: attempts.flat().map((attempt) => attempt.status),
      states,
    }).toEqual({
      attempts: ['rejected', 'rejected', 'rejected', 'rejected', 'rejected'],
      states: Array.from({ length: 5 }, () => ({
        deployments: 0,
        events: 0,
        exports: 0,
      })),
    })
  })

  it('rejects a blank failure message without creating failed state', async () => {
    const t = deploymentValidationTest()
    const sessionId = await insertSession(t)
    const attempt = await Promise.allSettled([
      t.mutation(internal.sessions.recordLakebedDeploymentFailure, {
        sessionId,
        errorMessage: '   ',
      }),
    ])

    expect({
      attempt: attempt.map((entry) => entry.status),
      state: await deploymentWriteCounts(t, sessionId),
    }).toEqual({
      attempt: ['rejected'],
      state: { deployments: 0, events: 0, exports: 0 },
    })
  })
})
