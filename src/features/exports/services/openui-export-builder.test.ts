import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'

import { buildOpenUIExport, decodeExportBody, parseOpenUIForExport } from './openui-export-builder'

const source = `root = Stack([hero])
hero = Heading("Hello export", "1")`

const siteSpecJson = JSON.stringify({ projectName: 'Export Demo' })

const unzipTextFiles = (body: Uint8Array): Record<string, string> =>
  Object.fromEntries(
    Object.entries(unzipSync(body)).map(([name, value]) => [name, strFromU8(value)]),
  )

describe('openui-export-builder', () => {
  it('parses OpenUI source into export metadata', () => {
    const parsed = parseOpenUIForExport(source, siteSpecJson)

    expect(parsed.projectName).toBe('Export Demo')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('Stack')
  })

  it('builds standalone HTML without exposing OpenUI source', () => {
    const result = buildOpenUIExport({
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

  it('builds a React ZIP without OpenUI internals', () => {
    const result = buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })

    expect(result.contentType).toBe('application/zip')
    const files = unzipTextFiles(result.body as Uint8Array)

    expect(Object.keys(files).sort()).toEqual([
      'README.md',
      'index.html',
      'package.json',
      'src/App.jsx',
      'src/main.jsx',
      'src/styles.css',
    ])
    expect(files['src/App.jsx']).toContain('Hello export')
    expect(Object.values(files).join('\n')).not.toContain('@openuidev')
    expect(Object.values(files).join('\n')).not.toContain('defineComponent')
    expect(Object.values(files).join('\n')).not.toContain('root = Stack')
  })

  it('builds a Next.js ZIP without OpenUI internals', () => {
    const result = buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipTextFiles(result.body as Uint8Array)

    expect(files['app/page.jsx']).toContain('Hello export')
    expect(files['app/layout.jsx']).toContain('Export Demo')
    expect(Object.values(files).join('\n')).not.toContain('@openuidev')
    expect(Object.values(files).join('\n')).not.toContain('defineComponent')
    expect(Object.values(files).join('\n')).not.toContain('root = Stack')
  })
})
