import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import {
  runEngineGeneration,
  type GenerationPersistence,
  type PersistCompleteGenerationInput,
  type PersistFailGenerationInput,
} from '@/features/generation/server/generation-runner'
import {
  createEngineWorkspacePath,
  type EngineTaskStatus,
} from '@/features/generation/server/engine-workspace'
import {
  createShipFastEngineAdapter,
  type RunShipFastEngine,
  type ShipFastEngineSessionEvent,
} from '@/features/generation/server/ship-fast-engine-adapter'

type EngineInput = Parameters<RunShipFastEngine>[0]

function createTempRoot(): string {
  return mkdtempSync(join(tmpdir(), 'ship-fast-generation-release-'))
}

function writeArtifacts(
  input: EngineInput,
  status: EngineTaskStatus = 'DONE',
): void {
  mkdirSync(input.workspace, { recursive: true })
  writeFileSync(
    join(input.workspace, 'site-spec.json'),
    JSON.stringify({ brand: 'Generated' }),
  )
  writeFileSync(join(input.workspace, 'home.openui'), 'export default "home"')
  writeFileSync(
    join(input.workspace, 'tasks.json'),
    JSON.stringify({
      tasks: [{ id: 'homepage', label: 'Homepage', status }],
    }),
  )
}

function createPersistenceHarness(): {
  completed: PersistCompleteGenerationInput[]
  failed: PersistFailGenerationInput[]
  persistence: GenerationPersistence
} {
  const completed: PersistCompleteGenerationInput[] = []
  const failed: PersistFailGenerationInput[] = []
  const persistence: GenerationPersistence = {
    async completeGeneration(input) {
      completed.push(input)
      return { previewVersion: 7 }
    },
    async failGeneration(input) {
      failed.push(input)
    },
  }

  return { completed, failed, persistence }
}

function baseInput(
  runAll: RunShipFastEngine,
  persistence: GenerationPersistence,
) {
  return {
    sessionId: 'generation-release-session',
    prompt: 'Build a reliable publication site',
    workspaceRoot: createTempRoot(),
    runAll,
    persistence,
  }
}

async function neverCompletes(): Promise<void> {
  await new Promise(() => undefined)
}

async function writeCompletedArtifacts(input: EngineInput): Promise<void> {
  writeArtifacts(input)
}

describe('generation runtime release hard gates', () => {
  it('settles an unresponsive engine within the generation timeout budget', async () => {
    vi.useFakeTimers()
    const { persistence } = createPersistenceHarness()

    try {
      const generation = runEngineGeneration(
        baseInput(neverCompletes, persistence),
      )
      const deadline = new Promise((resolve) => {
        setTimeout(() => resolve('deadline-expired'), 90_001)
      })
      const outcome = Promise.race([
        generation.then(() => 'generation-settled'),
        deadline,
      ])

      await vi.advanceTimersByTimeAsync(90_001)

      expect(await outcome).toBe('generation-settled')
    } finally {
      vi.useRealTimers()
    }
  })

  it('honors a pre-aborted caller signal before starting provider work', async () => {
    const { completed, failed, persistence } = createPersistenceHarness()
    const controller = new AbortController()
    const runAll = vi.fn(writeCompletedArtifacts)
    controller.abort(new Error('release cancelled'))
    const request = {
      ...baseInput(runAll, persistence),
      signal: controller.signal,
    }

    const result = await runEngineGeneration(request)

    expect(runAll).not.toHaveBeenCalled()
    expect(completed).toHaveLength(0)
    expect(failed).toHaveLength(1)
    expect(result.status).toBe('failed')
  })

  it('retries one transient engine failure before failing the generation', async () => {
    const { persistence } = createPersistenceHarness()
    let attempts = 0

    async function transientEngine(input: EngineInput): Promise<void> {
      attempts += 1
      if (attempts === 1) {
        throw new Error('upstream connection reset')
      }
      writeArtifacts(input)
    }

    const result = await runEngineGeneration(
      baseInput(transientEngine, persistence),
    )

    expect(attempts).toBe(2)
    expect(result.status).toBe('completed')
  })

  it('rejects a partial workspace whose task is still in progress', async () => {
    const { completed, failed, persistence } = createPersistenceHarness()

    async function writePartialArtifacts(input: EngineInput): Promise<void> {
      writeArtifacts(input, 'IN_PROGRESS')
    }

    const result = await runEngineGeneration(
      baseInput(writePartialArtifacts, persistence),
    )

    expect(result.status).toBe('failed')
    expect(completed).toHaveLength(0)
    expect(failed).toHaveLength(1)
  })

  it('emits preview-ready events immediately even if generation later fails', async () => {
    const { persistence } = createPersistenceHarness()
    const persistedEvents: ShipFastEngineSessionEvent[] = []

    async function readyThenFail(input: EngineInput): Promise<void> {
      input.sessionCtx.signalHomepageReady()
      throw new Error('final phase failed')
    }

    function persistEvent(event: ShipFastEngineSessionEvent): void {
      persistedEvents.push(event)
    }

    const result = await runEngineGeneration({
      ...baseInput(readyThenFail, persistence),
      onEvent: persistEvent,
    })

    expect(result.status).toBe('failed')
    // Preview-ready events are emitted immediately so the dashboard can show
    // the first frame as soon as it's available. A later failure is handled
    // separately — the user sees the partial preview and the failed portion
    // can be retried in the background.
    expect(persistedEvents).toContainEqual({ type: 'preview_ready' })
  })

  it('redacts provider secrets and internal paths from persisted failures', async () => {
    const { failed, persistence } = createPersistenceHarness()

    async function leakSensitiveFailure(): Promise<void> {
      throw new Error(
        'OPENAI_API_KEY=sk_live_release_secret failed at /Users/livio/private/provider.ts',
      )
    }

    const result = await runEngineGeneration(
      baseInput(leakSensitiveFailure, persistence),
    )
    const publicFailure = JSON.stringify({ result, failed })

    expect(publicFailure).not.toContain('sk_live_release_secret')
    expect(publicFailure).not.toContain('/Users/livio')
    expect(publicFailure).not.toContain('OPENAI_API_KEY')
  })

  it('waits for progress-event persistence before completing generation', async () => {
    const { completed, persistence } = createPersistenceHarness()
    let releaseEvent: (() => void) | undefined
    const eventGate = new Promise<void>(function captureRelease(resolve) {
      releaseEvent = resolve
    })

    async function emitProgress(input: EngineInput): Promise<void> {
      input.sessionCtx.setTasks([
        { id: 'homepage', label: 'Homepage', status: 'DONE' },
      ])
      writeArtifacts(input)
    }

    async function persistEvent(): Promise<void> {
      await eventGate
    }

    const generation = runEngineGeneration({
      ...baseInput(emitProgress, persistence),
      onEvent: persistEvent,
    })

    await vi.waitFor(() => expect(releaseEvent).toBeTypeOf('function'))
    expect(completed).toHaveLength(0)

    releaseEvent?.()
    const result = await generation

    expect(result.status).toBe('completed')
    expect(completed).toHaveLength(1)
  })

  it('recovers completed workspace artifacts after a worker interruption', async () => {
    const { completed, persistence } = createPersistenceHarness()
    const workspaceRoot = createTempRoot()
    const sessionId = 'interrupted-generation-session'
    const workspace = createEngineWorkspacePath(workspaceRoot, sessionId)
    writeArtifacts({
      prompt: 'Interrupted prompt',
      workspace,
      sessionCtx: {
        id: sessionId,
        broadcast() {},
        setPrompt() {},
        setTasks() {},
        updateTask() {},
        signalHomepageReady() {},
        signalOpenuiReady() {},
        setElapsed() {},
        setCost() {},
      },
    })

    async function unavailableProvider(): Promise<void> {
      throw new Error('provider unavailable during retry')
    }

    const result = await runEngineGeneration({
      sessionId,
      prompt: 'Interrupted prompt',
      workspaceRoot,
      runAll: unavailableProvider,
      persistence,
    })

    expect(result.status).toBe('completed')
    expect(completed).toHaveLength(1)
  })

  it('deduplicates replayed engine events before persistence', async () => {
    const events: ShipFastEngineSessionEvent[] = []

    async function replayEvents(input: EngineInput): Promise<void> {
      const tasks = [{ id: 'homepage', label: 'Homepage', status: 'DONE' }]
      input.sessionCtx.setTasks(tasks)
      input.sessionCtx.setTasks(tasks)
      input.sessionCtx.signalHomepageReady()
      input.sessionCtx.signalHomepageReady()
      writeArtifacts(input)
    }

    function collectEvent(event: ShipFastEngineSessionEvent): void {
      events.push(event)
    }

    const adapter = createShipFastEngineAdapter({
      runAll: replayEvents,
      workspaceRoot: createTempRoot(),
      onEvent: collectEvent,
    })

    await adapter.generate({
      sessionId: 'replayed-event-session',
      prompt: 'Replay-safe generation',
      preferredLanguage: undefined,
    })

    expect(events.filter((event) => event.type === 'tasks')).toHaveLength(1)
    expect(
      events.filter((event) => event.type === 'preview_ready'),
    ).toHaveLength(1)
  })
})
