import { convexTest } from 'convex-test'
import type { DebouncerComponentApi } from '@ikhrustalev/convex-debouncer'
import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import type { FunctionReference } from 'convex/server'
import { afterEach, expect, test } from 'vitest'
import { api, components, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
type DebouncerCallDetailsReference = FunctionReference<
  'query',
  'internal',
  { namespace: string; key: string },
  { functionPath: string; functionArgs: unknown } | null
>
type LegacyEditedSessionExportRebuildReference = FunctionReference<
  'mutation',
  'internal',
  { sessionId: Id<'sessions'>; previewVersion: number; saved: boolean },
  { status: 'queued' | 'stale' }
>

let activeTest: ReturnType<typeof convexTest> | null = null

function createTestSession(
  t: ReturnType<typeof convexTest>,
  prompt = 'Test site',
) {
  return t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_test',
    anonymousClientId: `anon-${prompt}`,
    anonymousOwnerSecret: 'owner-secret',
  })
}

function persistGeneratedPreview(
  t: ReturnType<typeof convexTest>,
  sessionId: Id<'sessions'>,
  prompt = 'Test site',
) {
  return t.action(internal.sessions.completeGeneration, {
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
}

const deploymentTest = () => {
  const t = convexTest(schema, modules)
  registerDebouncer(t)
  activeTest = t
  return t
}

async function drainScheduledFunctions(t: ReturnType<typeof convexTest>) {
  for (let i = 0; i < 5; i++) {
    await new Promise((r) => setTimeout(r, 10))
    await t.finishInProgressScheduledFunctions()
  }
}

async function loadEditedSessionExportRebuildCallArgs(
  t: ReturnType<typeof convexTest>,
  sessionId: Id<'sessions'>,
) {
  const debouncerComponent =
    components.debouncer as unknown as DebouncerComponentApi
  const debouncerCallDetails = (
    debouncerComponent.lib as typeof debouncerComponent.lib & {
      getCallDetails: DebouncerCallDetailsReference
    }
  ).getCallDetails

  return await t.query(debouncerCallDetails, {
    namespace: 'edited-session-export-rebuild',
    key: sessionId,
  })
}

afterEach(async () => {
  if (activeTest) {
    await drainScheduledFunctions(activeTest)
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

test('public preview by deployment slug auto-refreshes after an edited preview rebuild', async () => {
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
    afterHtml: '<html><body><h1>Auto-published edit</h1></body></html>',
  })

  const queuedStatus = await t.query(api.sessions.getDeploymentStatus, {
    sessionId,
  })
  const publicBeforeRebuild = await t.query(api.sessions.getPublicPreview, {
    lookup: 'versioned-site',
  })
  const directLatestPreview = await t.query(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })

  expect(queuedStatus).toMatchObject({
    status: 'updating',
    previewVersion: 1,
    pendingPreviewVersion: 2,
  })
  expect(publicBeforeRebuild?.previewVersion).toBe(1)
  expect(publicBeforeRebuild?.html).not.toContain('Auto-published edit')
  expect(directLatestPreview?.previewVersion).toBe(2)
  expect(directLatestPreview?.html).toContain('Auto-published edit')

  await t.mutation(internal.sessions.rebuildEditedSessionExports, {
    sessionId,
    previewVersion: 2,
  })

  const statusAfterRebuild = await t.query(api.sessions.getDeploymentStatus, {
    sessionId,
  })
  const publicAfterRebuild = await t.query(api.sessions.getPublicPreview, {
    lookup: 'versioned-site',
  })

  expect(statusAfterRebuild).toMatchObject({
    status: 'ready',
    previewVersion: 2,
  })
  expect(statusAfterRebuild).not.toHaveProperty('pendingPreviewVersion')
  expect(publicAfterRebuild?.previewVersion).toBe(2)
  expect(publicAfterRebuild?.html).toContain('Auto-published edit')
})

test.each([
  [
    'theme',
    async (t: ReturnType<typeof convexTest>, sessionId: Id<'sessions'>) =>
      await t.mutation(api.sessions.setThemeOverride, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        themeOverride: 'nordic-dawn',
        themeMode: 'light',
      }),
  ],
  [
    'language',
    async (t: ReturnType<typeof convexTest>, sessionId: Id<'sessions'>) =>
      await t.mutation(api.sessions.setPreferredLanguage, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        preferredLanguage: 'lt',
      }),
  ],
  [
    'brand',
    async (t: ReturnType<typeof convexTest>, sessionId: Id<'sessions'>) =>
      await t.mutation(api.sessions.setBrandLogo, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        brandLogo: {
          name: 'Acme Glass',
          domain: 'acme.test',
          brandId: 'brand_acme',
          icon: 'https://cdn.test/acme-icon.png',
          logo: 'https://cdn.test/acme-logo.png',
        },
      }),
  ],
])(
  '%s changes mark an existing deployment as updating and queue rebuilt artifacts',
  async (name, mutate) => {
    const t = deploymentTest()
    const prompt = `Refresh ${name} preferences`
    const { sessionId } = await createTestSession(t, prompt)

    await persistGeneratedPreview(t, sessionId, prompt)

    await t.mutation(api.sessions.publishPreview, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      requestedSlug: `refresh-${name}-preferences`,
    })

    await mutate(t, sessionId)

    const updatingStatus = await t.query(api.sessions.getDeploymentStatus, {
      sessionId,
    })

    expect(updatingStatus).toMatchObject({
      status: 'updating',
      previewVersion: 1,
      pendingPreviewVersion: 1,
    })

    await t.mutation(internal.sessions.rebuildEditedSessionExports, {
      sessionId,
      previewVersion: 1,
    })

    const targets = await t.query(api.sessions.getExportTargets, {
      lookup: sessionId,
    })
    expect(targets.targets).toHaveLength(4)
    expect(
      targets.targets.every(
        (target) =>
          target.currentPreviewVersion === 1 &&
          ['queued', 'building', 'ready'].includes(target.artifactStatus),
      ),
    ).toBe(true)

    const readyStatus = await t.query(api.sessions.getDeploymentStatus, {
      sessionId,
    })
    expect(readyStatus).toMatchObject({
      status: 'ready',
      previewVersion: 1,
    })
    expect(readyStatus).not.toHaveProperty('pendingPreviewVersion')
  },
)

test('inline edits on deployed sessions queue validator-clean rebuild args', async () => {
  const t = deploymentTest()
  const prompt = 'Deployable edited landing page'
  const { sessionId } = await createTestSession(t, prompt)

  await persistGeneratedPreview(t, sessionId, prompt)

  await t.mutation(api.sessions.publishPreview, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    requestedSlug: 'deployable-edited-landing-page',
  })

  await expect(
    t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: prompt,
      afterText: 'Edited deployable landing page',
    }),
  ).resolves.toMatchObject({
    previewVersion: 2,
    saved: true,
  })

  const updatingStatus = await t.query(api.sessions.getDeploymentStatus, {
    sessionId,
  })
  const queuedCall = await loadEditedSessionExportRebuildCallArgs(t, sessionId)

  expect(updatingStatus).toMatchObject({
    status: 'updating',
    previewVersion: 1,
    pendingPreviewVersion: 2,
  })
  expect(queuedCall?.functionArgs).toEqual({
    sessionId,
    previewVersion: 2,
  })
})

test('legacy queued edited export rebuild calls with saved results still drain', async () => {
  const t = deploymentTest()
  const prompt = 'Legacy queued deployment rebuild'
  const { sessionId } = await createTestSession(t, prompt)
  const legacyRebuild = internal.sessions
    .rebuildEditedSessionExports as LegacyEditedSessionExportRebuildReference

  await persistGeneratedPreview(t, sessionId, prompt)

  await t.mutation(api.sessions.publishPreview, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    requestedSlug: 'legacy-queued-deployment-rebuild',
  })

  await expect(
    t.mutation(legacyRebuild, {
      sessionId,
      previewVersion: 1,
      saved: true,
    }),
  ).resolves.toEqual({ status: 'queued' })

  const statusAfterLegacyPayload = await t.query(
    api.sessions.getDeploymentStatus,
    { sessionId },
  )

  expect(statusAfterLegacyPayload).toMatchObject({
    status: 'ready',
    previewVersion: 1,
  })
  expect(statusAfterLegacyPayload).not.toHaveProperty('pendingPreviewVersion')
})
