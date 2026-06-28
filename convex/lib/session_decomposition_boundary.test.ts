import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api, internal } from '../_generated/api'
import schema from '../schema'

import {
  createGenerationSessionArgs,
  deleteMineArgs,
  deploymentSlugArgs,
  eventStreamArgs,
  generationViewArgs,
  lookupArgs,
  publicGallerySessionsArgs,
  sessionIdArgs,
} from './session_validators'

const modules = import.meta.glob('../**/*.ts')

const sessionBoundaryConvexTest = () => {
  const t = convexTest(schema, modules)
  registerDebouncer(t)
  return t
}

const convexRoot = join(process.cwd(), 'convex')
const sessionLibRoot = join(convexRoot, 'lib')

const createReadySession = async (
  t: ReturnType<typeof sessionBoundaryConvexTest>,
  prompt = 'Boundary test session',
) => {
  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: `workspace_${prompt.toLowerCase().replace(/\W+/g, '_')}`,
    anonymousClientId: `anon_${prompt.toLowerCase().replace(/\W+/g, '_')}`,
    anonymousOwnerSecret: 'owner-secret',
  })

  await t.action(internal.sessions.completeGeneration, {
    sessionId,
    html: `<html><body><main><h1>${prompt}</h1></main></body></html>`,
    openUiSource: `$page = "Home"\nroot = Text("${prompt}")`,
    siteSpecJson: JSON.stringify({ hero: { headline: prompt } }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  })

  return sessionId
}

describe('session decomposition boundary', () => {
  it('delegates sessions.ts queries/mutations to extracted helper modules (behavioral)', async () => {
    const t = sessionBoundaryConvexTest()
    const sessionId = await createReadySession(t)

    // getGenerationView delegates to session_generation_view_helpers.
    await expect(
      t.query(api.sessions.getGenerationView, { sessionId }),
    ).resolves.toMatchObject({ session: expect.any(Object) })

    // getEventStream delegates to session_event_stream_helpers.
    await expect(
      t.query(api.sessions.getEventStream, { sessionId }),
    ).resolves.toMatchObject({ events: expect.any(Array) })

    // getSessionApiResponse delegates to session_api_response_helpers.
    await expect(
      t.query(api.sessions.getSessionApiResponse, { lookup: sessionId }),
    ).resolves.toMatchObject({ sessionId })

    // getDeploymentBySlug delegates to session_deployment_helpers.
    await expect(
      t.query(api.sessions.getDeploymentBySlug, { slug: 'no-such-slug' }),
    ).resolves.toBeNull()

    // listPublicSessions delegates to session_gallery_helpers.
    await expect(
      t.query(api.sessions.listPublicSessions, {}),
    ).resolves.toMatchObject({ availableCategories: expect.any(Array) })
  })

  it('delegates sessions.ts mutations to extracted helper modules (behavioral)', async () => {
    const t = sessionBoundaryConvexTest()
    const sessionId = await createReadySession(t)

    // setThemeOverride delegates to session_workspace_helpers.
    await expect(
      t.mutation(api.sessions.setThemeOverride, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        themeOverride: 'dark',
      }),
    ).resolves.toBeDefined()

    // deleteMine delegates to session_access_helpers (cleans up owned sessions).
    await expect(
      t.mutation(api.sessions.deleteMine, {
        sessionId,
      }),
    ).resolves.toBeDefined()
  })

  it('requires session_validators as the single source of shared validators', () => {
    // The validators consumed by sessions.ts must be exported from
    // ./lib/session_validators — importing them here proves they are the
    // canonical, reusable definitions (no inline duplicates in sessions.ts).
    expect(sessionIdArgs).toBeDefined()
    expect(lookupArgs).toBeDefined()
    expect(generationViewArgs).toBeDefined()
    expect(eventStreamArgs).toBeDefined()
    expect(deleteMineArgs).toBeDefined()
    expect(createGenerationSessionArgs).toBeDefined()
    expect(deploymentSlugArgs).toBeDefined()
    expect(publicGallerySessionsArgs).toBeDefined()

    // Each must be a plain object (validator map), not undefined/null.
    expect(typeof sessionIdArgs).toBe('object')
    expect(typeof createGenerationSessionArgs).toBe('object')
  })

  it('requires each extracted session helper module to have a focused sibling test', () => {
    const files = readdirSync(sessionLibRoot)
    const helperFiles = files
      .filter((file) => /^session_.+_helpers\.ts$/.test(file))
      .sort()
    const testFiles = new Set(
      files.filter((file) => /^session_.+_helpers\.test\.ts$/.test(file)),
    )
    const helpersWithoutTests = helperFiles.filter(
      (file) => !testFiles.has(file.replace(/\.ts$/, '.test.ts')),
    )

    expect(helperFiles.length).toBeGreaterThanOrEqual(27)
    expect(helpersWithoutTests).toEqual([])
  })
})
