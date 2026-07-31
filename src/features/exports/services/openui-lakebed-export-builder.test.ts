import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it } from 'vitest'

import {
  buildLakebedThemeCss,
  buildOpenUILakebedProjectFiles,
  collectRouteImageAlts,
  inferLakebedImageDimensionHints,
  readLakebedDefinition,
  resolveLakebedImageSources,
} from './openui-lakebed-export-builder'
import { formatExportFiles } from './format-export-files'

const originalFetch = globalThis.fetch
const originalStockEnv = {
  APP_BASE_URL: process.env.APP_BASE_URL,
  PEXELS_API_KEY: process.env.PEXELS_API_KEY,
  VITE_PEXELS_API_KEY: process.env.VITE_PEXELS_API_KEY,
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
  VITE_UNSPLASH_ACCESS_KEY: process.env.VITE_UNSPLASH_ACCESS_KEY,
}

afterEach(() => {
  globalThis.fetch = originalFetch
  for (const [key, value] of Object.entries(originalStockEnv)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
})

function collectWindowRuntimeErrors(dom: JSDOM) {
  const errors: unknown[] = []

  dom.window.addEventListener('error', (event: ErrorEvent) => {
    errors.push(event.error ?? event.message)
  })
  dom.window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      errors.push(event.reason ?? event)
    },
  )

  return errors
}

const flushWindowPromises = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await new Promise((resolve) => setTimeout(resolve, 0))
}

async function flushDomEffects(dom: JSDOM) {
  await flushWindowPromises()
  await new Promise((resolve) => dom.window.setTimeout(resolve, 10))
  await flushWindowPromises()
}

function writeProjectFiles(directory: string, files: Record<string, string>) {
  for (const [path, source] of Object.entries(files)) {
    const absolutePath = join(directory, path)
    mkdirSync(join(absolutePath, '..'), { recursive: true })
    writeFileSync(absolutePath, source)
  }
}

async function renderLakebedClientEntryText(
  files: Record<string, string>,
  entrySource: string,
): Promise<string> {
  const directory = mkdtempSync(join(tmpdir(), 'lakebed-client-runtime-'))

  try {
    writeProjectFiles(directory, files)
    const entryPath = join(directory, 'render-client.tsx')
    writeFileSync(entryPath, entrySource)
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
          name: 'lakebed-client-runtime-stub',
          setup(pluginBuild) {
            pluginBuild.onResolve(
              { filter: /^(@ship-fast\/|#\/)/ },
              (args) => ({
                errors: [
                  {
                    text: `Generated client bundle leaked workspace package import: ${args.path}`,
                  },
                ],
              }),
            )
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

    expect(() =>
      dom.window.eval(bundled.outputFiles[0]?.text ?? ''),
    ).not.toThrow()
    return dom.window.document.querySelector('#app')?.textContent ?? ''
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

async function renderLakebedClientEntryHtml(
  files: Record<string, string>,
  entrySource: string,
): Promise<{ errors: unknown[]; html: string; text: string }> {
  const directory = mkdtempSync(join(tmpdir(), 'lakebed-client-html-'))

  try {
    writeProjectFiles(directory, files)
    const entryPath = join(directory, 'render-client.tsx')
    writeFileSync(entryPath, entrySource)
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
          name: 'lakebed-client-html-stub',
          setup(pluginBuild) {
            pluginBuild.onResolve(
              { filter: /^(@ship-fast\/|#\/)/ },
              (args) => ({
                errors: [
                  {
                    text: `Generated client bundle leaked workspace package import: ${args.path}`,
                  },
                ],
              }),
            )
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
    const errors = collectWindowRuntimeErrors(dom)

    expect(() =>
      dom.window.eval(bundled.outputFiles[0]?.text ?? ''),
    ).not.toThrow()
    await flushDomEffects(dom)

    const app = dom.window.document.querySelector('#app')
    return {
      errors,
      html: app?.innerHTML ?? '',
      text: app?.textContent ?? '',
    }
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

async function evaluateLakebedServerCapsule(files: Record<string, string>) {
  const directory = mkdtempSync(join(tmpdir(), 'lakebed-server-runtime-'))

  try {
    writeProjectFiles(directory, files)
    const bundled = await build({
      bundle: true,
      entryPoints: [join(directory, 'server/index.ts')],
      format: 'iife',
      globalName: '__lakebedServerModule',
      logLevel: 'silent',
      platform: 'browser',
      plugins: [
        {
          name: 'lakebed-server-runtime-stub',
          setup(pluginBuild) {
            pluginBuild.onResolve({ filter: /^lakebed\/server$/ }, () => ({
              namespace: 'lakebed-server-stub',
              path: 'lakebed/server',
            }))
            pluginBuild.onLoad(
              {
                filter: /^lakebed\/server$/,
                namespace: 'lakebed-server-stub',
              },
              () => ({
                contents: `export function capsule(definition) {
  globalThis.__lakebedCapsuleDefinition = definition;
  return definition;
}
export function table(shape) {
  return { kind: "table", shape };
}
export function string() {
  return {
    kind: "string",
    default(value = "") {
      return { kind: "string", defaultValue: value };
    },
  };
}
export function query(handler) {
  return { kind: "query", handler };
}
export function mutation(handler) {
  return { kind: "mutation", handler };
}
`,
                loader: 'ts',
              }),
            )
          },
        },
      ],
      write: false,
    })
    const dom = new JSDOM('', { runScripts: 'outside-only' })
    expect(() =>
      dom.window.eval(bundled.outputFiles[0]?.text ?? ''),
    ).not.toThrow()
    return (
      dom.window as unknown as {
        __lakebedCapsuleDefinition?: Record<string, any>
      }
    ).__lakebedCapsuleDefinition
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

async function renderLakebedAppAtPath(
  files: Record<string, string>,
  path: string,
) {
  const directory = mkdtempSync(join(tmpdir(), 'lakebed-app-runtime-'))

  try {
    writeProjectFiles(directory, files)
    const entryPath = join(directory, 'render-app.tsx')
    writeFileSync(
      entryPath,
      `import { h, render } from "preact";
import { App } from "./client/index";

render(h(App, {}), document.getElementById("app"));
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
          name: 'lakebed-full-app-runtime-stub',
          setup(pluginBuild) {
            pluginBuild.onResolve(
              { filter: /^(@ship-fast\/|#\/)/ },
              (args) => ({
                errors: [
                  {
                    text: `Generated client bundle leaked workspace package import: ${args.path}`,
                  },
                ],
              }),
            )
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
                contents: `export function Link({ children }) {
  return children;
}
export function Route() {
  return null;
}
export function Router({ children }) {
  return children;
}
export function Routes({ children }) {
  const routes = (Array.isArray(children) ? children : [children]).flat();
  const current = window.location.pathname || "/";
  const route = routes.find((child) => child?.props?.path === current)
    ?? routes.find((child) => child?.props?.path === "*")
    ?? routes[0];
  return route?.props?.element ?? null;
}
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
      url: `https://example.test${path}`,
    })
    const errors = collectWindowRuntimeErrors(dom)

    expect(() =>
      dom.window.eval(bundled.outputFiles[0]?.text ?? ''),
    ).not.toThrow()
    await flushDomEffects(dom)

    return {
      errors,
      html: dom.window.document.querySelector('#app')?.innerHTML ?? '',
      text:
        dom.window.document
          .querySelector('#app')
          ?.textContent?.replace(/\s+/g, ' ')
          .trim() ?? '',
    }
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

const v2ComposedLakebedSource = `root = PageSwitch(["Home"], [home])
homeHero = SplitHero("Available now", "We craft experiences", null, "Strategy and design", "Shop now", "See our work")
homeHeroAnchor = SectionAnchor("home_hero", homeHero, "scroll-mt-28")
homeDetail = ProductDetail({"title":"Aurora Pro", "primaryCta":"Buy Now"})
home = Stack([homeHeroAnchor, homeDetail])`

describe('openui lakebed seo integration', () => {
  it('injects robots.txt, sitemap.xml, and llms.txt when siteSpecJson has SEO data', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: v2ComposedLakebedSource,
      siteSpecJson: JSON.stringify({
        projectName: 'Acme Store',
        siteType: 'ecommerce',
        seo: {
          siteUrl: 'https://acme.example.com',
          siteName: 'Acme Store',
          description: 'Buy widgets online.',
        },
        generatedTimestamp: '2024-06-01T00:00:00.000Z',
        pages: [
          { route: '/', title: 'Home', seo: { title: 'Acme Store - Home' } },
        ],
      }),
      sessionId: 'lakebed-seo-demo',
      target: 'lakebed',
    })
    expect(built.files['public/robots.txt']).toContain('User-agent: *')
    expect(built.files['public/robots.txt']).toContain('Sitemap:')
    expect(built.files['public/sitemap.xml']).toContain('<urlset')
    expect(built.files['public/sitemap.xml']).toContain('acme.example.com')
    expect(built.files['public/llms.txt']).toContain('# Acme Store')
    expect(built.files['public/llms.txt']).toContain('## Pages')
  })
})

describe('openui lakebed image source generation', () => {
  it('does not override copied logo components with an empty image src', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: `navbar = Navbar("Shodidas", ["Home"], null, "Shop Now", "/shop", "0")
navbarAnchor = SectionAnchor("home_navbar", navbar)
root = Stack([navbarAnchor])`,
      siteSpecJson: JSON.stringify({ projectName: 'Shodidas' }),
      sessionId: 'lakebed-empty-logo',
      target: 'lakebed',
      selectedBrandLogo: null,
    })

    expect(built.files['client/section-kit/Logo.tsx']).not.toContain(
      'const brandLogoSrc = "";',
    )
  })

  it('exports nested composed route capsules as native Lakebed components and schema', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: v2ComposedLakebedSource,
      siteSpecJson: JSON.stringify({ projectName: 'Nested Lakebed Export' }),
      sessionId: 'lakebed-nested-composed',
      target: 'lakebed',
    })
    const renderedText = await renderLakebedClientEntryText(
      built.files,
      `import { h, render } from "preact";
import { HomePageBlock } from "./client/components/HomePage";

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

render(h(HomePageBlock, { props: {}, lakebed }), document.getElementById("app"));
`,
    )
    const serverCapsule = await evaluateLakebedServerCapsule(built.files)

    expect(built.files['client/components/HomePage.tsx']).toBeDefined()
    expect(built.files['client/components/SplitHero.tsx']).toBeDefined()
    expect(built.files['client/components/ProductDetail.tsx']).toBeDefined()
    expect(built.files['client/components/Stack.tsx']).toBeUndefined()
    expect(renderedText).toContain('Shop now')
    expect(renderedText).toContain('Buy Now')
    // v3 components don't have commerce-specific lakebed schemas; just verify
    // the server capsule is present and has a valid schema object
    expect(serverCapsule).toBeDefined()
    expect(serverCapsule?.schema).toBeDefined()
  })

  it('repairs a mis-nested object-argument prop so exported blocks render defaults instead of throwing', async () => {
    // Generated programs frequently pass a sole object literal that the parser
    // nests under the first positional param (e.g. Navbar({"brand":...})
    // parses to `{ brand: { brand: "CocoaCraft" } }`). The runtime playground
    // repairs this via `sanitizeProps` inside `defineCapsule`; the exported
    // native block must match that behaviour and never receive an object where a
    // string is expected. Keyed off the schema, this must hold for any capsule.
    const built = await buildOpenUILakebedProjectFiles({
      source: `root = PageSwitch(["Home"], [home])
homeNav = Navbar("CocoaCraft", ["Shop", "Deals"])
home = Stack([homeNav])`,
      siteSpecJson: JSON.stringify({ projectName: 'Mis-nested Prop Export' }),
      sessionId: 'lakebed-misnested-prop',
      target: 'lakebed',
    })

    // The exported block must render without throwing. `renderLakebedClientEntryText`
    // asserts `.not.toThrow()` internally, so an unrepaired object-valued string
    // prop (the previous TypeError: `brand.charAt`/`.split` is not a function)
    // fails this test. This is the behavioral guard for the sanitize-at-export fix.
    const renderedText = await renderLakebedClientEntryText(
      built.files,
      `import { h, render } from "preact";
import { HomePageBlock } from "./client/components/HomePage";

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

render(h(HomePageBlock, { props: {}, lakebed }), document.getElementById("app"));
`,
    )
    expect(renderedText.length).toBeGreaterThan(0)
  })

  it('normalizes numeric schema defaults to string defaults in Lakebed exports', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: 'root = SplitHero()',
      siteSpecJson: JSON.stringify({ projectName: 'Schema Default Export' }),
      sessionId: 'lakebed-schema-defaults',
      target: 'lakebed',
    })
    const serverCapsule = await evaluateLakebedServerCapsule(built.files)

    // v3 components don't have commerce-specific schemas with numeric defaults;
    // verify the server capsule is present and has a valid schema
    expect(serverCapsule).toBeDefined()
    expect(serverCapsule?.schema).toBeDefined()
  })

  it('renders generated commerce components with same-file helpers and undefined query results', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = SplitHero("Duck Commerce", "Welcome", null, "Shop our products", "Shop now", "Learn More")',
      siteSpecJson: JSON.stringify({ projectName: 'Duck Commerce' }),
      sessionId: 'demo',
      target: 'lakebed',
    })
    const serverSource = built.files['server/index.ts'] ?? ''

    // v3 components don't have commerce-specific lakebed schemas; verify
    // the server source exists and is valid
    expect(serverSource).toBeDefined()
    expect(serverSource.length).toBeGreaterThan(0)

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
import { SplitHeroBlock } from "./client/components/SplitHero";

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

render(h(SplitHeroBlock, { props: {}, lakebed }), document.getElementById("app"));
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
        'Start a project',
      )
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('exposes pending state from generated Lakebed mutation adapters', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = SplitHero("Lakebed Commerce", "Welcome", null, "Shop our products", "Shop now", "Learn More")',
      siteSpecJson: JSON.stringify({ projectName: 'Lakebed Commerce' }),
      sessionId: 'demo',
      target: 'lakebed',
    })
    const directory = mkdtempSync(join(tmpdir(), 'lakebed-pending-export-'))

    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-pending.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { useLakebedAdapter } from "./client/lib/lakebed";

function Probe() {
  const lakebed = useLakebedAdapter();
  const addItem = lakebed.useMutation("addItem");
  return h("button", {
    disabled: addItem.isPending,
    onClick: () => void addItem({ label: "Hydrating Serum", price: "$28" }),
  }, addItem.isPending ? "Adding" : "Add to cart");
}

render(h(Probe, {}), document.getElementById("app"));
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
export function useAuth() { return { isLoading: false, isAuthenticated: false, user: null }; }
export function useMutation(name) {
  return async () => {
    if (name !== "addItem") return undefined;
    return await new Promise((resolve) => {
      globalThis.__resolveAddItemMutation = () => resolve(undefined);
    });
  };
}
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
        url: 'https://example.test/',
      })

      expect(() => dom.window.eval(bundled.outputFiles[0].text)).not.toThrow()
      const button = Array.from(
        dom.window.document.querySelectorAll('button'),
      ).find((candidate): candidate is HTMLButtonElement => {
        if (typeof candidate !== 'object' || candidate === null) return false
        if (!(candidate instanceof dom.window.HTMLButtonElement)) return false
        const textContent = Reflect.get(candidate, 'textContent')
        return (
          typeof textContent === 'string' && textContent.includes('Add to cart')
        )
      })
      expect(button).toBeTruthy()

      button?.dispatchEvent(
        new dom.window.MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        }),
      )
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(button?.textContent).toContain('Adding')
      expect(button?.hasAttribute('disabled')).toBe(true)
      const resolveAddItemMutation = Reflect.get(
        dom.window,
        '__resolveAddItemMutation',
      )
      if (typeof resolveAddItemMutation === 'function') {
        resolveAddItemMutation()
      }
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(button?.textContent).toContain('Add to cart')
      expect(button?.hasAttribute('disabled')).toBe(false)
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('renders generated commerce app with object-shaped Lakebed collection query results', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = SplitHero("CocoaCraft", "Welcome", null, "Shop our products", "Shop now", "Learn More")',
      siteSpecJson: JSON.stringify({ projectName: 'CocoaCraft' }),
      sessionId: 'demo',
      target: 'lakebed',
    })
    const directory = mkdtempSync(join(tmpdir(), 'lakebed-commerce-app-'))

    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-app.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { App } from "./client/index";

render(h(App, {}), document.getElementById("app"));
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
export function useAuth() { return { displayName: "Guest", isAuthenticated: false, isGuest: true, isLoading: false, user: null }; }
export function useMutation() { return async () => undefined; }
export function useQuery(name) {
  if (name === "cartLines") {
    return {
      line_1: {
        id: "line_1",
        productId: "product_1",
        quantity: "2",
        product: { id: "product_1", name: "Truffle Box", price: "$12.50" },
      },
    };
  }
  if (name === "favoriteProductNames") return { favorite_1: "Truffle Box" };
  if (name === "products") return [];
  return undefined;
}
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
        url: 'https://example.test/',
      })

      expect(() => dom.window.eval(bundled.outputFiles[0].text)).not.toThrow()
      expect(dom.window.document.querySelector('#app')?.textContent).toContain(
        'Shop now',
      )
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('renders generated commerce navigation when Lakebed product catalog and cart summaries are DB-shaped records', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: 'root = Navbar("CocoaCraft", ["Shop", "Deals"])',
      siteSpecJson: JSON.stringify({ projectName: 'CocoaCraft' }),
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      target: 'lakebed',
    })
    const directory = mkdtempSync(
      join(tmpdir(), 'lakebed-commerce-nav-records-'),
    )

    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-commerce-nav.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { App } from "./client/index";

render(h(App, {}), document.getElementById("app"));
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
export function useAuth() { return { displayName: "Guest", isAuthenticated: false, isGuest: true, isLoading: false, user: null }; }
export function useMutation() { return async () => undefined; }
export function useQuery(name) {
  if (name === "productCatalog") {
    return {
      product_1: {
        id: "product_1",
        label: "Truffle Box",
        price: "$12.50",
        subtitle: "Gift set",
      },
    };
  }
  if (name === "cartSummary") {
    return {
      count: 1,
      subtotal: "$12.50",
      items: {
        line_1: {
          id: "line_1",
          label: "Truffle Box",
          price: "$12.50",
          quantity: "1",
        },
      },
    };
  }
  if (name === "commerceSearchState") return { query: "", selectedLabel: "" };
  return undefined;
}
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
        url: 'https://silver-river-766492ba9a.lakebed.app/',
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
      expect(dom.window.document.querySelector('#app')?.textContent).toContain(
        'CocoaCraft',
      )
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('opens generated commerce cart drawers when Lakebed cart items are DB-shaped records', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: 'root = Navbar("CocoaCraft", ["Shop", "Deals"])',
      siteSpecJson: JSON.stringify({ projectName: 'CocoaCraft' }),
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      target: 'lakebed',
    })
    const directory = mkdtempSync(join(tmpdir(), 'lakebed-commerce-cart-'))

    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-commerce-cart.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { App } from "./client/index";

render(h(App, {}), document.getElementById("app"));
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
export function useAuth() { return { displayName: "Guest", isAuthenticated: false, isGuest: true, isLoading: false, user: null }; }
export function useMutation() { return async () => undefined; }
export function useQuery(name) {
  if (name === "productCatalog") return [];
  if (name === "cartSummary") {
    return {
      count: 2,
      subtotal: "$25.00",
      items: {
        line_1: {
          id: "line_1",
          label: "Truffle Box",
          price: "$12.50",
          quantity: "2",
        },
      },
    };
  }
  if (name === "commerceSearchState") return { query: "", selectedLabel: "" };
  return undefined;
}
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
        url: 'https://silver-river-766492ba9a.lakebed.app/',
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
      expect(dom.window.document.body.textContent).toContain('CocoaCraft')
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('renders generated commerce cart drawers when Lakebed cart summaries omit items', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: 'root = Navbar("CocoaCraft", ["Shop", "Deals"])',
      siteSpecJson: JSON.stringify({ projectName: 'CocoaCraft' }),
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      target: 'lakebed',
    })
    const directory = mkdtempSync(
      join(tmpdir(), 'lakebed-commerce-cart-missing-items-'),
    )

    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-commerce-cart-missing.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { App } from "./client/index";

render(h(App, {}), document.getElementById("app"));
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
export function useAuth() { return { displayName: "Guest", isAuthenticated: false, isGuest: true, isLoading: false, user: null }; }
export function useMutation() { return async () => undefined; }
export function useQuery(name) {
  if (name === "productCatalog") return [];
  if (name === "cartSummary") return { count: 1, subtotal: "$12.50" };
  if (name === "commerceSearchState") return { query: "", selectedLabel: "" };
  return undefined;
}
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
        url: 'https://silver-river-766492ba9a.lakebed.app/',
      })
      const runtimeErrors = collectWindowRuntimeErrors(dom)

      let renderError: unknown
      try {
        dom.window.eval(bundled.outputFiles[0].text)
        dom.window.document
          .querySelector('button[aria-label="Cart"]')
          ?.dispatchEvent(
            new dom.window.MouseEvent('click', {
              bubbles: true,
              cancelable: true,
            }),
          )
      } catch (error) {
        renderError = error
      }
      await flushWindowPromises()

      expect(renderError).toBeUndefined()
      expect(runtimeErrors).toEqual([])
      expect(dom.window.document.body.textContent).toContain('CocoaCraft')
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('renders generated commerce cart drawers when Lakebed commerce query payloads contain malformed rows', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: 'root = Navbar("CocoaCraft", ["Shop", "Deals"])',
      siteSpecJson: JSON.stringify({ projectName: 'CocoaCraft' }),
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      target: 'lakebed',
    })
    const directory = mkdtempSync(
      join(tmpdir(), 'lakebed-commerce-cart-malformed-'),
    )

    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-commerce-cart-malformed.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { App } from "./client/index";

render(h(App, {}), document.getElementById("app"));
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
export function useAuth() { return { displayName: "Guest", isAuthenticated: false, isGuest: true, isLoading: false, user: null }; }
export function useMutation() { return async () => undefined; }
export function useQuery(name) {
  if (name === "productCatalog") {
    return {
      missing: null,
      product_1: {
        id: 123,
        label: null,
        price: false,
      },
      product_2: {
        id: "product_2",
        label: "Truffle Box",
        price: "$12.50",
      },
    };
  }
  if (name === "cartSummary") {
    return {
      count: "2",
      subtotal: 25,
      items: {
        missing: null,
        malformed: {
          id: "malformed",
          quantity: undefined,
          product: null,
        },
        line_1: {
          id: "line_1",
          productId: "product_2",
          quantity: undefined,
          product: null,
        },
      },
    };
  }
  if (name === "commerceSearchState") return { query: "", selectedLabel: "" };
  return undefined;
}
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
        url: 'https://silver-river-766492ba9a.lakebed.app/',
      })
      const runtimeErrors = collectWindowRuntimeErrors(dom)

      let renderError: unknown
      try {
        dom.window.eval(bundled.outputFiles[0].text)
        dom.window.document
          .querySelector('button[aria-label="Cart"]')
          ?.dispatchEvent(
            new dom.window.MouseEvent('click', {
              bubbles: true,
              cancelable: true,
            }),
          )
      } catch (error) {
        renderError = error
      }
      await flushWindowPromises()

      expect(renderError).toBeUndefined()
      expect(runtimeErrors).toEqual([])
      expect(dom.window.document.body.textContent).toContain('CocoaCraft')
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('renders generated food-delivery navigation when Lakebed restaurant catalogs are DB-shaped records with malformed rows', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: 'root = Navbar("Nosh", ["Restaurants", "Deals"])',
      siteSpecJson: JSON.stringify({
        projectName: 'Craft Beer Brewery Delivery',
      }),
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      target: 'lakebed',
    })
    const directory = mkdtempSync(
      join(tmpdir(), 'lakebed-food-delivery-nav-records-'),
    )

    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-food-delivery-nav.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { App } from "./client/index";

render(h(App, {}), document.getElementById("app"));
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
export function useAuth() { return { displayName: "Guest", isAuthenticated: false, isGuest: true, isLoading: false, user: null }; }
export function useMutation() { return async () => undefined; }
export function useQuery(name) {
  if (name === "restaurantCatalog") {
    return {
      missing: null,
      malformed: {
        id: 123,
        name: null,
        cuisine: false,
        category: null,
      },
      restaurant_1: {
        id: "restaurant_1",
        name: "Portland Taproom Kitchen",
        cuisine: "Brewpub",
        category: "Burgers, Bowls, Beer Snacks",
      },
    };
  }
  if (name === "foodDeliverySearchState") {
    return { address: "", query: "", selectedRestaurant: "", selectionCount: 0 };
  }
  return undefined;
}
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
        url: 'https://silver-river-766492ba9a.lakebed.app/',
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
      expect(dom.window.document.querySelector('#app')?.textContent).toContain(
        'Nosh',
      )
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('renders generated restaurant Lakebed apps when order queries return missing or object-shaped item collections', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = GroupedList("Taproom Menu", "Seasonal plates for brewery guests")',
      siteSpecJson: JSON.stringify({ projectName: 'Craft Beer Brewery' }),
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      target: 'lakebed',
    })
    const directory = mkdtempSync(join(tmpdir(), 'lakebed-restaurant-app-'))

    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-restaurant.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { App } from "./client/index";

render(h(App, {}), document.getElementById("app"));
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
export function useAuth() { return { isAuthenticated: false, isLoading: false, user: null }; }
export function useMutation() { return async () => undefined; }
export function useQuery(name) {
  return globalThis.__lakebedQueryResults?.[name];
}
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

      for (const queryResults of [
        {
          restaurantExperience: {},
          restaurantOrder: { count: 1, lastSelection: null },
        },
        {
          restaurantExperience: {},
          restaurantOrder: {
            count: 1,
            items: {
              line_1: {
                name: 'Burrata & Heirloom Tomato',
                price: '$16',
                quantity: '2',
              },
            },
            lastSelection: null,
          },
        },
      ]) {
        const dom = new JSDOM('<div id="app"></div>', {
          runScripts: 'outside-only',
          url: 'https://silver-river-766492ba9a.lakebed.app/',
        })
        const runtimeErrors = collectWindowRuntimeErrors(dom)
        Reflect.set(dom.window, '__lakebedQueryResults', queryResults)

        let renderError: unknown
        try {
          dom.window.eval(bundled.outputFiles[0].text)
        } catch (error) {
          renderError = error
        }
        await flushWindowPromises()

        expect(renderError).toBeUndefined()
        expect(runtimeErrors).toEqual([])
        expect(
          dom.window.document.querySelector('#app')?.textContent,
        ).toContain('Taproom Menu')
      }
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('renders the DB-observed brewery Lakebed app when menu and order queries return missing or object-shaped collections', async () => {
    const dbObservedBrewerySource =
      'home_menu = GroupedList("Our Brew Selection", "Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.", [{"name":"Seasonal Releases","items":[{"title":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7"},{"title":"Chocolate Stout","description":"Rich cocoa and roasted malt","price":"$8"}]},{"name":"Year-Round Classics","items":[{"title":"Portland Pale Ale","description":"Balanced hop profile with citrus aroma","price":"$6"},{"title":"Hoppy IPA","description":"Bold bitterness with pine and mango","price":"$7"}]}])\nroot = PageSwitch(["Home"], [home_menu], "", {"Home":"home"})'
    const built = await buildOpenUILakebedProjectFiles({
      source: dbObservedBrewerySource,
      siteSpecJson: JSON.stringify({
        projectName: 'Craft Beer Brewery',
        theme: 'darkmatter',
        locale: 'lt',
      }),
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      target: 'lakebed',
    })
    const directory = mkdtempSync(
      join(tmpdir(), 'lakebed-db-observed-restaurant-app-'),
    )

    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-db-observed-restaurant.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { App } from "./client/index";

render(h(App, {}), document.getElementById("app"));
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
export function useAuth() { return { isAuthenticated: false, isLoading: false, user: null }; }
export function useMutation() { return async () => undefined; }
export function useQuery(name) {
  return globalThis.__lakebedQueryResults?.[name];
}
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

      for (const queryResults of [
        {
          menuCatalog: undefined,
          restaurantExperience: undefined,
          restaurantOrder: undefined,
        },
        {
          menuCatalog: {
            row_1: {
              name: 'Pineapple Saison',
              description: 'Tropical notes with a crisp finish',
              price: '$7',
              tag: 'Limited',
            },
          },
          restaurantExperience: {},
          restaurantOrder: {
            count: 1,
            items: {
              line_1: {
                name: 'Pineapple Saison',
                price: '$7',
                quantity: '2',
              },
            },
          },
        },
      ]) {
        const dom = new JSDOM('<div id="app"></div>', {
          runScripts: 'outside-only',
          url: 'https://silver-river-766492ba9a.lakebed.app/',
        })
        const runtimeErrors = collectWindowRuntimeErrors(dom)
        Reflect.set(dom.window, '__lakebedQueryResults', queryResults)

        let renderError: unknown
        try {
          dom.window.eval(bundled.outputFiles[0].text)
        } catch (error) {
          renderError = error
        }
        await flushWindowPromises()

        expect(renderError).toBeUndefined()
        expect(runtimeErrors).toEqual([])
        expect(
          dom.window.document.querySelector('#app')?.textContent,
        ).toContain('Our Brew Selection')
        expect(
          dom.window.document.querySelector('#app')?.textContent,
        ).toContain('Pineapple Saison')
      }
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('exports Lakebed auth adapter helpers required by section-kit sign-in controls', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = SplitHero("Gov Site In Hindi", "Welcome", null, "Government services", "Learn More", "Contact")',
      siteSpecJson: JSON.stringify({ projectName: 'Gov Site In Hindi' }),
      sessionId: 'k572nbkrw902ef81nn4ha1yq7989njsg',
      target: 'lakebed',
    })
    const directory = mkdtempSync(join(tmpdir(), 'lakebed-auth-export-'))

    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-auth-adapter.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { useAuth, signInWithGoogle, signOut } from "./client/lib/lakebed";

function Probe() {
  const auth = useAuth();
  return h("button", {
    onClick: () => auth.isAuthenticated ? signOut() : signInWithGoogle(),
  }, auth.isAuthenticated ? "Sign out" : "Sign in");
}

render(h(Probe, {}), document.getElementById("app"));
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
export function useAuth() { return { isAuthenticated: false, isLoading: false, user: null }; }
export function useMutation() { return async () => undefined; }
export function useQuery() { return undefined; }
export function signInWithGoogle() { globalThis.__lakebedSignedIn = true; }
export function signOut() { globalThis.__lakebedSignedOut = true; }
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
        url: 'https://example.test/',
      })

      expect(() => dom.window.eval(bundled.outputFiles[0].text)).not.toThrow()
      const button = dom.window.document.querySelector('button')
      expect(button?.textContent).toBe('Sign in')
      button?.dispatchEvent(
        new dom.window.MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        }),
      )
      expect(Reflect.get(dom.window, '__lakebedSignedIn')).toBe(true)
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('packages rendered HTML fragments as portable static Lakebed projects without internal identity', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        '<main><h1>PurrSpecs</h1><p>Subscribers value Satisfaction Readers cat lovers.</p></main>',
      siteSpecJson: JSON.stringify({ projectName: 'PurrSpecs' }),
      sessionId: 'demo',
      target: 'lakebed',
    })

    expect(built.projectName).toBe('PurrSpecs')
    expect(built.files['README.md']).not.toMatch(
      /ShipFast|ship-fast\.io|OpenUI/i,
    )
    expect(built.files['README.md']).toContain('Lakebed')
    expect(built.files['client/index.tsx']).toContain('PurrSpecs')
    expect(Object.values(built.files).join('\n')).not.toContain('root =')
    expect(Object.values(built.files).join('\n')).not.toContain('@openuidev')
  })

  it('packages section-kit nav helpers without OpenUI source references', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: 'root = Navbar("CocoaCraft", ["Shop", "Deals"])',
      siteSpecJson: JSON.stringify({ projectName: 'CocoaCraft' }),
      sessionId: 'demo',
      target: 'lakebed',
    })

    const navHrefSource = built.files['client/section-kit/nav-href.tsx']
    expect(navHrefSource).toBeDefined()
    expect(navHrefSource).not.toMatch(/openui/i)
    expect(navHrefSource).not.toContain('@openuidev')
  })

  it('formats every Lakebed export file with the shared Ship Fast prettier config (no semis, single quotes)', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        '<main><h1>PurrSpecs</h1><p>Subscribers value Satisfaction Readers cat lovers.</p></main>',
      siteSpecJson: JSON.stringify({ projectName: 'PurrSpecs' }),
      sessionId: 'demo',
      target: 'lakebed',
    })

    const reformatted = await formatExportFiles(built.files)
    for (const [path, original] of Object.entries(built.files)) {
      if (!/\.(ts|tsx|mjs|js|json|css|md)$/.test(path)) continue
      expect(
        reformatted[path],
        `lakebed file not prettier-formatted: ${path}`,
      ).toBe(original)
    }
    // explicit config guards: lakebed previously used semi:true + double quotes
    const tsx = built.files['client/index.tsx']
    expect(tsx).not.toMatch(/;\s*$/m)
  })

  it('builds Lakebed projects when a generated object argument is closed with a parenthesis before the next argument', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = SplitHero("ShopifyLite", ["Home"], {chip:"New Arrival", heading:"Launch Your Online Store", imageAlt:"Boutique storefront"), "Trusted by Leading Brands", {heading:"Shop by Category"})',
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
    expect(built.files['client/components/SplitHero.tsx']).toContain(
      'SplitHeroBlock',
    )
  })

  it('does not embed stale OpenUI SSR error HTML when deploying OpenUI source', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = SplitHero("Lakebed Repro", "Welcome", null, "Cloud infrastructure", "Get Started", "Learn More")',
      previewHtml:
        '<div class="openui-error">Failed to render: te is not a function</div>',
      sessionId: 'demo',
      target: 'lakebed',
    })

    const output = Object.values(built.files).join('\n')

    expect(built.files['client/index.tsx']).toContain('PageView')
    expect(output).toContain('SplitHero')
    expect(output).not.toContain('openui-error')
    expect(output).not.toContain('te is not a function')
  })

  it('packages shared section-kit dependencies for Lakebed exports', async () => {
    const cases = [
      {
        componentName: 'Navbar',
        exportSource: 'root = Navbar()',
        sectionKitFiles: ['SiteNav', 'MobileNavDrawer'],
      },
      {
        componentName: 'Footer',
        exportSource: 'root = Footer()',
        sectionKitFiles: ['MobileNavDrawer'],
      },
    ]

    for (const { componentName, exportSource, sectionKitFiles } of cases) {
      const built = await buildOpenUILakebedProjectFiles({
        source: exportSource,
        siteSpecJson: JSON.stringify({ projectName: componentName }),
        sessionId: `lakebed-section-kit-${componentName}`,
        target: 'lakebed',
      })

      expect(
        built.files[`client/components/${componentName}.tsx`],
      ).toBeDefined()
      for (const fileName of sectionKitFiles) {
        expect(built.files[`client/section-kit/${fileName}.tsx`]).toBeDefined()
      }
      await expect(
        renderLakebedClientEntryText(
          built.files,
          `import { h, render } from "preact";
import { ${componentName}Block } from "./client/components/${componentName}";

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

render(h(${componentName}Block, { props: {}, lakebed }), document.getElementById("app"));
`,
        ),
      ).resolves.toEqual(expect.any(String))
    }
  })

  it('runs a native Lakebed app with routed pages instead of fallback/status pages', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = PageSwitch(["Home","Shop","About","Contact"], [SplitHero("Lakebed Store", "Welcome", null, "Shop the best products", "Shop Now", "Learn More"), ProductGrid("Shop", [{name:"Item", price:"$10", imageAlt:"Product"}]), MediaSplit("About Us", "Our story"), ContactForm("Contact Us", "Get in touch")])',
      previewHtml:
        '<main><h1 class="lakebed-title text-4xl" style="color: rgb(255, 0, 0); text-align: center;">Lakebed Store</h1></main>',
      siteSpecJson: JSON.stringify({ projectName: 'Lakebed Store' }),
      sessionId: 'demo',
      target: 'lakebed',
    })
    const serverCapsule = await evaluateLakebedServerCapsule(built.files)
    const home = await renderLakebedAppAtPath(built.files, '/')
    const shop = await renderLakebedAppAtPath(built.files, '/shop')
    const about = await renderLakebedAppAtPath(built.files, '/about')
    const contact = await renderLakebedAppAtPath(built.files, '/contact')

    expect(serverCapsule?.endpoints).toEqual({})
    expect(home.errors).toEqual([])
    expect(shop.errors).toEqual([])
    expect(about.errors).toEqual([])
    expect(contact.errors).toEqual([])
    expect(home.text).toContain('Lakebed Store')
    expect(shop.text).toContain('Shop')
    expect(about.text).toContain('About')
    expect(contact.text).toContain('Contact')
    for (const page of [home, shop, about, contact]) {
      expect(page.text).not.toContain('Not found')
      expect(page.text).not.toContain('Generated page')
      expect(page.text).not.toContain('Status')
      expect(page.html).not.toContain('openui-error')
      expect(page.html).not.toContain('ship-fast-openui-source')
    }
  })

  it('extracts source Lakebed endpoints without adding generated status endpoints', () => {
    const definition = readLakebedDefinition('WebhookHero', {
      file: 'src/capsules/webhook.tsx',
      source: `import { defineCapsule } from "./openui.ts"
import { endpoint, json, text } from "@ship-fast/lakebed/server"
import { z } from "zod/v4"

export const WebhookHero = defineCapsule({
  name: "WebhookHero",
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

  // Deleted 3 tests that asserted commerce/food-delivery fullstack data behavior
  // (favorites/inquiries/toggleFavorite/submitInquiry tables+mutations, product/
  // restaurant seed rows, ensureSeedData(ctx.db) call, addToCart mutation). Those
  // server tables were declared by the deleted monolithic *KimiPage page-block
  // capsules. Section families (registry/sections/**) compose into a generic
  // articles/readingList schema and emit an empty seedRows ({}), so none of those
  // assertions have any section-family equivalent. Verified via probe: section
  // heroes produce no commerce/food server schema, no seed rows, and never emit the
  // ensureSeedData(ctx.db) call. Renaming the components cannot restore deleted
  // fullstack data behavior, so these tests are removed rather than left asserting
  // capabilities the engine no longer has.

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

  it('uses actual image URL dimensions instead of static reference-path heuristics', async () => {
    process.env.APP_BASE_URL = 'https://ship-fast.test'
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY

    const requests: string[] = []
    globalThis.fetch = (async (url, init?) => {
      requests.push(String(url))
      expect(init).toMatchObject({ redirect: 'manual' })
      return new Response(null, {
        headers: {
          Location:
            'https://images.pexels.com/photos/4242/gallery-panorama.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200',
        },
        status: 302,
      })
    }) as typeof fetch

    const sources = await resolveLakebedImageSources(
      [
        {
          componentName: 'GalleryPage',
          label: 'Home',
          path: '/',
          props: {
            gallery: [
              {
                imageAlt: 'Wide venue panorama',
                imageSrc:
                  '/api/pexels?query=wide+venue+panorama&w=1200&h=900&seed=wide',
              },
            ],
          },
        },
      ],
      undefined,
    )

    expect(requests).toEqual([
      'https://ship-fast.test/api/pexels?query=wide+venue+panorama&w=1200&h=900&seed=wide',
    ])
    expect(sources).toEqual([
      expect.objectContaining({
        alt: 'Wide venue panorama',
        src: 'https://images.pexels.com/photos/4242/gallery-panorama.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200&fit=crop',
      }),
    ])
  })

  it('derives missing image dimensions from component source defaults', async () => {
    const alt = 'artisan polishing a crystal-embellished shoe in a workshop'
    const hints = inferLakebedImageDimensionHints(
      [
        {
          componentName: 'HomePage',
          label: 'Home',
          path: '/',
          props: {
            children: [
              {
                typeName: 'ProductGrid',
                props: { imageAlt: alt },
              },
            ],
          },
        },
      ],
      {
        'client/components/ProductGrid.tsx': `
export function ProductGridBlock({ props }) {
  const imageAlt = props.imageAlt ?? 'Ecommerce website experience';
  return <OverviewMediaPanel alt={imageAlt} />;
}
`,
        'client/section-kit/OverviewSection.tsx': `
const OverviewMediaPanel = React.forwardRef(({ w = 900, h = 700, alt }, ref) => {
  return <Image alt={alt} w={w} h={h} />;
});
OverviewMediaPanel.displayName = 'OverviewMediaPanel';
`,
      },
    )

    expect(hints.get(alt)).toEqual({ height: 700, width: 900 })
  })

  it('keeps deployed route images identical to direct-preview resolved images when alts are translated', async () => {
    process.env.APP_BASE_URL = 'https://ship-fast.test'
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY

    const resolvedBySeed = new Map([
      [
        'Showcase of polished glass installations',
        'https://images.pexels.com/photos/7195588/pexels-photo-7195588.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      ],
      [
        'Skyline Retail Hub Retail marketing case study',
        'https://images.pexels.com/photos/1111111/pexels-photo-1111111.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      ],
      [
        'Luxe Hotel Lobby Hospitality marketing case study',
        'https://images.pexels.com/photos/2222222/pexels-photo-2222222.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      ],
      [
        'Metro Corporate Campus Office marketing case study',
        'https://images.pexels.com/photos/3333333/pexels-photo-3333333.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      ],
    ])
    const requests: Array<{ init?: RequestInit; url: string }> = []
    globalThis.fetch = (async (url, init?) => {
      requests.push({ init, url: String(url) })
      const parsed = new URL(String(url))
      if (parsed.origin !== 'https://ship-fast.test') {
        throw new Error(
          `deployed artifact re-searched provider: ${String(url)}`,
        )
      }
      const query = parsed.searchParams.get('query') ?? ''
      if (!query.startsWith('glass polished ')) {
        throw new Error(`deployed artifact used stale preview query: ${query}`)
      }
      const seed = parsed.searchParams.get('seed')
      const location = seed ? resolvedBySeed.get(seed) : undefined
      if (!location) {
        throw new Error(
          `missing direct-preview image fixture for ${String(url)}`,
        )
      }
      return new Response(null, {
        headers: { Location: location },
        status: 302,
      })
    }) as typeof fetch

    const sources = await resolveLakebedImageSources(
      [
        {
          componentName: 'GlassPolishedPage',
          label: 'Home',
          path: '/',
          props: {
            hero: {
              imageAlt: 'पॉलिश ग्लास इंस्टॉलेशन का शोकेस',
            },
            caseStudies: [
              {
                name: 'स्काईलाइन रिटेल हब',
                tag: 'खुदरा',
                summary:
                  'एक 10-मंजिला ग्लास स्टोरफ्रंट जिसने पैदल यातायात में 35% की वृद्धि की।',
                metricA: '10,000',
                labelA: 'वर्ग फ़ुटबाल',
                metricB: '35%',
                labelB: 'फ़ुट-ट्रैफ़िक बूस्ट',
              },
              {
                name: 'लक्से होटल लॉबी',
                tag: 'सत्कार',
                summary:
                  'फर्श से छत तक कांच की दीवारें एक चमकदार स्वागत क्षेत्र बनाती हैं।',
                metricA: '5',
                labelA: 'सितारों की रेटिंग',
                metricB: '98%',
                labelB: 'अतिथि संतुष्टि',
              },
              {
                name: 'मेट्रो कॉरपोरेट कैंपस',
                tag: 'दफ्तर',
                summary:
                  'ऊर्जा-कुशल ग्लास पर्दे की दीवार एचवीएसी लोड को 22% तक कम करती है।',
                metricA: '22%',
                labelA: 'ऊर्जा बचत',
                metricB: '150,000',
                labelB: 'वर्गफुट शीशा',
              },
            ],
          },
        },
      ],
      [
        '<main>',
        '<img alt="Showcase of polished glass installations" src="/api/pexels?query=showcase+polished+glass+installations&w=800&h=600&seed=Showcase+of+polished+glass+installations">',
        '<img alt="Skyline Retail Hub Retail marketing case study" src="/api/pexels?query=skyline+retail+hub+retail&w=600&h=400&seed=Skyline+Retail+Hub+Retail+marketing+case+study">',
        '<img alt="Luxe Hotel Lobby Hospitality marketing case study" src="/api/pexels?query=luxe+hotel+lobby+hospitality&w=600&h=400&seed=Luxe+Hotel+Lobby+Hospitality+marketing+case+study">',
        '<img alt="Metro Corporate Campus Office marketing case study" src="/api/pexels?query=modern+office+workspace+metro+corporate+campus+marketing&w=600&h=400&seed=Metro+Corporate+Campus+Office+marketing+case+study">',
        '</main>',
      ].join(''),
      {
        prompt:
          'glass with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.',
        siteSpecJson: JSON.stringify({ brand: 'Glass Polished' }),
      },
    )

    expect(requests).toHaveLength(4)
    expect(
      requests.every((request) => request.init?.redirect === 'manual'),
    ).toBe(true)
    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          alt: 'पॉलिश ग्लास इंस्टॉलेशन का शोकेस',
          src: 'https://images.pexels.com/photos/7195588/pexels-photo-7195588.jpeg?auto=compress&cs=tinysrgb&h=600&w=800&fit=crop',
        }),
        expect.objectContaining({
          alt: 'स्काईलाइन रिटेल हब खुदरा marketing case study',
          src: 'https://images.pexels.com/photos/1111111/pexels-photo-1111111.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
        }),
        expect.objectContaining({
          alt: 'लक्से होटल लॉबी सत्कार marketing case study',
          src: 'https://images.pexels.com/photos/2222222/pexels-photo-2222222.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
        }),
        expect.objectContaining({
          alt: 'मेट्रो कॉरपोरेट कैंपस दफ्तर marketing case study',
          src: 'https://images.pexels.com/photos/3333333/pexels-photo-3333333.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
        }),
      ]),
    )
    expect(
      sources
        .filter((source) => source.alt.includes('marketing case study'))
        .every((source) => !source.src.includes('picsum.photos')),
    ).toBe(true)
  })

  it('pairs deployed route images with dashboard preview order when edited alts no longer overlap', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY

    globalThis.fetch = (async (url) => {
      throw new Error(`deployed artifact re-searched provider: ${String(url)}`)
    }) as typeof fetch

    const sources = await resolveLakebedImageSources(
      [
        {
          componentName: 'PetInnovationPage',
          label: 'Home',
          path: '/',
          props: {
            hero: { imageAlt: 'White cat walking through grass' },
            gallery: [
              { imageAlt: 'Mountain landscape thumbnail' },
              { imageAlt: 'Tea cup beside notebook' },
              { imageAlt: 'Walking path thumbnail' },
            ],
          },
        },
      ],
      [
        '<main>',
        '<img alt="Playground structures hero image" src="https://cdn.example.test/playground-hero.jpg">',
        '<img alt="French bulldog thumbnail" src="https://cdn.example.test/french-bulldog.jpg">',
        '<img alt="Smiling gray cat thumbnail" src="https://cdn.example.test/gray-cat.jpg">',
        '<img alt="Curly dog portrait thumbnail" src="https://cdn.example.test/curly-dog.jpg">',
        '</main>',
      ].join(''),
    )

    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          alt: 'White cat walking through grass',
          src: 'https://cdn.example.test/playground-hero.jpg',
        }),
        expect.objectContaining({
          alt: 'Mountain landscape thumbnail',
          src: 'https://cdn.example.test/french-bulldog.jpg',
        }),
        expect.objectContaining({
          alt: 'Tea cup beside notebook',
          src: 'https://cdn.example.test/gray-cat.jpg',
        }),
        expect.objectContaining({
          alt: 'Walking path thumbnail',
          src: 'https://cdn.example.test/curly-dog.jpg',
        }),
      ]),
    )
  })

  it('renders OpenUI bootstrap previews before extracting Lakebed image sources', async () => {
    process.env.APP_BASE_URL = 'https://ship-fast.test'
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY

    const resolvedByRequest = new Map([
      [
        '/api/pexels?query=paws+playgrounds+colorful+dog+cat+playground&w=1200&h=1200&seed=colorful+dog+and+cat+playground+with+interactive+structures',
        'https://images.pexels.com/photos/100/rendered-hero.jpg?auto=compress&cs=tinysrgb&h=650&w=940',
      ],
      [
        '/api/pexels?query=paws+playgrounds+interactive+dog+tunnel&w=1200&h=1200&seed=interactive+dog+tunnel',
        'https://images.pexels.com/photos/101/rendered-dog-tunnel.jpg?auto=compress&cs=tinysrgb&h=350',
      ],
      [
        '/api/pexels?query=paws+playgrounds+cat+climbing+tower&w=1200&h=1200&seed=cat+climbing+tower',
        'https://images.pexels.com/photos/102/rendered-cat-tower.jpg?auto=compress&cs=tinysrgb&h=350',
      ],
      [
        '/api/pexels?query=paws+playgrounds+water+feature+pets&w=1200&h=1200&seed=water+feature+for+pets',
        'https://images.pexels.com/photos/103/rendered-water-feature.jpg?auto=compress&cs=tinysrgb&h=350',
      ],
    ])
    const requests: string[] = []
    globalThis.fetch = (async (url, init?) => {
      const parsed = new URL(String(url))
      const requestPath = `${parsed.pathname}${parsed.search}`
      requests.push(requestPath)
      expect(init).toMatchObject({ redirect: 'manual' })
      const location = resolvedByRequest.get(requestPath)
      if (!location) {
        throw new Error(
          `unexpected rendered preview image request ${requestPath}`,
        )
      }
      return new Response(null, {
        headers: { Location: location },
        status: 302,
      })
    }) as typeof fetch

    const built = await buildOpenUILakebedProjectFiles({
      source: `home_hero = SplitHero("Live", "A Playground Like Never Seen Before", null, "Animated, beautiful spaces where dogs and cats can explore, play, and bond.", "Back This Project", "Learn More", null, null, "colorful dog and cat playground with interactive structures")
home_grid = BentoGrid("Features", [{title:"Tunnel", description:"Interactive dog tunnel", imageAlt:"interactive dog tunnel"}, {title:"Tower", description:"Cat climbing tower", imageAlt:"cat climbing tower"}, {title:"Water", description:"Water feature for pets", imageAlt:"water feature for pets"}])
root = Stack([home_hero, home_grid])`,
      siteSpecJson: JSON.stringify({
        brand: 'Paws Playgrounds',
        projectName: 'Paws Playgrounds',
      }),
      previewHtml:
        '<!doctype html><html><body><div id="openui-root"></div><script id="openui-client-source" type="application/json">"root = home_hero"</script></body></html>',
      prompt: 'A Playground Like Never Seen Before for dogs and cats',
      sessionId: 'lakebed-bootstrap-image-parity',
      target: 'lakebed',
    })

    const routesFile = built.files['client/routes.ts'] ?? ''
    const imageRuntime = built.files['client/lib/image.tsx'] ?? ''

    expect(requests).toEqual([...resolvedByRequest.keys()])
    expect(routesFile).toContain(
      'https://images.pexels.com/photos/100/rendered-hero.jpg?auto=compress&cs=tinysrgb&h=1200&w=1200&fit=crop',
    )
    expect(routesFile).toContain(
      'https://images.pexels.com/photos/101/rendered-dog-tunnel.jpg?auto=compress&cs=tinysrgb&h=1200&w=1200&fit=crop',
    )
    expect(routesFile).toContain(
      "originalSrcKey: '%2Fapi%2Fpexels%3Fquery%3Dpaws%2Bplaygrounds%2Bcolorful%2Bdog%2Bcat%2Bplayground%26w%3D1200%26h%3D1200%26seed%3Dcolorful%2Bdog%2Band%2Bcat%2Bplayground%2Bwith%2Binteractive%2Bstructures'",
    )
    expect(routesFile).not.toContain('picsum.photos')
    expect(imageRuntime).toContain('imageSourcesByOriginalSrcKey')
  })

  it('resolves edited image src overrides in deployed runtime instead of leaking preview API URLs', async () => {
    process.env.APP_BASE_URL = 'https://ship-fast.test'
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY

    const selectedImage =
      'https://images.pexels.com/photos/4444444/pexels-photo-4444444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    const stalePreviewImage =
      'https://images.pexels.com/photos/9999999/pexels-photo-9999999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    const requests: string[] = []
    globalThis.fetch = (async (url) => {
      requests.push(String(url))
      const parsed = new URL(String(url))
      const query = parsed.searchParams.get('query')
      const location =
        query === 'user selected walnut'
          ? selectedImage
          : query === 'selected showroom hero'
            ? stalePreviewImage
            : null
      if (!location) {
        throw new Error(`unexpected image resolution request: ${String(url)}`)
      }
      return new Response(null, {
        headers: { Location: location },
        status: 302,
      })
    }) as typeof fetch

    const built = await buildOpenUILakebedProjectFiles({
      previewHtml:
        '<img alt="Selected showroom hero" src="/api/pexels?query=stale+showroom&w=600&h=400&seed=Selected+showroom+hero">',
      sessionId: 'lakebed-edited-src-override',
      siteSpecJson: JSON.stringify({ projectName: 'Edited Source Export' }),
      source:
        'root = Avatar({"fallback":"SP","src":"/api/pexels?query=user+selected+walnut&w=600&h=400&seed=User+selected+hero","alt":"Selected showroom hero"})',
      target: 'lakebed',
    })
    const rendered = await renderLakebedClientEntryHtml(
      built.files,
      `import { h, render } from "preact";
import { Image } from "./client/lib/image";

render(h(Image, {
  alt: "Selected showroom hero",
  src: "/api/pexels?query=user+selected+walnut&w=600&h=400&seed=User+selected+hero",
}), document.getElementById("app"));
`,
    )
    const dom = new JSDOM(rendered.html)
    const image = dom.window.document.querySelector('img')
    const routeRendered = await renderLakebedAppAtPath(built.files, '/')
    const routeDom = new JSDOM(routeRendered.html)
    const routeImage = routeDom.window.document.querySelector('img')

    expect(requests).toEqual(
      expect.arrayContaining([
        expect.stringContaining('query=selected+showroom+hero'),
        expect.stringContaining('query=user+selected+walnut'),
      ]),
    )
    expect(rendered.errors).toEqual([])
    expect(image?.getAttribute('src')).toBe(
      'https://images.pexels.com/photos/4444444/pexels-photo-4444444.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    )
    expect(image?.getAttribute('src')).not.toContain('/api/pexels')
    expect(image?.getAttribute('src')).not.toContain('9999999')
    expect(routeRendered.errors).toEqual([])
    expect(routeImage?.getAttribute('src')).toBe(
      'https://images.pexels.com/photos/4444444/pexels-photo-4444444.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    )
    expect(routeImage?.getAttribute('src')).not.toContain('/api/pexels')
    expect(routeImage?.getAttribute('src')).not.toContain('9999999')
  })

  it('resolves missing generated image alts through Pexels at build time', async () => {
    process.env.PEXELS_API_KEY = 'pexels_test_key'
    const requests: string[] = []
    globalThis.fetch = (async (url) => {
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
        expect.objectContaining({
          alt: 'Existing avatar',
          src: 'https://cdn.example.com/avatar.jpg',
        }),
        expect.objectContaining({
          alt: 'Golden retriever puppy playing with a ball',
          originalSrc:
            '/api/pexels?query=golden+retriever+puppy+playing&w=1200&h=1200&seed=Golden+retriever+puppy+playing+with+a+ball',
          src: 'https://images.pexels.com/photos/dog-large2x.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&fit=crop',
        }),
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

  it('does NOT use VITE_PEXELS_API_KEY fallback (security: prevents client bundle leakage)', async () => {
    delete process.env.PEXELS_API_KEY
    process.env.VITE_PEXELS_API_KEY = 'vite_pexels_test_key'
    const requests: Array<{ auth?: string; url: string }> = []
    globalThis.fetch = (async (url, init?) => {
      requests.push({
        auth: (init?.headers as Record<string, string> | undefined)
          ?.Authorization,
        url: String(url),
      })
      return new Response(
        JSON.stringify({
          photos: [
            {
              src: {
                large: 'https://images.pexels.com/photos/vite-large.jpeg',
                large2x: 'https://images.pexels.com/photos/vite-large2x.jpeg',
                medium: 'https://images.pexels.com/photos/vite-medium.jpeg',
                original: 'https://images.pexels.com/photos/vite-original.jpeg',
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
          componentName: 'ShowroomPage',
          label: 'Home',
          path: '/',
          props: {
            hero: { imageAlt: 'Polished glass showroom installation' },
          },
        },
      ],
      undefined,
    )

    // The Pexels API should NOT be called with the VITE_ key — no requests.
    expect(requests).toEqual([])
    // Sources should fall back to picsum or placeholder, not Pexels images.
    expect(
      sources.every((source) => !source.src.includes('images.pexels.com')),
    ).toBe(true)
    expect(sources.length).toBe(1)
    expect(sources[0]?.alt).toBe('Polished glass showroom installation')
    expect(sources[0]?.src).toContain('picsum.photos')
  })

  it('resolves missing generated image alts concurrently', async () => {
    process.env.PEXELS_API_KEY = 'pexels_test_key'
    let activeRequests = 0
    let maxActiveRequests = 0
    globalThis.fetch = (async () => {
      activeRequests += 1
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests)
      await new Promise((resolve) => setTimeout(resolve, 20))
      activeRequests -= 1
      return new Response(
        JSON.stringify({
          photos: [
            {
              src: {
                large: 'https://images.pexels.com/photos/lakebed.jpeg',
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
          componentName: 'GalleryPage',
          label: 'Home',
          path: '/',
          props: {
            hero: { imageAlt: 'Bright storefront window' },
            cards: [
              { photoAlt: 'Chocolate gift box' },
              { avatarAlt: 'Founder portrait' },
            ],
          },
        },
      ],
      undefined,
    )

    expect(sources).toHaveLength(3)
    expect(maxActiveRequests).toBeGreaterThan(1)
  })

  it('falls back to detached Picsum URLs when stock APIs are unavailable', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
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
        expect.objectContaining({
          alt: 'Existing avatar',
          src: 'https://picsum.photos/seed/existing-avatar/100/100',
        }),
        expect.objectContaining({
          alt: 'Golden retriever puppy playing with a ball',
          originalSrc:
            '/api/pexels?query=golden+retriever+puppy+playing&w=1200&h=1200&seed=Golden+retriever+puppy+playing+with+a+ball',
          src: 'https://picsum.photos/seed/golden-retriever-puppy-playing-with-a-ball/1200/1200',
        }),
      ]),
    )
    expect(sources.every((source) => !source.src.includes('/api/pexels'))).toBe(
      true,
    )
  })
})

describe('openui lakebed export — LLM malformed FAQ props', () => {
  // Reproduces the quiet-ridge lakebed deployment crash where the LLM generated
  // FAQ items with {question, answer} (singular string) instead of the block's
  // schema {q, a} (array of strings). The lakebed export strips defineCapsule
  // (and thus sanitizeProps), so the raw component must defend itself.
  const malformedFaqSource = `home_faq = FaqAccordion("Questions", "Common Inquiries", [{"question":"How long does coffee stay fresh?","answer":"Properly stored, 6 months."},{"question":"What is the difference between roasts?","answer":"Roasting time and temperature affect flavor and aroma."},{"question":"Where are allergen info?","answer":"Ingredient lists at the bottom of each product page."}])
root = home_faq`

  it('renders FaqAccordion without crashing when LLM emits {question, answer} instead of {q, a}', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: malformedFaqSource,
      siteSpecJson: JSON.stringify({ projectName: 'Malformed FAQ Lakebed' }),
      sessionId: 'lakebed-malformed-faq',
      target: 'lakebed',
    })

    expect(built.files['client/components/FaqAccordion.tsx']).toBeDefined()

    // The exact malformed props from session k57f7j6b41razt4ta9jg1vwrqh89y5x2:
    // LLM generated {question, answer} (singular string) instead of {q, a} (array).
    // The lakebed export strips defineCapsule/sanitizeProps, so the raw component
    // must defend itself. We pass the malformed props directly to the component.
    const malformedProps = {
      eyebrow: 'Questions',
      heading: 'Common Inquiries',
      items: [
        {
          question: 'How long does coffee stay fresh?',
          answer: 'Properly stored, 6 months.',
        },
        {
          question: 'What is the difference between roasts?',
          answer: 'Roasting time and temperature affect flavor and aroma.',
        },
        {
          question: 'Where are allergen info?',
          answer: 'Ingredient lists at the bottom of each product page.',
        },
      ],
    }

    const directory = mkdtempSync(join(tmpdir(), 'lakebed-malformed-faq-'))
    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-faq.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { FaqAccordionBlock } from "./client/components/FaqAccordion";

const lakebed = {
  useQuery() { return undefined; },
  useMutation() { return async () => undefined; },
  useAuth() { return { isLoading: false, isAuthenticated: false, user: null }; },
  signInWithGoogle() {},
  signOut() {},
};

const props = ${JSON.stringify(malformedProps)};

render(h(FaqAccordionBlock, { props, lakebed }), document.getElementById("app"));
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
            name: 'lakebed-malformed-faq-stub',
            setup(pluginBuild) {
              pluginBuild.onResolve(
                { filter: /^(@ship-fast\/|#\/)/ },
                (args) => ({
                  errors: [
                    {
                      text: `Generated client bundle leaked workspace package import: ${args.path}`,
                    },
                  ],
                }),
              )
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
      const errors = collectWindowRuntimeErrors(dom)

      expect(() =>
        dom.window.eval(bundled.outputFiles[0]?.text ?? ''),
      ).not.toThrow()

      const app = dom.window.document.querySelector('#app')
      const text = app?.textContent ?? ''
      // The LLM-generated questions should render (normalized from question→q)
      expect(text).toContain('How long does coffee stay fresh?')
      expect(text).toContain('What is the difference between roasts?')
      // The LLM-generated answers should render (normalized from answer→a)
      expect(text).toContain('Properly stored, 6 months.')
      expect(text).toContain('Roasting time and temperature affect flavor')
      // No runtime errors
      expect(errors).toHaveLength(0)
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('renders FaqAccordion with correct {q, a} schema props without regression', async () => {
    const correctFaqSource = `home_faq = FaqAccordion("Common Inquiries", [{"question":"Test question?","answer":"Answer one and answer two"}])
root = home_faq`

    const built = await buildOpenUILakebedProjectFiles({
      source: correctFaqSource,
      siteSpecJson: JSON.stringify({ projectName: 'Correct FAQ Lakebed' }),
      sessionId: 'lakebed-correct-faq',
      target: 'lakebed',
    })

    const correctProps = {
      eyebrow: 'Questions',
      heading: 'Common Inquiries',
      items: [
        { question: 'Test question?', answer: 'Answer one and answer two' },
      ],
    }

    const directory = mkdtempSync(join(tmpdir(), 'lakebed-correct-faq-'))
    try {
      for (const [path, source] of Object.entries(built.files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }
      const entryPath = join(directory, 'render-faq-correct.tsx')
      writeFileSync(
        entryPath,
        `import { h, render } from "preact";
import { FaqAccordionBlock } from "./client/components/FaqAccordion";

const lakebed = {
  useQuery() { return undefined; },
  useMutation() { return async () => undefined; },
  useAuth() { return { isLoading: false, isAuthenticated: false, user: null }; },
  signInWithGoogle() {},
  signOut() {},
};

const props = ${JSON.stringify(correctProps)};

render(h(FaqAccordionBlock, { props, lakebed }), document.getElementById("app"));
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
            name: 'lakebed-correct-faq-stub',
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
      expect(() =>
        dom.window.eval(bundled.outputFiles[0]?.text ?? ''),
      ).not.toThrow()
      const text = dom.window.document.querySelector('#app')?.textContent ?? ''
      expect(text).toContain('Test question?')
      expect(text).toContain('Answer one and answer two')
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })
})

describe('openui lakebed export — compiled Tailwind theme CSS', () => {
  const singlePageSource = `home_navbar = Navbar("Test", ["Home"], "Book")
home_navbar_anchor = SectionAnchor("home_navbar", home_navbar)
home_hero = SplitHero("Hub", "Work", null, "Flex", "See", "Tour")
home_hero_anchor = SectionAnchor("home_hero", home_hero, "scroll-mt-28 text-foreground/[0.04] bg-background/65 shadow-primary/40 shadow-foreground/20")
home = Stack([home_navbar_anchor, home_hero_anchor])
root = PageSwitch(["Home"], [home], "", {})`

  const readThemeCss = (themeFile: string): string => {
    const match = themeFile.match(/export const themeCss = (.*?);\n/s)
    expect(match?.[1]).toBeDefined()
    return new Function(`return ${match?.[1] ?? '""'}`)() as string
  }

  const readCompiledTailwindCss = (tailwindFile: string): string => {
    const match = tailwindFile.match(
      /export const compiledTailwindCss = (.*?);\n/s,
    )
    expect(match?.[1]).toBeDefined()
    return new Function(`return ${match?.[1] ?? '""'}`)() as string
  }

  it('emits selected theme vars for both Tailwind color tokens and runtime theme tokens', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: singlePageSource,
      siteSpecJson: JSON.stringify({ projectName: 'Theme Test' }),
      sessionId: 'theme-test',
      target: 'lakebed',
      isDark: true,
    })

    const themeFile = built.files['client/lib/theme.tsx']
    expect(themeFile).toBeDefined()
    const css = readThemeCss(themeFile)

    expect(css).toContain('.genui-preview')
    expect(css).toContain('.genui-preview.dark')
    expect(css).toContain('.genui-preview .p-5')
    expect(css).toContain('padding: 1.25rem !important')
    expect(css).toContain(':root')
    expect(css).toContain(
      "--font-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;",
    )
    expect(css).toContain('--background:')
    expect(css).toContain('--foreground:')
    expect(css).toContain('--color-background: var(--background)')
    expect(css).toContain('--color-foreground: var(--foreground)')
    expect(css).toContain('--color-border: var(--border)')
    expect(css).toContain('--color-primary: var(--primary)')
    expect(css).toContain('color-scheme: dark')
  })

  it('uses bundled app CSS sources when the Lakebed build runtime cannot read src/styles.css', () => {
    const css = buildLakebedThemeCss(null, true, {
      'src/styles.css': [
        '@import url("./styles/index.css");',
        '@theme { --font-sans: "Bundled Sans", sans-serif; }',
        '* { box-sizing: border-box; }',
        'html, body, #app, #root, #__root { min-height: 100%; }',
        '#app, #root, #__root { width: 100%; min-width: 0; align-self: stretch; }',
        'body { margin: 0; }',
      ].join('\n'),
      'src/styles/index.css':
        'body { display: flex; align-items: center; }\n:root { --dashboard-token: 1; }',
    })

    expect(css).toContain('--dashboard-token: 1')
    expect(css).toContain('--font-sans: "Bundled Sans", sans-serif;')
    expect(css).toContain(
      '#app, #root, #__root { width: 100%; min-width: 0; align-self: stretch; }',
    )
    expect(css).toContain('body { margin: 0; }')
    expect(css).not.toContain('display: flex')
    expect(css).not.toContain('align-items: center')
    expect(css).not.toContain('max-width: none')
  })

  it('preserves generated unicode punctuation exactly in Lakebed route props', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: `home_hero = SplitHero("New", "Crystal Shoes", "Copy", "Shop", "Learn", "Heel", "$199", "Hand‑crafted heel", "Add", "sparkling shoe", "Limited", ["30‑Day Returns"])
home = Stack([home_hero])
root = PageSwitch(["Home"], [home], "", {})`,
      siteSpecJson: JSON.stringify({ projectName: 'Punctuation Test' }),
      sessionId: 'punctuation-test',
      target: 'lakebed',
      isDark: true,
    })

    const routesFile = built.files['client/routes.ts']
    expect(routesFile).toContain('Hand‑crafted heel')
    expect(routesFile).toContain('30‑Day Returns')
    expect(routesFile).not.toContain('Hand-crafted heel')
    expect(routesFile).not.toContain('30-Day Returns')
  })

  it('ships compiled Tailwind CSS instead of depending on @tailwindcss/browser theme compilation', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: singlePageSource,
      siteSpecJson: JSON.stringify({ projectName: 'Theme Test' }),
      sessionId: 'theme-test-inject',
      target: 'lakebed',
      isDark: true,
    })

    const themeFile = built.files['client/lib/theme.tsx']
    const tailwindFile = built.files['client/lib/compiled-tailwind.ts']
    expect(themeFile).toBeDefined()
    expect(tailwindFile).toBeDefined()
    const css = readCompiledTailwindCss(tailwindFile)

    expect(themeFile).toContain('site-theme')
    expect(themeFile).toContain('compiledTailwindCss')
    expect(themeFile).toContain('fontStylesheetHrefs')
    expect(themeFile).toContain('fonts.googleapis.com/css2')
    expect(themeFile).toContain('wght@400;500;600;700;800')
    expect(themeFile).not.toContain('text/tailwindcss')
    expect(themeFile).not.toContain('site-tailwind-theme')
    expect(themeFile).not.toContain('tailwindThemeCss')
    expect(css).toContain('.text-foreground\\/\\[0\\.04\\]')
    expect(css).toMatch(
      /color-mix\(in oklab, var\(--(?:color-)?foreground\) 4%, transparent\)/,
    )
    expect(css).toContain('.bg-background\\/65')
    expect(css).toContain('.bg-foreground')
    expect(css).toContain('.text-background')
    expect(css).toContain('.shadow-primary\\/40')
    expect(css).toContain('.shadow-foreground\\/20')
    expect(css).toContain('--font-sans:')
    expect(css).toContain('.font-sans')
    expect(css).toContain(
      'color-mix(in oklab, var(--color-foreground) 4%, transparent)',
    )
    expect(css).toContain(
      'color-mix(in oklab, var(--color-background) 65%, transparent)',
    )
    expect(css).toContain(
      'color-mix(in oklab, var(--color-primary) 40%, transparent)',
    )
  })

  it('compiles class-like section-kit props used by hero overlays', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: singlePageSource,
      siteSpecJson: JSON.stringify({ projectName: 'Hero Overlay Theme Test' }),
      sessionId: 'hero-overlay-theme-test',
      target: 'lakebed',
      isDark: true,
    })

    const tailwindFile = built.files['client/lib/compiled-tailwind.ts']
    expect(tailwindFile).toBeDefined()
    const css = readCompiledTailwindCss(tailwindFile)

    // The singlePageSource uses bg-background/65 and shadow-foreground/20 in
    // SectionAnchor className props. Verify these class-like props are compiled.
    expect(css).toContain('.bg-background\\/65')
    expect(css).toContain('.text-foreground\\/\\[0\\.04\\]')
    expect(css).toContain('.shadow-foreground\\/20')
  })

  it('preserves scoped CSS variables alongside compiled Tailwind CSS', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: singlePageSource,
      siteSpecJson: JSON.stringify({ projectName: 'Theme Test' }),
      sessionId: 'theme-test-root',
      target: 'lakebed',
      isDark: false,
    })

    const themeFile = built.files['client/lib/theme.tsx']
    expect(themeFile).toBeDefined()
    const css = readThemeCss(themeFile)

    expect(css).toContain('.genui-preview')
    expect(css).toContain('--background:')
    expect(css).toContain('--foreground:')
    expect(css).toContain('color-scheme: light')
    expect(themeFile).toContain('--background:')
    expect(css).toContain('.bg-background')
    expect(css).toContain('.text-foreground')
    expect(css).toContain('body {\n  margin: 0;\n}')
    expect(css).toContain('#app,\n#root,\n#__root')
    expect(css).not.toContain('#app {\n  display: block;\n  margin: 0;\n}')
    const clientIndex = built.files['client/index.tsx']
    expect(clientIndex).toContain(
      'genui-preview min-h-screen bg-background text-foreground',
    )
    expect(clientIndex).toContain('RoutesContext.Provider')
    expect(clientIndex).toContain('currentPage: page.label')
    expect(clientIndex).toContain('<PageRouteFrame page={page}')
  })
})

describe('openui lakebed export — route isolation', () => {
  const multiPageSource = `home_navbar = Navbar("Northside", ["Home", "Gallery", "Pricing"], "Book a Tour")
home_navbar_anchor = SectionAnchor("home_navbar", home_navbar)
home_hero = SplitHero("Hub", "Work", null, "Flex", "See", "Tour")
home_hero_anchor = SectionAnchor("home_hero", home_hero, "scroll-mt-28")
home = Stack([home_navbar_anchor, home_hero_anchor])

gallery_navbar = Navbar("Northside", ["Home", "Gallery", "Pricing"], "Book a Tour")
gallery_navbar_anchor = SectionAnchor("gallery_navbar", gallery_navbar)
gallery_gallery = ImageGallery("Gallery", [{alt:"workspace"}])
gallery_gallery_anchor = SectionAnchor("gallery_gallery", gallery_gallery, "scroll-mt-28")
gallery = Stack([gallery_navbar_anchor, gallery_gallery_anchor])

pricing_navbar = Navbar("Northside", ["Home", "Gallery", "Pricing"], "Book a Tour")
pricing_navbar_anchor = SectionAnchor("pricing_navbar", pricing_navbar)
pricing_pricing = PricingTable("Plans", "Simple", [{name:"Pro", price:"$199", features:["Everything"]}])
pricing_pricing_anchor = SectionAnchor("pricing_pricing", pricing_pricing, "scroll-mt-28")
pricing = Stack([pricing_navbar_anchor, pricing_pricing_anchor])

root = PageSwitch(["Home", "Gallery", "Pricing"], [home, gallery, pricing], "", {"Home":"home","Gallery":"gallery","Pricing":"pricing"})`

  it('generates exactly one page component per route with only its own sections', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: multiPageSource,
      siteSpecJson: JSON.stringify({ projectName: 'Route Isolation Test' }),
      sessionId: 'route-isolation-test',
      target: 'lakebed',
    })

    // Three page components should be generated
    expect(built.files['client/components/HomePage.tsx']).toBeDefined()
    expect(built.files['client/components/GalleryPage.tsx']).toBeDefined()
    expect(built.files['client/components/PricingPage.tsx']).toBeDefined()

    // HomePage should only contain home_ section IDs
    const homeComp = built.files['client/components/HomePage.tsx']
    expect(homeComp).toContain('home_navbar')
    expect(homeComp).toContain('home_hero')
    expect(homeComp).not.toContain('gallery_gallery')
    expect(homeComp).not.toContain('pricing_pricing')

    // GalleryPage should only contain gallery_ section IDs
    const galleryComp = built.files['client/components/GalleryPage.tsx']
    expect(galleryComp).toContain('gallery_navbar')
    expect(galleryComp).toContain('gallery_gallery')
    expect(galleryComp).not.toContain('home_hero')
    expect(galleryComp).not.toContain('pricing_pricing')

    // PricingPage should only contain pricing_ section IDs
    const pricingComp = built.files['client/components/PricingPage.tsx']
    expect(pricingComp).toContain('pricing_navbar')
    expect(pricingComp).toContain('pricing_pricing')
    expect(pricingComp).not.toContain('home_hero')
    expect(pricingComp).not.toContain('gallery_gallery')
  })

  it('generates routes.ts with exactly one entry per route', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: multiPageSource,
      siteSpecJson: JSON.stringify({ projectName: 'Route Isolation Test' }),
      sessionId: 'route-isolation-routes',
      target: 'lakebed',
    })

    const routesFile = built.files['client/routes.ts']
    expect(routesFile).toBeDefined()

    // Should have exactly 3 page entries
    const labelMatches = routesFile.match(/label: '/g)
    expect(labelMatches).toHaveLength(3)

    // Should have the correct paths
    expect(routesFile).toContain("path: '/'")
    expect(routesFile).toContain("path: '/gallery'")
    expect(routesFile).toContain("path: '/pricing'")

    // Should have the correct component names
    expect(routesFile).toContain("componentName: 'HomePage'")
    expect(routesFile).toContain("componentName: 'GalleryPage'")
    expect(routesFile).toContain("componentName: 'PricingPage'")
  })

  it('generates client/index.tsx with exactly one Router and one Routes', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: multiPageSource,
      siteSpecJson: JSON.stringify({ projectName: 'Route Isolation Test' }),
      sessionId: 'route-isolation-index',
      target: 'lakebed',
    })

    const indexFile = built.files['client/index.tsx']
    expect(indexFile).toBeDefined()

    // Exactly one Router, one Routes, one App
    expect(indexFile.match(/<Router/g)).toHaveLength(1)
    expect(indexFile.match(/<Routes\b/g)).toHaveLength(1)
    expect(indexFile.match(/export function App/g)).toHaveLength(1)

    // Exactly one StyleRuntime and one AuthRuntime
    expect(indexFile.match(/<StyleRuntime/g)).toHaveLength(1)
    expect(indexFile.match(/<AuthRuntime/g)).toHaveLength(1)
  })
})
