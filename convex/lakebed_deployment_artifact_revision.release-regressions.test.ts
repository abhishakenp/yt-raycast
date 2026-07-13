import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import { exportGeneratorRevision } from './lib/session_export_helpers'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

function deploymentArtifactTest() {
  const t = convexTest(schema, modules)
  registerDebouncer(t)
  return t
}

async function createOwnedSession(
  t: ReturnType<typeof deploymentArtifactTest>,
) {
  return await t.mutation(api.sessions.create, {
    prompt: 'Lakebed artifact revision contract',
    preferredLanguage: 'en',
    preferredExportTarget: 'lakebed',
    isPrivate: false,
    workspace: 'workspace_lakebed_artifact_revision',
    anonymousClientId: 'anon-lakebed-artifact-revision',
    anonymousOwnerSecret: 'owner-secret',
  })
}

async function storeProjectFiles(t: ReturnType<typeof deploymentArtifactTest>) {
  return await t.action(async (ctx) =>
    ctx.storage.store(
      new Blob(['{"client/index.ts":"export const artifact = true"}'], {
        type: 'application/json',
      }),
    ),
  )
}

async function insertReadyArtifact(
  t: ReturnType<typeof deploymentArtifactTest>,
  sessionId: Awaited<ReturnType<typeof createOwnedSession>>['sessionId'],
  filesStorageId: Awaited<ReturnType<typeof storeProjectFiles>>,
  generatorRevision: string,
) {
  await t.run(async (ctx) => {
    await ctx.db.insert('exportArtifacts', {
      sessionId,
      target: 'lakebed',
      previewVersion: 0,
      status: 'ready',
      filesStorageId,
      generatorRevision,
      createdAt: 1,
      updatedAt: 1,
    })
  })
}

describe('Lakebed deployment artifact generator revision', () => {
  it('serves current ready project files directly from cache', async () => {
    const t = deploymentArtifactTest()
    const { sessionId } = await createOwnedSession(t)
    const filesStorageId = await storeProjectFiles(t)
    await insertReadyArtifact(
      t,
      sessionId,
      filesStorageId,
      exportGeneratorRevision('lakebed'),
    )

    const artifact = await t.query(
      api.sessions.getOwnedLakebedDeploymentArtifact,
      { sessionId, anonymousOwnerSecret: 'owner-secret' },
    )

    expect(artifact.status).toBe('ready')
    expect(artifact.filesUrl).toMatch(/^https?:\/\//)
  })

  it('never exposes stale ready project files to the deployment action', async () => {
    const t = deploymentArtifactTest()
    const { sessionId } = await createOwnedSession(t)
    const filesStorageId = await storeProjectFiles(t)
    await insertReadyArtifact(
      t,
      sessionId,
      filesStorageId,
      'lakebed-export-stale',
    )

    const artifact = await t.query(
      api.sessions.getOwnedLakebedDeploymentArtifact,
      { sessionId, anonymousOwnerSecret: 'owner-secret' },
    )

    expect(artifact.status).not.toBe('ready')
    expect(artifact.filesUrl).toBeNull()
  })
})
