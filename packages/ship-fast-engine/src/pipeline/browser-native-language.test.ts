import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const openuiCalls: unknown[] = []

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

const { resolvePipelineLanguage } = await import('./prompt-language.js')
const { runAll } = await import('./runner.js')

const createSessionCtx = () => ({
  id: 'k574ms14ma9f94keq30r7dq24x89n1k2',
  broadcast: vi.fn(),
  setPrompt: vi.fn(),
  setTasks: vi.fn(),
  updateTask: vi.fn(),
  signalHomepageReady: vi.fn(),
  signalOpenuiReady: vi.fn(),
  setElapsed: vi.fn(),
  setCost: vi.fn(),
})

const makeWorkspace = (preferredLanguage: string) => {
  const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-browser-language-'))
  writeFileSync(
    join(workspace, '.session.json'),
    JSON.stringify(
      {
        sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
        preferredLanguage,
      },
      null,
      2,
    ),
  )
  return workspace
}

describe('browser-native language pipeline handoff', () => {
  beforeEach(() => {
    openuiCalls.length = 0
  })

  it('preserves a live browser-native language as a translation target', async () => {
    const mode = await resolvePipelineLanguage({
      prompt:
        'a craft beer brewery with taproom tours and seasonal releases in portland',
      preferredLanguage: 'lt',
    })

    expect(mode.code).toBe('lt')
    expect(mode.name).toBe('lt')
    expect(mode.needsTranslation).toBe(true)
    expect(mode.prompt).toContain('server language code `lt`')
    expect(mode.prompt).toContain('single primary language')
  })

  it('passes a live browser-native workspace language into the OpenUI homepage phase', async () => {
    const workspace = makeWorkspace('lt')

    await runAll({
      prompt:
        'a craft beer brewery with taproom tours and seasonal releases in portland',
      workspace,
      sessionCtx: createSessionCtx(),
    })

    expect(openuiCalls).toHaveLength(1)
    const call = openuiCalls[0] as {
      languageMode: { code: string; needsTranslation: boolean }
      prompt: string
    }
    expect(call.languageMode.code).toBe('lt')
    expect(call.languageMode.needsTranslation).toBe(true)
    expect(call.prompt).toContain('server language code `lt`')
  })
})
