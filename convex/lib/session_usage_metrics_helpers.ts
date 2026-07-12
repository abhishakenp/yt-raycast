import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

type UsageMetricsMutationCtx = Pick<MutationCtx, 'db'>
type UsageMetricsQueryCtx = Pick<QueryCtx, 'db'>

export type RecordUsageMetricInput = {
  sessionId: Id<'sessions'>
  eventType: string
  elapsedMs: number
  cost: number
  provider: string
  userId?: string
  anonymousClientIdHash?: string
}

export async function recordSessionUsageMetric(
  ctx: UsageMetricsMutationCtx,
  args: RecordUsageMetricInput,
  timestamp = Date.now(),
) {
  await ctx.db.insert('usageMetrics', {
    sessionId: args.sessionId,
    eventType: args.eventType,
    timestamp,
    elapsedMs: args.elapsedMs,
    cost: args.cost,
    provider: args.provider,
    userId: args.userId,
    anonymousClientIdHash: args.anonymousClientIdHash,
  })

  return { recorded: true }
}

export function summarizeUsageMetrics(metrics: Doc<'usageMetrics'>[]) {
  return {
    totalCost: metrics.reduce((sum, metric) => sum + metric.cost, 0),
    totalElapsedMs: metrics.reduce((sum, metric) => sum + metric.elapsedMs, 0),
    count: metrics.length,
    byProvider: metrics.reduce(
      (acc, metric) => {
        acc[metric.provider] = (acc[metric.provider] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
    byEventType: metrics.reduce(
      (acc, metric) => {
        acc[metric.eventType] = (acc[metric.eventType] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  }
}

export async function loadSessionUsageMetrics(
  ctx: UsageMetricsQueryCtx,
  sessionId: Id<'sessions'>,
) {
  const metrics = await ctx.db
    .query('usageMetrics')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .take(500)

  return summarizeUsageMetrics(metrics)
}

export async function loadUserUsageMetrics(
  ctx: UsageMetricsQueryCtx,
  args: { userId: string; since?: number },
) {
  const userMetrics = await ctx.db
    .query('usageMetrics')
    .withIndex('by_userId', (index) => index.eq('userId', args.userId))
    .order('desc')
    .take(500)
  const since = args.since
  const metrics =
    since === undefined
      ? userMetrics
      : userMetrics.filter((metric) => metric.timestamp >= since)

  return summarizeUsageMetrics(metrics)
}
