import { describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { hashOwnerSecret } from './session_access_helpers'
import {
  applyCloneBriefAndGenerate,
  finalizeSessionClonePreview,
  listSessionClonePages,
  loadClonePagePreview,
  writeSessionClonePage,
} from './session_clone_helpers'

type TableName =
  | 'sessions'
  | 'clonePages'
  | 'previews'
  | 'generatedModules'
  | 'generationEvents'
type Row = Record<string, unknown>

const sessionId = 'session_clone_helpers' as Id<'sessions'>

async function sessionDoc(
  overrides: Partial<Doc<'sessions'>> = {},
): Promise<Doc<'sessions'>> {
  return {
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Clone a site',
    workspace: 'workspace',
    status: 'ready',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    previewVersion: 1,
    createdAt: 1,
    updatedAt: 1,
    anonOwnerSecretHash: await hashOwnerSecret('owner-secret'),
    ...overrides,
  } as Doc<'sessions'>
}

const indexHelper = {
  eq: (_field: string, _value: unknown) => indexHelper,
}

function chainFor(rows: Row[]) {
  return {
    withIndex: (
      _indexName: string,
      _applyIndex: (index: typeof indexHelper) => void,
    ) => chainFor(rows),
    collect: async () => [...rows],
    first: async () => rows[0] ?? null,
  }
}

async function mutationCtxFor(args: {
  session?: Doc<'sessions'> | null
  userId?: string
  clonePages?: Row[]
}) {
  const session = args.session === undefined ? await sessionDoc() : args.session
  const tables: Record<TableName, Row[]> = {
    sessions: session === null ? [] : [session],
    clonePages: args.clonePages ?? [],
    previews: [],
    generatedModules: [],
    generationEvents: [],
  }
  const inserted: Array<{ table: string; value: Row }> = []
  const patches: Array<{ id: string; value: Row }> = []
  let insertSeq = 0

  const findRow = (id: string) =>
    [session, ...Object.values(tables).flat()].find(
      (candidate) => candidate !== null && candidate?._id === id,
    ) as Row | undefined

  const ctx = {
    auth: {
      getUserIdentity: async () =>
        args.userId === undefined
          ? null
          : { tokenIdentifier: args.userId, subject: args.userId },
    },
    scheduler: {
      runAfter: vi.fn(async () => undefined),
    },
    db: {
      get: vi.fn(async (id: string) => (id === sessionId ? session : null)),
      query: (table: TableName) => chainFor(tables[table]),
      insert: vi.fn(async (table: TableName, value: Row) => {
        insertSeq += 1
        const _id = `${table}_${insertSeq}`
        const stored = { _id, _creationTime: insertSeq, ...value }
        tables[table].push(stored)
        inserted.push({ table, value })
        return _id
      }),
      patch: vi.fn(async (id: string, value: Row) => {
        patches.push({ id, value })
        const row = findRow(id)
        if (row !== undefined) Object.assign(row, value)
      }),
    },
  } as unknown as MutationCtx

  return { ctx, tables, inserted, patches }
}

function clonePageRow(overrides: Partial<Row> = {}): Row {
  return {
    _id: `clone_${String(overrides.pathname ?? 'home')}`,
    _creationTime: 1,
    sessionId,
    pathname: '/',
    title: 'Home',
    html: '<main>Home</main>',
    isHome: true,
    failed: false,
    order: 0,
    byteLength: 12,
    truncated: false,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}

function writeArgs(overrides: Partial<Row> = {}) {
  return {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    pathname: '/about',
    title: 'About',
    html: '<main>About</main>',
    isHome: false,
    failed: false,
    order: 1,
    byteLength: 18,
    truncated: false,
    ...overrides,
  }
}

describe('session clone helpers', () => {
  describe('writeSessionClonePage', () => {
    it('inserts a new clonePages row when none exists for (sessionId, pathname)', async () => {
      const { ctx, tables, inserted } = await mutationCtxFor({})

      const result = await writeSessionClonePage(ctx, writeArgs())

      expect(result).toEqual({ sessionId, pathname: '/about' })
      expect(inserted).toEqual(
        expect.arrayContaining([
          {
            table: 'clonePages',
            value: expect.objectContaining({
              sessionId,
              pathname: '/about',
              title: 'About',
              html: '<main>About</main>',
              isHome: false,
              order: 1,
              byteLength: 18,
            }),
          },
        ]),
      )
      expect(tables.clonePages).toHaveLength(1)
    })

    it('patches the existing row when one exists (upsert)', async () => {
      const existing = clonePageRow({
        _id: 'clone_about',
        pathname: '/about',
        title: 'Old About',
        html: '<main>Old</main>',
        isHome: false,
        order: 1,
      })
      const { ctx, inserted, patches } = await mutationCtxFor({
        clonePages: [existing],
      })

      await writeSessionClonePage(ctx, writeArgs({ html: '<main>New</main>' }))

      expect(
        inserted.filter((entry) => entry.table === 'clonePages'),
      ).toHaveLength(0)
      expect(patches).toEqual(
        expect.arrayContaining([
          {
            id: 'clone_about',
            value: expect.objectContaining({
              pathname: '/about',
              html: '<main>New</main>',
            }),
          },
        ]),
      )
    })

    it('sets session.cloneMode=true', async () => {
      const { ctx, patches } = await mutationCtxFor({})

      await writeSessionClonePage(ctx, writeArgs())

      expect(patches).toEqual(
        expect.arrayContaining([
          {
            id: sessionId,
            value: expect.objectContaining({ cloneMode: true }),
          },
        ]),
      )
    })

    it('does not re-patch cloneMode when already true', async () => {
      const { ctx, patches } = await mutationCtxFor({
        session: await sessionDoc({ cloneMode: true }),
      })

      await writeSessionClonePage(ctx, writeArgs())

      expect(
        patches.filter(
          (patch) =>
            patch.id === sessionId && (patch.value as Row).cloneMode === true,
        ),
      ).toHaveLength(0)
    })

    it('rejects when the owner secret does not match', async () => {
      const { ctx } = await mutationCtxFor({})

      await expect(
        writeSessionClonePage(
          ctx,
          writeArgs({ anonymousOwnerSecret: 'wrong-secret' }),
        ),
      ).rejects.toMatchObject({ data: { code: 'FORBIDDEN' } })
    })
  })

  describe('finalizeSessionClonePreview', () => {
    const sendOperationalNotification =
      'website-clone:send' as unknown as Parameters<
        typeof finalizeSessionClonePreview
      >[1]['sendOperationalNotification']

    it('writes the isHome page html to the home module, inserts a preview, and bumps previewVersion', async () => {
      const { ctx, tables, inserted, patches } = await mutationCtxFor({
        clonePages: [
          clonePageRow({
            _id: 'clone_home',
            pathname: '/',
            html: '<main>Cloned home</main>',
            isHome: true,
            order: 0,
          }),
          clonePageRow({
            _id: 'clone_about',
            pathname: '/about',
            html: '<main>About</main>',
            isHome: false,
            order: 1,
          }),
        ],
      })

      const result = await finalizeSessionClonePreview(ctx, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        sendOperationalNotification,
      })

      expect(result).toEqual({ sessionId, previewVersion: 2 })
      expect(tables.generatedModules).toEqual([
        expect.objectContaining({
          moduleKey: 'home',
          source: '<main>Cloned home</main>',
          status: 'succeeded',
        }),
      ])
      expect(inserted).toEqual(
        expect.arrayContaining([
          {
            table: 'previews',
            value: expect.objectContaining({
              sessionId,
              version: 2,
              html: '<main>Cloned home</main>',
              openUiSource: '',
              source: 'generation',
            }),
          },
          {
            table: 'generationEvents',
            value: expect.objectContaining({
              sessionId,
              eventType: 'preview_ready',
              previewVersion: 2,
            }),
          },
        ]),
      )
      expect(patches).toEqual(
        expect.arrayContaining([
          {
            id: sessionId,
            value: expect.objectContaining({
              status: 'preview_ready',
              openuiReady: true,
              previewVersion: 2,
            }),
          },
        ]),
      )
    })

    it('picks the order===0 page when no isHome flag is present', async () => {
      const { ctx, inserted } = await mutationCtxFor({
        clonePages: [
          clonePageRow({
            _id: 'clone_about',
            pathname: '/about',
            html: '<main>About</main>',
            isHome: false,
            order: 1,
          }),
          clonePageRow({
            _id: 'clone_root',
            pathname: '/',
            html: '<main>Root order zero</main>',
            isHome: false,
            order: 0,
          }),
        ],
      })

      await finalizeSessionClonePreview(ctx, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        sendOperationalNotification,
      })

      expect(inserted).toEqual(
        expect.arrayContaining([
          {
            table: 'previews',
            value: expect.objectContaining({
              html: '<main>Root order zero</main>',
            }),
          },
        ]),
      )
    })

    it('rejects when the owner secret does not match', async () => {
      const { ctx } = await mutationCtxFor({
        clonePages: [clonePageRow({ _id: 'clone_home' })],
      })

      await expect(
        finalizeSessionClonePreview(ctx, {
          sessionId,
          anonymousOwnerSecret: 'wrong-secret',
          sendOperationalNotification,
        }),
      ).rejects.toMatchObject({ data: { code: 'FORBIDDEN' } })
    })
  })

  describe('applyCloneBriefAndGenerate', () => {
    it('stores the clone brief, exits clone mode, preserves theme override, and schedules generation', async () => {
      const { ctx, patches } = await mutationCtxFor({
        session: await sessionDoc({ cloneMode: true }),
      })

      await expect(
        applyCloneBriefAndGenerate(ctx, {
          sessionId,
          anonymousOwnerSecret: 'owner-secret',
          cloneBrief: 'Make the cloned brewery homepage feel more premium',
          themeOverride: 'darkmatter',
        }),
      ).resolves.toEqual({ sessionId })

      expect(patches).toEqual([
        {
          id: sessionId,
          value: expect.objectContaining({
            cloneBrief: 'Make the cloned brewery homepage feel more premium',
            cloneMode: false,
            themeOverride: 'darkmatter',
            updatedAt: expect.any(Number),
          }),
        },
      ])
      expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
        0,
        expect.anything(),
        {
          sessionId,
          anonymousOwnerSecret: 'owner-secret',
        },
      )
    })

    it('rejects clone brief generation when the owner secret does not match', async () => {
      const { ctx } = await mutationCtxFor({})

      await expect(
        applyCloneBriefAndGenerate(ctx, {
          sessionId,
          anonymousOwnerSecret: 'wrong-secret',
          cloneBrief: 'Update the clone',
        }),
      ).rejects.toMatchObject({ data: { code: 'FORBIDDEN' } })

      expect(ctx.scheduler.runAfter).not.toHaveBeenCalled()
    })
  })

  describe('listSessionClonePages', () => {
    it('returns rows ordered by order with the expected fields', async () => {
      const { ctx } = await mutationCtxFor({
        clonePages: [
          clonePageRow({
            _id: 'clone_about',
            pathname: '/about',
            title: 'About',
            html: '<main>About</main>',
            isHome: false,
            failed: false,
            order: 2,
          }),
          clonePageRow({
            _id: 'clone_home',
            pathname: '/',
            title: 'Home',
            html: '<main>Home</main>',
            isHome: true,
            failed: false,
            order: 0,
          }),
          clonePageRow({
            _id: 'clone_blog',
            pathname: '/blog',
            title: 'Blog',
            html: '<main>Blog</main>',
            isHome: false,
            failed: true,
            order: 1,
          }),
        ],
      })

      const pages = await listSessionClonePages(
        ctx as unknown as Pick<QueryCtx, 'db'>,
        sessionId,
      )

      expect(pages).toEqual([
        {
          pathname: '/',
          title: 'Home',
          html: '<main>Home</main>',
          storageId: undefined,
          isHome: true,
          failed: false,
          byteLength: 12,
          truncated: false,
        },
        {
          pathname: '/blog',
          title: 'Blog',
          html: '<main>Blog</main>',
          storageId: undefined,
          isHome: false,
          failed: true,
          byteLength: 12,
          truncated: false,
        },
        {
          pathname: '/about',
          title: 'About',
          html: '<main>About</main>',
          storageId: undefined,
          isHome: false,
          failed: false,
          byteLength: 12,
          truncated: false,
        },
      ])
    })
  })

  describe('loadClonePagePreview', () => {
    it('returns the requested clone page storage URL when pathname is provided', async () => {
      const { ctx } = await mutationCtxFor({
        clonePages: [
          clonePageRow({
            _id: 'clone_home',
            pathname: '/',
            html: undefined,
            storageId: 'stored_home' as Id<'_storage'>,
            isHome: true,
            order: 0,
          }),
          clonePageRow({
            _id: 'clone_career',
            pathname: '/career',
            html: undefined,
            storageId: 'stored_career' as Id<'_storage'>,
            isHome: false,
            order: 1,
          }),
        ],
      })
      const queryCtx = {
        db: {
          ...ctx.db,
          normalizeId: vi.fn(() => sessionId),
        },
        storage: {
          getUrl: vi.fn(
            async (storageId) => `https://storage.test/${storageId}`,
          ),
        },
      } as unknown as Pick<QueryCtx, 'db' | 'storage'>

      await expect(
        loadClonePagePreview(queryCtx, sessionId, '/career'),
      ).resolves.toEqual({
        html: null,
        url: 'https://storage.test/stored_career',
        version: 1,
      })
    })

    it('falls back to the home clone page when no pathname is provided', async () => {
      const { ctx } = await mutationCtxFor({
        clonePages: [
          clonePageRow({
            _id: 'clone_home',
            pathname: '/',
            html: undefined,
            storageId: 'stored_home' as Id<'_storage'>,
            isHome: true,
            order: 0,
          }),
        ],
      })
      const queryCtx = {
        db: {
          ...ctx.db,
          normalizeId: vi.fn(() => sessionId),
        },
        storage: {
          getUrl: vi.fn(
            async (storageId) => `https://storage.test/${storageId}`,
          ),
        },
      } as unknown as Pick<QueryCtx, 'db' | 'storage'>

      await expect(loadClonePagePreview(queryCtx, sessionId)).resolves.toEqual({
        html: null,
        url: 'https://storage.test/stored_home',
        version: 1,
      })
    })

    it('does not expose private clone page HTML through an unauthenticated preview lookup', async () => {
      const { ctx } = await mutationCtxFor({
        session: await sessionDoc({ isPrivate: true }),
        clonePages: [
          clonePageRow({
            _id: 'clone_private_home',
            pathname: '/',
            html: '<main>Private clone content</main>',
            isHome: true,
            order: 0,
          }),
        ],
      })
      const queryCtx = {
        db: {
          ...ctx.db,
          normalizeId: vi.fn(() => sessionId),
        },
        storage: {
          getUrl: vi.fn(async () => null),
        },
      } as unknown as Pick<QueryCtx, 'db' | 'storage'>

      await expect(
        loadClonePagePreview(queryCtx, sessionId),
      ).resolves.toBeNull()
    })
  })
})
