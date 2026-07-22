import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Doc } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  areGenerationLimitsDisabled,
  createGenerationSession,
  findIdempotentWorkspaceSession,
  findReusablePromptCacheSession,
  loadGenerationAdmission,
  PROMPT_CACHE_LOOKBACK_LIMIT,
} from './session_creation_helpers'
import {
  MAX_ANON_PER_DAY,
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  RATE_WINDOW_MS,
  SHARE_BONUS_EXTRA,
} from '../../src/billing/constants'

type MutationHandler<Args> = (ctx: MutationCtx, args: Args) => Promise<unknown>

type ExportTarget = 'html' | 'react' | 'next' | 'lakebed'

type CreateGenerationSessionArgs = {
  prompt: string
  preferredLanguage: string
  preferredExportTarget: ExportTarget
  isPrivate: boolean
  workspace: string
  anonymousOwnerSecret?: string
  anonymousClientId?: string
  designReferenceUrls?: string[]
  designReferenceNotes?: string
  cloneUrl?: string
  engineVersion?: string
}

type QueryRows = {
  sessions: Array<Doc<'sessions'>>
  subscriptions: Array<Record<string, unknown>>
}
type InsertedRow = {
  table: string
  id: string
  value: Record<string, unknown>
}
type Row = Doc<'sessions'> | Record<string, unknown>

function sessionDoc(overrides: Partial<Doc<'sessions'>> = {}) {
  return {
    _id: `session_${Math.random()}`,
    _creationTime: 1,
    prompt: 'Build a site',
    workspace: 'workspace',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    createdAt: 1,
    ...overrides,
  } as Doc<'sessions'>
}

const queryHelper = {
  field: (name: string) => name,
  eq: (field: string, value: unknown) => (row: Row) =>
    row[field as keyof typeof row] === value,
  or:
    (...predicates: Array<(row: Row) => boolean>) =>
    (row: Row) =>
      predicates.some((predicate) => predicate(row)),
}

const indexHelper = {
  eq: (field: string, value: unknown) => ({ field, value }),
}

function chainFor(rows: Row[]) {
  return {
    withIndex: (
      _indexName: string,
      applyIndex: (index: typeof indexHelper) => {
        field: string
        value: unknown
      },
    ) => {
      const { field, value } = applyIndex(indexHelper)
      return chainFor(
        rows.filter((row) => row[field as keyof typeof row] === value),
      )
    },
    order: (direction: 'asc' | 'desc') =>
      chainFor(
        [...rows].sort((left, right) => {
          const leftTime = Number(left._creationTime ?? 0)
          const rightTime = Number(right._creationTime ?? 0)
          return direction === 'desc'
            ? rightTime - leftTime
            : leftTime - rightTime
        }),
      ),
    filter: (
      applyFilter: (helper: typeof queryHelper) => (row: Row) => boolean,
    ) => chainFor(rows.filter(applyFilter(queryHelper))),
    take: async (limit: number) => rows.slice(0, limit),
    unique: async () => rows[0] ?? null,
    first: async () => rows[0] ?? null,
    [Symbol.asyncIterator]: async function* () {
      for (const row of rows) {
        yield row
      }
    },
  }
}

function ctxFor(rows: Partial<QueryRows>) {
  return {
    db: {
      query: (table: keyof QueryRows) => chainFor(rows[table] ?? []),
    },
  } as unknown as Pick<MutationCtx, 'db'>
}

type TestIdentity = Awaited<ReturnType<MutationCtx['auth']['getUserIdentity']>>

function createMutationCtxFor(
  initialRows: Partial<QueryRows> = {},
  identity: TestIdentity = null,
) {
  const rows: QueryRows = {
    sessions: [...(initialRows.sessions ?? [])],
    subscriptions: [...(initialRows.subscriptions ?? [])],
  }
  const inserted: InsertedRow[] = []
  const patches: Array<{ id: string; value: Record<string, unknown> }> = []
  const runAfter = vi.fn(async () => null)

  const findRow = (id: string) =>
    rows.sessions.find((row) => row._id === id) ??
    inserted.find((row) => row.id === id)?.value ??
    null

  const ctx = {
    auth: {
      getUserIdentity: async () => identity,
    },
    db: {
      query: (table: keyof QueryRows) => chainFor(rows[table] ?? []),
      get: async (id: string) => findRow(id),
      insert: async (table: string, value: Record<string, unknown>) => {
        const id = `${table}_${inserted.length + 1}`
        const row = { _id: id, _creationTime: inserted.length + 1, ...value }
        inserted.push({ table, id, value: row })

        if (table === 'sessions') {
          rows.sessions.push(row as Doc<'sessions'>)
        }

        return id
      },
      patch: async (id: string, value: Record<string, unknown>) => {
        patches.push({ id, value })
        const target = findRow(id)
        if (target !== null) Object.assign(target, value)
      },
    },
    scheduler: {
      runAfter,
    },
  } as unknown as MutationCtx

  return { ctx, inserted, patches, runAfter }
}

const createReferences = () => ({
  startGeneration: 'startGeneration' as unknown as Parameters<
    MutationCtx['scheduler']['runAfter']
  >[1],
  sendOperationalNotification:
    'sendOperationalNotification' as unknown as Parameters<
      MutationCtx['scheduler']['runAfter']
    >[1],
})

describe('session creation helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('detects environment-based generation limit bypasses', () => {
    expect(areGenerationLimitsDisabled({})).toBe(false)
    expect(areGenerationLimitsDisabled({ DISABLE_LIMIT: 'true' })).toBe(true)
    expect(areGenerationLimitsDisabled({ IS_DEV: 'true' })).toBe(true)
  })

  it('finds the newest reusable public prompt-cache session', async () => {
    const newestIncomplete = sessionDoc({
      _id: 'newest_incomplete' as Doc<'sessions'>['_id'],
      _creationTime: 30,
      promptCacheKey: 'cache-key',
      previewVersion: 0,
    })
    const reusable = sessionDoc({
      _id: 'reusable' as Doc<'sessions'>['_id'],
      _creationTime: 20,
      promptCacheKey: 'cache-key',
      previewVersion: 1,
      isPrivate: false,
    })
    const privateReady = sessionDoc({
      _id: 'private_ready' as Doc<'sessions'>['_id'],
      _creationTime: 10,
      promptCacheKey: 'cache-key',
      previewVersion: 1,
      isPrivate: true,
    })

    await expect(
      findReusablePromptCacheSession(
        ctxFor({ sessions: [privateReady, reusable, newestIncomplete] }),
        'cache-key',
      ),
    ).resolves.toBe(reusable)
  })

  it('returns null when prompt-cache candidates are not reusable', async () => {
    await expect(
      findReusablePromptCacheSession(
        ctxFor({
          sessions: [
            sessionDoc({
              promptCacheKey: 'cache-key',
              previewVersion: 0,
              isPrivate: false,
            }),
            sessionDoc({
              promptCacheKey: 'cache-key',
              previewVersion: 1,
              isPrivate: true,
            }),
          ],
        }),
        'cache-key',
      ),
    ).resolves.toBeNull()
  })

  it('uses a bounded prompt-cache lookup', async () => {
    const sessions = Array.from(
      { length: PROMPT_CACHE_LOOKBACK_LIMIT + 2 },
      (_, index) =>
        sessionDoc({
          _id: `session_${index}` as Doc<'sessions'>['_id'],
          _creationTime: PROMPT_CACHE_LOOKBACK_LIMIT + 2 - index,
          promptCacheKey: 'cache-key',
          previewVersion: index === PROMPT_CACHE_LOOKBACK_LIMIT + 1 ? 1 : 0,
        }),
    )

    await expect(
      findReusablePromptCacheSession(ctxFor({ sessions }), 'cache-key'),
    ).resolves.toBeNull()
  })

  it('returns an idempotent workspace session for the same owner and request', async () => {
    const existing = sessionDoc({
      workspace: 'workspace_idempotent',
      prompt: 'Build an idempotent site',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      designReferenceFingerprint: 'fingerprint',
      cloneUrl: 'https://example.com/source',
      engineVersion: 'v2',
      isPrivate: false,
      userId: 'user_1',
    })

    await expect(
      findIdempotentWorkspaceSession(ctxFor({ sessions: [existing] }), {
        workspace: 'workspace_idempotent',
        prompt: 'Build an idempotent site',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        designReferenceFingerprint: 'fingerprint',
        cloneUrl: 'https://example.com/source',
        engineVersion: 'v2',
        isPrivate: false,
        userId: 'user_1',
      }),
    ).resolves.toBe(existing)
  })

  it('rejects conflicting workspace reuse', async () => {
    await expect(
      findIdempotentWorkspaceSession(
        ctxFor({
          sessions: [
            sessionDoc({
              workspace: 'workspace_conflict',
              prompt: 'Original prompt',
              preferredLanguage: 'en',
              preferredExportTarget: 'html',
              isPrivate: false,
              userId: 'user_1',
            }),
          ],
        }),
        {
          workspace: 'workspace_conflict',
          prompt: 'Different prompt',
          preferredLanguage: 'en',
          preferredExportTarget: 'html',
          isPrivate: false,
          userId: 'user_1',
        },
      ),
    ).rejects.toMatchObject({
      data: {
        code: 'DUPLICATE_WORKSPACE',
      },
    })
  })

  it('computes anonymous admission with share bonus quota', async () => {
    const now = Date.now()
    const quotaCount = MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA - 1

    await expect(
      loadGenerationAdmission(
        ctxFor({
          sessions: Array.from({ length: quotaCount }, (_, index) =>
            sessionDoc({
              anonymousClientIdHash: 'anon_hash',
              createdAt: now - RATE_WINDOW_MS - 1000 - index,
            }),
          ),
        }),
        {
          anonymousClientIdHash: 'anon_hash',
          now,
          disableLimits: false,
        },
      ),
    ).resolves.toEqual({
      quotaLimit: MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA,
      quotaCount,
      remaining: 0,
    })
  })

  it('requires a server IP bucket in public preview mode', async () => {
    await expect(
      loadGenerationAdmission(ctxFor({ sessions: [] }), {
        anonymousClientIdHash: 'anon_hash',
        now: Date.now(),
        disableLimits: false,
        publicPreviewMode: true,
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'CLIENT_IP_REQUIRED',
      },
    })
  })

  it('uses the server IP bucket for public preview anonymous admission', async () => {
    const now = Date.now()

    await expect(
      loadGenerationAdmission(
        ctxFor({
          sessions: [
            sessionDoc({
              anonymousClientIdHash: 'other_anon_hash',
              clientIpHash: 'ip_hash',
              createdAt: now - RATE_WINDOW_MS - 1000,
            }),
          ],
        }),
        {
          anonymousClientIdHash: 'anon_hash',
          clientIpHash: 'ip_hash',
          now,
          disableLimits: false,
          publicPreviewMode: true,
        },
      ),
    ).resolves.toMatchObject({
      quotaCount: 1,
    })
  })

  it('rejects short-window rate limits before quota limits', async () => {
    const now = Date.now()

    await expect(
      loadGenerationAdmission(
        ctxFor({
          sessions: Array.from({ length: 5 }, (_, index) =>
            sessionDoc({
              userId: 'user_1',
              createdAt: now - index,
            }),
          ),
        }),
        {
          userId: 'user_1',
          now,
          disableLimits: false,
        },
      ),
    ).rejects.toMatchObject({
      data: {
        code: 'RATE_LIMITED',
      },
    })
  })

  it('rejects free authenticated users above monthly quota', async () => {
    const now = Date.now()

    await expect(
      loadGenerationAdmission(
        ctxFor({
          sessions: Array.from({ length: MAX_FREE_PER_MONTH }, (_, index) =>
            sessionDoc({
              userId: 'user_1',
              createdAt: now - RATE_WINDOW_MS - 1000 - index,
            }),
          ),
        }),
        {
          userId: 'user_1',
          now,
          disableLimits: false,
        },
      ),
    ).rejects.toMatchObject({
      data: {
        code: 'QUOTA_EXCEEDED',
      },
    })
  })

  it('uses paid quota when an active subscription exists', async () => {
    const now = Date.now()

    await expect(
      loadGenerationAdmission(
        ctxFor({
          sessions: Array.from({ length: MAX_FREE_PER_MONTH }, (_, index) =>
            sessionDoc({
              userId: 'user_1',
              createdAt: now - RATE_WINDOW_MS - 1000 - index,
            }),
          ),
          subscriptions: [
            {
              userId: 'user_1',
              status: 'active',
            },
          ],
        }),
        {
          userId: 'user_1',
          now,
          disableLimits: false,
        },
      ),
    ).resolves.toEqual({
      quotaLimit: MAX_PAID_PER_MONTH,
      quotaCount: MAX_FREE_PER_MONTH,
      remaining: MAX_PAID_PER_MONTH - MAX_FREE_PER_MONTH - 1,
    })
  })

  it('bypasses admission failures when limits are disabled', async () => {
    const now = Date.now()

    await expect(
      loadGenerationAdmission(
        ctxFor({
          sessions: Array.from({ length: MAX_FREE_PER_MONTH }, (_, index) =>
            sessionDoc({
              userId: 'user_1',
              createdAt: now - index,
            }),
          ),
        }),
        {
          userId: 'user_1',
          now,
          disableLimits: true,
        },
      ),
    ).resolves.toMatchObject({
      quotaLimit: MAX_FREE_PER_MONTH,
      quotaCount: MAX_FREE_PER_MONTH,
      remaining: 0,
    })
  })

  it('creates a queued session and schedules generation with normalized inputs', async () => {
    vi.stubEnv('OPENUI_HOME_MODEL', 'gemini-2.5-flash')
    vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key')
    vi.stubEnv('DISABLE_LIMIT', 'true')
    const references = createReferences()
    const { ctx, inserted, patches, runAfter } = createMutationCtxFor()

    const result = await createGenerationSession(
      ctx,
      {
        prompt: '  Build a luxury ski chalet site  ',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'workspace-create',
        anonymousOwnerSecret: 'owner-secret',
        anonymousClientId: 'anon-client',
        designReferenceUrls: [
          ' https://example.com/inspiration#hero ',
          'https://example.com/second',
          'https://example.com/third',
          'https://example.com/fourth',
          'https://example.com/ignored',
        ],
        designReferenceNotes: '  warm   editorial   layout ',
        cloneUrl: 'https://example.com/source#fragment',
      },
      references,
    )

    const session = inserted.find((row) => row.table === 'sessions')
    const task = inserted.find((row) => row.table === 'tasks')
    const queuedEvent = inserted.find(
      (row) =>
        row.table === 'generationEvents' && row.value.eventType === 'queued',
    )

    expect(result).toMatchObject({
      sessionId: session?.id,
      cached: false,
    })
    expect(session?.value).toMatchObject({
      prompt: 'Build a luxury ski chalet site',
      workspace: 'workspace-create',
      status: 'queued',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      designReferenceUrls: [
        'https://example.com/inspiration',
        'https://example.com/second',
        'https://example.com/third',
        'https://example.com/fourth',
      ],
      designReferenceNotes: 'warm editorial layout',
      cloneUrl: 'https://example.com/source',
      previewVersion: 0,
    })
    expect(session?.value.anonOwnerSecretHash).toEqual(expect.any(String))
    expect(session?.value.anonymousClientIdHash).toEqual(expect.any(String))
    expect(task?.value).toMatchObject({
      sessionId: session?.id,
      taskKey: 'homepage',
      title: 'Generate homepage',
      status: 'pending',
    })
    expect(queuedEvent?.value).toMatchObject({
      sessionId: session?.id,
      eventType: 'queued',
      message: 'Generation queued',
    })
    expect(patches).toContainEqual({
      id: session?.id ?? '',
      value: expect.objectContaining({
        deploymentSlug: 'build-a-luxury-ski',
      }),
    })
    expect(runAfter).toHaveBeenCalledWith(0, references.startGeneration, {
      sessionId: session?.id,
      anonymousOwnerSecret: 'owner-secret',
    })
  })

  it('stores the authenticated owner email for generated admin policy baking', async () => {
    vi.stubEnv('OPENUI_HOME_MODEL', 'gemini-2.5-flash')
    vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key')
    vi.stubEnv('DISABLE_LIMIT', 'true')
    const references = createReferences()
    const { ctx, inserted } = createMutationCtxFor({}, {
      subject: 'user_1',
      tokenIdentifier: 'clerk|user_1',
      email: 'Founder@Example.COM ',
    } as TestIdentity)

    await createGenerationSession(
      ctx,
      {
        prompt: 'Build a publication',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'workspace-owner-email',
      },
      references,
    )

    const session = inserted.find((row) => row.table === 'sessions')
    expect(session?.value).toMatchObject({
      userId: 'clerk|user_1',
      ownerEmail: 'founder@example.com',
    })
    expect(session?.value.anonOwnerSecretHash).toBeUndefined()
  })

  it('marks the new session failed when model configuration is missing', async () => {
    vi.stubEnv('OPENUI_HOME_MODEL', 'openai/gpt-oss-120b')
    vi.stubEnv('GROQ_API_KEY', '')
    vi.stubEnv('DISABLE_LIMIT', 'true')
    const references = createReferences()
    const { ctx, inserted, patches, runAfter } = createMutationCtxFor()

    const result = await createGenerationSession(
      ctx,
      {
        prompt: 'Build a launch microsite',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'workspace-config-failure',
      },
      references,
    )

    const session = inserted.find((row) => row.table === 'sessions')
    const task = inserted.find((row) => row.table === 'tasks')
    const failedEvents = inserted.filter(
      (row) =>
        row.table === 'generationEvents' &&
        (row.value.eventType === 'failed' ||
          row.value.eventType === 'generation_failed'),
    )

    expect(result).toMatchObject({
      sessionId: session?.id,
      cached: false,
    })
    expect(patches).toEqual(
      expect.arrayContaining([
        {
          id: session?.id ?? '',
          value: expect.objectContaining({
            status: 'failed',
            errorCode: 'GENERATION_CONFIG_MISSING',
          }),
        },
        {
          id: task?.id ?? '',
          value: expect.objectContaining({
            status: 'failed',
          }),
        },
      ]),
    )
    expect(failedEvents).toHaveLength(2)
    expect(runAfter).not.toHaveBeenCalled()
  })

  it('create handler delegates to createGenerationSession helper with references', async () => {
    vi.resetModules()
    vi.doMock('./session_creation_helpers', () => ({
      createGenerationSession: vi.fn(async () => ({
        sessionId: 's1',
        cached: false,
      })),
    }))
    try {
      const { create } = await import('../sessions')
      const mockedModule = await import('./session_creation_helpers')
      const mockedCreateGenerationSession = vi.mocked(
        mockedModule.createGenerationSession,
      )
      const ctx = { db: {} } as unknown as MutationCtx
      const args: CreateGenerationSessionArgs = {
        prompt: 'build a site',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'ws1',
      }
      const handler =
        create as unknown as MutationHandler<CreateGenerationSessionArgs>
      await handler(ctx, args)
      expect(mockedCreateGenerationSession).toHaveBeenCalledTimes(1)
      const [callCtx, callArgs, refs] =
        mockedCreateGenerationSession.mock.calls[0]
      expect(callCtx).toBe(ctx)
      expect(callArgs).toBe(args)
      expect(refs).toMatchObject({
        startGeneration: expect.anything(),
        sendOperationalNotification: expect.anything(),
      })
    } finally {
      vi.doUnmock('./session_creation_helpers')
      vi.resetModules()
    }
  })
})
