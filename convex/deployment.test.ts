import { convexTest } from 'convex-test'
import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { afterEach, expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

let activeTest: ReturnType<typeof convexTest> | null = null

const createTestSession = (
  t: ReturnType<typeof convexTest>,
  prompt = 'Test site',
) =>
  t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_test',
    anonymousClientId: `anon-${prompt}`,
    anonymousOwnerSecret: 'owner-secret',
  })

const persistGeneratedPreview = (
  t: ReturnType<typeof convexTest>,
  sessionId: Id<'sessions'>,
  prompt = 'Test site',
) =>
  t.action(internal.sessions.completeGeneration, {
    sessionId,
    html: `<html><body><main><h1>${prompt}</h1></main></body></html>`,
    openUiSource: `$page = "Home"\nroot = Text("${prompt}")`,
    siteSpecJson: JSON.stringify({
      projectName: prompt,
      hero: { headline: prompt },
      pages: [{ id: 'home', title: prompt, description: prompt }],
    }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  })

const deploymentTest = () => {
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

test('getDeploymentBySlug returns deployment with session metadata', async () => {
  const t = deploymentTest()

  const { sessionId } = await createTestSession(t)

  await persistGeneratedPreview(t, sessionId)

  await t.mutation(api.sessions.publishPreview, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    requestedSlug: 'test-site',
  })

  const deployment = await t.query(api.sessions.getDeploymentBySlug, {
    slug: 'test-site',
  })

  expect(deployment).not.toBeNull()
  expect(deployment?.slug).toBe('test-site')
  expect(deployment?.previewVersion).toBe(1)
  expect(deployment?.session?.id).toBe(sessionId)
})

test('getDeploymentStatus returns deployment status', async () => {
  const t = deploymentTest()

  const { sessionId } = await createTestSession(t)

  await persistGeneratedPreview(t, sessionId)

  await t.mutation(api.sessions.publishPreview, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    requestedSlug: 'test-site',
  })

  const status = await t.query(api.sessions.getDeploymentStatus, {
    sessionId,
  })

  expect(status).not.toBeNull()
  expect(status?.status).toBe('ready')
  expect(status?.previewVersion).toBe(1)
})

test('owner-secret sessions clone cached public previews without reusing another owner session', async () => {
  const t = deploymentTest()
  const prompt = 'Cache-safe deployment preview'

  const first = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_first',
    anonymousClientId: 'anon-first-cache-owner',
    anonymousOwnerSecret: 'owner-a',
  })
  await persistGeneratedPreview(t, first.sessionId, prompt)

  const second = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_second',
    anonymousClientId: 'anon-second-cache-owner',
    anonymousOwnerSecret: 'owner-b',
  })

  expect(second.cached).toBe(true)
  expect(second.cloned).toBe(true)
  expect(second.sessionId).not.toBe(first.sessionId)

  const secondView = await t.query(api.sessions.getGenerationView, {
    lookup: second.sessionId,
  })
  expect(secondView?.session.status).toBe('preview_ready')
  expect(secondView?.session.canClaimAnonymous).toBe(true)
  expect(secondView?.homeModule?.source).toContain(prompt)
  expect(secondView?.latestPreview?.html).toContain(prompt)
  expect(secondView?.tasks).toHaveLength(1)
  expect(secondView?.tasks[0]?.status).toBe('succeeded')

  await expect(
    t.mutation(api.sessions.createEdit, {
      sessionId: second.sessionId,
      anonymousOwnerSecret: 'owner-a',
      editType: 'text',
      beforeText: prompt,
      afterText: 'Wrong owner edit',
    }),
  ).rejects.toThrow()

  await expect(
    t.mutation(api.sessions.createEdit, {
      sessionId: second.sessionId,
      anonymousOwnerSecret: 'owner-b',
      editType: 'text',
      beforeText: prompt,
      afterText: 'Owner B edited cached clone',
    }),
  ).resolves.toMatchObject({ previewVersion: 2 })
})

test('publishPreview repoints an existing deployment to the latest preview version', async () => {
  const t = deploymentTest()

  const { sessionId } = await createTestSession(t)

  await persistGeneratedPreview(t, sessionId)

  await t.mutation(api.sessions.publishPreview, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    requestedSlug: 'test-site',
  })

  await t.mutation(api.sessions.createEdit, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    editType: 'text',
    afterHtml: '<html><body><h1>Updated deployment</h1></body></html>',
  })

  const republish = await t.mutation(api.sessions.publishPreview, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
  })
  const status = await t.query(api.sessions.getDeploymentStatus, {
    sessionId,
  })

  expect(republish.slug).toBe('test-site')
  expect(status?.previewVersion).toBe(2)
})

test('public preview by deployment slug serves the published preview version until republished', async () => {
  const t = deploymentTest()

  const { sessionId } = await createTestSession(t)

  await persistGeneratedPreview(t, sessionId)

  await t.mutation(api.sessions.publishPreview, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    requestedSlug: 'versioned-site',
  })

  await t.mutation(api.sessions.createEdit, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    editType: 'text',
    afterHtml: '<html><body><h1>Unpublished edit</h1></body></html>',
  })

  const publicBeforeRepublish = await t.query(api.sessions.getPublicPreview, {
    lookup: 'versioned-site',
  })
  const directLatestPreview = await t.query(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })

  expect(publicBeforeRepublish?.previewVersion).toBe(1)
  expect(publicBeforeRepublish?.html).not.toContain('Unpublished edit')
  expect(directLatestPreview?.previewVersion).toBe(2)
  expect(directLatestPreview?.html).toContain('Unpublished edit')

  await t.mutation(api.sessions.publishPreview, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
  })

  const publicAfterRepublish = await t.query(api.sessions.getPublicPreview, {
    lookup: 'versioned-site',
  })

  expect(publicAfterRepublish?.previewVersion).toBe(2)
  expect(publicAfterRepublish?.html).toContain('Unpublished edit')
})
