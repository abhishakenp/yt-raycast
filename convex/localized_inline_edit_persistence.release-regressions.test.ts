/// <reference types="vite/client" />

import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const OWNER_SECRET = 'localized-edit-owner-secret'
const SOURCE_TEXT = 'Original English headline'
const HINDI_TEXT = 'मूल अंग्रेज़ी शीर्षक'
const HINDI_EDIT = 'सहेजा गया हिंदी शीर्षक'
const SPANISH_TEXT = 'Titular original en inglés'

const localizedEditConvexTest = () => {
  const t = convexTest(schema, modules)
  registerDebouncer(t)
  return t
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-13T12:00:00.000Z'))
  process.env.VITE_DISABLE_CLERK = 'true'
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  process.env.VITE_DISABLE_CLERK = 'false'
})

type ReadySessionOptions = {
  key: string
  preferredLanguage: string
  requestPrompt?: string
}

async function createReadySession(
  t: ReturnType<typeof localizedEditConvexTest>,
  options: ReadySessionOptions,
) {
  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt: options.requestPrompt ?? SOURCE_TEXT,
    preferredLanguage: options.preferredLanguage,
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: `workspace_localized_edit_${options.key}`,
    anonymousClientId: `anonymous_localized_edit_${options.key}`,
    anonymousOwnerSecret: OWNER_SECRET,
  })

  await t.mutation(internal.sessions.completeGenerationInternal, {
    sessionId,
    html: `<html><body><main><h1>${SOURCE_TEXT}</h1></main></body></html>`,
    openUiSource: `$page = "Home"\nroot = Text("${SOURCE_TEXT}")`,
    siteSpecJson: JSON.stringify({ hero: { headline: SOURCE_TEXT } }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  })

  return sessionId
}

function seedTranslation(
  t: ReturnType<typeof localizedEditConvexTest>,
  locale: string,
  text: string,
  translation: string,
) {
  return t.mutation(api.translationCache.setBatch, {
    locale,
    entries: [{ text, translation }],
  })
}

async function readSessionState(
  t: ReturnType<typeof localizedEditConvexTest>,
  sessionId: Id<'sessions'>,
) {
  const [view, edits, history] = await Promise.all([
    t.query(api.sessions.getGenerationView, { lookup: sessionId }),
    t.query(api.sessions.listEdits, { lookup: sessionId }),
    t.query(api.sessions.listPreviewHistory, { lookup: sessionId }),
  ])

  return { view, edits, history }
}

function translatedEditArgs(
  sessionId: Id<'sessions'>,
  afterText: string,
): {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret: string
  editType: 'text'
  targetLabel: string
  beforeText: string
  afterText: string
} {
  return {
    sessionId,
    anonymousOwnerSecret: OWNER_SECRET,
    editType: 'text',
    targetLabel: 'Hero headline',
    beforeText: HINDI_TEXT,
    afterText,
  }
}

describe('localized inline edit persistence release regressions', () => {
  it('reloads a translated edit from persisted session history and translation state', async () => {
    const t = localizedEditConvexTest()
    const sessionId = await createReadySession(t, {
      key: 'reload',
      preferredLanguage: 'hi',
    })
    await seedTranslation(t, 'hi', SOURCE_TEXT, HINDI_TEXT)

    await expect(
      t.mutation(
        api.sessions.createEdit,
        translatedEditArgs(sessionId, HINDI_EDIT),
      ),
    ).resolves.toMatchObject({
      previewVersion: 2,
      saved: true,
    })

    const firstReload = await readSessionState(t, sessionId)
    const secondReload = await readSessionState(t, sessionId)
    const translated = await t.query(api.translationCache.getBatch, {
      locale: 'hi',
      texts: [SOURCE_TEXT],
    })

    expect(firstReload.view?.homeModule?.source).toContain(SOURCE_TEXT)
    expect(firstReload.view?.homeModule?.source).not.toContain(HINDI_EDIT)
    expect(secondReload.view?.homeModule?.source).toBe(
      firstReload.view?.homeModule?.source,
    )
    expect(secondReload.edits).toEqual([
      expect.objectContaining({
        beforeText: HINDI_TEXT,
        afterText: HINDI_EDIT,
        previewVersion: 2,
      }),
    ])
    expect(secondReload.history.map((preview) => preview.version)).toEqual([
      2, 1,
    ])
    expect(translated).toEqual([HINDI_TEXT])
  })

  it('keeps a translated edit keyed only by its canonical source text', async () => {
    const t = localizedEditConvexTest()
    const sessionId = await createReadySession(t, {
      key: 'canonical_cache_key',
      preferredLanguage: 'hi',
    })
    await seedTranslation(t, 'hi', SOURCE_TEXT, HINDI_TEXT)

    await t.mutation(
      api.sessions.createEdit,
      translatedEditArgs(sessionId, HINDI_EDIT),
    )

    await expect(
      t.query(api.translationCache.getBatch, {
        locale: 'hi',
        texts: [SOURCE_TEXT, HINDI_TEXT, HINDI_EDIT],
      }),
    ).resolves.toEqual([HINDI_TEXT, null, null])
  })

  it('invalidates stale locale cache keys when canonical source text changes', async () => {
    const t = localizedEditConvexTest()
    const sessionId = await createReadySession(t, {
      key: 'cache_invalidation',
      preferredLanguage: 'en',
    })
    const updatedSource = 'Updated English headline'
    await seedTranslation(t, 'hi', SOURCE_TEXT, HINDI_TEXT)
    await seedTranslation(t, 'es', SOURCE_TEXT, SPANISH_TEXT)

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: SOURCE_TEXT,
      afterText: updatedSource,
    })

    const hindiCache = await t.query(api.translationCache.getBatch, {
      locale: 'hi',
      texts: [SOURCE_TEXT, updatedSource],
    })
    const spanishCache = await t.query(api.translationCache.getBatch, {
      locale: 'es',
      texts: [SOURCE_TEXT, updatedSource],
    })
    const reloaded = await readSessionState(t, sessionId)

    expect(reloaded.view?.homeModule?.source).toContain(updatedSource)
    expect.soft(hindiCache).toEqual([null, null])
    expect.soft(spanishCache).toEqual([null, null])
  })

  it('treats a canceled no-op edit as zero persisted writes', async () => {
    const t = localizedEditConvexTest()
    const sessionId = await createReadySession(t, {
      key: 'no_op',
      preferredLanguage: 'hi',
    })
    const before = await readSessionState(t, sessionId)

    const result = await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: OWNER_SECRET,
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: SOURCE_TEXT,
      afterText: SOURCE_TEXT,
    })

    const after = await readSessionState(t, sessionId)
    const cache = await t.query(api.translationCache.getBatch, {
      locale: 'hi',
      texts: [SOURCE_TEXT],
    })

    expect.soft(result).toMatchObject({ previewVersion: 1, saved: false })
    expect.soft(after.edits).toEqual(before.edits)
    expect.soft(after.history).toEqual(before.history)
    expect
      .soft(after.view?.homeModule?.source)
      .toBe(before.view?.homeModule?.source)
    expect.soft(cache).toEqual([null])
  })

  it('isolates translated edits between languages', async () => {
    const t = localizedEditConvexTest()
    const sessionId = await createReadySession(t, {
      key: 'language_isolation',
      preferredLanguage: 'hi',
    })
    await seedTranslation(t, 'hi', SOURCE_TEXT, HINDI_TEXT)
    await seedTranslation(t, 'es', SOURCE_TEXT, SPANISH_TEXT)

    await t.mutation(
      api.sessions.createEdit,
      translatedEditArgs(sessionId, HINDI_EDIT),
    )

    await expect(
      t.query(api.translationCache.getBatch, {
        locale: 'es',
        texts: [SOURCE_TEXT],
      }),
    ).resolves.toEqual([SPANISH_TEXT])
  })

  it('isolates translated edits between sessions using the same locale and source', async () => {
    const t = localizedEditConvexTest()
    const firstSessionId = await createReadySession(t, {
      key: 'session_isolation_first',
      preferredLanguage: 'hi',
      requestPrompt: 'First localized session',
    })
    const secondSessionId = await createReadySession(t, {
      key: 'session_isolation_second',
      preferredLanguage: 'hi',
      requestPrompt: 'Second localized session',
    })
    await seedTranslation(t, 'hi', SOURCE_TEXT, HINDI_TEXT)

    await t.mutation(
      api.sessions.createEdit,
      translatedEditArgs(firstSessionId, HINDI_EDIT),
    )

    const firstState = await readSessionState(t, firstSessionId)
    const secondState = await readSessionState(t, secondSessionId)
    const secondSessionTranslation = await t.query(
      api.translationCache.getBatch,
      {
        locale: 'hi',
        texts: [SOURCE_TEXT],
      },
    )

    expect(firstSessionId).not.toBe(secondSessionId)
    expect(firstState.edits).toHaveLength(1)
    expect(secondState.edits).toEqual([])
    expect(secondState.history.map((preview) => preview.version)).toEqual([1])
    expect(secondState.view?.homeModule?.source).toContain(SOURCE_TEXT)
    expect(secondSessionTranslation).toEqual([HINDI_TEXT])
  })

  it('rejects a stale translated edit without changing the winning edit', async () => {
    const t = localizedEditConvexTest()
    const sessionId = await createReadySession(t, {
      key: 'stale_ordering',
      preferredLanguage: 'hi',
    })
    await seedTranslation(t, 'hi', SOURCE_TEXT, HINDI_TEXT)
    await t.mutation(
      api.sessions.createEdit,
      translatedEditArgs(sessionId, HINDI_EDIT),
    )

    await expect(
      t.mutation(
        api.sessions.createEdit,
        translatedEditArgs(sessionId, 'Stale overwrite'),
      ),
    ).rejects.toThrow(/TEXT_NOT_FOUND|not found/)

    const state = await readSessionState(t, sessionId)
    const cache = await t.query(api.translationCache.getBatch, {
      locale: 'hi',
      texts: [SOURCE_TEXT],
      sessionId,
    })

    expect(state.edits).toHaveLength(1)
    expect(state.history.map((preview) => preview.version)).toEqual([2, 1])
    expect(cache).toEqual([HINDI_EDIT])
  })

  it('serializes concurrent translated edits so exactly one stale writer loses', async () => {
    const t = localizedEditConvexTest()
    const sessionId = await createReadySession(t, {
      key: 'concurrent_ordering',
      preferredLanguage: 'hi',
    })
    await seedTranslation(t, 'hi', SOURCE_TEXT, HINDI_TEXT)

    const outcomes = await Promise.allSettled([
      t.mutation(
        api.sessions.createEdit,
        translatedEditArgs(sessionId, 'पहला समवर्ती संपादन'),
      ),
      t.mutation(
        api.sessions.createEdit,
        translatedEditArgs(sessionId, 'दूसरा समवर्ती संपादन'),
      ),
    ])
    const state = await readSessionState(t, sessionId)
    const savedText = state.edits[0]?.afterText
    const cache = await t.query(api.translationCache.getBatch, {
      locale: 'hi',
      texts: [SOURCE_TEXT],
      sessionId,
    })

    expect(outcomes.map((outcome) => outcome.status).sort()).toEqual([
      'fulfilled',
      'rejected',
    ])
    expect(state.edits).toHaveLength(1)
    expect(state.history.map((preview) => preview.version)).toEqual([2, 1])
    expect(cache).toEqual([savedText])
  })

  it('replays an identical translated edit idempotently', async () => {
    const t = localizedEditConvexTest()
    const sessionId = await createReadySession(t, {
      key: 'idempotent_replay',
      preferredLanguage: 'hi',
    })
    await seedTranslation(t, 'hi', SOURCE_TEXT, HINDI_TEXT)
    const args = translatedEditArgs(sessionId, HINDI_EDIT)

    const first = await t.mutation(api.sessions.createEdit, args)
    const replay = await t.mutation(api.sessions.createEdit, args)
    const state = await readSessionState(t, sessionId)

    expect(replay).toMatchObject({
      sessionId,
      previewVersion: first.previewVersion,
    })
    expect(state.edits).toHaveLength(1)
    expect(state.history.map((preview) => preview.version)).toEqual([2, 1])
  })

  it('rejects unauthorized translated edits without touching session or cache state', async () => {
    process.env.VITE_DISABLE_CLERK = 'false'
    const t = localizedEditConvexTest()
    const sessionId = await createReadySession(t, {
      key: 'authorization',
      preferredLanguage: 'hi',
    })
    await t
      .withIdentity({ tokenIdentifier: 'auth-user' })
      .mutation(api.translationCache.setBatch, {
        locale: 'hi',
        entries: [{ text: SOURCE_TEXT, translation: HINDI_TEXT }],
      })

    await expect(
      t.mutation(api.sessions.createEdit, {
        ...translatedEditArgs(sessionId, 'अनधिकृत शीर्षक'),
        anonymousOwnerSecret: 'wrong-owner-secret',
      }),
    ).rejects.toThrow(/FORBIDDEN|do not own/)

    const state = await readSessionState(t, sessionId)
    const cache = await t.query(api.translationCache.getBatch, {
      locale: 'hi',
      texts: [SOURCE_TEXT],
    })

    expect(state.edits).toEqual([])
    expect(state.history.map((preview) => preview.version)).toEqual([1])
    expect(state.view?.homeModule?.source).toContain(SOURCE_TEXT)
    expect(cache).toEqual([HINDI_TEXT])
  })
})
