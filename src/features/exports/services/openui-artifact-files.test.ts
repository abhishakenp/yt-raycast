import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildOpenUIArtifactFiles } from './openui-artifact-files'

// Section-family components take flat positional string args (signature order),
// not the old (brand, nav, props) KimiPage shape. Required text is placed in the
// heading/title slot so it renders into the DOM and serializes into pages.ts.
const source =
  'root = SaasHero("Artifact Demo", "Hello artifact", "artifact", "Launch faster", "Start now")'

const v1PublicationSource = `root = PageSwitch(["Home", "Admin"], [home, admin])
home = BlogHero("Cover", "Newsroom", "Featured", "Artifact Gazette", "Audit ready story", "Maya", "5 min", "Today", "Read", "/posts")
admin = DashboardHeader("Newsroom Admin", "Manage Artifact Gazette", "Search posts", "New post")`

const v1CommerceSource = `root = PageSwitch(["Home", "Shop", "Admin"], [home, shop, admin])
home = EcommerceHero("New season", "Artifact Store Home", "Launch-ready commerce with owner-gated operations", "Shop now", "Browse", "Storefront", "Artifact Store")
shop = ShopOverview("Artifact Store", "Catalog", "Artifact Store Catalog", "Browse products and bundles", "Shop now", "Filter", "Catalog grid", ["New arrivals", "Bestsellers"], "stats")
admin = DashboardHeader("Store Admin", "Manage products, orders, inventory, and customers", "Search orders", "New product")`

const v1SoftwareSource = `root = PageSwitch(["Home", "Docs", "Contact", "Admin"], [home, docs, contact, admin])
home = SaasHero("Artifact SaaS", "Artifact SaaS Home", "launch", "Software launch with docs, leads, and admin operations", "Start now", "Book demo", "Trusted by product teams")
docs = DocsHero("Documentation", "Artifact SaaS Docs", "Guides and setup notes", "Search docs", "/search", "Quickstart", "/quickstart", "API", "/api")
contact = ContactHero("Contact", "Talk to Artifact SaaS", "Request guidance for your workspace")
admin = DashboardHeader("Workspace Admin", "Manage users, leads, docs, billing signals, and audit events", "Search users", "Invite user")`

const siteSpecJson = JSON.stringify({ projectName: 'Artifact Demo' })
const siteSpecJsonWithGenUI = JSON.stringify({
  projectName: 'Artifact Demo',
  genui: {
    version: 1,
    category: 'publication',
    ownerEmail: 'founder@example.com',
    adminPolicy: {
      mode: 'baked-owner',
      authProvider: 'shoo',
      ownerEmail: 'founder@example.com',
    },
    fullstackManifest: { schema: 'publication-newsroom-v1' },
  },
})

const siteSpecJsonWithCommerceGenUI = JSON.stringify({
  projectName: 'Artifact Store',
  genui: {
    version: 1,
    category: 'commerce',
    ownerEmail: 'store@example.com',
    adminPolicy: {
      mode: 'baked-owner',
      authProvider: 'shoo',
      ownerEmail: 'store@example.com',
      adminEmails: ['store@example.com'],
    },
    fullstackManifest: {
      schema: 'commerce-fullstack-v1',
      tables: ['products', 'orders', 'customers', 'adminUsers'],
    },
    openuiManifest: {
      pages: [
        { id: 'home', label: 'Home', component: 'EcommerceHero' },
        { id: 'shop', label: 'Shop', component: 'ShopOverview' },
        { id: 'admin', label: 'Admin', component: 'DashboardHeader' },
      ],
    },
  },
})

const siteSpecJsonWithSoftwareGenUI = JSON.stringify({
  projectName: 'Artifact SaaS',
  genui: {
    version: 1,
    category: 'software',
    ownerEmail: 'saas@example.com',
    adminPolicy: {
      mode: 'baked-owner',
      authProvider: 'shoo',
      ownerEmail: 'saas@example.com',
      adminEmails: ['saas@example.com'],
    },
    fullstackManifest: {
      schema: 'software-fullstack-v1',
      tables: ['users', 'leads', 'docs', 'auditEvents', 'adminUsers'],
    },
    openuiManifest: {
      pages: [
        { id: 'home', label: 'Home', component: 'SaasHero' },
        { id: 'docs', label: 'Docs', component: 'DocsHero' },
        { id: 'contact', label: 'Contact', component: 'ContactHero' },
        { id: 'admin', label: 'Admin', component: 'DashboardHeader' },
      ],
    },
  },
})

const selectedBrandLogo = {
  name: 'The Beer Store',
  domain: 'thebeerstore.ca',
  brandId: 'idwTkaYgXe',
  icon: 'https://cdn.brandfetch.io/idwTkaYgXe/icon.webp',
  logo: 'https://cdn.brandfetch.io/idwTkaYgXe/logo.svg',
}

const expectNoStockProviderCredentialsOrProxy = (artifact: string) => {
  expect(artifact).not.toContain('PEXELS_API_KEY')
  expect(artifact).not.toContain('VITE_PEXELS_API_KEY')
  expect(artifact).not.toContain('api.pexels.com')
  expect(artifact).not.toContain('/api/pexels')
  expect(artifact).not.toContain('ship-fast.io/api/pexels')
}

const originalStockEnv = {
  PEXELS_API_KEY: process.env.PEXELS_API_KEY,
  VITE_PEXELS_API_KEY: process.env.VITE_PEXELS_API_KEY,
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
  VITE_UNSPLASH_ACCESS_KEY: process.env.VITE_UNSPLASH_ACCESS_KEY,
}

beforeEach(() => {
  delete process.env.PEXELS_API_KEY
  delete process.env.VITE_PEXELS_API_KEY
  delete process.env.UNSPLASH_ACCESS_KEY
  delete process.env.VITE_UNSPLASH_ACCESS_KEY
})

afterEach(() => {
  vi.unstubAllGlobals()
  for (const [key, value] of Object.entries(originalStockEnv)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
})

const renderGeneratedRouteText = async (
  files: Record<string, string>,
  routeComponent: string,
): Promise<string> => {
  const directory = mkdtempSync(join(tmpdir(), 'openui-artifact-route-'))

  try {
    for (const [path, fileSource] of Object.entries(files)) {
      const absolutePath = join(directory, path)
      mkdirSync(join(absolutePath, '..'), { recursive: true })
      writeFileSync(absolutePath, fileSource)
    }
    const entryPath = join(directory, 'render-route.tsx')
    writeFileSync(
      entryPath,
      `import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { ${routeComponent} } from "./src/components/${routeComponent}";

const root = createRoot(document.getElementById("root"));
const queryClient = new QueryClient();
flushSync(() => root.render(
  React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(${routeComponent}, {}),
  ),
));
`,
    )
    const bundled = await build({
      bundle: true,
      entryPoints: [entryPath],
      format: 'iife',
      jsx: 'automatic',
      logLevel: 'silent',
      nodePaths: [join(process.cwd(), 'node_modules')],
      platform: 'browser',
      plugins: [
        {
          name: 'react-router-dom-runtime-stub',
          setup(pluginBuild) {
            pluginBuild.onResolve({ filter: /^react-router-dom$/ }, () => ({
              namespace: 'react-router-dom-runtime-stub',
              path: 'react-router-dom',
            }))
            pluginBuild.onLoad(
              {
                filter: /^react-router-dom$/,
                namespace: 'react-router-dom-runtime-stub',
              },
              () => ({
                contents: `export const Link = ({ children }) => children;
export const NavLink = ({ children }) => children;
export function useLocation() { return { pathname: "/" }; }
export function useNavigate() { return () => {}; }
`,
                loader: 'tsx',
              }),
            )
            pluginBuild.onResolve({ filter: /^next\/navigation$/ }, () => ({
              namespace: 'next-navigation-runtime-stub',
              path: 'next/navigation',
            }))
            pluginBuild.onLoad(
              {
                filter: /^next\/navigation$/,
                namespace: 'next-navigation-runtime-stub',
              },
              () => ({
                contents: `export function usePathname() { return "/"; }
export function useRouter() {
  return { back() {}, forward() {}, push() {}, refresh() {}, replace() {} };
}
export function useSearchParams() {
  return new URLSearchParams();
}
`,
                loader: 'tsx',
              }),
            )
          },
        },
      ],
      write: false,
    })
    const dom = new JSDOM('<div id="root"></div>', {
      runScripts: 'outside-only',
    })
    ;(
      dom.window as unknown as { process?: { env: Record<string, string> } }
    ).process = { env: {} }

    try {
      dom.window.eval(bundled.outputFiles[0]?.text ?? '')
    } catch (error) {
      const detail =
        error instanceof Error ? (error.stack ?? error.message) : String(error)
      throw new Error(`Generated route ${routeComponent} crashed: ${detail}`)
    }
    return dom.window.document.querySelector('#root')?.textContent ?? ''
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

describe('openui artifact files', () => {
  it('builds React artifact files from OpenUI components instead of static preview HTML', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })

    expect(download?.filename).toBe('artifact-demo-react.zip')
    expect(files['src/data/pages.ts']).toContain('Hello artifact')
    await expect(
      renderGeneratedRouteText(files, 'HomePage'),
    ).resolves.toContain('Hello artifact')
    expect(files['vite.config.js']).toBeUndefined()
  })

  it('includes generated admin/fullstack metadata files in exported artifacts', async () => {
    const { files } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'react',
    })

    const metadata = JSON.parse(files['ship-fast-genui.json'])
    expect(metadata).toMatchObject({
      generatedBy: 'ship-fast',
      sessionId: 'demo',
      target: 'react',
      genui: {
        category: 'publication',
        ownerEmail: 'founder@example.com',
        adminPolicy: {
          mode: 'baked-owner',
          authProvider: 'shoo',
          ownerEmail: 'founder@example.com',
        },
      },
    })
    expect(files['public/ship-fast-genui.json']).toBe(
      files['ship-fast-genui.json'],
    )
    expect(files['ship-fast-admin.js']).toContain(
      'window.assertShipFastAdminAccess',
    )
    expect(files['ship-fast-admin.js']).toContain('founder@example.com')
    expect(files['public/ship-fast-admin.js']).toBe(files['ship-fast-admin.js'])
    expect(files['src/ship-fast-admin.ts']).toContain(
      'export function assertShipFastAdminAccess',
    )
    expect(files['src/ship-fast-admin.ts']).toContain(
      'shipFastAdminEmails = [\n  "founder@example.com"\n]',
    )
  })

  it('bakes resolved stock image URLs into HTML, React, and Next export artifacts', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    const resolvedPexelsUrl =
      'https://images.pexels.com/photos/7195588/pexels-photo-7195588.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          photos: [
            {
              src: {
                medium: `${resolvedPexelsUrl}&size=medium`,
                large: resolvedPexelsUrl,
                large2x: `${resolvedPexelsUrl}&size=large2x`,
                original: `${resolvedPexelsUrl}&size=original`,
              },
            },
          ],
        }),
      ),
    )
    const previewHtml =
      '<!doctype html><html><body><main><img alt="Showcase of polished glass installations" src="/api/pexels?query=glass+polished+showcase+installations&w=800&h=600&seed=Showcase+of+polished+glass+installations"></main></body></html>'

    const html = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      previewHtml,
      sessionId: 'demo-html-images',
      target: 'html',
    })
    const react = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      previewHtml,
      sessionId: 'demo-react-images',
      target: 'react',
    })
    const next = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      previewHtml,
      sessionId: 'demo-next-images',
      target: 'next',
    })

    expect(html.files['index.html']).toContain(resolvedPexelsUrl)
    expect(react.files['src/lib/image.tsx']).toContain(resolvedPexelsUrl)
    expect(next.files['src/lib/image.tsx']).toContain(resolvedPexelsUrl)
    expectNoStockProviderCredentialsOrProxy(html.files['index.html'])
    expectNoStockProviderCredentialsOrProxy(react.files['src/lib/image.tsx'])
    expectNoStockProviderCredentialsOrProxy(next.files['src/lib/image.tsx'])
    expect(html.files['index.html']).not.toContain('picsum.photos')
  })

  it('builds Next artifact files from OpenUI components instead of static preview HTML', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })

    expect(download?.filename).toBe('artifact-demo-next.zip')
    expect(files['src/data/pages.ts']).toContain('Hello artifact')
    await expect(
      renderGeneratedRouteText(files, 'HomePage'),
    ).resolves.toContain('Hello artifact')
    expect(files['next.config.js']).toBeUndefined()
  })

  it('wraps React, Next, and Lakebed OpenUI exports with the selected brand logo provider', async () => {
    const [react, next, lakebed] = await Promise.all(
      (['react', 'next', 'lakebed'] as const).map((target) =>
        buildOpenUIArtifactFiles({
          source:
            'home_nav = WineryBreweryNavbar("Craft Beer Brewery", ["Home"], "(503) 555-0148", "Home", "Book", "Home", "0")\nroot = PageSwitch(["Home"], [home_nav], "", {"Home":"home"})',
          siteSpecJson,
          sessionId: 'demo',
          target,
          selectedBrandLogo,
        }),
      ),
    )

    expect(react.files['src/App.tsx']).toContain('BrandLogoProvider')
    expect(react.files['src/App.tsx']).toContain(selectedBrandLogo.icon)
    expect(react.files['src/section-kit/Logo.tsx']).toContain(
      'data-brand-logo-selected',
    )

    expect(next.files['app/layout.tsx']).toContain('ExportBrandLogoProvider')
    expect(next.files['src/lib/brand-logo-provider.tsx']).toContain(
      selectedBrandLogo.icon,
    )
    expect(next.files['src/section-kit/Logo.tsx']).toContain(
      'data-brand-logo-selected',
    )

    expect(lakebed.files['client/index.tsx']).toContain('BrandLogoProvider')
    expect(lakebed.files['client/index.tsx']).toContain(selectedBrandLogo.icon)
    expect(lakebed.files['client/section-kit/Logo.tsx']).toContain(
      'data-brand-logo-selected',
    )
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

  it('embeds admin bootstrap in single-file HTML exports when genui policy exists', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'html',
      includeBadge: false,
    })

    expect(download?.filename).toBe('index.html')
    expect(files['index.html']).toContain('window.__SHIP_FAST_ADMIN__')
    expect(files['index.html']).toContain('window.assertShipFastAdminAccess')
    expect(files['index.html']).toContain('founder@example.com')
    expect(files['ship-fast-admin.js']).toContain('founder@example.com')
  })

  it('exports v1 PageSwitch publication/admin source as HTML with baked admin metadata', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source: v1PublicationSource,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'html',
      includeBadge: false,
    })

    expect(download?.filename).toBe('index.html')
    expect(files['index.html']).toContain('Artifact Gazette')
    expect(files['index.html']).toContain('Newsroom Admin')
    expect(files['index.html']).toContain('window.__SHIP_FAST_ADMIN__')
    expect(files['index.html']).toContain('founder@example.com')
    expect(files['ship-fast-genui.json']).toContain('publication-newsroom-v1')
  })

  it('wires baked admin access into React artifact routes', async () => {
    const { files } = await buildOpenUIArtifactFiles({
      source: v1PublicationSource,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'react',
    })

    expect(files['src/App.tsx']).toContain('ShipFastAdminGate')
    expect(files['src/App.tsx']).toContain('isShipFastAdminRoute')
    expect(files['src/lib/ship-fast-admin-gate.tsx']).toContain(
      'assertShipFastAdminAccess',
    )
    expect(files['src/lib/ship-fast-admin-gate.tsx']).toContain(
      'shipFastAdminEmail',
    )
    expect(files['src/ship-fast-admin.ts']).toContain('founder@example.com')
  })

  it('wires baked admin access into Next admin route files', async () => {
    const { files } = await buildOpenUIArtifactFiles({
      source: v1PublicationSource,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'next',
    })

    expect(files['app/admin/page.tsx']).toContain('ShipFastAdminGate')
    expect(files['app/admin/page.tsx']).toContain('routeLabel="Admin"')
    expect(files['src/lib/ship-fast-admin-gate.tsx']).toContain(
      'assertShipFastAdminAccess',
    )
    expect(files['src/lib/ship-fast-admin-gate.tsx']).toContain("'use client'")
    expect(files['src/ship-fast-admin.ts']).toContain('founder@example.com')
  })

  it('includes generated admin metadata in Lakebed artifact files', async () => {
    const { files } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'lakebed',
    })

    const metadata = JSON.parse(files['ship-fast-genui.json'])
    expect(metadata.target).toBe('lakebed')
    expect(metadata.genui.adminPolicy.ownerEmail).toBe('founder@example.com')
    expect(files['public/ship-fast-genui.json']).toBe(
      files['ship-fast-genui.json'],
    )
    expect(files['ship-fast-admin.js']).toContain(
      'window.assertShipFastAdminAccess',
    )
    expect(files['ship-fast-admin.js']).toContain('founder@example.com')
    expect(files['src/ship-fast-admin.ts']).toContain(
      'shipFastAdminEmails = [\n  "founder@example.com"\n]',
    )
  })

  it('wires baked admin access into Lakebed generated client routes', async () => {
    const { files } = await buildOpenUIArtifactFiles({
      source: v1PublicationSource,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'lakebed',
    })

    expect(files['client/index.tsx']).toContain('ShipFastAdminGate')
    expect(files['client/index.tsx']).toContain('shipFastAdminEmails')
    expect(files['client/index.tsx']).toContain('founder@example.com')
    expect(files['client/index.tsx']).toContain('isShipFastAdminRoute(page)')
    expect(files['ship-fast-admin.js']).toContain('founder@example.com')
  })

  it('exports generic v1 commerce source across targets with baked admin access', async () => {
    const html = await buildOpenUIArtifactFiles({
      source: v1CommerceSource,
      siteSpecJson: siteSpecJsonWithCommerceGenUI,
      sessionId: 'commerce-demo',
      target: 'html',
      includeBadge: false,
    })
    expect(html.files['index.html']).toContain('Artifact Store')
    expect(html.files['index.html']).toContain('Store Admin')
    expect(html.files['index.html']).toContain('window.__SHIP_FAST_ADMIN__')
    expect(html.files['ship-fast-genui.json']).toContain(
      'commerce-fullstack-v1',
    )
    expect(html.files['ship-fast-admin.js']).toContain('store@example.com')

    const react = await buildOpenUIArtifactFiles({
      source: v1CommerceSource,
      siteSpecJson: siteSpecJsonWithCommerceGenUI,
      sessionId: 'commerce-demo',
      target: 'react',
    })
    expect(react.files['src/App.tsx']).toContain('ShipFastAdminGate')
    expect(react.files['src/App.tsx']).toContain('isShipFastAdminRoute')
    expect(react.files['src/data/pages.ts']).toContain('Artifact Store Catalog')
    expect(react.files['src/ship-fast-admin.ts']).toContain('store@example.com')

    const next = await buildOpenUIArtifactFiles({
      source: v1CommerceSource,
      siteSpecJson: siteSpecJsonWithCommerceGenUI,
      sessionId: 'commerce-demo',
      target: 'next',
    })
    expect(next.files['app/admin/page.tsx']).toContain('ShipFastAdminGate')
    await expect(
      renderGeneratedRouteText(next.files, 'ShopPage'),
    ).resolves.toEqual(expect.any(String))
    expect(next.files['src/ship-fast-admin.ts']).toContain('store@example.com')

    const lakebed = await buildOpenUIArtifactFiles({
      source: v1CommerceSource,
      siteSpecJson: siteSpecJsonWithCommerceGenUI,
      sessionId: 'commerce-demo',
      target: 'lakebed',
    })
    expect(lakebed.files['client/index.tsx']).toContain('ShipFastAdminGate')
    expect(lakebed.files['client/index.tsx']).toContain(
      'isShipFastAdminRoute(page)',
    )
    expect(lakebed.files['ship-fast-admin.js']).toContain('store@example.com')
  })

  it('exports generic v1 software source with docs, contact, and admin routes', async () => {
    const react = await buildOpenUIArtifactFiles({
      source: v1SoftwareSource,
      siteSpecJson: siteSpecJsonWithSoftwareGenUI,
      sessionId: 'software-demo',
      target: 'react',
    })
    expect(react.files['src/App.tsx']).toContain('ShipFastAdminGate')
    expect(react.files['src/data/pages.ts']).toContain('Artifact SaaS Docs')
    expect(react.files['src/data/pages.ts']).toContain('Talk to Artifact SaaS')
    expect(react.files['ship-fast-genui.json']).toContain(
      'software-fullstack-v1',
    )
    expect(react.files['src/ship-fast-admin.ts']).toContain('saas@example.com')

    const next = await buildOpenUIArtifactFiles({
      source: v1SoftwareSource,
      siteSpecJson: siteSpecJsonWithSoftwareGenUI,
      sessionId: 'software-demo',
      target: 'next',
    })
    await expect(
      renderGeneratedRouteText(next.files, 'DocsPage'),
    ).resolves.toContain('Artifact SaaS Docs')
    await expect(
      renderGeneratedRouteText(next.files, 'ContactPage'),
    ).resolves.toContain('Talk to Artifact SaaS')
    expect(next.files['app/admin/page.tsx']).toContain('ShipFastAdminGate')
    expect(next.files['src/ship-fast-admin.ts']).toContain('saas@example.com')
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
