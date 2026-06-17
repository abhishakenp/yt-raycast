import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'

import {
  buildOpenUIExport,
  decodeExportBody,
  parseOpenUIForExport,
} from './openui-export-builder'
import {
  buildOpenUIHtmlExport,
  parseOpenUIForHtmlExport,
} from './openui-html-export-builder'

const source = `root = SaasKimiPage("Export Demo", ["Home"], {"heading": "Hello export", "highlight": "export"})`

const siteSpecJson = JSON.stringify({ projectName: 'Export Demo' })
const rawHtmlSource = `<!DOCTYPE html>
<html lang="en">
<head><title>Raw Export Demo</title><script src="https://cdn.tailwindcss.com"></script></head>
<body><main><h1>Raw SFF export</h1></main></body>
</html>`

const unzipTextFiles = (body: Uint8Array): Record<string, string> =>
  Object.fromEntries(
    Object.entries(unzipSync(body)).map(([name, value]) => [
      name,
      strFromU8(value),
    ]),
  )

describe('openui-export-builder', () => {
  it('parses OpenUI source into export metadata', () => {
    const parsed = parseOpenUIForExport(source, siteSpecJson)

    expect(parsed.projectName).toBe('Export Demo')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('SaasKimiPage')
  })

  it('parses OpenUI source into HTML export metadata with a response-scoped library', async () => {
    const parsed = await parseOpenUIForHtmlExport(source, siteSpecJson)

    expect(parsed.projectName).toBe('Export Demo')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('SaasKimiPage')
    expect(JSON.stringify(parsed.library.toJSONSchema())).toContain(
      'SaasKimiPage',
    )
  })

  it('builds standalone HTML without exposing OpenUI source', async () => {
    const result = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'html',
    })
    const html = decodeExportBody(result.body)

    expect(result.contentType).toBe('text/html; charset=utf-8')
    expect(result.filename).toBe('index.html')
    expect(html).toContain('Hello export')
    expect(html).not.toContain('@openuidev')
    expect(html).not.toContain('defineComponent')
    expect(html).not.toContain('root = Stack')
  })

  it('returns raw SFF HTML directly for HTML exports', async () => {
    const result = await buildOpenUIHtmlExport({
      source: rawHtmlSource,
      siteSpecJson,
      sessionId: 'demo',
      target: 'html',
    })

    expect(result.contentType).toBe('text/html; charset=utf-8')
    expect(result.filename).toBe('index.html')
    expect(decodeExportBody(result.body)).toBe(rawHtmlSource)
  })

  it('keeps standalone HTML export isolated from full-catalog package imports', () => {
    const htmlBuilderSource = readFileSync(
      new URL('./openui-html-export-builder.ts', import.meta.url),
      'utf8',
    )
    const packageBuilderSource = readFileSync(
      new URL('./openui-export-builder.ts', import.meta.url),
      'utf8',
    )

    expect(htmlBuilderSource).toContain('@ship-fast/blocks/runtime')
    expect(htmlBuilderSource).toContain('loadOpenUIRuntimeLibrary(cleaned)')
    expect(htmlBuilderSource).not.toContain("from '@ship-fast/blocks'")
    expect(htmlBuilderSource).not.toContain('@ship-fast/blocks/generated')
    expect(htmlBuilderSource).not.toContain('reactExportSourcesBase64')
    expect(htmlBuilderSource).not.toContain('brotliDecompressSync')
    expect(htmlBuilderSource).not.toContain("from 'typescript'")
    expect(htmlBuilderSource).not.toContain('./openui-export-builder')
    expect(packageBuilderSource).toContain(
      "await import('./openui-html-export-builder')",
    )
  })

  it('packages raw SFF HTML as a static ZIP for app export targets', async () => {
    const result = await buildOpenUIExport({
      source: rawHtmlSource,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })
    const files = unzipTextFiles(result.body as Uint8Array)

    expect(result.contentType).toBe('application/zip')
    expect(files['index.html']).toBe(rawHtmlSource)
    expect(files['README.md']).toContain('Export Demo')
    expect(files['package.json']).toContain('"dev": "vite --host 0.0.0.0"')
  })

  it('builds a React ZIP without OpenUI internals', async () => {
    const result = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })

    expect(result.contentType).toBe('application/zip')
    const files = unzipTextFiles(result.body as Uint8Array)

    expect(Object.keys(files).sort()).toEqual([
      '.env.local',
      'README.md',
      'index.html',
      'package.json',
      'src/App.tsx',
      'src/components/SaasKimiPage.tsx',
      'src/data/pages.ts',
      'src/lib/cn.ts',
      'src/lib/image.tsx',
      'src/main.tsx',
      'src/styles.css',
      'tsconfig.json',
    ])
    expect(files['src/data/pages.ts']).toContain('Hello export')
    expect(Object.values(files).join('\n')).not.toContain('@openuidev')
    expect(Object.values(files).join('\n')).not.toContain('defineComponent')
    expect(Object.values(files).join('\n')).not.toContain('root = Stack')
  })

  it('builds a Next.js ZIP without OpenUI internals', async () => {
    const result = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipTextFiles(result.body as Uint8Array)

    expect(files['src/data/pages.ts']).toContain('Hello export')
    expect(files['app/layout.tsx']).toContain('Export Demo')
    expect(Object.values(files).join('\n')).not.toContain('@openuidev')
    expect(Object.values(files).join('\n')).not.toContain('defineComponent')
    expect(Object.values(files).join('\n')).not.toContain('root = Stack')
  })
})
