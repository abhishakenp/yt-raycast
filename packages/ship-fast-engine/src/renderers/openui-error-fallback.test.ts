import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../openui-ssr.js', () => ({
  renderOpenUIToHTMLWithTheme: vi.fn(() => ({
    html: '<div class="openui-error">Failed to render: te is not a function</div>',
    cssVars: '',
  })),
}))

const siteSpec = {
  brand: 'Fallback Brand',
  projectName: 'Fallback Brand',
  tagline: 'A deployed OpenUI site',
  userPrompt: 'Build an OpenUI homepage',
  siteType: 'saas',
  pages: [
    {
      id: 'home',
      route: '/',
      title: 'Home',
      sections: [],
    },
  ],
}

describe('OpenUI renderer error fallback', () => {
  it('fails closed instead of persisting an SSR error panel or handoff placeholder as the preview homepage', async () => {
    const { renderPreviewToWorkspace } = await import('./index')
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-openui-error-'))
    const source = 'page Home { Text "Deploy me" }'

    try {
      writeFileSync(join(workspace, 'site-spec.json'), JSON.stringify(siteSpec))
      writeFileSync(join(workspace, 'home.openui'), source)

      try {
        await renderPreviewToWorkspace(siteSpec as any, workspace)
      } catch {
        return
      }

      const html = readFileSync(join(workspace, 'index.html'), 'utf8')
      expect({
        hasRendererError: html.includes('openui-error'),
        hasHandoffCopy: html.includes('Generated OpenUI source is ready.'),
        embedsOpenUiSource: html.includes('ship-fast-openui-source'),
        exposesErrorMessage: html.includes('te is not a function'),
      }).toEqual({
        hasRendererError: false,
        hasHandoffCopy: false,
        embedsOpenUiSource: false,
        exposesErrorMessage: false,
      })
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })
})
