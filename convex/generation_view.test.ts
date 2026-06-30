import { convexTest } from 'convex-test'
import { afterEach, expect, test } from 'vitest'
import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import type { DebouncerComponentApi } from '@ikhrustalev/convex-debouncer'
import { api, components, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

// Track the active convexTest instance so afterEach can drain pending
// scheduled functions (export_artifacts:build is scheduled by
// completeGeneration and otherwise writes after the test's transaction
// context is torn down, causing "Write outside of transaction" errors).
let activeTest: ReturnType<typeof convexTest> | null = null

const generationConvexTest = () => {
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

const requireEventStream = <T>(stream: T | null): T => {
  if (stream === null) throw new Error('Expected event stream')
  return stream
}

const persistGeneratedPreview = (
  t: ReturnType<typeof convexTest>,
  sessionId: Id<'sessions'>,
  prompt: string,
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

test('getGenerationView accepts lookup-only session ids', async () => {
  const t = generationConvexTest()

  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt: 'Build a concise product site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_test',
    anonymousClientId: 'anon-generation-view',
  })

  const view = await t.query(api.sessions.getGenerationView, {
    lookup: sessionId,
  })

  expect(view?.session.sessionId).toBe(sessionId)
})

test('read-only session queries tolerate non-Convex route lookups', async () => {
  const t = generationConvexTest()
  const lookup = 'test-language-popover'

  await expect(t.query(api.sessions.listEdits, { lookup })).resolves.toEqual([])
  await expect(
    t.query(api.sessions.listPreviewHistory, { lookup }),
  ).resolves.toEqual([])
  await expect(
    t.query(api.sessions.listClonePages, { lookup }),
  ).resolves.toEqual([])
})

test('create fails fast when model configuration is missing', async () => {
  const previousGroq = process.env.GROQ_API_KEY
  const previousGemini = process.env.GEMINI_API_KEY
  const previousGoogle = process.env.GOOGLE_API_KEY
  const previousHomepageModel = process.env.HOMEPAGE_MODEL
  const previousOpenUiHomeModel = process.env.OPENUI_HOME_MODEL
  const previousGroqModel = process.env.GROQ_MODEL

  delete process.env.GROQ_API_KEY
  delete process.env.GEMINI_API_KEY
  delete process.env.GOOGLE_API_KEY
  delete process.env.HOMEPAGE_MODEL
  delete process.env.OPENUI_HOME_MODEL
  delete process.env.GROQ_MODEL

  try {
    const t = generationConvexTest()

    const { sessionId } = await t.mutation(api.sessions.create, {
      prompt: 'Build a fast failure site',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: 'workspace_missing_model_config',
      anonymousClientId: 'anon-missing-model-config',
    })

    const session = await t.query(api.sessions.getSessionApiResponse, {
      lookup: sessionId,
    })
    const stream = requireEventStream(
      await t.query(api.sessions.getEventStream, {
        lookup: sessionId,
      }),
    )

    expect(session?.status).toBe('failed')
    expect(session?.tasks[0]?.status).toBe('failed')
    expect(session?.tasks[0]?.errorMessage).toContain('GROQ_API_KEY is missing')
    expect(stream.events.map((event) => event.eventType)).toContain(
      'generation_failed',
    )
  } finally {
    if (previousGroq === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousGroq
    if (previousGemini === undefined) delete process.env.GEMINI_API_KEY
    else process.env.GEMINI_API_KEY = previousGemini
    if (previousGoogle === undefined) delete process.env.GOOGLE_API_KEY
    else process.env.GOOGLE_API_KEY = previousGoogle
    if (previousHomepageModel === undefined) delete process.env.HOMEPAGE_MODEL
    else process.env.HOMEPAGE_MODEL = previousHomepageModel
    if (previousOpenUiHomeModel === undefined)
      delete process.env.OPENUI_HOME_MODEL
    else process.env.OPENUI_HOME_MODEL = previousOpenUiHomeModel
    if (previousGroqModel === undefined) delete process.env.GROQ_MODEL
    else process.env.GROQ_MODEL = previousGroqModel
  }
})

test('public prompt cache is scoped by preferred language', async () => {
  const t = generationConvexTest()
  const prompt = 'Build a bakery homepage with catering menus'

  const english = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_language_cache_en',
  })

  await persistGeneratedPreview(t, english.sessionId, prompt)

  const hindi = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'hi',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_language_cache_hi',
  })

  const englishAgain = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_language_cache_en_again',
  })

  expect(hindi.sessionId).not.toBe(english.sessionId)
  expect(hindi.cached).not.toBe(true)
  expect(englishAgain).toMatchObject({
    sessionId: english.sessionId,
    cached: true,
  })
})

test('public prompt cache can replay a ready session without creating an owned clone', async () => {
  const t = generationConvexTest()
  const prompt = 'Build a replayable public prompt site'

  const ready = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_replay_ready',
  })
  await persistGeneratedPreview(t, ready.sessionId, prompt)

  const replay = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_replay_second',
  })

  expect(replay).toMatchObject({
    sessionId: ready.sessionId,
    cached: true,
    reused: true,
  })

  const stream = requireEventStream(
    await t.query(api.sessions.getEventStream, {
      lookup: ready.sessionId,
    }),
  )
  expect(
    stream.events.find((event) => event.eventType === 'cache_hit'),
  ).toMatchObject({
    cacheHit: true,
    provider: 'prompt-cache',
  })
})

test('workspace idempotency returns the same queued session for a retried create', async () => {
  const t = generationConvexTest()
  const request = {
    prompt: 'Build an idempotent retry site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html' as const,
    isPrivate: false,
    workspace: 'workspace_retry_idempotent',
    anonymousClientId: 'anon-retry-idempotent',
    anonymousOwnerSecret: 'owner-retry-idempotent',
  }

  const first = await t.mutation(api.sessions.create, request)
  const second = await t.mutation(api.sessions.create, request)

  expect(second).toMatchObject({
    sessionId: first.sessionId,
    idempotent: true,
  })

  const view = await t.query(api.sessions.getGenerationView, {
    lookup: first.sessionId,
  })

  expect(view?.tasks).toHaveLength(1)
})

test('workspace idempotency rejects conflicting reuse of a workspace key', async () => {
  const t = generationConvexTest()

  await t.mutation(api.sessions.create, {
    prompt: 'Build the original workspace site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_conflict_guard',
    anonymousClientId: 'anon-workspace-conflict',
    anonymousOwnerSecret: 'owner-workspace-conflict',
  })

  await expect(
    t.mutation(api.sessions.create, {
      prompt: 'Build a different workspace site',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: 'workspace_conflict_guard',
      anonymousClientId: 'anon-workspace-conflict',
      anonymousOwnerSecret: 'owner-workspace-conflict',
    }),
  ).rejects.toThrow()
})

test('public prompt cache is reused across engine versions', async () => {
  const t = generationConvexTest()
  const prompt = 'Build a v2 isolated cache prompt site'

  const defaultEngine = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_v1_cache_ready',
  })
  await persistGeneratedPreview(t, defaultEngine.sessionId, prompt)

  const v2 = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_v2_cache_request',
    engineVersion: 'v2',
  })

  expect(v2).toMatchObject({
    sessionId: defaultEngine.sessionId,
    cached: true,
  })
})

test('public prompt cache skips newer incomplete duplicate sessions', async () => {
  const t = generationConvexTest()
  const prompt = 'Build a durable cached prompt site'

  const ready = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_cache_ready',
  })
  await persistGeneratedPreview(t, ready.sessionId, prompt)

  const incomplete = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_cache_incomplete',
    designReferenceUrls: ['https://example.com/reference'],
  })

  expect(incomplete.cached).not.toBe(true)
  expect(incomplete.sessionId).not.toBe(ready.sessionId)

  const cachedAgain = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_cache_again',
  })

  expect(cachedAgain).toMatchObject({
    sessionId: ready.sessionId,
    cached: true,
  })
})

test('inline preview edits patch canonical source artifacts and history restore reverts them', async () => {
  const t = generationConvexTest()

  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt: 'Dashboard artifact alignment site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_dashboard_artifacts',
    anonymousClientId: 'anon-dashboard-artifacts',
    anonymousOwnerSecret: 'owner-secret',
  })

  await persistGeneratedPreview(
    t,
    sessionId,
    'Dashboard artifact alignment site',
  )

  await t.mutation(api.sessions.createEdit, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    editType: 'text',
    targetLabel: 'Hero headline',
    beforeText: 'Dashboard artifact alignment site',
    afterText: 'Edited dashboard artifact headline',
  })

  const editedView = await t.query(api.sessions.getGenerationView, {
    lookup: sessionId,
  })
  const editedPreview = await t.query(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })

  expect(editedPreview?.previewVersion).toBe(2)
  expect(editedPreview?.html).toContain('Edited dashboard artifact headline')
  // Text edits patch the canonical source (Dashboard renders from it, so an
  // unpatched source makes edits vanish on reload).
  expect(editedView?.homeModule?.source).toContain(
    'Edited dashboard artifact headline',
  )
  expect(editedView?.homeModule?.source).not.toContain(
    'Dashboard artifact alignment site',
  )
  // siteSpec: replaceFirstJsonText patches the first occurrence (projectName).
  // The prompt appears in multiple spec fields, so only the first is rewritten.
  expect(editedView?.siteSpec?.specJson).toContain(
    'Edited dashboard artifact headline',
  )
  await expect(
    t.query(api.sessions.listEdits, { lookup: sessionId }),
  ).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        editType: 'text',
        beforeText: 'Dashboard artifact alignment site',
        afterText: 'Edited dashboard artifact headline',
        previewVersion: 2,
      }),
    ]),
  )

  await t.mutation(api.sessions.restorePreviewVersion, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    version: 1,
  })

  const restoredView = await t.query(api.sessions.getGenerationView, {
    lookup: sessionId,
  })
  const restoredPreview = await t.query(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })

  expect(restoredPreview?.previewVersion).toBe(3)
  expect(restoredPreview?.html).toContain('Dashboard artifact alignment site')
  expect(restoredPreview?.html).not.toContain(
    'Edited dashboard artifact headline',
  )
  expect(restoredView?.homeModule?.source).toContain(
    'Dashboard artifact alignment site',
  )
  expect(restoredView?.homeModule?.source).not.toContain(
    'Edited dashboard artifact headline',
  )
  expect(restoredView?.siteSpec?.specJson).toContain(
    'Dashboard artifact alignment site',
  )
  expect(restoredView?.siteSpec?.specJson).not.toContain(
    'Edited dashboard artifact headline',
  )
})

test('inline preview edits patch canonical artifacts even when rendered text normalizes whitespace', async () => {
  const t = generationConvexTest()

  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt: 'Build a rental homepage',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_dashboard_whitespace_edit',
    anonymousClientId: 'anon-dashboard-whitespace-edit',
    anonymousOwnerSecret: 'owner-secret',
  })

  await t.action(internal.sessions.completeGeneration, {
    sessionId,
    html: '<html><body><main><h1>Luxury Car Rental</h1></main></body></html>',
    openUiSource: '$page = "Home"\nroot = Text("Luxury   Car Rental")',
    siteSpecJson: JSON.stringify({
      hero: { headline: 'Luxury   Car Rental' },
    }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  })

  await expect(
    t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'Luxury Car Rental',
      afterText: 'Premium Fleet Rentals',
    }),
  ).resolves.toMatchObject({ saved: true, previewVersion: 2 })

  const editedView = await t.query(api.sessions.getGenerationView, {
    lookup: sessionId,
  })
  const editedPreview = await t.query(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })

  expect(editedPreview?.html).toContain('Premium Fleet Rentals')
  // The rendered DOM collapses whitespace ("Luxury Car Rental") but the source
  // keeps the original spacing ("Luxury   Car Rental"). applyPreviewTextEdit
  // uses a whitespace-tolerant fallback, so the source IS patched and the edit
  // survives reload — the desired behavior.
  expect(editedView?.homeModule?.source).toContain('Premium Fleet Rentals')
  expect(editedView?.homeModule?.source).not.toContain('Luxury   Car Rental')
  expect(editedView?.siteSpec?.specJson).toContain('Premium Fleet Rentals')
  expect(editedView?.siteSpec?.specJson).not.toContain('Luxury   Car Rental')
  await expect(
    t.query(api.sessions.listEdits, { lookup: sessionId }),
  ).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        editType: 'text',
        beforeText: 'Luxury Car Rental',
        afterText: 'Premium Fleet Rentals',
        previewVersion: 2,
      }),
    ]),
  )
})

test('inline preview edits use one sliding debounce entry for export rebuild automation', async () => {
  const t = generationConvexTest()

  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt: 'Build an editable homepage',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_dashboard_debounced_exports',
    anonymousClientId: 'anon-dashboard-debounced-exports',
    anonymousOwnerSecret: 'owner-secret',
  })

  await persistGeneratedPreview(t, sessionId, 'Build an editable homepage')

  await t.mutation(api.sessions.createEdit, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    editType: 'text',
    targetLabel: 'Hero headline',
    beforeText: 'Build an editable homepage',
    afterText: 'Edited export debounce headline',
  })

  await t.mutation(api.sessions.createEdit, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    editType: 'text',
    targetLabel: 'Hero headline',
    beforeText: 'Edited export debounce headline',
    afterText: 'Final export debounce headline',
  })

  const debouncerComponent =
    components.debouncer as unknown as DebouncerComponentApi

  const status = await t.query(debouncerComponent.lib.status, {
    namespace: 'edited-session-export-rebuild',
    key: sessionId,
  })

  expect(status).toMatchObject({
    pending: true,
    mode: 'sliding',
    retriggerCount: 2,
  })
})

test('inline preview edits reject missing text without creating edit history', async () => {
  const t = generationConvexTest()

  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt: 'Build a simple homepage',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_missing_text_edit',
    anonymousClientId: 'anon-missing-text-edit',
    anonymousOwnerSecret: 'owner-secret',
  })

  await persistGeneratedPreview(t, sessionId, 'Build a simple homepage')

  await expect(
    t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'Text that is not in the preview',
      afterText: 'Replacement headline',
    }),
  ).rejects.toThrow()

  const view = await t.query(api.sessions.getGenerationView, {
    lookup: sessionId,
  })
  const edits = await t.query(api.sessions.listEdits, { lookup: sessionId })

  expect(view?.session.previewVersion).toBe(1)
  expect(edits).toHaveLength(0)
})

test('late generation jobs cannot clobber an existing preview', async () => {
  const t = generationConvexTest()

  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt: 'Already ready generated site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_late_generation_guard',
    anonymousClientId: 'anon-late-generation-guard',
    anonymousOwnerSecret: 'owner-secret',
  })

  await persistGeneratedPreview(t, sessionId, 'Already ready generated site')

  await expect(
    t.mutation(internal.sessions.markGenerationStarted, { sessionId }),
  ).resolves.toMatchObject({
    started: false,
    reason: 'preview_already_exists',
  })

  await t.mutation(internal.sessions.addGenerationEvent, {
    sessionId,
    eventType: 'status',
    message: 'Late generation status',
  })

  await expect(
    t.mutation(internal.sessions.failGeneration, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      message: 'Late provider failure',
      elapsed: 123,
    }),
  ).resolves.toMatchObject({
    skipped: true,
    reason: 'preview_already_exists',
  })

  await expect(
    t.action(internal.sessions.completeGeneration, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      html: '<html><body><main><h1>Late overwrite</h1></main></body></html>',
      siteSpecJson: JSON.stringify({ brand: 'Late overwrite' }),
      openUiSource: '$page = "Home"\nroot = Text("Late overwrite")',
      tasks: [
        {
          id: 'homepage',
          label: 'Generate homepage',
          status: 'DONE',
        },
      ],
      elapsed: 456,
    }),
  ).resolves.toMatchObject({
    skipped: true,
    reason: 'preview_already_exists',
  })

  const preview = await t.query(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })
  const view = await t.query(api.sessions.getGenerationView, {
    lookup: sessionId,
  })

  expect(preview?.previewVersion).toBe(1)
  expect(preview?.html).toContain('Already ready generated site')
  expect(preview?.html).not.toContain('Late overwrite')
  expect(view?.session.status).toBe('preview_ready')
  expect(view?.homeModule?.source).toContain('Already ready generated site')
  expect(view?.homeModule?.source).not.toContain('Late overwrite')
  expect(view?.siteSpec?.specJson).toContain('Already ready generated site')
  expect(view?.siteSpec?.specJson).not.toContain('Late overwrite')
})

test('duplicate generation actions cannot start the same queued session twice', async () => {
  const previousGroq = process.env.GROQ_API_KEY
  process.env.GROQ_API_KEY = 'test-groq-key'
  const t = generationConvexTest()

  try {
    const { sessionId } = await t.mutation(api.sessions.create, {
      prompt: 'Duplicate generation action guard',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: 'workspace_duplicate_start_guard',
      anonymousClientId: 'anon-duplicate-start-guard',
      anonymousOwnerSecret: 'owner-secret',
    })

    await expect(
      t.mutation(internal.sessions.markGenerationStarted, { sessionId }),
    ).resolves.toMatchObject({ started: true })

    await expect(
      t.mutation(internal.sessions.markGenerationStarted, { sessionId }),
    ).resolves.toMatchObject({
      started: false,
      reason: 'generation_already_started',
    })

    const view = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    const startedEvents = view?.events.filter(
      (event) => event.message === 'Generation started',
    )

    expect(view?.session.status).toBe('streaming')
    expect(startedEvents).toHaveLength(1)
  } finally {
    if (previousGroq === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousGroq
  }
})
