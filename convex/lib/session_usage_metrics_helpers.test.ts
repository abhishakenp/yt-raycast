import { describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  loadSessionUsageMetrics,
  loadUserUsageMetrics,
  recordSessionUsageMetric,
  summarizeUsageMetrics,
} from './session_usage_metrics_helpers'

type MutationHandler<Args> = (ctx: MutationCtx, args: Args) => Promise<unknown>
type QueryHandler<Args> = (ctx: QueryCtx, args: Args) => Promise<unknown>

type RecordUsageMetricArgs = {
  sessionId: Id<'sessions'>
  eventType: string
  elapsedMs: number
  cost: number
  provider: string
  userId?: string
  anonymousClientIdHash?: string
}

type SessionIdArgs = {
  sessionId: Id<'sessions'>
}

type UserUsageMetricsArgs = {
  userId: string
  since?: number
}

type UsageMetricRecord = Doc<'usageMetrics'>
type ReadLog = {
  table: 'usageMetrics'
  indexName?: string
  direction?: 'asc' | 'desc'
  limit: number
  filters: Record<string, unknown>
}

const sessionId = 'usage_session' as Id<'sessions'>
const otherSessionId = 'usage_other_session' as Id<'sessions'>

const usageMetricDoc = (
  overrides: Partial<UsageMetricRecord> = {},
): UsageMetricRecord => ({
  _id: 'usage_metric_1' as Id<'usageMetrics'>,
  _creationTime: 1,
  sessionId,
  eventType: 'run_completed',
  timestamp: 100,
  elapsedMs: 1000,
  cost: 0.1,
  provider: 'groq',
  userId: 'user_1',
  anonymousClientIdHash: 'anon_hash',
  ...overrides,
})

const mutationCtxForUsageMetrics = () => {
  const inserted: Array<{ table: string; value: Record<string, unknown> }> = []
  const ctx = {
    db: {
      insert: async (table: string, value: Record<string, unknown>) => {
        inserted.push({ table, value })
        return `${table}_id`
      },
    },
  } as unknown as Pick<MutationCtx, 'db'>

  return { ctx, inserted }
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
  take: (limit: number) => Promise<UsageMetricRecord[]>
}

const queryCtxForUsageMetrics = (metrics: UsageMetricRecord[]) => {
  const reads: ReadLog[] = []
  const makeQuery = (table: 'usageMetrics'): FakeQuery => {
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
        const filtered = metrics.filter((metric) => {
          if (filters.sessionId !== undefined) {
            return metric.sessionId === filters.sessionId
          }
          return metric.userId === filters.userId
        })
        if (direction === 'desc') {
          filtered.sort((a, b) => b.timestamp - a.timestamp)
        }
        return filtered.slice(0, limit)
      },
    }

    return queryApi
  }
  const ctx = {
    db: {
      query: makeQuery,
    },
  } as unknown as Pick<QueryCtx, 'db'>

  return { ctx, reads }
}

describe('session usage metrics helpers', () => {
  it('records usage metrics with an explicit timestamp', async () => {
    const { ctx, inserted } = mutationCtxForUsageMetrics()

    await expect(
      recordSessionUsageMetric(
        ctx,
        {
          sessionId,
          eventType: 'run_completed',
          elapsedMs: 4321,
          cost: 0.25,
          provider: 'groq',
          userId: 'user_1',
          anonymousClientIdHash: 'anon_hash',
        },
        123,
      ),
    ).resolves.toEqual({ recorded: true })
    expect(inserted).toEqual([
      {
        table: 'usageMetrics',
        value: {
          sessionId,
          eventType: 'run_completed',
          timestamp: 123,
          elapsedMs: 4321,
          cost: 0.25,
          provider: 'groq',
          userId: 'user_1',
          anonymousClientIdHash: 'anon_hash',
        },
      },
    ])
  })

  it('summarizes usage totals by provider and event type', () => {
    expect(
      summarizeUsageMetrics([
        usageMetricDoc({ provider: 'groq', eventType: 'run_completed' }),
        usageMetricDoc({
          _id: 'usage_metric_2' as Id<'usageMetrics'>,
          provider: 'prompt-cache',
          eventType: 'cache_hit',
          elapsedMs: 50,
          cost: 0,
        }),
        usageMetricDoc({
          _id: 'usage_metric_3' as Id<'usageMetrics'>,
          provider: 'groq',
          eventType: 'run_completed',
          elapsedMs: 150,
          cost: 0.2,
        }),
      ]),
    ).toEqual({
      totalCost: 0.30000000000000004,
      totalElapsedMs: 1200,
      count: 3,
      byProvider: {
        groq: 2,
        'prompt-cache': 1,
      },
      byEventType: {
        run_completed: 2,
        cache_hit: 1,
      },
    })
  })

  it('loads session usage metrics through a bounded indexed read', async () => {
    const matchingMetric = usageMetricDoc()
    const ignoredMetric = usageMetricDoc({
      _id: 'usage_metric_other' as Id<'usageMetrics'>,
      sessionId: otherSessionId,
    })
    const { ctx, reads } = queryCtxForUsageMetrics([
      matchingMetric,
      ignoredMetric,
    ])

    await expect(
      loadSessionUsageMetrics(ctx, sessionId),
    ).resolves.toMatchObject({
      totalCost: matchingMetric.cost,
      totalElapsedMs: matchingMetric.elapsedMs,
      count: 1,
      byProvider: { groq: 1 },
      byEventType: { run_completed: 1 },
    })
    expect(reads).toEqual([
      {
        table: 'usageMetrics',
        indexName: 'by_sessionId',
        direction: undefined,
        limit: 500,
        filters: { sessionId },
      },
    ])
  })

  it('loads user usage metrics newest first and filters by timestamp', async () => {
    const olderMetric = usageMetricDoc({
      _id: 'usage_metric_old' as Id<'usageMetrics'>,
      timestamp: 100,
      cost: 0.1,
      elapsedMs: 100,
    })
    const newerMetric = usageMetricDoc({
      _id: 'usage_metric_new' as Id<'usageMetrics'>,
      timestamp: 300,
      cost: 0.2,
      elapsedMs: 200,
    })
    const otherUserMetric = usageMetricDoc({
      _id: 'usage_metric_other_user' as Id<'usageMetrics'>,
      timestamp: 400,
      userId: 'user_2',
      cost: 0.4,
      elapsedMs: 400,
    })
    const { ctx, reads } = queryCtxForUsageMetrics([
      olderMetric,
      newerMetric,
      otherUserMetric,
    ])

    await expect(
      loadUserUsageMetrics(ctx, { userId: 'user_1', since: 200 }),
    ).resolves.toMatchObject({
      totalCost: 0.2,
      totalElapsedMs: 200,
      count: 1,
      byProvider: { groq: 1 },
      byEventType: { run_completed: 1 },
    })
    expect(reads).toEqual([
      {
        table: 'usageMetrics',
        indexName: 'by_userId',
        direction: 'desc',
        limit: 500,
        filters: { userId: 'user_1' },
      },
    ])
  })

  it('public usage metric handlers delegate to usage helpers', async () => {
    vi.resetModules()
    vi.doMock('./session_usage_metrics_helpers', () => ({
      recordSessionUsageMetric: vi.fn(async () => null),
      loadSessionUsageMetrics: vi.fn(async () => []),
      loadUserUsageMetrics: vi.fn(async () => []),
    }))
    try {
      const { recordUsageMetric, getUsageMetrics, getUserUsageMetrics } =
        await import('../sessions')
      const mockedModule = await import('./session_usage_metrics_helpers')
      const mockedRecordSessionUsageMetric = vi.mocked(
        mockedModule.recordSessionUsageMetric,
      )
      const mockedLoadSessionUsageMetrics = vi.mocked(
        mockedModule.loadSessionUsageMetrics,
      )
      const mockedLoadUserUsageMetrics = vi.mocked(
        mockedModule.loadUserUsageMetrics,
      )
      const ctx = { db: {} } as unknown as MutationCtx

      const recordArgs: RecordUsageMetricArgs = {
        sessionId: 's1' as Id<'sessions'>,
        eventType: 'run_completed',
        elapsedMs: 100,
        cost: 0.1,
        provider: 'groq',
      }
      const recordHandler =
        recordUsageMetric as unknown as MutationHandler<RecordUsageMetricArgs>
      await recordHandler(ctx, recordArgs)
      expect(mockedRecordSessionUsageMetric).toHaveBeenCalledWith(
        ctx,
        recordArgs,
      )

      const queryCtx = { db: {} } as unknown as QueryCtx
      const metricsArgs: SessionIdArgs = {
        sessionId: 's1' as Id<'sessions'>,
      }
      const getHandler =
        getUsageMetrics as unknown as QueryHandler<SessionIdArgs>
      await getHandler(queryCtx, metricsArgs)
      expect(mockedLoadSessionUsageMetrics).toHaveBeenCalledWith(
        queryCtx,
        metricsArgs.sessionId,
      )

      const userArgs: UserUsageMetricsArgs = {
        userId: 'u1',
      }
      const userHandler =
        getUserUsageMetrics as unknown as QueryHandler<UserUsageMetricsArgs>
      await userHandler(queryCtx, userArgs)
      expect(mockedLoadUserUsageMetrics).toHaveBeenCalledWith(
        queryCtx,
        userArgs,
      )
    } finally {
      vi.doUnmock('./session_usage_metrics_helpers')
      vi.resetModules()
    }
  })
})
