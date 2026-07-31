/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const INVALID_LOOKUP = 'not-a-convex-session-id'

describe('session lookup API boundaries', () => {
  it('returns null deployment status for a non-normalizable lookup', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.query(api.sessions.getDeploymentStatusByLookup, {
        lookup: INVALID_LOOKUP,
      }),
    ).resolves.toBeNull()
  })

  it('returns null artifact download for a non-normalizable lookup', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.query(api.sessions.getOwnedExportArtifactDownloadByLookup, {
        lookup: INVALID_LOOKUP,
        target: 'html',
      }),
    ).rejects.toThrow('Session not found')
  })

  it('rejects export creation before side effects for an invalid lookup', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.sessions.createExportByLookup, {
        lookup: INVALID_LOOKUP,
        target: 'html',
      }),
    ).rejects.toThrow('Session not found')
  })

  it('rejects artifact build queuing for an invalid lookup', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.sessions.ensureExportArtifactByLookup, {
        lookup: INVALID_LOOKUP,
        target: 'react',
      }),
    ).rejects.toThrow('Session not found')
  })

  it('rejects GitHub repository recording for an invalid lookup', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.sessions.recordGitHubExportRepositoryByLookup, {
        lookup: INVALID_LOOKUP,
        target: 'next',
        repoUrl: 'https://github.com/example/private-site',
      }),
    ).rejects.toThrow('Session not found')
  })

  it('rejects public preview publishing for an invalid lookup', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.sessions.publishPreviewByLookup, {
        lookup: INVALID_LOOKUP,
        requestedSlug: 'release-demo',
      }),
    ).rejects.toThrow('Session not found')
  })

  it('rejects owned export build input reads for an invalid lookup', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.query(api.sessions.getOwnedExportBuildInputByLookup, {
        lookup: INVALID_LOOKUP,
        target: 'lakebed',
      }),
    ).rejects.toThrow('Session not found')
  })

  it('rejects owned GitHub export reads for an invalid lookup', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.query(api.sessions.getOwnedExportForGitHubPushByLookup, {
        lookup: INVALID_LOOKUP,
        target: 'html',
      }),
    ).rejects.toThrow('Session not found')
  })

  it('rejects owned Lakebed artifact reads for an invalid lookup', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.query(api.sessions.getOwnedLakebedDeploymentArtifactByLookup, {
        lookup: INVALID_LOOKUP,
      }),
    ).rejects.toThrow('Session not found')
  })
})
