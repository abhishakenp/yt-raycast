import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

test('recordUsageMetric stores metric data', async () => {
  const t = convexTest(schema, modules)

  const sessionId = await t.runMutation(api.sessions.create, {
    prompt: 'Test site',
    anonymousClientIdHash: 'test-hash',
  })

  const result = await t.runMutation(internal.sessions.recordUsageMetric, {
    sessionId,
    eventType: 'generation',
    elapsedMs: 5000,
    cost: 0.05,
    provider: 'groq',
    userId: 'user-123',
  })

  expect(result.recorded).toBe(true)
})

test('getUsageMetrics aggregates session metrics', async () => {
  const t = convexTest(schema, modules)

  const sessionId = await t.runMutation(api.sessions.create, {
    prompt: 'Test site',
    anonymousClientIdHash: 'test-hash',
  })

  await t.runMutation(internal.sessions.recordUsageMetric, {
    sessionId,
    eventType: 'generation',
    elapsedMs: 5000,
    cost: 0.05,
    provider: 'groq',
    userId: 'user-123',
  })

  await t.runMutation(internal.sessions.recordUsageMetric, {
    sessionId,
    eventType: 'generation',
    elapsedMs: 3000,
    cost: 0.03,
    provider: 'groq',
    userId: 'user-123',
  })

  const metrics = await t.runQuery(api.sessions.getUsageMetrics, { sessionId })

  expect(metrics.totalCost).toBe(0.08)
  expect(metrics.totalElapsedMs).toBe(8000)
  expect(metrics.count).toBe(2)
})

test('getUserUsageMetrics filters by time', async () => {
  const t = convexTest(schema, modules)

  const sessionId = await t.runMutation(api.sessions.create, {
    prompt: 'Test site',
    anonymousClientIdHash: 'test-hash',
  })

  const now = Date.now()

  await t.runMutation(internal.sessions.recordUsageMetric, {
    sessionId,
    eventType: 'generation',
    elapsedMs: 5000,
    cost: 0.05,
    provider: 'groq',
    userId: 'user-123',
  })

  const metrics = await t.runQuery(api.sessions.getUserUsageMetrics, {
    userId: 'user-123',
    since: now - 10000,
  })

  expect(metrics.count).toBe(1)
})
