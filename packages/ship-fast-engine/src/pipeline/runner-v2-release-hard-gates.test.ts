import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const pipelineMocks = vi.hoisted(() => ({
  brand: vi.fn(),
  imageHints: vi.fn(),
  writeHome: vi.fn(),
}))

vi.mock('./brand-profile.js', () => ({
  enrichBrandProfile: pipelineMocks.brand,
}))

vi.mock('./image-hints.js', () => ({
  resolvePexelsImageHints: pipelineMocks.imageHints,
}))

vi.mock('./phase-sff-html.ts', () => ({
  writeSffHtmlHome: pipelineMocks.writeHome,
}))

import { runAllV2 } from './runner-v2'

type ImageHintOptions = {
  onProgress?: (partial: unknown) => void
}

function createWorkspace(): string {
  return mkdtempSync(join(tmpdir(), 'ship-fast-runner-v2-release-'))
}

function createSessionHarness() {
  const broadcasts: unknown[] = []
  const taskUpdates: unknown[] = []
  const setTasksCalls: unknown[][] = []
  let homepageReady = 0
  let openuiReady = 0

  return {
    broadcasts,
    taskUpdates,
    setTasksCalls,
    get homepageReady() {
      return homepageReady
    },
    get openuiReady() {
      return openuiReady
    },
    context: {
      broadcast(payload: unknown) {
        broadcasts.push(payload)
      },
      setPrompt() {},
      setTasks(tasks: unknown[]) {
        setTasksCalls.push(structuredClone(tasks))
      },
      updateTask(task: unknown) {
        taskUpdates.push(structuredClone(task))
      },
      signalHomepageReady() {
        homepageReady += 1
      },
      signalOpenuiReady() {
        openuiReady += 1
      },
      setElapsed() {},
      setCost() {},
    },
  }
}

function taskStatus(task: unknown): unknown {
  if (!task || typeof task !== 'object') return undefined
  return Reflect.get(task, 'status')
}

function eventType(event: unknown): unknown {
  if (!event || typeof event !== 'object') return undefined
  return Reflect.get(event, 'type')
}

describe('runner v2 release hard gates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pipelineMocks.brand.mockResolvedValue({
      verified: true,
      officialName: 'Release Brand',
    })
    pipelineMocks.imageHints.mockResolvedValue({ photos: [], videos: [] })
    pipelineMocks.writeHome.mockResolvedValue({ chars: 120, cost: 0.01 })
  })

  it('continues generation when optional image and brand providers fail', async () => {
    const session = createSessionHarness()
    pipelineMocks.brand.mockRejectedValueOnce(new Error('brand provider down'))
    pipelineMocks.imageHints.mockRejectedValueOnce(
      new Error('image provider down'),
    )

    await expect(
      runAllV2({
        workspace: createWorkspace(),
        prompt: 'A release-ready documentation site',
        preferredLanguage: 'en',
        sessionCtx: session.context,
      }),
    ).resolves.toBeUndefined()

    expect(pipelineMocks.writeHome).toHaveBeenCalledWith(
      expect.objectContaining({ brandProfile: null, imageHints: null }),
    )
    expect(session.homepageReady).toBe(1)
    expect(session.openuiReady).toBe(1)
    expect(session.broadcasts.map(eventType)).toContain('run_completed')
  })

  it('redacts provider credentials and internal paths from progress events', async () => {
    const session = createSessionHarness()
    pipelineMocks.brand.mockRejectedValueOnce(
      new Error(
        'BRANDFETCH_API_KEY=bf_release_secret at /Users/livio/private/brand.ts',
      ),
    )
    pipelineMocks.imageHints.mockRejectedValueOnce(
      new Error(
        'PEXELS_API_KEY=px_release_secret at /opt/ship-fast/image-hints.ts',
      ),
    )

    await runAllV2({
      workspace: createWorkspace(),
      prompt: 'A release-ready documentation site',
      preferredLanguage: 'en',
      sessionCtx: session.context,
    })

    const publicEvents = JSON.stringify(session.broadcasts)
    expect(publicEvents).not.toContain('bf_release_secret')
    expect(publicEvents).not.toContain('px_release_secret')
    expect(publicEvents).not.toContain('/Users/livio')
    expect(publicEvents).not.toContain('/opt/ship-fast')
  })

  it('deduplicates replayed image progress before broadcasting it', async () => {
    const session = createSessionHarness()

    async function duplicateImageProgress(
      _input: unknown,
      options?: ImageHintOptions,
    ) {
      const progress = { photos: 1, phase: 'searching' }
      options?.onProgress?.(progress)
      options?.onProgress?.(progress)
      return { photos: [], videos: [] }
    }

    pipelineMocks.imageHints.mockImplementationOnce(duplicateImageProgress)

    await runAllV2({
      workspace: createWorkspace(),
      prompt: 'A release-ready documentation site',
      preferredLanguage: 'en',
      sessionCtx: session.context,
    })

    expect(
      session.broadcasts.filter((event) => eventType(event) === 'media_hints'),
    ).toHaveLength(1)
  })

  it('does not commit DONE or ready signals before integrations succeed', async () => {
    const session = createSessionHarness()

    async function failIntegration(): Promise<void> {
      throw new Error('integration commit failed')
    }

    await expect(
      runAllV2({
        workspace: createWorkspace(),
        prompt: 'A release-ready documentation site',
        preferredLanguage: 'en',
        sessionCtx: session.context,
        integrations: { afterSiteSpecSaved: failIntegration },
      }),
    ).rejects.toThrow('integration commit failed')

    expect(session.taskUpdates.map(taskStatus)).not.toContain('DONE')
    expect(session.homepageReady).toBe(0)
    expect(session.openuiReady).toBe(0)
    expect(session.broadcasts.map(eventType)).not.toContain('run_completed')
  })

  it('persists FAILED before publishing the terminal failure status', async () => {
    const session = createSessionHarness()
    const workspace = createWorkspace()
    let statusAtFailure: unknown

    pipelineMocks.writeHome.mockRejectedValueOnce(
      new Error('homepage render failed'),
    )
    session.context.broadcast = function recordFailure(payload) {
      session.broadcasts.push(payload)
      if (
        payload &&
        typeof payload === 'object' &&
        Reflect.get(payload, 'phase') === 'failed'
      ) {
        const taskFile = JSON.parse(
          readFileSync(join(workspace, 'tasks.json'), 'utf8'),
        )
        statusAtFailure = taskFile.tasks[0]?.status
      }
    }

    await expect(
      runAllV2({
        workspace,
        prompt: 'A release-ready documentation site',
        preferredLanguage: 'en',
        sessionCtx: session.context,
      }),
    ).rejects.toThrow('homepage render failed')

    expect(statusAtFailure).toBe('FAILED')
    expect(session.homepageReady).toBe(0)
    expect(session.openuiReady).toBe(0)
  })
})
