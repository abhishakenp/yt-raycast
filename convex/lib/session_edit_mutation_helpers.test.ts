import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api, internal } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import schema from '../schema'

const modules = import.meta.glob('../**/*.ts')

const sessionEditConvexTest = () => {
  const t = convexTest(schema, modules)
  registerDebouncer(t)
  return t
}

const createReadySession = async (
  t: ReturnType<typeof sessionEditConvexTest>,
  prompt = 'Original headline',
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
    siteSpecJson: JSON.stringify({
      hero: { headline: prompt },
    }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  })

  return sessionId
}

describe('session edit mutation helpers', () => {
  it('patches canonical artifacts (homeModule.source + siteSpec) on text edits so they survive reload', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t)

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: 'Original headline',
        afterText: 'Updated headline',
      }),
    ).resolves.toMatchObject({
      previewVersion: 2,
      saved: true,
    })

    const preview = await t.query(api.sessions.getPublicPreview, {
      lookup: sessionId,
    })
    const view = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })

    // Preview html is updated.
    expect(preview?.html).toContain('Updated headline')
    // Canonical source MUST be patched — the Dashboard renders from
    // homeModule.source, so an unpatched source makes the edit vanish on
    // reload (regression introduced by the master/develop reconcile).
    expect(view?.homeModule?.source).toContain('Updated headline')
    expect(view?.homeModule?.source).not.toContain('Original headline')
    // siteSpec is patched too (replaceFirstJsonText path).
    expect(view?.siteSpec?.specJson).toContain('Updated headline')
    expect(view?.siteSpec?.specJson).not.toContain('Original headline')
  })

  it('text edit survives a reload: re-reading homeModule.source after edit still contains the new text', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t, 'Reload headline')

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'Reload headline',
      afterText: 'Reloaded headline',
    })

    // Simulate a page reload: the Dashboard re-fetches the generation view
    // and renders from homeModule.source. The edited text must still be there.
    const reloaded = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(reloaded?.homeModule?.source).toContain('Reloaded headline')
    expect(reloaded?.homeModule?.source).not.toContain('Reload headline')

    // A second sequential edit must patch the already-patched source (guards
    // against the !!!!!! regression where the second edit couldn't find the
    // original text because the source had been left stale).
    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'Reloaded headline',
      afterText: 'Reloaded twice headline',
    })
    const reloaded2 = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(reloaded2?.homeModule?.source).toContain('Reloaded twice headline')
  })

  it('records edit history with target label and occurrence metadata', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t, 'Repeated headline')

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'Repeated headline',
      afterText: 'Edited repeated headline',
      occurrenceIndex: 0,
    })

    await expect(
      t.query(api.sessions.listEdits, { lookup: sessionId }),
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          editType: 'text',
          targetLabel: 'Hero headline',
          beforeText: 'Repeated headline',
          afterText: 'Edited repeated headline',
          occurrenceIndex: 0,
          previewVersion: 2,
        }),
      ]),
    )
  })

  it('rejects edits from callers that do not own the session', async () => {
    const t = sessionEditConvexTest()
    const sessionId: Id<'sessions'> = await createReadySession(
      t,
      'Protected headline',
    )

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'wrong-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: 'Protected headline',
        afterText: 'Tampered headline',
      }),
    ).rejects.toThrow(/FORBIDDEN|do not own/)
  })
})
