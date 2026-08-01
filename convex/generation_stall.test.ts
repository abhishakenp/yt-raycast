import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'

import { internal } from './_generated/api'
import { GENERATION_STALL_TTL_MS } from './lib/session_generation_progress_helpers'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

/**
 * The generation engine only writes a terminal status (`preview_ready` /
 * `failed`) from inside the Node process that owns the run. Redeploying the
 * web container kills that process mid-run, so without a reaper the session
 * stays `streaming` forever: the dashboard shows the skeleton indefinitely,
 * the user's quota is already spent, and retry is refused. These tests cover
 * the scheduled `failIfStillStreaming` reaper that closes that hole.
 */

type SeedOverrides = {
  status?: 'created' | 'queued' | 'streaming' | 'preview_ready' | 'failed'
  generationStartedAt?: number
  previewVersion?: number
}

async function seedSession(
  t: ReturnType<typeof convexTest>,
  overrides: SeedOverrides = {},
) {
  return await t.run(async (ctx) => {
    const sessionId = await ctx.db.insert('sessions', {
      prompt: 'Build a landing page for a bakery',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: 'workspace_generation_stall',
      status: overrides.status ?? 'queued',
      previewVersion: overrides.previewVersion ?? 0,
      generationStartedAt: overrides.generationStartedAt,
      createdAt: 1,
      updatedAt: 1,
    })

    await ctx.db.insert('tasks', {
      sessionId,
      taskKey: 'homepage',
      title: 'Generate homepage',
      status: 'pending',
      order: 0,
      createdAt: 1,
      updatedAt: 1,
    })

    return sessionId
  })
}

test('starting a generation arms a stall reaper carrying the run timestamp', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await seedSession(t)

  await t.mutation(internal.sessions.markGenerationStarted, { sessionId })

  const session = await t.run((ctx) => ctx.db.get(sessionId))
  expect(session?.status).toBe('streaming')
  expect(typeof session?.generationStartedAt).toBe('number')

  const scheduled = await t.run((ctx) =>
    ctx.db.system.query('_scheduled_functions').take(20),
  )
  expect(scheduled).toContainEqual(
    expect.objectContaining({
      name: 'sessions:failIfStillStreaming',
      state: expect.objectContaining({ kind: 'pending' }),
      args: [{ sessionId, startedAt: session?.generationStartedAt }],
    }),
  )

  // The engine budget is 90s x 2 attempts; the reaper must leave headroom so a
  // slow-but-live run is never killed.
  const reaper = scheduled.find(
    (job) => job.name === 'sessions:failIfStillStreaming',
  )
  expect(reaper).toBeDefined()
  expect(GENERATION_STALL_TTL_MS).toBeGreaterThan(90_000 * 2)
})

test('a session stranded in streaming is failed with GENERATION_STALLED and a visible message', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await seedSession(t)

  await t.mutation(internal.sessions.markGenerationStarted, { sessionId })
  const started = await t.run((ctx) => ctx.db.get(sessionId))
  const startedAt = started?.generationStartedAt ?? 0

  // The owning Node process is gone (container redeployed); the scheduler
  // fires the reaper that was armed when the run started.
  await t.mutation(internal.sessions.failIfStillStreaming, {
    sessionId,
    startedAt,
  })

  const failed = await t.run((ctx) => ctx.db.get(sessionId))
  expect(failed?.status).toBe('failed')
  expect(failed?.errorCode).toBe('GENERATION_STALLED')
  // Dashboard renders `errorMessage ?? errorCode`, so it must be human-readable.
  expect(failed?.errorMessage).toBeTruthy()
  expect(failed?.errorMessage).not.toBe(failed?.errorCode)

  // The homepage task must stop showing as in-progress.
  const task = await t.run((ctx) =>
    ctx.db
      .query('tasks')
      .withIndex('by_sessionId_taskKey', (index) =>
        index.eq('sessionId', sessionId).eq('taskKey', 'homepage'),
      )
      .first(),
  )
  expect(task?.status).toBe('failed')

  // A failure event is emitted so the event stream reflects the terminal state.
  const events = await t.run((ctx) =>
    ctx.db
      .query('generationEvents')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', sessionId),
      )
      .collect(),
  )
  expect(events.map((event) => event.eventType)).toContain('generation_failed')
})

test('the reaper never touches a generation that completed before it fired', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await seedSession(t)

  await t.mutation(internal.sessions.markGenerationStarted, { sessionId })
  const started = await t.run((ctx) => ctx.db.get(sessionId))
  const startedAt = started?.generationStartedAt ?? 0

  // The run finishes normally, well before the TTL elapses.
  await t.mutation(internal.sessions.completeGenerationInternal, {
    sessionId,
    openUiSource: 'root = Text("Bakery homepage")',
    siteSpecJson: '{"title":"Bakery"}',
    tasks: [{ id: 'home.openui', label: 'Render home', status: 'DONE' }],
  })

  const completed = await t.run((ctx) => ctx.db.get(sessionId))
  expect(completed?.status).toBe('preview_ready')

  // The stale reaper still fires — it must be a no-op.
  await t.mutation(internal.sessions.failIfStillStreaming, {
    sessionId,
    startedAt,
  })

  const after = await t.run((ctx) => ctx.db.get(sessionId))
  expect(after?.status).toBe('preview_ready')
  expect(after?.errorCode).toBeUndefined()
  expect(after?.previewVersion).toBe(completed?.previewVersion)
})

test('an older reaper never clobbers a newer generation that is legitimately running', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await seedSession(t)

  // First run starts, then strands.
  await t.mutation(internal.sessions.markGenerationStarted, { sessionId })
  const firstRun = await t.run((ctx) => ctx.db.get(sessionId))
  const firstStartedAt = firstRun?.generationStartedAt ?? 0

  // Its reaper fires and fails the session.
  await t.mutation(internal.sessions.failIfStillStreaming, {
    sessionId,
    startedAt: firstStartedAt,
  })
  expect(await t.run((ctx) => ctx.db.get(sessionId))).toMatchObject({
    status: 'failed',
  })

  // The user retries; a second run takes ownership of the session.
  await new Promise((resolve) => setTimeout(resolve, 2))
  await t.mutation(internal.sessions.markGenerationStarted, { sessionId })
  const secondRun = await t.run((ctx) => ctx.db.get(sessionId))
  const secondStartedAt = secondRun?.generationStartedAt ?? 0

  expect(secondRun?.status).toBe('streaming')
  expect(secondStartedAt).not.toBe(firstStartedAt)

  // The FIRST run's reaper fires late. It must not kill the live second run.
  await t.mutation(internal.sessions.failIfStillStreaming, {
    sessionId,
    startedAt: firstStartedAt,
  })

  const stillRunning = await t.run((ctx) => ctx.db.get(sessionId))
  expect(stillRunning?.status).toBe('streaming')
  expect(stillRunning?.errorCode).toBeUndefined()
  expect(stillRunning?.generationStartedAt).toBe(secondStartedAt)
})

test('a session failed by the reaper can be retried end to end', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await seedSession(t)

  await t.mutation(internal.sessions.markGenerationStarted, { sessionId })
  const firstRun = await t.run((ctx) => ctx.db.get(sessionId))
  await t.mutation(internal.sessions.failIfStillStreaming, {
    sessionId,
    startedAt: firstRun?.generationStartedAt ?? 0,
  })

  // Retry: the route reports `skipped` unless the mutation actually starts the
  // run, which is exactly what stranded sessions used to hit.
  await new Promise((resolve) => setTimeout(resolve, 2))
  const restarted = await t.mutation(internal.sessions.markGenerationStarted, {
    sessionId,
  })
  expect(restarted).toEqual({ started: true })

  const retried = await t.run((ctx) => ctx.db.get(sessionId))
  expect(retried?.status).toBe('streaming')
  // The previous stall failure must not linger, or the dashboard would keep
  // rendering the failure state over a live run.
  expect(retried?.errorCode).toBeUndefined()
  expect(retried?.errorMessage).toBeUndefined()

  // And the retry completes normally.
  await t.mutation(internal.sessions.completeGenerationInternal, {
    sessionId,
    openUiSource: 'root = Text("Bakery homepage")',
    tasks: [{ id: 'home.openui', label: 'Render home', status: 'DONE' }],
  })

  const completed = await t.run((ctx) => ctx.db.get(sessionId))
  expect(completed?.status).toBe('preview_ready')
  expect(completed?.previewVersion).toBe(1)
})
