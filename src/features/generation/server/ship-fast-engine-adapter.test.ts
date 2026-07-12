import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createShipFastEngineAdapter } from '@/features/generation/server/ship-fast-engine-adapter'
import type { RunShipFastEngine } from '@/features/generation/server/ship-fast-engine-adapter'

function createTempRoot(): string {
  return mkdtempSync(join(tmpdir(), 'ship-fast-v2-adapter-'))
}

describe('ship fast engine adapter', () => {
  const dbObservedPrompt =
    'a food site for dogs and other pets with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.'

  it('runs the engine in an isolated workspace and returns generated artifacts', async () => {
    const seenLanguages: Array<string | undefined> = []
    const runAll: RunShipFastEngine = async ({
      prompt,
      workspace,
      sessionCtx,
      preferredLanguage,
    }) => {
      seenLanguages.push(preferredLanguage)
      mkdirSync(workspace, { recursive: true })
      sessionCtx.setPrompt(prompt)
      sessionCtx.setTasks([
        { id: 'home.openui', label: 'Generate Home page', status: 'PENDING' },
      ])
      sessionCtx.updateTask({
        id: 'home.openui',
        label: 'Generate Home page',
        status: 'DONE',
      })
      sessionCtx.signalHomepageReady()
      writeFileSync(
        join(workspace, 'index.html'),
        '<!doctype html><h1>Generated</h1>',
      )
      writeFileSync(
        join(workspace, 'site-spec.json'),
        JSON.stringify({ brand: 'Generated' }),
      )
      writeFileSync(
        join(workspace, 'home.openui'),
        `page Home { text "${prompt}" }`,
      )
      writeFileSync(
        join(workspace, 'tasks.json'),
        JSON.stringify({
          tasks: [
            { id: 'home.openui', label: 'Generate Home page', status: 'DONE' },
          ],
        }),
      )
    }

    const adapter = createShipFastEngineAdapter({
      runAll,
      workspaceRoot: createTempRoot(),
      now: (() => {
        const times = [1_000, 1_250]

        return () => times.shift() ?? 1_250
      })(),
    })

    const result = await adapter.generate({
      sessionId: 'Session 123 / Demo!',
      prompt: 'Landing page for a billing tool',
      preferredLanguage: 'fr',
    })

    expect(seenLanguages).toEqual(['fr'])
    expect(result.workspace).toMatch(/session-123-demo$/)
    expect(result.html).toContain('<h1>Generated</h1>')
    expect(result.siteSpecJson).toBe('{"brand":"Generated"}')
    expect(result.openUiSource).toContain('Landing page for a billing tool')
    expect(result.tasks).toEqual([
      { id: 'home.openui', label: 'Generate Home page', status: 'DONE' },
    ])
    expect(result.elapsedMs).toBe(250)
    expect(result.events.map((event) => event.type)).toEqual([
      'log',
      'tasks',
      'task',
      'preview_ready',
    ])
  })

  it('returns generated artifacts when progress event persistence rejects', async () => {
    const onEventCalls: unknown[] = []
    const runAll: RunShipFastEngine = async ({ workspace, sessionCtx }) => {
      mkdirSync(workspace, { recursive: true })
      sessionCtx.setTasks([
        { id: 'home.openui', label: 'Generate Home page', status: 'PENDING' },
      ])
      sessionCtx.signalHomepageReady()
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
    }

    const adapter = createShipFastEngineAdapter({
      runAll,
      workspaceRoot: createTempRoot(),
      onEvent: async (event, context) => {
        onEventCalls.push({ event, context })
        throw new Error(`Failed to persist ${event.type}`)
      },
    })

    await expect(
      adapter.generate({
        sessionId: 'event-persistence-failure',
        prompt: dbObservedPrompt,
      }),
    ).resolves.toMatchObject({
      html: '<!doctype html><h1>Pet food conversion site</h1>',
      siteSpecJson: '{"brand":"Pet Food Site"}',
      openUiSource: 'root = Text("Pet food conversion site")',
      events: [
        {
          tasks: [
            {
              id: 'home.openui',
              label: 'Generate Home page',
              status: 'PENDING',
            },
          ],
          type: 'tasks',
        },
        { type: 'preview_ready' },
      ],
    })
    expect(onEventCalls).toHaveLength(2)
  })
})
