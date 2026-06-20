import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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
        'src/components/SaasKimiPage.tsx',
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

    try {
      process.chdir(tempCwd)
      const isolatedBuilder = await import(
        `./openui-export-builder?isolated=${Date.now()}`
      )
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
        expect(Object.values(files).join('\n')).not.toContain('#/components/ui')
        expect(Object.values(files).join('\n')).not.toContain('#/hooks/')
      }
    } finally {
      process.chdir(previousCwd)
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

  it('translates Lakebed-backed commerce pages to native React app state', async () => {
    const result = await buildOpenUIExport({
      source:
        'root = EcommerceKimiPage("Native Store", ["Home"], {"brand":"Native Store"})',
      siteSpecJson: JSON.stringify({ projectName: 'Native Store' }),
      sessionId: 'commerce-demo',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const output = Object.values(files).join('\n')
    const dependencies = readPackageDependencies(files)

    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      "import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'",
    )
    expect(files['vite.config.ts']).toContain(
      "import tailwindcss from '@tailwindcss/vite'",
    )
    expect(files['vite.config.ts']).toContain('tailwindcss()')
    expect(files['src/styles.css']).toContain('@theme')
    expect(files['src/styles.css']).toContain('--background:')
    expect(files['src/styles.css']).toContain(
      '--color-background: var(--background);',
    )
    expect(files['src/styles.css']).toContain(
      '--color-foreground: var(--foreground);',
    )
    expect(files['src/styles.css']).toContain(
      '--color-primary: var(--primary);',
    )
    expect(files['src/styles.css']).toContain('--radius-lg: var(--radius);')
    expect(files['src/styles.css']).toContain('color-scheme: dark;')
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'export type EcommerceKimiPageProps = {',
    )
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'brand?: string',
    )
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'queryKey: siteQueryKey(',
    )
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'queryFn: () => readSiteData(',
    )
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'mutationKey: siteMutationKey(',
    )
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'mutationFn: (args: unknown[]) => runSiteMutation(',
    )
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'formatCurrency',
    )
    expect(files['src/lib/site-data.ts']).toContain('const initialStore')
    expect(files['src/main.tsx']).toContain('QueryClientProvider')
    expect(files['src/main.tsx']).toContain('new QueryClient')
    expect(files['src/lib/site-data.ts']).toContain(
      "import type { QueryClient } from '@tanstack/react-query'",
    )
    expect(files['src/lib/site-data.ts']).toContain(
      'favoriteProductNames: new Set<string>()',
    )
    expect(files['src/lib/site-data.ts']).toContain('function applyMutation')
    expect(files['src/lib/site-data.ts']).toContain('const normalizeQueryValue')
    expect(files['src/lib/site-data.ts']).toContain('const affectedQueryNames')
    expect(files['src/lib/site-data.ts']).toContain('new Set(value.filter')
    expect(files['src/lib/site-data.ts']).toContain('function createDemoAuth')
    expect(files['src/lib/site-data.ts']).toContain(
      'export async function readSiteData',
    )
    expect(files['src/lib/site-data.ts']).toContain(
      'export async function runSiteMutation',
    )
    expect(files['src/lib/site-data.ts']).toContain(
      'export function applySiteMutation',
    )
    expect(files['src/lib/site-data.ts']).toContain(
      'export function updateSiteQueries',
    )
    expect(files['src/lib/site-data.ts']).toContain(
      "import { routes } from '../data/pages'",
    )
    expect(files['src/lib/site-data.ts']).toContain(
      'function productsCollection',
    )
    expect(files['src/lib/site-data.ts']).toContain('defaultCommerceProducts')
    expect(files['src/lib/site-data.ts']).toContain(
      'products: productsCollection()',
    )
    expect(files['src/lib/site-data.ts']).toContain("'Signature Series'")
    expect(files['src/lib/site-data.ts']).toContain('const productFromStore')
    expect(files['src/lib/site-data.ts']).toContain('orderLines: []')
    expect(files['src/lib/site-data.ts']).toContain('const stableId')
    expect(files['src/lib/site-data.ts']).toContain('const lineMatches')
    expect(files['src/lib/site-data.ts']).toContain('const restaurantFromStore')
    expect(files['src/lib/site-data.ts']).toContain(
      'productId: productRecord.id',
    )
    expect(files['src/lib/site-data.ts']).toContain(
      'restaurantId: restaurantRecord.id',
    )
    expect(files['src/lib/site-data.ts']).toContain(
      "const listName = /order/i.test(name) ? 'orderLines' : 'cartLines'",
    )
    expect(files['src/lib/site-data.ts']).toContain(
      "if (/order/i.test(name)) return readQueryValue(store, 'orderLines')",
    )
    expect(files['src/lib/site-data.ts']).toContain('product,')
    expect(dependencies).toHaveProperty('@tanstack/react-query')
    expect(dependencies).not.toHaveProperty('zod')
    expect(dependencies).not.toHaveProperty('@ship-fast/lakebed')
    const packageJson = parseJson(files['package.json']) as {
      devDependencies?: Record<string, string>
    }
    expect(packageJson.devDependencies).toHaveProperty('@tailwindcss/vite')
    expect(output).not.toContain('PropsSchema')
    expect(output).not.toContain('z.infer')
    expect(output).not.toContain('zod')
    expect(output).not.toContain('@ship-fast/lakebed')
    expect(output).not.toContain('lakebed.')
    expect(output).not.toContain('useSiteData')
    expect(output).not.toContain('siteData.useQuery')
    expect(output).not.toContain('siteData.useMutation')
    expect(output).not.toContain('GeneratedPage')
    expect(output).not.toContain('GeneratedRoute')
    expect(output).not.toContain('root =')
    expect(output).not.toContain('@openuidev')
  })

  it('translates Lakebed-backed commerce pages to Next API routes with in-memory data', async () => {
    const result = await buildOpenUIExport({
      source:
        'root = EcommerceKimiPage("Native Store", ["Home"], {"brand":"Native Store"})',
      siteSpecJson: JSON.stringify({ projectName: 'Native Store' }),
      sessionId: 'commerce-demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const output = Object.values(files).join('\n')
    const dependencies = readPackageDependencies(files)

    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      "import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'",
    )
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'queryKey: siteQueryKey(',
    )
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'queryFn: () => readSiteData(',
    )
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'mutationKey: siteMutationKey(',
    )
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'mutationFn: (args: unknown[]) => runSiteMutation(',
    )
    expect(files['src/components/EcommerceKimiPage.tsx']).toContain(
      'formatCurrency',
    )
    expect(files['src/lib/site-data.ts']).toContain(
      'fetch(`/api/data?query=${encodeURIComponent(name)}`',
    )
    expect(files['src/lib/site-data.ts']).toContain(
      "from './site-data-actions'",
    )
    expect(files['src/lib/site-data.ts']).toContain(
      'return runSiteMutationAction(name, args)',
    )
    expect(files['src/lib/site-data.ts']).toContain(
      "import type { QueryClient } from '@tanstack/react-query'",
    )
    expect(files['src/lib/site-data.ts']).toContain(
      'favoriteProductNames: new Set<string>()',
    )
    expect(files['src/lib/site-data.ts']).toContain('const normalizeQueryValue')
    expect(files['src/lib/site-data.ts']).toContain(
      'export async function readSiteData',
    )
    expect(files['src/lib/site-data.ts']).toContain(
      'export async function runSiteMutation',
    )
    expect(files['src/lib/site-data.ts']).toContain(
      'export function applySiteMutation',
    )
    expect(files['src/lib/site-data.ts']).toContain("readRemote('auth')")
    expect(files['src/lib/site-data.ts']).toContain("writeRemote('auth:signIn'")
    expect(files['app/layout.tsx']).toContain('SiteDataProvider')
    expect(files['src/lib/site-data-provider.tsx']).toContain(
      'QueryClientProvider',
    )
    expect(files['src/lib/site-data-actions.ts']).toContain("'use server'")
    expect(files['src/lib/site-data-actions.ts']).toContain(
      'export async function runSiteMutationAction',
    )
    expect(files['src/lib/site-data-actions.ts']).toContain(
      'export async function signInWithGoogleAction',
    )
    expect(files['src/lib/site-data-store.ts']).toContain('const database')
    expect(files['src/lib/site-data-store.ts']).toContain(
      '__shipFastSiteDataDatabase',
    )
    expect(files['src/lib/site-data-store.ts']).toContain(
      '__shipFastSiteDataAuth',
    )
    expect(files['src/lib/site-data-store.ts']).toContain('const readAuth')
    expect(files['src/lib/site-data-store.ts']).toContain('const writeAuth')
    expect(files['src/lib/site-data-store.ts']).toContain(
      "name === 'auth:signIn'",
    )
    expect(files['src/lib/site-data-store.ts']).toContain(
      'export function readSiteDataValue',
    )
    expect(files['src/lib/site-data-store.ts']).toContain(
      'export function runSiteMutationValue',
    )
    expect(files['app/api/data/route.ts']).toContain(
      "from '../../../src/lib/site-data-store'",
    )
    expect(files['app/api/data/route.ts']).toContain(
      'export async function GET',
    )
    expect(files['app/api/data/route.ts']).toContain(
      'export async function POST',
    )
    expect(files['src/lib/site-data-store.ts']).toContain(
      "import { routes } from '../data/pages'",
    )
    expect(files['src/lib/site-data-store.ts']).toContain(
      'function productsCollection',
    )
    expect(files['src/lib/site-data-store.ts']).toContain(
      'defaultCommerceProducts',
    )
    expect(files['src/lib/site-data-store.ts']).toContain(
      'products: productsCollection()',
    )
    expect(files['src/lib/site-data-store.ts']).toContain("'Signature Series'")
    expect(files['src/lib/site-data-store.ts']).toContain(
      'const productFromDatabase',
    )
    expect(files['src/lib/site-data-store.ts']).toContain('orderLines: []')
    expect(files['src/lib/site-data-store.ts']).toContain('const stableId')
    expect(files['src/lib/site-data-store.ts']).toContain('const lineMatches')
    expect(files['src/lib/site-data-store.ts']).toContain(
      'const restaurantFromDatabase',
    )
    expect(files['src/lib/site-data-store.ts']).toContain(
      'productId: productRecord.id',
    )
    expect(files['src/lib/site-data-store.ts']).toContain(
      'restaurantId: restaurantRecord.id',
    )
    expect(files['src/lib/site-data-store.ts']).toContain(
      "const listName = /order/i.test(name) ? 'orderLines' : 'cartLines'",
    )
    expect(files['src/lib/site-data-store.ts']).toContain('product,')
    expect(files['next.config.mjs']).toContain('images.pexels.com')
    expect(files['next.config.mjs']).toContain('picsum.photos')
    expect(files['next.config.mjs']).toContain('turbopack')
    expect(files['next.config.mjs']).toContain('root: projectRoot')
    expect(files['postcss.config.mjs']).toContain('@tailwindcss/postcss')
    expect(files['tsconfig.json']).toContain('"noImplicitAny": false')
    const packageJson = parseJson(files['package.json']) as {
      devDependencies?: Record<string, string>
    }
    expect(packageJson.devDependencies).toHaveProperty('@tailwindcss/postcss')
    expect(packageJson.devDependencies).toHaveProperty('postcss')
    expect(dependencies).toHaveProperty('@tanstack/react-query')
    expect(dependencies).not.toHaveProperty('zod')
    expect(dependencies).not.toHaveProperty('@ship-fast/lakebed')
    expect(output).not.toContain('PropsSchema')
    expect(output).not.toContain('z.infer')
    expect(output).not.toContain('zod')
    expect(output).not.toContain('@ship-fast/lakebed')
    expect(output).not.toContain('lakebed.')
    expect(output).not.toContain('useSiteData')
    expect(output).not.toContain('siteData.useQuery')
    expect(output).not.toContain('siteData.useMutation')
    expect(output).not.toContain('GeneratedPage')
    expect(output).not.toContain('GeneratedRoute')
    expect(output).not.toContain('@openuidev')
    expect(output).not.toContain('root =')
  })

  it('translates source Lakebed endpoints to Next route handlers', () => {
    const files = renderNextEndpointRouteFiles([
      {
        componentName: 'WebhookKimiPage',
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
        'root = AboutKimiPage("Native Store", ["Home"], {"heading":"About Native Store"})',
      siteSpecJson: JSON.stringify({ projectName: 'Native Store' }),
      sessionId: 'about-demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    expect(files['src/components/AboutKimiPage.tsx']).toContain(
      "import type { ReactNode } from 'react'",
    )
    expect(files['src/components/AboutKimiPage.tsx']).toContain('ReactNode')
    expect(files['src/components/AboutKimiPage.tsx']).toContain(
      'export type AboutKimiPageProps = {',
    )
    expect(files['src/components/AboutKimiPage.tsx']).toContain('hero?: {')
    expect(files['src/components/AboutKimiPage.tsx']).not.toContain(
      'AboutKimiPagePropsSchema',
    )
    expect(files['src/components/AboutKimiPage.tsx']).not.toContain('z.infer')
  })
})
