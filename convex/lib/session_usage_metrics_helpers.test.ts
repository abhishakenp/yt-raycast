import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  loadSessionUsageMetrics,
  loadUserUsageMetrics,
  recordSessionUsageMetric,
  summarizeUsageMetrics,
} from './session_usage_metrics_helpers'

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

  it('keeps public usage metric functions delegated to usage helpers', () => {
    const source = readFileSync('convex/sessions.ts', 'utf8')

    expect(source).toContain('recordSessionUsageMetric(ctx, args)')
    expect(source).toContain('loadSessionUsageMetrics(ctx, args.sessionId)')
    expect(source).toContain('loadUserUsageMetrics(ctx, args)')
    expect(source).not.toContain(
      "export const getUsageMetrics = query({\n  args: {\n    sessionId: v.id('sessions'),\n  },\n  handler: async",
    )
  })
})
