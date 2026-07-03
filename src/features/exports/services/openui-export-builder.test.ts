import { parseHTML } from 'linkedom'
import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import ts from 'typescript'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'esbuild'
import { JSDOM } from 'jsdom'

import {
  buildOpenUIExport,
  decodeExportBody,
  parseOpenUIForExport,
  renderNextEndpointRouteFiles,
} from './openui-export-builder'
import {
  EXPORT_PRETTIER_OPTIONS,
  formatExportFiles,
} from './format-export-files'
import { resolveBlockSourceManifestPath } from './block-source-manifest'
import {
  buildOpenUIHtmlExport,
  parseOpenUIForHtmlExport,
} from './openui-html-export-builder'

const source = `root = SaasHero("Export Demo", ["Home"], {"heading": "Hello export", "highlight": "export"})`
const routedSource = `root = PageSwitch(["Home", "Pricing"], [home, pricing], "", {"Get Started":"Pricing#pricing_pricing","get started":"Pricing#pricing_pricing","Pricing":"Pricing"})
homeText = Text("Home")
pricingText = Text("Pricing")
home = Stack([homeText])
pricing = Stack([pricingText])`

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

const parseHtmlDocument = (html: string) => parseHTML(html).document

const collectWindowRuntimeErrors = (dom: JSDOM) => {
  const errors: unknown[] = []

  dom.window.addEventListener('error', (event: ErrorEvent) => {
    errors.push(event.error ?? event.message)
  })
  dom.window.addEventListener(
    'unhandledrejection',
    (event: Event & { reason?: unknown }) => {
      errors.push(event.reason ?? event)
    },
  )

  return errors
}

const flushWindowPromises = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await new Promise((resolve) => setTimeout(resolve, 0))
}

const writeExportFiles = (files: Record<string, string>, directory: string) => {
  for (const [path, fileSource] of Object.entries(files)) {
    const absolutePath = join(directory, path)
    mkdirSync(join(absolutePath, '..'), { recursive: true })
    writeFileSync(absolutePath, fileSource)
  }
}

const loadBundledCommonJsModule = async (
  entryPoint: string,
): Promise<Record<string, unknown>> => {
  const result = await build({
    bundle: true,
    entryPoints: [entryPoint],
    format: 'cjs',
    logLevel: 'silent',
    platform: 'node',
    target: 'node20',
    write: false,
  })
  const module = { exports: {} as Record<string, unknown> }
  const requireStub = (specifier: string) => {
    throw new Error(`Unexpected external dependency: ${specifier}`)
  }
  const output = result.outputFiles[0]
  if (!output) throw new Error('esbuild did not return bundled route output')

  new Function('module', 'exports', 'require', output.text)(
    module,
    // eslint-disable-next-line import/no-commonjs
    module.exports,
    requireStub,
  )
  // eslint-disable-next-line import/no-commonjs
  return module.exports
}

const loadDirectGeneratedEndpointRoute = async (routeSource: string) => {
  const directory = mkdtempSync(join(tmpdir(), 'ship-fast-next-route-'))
  try {
    writeExportFiles(
      {
        'app/api/webhooks/incoming/route.ts': routeSource,
        'src/lib/store.ts': `
          export const endpoint = (_definition: unknown, handler: unknown) => ({ handler })
          export const json = (value: unknown, init?: ResponseInit) => ({ kind: 'json', value, init })
          export const text = (value: string, init?: ResponseInit) => new Response(value, init)
          export const empty = (init?: ResponseInit) => new Response(null, init)
          export const redirect = (url: string, init?: ResponseInit) => Response.redirect(url, init?.status ?? 302)
          export const toEndpointRequest = (request: Request) => request
          export const toEndpointResponse = (result: unknown) => {
            if (result instanceof Response) return result
            if (result && typeof result === 'object' && (result as { kind?: string }).kind === 'json') {
              const jsonResult = result as { value: unknown; init?: ResponseInit }
              return Response.json(jsonResult.value, jsonResult.init)
            }
            return Response.json(result)
          }
          export const createSiteEndpointContext = () => ({
            auth: { userId: 'route-user' },
            db: {
              messages: {
                insert(value: unknown) {
                  ;((globalThis as any).__shipFastRouteInserts ??= []).push({
                    collection: 'messages',
                    value,
                  })
                  return value
                },
              },
            },
          })
        `,
      },
      directory,
    )
    return await loadBundledCommonJsModule(
      join(directory, 'app/api/webhooks/incoming/route.ts'),
    )
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

const loadBuiltExportRoute = async (
  files: Record<string, string>,
  routePath: string,
) => {
  const directory = mkdtempSync(join(tmpdir(), 'ship-fast-built-route-'))
  try {
    writeExportFiles(files, directory)
    return await loadBundledCommonJsModule(join(directory, routePath))
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

const renderExportedBrowserEntry = async (
  files: Record<string, string>,
  entrySource: string,
  url = 'https://export.test/',
) => {
  const directory = mkdtempSync(join(tmpdir(), 'ship-fast-browser-entry-'))
  try {
    writeExportFiles(files, directory)
    writeFileSync(join(directory, 'test-entry.tsx'), entrySource)
    const bundled = await build({
      bundle: true,
      define: {
        'import.meta.env.VITE_SERVER_URL': JSON.stringify(
          'https://ship-fast.io',
        ),
      },
      entryPoints: [join(directory, 'test-entry.tsx')],
      format: 'iife',
      jsx: 'automatic',
      logLevel: 'silent',
      nodePaths: [join(process.cwd(), 'node_modules')],
      platform: 'browser',
      plugins: [
        {
          name: 'export-browser-entry-stubs',
          setup(pluginBuild) {
            pluginBuild.onResolve(
              { filter: /^react$/, namespace: 'react-router-dom-stub' },
              () => ({
                path: join(process.cwd(), 'node_modules/react/index.js'),
              }),
            )
            pluginBuild.onResolve({ filter: /^react-router-dom$/ }, () => ({
              namespace: 'react-router-dom-stub',
              path: 'react-router-dom',
            }))
            pluginBuild.onResolve({ filter: /^@ship-fast\// }, (args) => ({
              errors: [
                {
                  text: `Exported browser bundle leaked workspace package import: ${args.path}`,
                },
              ],
            }))
            pluginBuild.onResolve({ filter: /^@\// }, (args) => ({
              path: join(directory, args.path.replace(/^@\//, 'src/')),
            }))
            pluginBuild.onLoad(
              {
                filter: /^react-router-dom$/,
                namespace: 'react-router-dom-stub',
              },
              () => ({
                contents: `import React from "react";
const Fragment = React.Fragment;
export const BrowserRouter = ({ children }) => React.createElement(Fragment, null, children);
export const HashRouter = BrowserRouter;
export const MemoryRouter = BrowserRouter;
export const Routes = ({ children }) => React.createElement(Fragment, null, children);
export const Route = ({ element, children }) => element ?? React.createElement(Fragment, null, children);
export const Link = ({ children, to = "#", ...props }) => React.createElement("a", { ...props, href: String(to) }, children);
export const NavLink = Link;
export const Navigate = () => null;
export function useNavigate() { return () => {}; }
export function useLocation() { return { pathname: "/", search: "", hash: "", state: null, key: "default" }; }
export function useParams() { return {}; }
`,
                loader: 'tsx',
              }),
            )
            pluginBuild.onResolve(
              { filter: /^next\/(navigation|link|image)$/ },
              (args) => ({
                namespace: 'next-stub',
                path: args.path,
              }),
            )
            pluginBuild.onLoad(
              { filter: /.*/, namespace: 'next-stub' },
              (args) => {
                if (args.path === 'next/link') {
                  return {
                    contents: `import React from "react";
export default function Link({ children, href = "#", ...props }) {
  return React.createElement("a", { ...props, href: String(href) }, children);
}`,
                    loader: 'tsx',
                  }
                }
                if (args.path === 'next/image') {
                  return {
                    contents: `import React from "react";
export default function Image(props) {
  return React.createElement("img", props);
}`,
                    loader: 'tsx',
                  }
                }
                return {
                  contents: `export function useRouter() { return { push() {}, replace() {}, prefetch() {} }; }
export function usePathname() { return "/"; }
export function useSearchParams() { return new URLSearchParams(); }`,
                  loader: 'js',
                }
              },
            )
            pluginBuild.onResolve({ filter: /\.css$/ }, (args) => ({
              namespace: 'css-stub',
              path: args.path,
            }))
            pluginBuild.onLoad({ filter: /.*/, namespace: 'css-stub' }, () => ({
              contents: '',
              loader: 'js',
            }))
          },
        },
      ],
      write: false,
    })
    const dom = new JSDOM('<div id="root"></div>', {
      runScripts: 'outside-only',
      url,
    })
    ;(
      dom.window as Window & { process?: { env: Record<string, string> } }
    ).process = { env: {} }
    const runtimeErrors = collectWindowRuntimeErrors(dom)
    let renderError: unknown
    try {
      dom.window.eval(bundled.outputFiles[0]?.text ?? '')
    } catch (error) {
      renderError = error
    }
    await flushWindowPromises()
    await flushWindowPromises()
    return { dom, renderError, runtimeErrors }
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

const extractRouteScriptText = (html: string): string => {
  const document = parseHtmlDocument(html)
  for (const script of document.querySelectorAll('script')) {
    const text = script.textContent ?? ''
    if (text.includes('targetMap') || text.includes('__SHIP_FAST_EXPORT__')) {
      return text
    }
  }
  return ''
}

const extractTargetMap = (scriptText: string): Record<string, string> => {
  const match = scriptText.match(/var targetMap = (\{[\s\S]*?\});/)
  if (!match?.[1]) return {}
  return JSON.parse(match[1]) as Record<string, string>
}

const v2ComposedExportSource = `root = PageSwitch(["Home"], [home])
homeHero = EcommerceHero()
homeHeroAnchor = SectionAnchor("home_hero", homeHero, "scroll-mt-28")
homeDetail = ProductDetailHero({"title":"Aurora Pro"})
home = Stack([homeHeroAnchor, homeDetail])`

describe('openui-export-builder', () => {
  it('parses OpenUI source into export metadata', () => {
    const parsed = parseOpenUIForExport(source, siteSpecJson)

    expect(parsed.projectName).toBe('Export Demo')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('SaasHero')
  })

  it('parses PageSwitch target maps for route and section navigation', () => {
    const parsed = parseOpenUIForExport(routedSource, siteSpecJson)

    expect(parsed.routes).toEqual(['Home', 'Pricing'])
    expect(parsed.targetMap['Get Started']).toBe('Pricing#pricing_pricing')
    expect(parsed.targetMap['get started']).toBe('Pricing#pricing_pricing')
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
    expect(JSON.stringify(parsed.library.toJSONSchema())).toContain('SaasHero')
  })

  it('carries PageSwitch target maps into standalone HTML routing', async () => {
    const result = await buildOpenUIHtmlExport({
      source: routedSource,
      siteSpecJson,
      sessionId: 'routed-html',
      target: 'html',
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)
    const scriptText = extractRouteScriptText(html)
    const targetMap = extractTargetMap(scriptText)

    // targetMap is embedded as JSON in the route script
    expect(targetMap['Get Started']).toBe('Pricing#pricing_pricing')
    expect(targetMap['get started']).toBe('Pricing#pricing_pricing')

    // routes render as data-sf-export-page sections (first visible, rest hidden)
    const pages = document.querySelectorAll('[data-sf-export-page]')
    expect(pages).toHaveLength(2)
    expect(pages[0]?.getAttribute('hidden')).toBeNull()
    expect(pages[1]?.getAttribute('hidden')).not.toBeNull()

    const runtime = new JSDOM(html, {
      pretendToBeVisual: true,
      runScripts: 'dangerously',
      url: 'https://export.test/',
    })
    const scrolledSections: string[] = []
    runtime.window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    }
    Object.defineProperty(
      runtime.window.HTMLElement.prototype,
      'scrollIntoView',
      {
        configurable: true,
        value(this: HTMLElement) {
          scrolledSections.push(this.id)
        },
      },
    )

    const runtimePages = (
      runtime.window.document as Document
    ).querySelectorAll<HTMLElement>('[data-sf-export-page]')
    runtimePages[1]?.setAttribute('id', 'pricing_pricing')
    const button = runtime.window.document.createElement('button')
    button.type = 'button'
    button.textContent = 'Get Started'
    runtime.window.document.body.append(button)
    button.click()

    expect(runtimePages[0]?.hidden).toBe(true)
    expect(runtimePages[1]?.hidden).toBe(false)
    expect(runtime.window.location.hash).toBe('#pricing_pricing')
    expect(scrolledSections).toEqual(['pricing_pricing'])
  })

  it('builds standalone HTML with a dark shell and baked theme variables', async () => {
    const result = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'html',
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)

    expect(result.contentType).toBe('text/html; charset=utf-8')
    expect(result.filename).toBe('index.html')

    // root container + dark shell
    const root = document.querySelector('#openui-root')
    expect(root).not.toBeNull()
    expect(root?.getAttribute('class')).toContain('dark')

    // theme variables are baked into the :root style rule
    const style = document.querySelector('style')
    expect(style?.textContent).toContain('--background:')

    // color-scheme is set on the root container style
    expect(root?.getAttribute('style')).toContain('color-scheme: dark')
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
    const document = parseHtmlDocument(html)
    const root = document.querySelector('#openui-root')
    const headline = root?.querySelector('h1.hero-title')
    const image = root?.querySelector('img')

    expect(headline?.textContent).toBe('Edited headline')
    expect(headline?.getAttribute('style')).toBe(
      'color: rgb(255, 0, 0); text-align: center;',
    )
    expect(image?.getAttribute('src')).toBe(
      'https://cdn.example.test/edited-hero.jpg',
    )
    expect(image?.getAttribute('alt')).toBe('Edited hero image')

    // light shell: no dark class, color-scheme set to light
    expect(root?.getAttribute('class')).not.toContain('dark')
    expect(root?.getAttribute('style')).toContain('color-scheme: light')
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
    const document = parseHtmlDocument(html)
    const roots = document.querySelectorAll('#openui-root')

    // only one openui-root container in the wrapped output
    expect(roots).toHaveLength(1)
    const root = roots[0]
    // body markup is extracted: the headline survives, no document wrappers
    expect(root?.querySelector('main h1')?.textContent).toBe(
      'Edited document headline',
    )
    expect(root?.querySelector('html')).toBeNull()
    expect(root?.querySelector('head')).toBeNull()
    expect(root?.querySelector('body')).toBeNull()
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
    const pkg = JSON.parse(files['package.json']) as {
      scripts: Record<string, string>
    }
    expect(pkg.scripts.dev).toBe('vite --host 0.0.0.0')
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
  })

  it('runs exported React apps built from malformed generated restaurant props without runtime crashes', async () => {
    const result = await buildOpenUIExport({
      source:
        'root = RestaurantMenu({"heading":"Our Brew Selection","description":"Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.","categories":[{"name":"categories[Seasonal Releases","items":[{"description":"Tropical notes with a crisp finish","name":"Pineapple Saison","price":"$7","tag":"Limited"},{"description":"Rich cocoa and roasted malt","name":"Chocolate Stout","price":"$8","tag":"Seasonal"},{"description":"Balanced hop profile with citrus aroma","name":"Year-Round Classics>Portland Pale Ale","price":"$6","tag":"Core"},{"description":"Bold bitterness with pine and mango","name":"Hoppy IPA","price":"$7","tag":"Core]"}]}]})',
      siteSpecJson: JSON.stringify({ projectName: 'Craft Beer Brewery' }),
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const directory = mkdtempSync(join(tmpdir(), 'react-restaurant-export-'))

    try {
      writeExportFiles(files, directory)
      const bundled = await build({
        bundle: true,
        entryPoints: [join(directory, 'src/main.tsx')],
        format: 'iife',
        jsx: 'automatic',
        logLevel: 'silent',
        nodePaths: [join(process.cwd(), 'node_modules')],
        platform: 'browser',
        plugins: [
          {
            name: 'export-browser-test-stubs',
            setup(pluginBuild) {
              pluginBuild.onResolve(
                { filter: /^react$/, namespace: 'react-router-dom-stub' },
                () => ({
                  path: join(process.cwd(), 'node_modules/react/index.js'),
                }),
              )
              pluginBuild.onResolve({ filter: /^react-router-dom$/ }, () => ({
                namespace: 'react-router-dom-stub',
                path: 'react-router-dom',
              }))
              pluginBuild.onLoad(
                {
                  filter: /^react-router-dom$/,
                  namespace: 'react-router-dom-stub',
                },
                () => ({
                  contents: `import React from "react";
const Fragment = React.Fragment;
export const BrowserRouter = ({ children }) => React.createElement(Fragment, null, children);
export const HashRouter = BrowserRouter;
export const MemoryRouter = BrowserRouter;
export const Routes = ({ children }) => React.createElement(Fragment, null, children);
export const Route = ({ element, children }) => element ?? React.createElement(Fragment, null, children);
export const Link = ({ children, to = "#", ...props }) => React.createElement("a", { ...props, href: String(to) }, children);
export const NavLink = Link;
export const Navigate = () => null;
export function useNavigate() { return () => {}; }
export function useLocation() { return { pathname: "/", search: "", hash: "", state: null, key: "default" }; }
export function useParams() { return {}; }
`,
                  loader: 'tsx',
                }),
              )
              pluginBuild.onResolve({ filter: /\.css$/ }, (args) => ({
                namespace: 'css-stub',
                path: args.path,
              }))
              pluginBuild.onLoad(
                { filter: /.*/, namespace: 'css-stub' },
                () => ({ contents: '', loader: 'js' }),
              )
            },
          },
        ],
        write: false,
      })
      const dom = new JSDOM('<div id="root"></div>', {
        runScripts: 'outside-only',
        url: 'https://craft-beer-brewery.example.test/',
      })
      const runtimeErrors = collectWindowRuntimeErrors(dom)

      let renderError: unknown
      try {
        dom.window.eval(bundled.outputFiles[0].text)
      } catch (error) {
        renderError = error
      }
      await flushWindowPromises()

      expect(renderError).toBeUndefined()
      expect(runtimeErrors).toEqual([])
      expect(dom.window.document.body.textContent).toContain(
        'Our Brew Selection',
      )
      expect(dom.window.document.body.textContent).toContain('Pineapple Saison')
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
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
  })

  const assertAllFormattableFilesArePrettierFormatted = async (
    files: Record<string, string>,
  ) => {
    const reformatted = await formatExportFiles(files)
    for (const [path, original] of Object.entries(files)) {
      if (!/\.(ts|tsx|mjs|js|json|css|md)$/.test(path)) continue
      expect(reformatted[path], `file not prettier-formatted: ${path}`).toBe(
        original,
      )
    }
  }

  it('formats every React export file with the shared Ship Fast prettier config', async () => {
    const result = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    await assertAllFormattableFilesArePrettierFormatted(files)
  })

  it('formats every Next.js export file with the shared Ship Fast prettier config', async () => {
    const result = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    await assertAllFormattableFilesArePrettierFormatted(files)
  })

  it('uses no semicolons and single quotes in React export TypeScript', async () => {
    const result = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const tsx = files['src/components/SaasHero.tsx']
    expect(tsx).toBeDefined()
    // no statement-terminating semicolons
    expect(tsx).not.toMatch(/;\s*$/m)
    // single-quoted string literals present (import lines use single quotes)
    expect(tsx).toMatch(/from '/)
  })

  it('exposes export prettier options matching the repo config', () => {
    expect(EXPORT_PRETTIER_OPTIONS.semi).toBe(false)
    expect(EXPORT_PRETTIER_OPTIONS.singleQuote).toBe(true)
    expect(EXPORT_PRETTIER_OPTIONS.trailingComma).toBe('all')
  })

  it('does not ship a .env.local or any ship-fast.io server URL in React exports', async () => {
    const result = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    expect(Object.keys(files)).not.toContain('.env.local')
    expect(Object.values(files).join('\n')).not.toContain('VITE_SERVER_URL')
    expect(Object.values(files).join('\n')).not.toContain(
      'NEXT_PUBLIC_SERVER_URL',
    )
  })

  it('does not ship a .env.local or any ship-fast.io server URL in Next exports', async () => {
    const result = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    expect(Object.keys(files)).not.toContain('.env.local')
    expect(Object.values(files).join('\n')).not.toContain(
      'NEXT_PUBLIC_SERVER_URL',
    )
    expect(Object.values(files).join('\n')).not.toContain('VITE_SERVER_URL')
  })

  it('whitelists only pexels, picsum, and unsplash image hosts in Next config (no ship-fast.io)', async () => {
    const result = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const nextConfig = files['next.config.mjs']
    expect(nextConfig).toBeDefined()
    expect(nextConfig).toContain('images.pexels.com')
    expect(nextConfig).toContain('picsum.photos')
    expect(nextConfig).toContain('images.unsplash.com')
    expect(nextConfig).not.toContain('ship-fast.io')
  })

  // Single explicit guard: exported artifacts (standalone HTML + React/Next
  // ZIPs) must never leak OpenUI internals (@openuidev imports, Vue
  it('uses clean route component names derived from labels (no RoutePage prefix)', async () => {
    const result = await buildOpenUIExport({
      source: routedSource,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    expect(files['src/components/HomePage.tsx']).toBeDefined()
    expect(files['src/components/PricingPage.tsx']).toBeDefined()
    expect(Object.keys(files)).not.toContain(
      'src/components/RoutePage1Home.tsx',
    )
    expect(Object.keys(files)).not.toContain(
      'src/components/RoutePage2Pricing.tsx',
    )
  })

  it('inlines Next page files without routes.find indirection or props spread', async () => {
    const result = await buildOpenUIExport({
      source: routedSource,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const homePage = files['app/page.tsx']
    const pricingPage = files['app/pricing/page.tsx']
    expect(homePage).toBeDefined()
    expect(pricingPage).toBeDefined()
    // No routes.find indirection
    expect(homePage).not.toContain('routes.find')
    expect(pricingPage).not.toContain('routes.find')
    // No props spread / props type import
    expect(homePage).not.toContain('route.props')
    expect(pricingPage).not.toContain('route.props')
    expect(homePage).not.toContain('Props')
    expect(pricingPage).not.toContain('Props')
    // Direct component import and render
    expect(homePage).toMatch(/import \{ HomePage \}/)
    expect(homePage).toContain('<HomePage />')
    expect(pricingPage).toMatch(/import \{ PricingPage \}/)
    expect(pricingPage).toContain('<PricingPage />')
  })

  it('creates QueryClient at module level in Next QueryProvider (not inside useState)', async () => {
    const result = await buildOpenUIExport({
      source: 'root = EcommerceHero()',
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const provider = files['src/lib/query-provider.tsx']
    expect(provider).toBeDefined()
    // QueryClient must be created at module scope, not inside useState
    expect(provider).not.toContain('useState')
    expect(provider).toMatch(/const queryClient = new QueryClient/)
    // Provider component should just use the module-level client
    expect(provider).toMatch(/QueryClientProvider client=\{queryClient\}/)
  })

  it('uses PropsWithChildren instead of manual { children: ReactNode } in Next exports', async () => {
    const result = await buildOpenUIExport({
      source: 'root = EcommerceHero()',
      siteSpecJson: JSON.stringify({ projectName: 'Demo' }),
      selectedBrandLogo: { name: 'Demo', logo: 'x' },
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    // QueryProvider
    const provider = files['src/lib/query-provider.tsx']
    expect(provider).toContain('PropsWithChildren')
    expect(provider).not.toContain('{ children: ReactNode }')
    // BrandLogoProvider
    const logo = files['src/lib/brand-logo-provider.tsx']
    expect(logo).toContain('PropsWithChildren')
    expect(logo).not.toContain('{ children: ReactNode }')
    // RootLayout
    const layout = files['app/layout.tsx']
    expect(layout).toContain('PropsWithChildren')
    expect(layout).not.toContain('{ children: ReactNode }')
  })

  it('injects AEO/SEO metadata into Next.js exports when siteSpecJson has SEO data', async () => {
    const seoSiteSpec = JSON.stringify({
      projectName: 'Acme Store',
      siteType: 'ecommerce',
      seo: {
        siteUrl: 'https://acme.example.com',
        siteName: 'Acme Store',
        description: 'Buy the best widgets online.',
        locale: 'en_US',
        keywords: ['widgets', 'online store'],
        ogImage: 'https://acme.example.com/og.png',
      },
      generatedTimestamp: '2024-06-01T00:00:00.000Z',
      pages: [
        {
          route: '/',
          title: 'Home',
          description: 'Acme Store homepage',
          seo: { title: 'Acme Store - Home' },
        },
        {
          route: '/pricing',
          title: 'Pricing',
          description: 'Pricing plans',
          seo: { title: 'Pricing - Acme Store' },
        },
      ],
    })
    const result = await buildOpenUIExport({
      source: routedSource,
      siteSpecJson: seoSiteSpec,
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    // Layout has full metadata (not just title)
    const layout = files['app/layout.tsx']
    expect(layout).toContain('openGraph:')
    expect(layout).toContain('twitter:')
    expect(layout).toContain('description:')

    // Per-page metadata
    const homePage = files['app/page.tsx']
    expect(homePage).toContain('export const metadata')
    expect(homePage).toContain('Acme Store - Home')
    expect(homePage).toContain('application/ld+json')

    const pricingPage = files['app/pricing/page.tsx']
    expect(pricingPage).toContain('export const metadata')
    expect(pricingPage).toContain('Pricing - Acme Store')
    expect(pricingPage).toContain('application/ld+json')

    // SEO static files
    expect(files['app/robots.ts']).toContain('MetadataRoute.Robots')
    expect(files['app/sitemap.ts']).toContain('MetadataRoute.Sitemap')
    expect(files['app/sitemap.ts']).toContain('acme.example.com')
    expect(files['public/llms.txt']).toContain('# Acme Store')
    expect(files['public/llms.txt']).toContain('## Pages')

    const htmlResult = await buildOpenUIHtmlExport({
      source,
      siteSpecJson: seoSiteSpec,
      sessionId: 'demo-html-seo',
      target: 'html',
    })
    const htmlDocument = parseHtmlDocument(decodeExportBody(htmlResult.body))
    expect(htmlDocument.documentElement.getAttribute('lang')).toBe('en-US')
    expect(htmlDocument.querySelector('title')?.textContent).toBe(
      'Acme Store - Home',
    )
    expect(
      htmlDocument
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content'),
    ).toBe('Acme Store - Home')
    expect(
      htmlDocument.querySelector('script[type="application/ld+json"]'),
    ).not.toBeNull()
  })

  it('injects AEO/SEO meta tags into React exports when siteSpecJson has SEO data', async () => {
    const seoSiteSpec = JSON.stringify({
      projectName: 'Acme Store',
      siteType: 'ecommerce',
      seo: {
        siteUrl: 'https://acme.example.com',
        siteName: 'Acme Store',
        description: 'Buy the best widgets online.',
        locale: 'en_US',
        keywords: ['widgets', 'online store'],
        ogImage: 'https://acme.example.com/og.png',
      },
      generatedTimestamp: '2024-06-01T00:00:00.000Z',
      pages: [
        {
          route: '/',
          title: 'Home',
          description: 'Acme Store homepage',
          seo: { title: 'Acme Store - Home' },
        },
      ],
    })
    const result = await buildOpenUIExport({
      source: 'root = EcommerceHero()',
      siteSpecJson: seoSiteSpec,
      sessionId: 'demo',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    const html = files['index.html']
    expect(html).toContain('og:title')
    expect(html).toContain('twitter:card')
    expect(html).toContain('application/ld+json')
    expect(html).toContain('Acme Store - Home')

    expect(files['public/robots.txt']).toContain('User-agent: *')
    expect(files['public/sitemap.xml']).toContain('<urlset')
    expect(files['public/llms.txt']).toContain('# Acme Store')
  })

  // Single explicit guard: exported artifacts (standalone HTML + React/Next
  // ZIPs) must never leak OpenUI internals (@openuidev imports, Vue
  // defineComponent, or raw OpenUI source like "root = Stack").
  it('does not leak OpenUI internals into exported artifacts', async () => {
    const forbiddenTokens = ['@openuidev', 'defineComponent', 'root = Stack']

    const htmlResult = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'leak-html',
      target: 'html',
    })
    const html = decodeExportBody(htmlResult.body)
    for (const token of forbiddenTokens) {
      expect(html).not.toContain(token)
    }

    for (const target of ['react', 'next'] as const) {
      const result = await buildOpenUIExport({
        source,
        siteSpecJson,
        sessionId: `leak-${target}`,
        target,
      })
      const files = unzipBuiltExportTextFiles(result.body)
      const joined = Object.values(files).join('\n')
      for (const token of forbiddenTokens) {
        expect(joined).not.toContain(token)
      }
    }
  })

  // DELETED: two commerce tests ("translates Lakebed-backed commerce pages to
  // native React app state" and "... to Next API routes with in-memory data").
  // Both asserted the deleted EcommerceKimiPage capsule lakebed data-binding path:
  // /react-query imports in the component, src/lib/site-data*.ts query/
  // mutation scaffolding, formatCurrency, commerce store seeds, etc. EcommerceHero
  // is a static section that does NOT trigger the commerce/site-data path, so there
  // is no section-family equivalent to migrate these assertions to.

  it('packages fullstack capsule helpers for React exports without Lakebed package leaks', async () => {
    const result = await buildOpenUIExport({
      source: 'root = EcommerceHero()',
      siteSpecJson,
      sessionId: 'react-commerce-fullstack',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    expect(files['src/components/EcommerceHero.tsx']).toBeDefined()
    expect(files['src/lib/store.ts']).toBeDefined()
    const { dom, renderError, runtimeErrors } =
      await renderExportedBrowserEntry(files, `import './src/main'`)
    expect(renderError).toBeUndefined()
    expect(runtimeErrors).toEqual([])
    expect(dom.window.document.body.textContent).toContain('Shop')
    expect(dom.window.document.body.textContent).toContain('Add')
  })

  it('exports nested composed route sections in React ZIPs without exporting Stack', async () => {
    const result = await buildOpenUIExport({
      source: v2ComposedExportSource,
      siteSpecJson: JSON.stringify({ projectName: 'Nested React Export' }),
      sessionId: 'react-nested-composed',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    expect(files['src/components/HomePage.tsx']).toBeDefined()
    expect(files['src/components/EcommerceHero.tsx']).toBeDefined()
    expect(files['src/components/ProductDetailHero.tsx']).toBeDefined()
    expect(files['src/components/Stack.tsx']).toBeUndefined()
    const { dom, renderError, runtimeErrors } =
      await renderExportedBrowserEntry(files, `import './src/main'`)
    expect(renderError).toBeUndefined()
    expect(runtimeErrors).toEqual([])
    expect(dom.window.document.body.textContent).toContain('Aurora Pro')
    expect(dom.window.document.body.textContent).toContain('Shop')
  })

  it('packages shared section-kit dependencies for React exports', async () => {
    expect(resolveBlockSourceManifestPath('src/section-kit/SiteNav.tsx')).toBe(
      'src/section-kit/SiteNav.tsx',
    )
    expect(
      resolveBlockSourceManifestPath('src/section-kit/MobileNavDrawer.tsx'),
    ).toBe('src/section-kit/MobileNavDrawer.tsx')

    for (const [componentName, exportSource] of [
      ['LinkInBioNavbar', 'root = LinkInBioNavbar()'],
      ['ChurchNavbar', 'root = ChurchNavbar()'],
    ]) {
      const result = await buildOpenUIExport({
        source: exportSource,
        siteSpecJson,
        sessionId: `react-section-kit-${componentName}`,
        target: 'react',
      })
      const files = unzipBuiltExportTextFiles(result.body)

      expect(files[`src/components/${componentName}.tsx`]).toBeDefined()
      const { renderError, runtimeErrors } = await renderExportedBrowserEntry(
        files,
        `import React from 'react'
import { createRoot } from 'react-dom/client'
import { ${componentName} } from './src/components/${componentName}'
createRoot(document.getElementById('root')!).render(<${componentName} />)`,
      )
      expect(renderError).toBeUndefined()
      expect(runtimeErrors).toEqual([])
    }
  })

  it('packages fullstack capsule helpers for Next exports with the query provider', async () => {
    const result = await buildOpenUIExport({
      source: 'root = EcommerceHero()',
      siteSpecJson,
      sessionId: 'next-commerce-fullstack',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    expect(files['src/components/EcommerceHero.tsx']).toBeDefined()
    expect(files['app/layout.tsx']).toBeDefined()
    expect(files['src/lib/store.ts']).toBeDefined()
    const { dom, renderError, runtimeErrors } =
      await renderExportedBrowserEntry(
        files,
        `import React from 'react'
import { createRoot } from 'react-dom/client'
import Page from './app/page'
import { QueryProvider } from './src/lib/query-provider'
createRoot(document.getElementById('root')!).render(<QueryProvider><Page /></QueryProvider>)`,
      )
    expect(renderError).toBeUndefined()
    expect(runtimeErrors).toEqual([])
    expect(dom.window.document.body.textContent).toContain('Shop')
    expect(dom.window.document.body.textContent).toContain('Add')
  })

  it('exports nested composed route sections in Next ZIPs without exporting Stack', async () => {
    const result = await buildOpenUIExport({
      source: v2ComposedExportSource,
      siteSpecJson: JSON.stringify({ projectName: 'Nested Next Export' }),
      sessionId: 'next-nested-composed',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    expect(files['src/components/HomePage.tsx']).toBeDefined()
    expect(files['src/components/EcommerceHero.tsx']).toBeDefined()
    expect(files['src/components/ProductDetailHero.tsx']).toBeDefined()
    expect(files['src/components/Stack.tsx']).toBeUndefined()
    const { dom, renderError, runtimeErrors } =
      await renderExportedBrowserEntry(
        files,
        `import React from 'react'
import { createRoot } from 'react-dom/client'
import Page from './app/page'
import { QueryProvider } from './src/lib/query-provider'
createRoot(document.getElementById('root')!).render(<QueryProvider><Page /></QueryProvider>)`,
      )
    expect(renderError).toBeUndefined()
    expect(runtimeErrors).toEqual([])
    expect(dom.window.document.body.textContent).toContain('Aurora Pro')
    expect(dom.window.document.body.textContent).toContain('Shop')
  })

  it('translates source Lakebed endpoints to executable Next route handlers', async () => {
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

    expect(Object.keys(files)).toEqual(['app/api/webhooks/incoming/route.ts'])
    expect(route).toBeDefined()
    ;(
      globalThis as typeof globalThis & {
        __shipFastRouteInserts?: unknown[]
      }
    ).__shipFastRouteInserts = []
    const routeModule = await loadDirectGeneratedEndpointRoute(route ?? '')
    const response = await (
      routeModule.POST as (request: Request) => Promise<Response>
    )(
      new Request('https://export.test/api/webhooks/incoming', {
        body: JSON.stringify({ body: 'Saved from generated route' }),
        method: 'POST',
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(
      (
        globalThis as typeof globalThis & {
          __shipFastRouteInserts?: unknown[]
        }
      ).__shipFastRouteInserts,
    ).toEqual([
      {
        collection: 'messages',
        value: {
          body: 'Saved from generated route',
          ownerId: 'route-user',
        },
      },
    ])
    delete (
      globalThis as typeof globalThis & {
        __shipFastRouteInserts?: unknown[]
      }
    ).__shipFastRouteInserts
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

    expect(route).toBeDefined()
    expect(files['app/api/status/route.ts']).toBeUndefined()

    const routeModule = await loadBuiltExportRoute(
      files,
      'app/api/webhooks/incoming/route.ts',
    )
    const response = await (
      routeModule.POST as (request: Request) => Promise<Response>
    )(
      new Request('https://export.test/api/webhooks/incoming', {
        body: JSON.stringify({ body: 'Saved from full export' }),
        method: 'POST',
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
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
      const { dom, renderError, runtimeErrors } =
        await renderExportedBrowserEntry(
          files,
          `import React from 'react'
import { createRoot } from 'react-dom/client'
import { Image } from './src/lib/image'

createRoot(document.getElementById('root')!).render(
  <Image alt="Edited hero image" src="https://cdn.example.test/original.jpg" />,
)`,
        )

      expect(renderError).toBeUndefined()
      expect(runtimeErrors).toEqual([])
      expect(
        dom.window.document
          .querySelector('img[alt="Edited hero image"]')
          ?.getAttribute('src'),
      ).toBe('https://cdn.example.test/edited-hero.jpg')
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

    for (const files of [react, next]) {
      const { dom, renderError, runtimeErrors } =
        await renderExportedBrowserEntry(
          files,
          `import React from 'react'
import { createRoot } from 'react-dom/client'
import { StyleOverrides } from './src/lib/style-overrides'

createRoot(document.getElementById('root')!).render(
  <>
    <StyleOverrides />
    <h1 className="hero-title text-4xl">Hello export</h1>
  </>,
)`,
        )

      const heading = dom.window.document.querySelector(
        '.hero-title.text-4xl',
      ) as HTMLElement | null

      expect(renderError).toBeUndefined()
      expect(runtimeErrors).toEqual([])
      expect(heading?.style.color).toBe('rgb(255, 0, 0)')
      expect(heading?.style.textAlign).toBe('center')
    }
  })

  it('type-checks extracted Next component helpers that use ReactNode props', async () => {
    const result = await buildOpenUIExport({
      source:
        'root = AboutHero("Native Store", ["Home"], {"heading":"About Native Store"})',
      siteSpecJson: JSON.stringify({ projectName: 'Native Store' }),
      sessionId: 'about-demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const directory = mkdtempSync(join(tmpdir(), 'ship-fast-typecheck-export-'))

    try {
      writeExportFiles(files, directory)
      mkdirSync(join(directory, 'node_modules/react'), { recursive: true })
      mkdirSync(join(directory, 'node_modules/next'), { recursive: true })
      writeFileSync(
        join(directory, 'node_modules/react/index.d.ts'),
        `
          export type ReactNode = unknown
          export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void
          export function useMemo<T>(factory: () => T, deps?: unknown[]): T
          export const Fragment: unknown
          declare global {
            namespace JSX {
              interface IntrinsicElements {
                [name: string]: any
              }
            }
          }
        `,
      )
      writeFileSync(
        join(directory, 'node_modules/react/jsx-runtime.d.ts'),
        `
          export namespace JSX {
            interface IntrinsicElements {
              [name: string]: any
            }
          }
          export const Fragment: unknown
          export function jsx(type: unknown, props: unknown, key?: unknown): unknown
          export function jsxs(type: unknown, props: unknown, key?: unknown): unknown
        `,
      )
      writeFileSync(
        join(directory, 'node_modules/next/navigation.d.ts'),
        `
          export function useRouter(): { push(path: string): void }
        `,
      )
      writeFileSync(
        join(directory, 'src/lib/cn.ts'),
        `
          export function cn(...classes: unknown[]) {
            return classes.filter(Boolean).join(' ')
          }
        `,
      )
      const program = ts.createProgram({
        options: {
          esModuleInterop: true,
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.ESNext,
          moduleResolution: ts.ModuleResolutionKind.Node10,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: ts.ScriptTarget.ES2022,
        },
        rootNames: [join(directory, 'src/components/AboutHero.tsx')],
      })
      const diagnostics = ts
        .getPreEmitDiagnostics(program)
        .filter((diagnostic) =>
          ts
            .flattenDiagnosticMessageText(diagnostic.messageText, '\n')
            .includes('ReactNode'),
        )
      const messages = diagnostics.map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      )

      expect(messages).toEqual([])
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })
})
