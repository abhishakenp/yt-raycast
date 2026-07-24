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

const siteSpecJson = JSON.stringify({ projectName: 'Artifact Demo' })
const siteSpecJsonWithGenUI = JSON.stringify({
  projectName: 'Artifact Demo',
  genui: {
    version: 1,
    category: 'publication',
    ownerEmail: 'founder@example.com',
    fullstackManifest: { schema: 'publication-newsroom-v1' },
  },
})

const selectedBrandLogo = {
  name: 'The Beer Store',
  domain: 'thebeerstore.ca',
  brandId: 'idwTkaYgXe',
  icon: 'https://cdn.brandfetch.io/idwTkaYgXe/icon.webp',
  logo: 'https://cdn.brandfetch.io/idwTkaYgXe/logo.svg',
}

function expectNoStockProviderCredentialsOrProxy(artifact: string) {
  expect(artifact).not.toContain('PEXELS_API_KEY')
  expect(artifact).not.toContain('VITE_PEXELS_API_KEY')
  expect(artifact).not.toContain('api.pexels.com')
  expect(artifact).not.toContain('/api/pexels')
  expect(artifact).not.toContain('ship-fast.ai/api/pexels')
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

async function renderGeneratedRouteText(
  files: Record<string, string>,
  routeComponent: string,
): Promise<string> {
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
            pluginBuild.onResolve({ filter: /^@shoojs\/react$/ }, () => ({
              namespace: 'shoojs-stub',
              path: '@shoojs/react',
            }))
            pluginBuild.onResolve(
              { filter: /^react$/, namespace: 'shoojs-stub' },
              () => ({
                path: join(process.cwd(), 'node_modules/react/index.js'),
              }),
            )
            pluginBuild.onLoad(
              { filter: /^@shoojs\/react$/, namespace: 'shoojs-stub' },
              () => ({
                contents: `import React from "react";
const AuthContext = React.createContext({ identity: { userId: 'guest', email: null, name: null, picture: null }, signIn: () => {}, clearIdentity: () => {} });
export function useShooAuth() { return React.useContext(AuthContext); }
export function AuthProvider({ children }) { return React.createElement(React.Fragment, null, children); }
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
  it('does not leak ship-fast-genui.json in any export target', async () => {
    for (const target of ['react', 'next', 'lakebed', 'html'] as const) {
      const { files } = await buildOpenUIArtifactFiles({
        source:
          target === 'html'
            ? '<!doctype html><html><body><h1>Artifact</h1></body></html>'
            : v1PublicationSource,
        siteSpecJson: siteSpecJsonWithGenUI,
        sessionId: 'demo',
        target,
      })
      expect(Object.keys(files), `target=${target}`).not.toContain(
        'ship-fast-genui.json',
      )
      expect(Object.keys(files), `target=${target}`).not.toContain(
        'public/ship-fast-genui.json',
      )
    }
  })

  it('does not ship site-admin files in any export target', async () => {
    for (const target of ['react', 'next', 'lakebed', 'html'] as const) {
      const { files } = await buildOpenUIArtifactFiles({
        source:
          target === 'html'
            ? '<!doctype html><html><body><h1>Artifact</h1></body></html>'
            : v1PublicationSource,
        siteSpecJson: siteSpecJsonWithGenUI,
        sessionId: 'demo',
        target,
      })
      expect(Object.keys(files), `target=${target}`).not.toContain(
        'site-admin.js',
      )
      expect(Object.keys(files), `target=${target}`).not.toContain(
        'public/site-admin.js',
      )
      expect(Object.keys(files), `target=${target}`).not.toContain(
        'src/site-admin.ts',
      )
      expect(Object.keys(files), `target=${target}`).not.toContain(
        'src/lib/site-admin-gate.tsx',
      )
    }
  })

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

    expect(react.files['src/section-kit/Logo.tsx']).not.toContain(
      'data-brand-logo-selected',
    )
    expect(react.files['src/section-kit/Logo.tsx']).toContain(
      selectedBrandLogo.icon,
    )
    expect(react.files['src/lib/brand-logo-provider.tsx']).toBeUndefined()

    expect(next.files['src/section-kit/Logo.tsx']).not.toContain(
      'data-brand-logo-selected',
    )
    expect(next.files['src/section-kit/Logo.tsx']).toContain(
      selectedBrandLogo.icon,
    )
    expect(next.files['src/lib/brand-logo-provider.tsx']).toBeUndefined()

    expect(lakebed.files['client/section-kit/Logo.tsx']).not.toContain(
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
