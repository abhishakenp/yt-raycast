import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const savedProjects = []
const streamDoneEvents = []
const translationCalls = []

vi.mock('../genui/run.ts', () => ({
  runHomepageOrchestrator: vi.fn(async () => ({
    source: 'root = Page("Generated")',
    theme: 'modern-minimal',
    locale: 'en',
    brand: 'Generated',
  })),
}))

vi.mock('../renderers/index.ts', () => ({
  renderPreviewToWorkspace: vi.fn((project, workspace) => {
    writeFileSync(join(workspace, 'index.html'), '<main><h1>Hello</h1></main>')
    return { files: { 'index.html': '<main><h1>Hello</h1></main>' } }
  }),
  writeStreamingShellToWorkspace: vi.fn(),
}))

vi.mock('../spec/index.ts', () => ({
  saveSiteSpec: vi.fn((_workspace, project) => {
    savedProjects.push(project)
  }),
}))

vi.mock('../openui-ssr.js', () => ({
  renderOpenUIToHTMLWithTheme: vi.fn(() => ({ html: '<main><h1>Hello</h1></main>', cssVars: '' })),
}))

vi.mock('../llm/translator.js', () => ({
  translateHtml: vi.fn(async (html, languageMode) => {
    translationCalls.push({ html, languageMode })
    return {
      content: html.replaceAll('Hello', 'Bonjour'),
      translatedCount: 1,
    }
  }),
}))

const { generateAndWriteOpenUIHome } = await import('./phase-openui-home.ts')

describe('OpenUI homepage language mode', () => {
  beforeEach(() => {
    savedProjects.length = 0
    streamDoneEvents.length = 0
    translationCalls.length = 0
  })

  it('uses the resolved language mode as the final locale over orchestrator fallback locale', async () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-openui-language-'))

    await generateAndWriteOpenUIHome({
      workspace,
      siteSpec: null,
      prompt: 'Build a site in French',
      languageMode: { code: 'fr', name: 'French' },
      sessionCtx: {
        broadcast: (event) => {
          if (event?.type === 'openui_stream_done') streamDoneEvents.push(event)
        },
        signalHomepageReady: vi.fn(),
        signalOpenuiReady: vi.fn(),
      },
      log: vi.fn(),
    })

    expect(savedProjects.at(-1).locale).toBe('fr')
    expect(streamDoneEvents.at(-1).locale).toBe('fr')
  })

  it('translates final preview HTML when the resolved language requires translation', async () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-openui-language-'))

    await generateAndWriteOpenUIHome({
      workspace,
      siteSpec: null,
      prompt: 'Build a site in French',
      languageMode: {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        needsTranslation: true,
      },
      sessionCtx: {
        broadcast: (event) => {
          if (event?.type === 'openui_stream_done') streamDoneEvents.push(event)
        },
        signalHomepageReady: vi.fn(),
        signalOpenuiReady: vi.fn(),
      },
      log: vi.fn(),
    })

    expect(translationCalls.length).toBeGreaterThan(0)
    expect(streamDoneEvents.at(-1).html).toContain('Bonjour')
  })
})
