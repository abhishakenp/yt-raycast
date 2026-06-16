import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const persistGeneratedPreview = (
  t: ReturnType<typeof convexTest>,
  sessionId: Id<'sessions'>,
  prompt: string,
) =>
  t.action(internal.sessions.completeGeneration, {
    sessionId,
    html: `<html><body><main><h1 data-cms="field:hero.headline type:text">${prompt}</h1></main></body></html>`,
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
  const t = convexTest(schema, modules)

  const { sessionId } = await t.runMutation(api.sessions.create, {
    prompt: 'Build a concise product site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_test',
    anonymousClientId: 'anon-generation-view',
  })

  const view = await t.runQuery(api.sessions.getGenerationView, {
    lookup: sessionId,
  })

  expect(view?.session.sessionId).toBe(sessionId)
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
    const t = convexTest(schema, modules)

    const { sessionId } = await t.runMutation(api.sessions.create, {
      prompt: 'Build a fast failure site',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: 'workspace_missing_model_config',
      anonymousClientId: 'anon-missing-model-config',
    })

    const session = await t.runQuery(api.sessions.getSessionApiResponse, {
      lookup: sessionId,
    })
    const stream = await t.runQuery(api.sessions.getEventStream, {
      lookup: sessionId,
    })

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
    if (previousOpenUiHomeModel === undefined) delete process.env.OPENUI_HOME_MODEL
    else process.env.OPENUI_HOME_MODEL = previousOpenUiHomeModel
    if (previousGroqModel === undefined) delete process.env.GROQ_MODEL
    else process.env.GROQ_MODEL = previousGroqModel
  }
})

test('public prompt cache is scoped by preferred language', async () => {
  const t = convexTest(schema, modules)
  const prompt = 'Build a bakery homepage with catering menus'

  const english = await t.runMutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_language_cache_en',
  })

  await persistGeneratedPreview(t, english.sessionId, prompt)

  const hindi = await t.runMutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'hi',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_language_cache_hi',
  })

  const englishAgain = await t.runMutation(api.sessions.create, {
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
  const t = convexTest(schema, modules)
  const prompt = 'Build a replayable public prompt site'

  const ready = await t.runMutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_replay_ready',
  })
  await persistGeneratedPreview(t, ready.sessionId, prompt)

  const replay = await t.runMutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_replay_second',
    anonymousClientId: 'anon-public-replay',
    anonymousOwnerSecret: 'owner-public-replay',
    reusePublicCache: true,
  })

  expect(replay).toMatchObject({
    sessionId: ready.sessionId,
    cached: true,
    reused: true,
  })

  const stream = await t.runQuery(api.sessions.getEventStream, {
    lookup: ready.sessionId,
  })
  expect(stream.events.find((event) => event.eventType === 'cache_hit'))
    .toMatchObject({
      cacheHit: true,
      provider: 'prompt-cache',
    })
})

test('workspace idempotency returns the same queued session for a retried create', async () => {
  const t = convexTest(schema, modules)
  const request = {
    prompt: 'Build an idempotent retry site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html' as const,
    isPrivate: false,
    workspace: 'workspace_retry_idempotent',
    anonymousClientId: 'anon-retry-idempotent',
    anonymousOwnerSecret: 'owner-retry-idempotent',
  }

  const first = await t.runMutation(api.sessions.create, request)
  const second = await t.runMutation(api.sessions.create, request)

  expect(second).toMatchObject({
    sessionId: first.sessionId,
    idempotent: true,
  })

  const view = await t.runQuery(api.sessions.getGenerationView, {
    lookup: first.sessionId,
  })

  expect(view?.tasks).toHaveLength(1)
})

test('workspace idempotency rejects conflicting reuse of a workspace key', async () => {
  const t = convexTest(schema, modules)

  await t.runMutation(api.sessions.create, {
    prompt: 'Build the original workspace site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_conflict_guard',
    anonymousClientId: 'anon-workspace-conflict',
    anonymousOwnerSecret: 'owner-workspace-conflict',
  })

  await expect(
    t.runMutation(api.sessions.create, {
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

test('v2 generation does not reuse a default-engine prompt cache entry', async () => {
  const t = convexTest(schema, modules)
  const prompt = 'Build a v2 isolated cache prompt site'

  const defaultEngine = await t.runMutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_v1_cache_ready',
  })
  await persistGeneratedPreview(t, defaultEngine.sessionId, prompt)

  const v2 = await t.runMutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_v2_cache_request',
    engineVersion: 'v2',
    reusePublicCache: true,
  })

  expect(v2.cached).not.toBe(true)
  expect(v2.sessionId).not.toBe(defaultEngine.sessionId)
})

test('public prompt cache skips newer incomplete duplicate sessions', async () => {
  const t = convexTest(schema, modules)
  const prompt = 'Build a durable cached prompt site'

  const ready = await t.runMutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_cache_ready',
  })
  await persistGeneratedPreview(t, ready.sessionId, prompt)

  const incomplete = await t.runMutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_cache_incomplete',
    designReferenceUrls: ['https://example.com/reference'],
  })

  expect(incomplete.cached).not.toBe(true)
  expect(incomplete.sessionId).not.toBe(ready.sessionId)

  const cachedAgain = await t.runMutation(api.sessions.create, {
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

test('inline preview edits and history restore keep dashboard source artifacts aligned', async () => {
  const t = convexTest(schema, modules)

  const { sessionId } = await t.runMutation(api.sessions.create, {
    prompt: 'Dashboard artifact alignment site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_dashboard_artifacts',
    anonymousClientId: 'anon-dashboard-artifacts',
    anonymousOwnerSecret: 'owner-secret',
  })

  await persistGeneratedPreview(t, sessionId, 'Dashboard artifact alignment site')

  await t.runMutation(api.sessions.createEdit, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    editType: 'text',
    targetLabel: 'Hero headline',
    beforeText: 'Dashboard artifact alignment site',
    afterText: 'Edited dashboard artifact headline',
  })

  const editedView = await t.runQuery(api.sessions.getGenerationView, {
    lookup: sessionId,
  })
  const editedPreview = await t.runQuery(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })

  expect(editedPreview?.previewVersion).toBe(2)
  expect(editedPreview?.html).toContain('Edited dashboard artifact headline')
  expect(editedView?.homeModule?.source).toContain(
    'Edited dashboard artifact headline',
  )
  expect(editedView?.siteSpec?.specJson).toContain(
    'Edited dashboard artifact headline',
  )

  await t.runMutation(api.sessions.restorePreviewVersion, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    version: 1,
  })

  const restoredView = await t.runQuery(api.sessions.getGenerationView, {
    lookup: sessionId,
  })
  const restoredPreview = await t.runQuery(api.sessions.getPublicPreview, {
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

test('inline preview edits update dashboard artifacts when rendered text normalizes whitespace', async () => {
  const t = convexTest(schema, modules)

  const { sessionId } = await t.runMutation(api.sessions.create, {
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
    html: '<html><body><main><h1 data-cms="field:hero.headline type:text">Luxury Car Rental</h1></main></body></html>',
    openUiSource: '$page = "Home"\nroot = Text("Luxury   Car Rental")',
    siteSpecJson: JSON.stringify({
      hero: { headline: 'Luxury   Car Rental' },
    }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  })

  await expect(
    t.runMutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'Luxury Car Rental',
      afterText: 'Premium Fleet Rentals',
    }),
  ).resolves.toMatchObject({ saved: true, previewVersion: 2 })

  const editedView = await t.runQuery(api.sessions.getGenerationView, {
    lookup: sessionId,
  })
  const editedPreview = await t.runQuery(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })

  expect(editedPreview?.html).toContain('Premium Fleet Rentals')
  expect(editedView?.homeModule?.source).toContain('Premium Fleet Rentals')
  expect(editedView?.homeModule?.source).not.toContain('Luxury   Car Rental')
  expect(editedView?.siteSpec?.specJson).toContain('Premium Fleet Rentals')
  expect(editedView?.siteSpec?.specJson).not.toContain('Luxury   Car Rental')
})

test('inline preview edits reject missing text without creating edit history', async () => {
  const t = convexTest(schema, modules)

  const { sessionId } = await t.runMutation(api.sessions.create, {
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
    t.runMutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'Text that is not in the preview',
      afterText: 'Replacement headline',
    }),
  ).rejects.toThrow()

  const view = await t.runQuery(api.sessions.getGenerationView, {
    lookup: sessionId,
  })
  const edits = await t.runQuery(api.sessions.listEdits, { sessionId })

  expect(view?.session.previewVersion).toBe(1)
  expect(edits).toHaveLength(0)
})

test('late generation jobs cannot clobber an existing preview', async () => {
  const t = convexTest(schema, modules)

  const { sessionId } = await t.runMutation(api.sessions.create, {
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
    t.runMutation(internal.sessions.markGenerationStarted, { sessionId }),
  ).resolves.toMatchObject({
    started: false,
    reason: 'preview_already_exists',
  })

  await t.runMutation(internal.sessions.addGenerationEvent, {
    sessionId,
    eventType: 'status',
    message: 'Late generation status',
  })

  await expect(
    t.runMutation(internal.sessions.failGeneration, {
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

  const preview = await t.runQuery(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })
  const view = await t.runQuery(api.sessions.getGenerationView, {
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
  const t = convexTest(schema, modules)

  try {
    const { sessionId } = await t.runMutation(api.sessions.create, {
      prompt: 'Duplicate generation action guard',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: 'workspace_duplicate_start_guard',
      anonymousClientId: 'anon-duplicate-start-guard',
      anonymousOwnerSecret: 'owner-secret',
    })

    await expect(
      t.runMutation(internal.sessions.markGenerationStarted, { sessionId }),
    ).resolves.toMatchObject({ started: true })

    await expect(
      t.runMutation(internal.sessions.markGenerationStarted, { sessionId }),
    ).resolves.toMatchObject({
      started: false,
      reason: 'generation_already_started',
    })

    const view = await t.runQuery(api.sessions.getGenerationView, {
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
