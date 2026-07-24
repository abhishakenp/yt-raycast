/// <reference types="vite/client" />

import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { hashOwnerSecret } from './lib/session_access_helpers'
import { exportGeneratorRevision } from './lib/session_export_helpers'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const OWNER_SECRET = 'artifact-invalidation-owner-secret'
const SOURCE_TEXT = 'Original English headline'
const FRENCH_TEXT = 'Titre anglais original'
const HTML_SOURCE = `<!doctype html><html><body><main class="hero-card"><h1>${SOURCE_TEXT}</h1><a href="https://old.example">Docs</a><img src="https://old.example/hero.jpg" alt="Hero image"></main></body></html>`
const OPENUI_SOURCE = `$page = "Home"\nroot = Text("${SOURCE_TEXT}")`

type ExportTarget = 'html' | 'react' | 'next' | 'lakebed'

const EXPORT_TARGETS: ReadonlyArray<ExportTarget> = [
  'html',
  'react',
  'next',
  'lakebed',
]

type ReadySessionOptions = {
  key: string
  preferredLanguage?: string
  source?: string
}

const artifactLifecycleTest = () => {
  const t = convexTest(schema, modules)
  registerDebouncer(t)
  return t
}

async function createReadySession(
  t: ReturnType<typeof artifactLifecycleTest>,
  options: ReadySessionOptions,
) {
  const now = Date.now()
  const ownerSecretHash = await hashOwnerSecret(OWNER_SECRET)
  const source = options.source ?? HTML_SOURCE

  return await t.run(async (ctx) => {
    const sessionId = await ctx.db.insert('sessions', {
      anonOwnerSecretHash: ownerSecretHash,
      workspace: `workspace_artifact_${options.key}`,
      prompt: `Artifact lifecycle ${options.key}`,
      status: 'preview_ready',
      homepageReady: true,
      siteSpecReady: true,
      openuiReady: true,
      preferredLanguage: options.preferredLanguage ?? 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      previewVersion: 1,
      createdAt: now,
      updatedAt: now,
    })

    await ctx.db.insert('previews', {
      sessionId,
      version: 1,
      html: HTML_SOURCE,
      openUiSource: source,
      siteSpecJson: JSON.stringify({ hero: { headline: SOURCE_TEXT } }),
      createdAt: now,
      source: 'generation',
    })
    await ctx.db.insert('generatedModules', {
      sessionId,
      moduleKey: 'home',
      source,
      status: 'succeeded',
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('siteSpecs', {
      sessionId,
      specJson: JSON.stringify({ hero: { headline: SOURCE_TEXT } }),
      createdAt: now,
      updatedAt: now,
    })

    return sessionId
  })
}

function storeArtifact(
  t: ReturnType<typeof artifactLifecycleTest>,
  payload: string,
) {
  return t.action(async (ctx) =>
    ctx.storage.store(new Blob([payload], { type: 'application/zip' })),
  )
}

function seedExportRecord(
  t: ReturnType<typeof artifactLifecycleTest>,
  sessionId: Id<'sessions'>,
  target: ExportTarget,
  previewVersion: number,
) {
  return t.run(async (ctx) => {
    const existing = await ctx.db
      .query('exports')
      .withIndex('by_sessionId_target', (index) =>
        index.eq('sessionId', sessionId).eq('target', target),
      )
      .first()

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        status: 'ready',
        previewVersion,
        requiresPayment: false,
        updatedAt: Date.now(),
      })
      return existing._id
    }

    return await ctx.db.insert('exports', {
      sessionId,
      target,
      status: 'ready',
      previewVersion,
      requiresPayment: false,
      fileCount: 1,
      downloadUrl: `/api/sessions/${sessionId}/exports/${target}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  })
}

async function seedReadyArtifact(
  t: ReturnType<typeof artifactLifecycleTest>,
  sessionId: Id<'sessions'>,
  target: ExportTarget,
  previewVersion: number,
  hash: string,
) {
  await seedExportRecord(t, sessionId, target, previewVersion)
  const storageId = await storeArtifact(t, `zip:${hash}`)
  const filesStorageId =
    target === 'lakebed'
      ? await storeArtifact(
          t,
          JSON.stringify({
            'client/index.ts': `export const hash = '${hash}'`,
          }),
        )
      : undefined
  const ready = await t.mutation(
    internal.sessions.recordExportArtifactBuildReady,
    {
      sessionId,
      target,
      previewVersion,
      generatorRevision: exportGeneratorRevision(target),
      storageId,
      ...(filesStorageId === undefined ? {} : { filesStorageId }),
      filename: `${target}-${previewVersion}.zip`,
      contentType: 'application/zip',
      fileCount: 1,
      byteLength: 8,
      hash,
    },
  )

  return { ready, storageId, filesStorageId }
}

async function completeArtifactBuild(
  t: ReturnType<typeof artifactLifecycleTest>,
  sessionId: Id<'sessions'>,
  target: ExportTarget,
  previewVersion: number,
  hash: string,
) {
  const generatorRevision = exportGeneratorRevision(target)
  const building = await t.mutation(
    internal.sessions.markExportArtifactBuildStarted,
    { sessionId, target, previewVersion, generatorRevision },
  )
  const storageId = await storeArtifact(t, `zip:${hash}`)
  const filesStorageId =
    target === 'lakebed'
      ? await storeArtifact(
          t,
          JSON.stringify({
            'client/index.ts': `export const hash = '${hash}'`,
          }),
        )
      : undefined
  const ready = await t.mutation(
    internal.sessions.recordExportArtifactBuildReady,
    {
      sessionId,
      target,
      previewVersion,
      generatorRevision,
      storageId,
      ...(filesStorageId === undefined ? {} : { filesStorageId }),
      filename: `${target}-${previewVersion}.zip`,
      contentType: 'application/zip',
      fileCount: 1,
      byteLength: 8,
      hash,
    },
  )

  return { building, ready, storageId, filesStorageId }
}

function loadDownload(
  t: ReturnType<typeof artifactLifecycleTest>,
  sessionId: Id<'sessions'>,
  target: ExportTarget,
  anonymousOwnerSecret = OWNER_SECRET,
) {
  return t.query(api.sessions.getOwnedExportArtifactDownloadByLookup, {
    lookup: sessionId,
    target,
    anonymousOwnerSecret,
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-13T12:00:00.000Z'))
  vi.stubEnv('DISABLE_PAYWALL', 'false')
  vi.stubEnv('VITE_DISABLE_CLERK', 'true')
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('inline edit export artifact invalidation release regressions', () => {
  it('invalidates the current HTML artifact after a canonical text edit', async () => {
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, { key: 'canonical_text' })
    await seedReadyArtifact(t, sessionId, 'html', 1, 'canonical-v1')

    const before = await loadDownload(t, sessionId, 'html')
    const edit = await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: SOURCE_TEXT,
      afterText: 'Updated English headline',
    })
    const after = await loadDownload(t, sessionId, 'html')
    const targets = await t.query(api.sessions.getExportTargets, {
      lookup: sessionId,
    })
    const htmlTarget = targets.targets.find(
      (target) => target.target === 'html',
    )
    const artifacts = await t.run((ctx) =>
      ctx.db
        .query('exportArtifacts')
        .withIndex('by_sessionId_target', (index) =>
          index.eq('sessionId', sessionId).eq('target', 'html'),
        )
        .collect(),
    )

    expect(before).toMatchObject({
      latestPreviewVersion: 1,
      artifact: { status: 'ready', previewVersion: 1, hash: 'canonical-v1' },
    })
    expect(edit).toMatchObject({ previewVersion: 2, saved: true })
    expect(after).toMatchObject({
      latestPreviewVersion: 2,
      artifact: null,
      storageUrl: null,
    })
    expect(htmlTarget).toMatchObject({
      status: 'stale',
      currentPreviewVersion: 2,
      artifactReady: false,
    })
    expect(artifacts).toHaveLength(1)
    expect(artifacts[0]).toMatchObject({
      previewVersion: 1,
      status: 'ready',
      hash: 'canonical-v1',
    })
  })

  it.each([
    {
      name: 'style',
      editType: 'style' as const,
      beforeText: 'hero-card',
      afterText: 'color: red;',
    },
    {
      name: 'image',
      editType: 'image' as const,
      beforeText: 'Hero image',
      afterText: 'https://new.example/hero.jpg',
    },
  ])(
    'invalidates the current artifact after a $name edit',
    async (editCase) => {
      const t = artifactLifecycleTest()
      const sessionId = await createReadySession(t, { key: editCase.name })
      await seedReadyArtifact(t, sessionId, 'html', 1, `${editCase.name}-v1`)

      const edit = await t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: OWNER_SECRET,
        editType: editCase.editType,
        targetLabel: `Hero ${editCase.name}`,
        beforeText: editCase.beforeText,
        afterText: editCase.afterText,
      })
      const download = await loadDownload(t, sessionId, 'html')

      expect(edit).toMatchObject({ previewVersion: 2, saved: true })
      expect(download).toMatchObject({
        latestPreviewVersion: 2,
        artifact: null,
        storageUrl: null,
      })
    },
  )

  it('invalidates the current artifact after a persisted link rewrite', async () => {
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, { key: 'link' })
    const updatedSource = HTML_SOURCE.replace(
      'https://old.example',
      'https://new.example',
    )
    await seedReadyArtifact(t, sessionId, 'html', 1, 'link-v1')

    const edit = await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'ai_rewrite',
      targetLabel: 'link: https://old.example -> https://new.example',
      beforeText: HTML_SOURCE,
      afterText: updatedSource,
      afterHtml: updatedSource,
      instruction: 'replace selected link',
    })
    const download = await loadDownload(t, sessionId, 'html')

    expect(edit).toMatchObject({ previewVersion: 2, saved: true })
    expect(download).toMatchObject({
      latestPreviewVersion: 2,
      artifact: null,
      storageUrl: null,
    })
  })

  it('invalidates the current artifact after a translated text edit', async () => {
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, {
      key: 'translated_text',
      preferredLanguage: 'fr',
      source: OPENUI_SOURCE,
    })
    await t.mutation(api.translationCache.setBatch, {
      locale: 'fr',
      entries: [{ text: SOURCE_TEXT, translation: FRENCH_TEXT }],
    })
    await seedReadyArtifact(t, sessionId, 'html', 1, 'translated-v1')

    const edit = await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: FRENCH_TEXT,
      afterText: 'Titre francais publie',
    })
    const download = await loadDownload(t, sessionId, 'html')

    expect(edit).toMatchObject({ previewVersion: 2, saved: true })
    expect(download).toMatchObject({
      latestPreviewVersion: 2,
      artifact: null,
      storageUrl: null,
    })
  })

  it('keeps the ready artifact when an edit is canceled before persistence', async () => {
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, { key: 'canceled' })
    const seeded = await seedReadyArtifact(
      t,
      sessionId,
      'html',
      1,
      'canceled-v1',
    )

    const before = await loadDownload(t, sessionId, 'html')
    const after = await loadDownload(t, sessionId, 'html')

    expect(after).toEqual(before)
    expect(after).toMatchObject({
      latestPreviewVersion: 1,
      artifact: {
        artifactId: seeded.ready.artifactId,
        status: 'ready',
        hash: 'canceled-v1',
      },
    })
  })

  it('treats an unchanged edit as a no-op without invalidating the artifact', async () => {
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, { key: 'no_op' })
    await seedReadyArtifact(t, sessionId, 'html', 1, 'no-op-v1')
    await t.mutation(api.sessions.publishPreviewByLookup, {
      lookup: sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      requestedSlug: 'artifact-no-op-preview',
    })
    // publishPreviewByLookup forces a rebuild to inject the "Built with Ship
    // Fast" badge; re-seed the ready artifact so the no-op edit test starts
    // from a known-ready state.
    const seeded = await seedReadyArtifact(t, sessionId, 'html', 1, 'no-op-v1')

    const result = await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: SOURCE_TEXT,
      afterText: SOURCE_TEXT,
    })
    const download = await loadDownload(t, sessionId, 'html')
    const deployment = await t.query(api.sessions.getDeploymentStatusByLookup, {
      lookup: sessionId,
    })

    expect.soft(result).toMatchObject({ previewVersion: 1, saved: false })
    expect.soft(download).toMatchObject({
      latestPreviewVersion: 1,
      artifact: {
        artifactId: seeded.ready.artifactId,
        status: 'ready',
        hash: 'no-op-v1',
      },
    })
    expect.soft(deployment).toMatchObject({
      status: 'ready',
      previewVersion: 1,
    })
    expect.soft(deployment?.pendingPreviewVersion).toBeUndefined()
  })

  it('preserves the winning artifact when a stale edit is rejected', async () => {
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, { key: 'stale_edit' })
    await seedReadyArtifact(t, sessionId, 'html', 1, 'stale-edit-v1')
    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: SOURCE_TEXT,
      afterText: 'Winning headline',
    })
    const seeded = await seedReadyArtifact(
      t,
      sessionId,
      'html',
      2,
      'winning-v2',
    )

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: OWNER_SECRET,
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: SOURCE_TEXT,
        afterText: 'Stale overwrite',
      }),
    ).rejects.toThrow(/TEXT_NOT_FOUND|not found/)

    const download = await loadDownload(t, sessionId, 'html')
    expect(download).toMatchObject({
      latestPreviewVersion: 2,
      artifact: {
        artifactId: seeded.ready.artifactId,
        status: 'ready',
        hash: 'winning-v2',
      },
    })
  })

  it('rejects unauthorized edits without invalidating the owner artifact', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', 'false')
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, { key: 'unauthorized' })
    const seeded = await seedReadyArtifact(t, sessionId, 'html', 1, 'owner-v1')

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'wrong-owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: SOURCE_TEXT,
        afterText: 'Unauthorized overwrite',
      }),
    ).rejects.toThrow(/FORBIDDEN|do not own/)

    const download = await loadDownload(t, sessionId, 'html')
    expect(download).toMatchObject({
      latestPreviewVersion: 1,
      artifact: {
        artifactId: seeded.ready.artifactId,
        status: 'ready',
        hash: 'owner-v1',
      },
    })
  })

  it('invalidates only the edited session and rejects its obsolete build input', async () => {
    const t = artifactLifecycleTest()
    const editedSessionId = await createReadySession(t, {
      key: 'isolation_edited',
    })
    const untouchedSessionId = await createReadySession(t, {
      key: 'isolation_untouched',
    })
    await seedReadyArtifact(t, editedSessionId, 'html', 1, 'edited-v1')
    const untouched = await seedReadyArtifact(
      t,
      untouchedSessionId,
      'html',
      1,
      'untouched-v1',
    )

    await t.mutation(api.sessions.createEdit, {
      sessionId: editedSessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: SOURCE_TEXT,
      afterText: 'Edited session headline',
    })

    const [editedDownload, untouchedDownload, obsoleteBuild] =
      await Promise.all([
        loadDownload(t, editedSessionId, 'html'),
        loadDownload(t, untouchedSessionId, 'html'),
        t.query(internal.sessions.prepareExportArtifactBuildInput, {
          sessionId: editedSessionId,
          target: 'html',
          previewVersion: 1,
          generatorRevision: exportGeneratorRevision('html'),
        }),
      ])

    expect(editedDownload).toMatchObject({
      latestPreviewVersion: 2,
      artifact: null,
      storageUrl: null,
    })
    expect(untouchedDownload).toMatchObject({
      latestPreviewVersion: 1,
      artifact: {
        artifactId: untouched.ready.artifactId,
        status: 'ready',
        hash: 'untouched-v1',
      },
    })
    expect(obsoleteBuild).toBeNull()
  })

  it('invalidates every export target for only the new edited version', async () => {
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, { key: 'all_targets' })
    for (const target of EXPORT_TARGETS) {
      await seedReadyArtifact(t, sessionId, target, 1, `${target}-v1`)
    }

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: SOURCE_TEXT,
      afterText: 'Every target headline',
    })

    const downloads = await Promise.all(
      EXPORT_TARGETS.map((target) => loadDownload(t, sessionId, target)),
    )
    const targetState = await t.query(api.sessions.getExportTargets, {
      lookup: sessionId,
    })
    const historicalArtifacts = await t.run((ctx) =>
      ctx.db
        .query('exportArtifacts')
        .withIndex('by_sessionId_target', (index) =>
          index.eq('sessionId', sessionId),
        )
        .collect(),
    )

    expect(downloads).toHaveLength(EXPORT_TARGETS.length)
    for (const download of downloads) {
      expect(download).toMatchObject({
        latestPreviewVersion: 2,
        artifact: null,
        storageUrl: null,
        filesUrl: null,
      })
    }
    expect(targetState.targets).toHaveLength(EXPORT_TARGETS.length)
    for (const target of targetState.targets) {
      expect(target).toMatchObject({
        status: 'stale',
        currentPreviewVersion: 2,
        artifactReady: false,
      })
    }
    expect(historicalArtifacts).toHaveLength(EXPORT_TARGETS.length)
    expect(
      historicalArtifacts.every(
        (artifact) =>
          artifact.previewVersion === 1 && artifact.status === 'ready',
      ),
    ).toBe(true)
  })

  it('builds the edited download once and then reuses the ready artifact', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'true')
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, { key: 'rebuild_once' })
    await seedReadyArtifact(t, sessionId, 'html', 1, 'rebuild-v1')
    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: SOURCE_TEXT,
      afterText: 'Rebuilt headline',
    })
    await t.mutation(api.sessions.createExportByLookup, {
      lookup: sessionId,
      target: 'html',
      anonymousOwnerSecret: OWNER_SECRET,
    })

    const queued = await t.mutation(api.sessions.ensureExportArtifactByLookup, {
      lookup: sessionId,
      target: 'html',
      anonymousOwnerSecret: OWNER_SECRET,
    })
    const completed = await completeArtifactBuild(
      t,
      sessionId,
      'html',
      2,
      'rebuild-v2',
    )
    const firstReuse = await t.mutation(
      api.sessions.ensureExportArtifactByLookup,
      {
        lookup: sessionId,
        target: 'html',
        anonymousOwnerSecret: OWNER_SECRET,
      },
    )
    const secondReuse = await t.mutation(
      api.sessions.ensureExportArtifactByLookup,
      {
        lookup: sessionId,
        target: 'html',
        anonymousOwnerSecret: OWNER_SECRET,
      },
    )
    const download = await loadDownload(t, sessionId, 'html')
    const versionTwoEvents = await t.run(async (ctx) => {
      const events = await ctx.db
        .query('generationEvents')
        .withIndex('by_sessionId_createdAt', (index) =>
          index.eq('sessionId', sessionId),
        )
        .collect()
      return events.filter(
        (event) =>
          event.previewVersion === 2 &&
          (event.eventType === 'export_artifact_building' ||
            event.eventType === 'export_artifact_ready'),
      )
    })

    expect(queued).toMatchObject({ status: 'queued', previewVersion: 2 })
    expect(completed.building).toMatchObject({
      status: 'building',
      previewVersion: 2,
    })
    expect(firstReuse).toMatchObject({
      artifactId: completed.ready.artifactId,
      status: 'ready',
      previewVersion: 2,
      hash: 'rebuild-v2',
    })
    expect(secondReuse).toEqual(firstReuse)
    expect(download).toMatchObject({
      latestPreviewVersion: 2,
      artifact: {
        artifactId: completed.ready.artifactId,
        status: 'ready',
        hash: 'rebuild-v2',
      },
    })
    expect(download?.storageUrl).toMatch(/^https?:\/\//)
    expect(versionTwoEvents.map((event) => event.eventType).sort()).toEqual([
      'export_artifact_building',
      'export_artifact_ready',
    ])
  })

  it('never exposes a stale ZIP completed after a concurrent edit', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'true')
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, { key: 'concurrent_build' })
    await seedExportRecord(t, sessionId, 'html', 1)
    await t.mutation(api.sessions.ensureExportArtifactByLookup, {
      lookup: sessionId,
      target: 'html',
      anonymousOwnerSecret: OWNER_SECRET,
    })
    await t.mutation(internal.sessions.markExportArtifactBuildStarted, {
      sessionId,
      target: 'html',
      previewVersion: 1,
      generatorRevision: exportGeneratorRevision('html'),
    })

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: SOURCE_TEXT,
      afterText: 'Concurrent winning headline',
    })

    const staleStorageId = await storeArtifact(t, 'zip:stale-v1')
    await t.mutation(internal.sessions.recordExportArtifactBuildReady, {
      sessionId,
      target: 'html',
      previewVersion: 1,
      generatorRevision: exportGeneratorRevision('html'),
      storageId: staleStorageId,
      filename: 'html-1.zip',
      contentType: 'application/zip',
      fileCount: 1,
      byteLength: 12,
      hash: 'stale-v1',
    })

    const [beforeRebuild, obsoleteBuild] = await Promise.all([
      loadDownload(t, sessionId, 'html'),
      t.query(internal.sessions.prepareExportArtifactBuildInput, {
        sessionId,
        target: 'html',
        previewVersion: 1,
        generatorRevision: exportGeneratorRevision('html'),
      }),
    ])
    expect(beforeRebuild).toMatchObject({
      latestPreviewVersion: 2,
      artifact: null,
      storageUrl: null,
    })
    expect(obsoleteBuild).toBeNull()

    await t.mutation(api.sessions.createExportByLookup, {
      lookup: sessionId,
      target: 'html',
      anonymousOwnerSecret: OWNER_SECRET,
    })
    await t.mutation(api.sessions.ensureExportArtifactByLookup, {
      lookup: sessionId,
      target: 'html',
      anonymousOwnerSecret: OWNER_SECRET,
    })
    const current = await completeArtifactBuild(
      t,
      sessionId,
      'html',
      2,
      'current-v2',
    )
    const afterRebuild = await loadDownload(t, sessionId, 'html')

    expect(afterRebuild).toMatchObject({
      latestPreviewVersion: 2,
      artifact: {
        artifactId: current.ready.artifactId,
        status: 'ready',
        hash: 'current-v2',
      },
    })
    expect(afterRebuild?.storageUrl).toMatch(/^https?:\/\//)
  })

  it('does not reuse an English artifact after switching the export language', async () => {
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, {
      key: 'language_switch',
      source: OPENUI_SOURCE,
    })
    await t.mutation(api.translationCache.setBatch, {
      locale: 'fr',
      entries: [{ text: SOURCE_TEXT, translation: FRENCH_TEXT }],
    })
    const seeded = await seedReadyArtifact(
      t,
      sessionId,
      'html',
      1,
      'english-v1',
    )

    await t.mutation(api.sessions.setPreferredLanguage, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      preferredLanguage: 'fr',
    })

    const download = await loadDownload(t, sessionId, 'html')
    const ensured = await t.mutation(
      api.sessions.ensureExportArtifactByLookup,
      {
        lookup: sessionId,
        target: 'html',
        anonymousOwnerSecret: OWNER_SECRET,
      },
    )
    const prepared = await t.query(
      internal.sessions.prepareExportArtifactBuildInput,
      {
        sessionId,
        target: 'html',
        previewVersion: 1,
        generatorRevision: exportGeneratorRevision('html'),
      },
    )

    expect.soft(download).toMatchObject({
      latestPreviewVersion: 1,
      artifact: null,
      storageUrl: null,
    })
    expect.soft(ensured).toMatchObject({
      status: 'queued',
      previewVersion: 1,
    })
    expect.soft(ensured).not.toMatchObject({
      artifactId: seeded.ready.artifactId,
      status: 'ready',
      hash: 'english-v1',
    })
    expect(prepared).toMatchObject({
      locale: 'fr',
      previewVersion: 1,
    })
    expect(prepared?.source).toContain(FRENCH_TEXT)
  })

  it('marks a published preview updating and refreshes only the edited version', async () => {
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, {
      key: 'published_preview',
    })
    await t.mutation(api.sessions.publishPreviewByLookup, {
      lookup: sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      requestedSlug: 'artifact-published-preview',
    })

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: SOURCE_TEXT,
      afterText: 'Published edited headline',
    })
    const updating = await t.query(api.sessions.getDeploymentStatusByLookup, {
      lookup: sessionId,
    })
    const staleRefresh = await t.mutation(
      internal.sessions.rebuildEditedSessionExports,
      { sessionId, previewVersion: 1 },
    )
    const afterStaleRefresh = await t.query(
      api.sessions.getDeploymentStatusByLookup,
      { lookup: sessionId },
    )
    const currentRefresh = await t.mutation(
      internal.sessions.rebuildEditedSessionExports,
      { sessionId, previewVersion: 2 },
    )
    const ready = await t.query(api.sessions.getDeploymentStatusByLookup, {
      lookup: sessionId,
    })

    expect(updating).toMatchObject({
      status: 'updating',
      previewVersion: 1,
      pendingPreviewVersion: 2,
    })
    expect(staleRefresh).toEqual({ status: 'stale' })
    expect(afterStaleRefresh).toEqual(updating)
    expect(currentRefresh).toEqual({ status: 'queued' })
    expect(ready).toMatchObject({
      status: 'ready',
      previewVersion: 2,
    })
    expect(ready?.pendingPreviewVersion).toBeUndefined()
  })

  it('rebuilds the edited Lakebed deployment artifact once and then reuses it', async () => {
    const t = artifactLifecycleTest()
    const sessionId = await createReadySession(t, { key: 'lakebed_rebuild' })
    await seedReadyArtifact(t, sessionId, 'lakebed', 1, 'lakebed-v1')
    const before = await t.query(
      api.sessions.getOwnedLakebedDeploymentArtifactByLookup,
      { lookup: sessionId, anonymousOwnerSecret: OWNER_SECRET },
    )

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: SOURCE_TEXT,
      afterText: 'Lakebed edited headline',
    })
    const invalidated = await t.query(
      api.sessions.getOwnedLakebedDeploymentArtifactByLookup,
      { lookup: sessionId, anonymousOwnerSecret: OWNER_SECRET },
    )
    const queued = await t.mutation(api.sessions.ensureExportArtifactByLookup, {
      lookup: sessionId,
      target: 'lakebed',
      anonymousOwnerSecret: OWNER_SECRET,
    })
    const completed = await completeArtifactBuild(
      t,
      sessionId,
      'lakebed',
      2,
      'lakebed-v2',
    )
    const ready = await t.query(
      api.sessions.getOwnedLakebedDeploymentArtifactByLookup,
      { lookup: sessionId, anonymousOwnerSecret: OWNER_SECRET },
    )
    const firstReuse = await t.mutation(
      api.sessions.ensureExportArtifactByLookup,
      {
        lookup: sessionId,
        target: 'lakebed',
        anonymousOwnerSecret: OWNER_SECRET,
      },
    )
    const secondReuse = await t.mutation(
      api.sessions.ensureExportArtifactByLookup,
      {
        lookup: sessionId,
        target: 'lakebed',
        anonymousOwnerSecret: OWNER_SECRET,
      },
    )

    expect(before).toMatchObject({
      previewVersion: 1,
      status: 'ready',
    })
    expect(before.filesUrl).toMatch(/^https?:\/\//)
    expect(invalidated).toMatchObject({
      previewVersion: 2,
      status: 'queued',
      filesUrl: null,
    })
    expect(queued).toMatchObject({ status: 'queued', previewVersion: 2 })
    expect(ready).toMatchObject({
      previewVersion: 2,
      status: 'ready',
    })
    expect(ready.filesUrl).toMatch(/^https?:\/\//)
    expect(firstReuse).toMatchObject({
      artifactId: completed.ready.artifactId,
      status: 'ready',
      previewVersion: 2,
      hash: 'lakebed-v2',
    })
    expect(secondReuse).toEqual(firstReuse)
  })
})
