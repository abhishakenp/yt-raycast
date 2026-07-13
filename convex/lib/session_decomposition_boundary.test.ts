import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it } from 'vitest'

import { api, internal } from '../_generated/api'
import schema from '../schema'

const modules = import.meta.glob('../**/*.ts')

let activeTest: ReturnType<typeof convexTest> | null = null

const sessionBoundaryConvexTest = () => {
  const t = convexTest(schema, modules)
  registerDebouncer(t)
  activeTest = t
  return t
}

afterEach(async () => {
  if (activeTest) {
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 10))
      await activeTest.finishInProgressScheduledFunctions()
    }
    activeTest = null
  }
})

async function createReadySession(
  t: ReturnType<typeof sessionBoundaryConvexTest>,
  prompt = 'Boundary test session',
) {
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

  it('rejects malformed public session API inputs at the runtime boundary', async () => {
    const t = sessionBoundaryConvexTest()

    await expect(
      t.mutation(api.sessions.create, {
        prompt: 12,
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'workspace_bad_prompt',
      }),
    ).rejects.toThrow()

    await expect(
      t.query(api.sessions.getGenerationView, {
        sessionId: 123,
      }),
    ).rejects.toThrow()

    await expect(
      t.query(api.sessions.getEventStream, {
        lookup: 123,
      }),
    ).rejects.toThrow()

    await expect(
      t.query(api.sessions.getSessionApiResponse, {
        lookup: 123,
      }),
    ).rejects.toThrow()

    await expect(
      t.query(api.sessions.getDeploymentBySlug, {
        slug: 42,
      }),
    ).rejects.toThrow()

    await expect(
      t.query(api.sessions.listPublicSessions, {
        limit: 'twenty',
      }),
    ).rejects.toThrow()

    await expect(
      t.mutation(api.sessions.deleteMine, {
        sessionId: 123,
      }),
    ).rejects.toThrow()
  })
})
