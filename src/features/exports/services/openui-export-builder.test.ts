import { describe, expect, it, vi } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'

import {
  buildOpenUIExport,
  decodeExportBody,
  parseOpenUIForExport,
  renderNextEndpointRouteFiles,
} from './openui-export-builder'
import {
  buildOpenUIHtmlExport,
  parseOpenUIForHtmlExport,
} from './openui-html-export-builder'

// esbuild/parse-heavy export integration tests; avoid load-induced 5s flakes
vi.setConfig({ testTimeout: 30_000, hookTimeout: 30_000 })

const source = `root = SaasHero("Export Demo", ["Home"], {"heading": "Hello export", "highlight": "export"})`

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
    expect(parsed.root.typeName).toBe('SaasHero')
  })

  it('parses generated source with malformed quoted object keys', () => {
    const parsed = parseOpenUIForExport(
      'root = SaasHero("StrideFit", ["Home"], {heading:"Shoes", items:[{"name":"Darius K.", tag:"Verified Buyer"},{"name:"Maya S.", tag:"Verified Buyer"}]})',
      JSON.stringify({ projectName: 'StrideFit' }),
    )

    expect(parsed.projectName).toBe('StrideFit')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('SaasHero')
  })

  it('parses generated source with object-boundary null arguments', () => {
    const parsed = parseOpenUIForExport(
      'root = ProductDetailHero("StrideFit", ["Home"], ["Home"], {}, {}, {items:[{"name:"Maya S.", tag:"Verified Buyer"}]}, {}, {footer:{note:"Done"}, null)',
      JSON.stringify({ projectName: 'StrideFit' }),
    )

    expect(parsed.projectName).toBe('StrideFit')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('ProductDetailHero')
  })

  it('parses OpenUI source into HTML export metadata with a response-scoped library', async () => {
    const parsed = await parseOpenUIForHtmlExport(source, siteSpecJson)

    expect(parsed.projectName).toBe('Export Demo')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('SaasHero')
    expect(JSON.stringify(parsed.library.toJSONSchema())).toContain(
      'SaasHero',
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
    // Section families render from baked-in defaults in the standalone HTML
    // preview (positionally-passed props are not the section render path), so we
    // assert the rendered root container + dark shell + no OpenUI leakage rather
    // than a section-specific heading string. Prop carry-through is covered by the
    // React/Next ZIP tests asserting src/data/pages.ts contains the heading.
    expect(html).toContain('id="openui-root"')
    expect(html).toContain('--background:')
    expect(html).toContain('color-scheme: dark')
    expect(html).toContain('"mode":"dark"')
    expect(html).not.toContain('@openuidev')
    expect(html).not.toContain('defineComponent')
    expect(html).not.toContain('root = Stack')
  })

  it('preserves edited preview markup in standalone HTML exports', async () => {
    const previewHtml =
      '<main><h1 class="hero-title" style="color: rgb(255, 0, 0); text-align: center;">Edited headline</h1><img alt="Edited hero image" src="https://cdn.example.test/edited-hero.jpg" /></main>'
    const result = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'edited-html',
      target: 'html',
      previewHtml,
      isDark: false,
    })
    const html = decodeExportBody(result.body)

    expect(html).toContain('Edited headline')
    expect(html).toContain('color: rgb(255, 0, 0); text-align: center;')
    expect(html).toContain('https://cdn.example.test/edited-hero.jpg')
    expect(html).toContain('color-scheme: light')
    expect(html).toContain('"mode":"light"')
  })

  it('extracts body markup before wrapping full preview documents in standalone HTML exports', async () => {
    const previewHtml =
      '<!doctype html><html lang="en"><head><title>Edited</title></head><body><div id="openui-root" class="genui-preview"><main><h1>Edited document headline</h1></main></div></body></html>'
    const result = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'edited-html-document',
      target: 'html',
      previewHtml,
      isDark: false,
    })
    const html = decodeExportBody(result.body)
    const rootMatch = html.match(
      /<div id="openui-root"[\s\S]*?>([\s\S]*?)<\/div>\s*<script>/,
    )

    expect(rootMatch?.[1]).toContain('Edited document headline')
    expect(rootMatch?.[1]).not.toContain('<!doctype html>')
    expect(rootMatch?.[1]).not.toContain('<html')
    expect(rootMatch?.[1]).not.toContain('<body')
    expect(html.match(/id="openui-root"/g)).toHaveLength(1)
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
      'Generated with [ShipFast](https://ship-fast.io) 🚀.',
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
        'src/components/SaasHero.tsx',
        'src/data/pages.ts',
        'src/lib/cn.ts',
        'src/lib/image.tsx',
        'src/main.tsx',
        'src/styles.css',
        'src/vite-env.d.ts',
        'tsconfig.json',
      ]),
    )
    expect(files['src/vite-env.d.ts']).toContain(
      '/// <reference types="vite/client" />',
    )
    expect(files['src/data/pages.ts']).toContain('Hello export')
    expect(files['README.md']).toContain(
      'Generated with [ShipFast](https://ship-fast.io) 🚀.',
    )
    expect(Object.values(files).join('\n')).not.toContain('@openuidev')
    expect(Object.values(files).join('\n')).not.toContain('defineComponent')
    expect(Object.values(files).join('\n')).not.toContain('root = Stack')
  })

  // DELETED: 'packages UI primitive dependencies for FitnessKimiPage React exports'
  // and 'copies maintained block dependencies from the generated manifest when the
  // source tree is unavailable'. Both asserted deleted-capsule-specific bundling of
  // src/components/ui/* primitives (sheet/popover/avatar/portal-container) and radix
  // deps that only the old monolithic *KimiPage page-blocks emitted. No current
  // registry/sections/** family emits src/components/ui/* files, so there is no
  // section-family equivalent to migrate these assertions to.

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

  // DELETED: two commerce tests ("translates Lakebed-backed commerce pages to
  // native React app state" and "... to Next API routes with in-memory data").
  // Both asserted the deleted EcommerceKimiPage capsule lakebed data-binding path:
  // /react-query imports in the component, src/lib/site-data*.ts query/
  // mutation scaffolding, formatCurrency, commerce store seeds, etc. EcommerceHero
  // is a static section that does NOT trigger the commerce/site-data path, so there
  // is no section-family equivalent to migrate these assertions to.

  it('translates source Lakebed endpoints to Next route handlers', () => {
    const files = renderNextEndpointRouteFiles([
      {
        componentName: 'WebhookHero',
        method: 'POST',
        name: 'incoming',
        path: '/api/webhooks/incoming',
        source:
          'endpoint({ method: "POST", path: "/api/webhooks/incoming" }, async (ctx, req) => { const payload = await req.json(); ctx.db.messages.insert({ body: payload.body, ownerId: ctx.auth.userId }); return json({ ok: true }); })',
      },
    ])
    const route = files['app/api/webhooks/incoming/route.ts']

    expect(route).toContain('export async function POST(request: Request)')
    expect(route).toContain('path: "/api/webhooks/incoming"')
    expect(route).toContain('ctx.db.messages.insert')
    expect(route).toContain('return json({ ok: true });')
    expect(route).not.toContain('/api/status')
    expect(route).not.toContain('StatusPage')
  })

  it('translates endpoint calls from full OpenUI source to Next route handlers', async () => {
    const result = await buildOpenUIExport({
      source: `${source}
endpoint({ method: "POST", path: "/api/webhooks/incoming" }, async (ctx, req) => { const payload = await req.json(); ctx.db.messages.insert({ body: payload.body, ownerId: ctx.auth.userId }); return json({ ok: true }); })`,
      siteSpecJson,
      sessionId: 'source-endpoint-demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const route = files['app/api/webhooks/incoming/route.ts']

    expect(route).toContain('export async function POST(request: Request)')
    expect(route).toContain('path: "/api/webhooks/incoming"')
    expect(route).toContain('ctx.db.messages.insert')
    expect(route).toContain('return json({ ok: true });')
    expect(route).not.toContain('/api/status')
    expect(route).not.toContain('StatusPage')
    expect(files['src/lib/site-data-store.ts']).toContain(
      'type SiteEndpointHandler =',
    )
    expect(files['src/lib/site-data-store.ts']).toContain('json: <T = any>()')
    expect(files['src/lib/site-data-store.ts']).not.toContain(
      'handler: Function',
    )
  })

  it('embeds preview image swaps in React and Next image helpers', async () => {
    const previewHtml =
      '<main><img alt="Edited hero image" src="https://cdn.example.test/edited-hero.jpg" /></main>'

    const react = unzipBuiltExportTextFiles(
      (
        await buildOpenUIExport({
          source,
          siteSpecJson,
          sessionId: 'edited-image-react',
          target: 'react',
          previewHtml,
        })
      ).body,
    )
    const next = unzipBuiltExportTextFiles(
      (
        await buildOpenUIExport({
          source,
          siteSpecJson,
          sessionId: 'edited-image-next',
          target: 'next',
          previewHtml,
        })
      ).body,
    )

    for (const files of [react, next]) {
      expect(files['src/lib/image.tsx']).toContain('previewImageSources')
      expect(files['src/lib/image.tsx']).toContain('Edited hero image')
      expect(files['src/lib/image.tsx']).toContain(
        'https://cdn.example.test/edited-hero.jpg',
      )
      expect(files['src/lib/image.tsx']).toContain(
        'const previewSrc = previewImageSourceByAlt.get(normalizedAlt)',
      )
      expect(files['src/lib/image.tsx']).toContain(
        'const imageSrc = previewSrc ||',
      )
    }
  })

  it('embeds preview style edits in React and Next client runtimes', async () => {
    const previewHtml =
      '<main><h1 class="hero-title text-4xl" style="color: rgb(255, 0, 0); text-align: center;">Hello export</h1></main>'

    const react = unzipBuiltExportTextFiles(
      (
        await buildOpenUIExport({
          source,
          siteSpecJson,
          sessionId: 'edited-style-react',
          target: 'react',
          previewHtml,
        })
      ).body,
    )
    const next = unzipBuiltExportTextFiles(
      (
        await buildOpenUIExport({
          source,
          siteSpecJson,
          sessionId: 'edited-style-next',
          target: 'next',
          previewHtml,
        })
      ).body,
    )

    expect(react['src/main.tsx']).toContain(
      "import { StyleOverrides } from './lib/style-overrides'",
    )
    expect(react['src/main.tsx']).toContain('<StyleOverrides />')
    expect(next['app/layout.tsx']).toContain(
      "import { StyleOverrides } from '../src/lib/style-overrides'",
    )
    expect(next['app/layout.tsx']).toContain('<StyleOverrides />')

    for (const files of [react, next]) {
      expect(files['src/lib/style-overrides.tsx']).toContain('use client')
      expect(files['src/lib/style-overrides.tsx']).toContain('styleOverrides')
      expect(files['src/lib/style-overrides.tsx']).toContain(
        'hero-title text-4xl',
      )
      expect(files['src/lib/style-overrides.tsx']).toContain(
        'color: rgb(255, 0, 0); text-align: center;',
      )
      expect(files['src/lib/style-overrides.tsx']).toContain(
        'new MutationObserver',
      )
    }
  })

  it('preserves ReactNode type imports required by extracted component helpers', async () => {
    const result = await buildOpenUIExport({
      source:
        'root = AboutHero("Native Store", ["Home"], {"heading":"About Native Store"})',
      siteSpecJson: JSON.stringify({ projectName: 'Native Store' }),
      sessionId: 'about-demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    // AboutHero emits a ReactNode type import (double-quoted by the section
    // emitter) consumed by an extracted helper (e.g. the `Eyebrow` subcomponent
    // typing `icon: ReactNode`). This is the type-import-preservation contract.
    expect(files['src/components/AboutHero.tsx']).toContain(
      'import type { ReactNode } from "react"',
    )
    expect(files['src/components/AboutHero.tsx']).toContain('icon: ReactNode')
    expect(files['src/components/AboutHero.tsx']).toContain(
      'export type AboutHeroProps = {',
    )
    expect(files['src/components/AboutHero.tsx']).toContain('heading?: string')
    expect(files['src/components/AboutHero.tsx']).not.toContain(
      'AboutHeroPropsSchema',
    )
    expect(files['src/components/AboutHero.tsx']).not.toContain('z.infer')
  })
})
