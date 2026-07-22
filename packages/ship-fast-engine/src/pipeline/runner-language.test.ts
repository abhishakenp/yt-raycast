import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const openuiCalls: Record<string, unknown>[] = []

vi.mock('./phase-openui-home.ts', () => ({
  generateAndWriteOpenUIHome: vi.fn(async (args) => {
    openuiCalls.push(args)
    return {
      source: 'root = Page("Generated")',
      chars: 24,
      cost: 0,
    }
  }),
}))

vi.mock('../spec/index.js', () => ({
  loadSiteSpec: vi.fn(() => null),
}))

const { runAll } = await import('./runner.js')

const createSessionCtx = () => ({
  id: 'language-test-session',
  broadcast: vi.fn(),
  setPrompt: vi.fn(),
  setTasks: vi.fn(),
  updateTask: vi.fn(),
  signalHomepageReady: vi.fn(),
  signalOpenuiReady: vi.fn(),
  setElapsed: vi.fn(),
  setCost: vi.fn(),
})

function makeWorkspace(preferredLanguage: string): string {
  const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-runner-language-'))
  writeFileSync(
    join(workspace, '.session.json'),
    JSON.stringify({ preferredLanguage }, null, 2),
  )
  return workspace
}

describe('runner language integration', () => {
  beforeEach(() => {
    openuiCalls.length = 0
  })

  it('passes workspace preferred romanized language into the OpenUI homepage phase', async () => {
    const workspace = makeWorkspace('hi-latn')

    await runAll({
      prompt: 'Build a landing page for a textile studio',
      workspace,
      sessionCtx: createSessionCtx(),
    })

    expect(openuiCalls).toHaveLength(1)
    expect(openuiCalls[0]?.languageMode).toMatchObject({ code: 'hi-latn' })
    expect(openuiCalls[0].prompt).toContain('English only')
    expect(openuiCalls[0].prompt).not.toContain('hi-latn')
  })
})
