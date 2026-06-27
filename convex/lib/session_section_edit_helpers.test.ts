import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { hashOwnerSecret } from './session_access_helpers'
import { applySectionEditToArtifacts } from './session_section_edit_helpers'

type TableName =
  | 'aiCapsules'
  | 'edits'
  | 'generatedModules'
  | 'generationEvents'
  | 'previews'
type Row = Record<string, unknown> & { _id?: string; version?: number }

const sessionId = 'section_edit_session' as Id<'sessions'>
const homeModuleId = 'section_edit_home' as Id<'generatedModules'>
const previewId = 'section_edit_preview' as Id<'previews'>

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
  unique: async () => rows[0] ?? null,
  collect: async () => rows,
})

const mutationCtxFor = async () => {
  process.env.DISABLE_PAYWALL = 'false'

  const session: Doc<'sessions'> = {
    _id: sessionId,
    _creationTime: 1,
    anonOwnerSecretHash: await hashOwnerSecret('owner-secret'),
    createdAt: 1,
    isPrivate: false,
    preferredExportTarget: 'html',
    preferredLanguage: 'en',
    previewVersion: 1,
    prompt: 'Build a site',
    status: 'preview_ready',
    updatedAt: 1,
    workspace: 'workspace',
  }
  const rows: Record<TableName, Row[]> = {
    aiCapsules: [],
    edits: [],
    generatedModules: [
      {
        _id: homeModuleId,
        _creationTime: 1,
        createdAt: 1,
        moduleKey: 'home',
        sessionId,
        source: '<html><body>Old</body></html>',
        status: 'succeeded',
        updatedAt: 1,
      },
    ],
    generationEvents: [],
    previews: [
      {
        _id: previewId,
        _creationTime: 1,
        createdAt: 1,
        html: '<html><body>Old</body></html>',
        sessionId,
        source: 'generation',
        version: 1,
      },
    ],
  }
  const patches: Array<{ id: string; value: Row }> = []

  const ctx = {
    auth: {
      getUserIdentity: async () => null,
    },
    db: {
      get: async (id: string) => (id === sessionId ? session : null),
      insert: async (table: TableName, value: Row) => {
        rows[table].push(value)
        return `${table}_${rows[table].length}`
      },
      patch: async (id: string, value: Row) => {
        patches.push({ id, value })
        for (const tableRows of Object.values(rows)) {
          const row = tableRows.find((candidate) => candidate._id === id)
          if (row) Object.assign(row, value)
        }
        if (id === sessionId) Object.assign(session, value)
      },
      query: (table: TableName) => chainFor(rows[table]),
    },
  } as unknown as MutationCtx

  return { ctx, patches, rows }
}

describe('applySectionEditToArtifacts', () => {
  it('persists an HTML section replacement as a new preview version', async () => {
    const { ctx, patches, rows } = await mutationCtxFor()

    const result = await applySectionEditToArtifacts(
      ctx,
      {
        anonymousOwnerSecret: 'owner-secret',
        instruction: 'Replace the page',
        replacementHtml: '<html><body>New</body></html>',
        sessionId,
      },
      10,
    )

    expect(result).toEqual({ previewVersion: 2, saved: true, sessionId })
    expect(rows.previews.at(-1)).toMatchObject({
      html: '<html><body>New</body></html>',
      source: 'edit',
      version: 2,
    })
    expect(rows.generationEvents.at(-1)).toMatchObject({
      eventType: 'preview_reload',
      previewVersion: 2,
    })
    expect(patches).toContainEqual({
      id: sessionId,
      value: expect.objectContaining({ previewVersion: 2, updatedAt: 10 }),
    })
  })

  it('stores OpenUI AI capsule metadata with the patched source', async () => {
    const { ctx, rows } = await mutationCtxFor()

    await applySectionEditToArtifacts(
      ctx,
      {
        aiCapsule: {
          capsuleName: 'AICustomHero',
          compiledJs: 'export default function AICustomHero() { return null }',
          description: 'Updated hero',
          parentCapsule: 'SaasHero',
        },
        anonymousOwnerSecret: 'owner-secret',
        instruction: 'Rewrite hero',
        replacementOpenUiSource: 'root = AICustomHero({})',
        sessionId,
      },
      10,
    )

    expect(rows.aiCapsules).toContainEqual(
      expect.objectContaining({
        capsuleName: 'AICustomHero',
        parentCapsule: 'SaasHero',
        sessionId,
      }),
    )
    expect(rows.previews.at(-1)).toMatchObject({
      openUiSource: 'root = AICustomHero({})',
      source: 'edit',
      version: 2,
    })
  })
})
