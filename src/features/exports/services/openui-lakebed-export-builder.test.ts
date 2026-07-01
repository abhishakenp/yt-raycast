import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { build } from 'esbuild'
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

const writeProjectFiles = (
  directory: string,
  files: Record<string, string>,
) => {
  for (const [path, source] of Object.entries(files)) {
    const absolutePath = join(directory, path)
    mkdirSync(join(absolutePath, '..'), { recursive: true })
    writeFileSync(absolutePath, source)
  }
}

const renderLakebedClientEntryText = async (
  files: Record<string, string>,
  entrySource: string,
): Promise<string> => {
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

    expect(() =>
      dom.window.eval(bundled.outputFiles[0]?.text ?? ''),
    ).not.toThrow()
    return dom.window.document.querySelector('#app')?.textContent ?? ''
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

const evaluateLakebedServerCapsule = async (files: Record<string, string>) => {
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

const v2ComposedLakebedSource = `root = PageSwitch(["Home"], [home])
homeHero = EcommerceHero()
homeHeroAnchor = SectionAnchor("home_hero", homeHero, "scroll-mt-28")
homeDetail = ProductDetailHero({"title":"Aurora Pro"})
home = Stack([homeHeroAnchor, homeDetail])`

describe('openui lakebed image source generation', () => {
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
import { RoutePage1HomeBlock } from "./client/components/RoutePage1Home";

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

render(h(RoutePage1HomeBlock, { props: {}, lakebed }), document.getElementById("app"));
`,
    )
    const serverCapsule = await evaluateLakebedServerCapsule(built.files)

    expect(built.files['client/components/RoutePage1Home.tsx']).toBeDefined()
    expect(built.files['client/components/EcommerceHero.tsx']).toBeDefined()
    expect(built.files['client/components/ProductDetailHero.tsx']).toBeDefined()
    expect(built.files['client/components/Stack.tsx']).toBeUndefined()
    expect(renderedText).toContain('Shop now')
    expect(renderedText).toContain('Buy Now')
    expect(Object.keys(serverCapsule?.schema ?? {})).toEqual(
      expect.arrayContaining(['items', 'products']),
    )
    expect(Object.keys(serverCapsule?.queries ?? {})).toContain('cartSummary')
    expect(Object.keys(serverCapsule?.mutations ?? {})).toContain('addItem')
  })

  it('normalizes numeric schema defaults to string defaults in Lakebed exports', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: 'root = EcommerceHero()',
      siteSpecJson: JSON.stringify({ projectName: 'Schema Default Export' }),
      sessionId: 'lakebed-schema-defaults',
      target: 'lakebed',
    })
    const serverCapsule = await evaluateLakebedServerCapsule(built.files)

    expect(serverCapsule?.schema?.items?.shape?.quantity?.defaultValue).toBe(
      '1',
    )
  })

  it('renders generated commerce components with same-file helpers and undefined query results', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = EcommerceHero("Duck Commerce", ["Home"], {"brand":"Duck Commerce"})',
      siteSpecJson: JSON.stringify({ projectName: 'Duck Commerce' }),
      sessionId: 'demo',
      target: 'lakebed',
    })
    const serverSource = built.files['server/index.ts'] ?? ''

    expect(serverSource).toContain('items: table({')
    expect(serverSource).toContain('products: table({')
    expect(serverSource).toContain('cartSummary: query')
    expect(serverSource).toContain('productCatalog: query')
    expect(serverSource).toContain('addItem: mutation')
    expect(serverSource).toContain('syncCatalog: mutation')
    expect(serverSource).not.toContain('articles: table')
    expect(serverSource).not.toContain('addToReadingList')
    expect(serverSource).not.toContain('CommerceCartItemInput')
    expect(serverSource).not.toContain('CommerceCatalogProductInput')

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
import { EcommerceHeroBlock } from "./client/components/EcommerceHero";

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

render(h(EcommerceHeroBlock, { props: {}, lakebed }), document.getElementById("app"));
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
        'Shop now',
      )
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('exposes pending state from generated Lakebed mutation adapters', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = EcommerceHero("Lakebed Commerce", ["Home"], {"brand":"Lakebed Commerce"})',
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
export function useNavigate() { return () => {}; }
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
        'root = EcommerceHero("CocoaCraft", ["Home"], {"brand":"CocoaCraft"})',
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
export function useNavigate() { return () => {}; }
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
      source:
        'root = EcommerceNavbar({"brand":"CocoaCraft","nav":["Shop","Deals"],"cartCount":"0"})',
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
export function useNavigate() { return () => {}; }
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
      source:
        'root = EcommerceNavbar({"brand":"CocoaCraft","nav":["Shop","Deals"],"cartCount":"0"})',
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
export function useNavigate() { return () => {}; }
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
        const cartButton = dom.window.document.querySelector(
          'button[aria-label="Cart"]',
        )
        expect(cartButton).toBeTruthy()
        cartButton?.dispatchEvent(
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
      expect(dom.window.document.body.textContent).toContain('Your cart')
      expect(dom.window.document.body.textContent).toContain('Truffle Box')
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('renders generated commerce cart drawers when Lakebed cart summaries omit items', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = EcommerceNavbar({"brand":"CocoaCraft","nav":["Shop","Deals"],"cartCount":"0"})',
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
export function useNavigate() { return () => {}; }
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
      expect(dom.window.document.body.textContent).toContain('Your cart')
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('renders generated food-delivery navigation when Lakebed restaurant catalogs are DB-shaped records', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = FoodDeliveryNavbar({"brand":"Nosh","nav":["Restaurants","Deals"]})',
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
export function useNavigate() { return () => {}; }
export function useAuth() { return { displayName: "Guest", isAuthenticated: false, isGuest: true, isLoading: false, user: null }; }
export function useMutation() { return async () => undefined; }
export function useQuery(name) {
  if (name === "restaurantCatalog") {
    return {
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
        'root = RestaurantMenu("Taproom Menu", "Seasonal plates for brewery guests")',
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
export function useNavigate() { return () => {}; }
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

  it('exports Lakebed auth adapter helpers required by section-kit sign-in controls', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = EcommerceHero("Gov Site In Hindi", ["Home"], {"brand":"Gov Site In Hindi"})',
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
export function useNavigate() { return () => {}; }
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
      'Generated with [ShipFast](https://ship-fast.io) 🚀.',
    )
    expect(built.files['client/index.tsx']).toContain('PurrSpecs')
    expect(Object.values(built.files).join('\n')).not.toContain('root =')
    expect(Object.values(built.files).join('\n')).not.toContain('@openuidev')
  })

  it('builds Lakebed projects when a generated object argument is closed with a parenthesis before the next argument', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = EcommerceHero("ShopifyLite", ["Home"], {chip:"New Arrival", heading:"Launch Your Online Store", imageAlt:"Boutique storefront"), "Trusted by Leading Brands", {heading:"Shop by Category"})',
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
    expect(built.files['client/components/EcommerceHero.tsx']).toContain(
      'EcommerceHeroBlock',
    )
  })

  it('does not embed stale OpenUI SSR error HTML when deploying OpenUI source', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = CloudInfraHero("Lakebed Repro", ["Home"], {"brand":"Nebula Cloud"})',
      previewHtml:
        '<div class="openui-error">Failed to render: te is not a function</div>',
      sessionId: 'demo',
      target: 'lakebed',
    })

    const output = Object.values(built.files).join('\n')

    expect(built.files['client/index.tsx']).toContain('PageView')
    expect(output).toContain('CloudInfraHero')
    expect(output).not.toContain('openui-error')
    expect(output).not.toContain('te is not a function')
  })

  it('packages shared section-kit dependencies for Lakebed exports', async () => {
    const cases = [
      {
        componentName: 'LinkInBioNavbar',
        exportSource: 'root = LinkInBioNavbar()',
        sectionKitFiles: ['SiteNav', 'MobileNavDrawer'],
      },
      {
        componentName: 'ChurchNavbar',
        exportSource: 'root = ChurchNavbar()',
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

  it('exports a native Lakebed app without generated block registry traces', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        'root = PageSwitch(["Home","Shop","About","Contact"], [EcommerceHero("Lakebed Store", ["Home","Shop","About","Contact"], {"brand":"Lakebed Store"}), ShopOverview("Lakebed Store", ["Home","Shop","About","Contact"]), AboutHero("Lakebed Store", ["Home","Shop","About","Contact"]), ContactHero("Lakebed Store", ["Home","Shop","About","Contact"])])',
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
    expect(built.files['client/index.tsx']).toContain('pages.map((page) =>')
    expect(built.files['client/index.tsx']).not.toContain('FallbackPage')
    expect(built.files['client/index.tsx']).not.toContain(
      'function routeForPath',
    )
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
      'Number(item.quantity)',
    )
    expect(built.files['client/routes.ts']).toContain('export const pages')
    expect(built.files['client/routes.ts']).toContain(
      'export const routeByLabel',
    )
    expect(built.files['client/routes.ts']).toContain(
      'export const imageSources',
    )
    expect(built.files['client/lib/theme.tsx']).toContain('--background:')
    expect(built.files['client/lib/theme.tsx']).toContain('color-scheme: dark;')
    expect(built.files['client/lib/theme.tsx']).toContain('StyleRuntime')
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
