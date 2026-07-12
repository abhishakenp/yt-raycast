import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const orchestratorCalls: Record<string, unknown>[] = []
const orchestratorReturns: Record<string, unknown>[] = []

vi.mock('../genui/run.ts', () => ({
  runHomepageOrchestrator: vi.fn(async (args) => {
    orchestratorCalls.push(args)
    const returns = orchestratorReturns.shift() ?? {
      source: 'root = Page("Generated")',
      theme: 'modern-minimal',
      locale: 'en',
      brand: 'Generated',
    }
    return returns
  }),
}))

vi.mock('../renderers/index.ts', () => ({
  renderPreviewToWorkspace: vi.fn((_project, workspace) => {
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
    orchestratorReturns.length = 0
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

  it('uses the AI-decided title in the site spec projectName when the orchestrator returns one', async () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-openui-title-'))
    const { saveSiteSpec } = await import('../spec/index.ts')
    vi.mocked(saveSiteSpec).mockClear()

    orchestratorReturns.push({
      source: 'root = Page("Kaveri")',
      theme: 'elegant-luxury',
      locale: 'en',
      brand: 'Kaveri Silks',
      title: 'Kaveri Silks — Premium Sarees & Traditional Wear',
    })

    await generateAndWriteOpenUIHome({
      workspace,
      siteSpec: null,
      prompt: 'Build a site for Kaveri Silks saree store',
      sessionCtx: {
        broadcast: vi.fn(),
        signalHomepageReady: vi.fn(),
        signalOpenuiReady: vi.fn(),
      },
      log: vi.fn(),
    })

    expect(vi.mocked(saveSiteSpec)).toHaveBeenCalledTimes(1)
    const savedProject = vi.mocked(saveSiteSpec).mock.calls[0][1]
    expect(savedProject.projectName).toBe(
      'Kaveri Silks — Premium Sarees & Traditional Wear',
    )
    expect(savedProject.brand).toBe('Kaveri Silks')
  })
})
