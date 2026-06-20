import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { build } from 'esbuild'
// @ts-expect-error jsdom type declarations are not installed in this workspace.
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it } from 'vitest'

import {
  buildOpenUILakebedProjectFiles,
  collectRouteImageAlts,
  readLakebedDefinition,
  resolveLakebedImageSources,
} from './openui-lakebed-export-builder'

const originalFetch = globalThis.fetch
const originalPexelsKey = process.env.PEXELS_API_KEY

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalPexelsKey === undefined) {
    delete process.env.PEXELS_API_KEY
  } else {
    process.env.PEXELS_API_KEY = originalPexelsKey
  }
})

describe('openui lakebed image source generation', () => {
  it('renders generated commerce components with same-file helpers and undefined query results', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = EcommerceKimiPage("Duck Commerce", ["Home"], {"brand":"Duck Commerce"})',
      siteSpecJson: JSON.stringify({ projectName: 'Duck Commerce' }),
      sessionId: 'demo',
      target: 'lakebed',
    })
    const directory = mkdtempSync(join(tmpdir(), 'lakebed-commerce-export-'))

    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-ecommerce.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { EcommerceKimiPageBlock } from "./client/components/EcommerceKimiPage";

const lakebed = {
  useQuery() {
    return undefined;
  },
  useMutation() {
    return async () => undefined;
  },
  useAuth() {
    return { isLoading: false, isAuthenticated: false, user: null };
  },
  signInWithGoogle() {},
  signOut() {},
};

render(h(EcommerceKimiPageBlock, { props: {}, lakebed }), document.getElementById("app"));
`,
      )
      const bundled = await build({
        bundle: true,
        entryPoints: [entryPath],
        format: 'iife',
        jsx: 'automatic',
        jsxImportSource: 'preact',
        logLevel: 'silent',
        nodePaths: [join(process.cwd(), 'node_modules')],
        platform: 'browser',
        plugins: [
          {
            name: 'lakebed-client-stub',
            setup(pluginBuild) {
              pluginBuild.onResolve({ filter: /^lakebed\/client$/ }, () => ({
                namespace: 'lakebed-client-stub',
                path: 'lakebed/client',
              }))
              pluginBuild.onLoad(
                {
                  filter: /^lakebed\/client$/,
                  namespace: 'lakebed-client-stub',
                },
                () => ({
                  contents: `export const Link = ({ children }) => children;
export const Route = ({ element }) => element;
export const Router = ({ children }) => children;
export const Routes = ({ children }) => children;
export function useNavigate() { return () => {}; }
export function useAuth() { return { isLoading: false, isAuthenticated: false, user: null }; }
export function useMutation() { return async () => undefined; }
export function useQuery() { return undefined; }
export function signInWithGoogle() {}
export function signOut() {}
`,
                  loader: 'tsx',
                }),
              )
            },
          },
        ],
        write: false,
      })
      const dom = new JSDOM('<div id="app"></div>', {
        runScripts: 'outside-only',
      })

      expect(() => dom.window.eval(bundled.outputFiles[0].text)).not.toThrow()
      expect(dom.window.document.querySelector('#app')?.textContent).toContain(
        'Shop by Category',
      )
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('packages rendered HTML fragments as static Lakebed projects instead of parsing page text as OpenUI', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        '<main><h1>PurrSpecs</h1><p>Subscribers value Satisfaction Readers cat lovers.</p></main>',
      siteSpecJson: JSON.stringify({ projectName: 'PurrSpecs' }),
      sessionId: 'demo',
      target: 'lakebed',
    })

    expect(built.projectName).toBe('PurrSpecs')
    expect(built.files['README.md']).toContain(
      'Built with [ShipFast](https://ship-fast.io).',
    )
    expect(built.files['client/index.tsx']).toContain('PurrSpecs')
    expect(Object.values(built.files).join('\n')).not.toContain('root =')
    expect(Object.values(built.files).join('\n')).not.toContain('@openuidev')
  })

  it('builds Lakebed projects when a generated object argument is closed with a parenthesis before the next argument', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = EcommerceKimiPage("ShopifyLite", ["Home"], {chip:"New Arrival", heading:"Launch Your Online Store", imageAlt:"Boutique storefront"), "Trusted by Leading Brands", {heading:"Shop by Category"})',
      siteSpecJson: JSON.stringify({ projectName: 'ShopifyLite' }),
      sessionId: 'demo',
      target: 'lakebed',
    })

    expect(built.projectName).toBe('ShopifyLite')
    expect(built.files['client/routes.ts']).toContain(
      'Launch Your Online Store',
    )
    expect(built.files['client/routes.ts']).toContain(
      'Trusted by Leading Brands',
    )
    expect(built.files['client/components/EcommerceKimiPage.tsx']).toContain(
      'EcommerceKimiPageBlock',
    )
  })

  it('does not embed stale OpenUI SSR error HTML when deploying OpenUI source', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = CloudInfraKimiPage3("Lakebed Repro", ["Home"], {"brand":"Nebula Cloud"})',
      previewHtml:
        '<div class="openui-error">Failed to render: te is not a function</div>',
      sessionId: 'demo',
      target: 'lakebed',
    })

    const output = Object.values(built.files).join('\n')

    expect(built.files['client/index.tsx']).toContain('PageView')
    expect(output).toContain('CloudInfraKimiPage3')
    expect(output).not.toContain('openui-error')
    expect(output).not.toContain('te is not a function')
  })

  it('exports a native Lakebed app without generated block registry traces', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = PageSwitch(["Home","Shop","About","Contact"], [EcommerceKimiPage("Lakebed Store", ["Home","Shop","About","Contact"], {"brand":"Lakebed Store"}), ShopKimiPage("Lakebed Store", ["Home","Shop","About","Contact"]), AboutKimiPage("Lakebed Store", ["Home","Shop","About","Contact"]), ContactKimiPage("Lakebed Store", ["Home","Shop","About","Contact"])])',
      previewHtml:
        '<main><h1 class="lakebed-title text-4xl" style="color: rgb(255, 0, 0); text-align: center;">Lakebed Store</h1></main>',
      siteSpecJson: JSON.stringify({ projectName: 'Lakebed Store' }),
      sessionId: 'demo',
      target: 'lakebed',
    })
    const output = Object.entries(built.files)
      .filter(([path]) => !path.startsWith('client/vendor/'))
      .map(([, source]) => source)
      .join('\n')

    expect(built.files['client/index.tsx']).toContain('const pageComponents')
    expect(built.files['client/index.tsx']).toContain('function PageView')
    expect(built.files['client/index.tsx']).toContain(
      'import { Link, Route, Router, Routes } from "lakebed/client"',
    )
    expect(built.files['client/index.tsx']).toContain('<Router>')
    expect(built.files['client/index.tsx']).toContain('<Routes>')
    expect(built.files['client/index.tsx']).toContain('<Route')
    expect(built.files['client/index.tsx']).toContain(
      'pages.map((page) =>',
    )
    expect(built.files['client/index.tsx']).not.toContain('FallbackPage')
    expect(built.files['client/index.tsx']).not.toContain('function routeForPath')
    expect(built.files['client/index.tsx']).not.toContain('StatusPage')
    expect(built.files['client/index.tsx']).not.toContain('/status')
    expect(built.files['client/index.tsx']).not.toContain('site:navigate')
    expect(built.files['client/lib/navigation.tsx']).toContain(
      'window.history.pushState',
    )
    expect(built.files['client/lib/navigation.tsx']).toContain(
      'new PopStateEvent("popstate")',
    )
    expect(built.files['client/lib/navigation.tsx']).not.toContain(
      'site:navigate',
    )
    expect(built.files['server/index.ts']).toContain('endpoints: {}')
    expect(built.files['server/index.ts']).not.toContain('endpoint(')
    expect(built.files['server/index.ts']).not.toContain('text(')
    expect(output).not.toContain('/api/status')
    expect(built.files['client/lib/lakebed.ts']).toContain(
      'function normalizeQueryValue',
    )
    expect(built.files['client/lib/lakebed.ts']).toContain('new Set<string>()')
    expect(built.files['client/lib/lakebed.ts']).toContain(
      'new Set(Object.values(value))',
    )
    expect(built.files['client/lib/lakebed.ts']).toContain(
      'function normalizeEntityListValue',
    )
    expect(built.files['client/lib/lakebed.ts']).toContain(
      'Number(record.quantity)',
    )
    expect(built.files['client/routes.ts']).toContain('export const pages')
    expect(built.files['client/routes.ts']).toContain('export const routeByLabel')
    expect(built.files['client/routes.ts']).toContain('export const imageSources')
    expect(built.files['client/lib/theme.tsx']).toContain('--background:')
    expect(built.files['client/lib/theme.tsx']).toContain(
      'color-scheme: dark;',
    )
    expect(built.files['client/lib/theme.tsx']).toContain(
      'StyleRuntime',
    )
    expect(built.files['client/index.tsx']).toContain(
      'import { StyleOverrides } from "./lib/style-overrides"',
    )
    expect(built.files['client/index.tsx']).toContain('<StyleOverrides />')
    expect(built.files['client/lib/style-overrides.tsx']).toContain(
      'lakebed-title text-4xl',
    )
    expect(built.files['client/lib/style-overrides.tsx']).toContain(
      'color: rgb(255, 0, 0); text-align: center;',
    )
    expect(built.files['client/lib/style-overrides.tsx']).toContain(
      'new MutationObserver',
    )

    for (const forbidden of [
      'GeneratedBlock',
      'generatedBlocks',
      'GeneratedRoute',
      'FallbackGeneratedPage',
      'GeneratedPage',
      'generatedPages',
      'generatedRouteByLabel',
      'generatedImageSources',
      'generatedThemeCss',
      'ship-fast-generated-theme',
      '@openuidev',
      'OpenUI',
      'Generated page',
      'root =',
      'useLakebedNavigate',
      'StatusPage',
      'FallbackPage',
    ]) {
      expect(output).not.toContain(forbidden)
    }
  })

  it('extracts source Lakebed endpoints without adding generated status endpoints', () => {
    const definition = readLakebedDefinition('WebhookKimiPage', {
      file: 'src/capsules/webhook.tsx',
      source: `import { defineCapsule } from "./openui.ts"
import { endpoint, json, text } from "@ship-fast/lakebed/server"
import { z } from "zod/v4"

export const WebhookKimiPage = defineCapsule({
  name: "WebhookKimiPage",
  props: z.object({}),
  description: "Webhook page",
  lakebed: {
    endpoints: {
      incoming: endpoint({ method: "POST", path: "/api/webhooks/incoming" }, async (ctx, req) => {
        if (!req.headers.get("x-webhook-secret")) return text("unauthorized", { status: 401 })
        const payload = await req.json()
        return json({ ok: true, userId: ctx.auth.userId, payload })
      })
    }
  },
  component: () => null,
})`,
    })

    expect(definition?.endpoints.incoming?.method).toBe('POST')
    expect(definition?.endpoints.incoming?.path).toBe('/api/webhooks/incoming')
    expect(definition?.endpoints.incoming?.source).toContain(
      'endpoint({ method: "POST", path: "/api/webhooks/incoming" }',
    )
    expect(definition?.endpoints.incoming?.source).toContain('return json')
    expect(definition?.endpoints.incoming?.source).not.toContain('/api/status')
  })

  it('deduplicates server schema and handler keys for multi-page Lakebed capsules', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = PageSwitch(["Home","Shop","About","Contact"], [FoodDeliveryKimiPage("SavoryMarket", ["Home","Shop","About","Contact"]), EcommerceKimiPage("SavoryMarket", ["Home","Shop","About","Contact"]), AboutKimiPage("SavoryMarket", ["Home","Shop","About","Contact"]), ContactKimiPage("SavoryMarket", ["Home","Shop","About","Contact"])])',
      siteSpecJson: JSON.stringify({ projectName: 'SavoryMarket' }),
      sessionId: 'demo',
      target: 'lakebed',
    })
    const server = built.files['server/index.ts']

    expect(server.match(/\bfavorites:\s+table/g) ?? []).toHaveLength(1)
    expect(server).toContain('restaurantName: string()')
    expect(server).toContain('productName: string()')
    expect(server).toContain('memberName: string()')
    expect(server.match(/\binquiries:\s+table/g) ?? []).toHaveLength(1)
    expect(server.match(/\binquiries:\s+query/g) ?? []).toHaveLength(1)
    expect(server.match(/\btoggleFavorite:\s+mutation/g) ?? []).toHaveLength(1)
    expect(server.match(/\bsubmitInquiry:\s+mutation/g) ?? []).toHaveLength(1)
    expect(server).toContain('String(Number(existingItem.quantity) + 1)')
  })

  it('seeds Lakebed server tables from route props used by the generated UI', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = PageSwitch(["Home","Shop"], [FoodDeliveryKimiPage("Seed Market", ["Home","Shop"], {"restaurants":{"items":[{"name":"Seed Bistro","category":"Dinner","cuisine":"Modern","delivery":"20 min","imageAlt":"Seed bistro table","rating":"4.9","time":"20-30 min"}]}}), EcommerceKimiPage("Seed Market", ["Home","Shop"], {"products":{"items":[{"name":"Seed Soup","price":"$12.00","alt":"Seed soup bowl","brand":"Seed Kitchen","badge":"Fresh","oldPrice":"","image":""}]}})])',
      siteSpecJson: JSON.stringify({ projectName: 'Seed Market' }),
      sessionId: 'demo',
      target: 'lakebed',
    })
    const server = built.files['server/index.ts']

    expect(server).toContain('const seedRows')
    expect(server).toContain('products: [')
    expect(server).toContain('"Seed Soup"')
    expect(server).toContain('restaurants: [')
    expect(server).toContain('"Seed Bistro"')
    expect(server).toContain('ensureSeedData(ctx.db)')
    expect(server).toContain('table.insert(row)')
  })

  it('seeds Lakebed product tables for commerce capsules that render default product grids', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = EcommerceKimiPage("Native Store", ["Home"], {"brand":"Native Store"})',
      siteSpecJson: JSON.stringify({ projectName: 'Native Store' }),
      sessionId: 'demo',
      target: 'lakebed',
    })
    const server = built.files['server/index.ts']

    expect(server).toContain('products: [')
    expect(server).toContain('"Signature Series"')
    expect(server).toContain('"Everyday Essential"')
    expect(server).toContain('ensureSeedData(ctx.db)')
    expect(server).toContain('addToCart: mutation')
  })

  it('collects image alt text from generated route props', () => {
    const alts = collectRouteImageAlts([
      {
        componentName: 'DogCarePage',
        label: 'Home',
        path: '/',
        props: {
          hero: { imageAlt: 'Golden retriever puppy playing with a ball' },
          testimonials: [
            { avatarAlt: 'Emily with her golden retriever' },
            { title: 'Not an image' },
          ],
        },
      },
    ])

    expect(alts).toEqual([
      'Golden retriever puppy playing with a ball',
      'Emily with her golden retriever',
    ])
  })

  it('resolves missing generated image alts through Pexels at build time', async () => {
    process.env.PEXELS_API_KEY = 'pexels_test_key'
    const requests: string[] = []
    globalThis.fetch = (async (url: RequestInfo | URL) => {
      requests.push(String(url))
      return new Response(
        JSON.stringify({
          photos: [
            {
              src: {
                large: 'https://images.pexels.com/photos/dog-large.jpeg',
                large2x: 'https://images.pexels.com/photos/dog-large2x.jpeg',
                medium: 'https://images.pexels.com/photos/dog-medium.jpeg',
                original: 'https://images.pexels.com/photos/dog-original.jpeg',
              },
            },
          ],
        }),
        { headers: { 'content-type': 'application/json' }, status: 200 },
      )
    }) as typeof fetch

    const sources = await resolveLakebedImageSources(
      [
        {
          componentName: 'DogCarePage',
          label: 'Home',
          path: '/',
          props: {
            hero: { imageAlt: 'Golden retriever puppy playing with a ball' },
          },
        },
      ],
      '<img alt="Existing avatar" src="https://cdn.example.com/avatar.jpg">',
    )

    expect(sources).toEqual(
      expect.arrayContaining([
        {
          alt: 'Existing avatar',
          src: 'https://cdn.example.com/avatar.jpg',
        },
        {
          alt: 'Golden retriever puppy playing with a ball',
          src: 'https://images.pexels.com/photos/dog-large2x.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
        },
      ]),
    )
    expect(requests).toHaveLength(1)
    expect(requests[0]).toContain('api.pexels.com/v1/search')
    expect(requests[0]).toContain('golden')
    expect(sources.every((source) => !source.src.includes('/api/pexels'))).toBe(
      true,
    )
    expect(
      sources.every((source) => !source.src.startsWith('data:image/')),
    ).toBe(true)
  })

  it('falls back to detached Picsum URLs when stock APIs are unavailable', async () => {
    delete process.env.PEXELS_API_KEY
    globalThis.fetch = (async () => {
      throw new Error('Pexels should not be called without a key')
    }) as typeof fetch

    const sources = await resolveLakebedImageSources(
      [
        {
          componentName: 'DogCarePage',
          label: 'Home',
          path: '/',
          props: {
            hero: { imageAlt: 'Golden retriever puppy playing with a ball' },
          },
        },
      ],
      '<img alt="Existing avatar" src="/api/pexels?query=avatar&w=64&h=64">',
    )

    expect(sources).toEqual(
      expect.arrayContaining([
        {
          alt: 'Existing avatar',
          src: 'https://picsum.photos/seed/existing-avatar/400/400',
        },
        {
          alt: 'Golden retriever puppy playing with a ball',
          src: 'https://picsum.photos/seed/golden-retriever-puppy-playing-with-a-ball/1200/800',
        },
      ]),
    )
    expect(sources.every((source) => !source.src.includes('/api/pexels'))).toBe(
      true,
    )
  })
})
