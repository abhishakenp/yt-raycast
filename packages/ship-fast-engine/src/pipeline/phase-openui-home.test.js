import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const orchestratorCalls = []

vi.mock('../genui/run.ts', () => ({
  runHomepageOrchestrator: vi.fn(async (args) => {
    orchestratorCalls.push(args)
    return {
      source: 'root = Page("Generated")',
      theme: 'modern-minimal',
      locale: 'en',
      brand: 'Generated',
    }
  }),
}))

vi.mock('../renderers/index.ts', () => ({
  renderPreviewToWorkspace: vi.fn((project, workspace) => {
    writeFileSync(join(workspace, 'index.html'), '<main><h1>Hello</h1></main>')
    return { files: { 'index.html': '<main><h1>Hello</h1></main>' } }
  }),
}))

vi.mock('../spec/index.ts', () => ({
  saveSiteSpec: vi.fn(),
}))

vi.mock('../openui-ssr.js', () => ({
  renderOpenUIToHTMLWithTheme: vi.fn(() => ({
    html: '<main><h1>Hello</h1></main>',
    cssVars: '',
  })),
}))

vi.mock('../llm/translator.js', () => ({
  translateHtml: vi.fn(),
}))

const { generateAndWriteOpenUIHome } = await import('./phase-openui-home.ts')

describe('OpenUI homepage phase', () => {
  beforeEach(() => {
    orchestratorCalls.length = 0
  })

  it('exports the homepage phase as a function', () => {
    expect(typeof generateAndWriteOpenUIHome).toBe('function')
  })

  it('calls the faithful GenUI orchestrator directly without an outer retry wrapper', async () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-openui-phase-'))
    await generateAndWriteOpenUIHome({
      workspace,
      siteSpec: null,
      prompt: 'Build a simple site',
      sessionCtx: {
        broadcast: vi.fn(),
        signalHomepageReady: vi.fn(),
        signalOpenuiReady: vi.fn(),
      },
      log: vi.fn(),
    })

    // The orchestrator is invoked exactly once — no retry loop wraps it.
    expect(orchestratorCalls).toHaveLength(1)
    expect(orchestratorCalls[0].prompt).toBe('Build a simple site')
  })
})
