import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runEngineGeneration } from '@/features/generation/server/generation-runner'
import type { GenerationPersistence } from '@/features/generation/server/generation-runner'
import type { RunShipFastEngine } from '@/features/generation/server/ship-fast-engine-adapter'

const createTempRoot = (): string =>
  mkdtempSync(join(tmpdir(), 'ship-fast-v2-runner-'))

describe('generation runner', () => {
  const dbObservedPrompt =
    'a food site for dogs and other pets with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.'

  it('persists completed engine artifacts', async () => {
    const completedInputs: unknown[] = []
    const failedInputs: unknown[] = []
    const seenLanguages: Array<string | undefined> = []
    const runAll: RunShipFastEngine = async ({
      workspace,
      preferredLanguage,
    }) => {
      seenLanguages.push(preferredLanguage)
      mkdirSync(workspace, { recursive: true })
      writeFileSync(
        join(workspace, 'index.html'),
        '<!doctype html><h1>Generated</h1>',
      )
      writeFileSync(join(workspace, 'site-spec.json'), '{"brand":"Generated"}')
      writeFileSync(join(workspace, 'home.openui'), 'page Home {}')
      writeFileSync(
        join(workspace, 'tasks.json'),
        JSON.stringify({
          tasks: [
            { id: 'home.openui', label: 'Generate Home page', status: 'DONE' },
          ],
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
        tasks: [
          { id: 'home.openui', label: 'Generate Home page', status: 'DONE' },
        ],
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

  it('fails the session when an engine returns without generated homepage artifacts', async () => {
    const completedInputs: unknown[] = []
    const failedInputs: unknown[] = []
    const persistence: GenerationPersistence = {
      completeGeneration: async (input) => {
        completedInputs.push(input)

        return { previewVersion: 1 }
      },
      failGeneration: async (input) => {
        failedInputs.push(input)
      },
    }

    await expect(
      runEngineGeneration({
        sessionId: 'session-missing-artifacts',
        prompt: 'Generate a SaaS homepage',
        anonymousOwnerSecret: 'secret',
        workspaceRoot: createTempRoot(),
        runAll: async ({ workspace }) => {
          mkdirSync(workspace, { recursive: true })
          writeFileSync(
            join(workspace, 'tasks.json'),
            JSON.stringify({
              tasks: [
                {
                  id: 'home.openui',
                  label: 'Generate Home page',
                  status: 'DONE',
                },
              ],
            }),
          )
        },
        persistence,
      }),
    ).resolves.toEqual({
      status: 'failed',
      message: 'Ship Fast engine did not write index.html',
    })

    expect(completedInputs).toEqual([])
    expect(failedInputs).toEqual([
      {
        sessionId: 'session-missing-artifacts',
        anonymousOwnerSecret: 'secret',
        message: 'Ship Fast engine did not write index.html',
      },
    ])
  })

  it('fails the session when completed artifacts cannot be persisted', async () => {
    const completedInputs: unknown[] = []
    const failedInputs: unknown[] = []
    const persistence: GenerationPersistence = {
      completeGeneration: async (input) => {
        completedInputs.push(input)
        throw new Error('Convex completion rejected preview payload')
      },
      failGeneration: async (input) => {
        failedInputs.push(input)
      },
    }

    await expect(
      runEngineGeneration({
        sessionId: 'session-persist-failure',
        prompt: dbObservedPrompt,
        anonymousOwnerSecret: 'secret',
        workspaceRoot: createTempRoot(),
        runAll: async ({ workspace }) => {
          mkdirSync(workspace, { recursive: true })
          writeFileSync(
            join(workspace, 'index.html'),
            '<!doctype html><h1>Pet food conversion site</h1>',
          )
          writeFileSync(
            join(workspace, 'site-spec.json'),
            JSON.stringify({ brand: 'Pet Food Site' }),
          )
          writeFileSync(
            join(workspace, 'home.openui'),
            'root = Text("Pet food conversion site")',
          )
        },
        persistence,
      }),
    ).resolves.toEqual({
      status: 'failed',
      message: 'Convex completion rejected preview payload',
    })

    expect(completedInputs).toEqual([
      {
        sessionId: 'session-persist-failure',
        anonymousOwnerSecret: 'secret',
        html: '<!doctype html><h1>Pet food conversion site</h1>',
        siteSpecJson: '{"brand":"Pet Food Site"}',
        openUiSource: 'root = Text("Pet food conversion site")',
        tasks: [],
      },
    ])
    expect(failedInputs).toEqual([
      {
        sessionId: 'session-persist-failure',
        anonymousOwnerSecret: 'secret',
        message: 'Convex completion rejected preview payload',
      },
    ])
  })
})
