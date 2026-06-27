import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  insertSessionCmsBinding,
  listCmsRevisionsForEntry,
  loadSessionCmsConfig,
  listSessionCmsContent,
  listSessionCmsEntries,
  listSessionCmsEntryRevisions,
  restoreSessionCmsRevision,
  restoreSessionCmsContentRevision,
  seedCmsBindingsForGeneratedArtifacts,
  updateSessionCmsEntry,
  upsertSessionCmsConfig,
  upsertSessionCmsContentEntry,
} from './session_cms_binding_helpers'
import { hashOwnerSecret } from './session_access_helpers'

type CmsBindingRecord = Doc<'cmsBindings'>
type CmsEntryRecord = Doc<'cmsEntries'>
type CmsRevisionRecord = Doc<'cmsRevisions'>
type CmsConfigRecord = Doc<'cmsConfigs'>
type CmsReadTable = 'cmsBindings' | 'cmsEntries' | 'cmsRevisions'
type ReadLog = {
  table: CmsReadTable
  indexName?: string
  direction?: 'asc' | 'desc'
  limit: number
  filters: Record<string, unknown>
}

const sessionId = 'session_cms_seed' as Id<'sessions'>
const otherSessionId = 'session_cms_other' as Id<'sessions'>

const bindingDoc = (
  overrides: Partial<CmsBindingRecord> = {},
): CmsBindingRecord => ({
  _id: 'binding_1' as Id<'cmsBindings'>,
  _creationTime: 1,
  sessionId,
  selector: 'type:text field:title',
  type: 'text',
  field: 'title',
  createdAt: 10,
  ...overrides,
})

const entryDoc = (overrides: Partial<CmsEntryRecord> = {}): CmsEntryRecord => ({
  _id: 'entry_1' as Id<'cmsEntries'>,
  _creationTime: 2,
  sessionId,
  bindingId: 'binding_1' as Id<'cmsBindings'>,
  content: 'Stored title',
  contentType: 'text/plain',
  updatedAt: 20,
  updatedBy: 'editor@example.com',
  ...overrides,
})

const revisionDoc = (
  overrides: Partial<CmsRevisionRecord> = {},
): CmsRevisionRecord => ({
  _id: 'revision_1' as Id<'cmsRevisions'>,
  _creationTime: 3,
  entryId: 'entry_1' as Id<'cmsEntries'>,
  content: 'Stored revision',
  contentType: 'text/plain',
  updatedBy: 'editor@example.com',
  createdAt: 30,
  ...overrides,
})

const ctxFor = (
  initialBindings: CmsBindingRecord[] = [],
  initialEntries: CmsEntryRecord[] = [],
) => {
  const bindings = [...initialBindings]
  const entries = [...initialEntries]
  let nextBinding = bindings.length + 1
  let nextEntry = entries.length + 1

  const db = {
    query: (table: 'cmsBindings' | 'cmsEntries') => ({
      withIndex: (
        indexName: 'by_sessionId_selector' | 'by_bindingId',
        applyIndex: (index: {
          eq: (
            field: string,
            value: unknown,
          ) => {
            eq: (field: string, value: unknown) => unknown
          }
        }) => unknown,
      ) => {
        const filters = new Map<string, unknown>()
        const index = {
          eq: (field: string, value: unknown) => {
            filters.set(field, value)
            return index
          },
        }

        applyIndex(index)

        return {
          first: async () => {
            if (
              table === 'cmsBindings' &&
              indexName === 'by_sessionId_selector'
            ) {
              return (
                bindings.find(
                  (binding) =>
                    binding.sessionId === filters.get('sessionId') &&
                    binding.selector === filters.get('selector'),
                ) ?? null
              )
            }

            if (table === 'cmsEntries' && indexName === 'by_bindingId') {
              return (
                entries.find(
                  (entry) => entry.bindingId === filters.get('bindingId'),
                ) ?? null
              )
            }

            return null
          },
        }
      },
    }),
    insert: async (
      table: 'cmsBindings' | 'cmsEntries',
      value: Record<string, unknown>,
    ) => {
      if (table === 'cmsBindings') {
        const id = `binding_${nextBinding++}` as Id<'cmsBindings'>
        bindings.push({
          _id: id,
          _creationTime: Number(value.createdAt ?? 0),
          ...value,
        } as CmsBindingRecord)
        return id
      }

      const id = `entry_${nextEntry++}` as Id<'cmsEntries'>
      entries.push({
        _id: id,
        _creationTime: Number(value.updatedAt ?? 0),
        ...value,
      } as CmsEntryRecord)
      return id
    },
  } as unknown as Pick<MutationCtx, 'db'>['db']

  return {
    ctx: { db } as Pick<MutationCtx, 'db'>,
    bindings,
    entries,
  }
}

type FakeIndex = {
  eq: (field: string, value: unknown) => FakeIndex
}

type FakeQuery = {
  withIndex: (
    indexName: string,
    applyIndex: (index: FakeIndex) => unknown,
  ) => FakeQuery
  order: (direction: 'asc' | 'desc') => FakeQuery
  take: (
    limit: number,
  ) => Promise<CmsBindingRecord[] | CmsEntryRecord[] | CmsRevisionRecord[]>
}

const queryCtxForCmsRead = (input: {
  bindings?: CmsBindingRecord[]
  entries?: CmsEntryRecord[]
  revisions?: CmsRevisionRecord[]
}) => {
  const bindings = [...(input.bindings ?? [])]
  const entries = [...(input.entries ?? [])]
  const revisions = [...(input.revisions ?? [])]
  const reads: ReadLog[] = []

  const makeQuery = (table: CmsReadTable): FakeQuery => {
    let indexName: string | undefined
    let direction: 'asc' | 'desc' | undefined
    const filters: Record<string, unknown> = {}

    const fakeIndex: FakeIndex = {
      eq: (field, value) => {
        filters[field] = value
        return fakeIndex
      },
    }

    const queryApi: FakeQuery = {
      withIndex: (nextIndexName, applyIndex) => {
        indexName = nextIndexName
        applyIndex(fakeIndex)
        return queryApi
      },
      order: (nextDirection) => {
        direction = nextDirection
        return queryApi
      },
      take: async (limit) => {
        reads.push({
          table,
          indexName,
          direction,
          limit,
          filters: { ...filters },
        })

        if (table === 'cmsBindings') {
          return bindings
            .filter((binding) => binding.sessionId === filters.sessionId)
            .slice(0, limit)
        }

        if (table === 'cmsEntries') {
          return entries
            .filter((entry) => entry.sessionId === filters.sessionId)
            .slice(0, limit)
        }

        const matchingRevisions = revisions.filter(
          (revision) => revision.entryId === filters.entryId,
        )
        if (direction === 'desc') {
          matchingRevisions.sort((a, b) => b.createdAt - a.createdAt)
        }
        return matchingRevisions.slice(0, limit)
      },
    }

    return queryApi
  }

  const db = {
    get: async (id: Id<'cmsEntries'>) =>
      entries.find((entry) => entry._id === id) ?? null,
    query: makeQuery,
  } as unknown as Pick<QueryCtx, 'db'>['db']

  return {
    ctx: { db } as Pick<QueryCtx, 'db'>,
    reads,
  }
}

const mutationCtxForCmsContent = (input: {
  sessions: Array<Doc<'sessions'>>
  bindings?: CmsBindingRecord[]
  entries?: CmsEntryRecord[]
  revisions?: CmsRevisionRecord[]
}) => {
  const sessions = [...input.sessions]
  const bindings = [...(input.bindings ?? [])]
  const entries = [...(input.entries ?? [])]
  const revisions = [...(input.revisions ?? [])]
  const inserts: Array<{ table: string; value: Record<string, unknown> }> = []
  const patches: Array<{ id: string; value: Record<string, unknown> }> = []
  let nextBinding = bindings.length + 1
  let nextEntry = entries.length + 1
  let nextRevision = revisions.length + 1

  const firstFor = (
    table: 'cmsBindings' | 'cmsEntries',
    filters: Map<string, unknown>,
  ) => {
    if (table === 'cmsBindings') {
      return (
        bindings.find(
          (binding) =>
            binding.sessionId === filters.get('sessionId') &&
            binding.selector === filters.get('selector'),
        ) ?? null
      )
    }

    return (
      entries.find((entry) => entry.bindingId === filters.get('bindingId')) ??
      null
    )
  }

  const db = {
    get: async (
      id:
        | Id<'sessions'>
        | Id<'cmsBindings'>
        | Id<'cmsEntries'>
        | Id<'cmsRevisions'>,
    ) =>
      sessions.find((session) => session._id === id) ??
      bindings.find((binding) => binding._id === id) ??
      entries.find((entry) => entry._id === id) ??
      revisions.find((revision) => revision._id === id) ??
      null,
    query: (table: 'cmsBindings' | 'cmsEntries') => ({
      withIndex: (
        _indexName: string,
        applyIndex: (index: {
          eq: (field: string, value: unknown) => unknown
        }) => unknown,
      ) => {
        const filters = new Map<string, unknown>()
        const index = {
          eq: (field: string, value: unknown) => {
            filters.set(field, value)
            return index
          },
        }
        applyIndex(index)

        return {
          first: async () => firstFor(table, filters),
        }
      },
    }),
    insert: async (table: string, value: Record<string, unknown>) => {
      inserts.push({ table, value })

      if (table === 'cmsBindings') {
        const id = `binding_mutation_${nextBinding++}` as Id<'cmsBindings'>
        bindings.push({
          _id: id,
          _creationTime: Number(value.createdAt ?? 0),
          ...value,
        } as CmsBindingRecord)
        return id
      }

      if (table === 'cmsEntries') {
        const id = `entry_mutation_${nextEntry++}` as Id<'cmsEntries'>
        entries.push({
          _id: id,
          _creationTime: Number(value.updatedAt ?? 0),
          ...value,
        } as CmsEntryRecord)
        return id
      }

      const id = `revision_mutation_${nextRevision++}` as Id<'cmsRevisions'>
      revisions.push({
        _id: id,
        _creationTime: Number(value.createdAt ?? 0),
        ...value,
      } as CmsRevisionRecord)
      return id
    },
    patch: async (id: string, value: Record<string, unknown>) => {
      patches.push({ id, value })
      const entry = entries.find((candidate) => candidate._id === id)
      if (entry !== undefined) Object.assign(entry, value)
      const session = sessions.find((candidate) => candidate._id === id)
      if (session !== undefined) Object.assign(session, value)
    },
  } as unknown as MutationCtx['db']

  const ctx = {
    db,
    auth: {
      getUserIdentity: async () => ({
        tokenIdentifier: 'user_1',
        subject: 'user_1',
      }),
    },
  } as unknown as MutationCtx

  return { ctx, bindings, entries, revisions, inserts, patches }
}

const sessionDoc = (overrides: Partial<Doc<'sessions'>> = {}) =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a CMS test site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    createdAt: 1,
    userId: 'user_1',
    previewVersion: 0,
    ...overrides,
  }) as Doc<'sessions'>

const anonymousSessionDoc = async (ownerSecret = 'owner-secret') =>
  sessionDoc({
    userId: undefined,
    anonOwnerSecretHash: await hashOwnerSecret(ownerSecret),
  })

const cmsConfigDoc = (
  overrides: Partial<CmsConfigRecord> = {},
): CmsConfigRecord =>
  ({
    _id: 'cms_config_1' as Id<'cmsConfigs'>,
    _creationTime: 1,
    sessionId,
    status: 'ready',
    projectId: 'old-project',
    dataset: 'old-dataset',
    configJson: '{"old":true}',
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }) as CmsConfigRecord

const mutationCtxForCmsConfig = async (
  options: {
    session?: Doc<'sessions'> | null
    configs?: CmsConfigRecord[]
  } = {},
) => {
  const session =
    options.session === undefined
      ? await anonymousSessionDoc()
      : options.session
  const configs = [...(options.configs ?? [])]

  const ctx = {
    auth: {
      getUserIdentity: async () => null,
    },
    db: {
      get: async (id: string) => {
        if (id === sessionId) return session
        return configs.find((config) => config._id === id) ?? null
      },
      query: (table: string) => {
        expect(table).toBe('cmsConfigs')
        return {
          withIndex: (
            indexName: string,
            applyIndex: (index: {
              eq: (
                fieldName: string,
                fieldValue: unknown,
              ) => {
                field: string
                value: unknown
              }
            }) => { field: string; value: unknown },
          ) => {
            expect(indexName).toBe('by_sessionId')
            const { field, value } = applyIndex({
              eq: (fieldName, fieldValue) => ({
                field: fieldName,
                value: fieldValue,
              }),
            })
            expect(field).toBe('sessionId')
            return {
              first: async () =>
                configs.find((config) => config.sessionId === value) ?? null,
            }
          },
        }
      },
      insert: async (table: string, value: Record<string, unknown>) => {
        expect(table).toBe('cmsConfigs')
        const config = {
          _id: `cms_config_${configs.length + 1}` as Id<'cmsConfigs'>,
          _creationTime: 1,
          ...value,
        } as CmsConfigRecord
        configs.push(config)
        return config._id
      },
      patch: async (id: Id<'cmsConfigs'>, patch: Partial<CmsConfigRecord>) => {
        const index = configs.findIndex((config) => config._id === id)
        expect(index).toBeGreaterThanOrEqual(0)
        configs[index] = {
          ...configs[index],
          ...patch,
        } as CmsConfigRecord
      },
    },
  } as unknown as MutationCtx

  return { ctx, configs }
}

describe('session CMS binding helpers', () => {
  it('creates an owned CMS config', async () => {
    const { ctx, configs } = await mutationCtxForCmsConfig()

    await expect(
      upsertSessionCmsConfig(ctx, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        projectId: 'ship-fast',
        dataset: 'production',
        configJson: '{"provider":"sanity"}',
      }),
    ).resolves.toEqual({ sessionId })

    expect(configs).toHaveLength(1)
    expect(configs[0]).toMatchObject({
      sessionId,
      status: 'ready',
      projectId: 'ship-fast',
      dataset: 'production',
      configJson: '{"provider":"sanity"}',
    })
    expect(typeof configs[0]?.createdAt).toBe('number')
    expect(configs[0]?.updatedAt).toBe(configs[0]?.createdAt)
  })

  it('updates an existing owned CMS config', async () => {
    const existing = cmsConfigDoc()
    const { ctx, configs } = await mutationCtxForCmsConfig({
      configs: [existing],
    })

    await expect(
      upsertSessionCmsConfig(ctx, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        projectId: 'new-project',
        dataset: 'staging',
        configJson: '{"provider":"sanity","draft":true}',
      }),
    ).resolves.toEqual({ sessionId })

    expect(configs).toHaveLength(1)
    expect(configs[0]).toMatchObject({
      _id: existing._id,
      projectId: 'new-project',
      dataset: 'staging',
      configJson: '{"provider":"sanity","draft":true}',
      status: 'ready',
      createdAt: 100,
    })
    expect(configs[0]?.updatedAt).not.toBe(100)
  })

  it('rejects CMS config writes without session ownership', async () => {
    const { ctx } = await mutationCtxForCmsConfig()

    await expect(
      upsertSessionCmsConfig(ctx, {
        sessionId,
        anonymousOwnerSecret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('serializes CMS config for public reads', async () => {
    const { ctx } = await mutationCtxForCmsConfig({
      configs: [
        cmsConfigDoc({
          errorMessage: 'partial',
        }),
      ],
    })

    await expect(loadSessionCmsConfig(ctx, sessionId)).resolves.toEqual({
      configId: 'cms_config_1',
      status: 'ready',
      projectId: 'old-project',
      dataset: 'old-dataset',
      configJson: '{"old":true}',
      errorMessage: 'partial',
      createdAt: 100,
      updatedAt: 100,
    })
  })

  it('seeds CMS bindings and initial entries from generated HTML', async () => {
    const { ctx, bindings, entries } = ctxFor()

    await expect(
      seedCmsBindingsForGeneratedArtifacts(
        ctx,
        sessionId,
        {
          html: `
            <h1 data-cms="type:text field:title"> Hello World </h1>
            <img data-cms="type:image field:hero.image" src="https://cdn.example.com/hero.jpg" />
          `,
        },
        100,
      ),
    ).resolves.toBe(2)

    expect(bindings).toMatchObject([
      {
        sessionId,
        selector: 'type:text field:title',
        type: 'text',
        field: 'title',
        createdAt: 100,
      },
      {
        sessionId,
        selector: 'type:image field:hero.image',
        type: 'image',
        field: 'hero.image',
        createdAt: 100,
      },
    ])
    expect(entries).toMatchObject([
      {
        sessionId,
        bindingId: bindings[0]?._id,
        content: 'Hello World',
        contentType: 'text/plain',
        updatedAt: 100,
      },
      {
        sessionId,
        bindingId: bindings[1]?._id,
        content: 'https://cdn.example.com/hero.jpg',
        contentType: 'text/uri-list',
        updatedAt: 100,
      },
    ])
  })

  it('dedupes later site-spec candidates by existing field keys', async () => {
    const { ctx, bindings, entries } = ctxFor()

    await expect(
      seedCmsBindingsForGeneratedArtifacts(
        ctx,
        sessionId,
        {
          html: '<h1 data-cms="type:text field:hero.headline">HTML headline</h1>',
          siteSpecJson: JSON.stringify({
            hero: { headline: 'Site spec headline' },
          }),
        },
        200,
      ),
    ).resolves.toBe(1)

    expect(bindings).toHaveLength(1)
    expect(bindings[0]).toMatchObject({
      selector: 'type:text field:hero.headline',
      field: 'hero.headline',
    })
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ content: 'HTML headline' })
  })

  it('reuses existing bindings and entries without creating duplicates', async () => {
    const existingBinding: CmsBindingRecord = {
      _id: 'binding_existing' as Id<'cmsBindings'>,
      _creationTime: 1,
      sessionId,
      selector: 'type:text field:title',
      type: 'text',
      field: 'title',
      createdAt: 1,
    }
    const existingEntry: CmsEntryRecord = {
      _id: 'entry_existing' as Id<'cmsEntries'>,
      _creationTime: 1,
      sessionId,
      bindingId: existingBinding._id,
      content: 'Existing title',
      contentType: 'text/plain',
      updatedAt: 1,
    }
    const { ctx, bindings, entries } = ctxFor(
      [existingBinding],
      [existingEntry],
    )

    await expect(
      seedCmsBindingsForGeneratedArtifacts(
        ctx,
        sessionId,
        {
          html: '<h1 data-cms="type:text field:title">New title</h1>',
        },
        300,
      ),
    ).resolves.toBe(0)

    expect(bindings).toEqual([existingBinding])
    expect(entries).toEqual([existingEntry])
  })

  it('creates bindings but skips entries for empty initial content', async () => {
    const { ctx, bindings, entries } = ctxFor()

    await expect(
      seedCmsBindingsForGeneratedArtifacts(
        ctx,
        sessionId,
        {
          html: '<p data-cms="type:text field:empty">   </p>',
        },
        400,
      ),
    ).resolves.toBe(1)

    expect(bindings).toHaveLength(1)
    expect(bindings[0]).toMatchObject({
      selector: 'type:text field:empty',
      field: 'empty',
    })
    expect(entries).toHaveLength(0)
  })

  it('lists CMS entries with bounded indexed reads', async () => {
    const matchingEntry = entryDoc()
    const ignoredEntry = entryDoc({
      _id: 'entry_other' as Id<'cmsEntries'>,
      sessionId: otherSessionId,
    })
    const { ctx, reads } = queryCtxForCmsRead({
      entries: [matchingEntry, ignoredEntry],
    })

    await expect(listSessionCmsEntries(ctx, sessionId)).resolves.toEqual([
      matchingEntry,
    ])
    expect(reads).toEqual([
      {
        table: 'cmsEntries',
        indexName: 'by_sessionId',
        direction: undefined,
        limit: 200,
        filters: { sessionId },
      },
    ])
  })

  it('lists CMS content by joining bindings with entries', async () => {
    const headlineBinding = bindingDoc()
    const imageBinding = bindingDoc({
      _id: 'binding_image' as Id<'cmsBindings'>,
      selector: 'type:image field:hero.image',
      type: 'image',
      field: 'hero.image',
      createdAt: 11,
    })
    const headlineEntry = entryDoc({ bindingId: headlineBinding._id })
    const ignoredEntry = entryDoc({
      _id: 'entry_unrelated' as Id<'cmsEntries'>,
      bindingId: 'binding_unrelated' as Id<'cmsBindings'>,
      content: 'Unrelated',
    })
    const { ctx, reads } = queryCtxForCmsRead({
      bindings: [headlineBinding, imageBinding],
      entries: [headlineEntry, ignoredEntry],
    })

    await expect(listSessionCmsContent(ctx, sessionId)).resolves.toEqual([
      {
        bindingId: headlineBinding._id,
        entryId: headlineEntry._id,
        selector: headlineBinding.selector,
        type: headlineBinding.type,
        field: headlineBinding.field,
        content: headlineEntry.content,
        contentType: headlineEntry.contentType,
        updatedAt: headlineEntry.updatedAt,
        updatedBy: headlineEntry.updatedBy,
        createdAt: headlineBinding.createdAt,
      },
      {
        bindingId: imageBinding._id,
        entryId: undefined,
        selector: imageBinding.selector,
        type: imageBinding.type,
        field: imageBinding.field,
        content: '',
        contentType: undefined,
        updatedAt: undefined,
        updatedBy: undefined,
        createdAt: imageBinding.createdAt,
      },
    ])
    expect(
      reads.map((read) => [read.table, read.indexName, read.limit]),
    ).toEqual([
      ['cmsBindings', 'by_sessionId', 200],
      ['cmsEntries', 'by_sessionId', 200],
    ])
  })

  it('returns no CMS revisions when the entry is missing or belongs to another session', async () => {
    const foreignEntry = entryDoc({ sessionId: otherSessionId })
    const { ctx, reads } = queryCtxForCmsRead({ entries: [foreignEntry] })

    await expect(
      listSessionCmsEntryRevisions(ctx, {
        sessionId,
        entryId: 'entry_missing' as Id<'cmsEntries'>,
      }),
    ).resolves.toEqual([])
    await expect(
      listSessionCmsEntryRevisions(ctx, {
        sessionId,
        entryId: foreignEntry._id,
      }),
    ).resolves.toEqual([])
    expect(reads).toEqual([])
  })

  it('lists CMS entry revisions newest first', async () => {
    const entry = entryDoc()
    const olderRevision = revisionDoc({
      _id: 'revision_old' as Id<'cmsRevisions'>,
      entryId: entry._id,
      content: 'Old title',
      createdAt: 100,
    })
    const newerRevision = revisionDoc({
      _id: 'revision_new' as Id<'cmsRevisions'>,
      entryId: entry._id,
      content: 'New title',
      createdAt: 200,
    })
    const { ctx, reads } = queryCtxForCmsRead({
      entries: [entry],
      revisions: [olderRevision, newerRevision],
    })

    await expect(
      listSessionCmsEntryRevisions(ctx, {
        sessionId,
        entryId: entry._id,
      }),
    ).resolves.toEqual([
      {
        revisionId: newerRevision._id,
        content: newerRevision.content,
        contentType: newerRevision.contentType,
        updatedBy: newerRevision.updatedBy,
        createdAt: newerRevision.createdAt,
      },
      {
        revisionId: olderRevision._id,
        content: olderRevision.content,
        contentType: olderRevision.contentType,
        updatedBy: olderRevision.updatedBy,
        createdAt: olderRevision.createdAt,
      },
    ])
    expect(reads).toEqual([
      {
        table: 'cmsRevisions',
        indexName: 'by_entryId_createdAt',
        direction: 'desc',
        limit: 50,
        filters: { entryId: entry._id },
      },
    ])
  })

  it('upserts CMS content by creating a missing field binding and entry', async () => {
    const { ctx, bindings, entries, inserts } = mutationCtxForCmsContent({
      sessions: [sessionDoc()],
    })

    const result = await upsertSessionCmsContentEntry(
      ctx,
      {
        sessionId,
        field: 'hero.title',
        content: 'New title',
        contentType: 'text/plain',
      },
      500,
    )

    expect(result).toEqual({
      sessionId,
      bindingId: bindings[0]?._id,
      previewVersion: 0,
    })
    expect(bindings[0]).toMatchObject({
      sessionId,
      selector: 'field:hero.title',
      type: 'text',
      field: 'hero.title',
      createdAt: 500,
    })
    expect(entries[0]).toMatchObject({
      sessionId,
      bindingId: bindings[0]?._id,
      content: 'New title',
      contentType: 'text/plain',
      updatedAt: 500,
      updatedBy: 'user_1',
    })
    expect(inserts.map((insert) => insert.table)).toEqual([
      'cmsBindings',
      'cmsEntries',
    ])
  })

  it('upserts CMS content by revisioning and patching an existing entry', async () => {
    const binding = bindingDoc()
    const entry = entryDoc({
      bindingId: binding._id,
      content: 'Old title',
      updatedBy: 'previous_user',
    })
    const { ctx, entries, revisions, patches } = mutationCtxForCmsContent({
      sessions: [sessionDoc()],
      bindings: [binding],
      entries: [entry],
    })

    await expect(
      upsertSessionCmsContentEntry(
        ctx,
        {
          sessionId,
          bindingId: binding._id,
          content: 'New title',
          contentType: 'text/plain',
        },
        600,
      ),
    ).resolves.toEqual({
      sessionId,
      bindingId: binding._id,
      previewVersion: 0,
    })
    expect(revisions[0]).toMatchObject({
      entryId: entry._id,
      content: 'Old title',
      contentType: 'text/plain',
      updatedBy: 'previous_user',
      createdAt: 600,
    })
    expect(entries[0]).toMatchObject({
      content: 'New title',
      contentType: 'text/plain',
      updatedAt: 600,
      updatedBy: 'user_1',
    })
    expect(patches).toEqual([
      {
        id: entry._id,
        value: {
          content: 'New title',
          contentType: 'text/plain',
          updatedAt: 600,
          updatedBy: 'user_1',
        },
      },
    ])
  })

  it('inserts internal CMS bindings with generated timestamps', async () => {
    const { ctx, bindings } = ctxFor()

    await expect(
      insertSessionCmsBinding(
        ctx,
        {
          sessionId,
          selector: 'type:link field:hero.ctaUrl',
          type: 'link',
          field: 'hero.ctaUrl',
        },
        550,
      ),
    ).resolves.toBe(bindings[0]?._id)

    expect(bindings[0]).toMatchObject({
      sessionId,
      selector: 'type:link field:hero.ctaUrl',
      type: 'link',
      field: 'hero.ctaUrl',
      createdAt: 550,
    })
  })

  it('updates internal CMS entries by creating a missing entry', async () => {
    const binding = bindingDoc()
    const { ctx, entries } = mutationCtxForCmsContent({
      sessions: [],
      bindings: [binding],
    })

    await expect(
      updateSessionCmsEntry(
        ctx,
        {
          sessionId,
          bindingId: binding._id,
          content: 'Generated title',
          contentType: 'text/plain',
          updatedBy: 'engine',
        },
        575,
      ),
    ).resolves.toEqual({ success: true })

    expect(entries[0]).toMatchObject({
      sessionId,
      bindingId: binding._id,
      content: 'Generated title',
      contentType: 'text/plain',
      updatedAt: 575,
      updatedBy: 'engine',
    })
  })

  it('updates internal CMS entries by revisioning existing content', async () => {
    const binding = bindingDoc()
    const entry = entryDoc({
      bindingId: binding._id,
      content: 'Before engine update',
      updatedBy: 'previous-engine',
    })
    const { ctx, entries, revisions, patches } = mutationCtxForCmsContent({
      sessions: [],
      bindings: [binding],
      entries: [entry],
    })

    await expect(
      updateSessionCmsEntry(
        ctx,
        {
          sessionId,
          bindingId: binding._id,
          content: 'After engine update',
          contentType: 'text/plain',
          updatedBy: 'engine',
        },
        585,
      ),
    ).resolves.toEqual({ success: true })

    expect(revisions[0]).toMatchObject({
      entryId: entry._id,
      content: 'Before engine update',
      contentType: 'text/plain',
      updatedBy: 'previous-engine',
      createdAt: 585,
    })
    expect(entries[0]).toMatchObject({
      content: 'After engine update',
      updatedAt: 585,
      updatedBy: 'engine',
    })
    expect(patches).toEqual([
      {
        id: entry._id,
        value: {
          content: 'After engine update',
          contentType: 'text/plain',
          updatedAt: 585,
          updatedBy: 'engine',
        },
      },
    ])
  })

  it('rejects internal CMS entry updates for missing bindings', async () => {
    const { ctx } = mutationCtxForCmsContent({
      sessions: [],
      bindings: [],
    })

    await expect(
      updateSessionCmsEntry(ctx, {
        sessionId,
        bindingId: 'missing_binding' as Id<'cmsBindings'>,
        content: 'No binding',
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
        message: 'CMS binding not found',
      },
    })
  })

  it('restores CMS content revisions by preserving current content as a new revision', async () => {
    const binding = bindingDoc()
    const entry = entryDoc({
      bindingId: binding._id,
      content: 'Current title',
      updatedBy: 'current_user',
    })
    const revision = revisionDoc({
      entryId: entry._id,
      content: 'Restored title',
      updatedBy: 'previous_user',
    })
    const { ctx, entries, revisions, patches } = mutationCtxForCmsContent({
      sessions: [sessionDoc()],
      bindings: [binding],
      entries: [entry],
      revisions: [revision],
    })

    await expect(
      restoreSessionCmsContentRevision(
        ctx,
        {
          sessionId,
          revisionId: revision._id,
        },
        700,
      ),
    ).resolves.toEqual({
      sessionId,
      entryId: entry._id,
      bindingId: binding._id,
      previewVersion: 0,
    })
    expect(revisions.at(-1)).toMatchObject({
      entryId: entry._id,
      content: 'Current title',
      contentType: 'text/plain',
      updatedBy: 'current_user',
      createdAt: 700,
    })
    expect(entries[0]).toMatchObject({
      content: 'Restored title',
      updatedAt: 700,
      updatedBy: 'user_1',
    })
    expect(patches).toEqual([
      {
        id: entry._id,
        value: {
          content: 'Restored title',
          contentType: 'text/plain',
          updatedAt: 700,
          updatedBy: 'user_1',
        },
      },
    ])
  })

  it('restores internal CMS revisions without session ownership checks', async () => {
    const binding = bindingDoc()
    const entry = entryDoc({
      bindingId: binding._id,
      content: 'Current engine value',
      updatedBy: 'engine-current',
    })
    const revision = revisionDoc({
      entryId: entry._id,
      content: 'Restored engine value',
      contentType: 'text/plain',
      updatedBy: 'engine-previous',
    })
    const { ctx, entries, revisions, patches } = mutationCtxForCmsContent({
      sessions: [],
      bindings: [binding],
      entries: [entry],
      revisions: [revision],
    })

    await expect(
      restoreSessionCmsRevision(
        ctx,
        {
          sessionId,
          revisionId: revision._id,
        },
        725,
      ),
    ).resolves.toEqual({ success: true })

    expect(revisions.at(-1)).toMatchObject({
      entryId: entry._id,
      content: 'Current engine value',
      contentType: 'text/plain',
      updatedBy: 'engine-current',
      createdAt: 725,
    })
    expect(entries[0]).toMatchObject({
      content: 'Restored engine value',
      updatedAt: 725,
      updatedBy: 'engine-previous',
    })
    expect(patches).toEqual([
      {
        id: entry._id,
        value: {
          content: 'Restored engine value',
          contentType: 'text/plain',
          updatedAt: 725,
          updatedBy: 'engine-previous',
        },
      },
    ])
  })

  it('lists internal CMS revisions with a bounded indexed read', async () => {
    const olderRevision = revisionDoc({
      _id: 'revision_internal_old' as Id<'cmsRevisions'>,
      content: 'Old internal revision',
      createdAt: 100,
    })
    const newerRevision = revisionDoc({
      _id: 'revision_internal_new' as Id<'cmsRevisions'>,
      content: 'New internal revision',
      createdAt: 200,
    })
    const ignoredRevision = revisionDoc({
      _id: 'revision_internal_ignored' as Id<'cmsRevisions'>,
      entryId: 'entry_other' as Id<'cmsEntries'>,
      content: 'Ignored',
    })
    const { ctx, reads } = queryCtxForCmsRead({
      revisions: [olderRevision, newerRevision, ignoredRevision],
    })

    await expect(
      listCmsRevisionsForEntry(ctx, 'entry_1' as Id<'cmsEntries'>),
    ).resolves.toEqual([olderRevision, newerRevision])
    expect(reads).toEqual([
      {
        table: 'cmsRevisions',
        indexName: 'by_entryId',
        direction: undefined,
        limit: 200,
        filters: { entryId: 'entry_1' },
      },
    ])
  })
})
