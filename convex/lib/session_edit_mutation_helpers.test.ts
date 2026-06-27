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
  it('stores inline edits in preview history without mutating canonical artifacts', async () => {
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

    expect(preview?.html).toContain('Updated headline')
    expect(view?.homeModule?.source).toContain('Original headline')
    expect(view?.homeModule?.source).not.toContain('Updated headline')
    expect(view?.siteSpec?.specJson).toContain('Original headline')
    expect(view?.siteSpec?.specJson).not.toContain('Updated headline')
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

    await expect(t.query(api.sessions.listEdits, { sessionId })).resolves.toEqual(
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
