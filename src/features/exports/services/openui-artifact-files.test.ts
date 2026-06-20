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

  it('builds HTML artifact files from OpenUI source instead of debug fallback preview HTML', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source,
      previewHtml:
        '<!doctype html><html><body><p>Generated OpenUI source is ready.</p><script type="application/json" id="ship-fast-openui-source">"root = Debug()"</script></body></html>',
      siteSpecJson,
      sessionId: 'demo',
      target: 'html',
      includeBadge: false,
    })

    expect(download?.filename).toBe('index.html')
    expect(files['index.html']).toContain('Hello artifact')
    expect(files['index.html']).not.toContain(
      'Generated OpenUI source is ready',
    )
    expect(files['index.html']).not.toContain('ship-fast-openui-source')
    expect(files['index.html']).not.toContain('root = Debug')
  })

  it('fails HTML artifacts when source rendering fails instead of packaging preview fallback', async () => {
    await expect(
      buildOpenUIArtifactFiles({
        source: 'root = MissingBlock("Fallback Demo", UnknownReference)',
        previewHtml:
          '<!doctype html><html><body><p>Generated OpenUI source is ready.</p><script id="ship-fast-openui-source">"root = Debug()"</script></body></html>',
        siteSpecJson,
        sessionId: 'demo',
        target: 'html',
      }),
    ).rejects.toThrow()
  })

  it('fails React artifacts when native OpenUI translation fails', async () => {
    await expect(
      buildOpenUIArtifactFiles({
        source: 'root = MissingBlock("Fallback Demo", UnknownReference)',
        previewHtml:
          '<!doctype html><html><head><title>Fallback Demo</title></head><body><main>Rendered fallback</main></body></html>',
        siteSpecJson,
        sessionId: 'demo',
        target: 'react',
      }),
    ).rejects.toThrow()
  })

  it('fails Next artifacts when native OpenUI translation fails', async () => {
    await expect(
      buildOpenUIArtifactFiles({
        source: 'root = MissingBlock("Fallback Demo", UnknownReference)',
        previewHtml:
          '<!doctype html><html><head><title>Fallback Demo</title></head><body><main>Rendered fallback</main></body></html>',
        siteSpecJson,
        sessionId: 'demo',
        target: 'next',
      }),
    ).rejects.toThrow()
  })

  it('fails Lakebed artifacts when native OpenUI translation fails', async () => {
    await expect(
      buildOpenUIArtifactFiles({
        source: 'root = MissingBlock("Fallback Demo", UnknownReference)',
        previewHtml:
          '<!doctype html><html><head><title>Fallback Demo</title></head><body><main>Rendered fallback</main></body></html>',
        siteSpecJson,
        sessionId: 'demo',
        target: 'lakebed',
      }),
    ).rejects.toThrow()
  })
})
