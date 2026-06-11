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
  t.runMutation(internal.sessions.completeGeneration, {
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
    t.runMutation(internal.sessions.completeGeneration, {
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
