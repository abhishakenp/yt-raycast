import { ConvexError } from 'convex/values'
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

  it('splices a section-scoped replacementHtml via beforeHtml, preserving untouched nav/footer (regression: sectionRewrite tool wiped whole page down to a fragment)', async () => {
    const { ctx, rows } = await mutationCtxFor()
    const fullDocument =
      '<html><body><nav>Site Nav</nav><main><section class="hero">Hero</section></main><footer>Site Footer</footer></body></html>'
    rows.previews[0].html = fullDocument
    rows.generatedModules[0].source = fullDocument

    const result = await applySectionEditToArtifacts(
      ctx,
      {
        anonymousOwnerSecret: 'owner-secret',
        instruction: 'make the hero punchier',
        beforeHtml: '<section class="hero">Hero</section>',
        replacementHtml: '<section class="hero">Sharper Hero</section>',
        sessionId,
      },
      10,
    )

    expect(result).toEqual({ previewVersion: 2, saved: true, sessionId })
    const persisted = rows.previews.at(-1)
    expect(persisted?.html).toContain('<nav>Site Nav</nav>')
    expect(persisted?.html).toContain('<footer>Site Footer</footer>')
    expect(persisted?.html).toContain(
      '<section class="hero">Sharper Hero</section>',
    )
    expect(persisted?.html).not.toContain(
      'Hero</section></main><footer>Site Footer</footer></body></html><section',
    )
    expect(rows.generatedModules.at(-1)?.source).toContain('Site Nav')
    expect(rows.generatedModules.at(-1)?.source).toContain('Site Footer')
  })

  it('rejects a section rewrite when beforeHtml anchor is not found, instead of overwriting the whole page (regression)', async () => {
    const { ctx, rows } = await mutationCtxFor()
    const fullDocument =
      '<html><body><nav>Site Nav</nav><main><section class="hero">Hero</section></main><footer>Site Footer</footer></body></html>'
    rows.previews[0].html = fullDocument
    rows.generatedModules[0].source = fullDocument

    await expect(
      applySectionEditToArtifacts(
        ctx,
        {
          anonymousOwnerSecret: 'owner-secret',
          instruction: 'make the hero punchier',
          beforeHtml: '<section class="hero">Stale selection</section>',
          replacementHtml: '<h1>Only this survives</h1>',
          sessionId,
        },
        10,
      ),
    ).rejects.toThrow(ConvexError)

    // The page must be untouched — no new preview version was written.
    expect(rows.previews).toHaveLength(1)
    expect(rows.previews[0].html).toBe(fullDocument)
  })

  it('splices a bare component-call replacementOpenUiSource via sectionVarName, preserving sibling sections and the root Stack (regression: sectionRewrite blanked the whole live render)', async () => {
    const { ctx, rows } = await mutationCtxFor()
    const fullSource = [
      'home_navbar = BakeryNavbar("Sweet Crumbs", ["Home","Menu"], "Order Now", "#menu", "0")',
      'home_hero = BakeryHero("Welcome to Sweet Crumbs", "Wel...")',
      'home_footer = BakeryFooter("Sweet Crumbs")',
      'root = Stack([home_navbar, home_hero, home_footer])',
    ].join('\n')
    rows.generatedModules[0].source = fullSource
    rows.previews[0].html = fullSource

    const result = await applySectionEditToArtifacts(
      ctx,
      {
        anonymousOwnerSecret: 'owner-secret',
        instruction: 'make the hero punchier',
        sectionVarName: 'home_hero',
        replacementOpenUiSource:
          'BakeryHero("Elevate Your Senses", "Indulge in the Sweet Life")',
        sessionId,
      },
      10,
    )

    expect(result).toEqual({ previewVersion: 2, saved: true, sessionId })
    const persistedSource = rows.generatedModules.at(-1)?.source
    expect(persistedSource).toContain(
      'home_hero = BakeryHero("Elevate Your Senses", "Indulge in the Sweet Life")',
    )
    expect(persistedSource).toContain('home_navbar = BakeryNavbar(')
    expect(persistedSource).toContain('home_footer = BakeryFooter(')
    expect(persistedSource).toContain(
      'root = Stack([home_navbar, home_hero, home_footer])',
    )
  })

  it('rejects a section rewrite when sectionVarName is not found in the current source, instead of overwriting homeModule.source with a fragment (regression)', async () => {
    const { ctx, rows } = await mutationCtxFor()
    const fullSource = [
      'home_hero = BakeryHero("Welcome to Sweet Crumbs", "Wel...")',
      'root = Stack([home_hero])',
    ].join('\n')
    rows.generatedModules[0].source = fullSource
    rows.previews[0].html = fullSource

    await expect(
      applySectionEditToArtifacts(
        ctx,
        {
          anonymousOwnerSecret: 'owner-secret',
          instruction: 'make the hero punchier',
          sectionVarName: 'home_missing',
          replacementOpenUiSource: 'BakeryHero("Only this survives")',
          sessionId,
        },
        10,
      ),
    ).rejects.toThrow(ConvexError)

    expect(rows.previews).toHaveLength(1)
    expect(rows.generatedModules.at(-1)?.source).toBe(fullSource)
  })
})
