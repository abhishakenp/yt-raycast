import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Doc } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  areGenerationLimitsDisabled,
  createGenerationSession,
  DRAFT_SESSION_TTL_MS,
  findIdempotentWorkspaceSession,
  findReusablePromptCacheSession,
  loadGenerationAdmission,
  PROMPT_CACHE_LOOKBACK_LIMIT,
  SHORT_WINDOW_LIMIT,
} from './session_creation_helpers'
import {
  MAX_ANON_PER_DAY,
  MAX_ANON_PER_DAY_WITH_BONUS,
  MAX_ANON_PER_MONTH,
  MAX_FREE_AUTH_PER_DAY,
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  RATE_WINDOW_MS,
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
  shareBonuses: Array<Record<string, unknown>>
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
  eq: (field: string, value: unknown) => ({
    field,
    value,
    eq: (field2: string, value2: unknown) => ({
      fields: [
        { field, value },
        { field: field2, value: value2 },
      ],
    }),
  }),
}

function chainFor(rows: Row[]) {
  return {
    withIndex: (
      _indexName: string,
      applyIndex: (
        index: typeof indexHelper,
      ) =>
        | { field: string; value: unknown }
        | { fields: Array<{ field: string; value: unknown }> },
    ) => {
      const result = applyIndex(indexHelper)
      if ('fields' in result) {
        let filtered = rows
        for (const { field, value } of result.fields) {
          filtered = filtered.filter(
            (row) => row[field as keyof typeof row] === value,
          )
        }
        return chainFor(filtered)
      }
      return chainFor(
        rows.filter(
          (row) => row[result.field as keyof typeof row] === result.value,
        ),
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
    shareBonuses: [...(initialRows.shareBonuses ?? [])],
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
  deleteDraftSessionIfStillDraft:
    'deleteDraftSessionIfStillDraft' as unknown as Parameters<
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

  it('computes anonymous admission with monthly quota and daily cap', async () => {
    const now = Date.now()
    const sessionCount = MAX_ANON_PER_DAY - 1

    await expect(
      loadGenerationAdmission(
        ctxFor({
          sessions: Array.from({ length: sessionCount }, (_, index) =>
            sessionDoc({
              clientIpHash: 'ip_hash',
              createdAt: now - RATE_WINDOW_MS - 1000 - index,
            }),
          ),
        }),
        {
          clientIpHash: 'ip_hash',
          now,
          disableLimits: false,
        },
      ),
    ).resolves.toEqual({
      quotaLimit: MAX_ANON_PER_MONTH,
      quotaCount: sessionCount,
      remaining: MAX_ANON_PER_MONTH - sessionCount - 1,
    })
  })

  it('rejects anon at base daily limit with ANON_DAILY_LIMIT_REACHED', async () => {
    const now = Date.now()

    await expect(
      loadGenerationAdmission(
        ctxFor({
          sessions: Array.from({ length: MAX_ANON_PER_DAY }, (_, index) =>
            sessionDoc({
              clientIpHash: 'ip_hash',
              createdAt: now - RATE_WINDOW_MS - 1000 - index,
            }),
          ),
        }),
        {
          clientIpHash: 'ip_hash',
          now,
          disableLimits: false,
        },
      ),
    ).rejects.toMatchObject({
      data: {
        code: 'ANON_DAILY_LIMIT_REACHED',
        message:
          'Anonymous daily quota exhausted. Share on social media for +1 free generation.',
      },
    })
  })

  it('does not count draft sessions toward anonymous daily quota', async () => {
    const now = Date.now()
    // MAX_ANON_PER_DAY drafts (which would normally exhaust the daily quota)
    // plus one real, non-draft session that already consumed quota.
    const drafts = Array.from({ length: MAX_ANON_PER_DAY }, (_, index) =>
      sessionDoc({
        clientIpHash: 'ip_hash',
        createdAt: now - RATE_WINDOW_MS - 1000 - index,
        isDraft: true,
      }),
    )
    const realSession = sessionDoc({
      clientIpHash: 'ip_hash',
      createdAt: now - RATE_WINDOW_MS - 2000,
    })

    await expect(
      loadGenerationAdmission(ctxFor({ sessions: [...drafts, realSession] }), {
        clientIpHash: 'ip_hash',
        now,
        disableLimits: false,
      }),
    ).resolves.toEqual({
      quotaLimit: MAX_ANON_PER_MONTH,
      quotaCount: 1,
      remaining: MAX_ANON_PER_MONTH - 1 - 1,
    })
  })

  it('allows anon 3rd generation when share bonus is claimed', async () => {
    const now = Date.now()
    const today = new Date(now).toISOString().slice(0, 10)

    await expect(
      loadGenerationAdmission(
        ctxFor({
          sessions: Array.from({ length: MAX_ANON_PER_DAY }, (_, index) =>
            sessionDoc({
              clientIpHash: 'ip_hash',
              createdAt: now - RATE_WINDOW_MS - 1000 - index,
            }),
          ),
          shareBonuses: [{ clientIpHash: 'ip_hash', date: today }],
        }),
        {
          clientIpHash: 'ip_hash',
          now,
          disableLimits: false,
        },
      ),
    ).resolves.toEqual({
      quotaLimit: MAX_ANON_PER_MONTH,
      quotaCount: MAX_ANON_PER_DAY,
      remaining: MAX_ANON_PER_MONTH - MAX_ANON_PER_DAY - 1,
    })
  })

  it('rejects anon after bonus used with ANON_DAILY_EXHAUSTED', async () => {
    const now = Date.now()
    const today = new Date(now).toISOString().slice(0, 10)

    await expect(
      loadGenerationAdmission(
        ctxFor({
          sessions: Array.from(
            { length: MAX_ANON_PER_DAY_WITH_BONUS },
            (_, index) =>
              sessionDoc({
                clientIpHash: 'ip_hash',
                createdAt: now - RATE_WINDOW_MS - 1000 - index,
              }),
          ),
          shareBonuses: [{ clientIpHash: 'ip_hash', date: today }],
        }),
        {
          clientIpHash: 'ip_hash',
          now,
          disableLimits: false,
        },
      ),
    ).rejects.toMatchObject({
      data: {
        code: 'ANON_DAILY_EXHAUSTED',
        message:
          'Anonymous daily quota exhausted. Sign in to get 2 more free generations.',
      },
    })
  })

  it('requires a server IP bucket for anonymous generation', async () => {
    await expect(
      loadGenerationAdmission(ctxFor({ sessions: [] }), {
        anonymousClientIdHash: 'anon_hash',
        now: Date.now(),
        disableLimits: false,
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'CLIENT_IP_REQUIRED',
      },
    })
  })

  it('uses the server IP bucket for anonymous admission', async () => {
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

  it('bypasses rate limit and quota when isAdmin is true', async () => {
    const now = Date.now()

    await expect(
      loadGenerationAdmission(
        ctxFor({
          sessions: Array.from(
            { length: MAX_FREE_PER_MONTH + SHORT_WINDOW_LIMIT },
            (_, index) =>
              sessionDoc({
                userId: 'user_admin',
                createdAt: now - index,
              }),
          ),
        }),
        {
          userId: 'user_admin',
          now,
          disableLimits: false,
          isAdmin: true,
        },
      ),
    ).resolves.toMatchObject({
      quotaLimit: MAX_FREE_PER_MONTH,
      quotaCount: MAX_FREE_PER_MONTH + SHORT_WINDOW_LIMIT,
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
        clientIpHash: 'ip_hash_create',
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

  it('schedules a one-shot draft cleanup when creating a draft session', async () => {
    vi.stubEnv('OPENUI_HOME_MODEL', 'gemini-2.5-flash')
    vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key')
    vi.stubEnv('DISABLE_LIMIT', 'true')
    const references = createReferences()
    const { ctx, inserted, runAfter } = createMutationCtxFor()

    await createGenerationSession(
      ctx,
      {
        prompt: 'Build a speculative draft site',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'workspace-draft-schedule',
        anonymousClientId: 'anon-draft-client',
        clientIpHash: 'ip_hash_draft',
        isDraft: true,
      },
      references,
    )

    const session = inserted.find((row) => row.table === 'sessions')
    expect(session?.value).toMatchObject({ isDraft: true })

    expect(runAfter).toHaveBeenCalledWith(
      DRAFT_SESSION_TTL_MS,
      references.deleteDraftSessionIfStillDraft,
      { sessionId: session?.id },
    )
  })

  it('does not schedule draft cleanup for a real (non-draft) submission', async () => {
    vi.stubEnv('OPENUI_HOME_MODEL', 'gemini-2.5-flash')
    vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key')
    vi.stubEnv('DISABLE_LIMIT', 'true')
    const references = createReferences()
    const { ctx, runAfter } = createMutationCtxFor()

    await createGenerationSession(
      ctx,
      {
        prompt: 'Build a real submitted site',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'workspace-real-no-schedule',
        anonymousClientId: 'anon-real-client',
        clientIpHash: 'ip_hash_real',
      },
      references,
    )

    expect(runAfter).not.toHaveBeenCalledWith(
      DRAFT_SESSION_TTL_MS,
      references.deleteDraftSessionIfStillDraft,
      expect.anything(),
    )
  })

  it('stores the authenticated owner email for generated session metadata', async () => {
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
        clientIpHash: 'ip_hash_config_failure',
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

  // ---------------------------------------------------------------------------
  // Union (IP + userId) quota counting — blocks both the multi-account-on-same-
  // IP bypass and the multi-device-same-account bypass.
  // ---------------------------------------------------------------------------

  it('counts the union of IP and userId buckets for authenticated users', async () => {
    const now = Date.now()
    // 2 anon sessions on IP-A (no userId) + 2 auth sessions for user_1 on IP-A.
    // Union = 4 distinct sessions. Free-auth daily limit is 5, so this passes
    // with 1 remaining in the daily window.
    const sessions = [
      sessionDoc({
        _id: 'anon_1' as Doc<'sessions'>['_id'],
        _creationTime: 4,
        clientIpHash: 'ip_a',
        createdAt: now - 1000,
      }),
      sessionDoc({
        _id: 'anon_2' as Doc<'sessions'>['_id'],
        _creationTime: 3,
        clientIpHash: 'ip_a',
        createdAt: now - 2000,
      }),
      sessionDoc({
        _id: 'auth_1' as Doc<'sessions'>['_id'],
        _creationTime: 2,
        userId: 'user_1',
        clientIpHash: 'ip_a',
        createdAt: now - 3000,
      }),
      sessionDoc({
        _id: 'auth_2' as Doc<'sessions'>['_id'],
        _creationTime: 1,
        userId: 'user_1',
        clientIpHash: 'ip_a',
        createdAt: now - 4000,
      }),
    ]

    await expect(
      loadGenerationAdmission(ctxFor({ sessions }), {
        userId: 'user_1',
        clientIpHash: 'ip_a',
        now,
        disableLimits: false,
      }),
    ).resolves.toMatchObject({
      quotaCount: 4,
    })
  })

  it('dedupes sessions that appear in both the IP and userId buckets', async () => {
    const now = Date.now()
    // A session owned by user_1 on IP-A appears in BOTH the by_clientIpHash and
    // by_userId query results. It must be counted once, not twice.
    const shared = sessionDoc({
      _id: 'shared' as Doc<'sessions'>['_id'],
      _creationTime: 1,
      userId: 'user_1',
      clientIpHash: 'ip_a',
      createdAt: now - 1000,
    })

    await expect(
      loadGenerationAdmission(ctxFor({ sessions: [shared] }), {
        userId: 'user_1',
        clientIpHash: 'ip_a',
        now,
        disableLimits: false,
      }),
    ).resolves.toMatchObject({
      quotaCount: 1,
    })
  })

  it('blocks multi-account bypass: a second account on the same IP inherits the IP bucket', async () => {
    const now = Date.now()
    // user_1 has already hit the free-auth daily limit (5 sessions on IP-A).
    // user_2 signs in on the same IP — the union of IP-A (5) + user_2 (0) = 5,
    // so user_2 is also blocked. This prevents creating a fresh account to get
    // more quota on the same network.
    const sessions = Array.from({ length: MAX_FREE_AUTH_PER_DAY }, (_, index) =>
      sessionDoc({
        _id: `user1_${index}` as Doc<'sessions'>['_id'],
        _creationTime: MAX_FREE_AUTH_PER_DAY - index,
        userId: 'user_1',
        clientIpHash: 'ip_a',
        createdAt: now - RATE_WINDOW_MS - 1000 - index,
      }),
    )

    await expect(
      loadGenerationAdmission(ctxFor({ sessions }), {
        userId: 'user_2',
        clientIpHash: 'ip_a',
        now,
        disableLimits: false,
      }),
    ).rejects.toMatchObject({
      data: { code: 'AUTH_DAILY_LIMIT_REACHED' },
    })
  })

  it('blocks multi-device bypass: anon sessions on IP-B count against the userId after login on IP-B', async () => {
    const now = Date.now()
    // 3 anon sessions on IP-B (phone), then the user logs in on IP-B. The union
    // of IP-B (3) + user_1 (0) = 3, so the auth daily limit of 5 allows 2 more.
    // After 2 more auth sessions, the union = 5 and the next is blocked.
    const anonSessions = Array.from({ length: 3 }, (_, index) =>
      sessionDoc({
        _id: `anon_b_${index}` as Doc<'sessions'>['_id'],
        _creationTime: 10 - index,
        clientIpHash: 'ip_b',
        createdAt: now - RATE_WINDOW_MS - 1000 - index,
      }),
    )

    // 3 anon on IP-B → login → 2 more auth on IP-B = 5 total → next blocked.
    const authSessions = Array.from({ length: 2 }, (_, index) =>
      sessionDoc({
        _id: `auth_b_${index}` as Doc<'sessions'>['_id'],
        _creationTime: 5 - index,
        userId: 'user_1',
        clientIpHash: 'ip_b',
        createdAt: now - RATE_WINDOW_MS - 5000 - index,
      }),
    )

    await expect(
      loadGenerationAdmission(
        ctxFor({ sessions: [...anonSessions, ...authSessions] }),
        {
          userId: 'user_1',
          clientIpHash: 'ip_b',
          now,
          disableLimits: false,
        },
      ),
    ).rejects.toMatchObject({
      data: { code: 'AUTH_DAILY_LIMIT_REACHED' },
    })
  })

  it('monthly union cap blocks across devices after the daily window resets', async () => {
    const now = Date.now()
    // 5 sessions on IP-A (laptop) 2 days ago + 5 sessions on IP-B (phone) 1 day
    // ago, all owned by user_1. Daily windows have reset, but the monthly union
    // = 10 = MAX_FREE_PER_MONTH, so the next is blocked by QUOTA_EXCEEDED.
    const laptopSessions = Array.from({ length: 5 }, (_, index) =>
      sessionDoc({
        _id: `laptop_${index}` as Doc<'sessions'>['_id'],
        _creationTime: 20 - index,
        userId: 'user_1',
        clientIpHash: 'ip_a',
        createdAt: now - 2 * 24 * 60 * 60 * 1000 - index,
      }),
    )
    const phoneSessions = Array.from({ length: 5 }, (_, index) =>
      sessionDoc({
        _id: `phone_${index}` as Doc<'sessions'>['_id'],
        _creationTime: 10 - index,
        userId: 'user_1',
        clientIpHash: 'ip_b',
        createdAt: now - 24 * 60 * 60 * 1000 - index,
      }),
    )

    await expect(
      loadGenerationAdmission(
        ctxFor({ sessions: [...laptopSessions, ...phoneSessions] }),
        {
          userId: 'user_1',
          clientIpHash: 'ip_c',
          now,
          disableLimits: false,
        },
      ),
    ).rejects.toMatchObject({
      data: { code: 'QUOTA_EXCEEDED' },
    })
  })

  it('stores clientIpHash on authenticated sessions, not just anonymous ones', async () => {
    vi.stubEnv('OPENUI_HOME_MODEL', 'gemini-2.5-flash')
    vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key')
    vi.stubEnv('DISABLE_LIMIT', 'true')
    const references = createReferences()
    const { ctx, inserted } = createMutationCtxFor({}, {
      subject: 'user_1',
      tokenIdentifier: 'clerk|user_1',
      email: 'user@example.com',
    } as TestIdentity)

    await createGenerationSession(
      ctx,
      {
        prompt: 'Build an authed site',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'workspace-authed-ip',
        clientIpHash: 'ip_hash_authed',
      },
      references,
    )

    const session = inserted.find((row) => row.table === 'sessions')
    expect(session?.value).toMatchObject({
      userId: 'clerk|user_1',
      clientIpHash: 'ip_hash_authed',
    })
  })
})
