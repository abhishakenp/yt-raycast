import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'

import {
  buildOpenUIExport,
  decodeExportBody,
  parseOpenUIForExport,
} from './openui-export-builder'

const source = `root = SaasKimiPage("Export Demo", ["Home"], {"heading": "Hello export", "highlight": "export"})`

const siteSpecJson = JSON.stringify({ projectName: 'Export Demo' })

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

  it('builds a Next.js ZIP without OpenUI internals', () => {
    const result = buildOpenUIExport({
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
