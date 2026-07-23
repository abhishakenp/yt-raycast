import { convexTest } from 'convex-test'
import { afterEach, expect, test, vi } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

let activeTest: ReturnType<typeof convexTest> | null = null

const usageMetricsTest = () => {
  const t = convexTest(schema, modules)
  activeTest = t
  return t
}

function requireEventStream<T>(stream: T | null): T {
  if (stream === null) throw new Error('Expected event stream')
  return stream
}

function createTestSession(
  t: ReturnType<typeof convexTest>,
  prompt = 'Test site',
) {
  return t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_test',
    anonymousClientId: `anon-${prompt}`,
    clientIpHash: 'test_ip_bucket',
  })
}

afterEach(async () => {
  vi.unstubAllGlobals()
  if (activeTest) {
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 10))
      await activeTest.finishInProgressScheduledFunctions()
    }
    activeTest = null
  }
})

test('recordUsageMetric stores metric data', async () => {
  const t = usageMetricsTest()

  const { sessionId } = await createTestSession(t)

  const result = await t.mutation(internal.sessions.recordUsageMetric, {
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
  const t = usageMetricsTest()

  const { sessionId } = await createTestSession(t)

  await t.mutation(internal.sessions.recordUsageMetric, {
    sessionId,
    eventType: 'generation',
    elapsedMs: 5000,
    cost: 0.05,
    provider: 'groq',
    userId: 'user-123',
  })

  await t.mutation(internal.sessions.recordUsageMetric, {
    sessionId,
    eventType: 'generation',
    elapsedMs: 3000,
    cost: 0.03,
    provider: 'groq',
    userId: 'user-123',
  })

  const metrics = await t.query(api.sessions.getUsageMetrics, { sessionId })

  expect(metrics.totalCost).toBe(0.08)
  expect(metrics.totalElapsedMs).toBe(8000)
  expect(metrics.count).toBe(2)
})

test('getUserUsageMetrics filters by time', async () => {
  const t = usageMetricsTest()

  const { sessionId } = await createTestSession(t)

  const now = Date.now()

  await t.mutation(internal.sessions.recordUsageMetric, {
    sessionId,
    eventType: 'generation',
    elapsedMs: 5000,
    cost: 0.05,
    provider: 'groq',
    userId: 'user-123',
  })

  const metrics = await t.query(api.sessions.getUserUsageMetrics, {
    userId: 'user-123',
    since: now - 10000,
  })

  expect(metrics.count).toBe(1)
})

test('recordOperationalEvent stores completed generation metrics and observable event metadata', async () => {
  const t = usageMetricsTest()

  const { sessionId } = await createTestSession(t)

  const result = await t.mutation(internal.sessions.recordOperationalEvent, {
    sessionId,
    eventType: 'run_completed',
    message: 'Generation completed',
    elapsedMs: 9123,
    cost: 0.17,
    provider: 'groq',
    cacheHit: false,
    userId: 'user-123',
  })

  const metrics = await t.query(api.sessions.getUsageMetrics, { sessionId })
  const stream = requireEventStream(
    await t.query(api.sessions.getEventStream, {
      lookup: sessionId,
    }),
  )

  expect(result).toEqual({
    recorded: true,
    usageRecorded: true,
    alertable: true,
  })
  expect(metrics.totalCost).toBe(0.17)
  expect(metrics.totalElapsedMs).toBe(9123)
  expect(metrics.byEventType.run_completed).toBe(1)
  expect(stream.events.at(-1)).toMatchObject({
    eventType: 'run_completed',
    elapsedMs: 9123,
    cost: 0.17,
    provider: 'groq',
    cacheHit: false,
  })
})

test('completeGeneration records runtime usage metrics and a replayable completion event', async () => {
  const t = usageMetricsTest()

  const { sessionId } = await createTestSession(t)

  await t.action(internal.sessions.completeGeneration, {
    sessionId,
    html: '<html><body><h1>Done</h1></body></html>',
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 4321,
  })

  const metrics = await t.query(api.sessions.getUsageMetrics, { sessionId })
  const stream = requireEventStream(
    await t.query(api.sessions.getEventStream, {
      lookup: sessionId,
    }),
  )
  const session = await t.query(api.sessions.getSessionApiResponse, {
    lookup: sessionId,
  })

  expect(metrics).toMatchObject({
    totalCost: 0,
    totalElapsedMs: 4321,
    count: 1,
    byProvider: { 'ship-fast-engine': 1 },
    byEventType: { run_completed: 1 },
  })
  expect(stream.events.map((event) => event.eventType)).toContain(
    'run_completed',
  )
  expect(
    stream.events.find((event) => event.eventType === 'run_completed'),
  ).toMatchObject({
    elapsedMs: 4321,
    cost: 0,
    provider: 'ship-fast-engine',
    cacheHit: false,
  })
  expect(session?.elapsed).toBe(4321)
  expect(session?.cost).toBe(0)
})

test('duplicate public prompt cache hits record replayable alert metadata', async () => {
  const t = usageMetricsTest()
  const prompt = 'Reusable public cache prompt'

  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_cache_first',
    clientIpHash: 'test_ip_bucket',
  })

  await t.action(internal.sessions.completeGeneration, {
    sessionId,
    html: '<html><body><h1>Cached</h1></body></html>',
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  })

  const cached = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_cache_second',
    clientIpHash: 'test_ip_bucket',
  })

  const metrics = await t.query(api.sessions.getUsageMetrics, { sessionId })
  const stream = requireEventStream(
    await t.query(api.sessions.getEventStream, {
      lookup: sessionId,
    }),
  )
  const cacheHit = stream.events.find(
    (event) => event.eventType === 'cache_hit',
  )

  expect(cached).toMatchObject({ sessionId, cached: true })
  expect(cacheHit).toMatchObject({
    eventType: 'cache_hit',
    cacheHit: true,
    provider: 'prompt-cache',
  })
  expect(metrics.byEventType.cache_hit).toBe(1)
  expect(metrics.byProvider['prompt-cache']).toBe(1)
})

test('recordOperationalEvent makes failure and quota-limit events replayable without usage metrics', async () => {
  const t = usageMetricsTest()

  const { sessionId } = await createTestSession(t)

  const failure = await t.mutation(internal.sessions.recordOperationalEvent, {
    sessionId,
    eventType: 'generation_failed',
    message: 'Generation failed',
    error: 'provider_timeout',
  })
  const quota = await t.mutation(internal.sessions.recordOperationalEvent, {
    sessionId,
    eventType: 'quota_limited',
    message: 'Anonymous daily quota exceeded',
    quotaHit: true,
  })

  const metrics = await t.query(api.sessions.getUsageMetrics, { sessionId })
  const stream = requireEventStream(
    await t.query(api.sessions.getEventStream, {
      lookup: sessionId,
    }),
  )

  expect(failure).toMatchObject({ usageRecorded: false, alertable: true })
  expect(quota).toMatchObject({ usageRecorded: false, alertable: true })
  expect(metrics.count).toBe(0)
  expect(stream.events.map((event) => event.eventType)).toContain(
    'generation_failed',
  )
  expect(stream.events.map((event) => event.eventType)).toContain(
    'quota_limited',
  )
  expect(
    stream.events.find((event) => event.eventType === 'quota_limited'),
  ).toMatchObject({ quotaHit: true })
})

test('failGeneration records a structured replayable failure event', async () => {
  const previousGroq = process.env.GROQ_API_KEY
  process.env.GROQ_API_KEY = 'test-groq-key'
  const t = usageMetricsTest()

  try {
    const { sessionId } = await createTestSession(t)

    await t.mutation(internal.sessions.failGeneration, {
      sessionId,
      message: 'provider_timeout',
      elapsed: 321,
    })

    const metrics = await t.query(api.sessions.getUsageMetrics, { sessionId })
    const stream = requireEventStream(
      await t.query(api.sessions.getEventStream, {
        lookup: sessionId,
      }),
    )
    const session = await t.query(api.sessions.getSessionApiResponse, {
      lookup: sessionId,
    })

    expect(metrics.count).toBe(0)
    expect(stream.events.map((event) => event.eventType)).toContain(
      'generation_failed',
    )
    expect(
      stream.events.find((event) => event.eventType === 'generation_failed'),
    ).toMatchObject({
      message: 'provider_timeout',
      error: 'provider_timeout',
      elapsedMs: 321,
    })
    expect(session?.status).toBe('failed')
    expect(session?.elapsed).toBe(321)
  } finally {
    if (previousGroq === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousGroq
  }
})

test('notification adapters skip without credentials and send only when explicitly configured', async () => {
  const t = usageMetricsTest()
  const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)

  await expect(
    t.action(internal.sessions.sendSlackNotification, {
      message: 'Quota limit reached',
    }),
  ).resolves.toEqual({ sent: false, reason: 'no_webhook_url' })
  await expect(
    t.action(internal.sessions.sendTelegramNotification, {
      message: 'Quota limit reached',
    }),
  ).resolves.toEqual({ sent: false, reason: 'missing_credentials' })

  await expect(
    t.action(internal.sessions.sendSlackNotification, {
      message: 'Quota limit reached',
      webhookUrl: 'https://hooks.slack.test/services/ship-fast',
    }),
  ).resolves.toEqual({ sent: true })
  await expect(
    t.action(internal.sessions.sendTelegramNotification, {
      message: 'Quota limit reached',
      botToken: 'telegram-token',
      chatId: 'chat-123',
    }),
  ).resolves.toEqual({ sent: true })

  expect(fetchMock).toHaveBeenCalledTimes(2)
  const fetchCalls = fetchMock.mock.calls as unknown as Array<
    [input: RequestInfo | URL, init?: RequestInit]
  >
  const slackCall = fetchCalls.at(0)
  const telegramCall = fetchCalls.at(1)

  expect(slackCall?.[0]).toBe('https://hooks.slack.test/services/ship-fast')
  expect(String(telegramCall?.[0])).toContain(
    'https://api.telegram.org/bottelegram-token/sendMessage',
  )
})
