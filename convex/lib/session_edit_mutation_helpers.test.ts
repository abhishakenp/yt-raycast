import { describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { hashOwnerSecret } from './session_access_helpers'
import { createSessionEdit } from './session_edit_mutation_helpers'

type TableName =
  | 'previews'
  | 'generatedModules'
  | 'siteSpecs'
type Row = Record<string, unknown>

const sessionId = 'session_edit_wrapper' as Id<'sessions'>
const previewId = 'preview_edit_wrapper' as Id<'previews'>
const homeModuleId = 'home_module_edit_wrapper' as Id<'generatedModules'>

const sessionDoc = async (
  overrides: Partial<Doc<'sessions'>> = {},
): Promise<Doc<'sessions'>> =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a site',
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
  }) as Doc<'sessions'>

const indexHelper = {
  eq: (_field: string, _value: unknown) => indexHelper,
}

const chainFor = (rows: Row[]) => ({
  withIndex: (
    _indexName: string,
    _applyIndex: (index: typeof indexHelper) => typeof indexHelper,
  ) => chainFor(rows),
  order: (direction: 'asc' | 'desc') =>
    chainFor(
      [...rows].sort((left, right) => {
        const leftVersion = Number(left.version ?? 0)
        const rightVersion = Number(right.version ?? 0)
        return direction === 'desc'
          ? rightVersion - leftVersion
          : leftVersion - rightVersion
      }),
    ),
  first: async () => rows[0] ?? null,
})

const mutationCtxFor = async (args: {
  session?: Doc<'sessions'> | null
  userId?: string
}) => {
  const preview: Row = {
    _id: previewId,
    _creationTime: 1,
    sessionId,
    version: 1,
    html: '<main><h1>Original headline</h1></main>',
    createdAt: 1,
  }
  const homeModule: Row = {
    _id: homeModuleId,
    _creationTime: 1,
    sessionId,
    moduleKey: 'home',
    source: '<Hero title="Original headline" />',
    createdAt: 1,
    updatedAt: 1,
  }
  const rows = {
    previews: [preview],
    generatedModules: [homeModule],
    siteSpecs: [],
  } satisfies Record<TableName, Row[]>
  const inserted: Array<{ table: string; value: Row }> = []
  const patches: Array<{ id: string; value: Row }> = []
  const session = args.session === undefined ? await sessionDoc() : args.session

  const ctx = {
    auth: {
      getUserIdentity: async () =>
        args.userId === undefined
          ? null
          : { tokenIdentifier: args.userId, subject: args.userId },
    },
    db: {
      get: vi.fn(async (id: string) => (id === sessionId ? session : null)),
      query: (table: TableName) => chainFor(rows[table]),
      insert: vi.fn(async (table: string, value: Row) => {
        inserted.push({ table, value })
        return `${table}_${inserted.length}`
      }),
      patch: vi.fn(async (id: string, value: Row) => {
        patches.push({ id, value })
        const row = [session, preview, homeModule].find(
          (candidate) => candidate?._id === id,
        )
        if (row !== undefined && row !== null) Object.assign(row, value)
      }),
    },
  } as unknown as MutationCtx

  return { ctx, inserted, patches }
}

describe('session edit mutation helpers', () => {
  it('rejects missing sessions before authorization or edit work', async () => {
    const { ctx } = await mutationCtxFor({ session: null })

    await expect(
      createSessionEdit(
        ctx,
        {
          sessionId,
          editType: 'text',
          beforeText: 'Original headline',
          afterText: 'Updated headline',
        },
        10,
      ),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
      },
    })
    expect(ctx.auth.getUserIdentity).toBeDefined()
  })

  it('rejects edits from non-owners', async () => {
    const { ctx } = await mutationCtxFor({
      session: await sessionDoc({ userId: 'user_owner' }),
      userId: 'user_other',
    })

    await expect(
      createSessionEdit(
        ctx,
        {
          sessionId,
          editType: 'text',
          beforeText: 'Original headline',
          afterText: 'Updated headline',
        },
        10,
      ),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('authorizes anonymous owners and delegates to the edit implementation', async () => {
    const { ctx, inserted, patches } = await mutationCtxFor({})

    const result = await createSessionEdit(
      ctx,
      {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: 'Original headline',
        afterText: 'Updated headline',
      },
      10,
    )

    expect(result).toEqual({
      sessionId,
      previewVersion: 2,
      saved: true,
    })
    expect(inserted).toEqual(
      expect.arrayContaining([
        {
          table: 'previews',
          value: expect.objectContaining({
            sessionId,
            version: 2,
            html: '<main><h1>Updated headline</h1></main>',
          }),
        },
        {
          table: 'generationEvents',
          value: expect.objectContaining({
            sessionId,
            eventType: 'preview_reload',
            previewVersion: 2,
          }),
        },
        {
          table: 'edits',
          value: expect.objectContaining({
            sessionId,
            previewVersion: 2,
            editType: 'text',
            targetLabel: 'Hero headline',
          }),
        },
      ]),
    )
    expect(patches).toEqual(
      expect.arrayContaining([
        {
          id: homeModuleId,
          value: expect.objectContaining({
            source: '<Hero title="Updated headline" />',
            status: 'succeeded',
          }),
        },
        {
          id: sessionId,
          value: expect.objectContaining({
            previewVersion: 2,
            updatedAt: 10,
          }),
        },
      ]),
    )
  })

})
