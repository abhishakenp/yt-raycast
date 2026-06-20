import { describe, expect, it } from 'vitest'

import { buildOpenUIArtifactFiles } from './openui-artifact-files'

const source =
  'root = SaasKimiPage("Artifact Demo", ["Home"], {"heading": "Hello artifact", "highlight": "artifact"})'

const siteSpecJson = JSON.stringify({ projectName: 'Artifact Demo' })

describe('openui artifact files', () => {
  it('builds React artifact files from OpenUI components instead of static preview HTML', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })

    expect(download?.filename).toBe('artifact-demo-react.zip')
    expect(files['src/components/SaasKimiPage.tsx']).toContain('SaasKimiPage')
    expect(files['src/data/pages.ts']).toContain('Hello artifact')
    expect(files['src/App.tsx']).toContain('SaasKimiPage')
    expect(files['vite.config.js']).toBeUndefined()
  })

  it('builds Next artifact files from OpenUI components instead of static preview HTML', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })

    expect(download?.filename).toBe('artifact-demo-next.zip')
    expect(files['src/components/SaasKimiPage.tsx']).toContain('SaasKimiPage')
    expect(files['src/data/pages.ts']).toContain('Hello artifact')
    expect(files['app/page.tsx']).toContain('SaasKimiPage')
    expect(files['next.config.js']).toBeUndefined()
  })

  it('falls back to static React files when OpenUI source has unresolved references', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source: 'root = MissingBlock("Fallback Demo", UnknownReference)',
      previewHtml:
        '<!doctype html><html><head><title>Fallback Demo</title></head><body><main>Rendered fallback</main></body></html>',
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })

    expect(download).toBeUndefined()
    expect(files['vite.config.js']).toContain('defineConfig')
    expect(files['index.html']).toContain('Rendered fallback')
  })

  it('falls back to static Next files when OpenUI source has unresolved references', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source: 'root = MissingBlock("Fallback Demo", UnknownReference)',
      previewHtml:
        '<!doctype html><html><head><title>Fallback Demo</title></head><body><main>Rendered fallback</main></body></html>',
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })

    expect(download).toBeUndefined()
    expect(files['next.config.js']).toContain('nextConfig')
    expect(files['app/page.tsx']).toContain('Rendered fallback')
  })

  it('falls back to static Lakebed files when OpenUI source has unresolved references', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source: 'root = MissingBlock("Fallback Demo", UnknownReference)',
      previewHtml:
        '<!doctype html><html><head><title>Fallback Demo</title></head><body><main>Rendered fallback</main></body></html>',
      siteSpecJson,
      sessionId: 'demo',
      target: 'lakebed',
    })

    expect(download).toBeUndefined()
    expect(files['client/preview.ts']).toContain('Rendered fallback')
    expect(files['server/index.ts']).toContain('lakebed/server')
  })
})
