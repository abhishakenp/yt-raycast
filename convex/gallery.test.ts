import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const createGeneratedSession = async (
  t: ReturnType<typeof convexTest>,
  {
    prompt,
    isPrivate = false,
    anonymousClientId,
  }: {
    prompt: string
    isPrivate?: boolean
    anonymousClientId: string
  },
) => {
  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate,
    workspace: `workspace_${anonymousClientId}`,
    anonymousClientId,
  })

  await t.mutation(internal.sessions.completeGenerationInternal, {
    sessionId,
    html: `<html><body><main><h1>${prompt}</h1></main></body></html>`,
    siteSpecJson: JSON.stringify({ brand: prompt, modules: {} }),
    openUiSource: `$page = "Home"\nroot = Text("${prompt}")`,
    tasks: [
      {
        id: 'homepage',
        label: 'Generate homepage',
        status: 'DONE',
      },
    ],
    elapsed: 12345,
  })

  return sessionId
}

test('listPublicSessions returns only public visible sessions with gallery metadata', async () => {
  const t = convexTest(schema, modules)

  const publicSessionId = await createGeneratedSession(t, {
    prompt: 'SaaS analytics dashboard for product teams',
    anonymousClientId: 'gallery-public',
  })
  await createGeneratedSession(t, {
    prompt: 'Private portfolio studio preview',
    isPrivate: true,
    anonymousClientId: 'gallery-private',
  })

  const gallery = await t.query(api.sessions.listPublicSessions, {
    limit: 12,
    page: 1,
  })

  expect(gallery.items).toHaveLength(1)
  expect(gallery.items[0]).toMatchObject({
    id: publicSessionId,
    sessionId: publicSessionId,
    prompt: 'SaaS analytics dashboard for product teams',
    status: 'preview_ready',
    previewVersion: 1,
    elapsed: 12345,
    cost: 0,
    homepageReady: null,
    siteSpecReady: null,
    openuiReady: null,
    readiness: {
      homepageReady: null,
      siteSpecReady: null,
      openuiReady: null,
      previewReady: true,
    },
  })
  expect(gallery.items[0].categories).toContain('saas')
  expect(gallery.items[0].html).toContain('SaaS analytics dashboard')
  expect(gallery.items[0].moduleSource).toContain('$page = "Home"')
  expect(gallery.items[0].siteSpecJson).toContain('SaaS analytics dashboard')
  expect(gallery.availableCategories).toContainEqual({
    value: 'saas',
    label: 'Saas',
    count: 1,
  })
  expect(gallery.total).toBe(1)
  expect(gallery.hasNext).toBe(false)
  expect(gallery.hasPrev).toBe(false)
}, 15_000)
