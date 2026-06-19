import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
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

const unzipBuiltExportTextFiles = (body: string | Uint8Array) => {
  if (typeof body === 'string') {
    throw new Error('Expected ZIP body')
  }
  return unzipTextFiles(body)
}

const parseJson = (text: string): unknown => JSON.parse(text)

const isStringRecord = (value: unknown): value is Record<string, string> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  return Object.keys(value).every(
    (key) =>
      typeof Object.getOwnPropertyDescriptor(value, key)?.value === 'string',
  )
}

const readPackageDependencies = (files: Record<string, string>) => {
  const packageJson = parseJson(files['package.json'] ?? '{}')
  if (!packageJson || typeof packageJson !== 'object') {
    throw new Error('Expected package.json object')
  }
  const dependencies = Object.entries(packageJson).find(
    ([key]) => key === 'dependencies',
  )?.[1]
  if (!isStringRecord(dependencies)) {
    throw new Error('Expected package.json dependencies')
  }
  return dependencies
}

describe('openui-export-builder', () => {
  it('parses OpenUI source into export metadata', () => {
    const parsed = parseOpenUIForExport(source, siteSpecJson)

    expect(parsed.projectName).toBe('Export Demo')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('SaasKimiPage')
  })

  it('parses generated source with malformed quoted object keys', () => {
    const parsed = parseOpenUIForExport(
      'root = SaasKimiPage("StrideFit", ["Home"], {heading:"Shoes", items:[{"name":"Darius K.", tag:"Verified Buyer"},{"name:"Maya S.", tag:"Verified Buyer"}]})',
      JSON.stringify({ projectName: 'StrideFit' }),
    )

    expect(parsed.projectName).toBe('StrideFit')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('SaasKimiPage')
  })

  it('parses generated source with object-boundary null arguments', () => {
    const parsed = parseOpenUIForExport(
      'root = ProductDetailKimiPage("StrideFit", ["Home"], ["Home"], {}, {}, {items:[{"name:"Maya S.", tag:"Verified Buyer"}]}, {}, {footer:{note:"Done"}, null)',
      JSON.stringify({ projectName: 'StrideFit' }),
    )

    expect(parsed.projectName).toBe('StrideFit')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('ProductDetailKimiPage')
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

  it('packages raw SFF HTML as a static ZIP for app export targets', async () => {
    const result = await buildOpenUIExport({
      source: rawHtmlSource,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    expect(result.contentType).toBe('application/zip')
    expect(files['index.html']).toBe(rawHtmlSource)
    expect(files['README.md']).toContain('Export Demo')
    expect(files['README.md']).toContain(
      'Generated by [ShipFast](https://ship-fast.io) 🚀.',
    )
    expect(files['README.md']).not.toContain('Session:')
    expect(files['README.md']).not.toContain('Target:')
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
    const files = unzipBuiltExportTextFiles(result.body)

    expect(Object.keys(files).sort()).toEqual(
      expect.arrayContaining([
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
      ]),
    )
    expect(files['src/data/pages.ts']).toContain('Hello export')
    expect(files['README.md']).toContain(
      'Generated by [ShipFast](https://ship-fast.io) 🚀.',
    )
    expect(Object.values(files).join('\n')).not.toContain('@openuidev')
    expect(Object.values(files).join('\n')).not.toContain('defineComponent')
    expect(Object.values(files).join('\n')).not.toContain('root = Stack')
  })

  it('packages UI primitive dependencies for FitnessKimiPage React exports', async () => {
    const result = await buildOpenUIExport({
      source: `root = FitnessKimiPage("FitPulse Gym", ["Home"])`,
      siteSpecJson: JSON.stringify({ projectName: 'FitPulse Gym' }),
      sessionId: 'fitness-demo',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const dependencies = readPackageDependencies(files)

    expect(files['src/components/FitnessKimiPage.tsx']).toMatch(
      /from ['"]\.\/ui\/sheet['"]/,
    )
    expect(files['src/components/FitnessKimiPage.tsx']).not.toContain(
      '#/components/ui/sheet.tsx',
    )
    expect(files['src/components/ui/sheet.tsx']).toMatch(
      /from ['"]\.\.\/\.\.\/lib\/cn['"]/,
    )
    expect(files['src/components/ui/sheet.tsx']).toMatch(
      /from ['"]\.\/portal-container['"]/,
    )
    expect(files['src/components/ui/button.tsx']).toMatch(
      /from ['"]\.\.\/\.\.\/lib\/cn['"]/,
    )
    expect(files['src/components/ui/popover.tsx']).toMatch(
      /from ['"]\.\/portal-container['"]/,
    )
    expect(files['src/components/ui/avatar.tsx']).toContain('AvatarPrimitive')
    expect(files['src/components/ui/portal-container.tsx']).toContain(
      'usePortalContainer',
    )
    expect(dependencies).toMatchObject({
      '@radix-ui/react-slot': expect.any(String),
      'class-variance-authority': expect.any(String),
      'lucide-react': expect.any(String),
      'radix-ui': expect.any(String),
    })
  })

  it('copies maintained block dependencies from the generated manifest when the source tree is unavailable', async () => {
    const previousCwd = process.cwd()
    const tempCwd = mkdtempSync(join(tmpdir(), 'ship-fast-export-no-source-'))
    process.chdir(tempCwd)
    vi.resetModules()

    try {
      const isolatedBuilder = await import('./openui-export-builder')
      const reactResult = await isolatedBuilder.buildOpenUIExport({
        source: `root = FitnessKimiPage("FitPulse Gym", ["Home"])`,
        siteSpecJson: JSON.stringify({ projectName: 'FitPulse Gym' }),
        sessionId: 'fitness-demo',
        target: 'react',
      })
      const nextResult = await isolatedBuilder.buildOpenUIExport({
        source: `root = FitnessKimiPage("FitPulse Gym", ["Home"])`,
        siteSpecJson: JSON.stringify({ projectName: 'FitPulse Gym' }),
        sessionId: 'fitness-demo',
        target: 'next',
      })

      for (const files of [
        unzipBuiltExportTextFiles(reactResult.body),
        unzipBuiltExportTextFiles(nextResult.body),
      ]) {
        expect(files['src/components/ui/sheet.tsx']).toMatch(
          /from ['"]\.\/portal-container['"]/,
        )
        expect(files['src/components/ui/portal-container.tsx']).toContain(
          'usePortalContainer',
        )
        expect(Object.values(files).join('\n')).not.toContain(
          '#/components/ui',
        )
        expect(Object.values(files).join('\n')).not.toContain('#/hooks/')
      }
    } finally {
      process.chdir(previousCwd)
      vi.resetModules()
      rmSync(tempCwd, { recursive: true, force: true })
    }
  })

  it('builds a Next.js ZIP without OpenUI internals', async () => {
    const result = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    expect(files['src/data/pages.ts']).toContain('Hello export')
    expect(files['app/layout.tsx']).toContain('Export Demo')
    expect(Object.values(files).join('\n')).not.toContain('@openuidev')
    expect(Object.values(files).join('\n')).not.toContain('defineComponent')
    expect(Object.values(files).join('\n')).not.toContain('root = Stack')
  })
})
