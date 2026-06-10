import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runEngineGeneration } from '@/features/generation/server/generation-runner'
import type { GenerationPersistence } from '@/features/generation/server/generation-runner'
import type { RunShipFastEngine } from '@/features/generation/server/ship-fast-engine-adapter'

const createTempRoot = (): string => mkdtempSync(join(tmpdir(), 'ship-fast-v2-runner-'))

describe('generation runner', () => {
  it('persists completed engine artifacts', async () => {
    const completedInputs: unknown[] = []
    const failedInputs: unknown[] = []
    const seenLanguages: Array<string | undefined> = []
    const runAll: RunShipFastEngine = async ({ workspace, preferredLanguage }) => {
      seenLanguages.push(preferredLanguage)
      mkdirSync(workspace, { recursive: true })
      writeFileSync(join(workspace, 'index.html'), '<!doctype html><h1>Generated</h1>')
      writeFileSync(join(workspace, 'site-spec.json'), '{"brand":"Generated"}')
      writeFileSync(join(workspace, 'home.openui'), 'page Home {}')
      writeFileSync(
        join(workspace, 'tasks.json'),
        JSON.stringify({
          tasks: [{ id: 'home.openui', label: 'Generate Home page', status: 'DONE' }],
        }),
      )
    }
    const persistence: GenerationPersistence = {
      completeGeneration: async (input) => {
        completedInputs.push(input)

        return { previewVersion: 7 }
      },
      failGeneration: async (input) => {
        failedInputs.push(input)
      },
    }

    await expect(
      runEngineGeneration({
        sessionId: 'session-1',
        prompt: 'Generate a SaaS homepage',
        preferredLanguage: 'fr',
        anonymousOwnerSecret: 'secret',
        workspaceRoot: createTempRoot(),
        runAll,
        persistence,
      }),
    ).resolves.toEqual({ status: 'completed', previewVersion: 7 })

    expect(completedInputs).toEqual([
      {
        sessionId: 'session-1',
        anonymousOwnerSecret: 'secret',
        html: '<!doctype html><h1>Generated</h1>',
        siteSpecJson: '{"brand":"Generated"}',
        openUiSource: 'page Home {}',
        tasks: [{ id: 'home.openui', label: 'Generate Home page', status: 'DONE' }],
      },
    ])
    expect(seenLanguages).toEqual(['fr'])
    expect(failedInputs).toEqual([])
  })

  it('persists engine failures against the session owner', async () => {
    const failedInputs: unknown[] = []
    const persistence: GenerationPersistence = {
      completeGeneration: async () => ({ previewVersion: 1 }),
      failGeneration: async (input) => {
        failedInputs.push(input)
      },
    }

    await expect(
      runEngineGeneration({
        sessionId: 'session-2',
        prompt: 'Generate a SaaS homepage',
        anonymousOwnerSecret: 'secret',
        workspaceRoot: createTempRoot(),
        runAll: async () => {
          throw new Error('Engine unavailable')
        },
        persistence,
      }),
    ).resolves.toEqual({ status: 'failed', message: 'Engine unavailable' })

    expect(failedInputs).toEqual([
      {
        sessionId: 'session-2',
        anonymousOwnerSecret: 'secret',
        message: 'Engine unavailable',
      },
    ])
  })
})
