import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runEngineGeneration } from '@/features/generation/server/generation-runner'
import type { GenerationPersistence } from '@/features/generation/server/generation-runner'
import type { RunShipFastEngine } from '@/features/generation/server/ship-fast-engine-adapter'

function createTempRoot(): string {
  return mkdtempSync(join(tmpdir(), 'ship-fast-v2-runner-'))
}

describe('generation runner', () => {
  const dbObservedPrompt =
    'a food site for dogs and other pets with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.'
  const dbObservedOpenUiHandoffHtml =
    '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>'
  const dbObservedOpenUiSource =
    'home_hero = EcommerceHero("Boutique Coffee Roastery", "Crafted for Connoisseurs", "Subscribe for fresh beans delivered to your door")\nroot = PageSwitch(["Home"], [home_hero], "", {"Home":"home"})'

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

  it('returns a failed generation result even when failure persistence rejects', async () => {
    const failedInputs: unknown[] = []
    const persistence: GenerationPersistence = {
      completeGeneration: async () => ({ previewVersion: 1 }),
      failGeneration: async (input) => {
        failedInputs.push(input)
        throw new Error('Convex fail mutation rejected generation failure')
      },
    }

    await expect(
      runEngineGeneration({
        sessionId: 'session-fail-persist-rejected',
        prompt: dbObservedPrompt,
        anonymousOwnerSecret: 'secret',
        workspaceRoot: createTempRoot(),
        runAll: async () => {
          throw new Error('Provider returned empty model output')
        },
        persistence,
      }),
    ).resolves.toEqual({
      status: 'failed',
      message: 'Provider returned empty model output',
    })

    expect(failedInputs).toEqual([
      {
        sessionId: 'session-fail-persist-rejected',
        anonymousOwnerSecret: 'secret',
        message: 'Provider returned empty model output',
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

  it('fails the session when the engine writes the DB-observed blank preview artifact with OpenUI source only', async () => {
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
        sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
        prompt:
          'a craft beer brewery with taproom tours and seasonal releases in portland',
        preferredLanguage: 'lt',
        anonymousOwnerSecret: 'secret',
        workspaceRoot: createTempRoot(),
        runAll: async ({ workspace }) => {
          mkdirSync(workspace, { recursive: true })
          writeFileSync(join(workspace, 'index.html'), '')
          writeFileSync(
            join(workspace, 'site-spec.json'),
            JSON.stringify({
              brand: 'Craft Beer Brewery',
              locale: 'lt',
              theme: 'darkmatter',
            }),
          )
          writeFileSync(
            join(workspace, 'home.openui'),
            'home_menu = RestaurantMenu("Our Brew Selection", "Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.", [{"name":"Seasonal Releases","items":[{"name":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7","tag":"Limited"}]}])\nroot = PageSwitch(["Home"], [home_menu], "", {"Home":"home"})',
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
        sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
        anonymousOwnerSecret: 'secret',
        message: 'Ship Fast engine did not write index.html',
      },
    ])
  })

  it('fails the session when the engine writes DB-observed OpenUI handoff HTML instead of a rendered preview', async () => {
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
        sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
        prompt:
          'a boutique coffee roastery with subscription delivery and tasting events',
        anonymousOwnerSecret: 'secret',
        workspaceRoot: createTempRoot(),
        runAll: async ({ workspace }) => {
          mkdirSync(workspace, { recursive: true })
          writeFileSync(
            join(workspace, 'index.html'),
            dbObservedOpenUiHandoffHtml,
          )
          writeFileSync(
            join(workspace, 'site-spec.json'),
            JSON.stringify({ brand: 'Boutique Coffee Roastery' }),
          )
          writeFileSync(join(workspace, 'home.openui'), dbObservedOpenUiSource)
        },
        persistence,
      }),
    ).resolves.toEqual({
      status: 'failed',
      message:
        'Ship Fast engine wrote OpenUI handoff HTML instead of a rendered preview',
    })

    expect(completedInputs).toEqual([])
    expect(failedInputs).toEqual([
      {
        sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
        anonymousOwnerSecret: 'secret',
        message:
          'Ship Fast engine wrote OpenUI handoff HTML instead of a rendered preview',
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
