import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'esbuild'
import { describe, expect, it } from 'vitest'
import { parseHTML } from 'linkedom'

import type { SiteSpecProject } from '../spec/index.ts'
import {
  renderPreviewToWorkspace,
  renderProject,
  writeStreamingShellToWorkspace,
} from './index'
// @ts-ignore -- JS module without type declarations.
import { renderNextProject } from './nextjs/index'

const siteSpec: SiteSpecProject = {
  brand: 'Preview Brand',
  projectName: 'Preview Brand',
  tagline: 'Local Tailwind preview',
  userPrompt: 'A polished SaaS homepage',
  siteType: 'saas',
  seo: {
    siteName: 'Preview Brand',
    siteUrl: 'https://preview.example',
    description: 'Preview Brand helps teams launch polished SaaS homepages.',
  },
  pages: [
    {
      id: 'home',
      route: '/',
      title: 'Home',
      description: 'Preview Brand helps teams launch polished SaaS homepages.',
      seo: {
        title: 'Preview Brand | SaaS homepage',
        description:
          'Preview Brand helps teams launch polished SaaS homepages.',
        canonicalPath: '/',
      },
      sections: [
        {
          id: 'hero',
          type: 'hero',
          headline: 'Launch polished SaaS homepages',
          body: 'Preview Brand turns a short brief into a production-ready homepage.',
        },
        {
          id: 'faq',
          type: 'faq',
          headline: 'Frequently asked questions',
          items: [
            {
              title: 'What is Preview Brand?',
              body: 'Preview Brand generates SaaS homepages.',
            },
            {
              title: 'Who is it for?',
              body: 'Teams that need polished launch pages.',
            },
            {
              title: 'Why use it?',
              body: 'It creates a complete, structured preview quickly.',
            },
          ],
        },
      ],
    },
  ],
}

function getDocument(html: string) {
  return parseHTML(html).document
}

/** Assert no Tailwind CDN script is referenced and the local asset is. */
function expectNoTailwindCdn(document: Document) {
  const scripts = [...document.querySelectorAll('script[src]')]
  const srcs = scripts.map((s) => s.getAttribute('src') ?? '')
  expect(srcs.some((src) => /cdn\.tailwindcss\.com/i.test(src))).toBe(false)
  expect(srcs).toContain('/scripts/tailwind-browser.js')
}

/** Assert AEO metadata tags are present in the document head. */
function expectAeoMetadata(document: Document) {
  expect(document.querySelector('meta[name="description"]')).toBeTruthy()
  const robots = document.querySelector('meta[name="robots"]')
  expect(robots?.getAttribute('content')).toBe('index, follow')
  expect(
    document.querySelector('script[type="application/ld+json"]'),
  ).toBeTruthy()
  expect(document.querySelector('link[href="/llms.txt"]')).toBeTruthy()
}

/** Assert llms.txt starts with the brand heading. */
function expectLlmsTxtHasBrand(content: string) {
  expect(content.split('\n')[0]).toBe('# Preview Brand')
}

/** Assert robots.txt declares the sitemap URL. */
function expectRobotsHasSitemap(content: string) {
  expect(
    content
      .split('\n')
      .some((l) => l === 'Sitemap: https://preview.example/sitemap.xml'),
  ).toBe(true)
}

/** Assert sitemap.xml contains the home URL in a <loc> element. */
function expectSitemapHasHomeUrl(content: string) {
  const { document } = parseHTML(content)
  const locs = [...document.querySelectorAll('loc')].map((el) => el.textContent)
  expect(locs.some((loc) => loc === 'https://preview.example/')).toBe(true)
}

describe('renderer Tailwind preview CSS', () => {
  it('uses a local Tailwind CSS asset for static HTML exports', () => {
    const rendered = renderProject(siteSpec, 'html')
    expectNoTailwindCdn(getDocument(rendered.files['index.html']))
    expect(
      rendered.files['scripts/tailwind-browser.js']?.length,
    ).toBeGreaterThan(0)
  })

  it('advertises AEO metadata assets for static HTML session renders', () => {
    const rendered = renderProject(siteSpec, 'html')
    const document = getDocument(rendered.files['index.html'])

    expectAeoMetadata(document)
    expectLlmsTxtHasBrand(rendered.files['llms.txt'])
    expectRobotsHasSitemap(rendered.files['robots.txt'])
    expectSitemapHasHomeUrl(rendered.files['sitemap.xml'])
  })

  it('uses a local Tailwind CSS asset for OpenUI preview shells', async () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-renderer-'))
    try {
      writeFileSync(join(workspace, 'site-spec.json'), JSON.stringify(siteSpec))
      writeFileSync(
        join(workspace, 'home.openui'),
        'page Home { Text "Hello" }',
      )
      await renderPreviewToWorkspace(siteSpec, workspace)
      expectNoTailwindCdn(
        getDocument(readFileSync(join(workspace, 'index.html'), 'utf8')),
      )
      expect(
        readFileSync(join(workspace, 'scripts/tailwind-browser.js'), 'utf8')
          .length,
      ).toBeGreaterThan(0)
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('advertises AEO metadata assets for completed OpenUI preview sessions', async () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-renderer-aeo-'))
    try {
      writeFileSync(join(workspace, 'site-spec.json'), JSON.stringify(siteSpec))
      writeFileSync(
        join(workspace, 'home.openui'),
        'page Home { Text "Hello" }',
      )
      await renderPreviewToWorkspace(siteSpec, workspace)

      const document = getDocument(
        readFileSync(join(workspace, 'index.html'), 'utf8'),
      )
      expectAeoMetadata(document)
      expectLlmsTxtHasBrand(readFileSync(join(workspace, 'llms.txt'), 'utf8'))
      expectRobotsHasSitemap(
        readFileSync(join(workspace, 'robots.txt'), 'utf8'),
      )
      expectSitemapHasHomeUrl(
        readFileSync(join(workspace, 'sitemap.xml'), 'utf8'),
      )
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('uses a local Tailwind CSS asset for streaming shells', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-streaming-shell-'))
    try {
      writeStreamingShellToWorkspace(workspace, 'Streaming Brand', null)
      expectNoTailwindCdn(
        getDocument(readFileSync(join(workspace, 'index.html'), 'utf8')),
      )
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('advertises AEO metadata assets for streaming preview shells', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-streaming-aeo-'))
    try {
      writeFileSync(join(workspace, 'site-spec.json'), JSON.stringify(siteSpec))
      writeStreamingShellToWorkspace(workspace, 'Preview Brand', null)

      const document = getDocument(
        readFileSync(join(workspace, 'index.html'), 'utf8'),
      )
      expectAeoMetadata(document)
      expectLlmsTxtHasBrand(readFileSync(join(workspace, 'llms.txt'), 'utf8'))
      expectRobotsHasSitemap(
        readFileSync(join(workspace, 'robots.txt'), 'utf8'),
      )
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })
})

describe('Next.js Medusa export', () => {
  it('initializes payment sessions from the retrieved cart object', async () => {
    const nextSpec: SiteSpecProject = { ...siteSpec, siteType: 'ecommerce' }
    const files: Record<string, string> = renderNextProject(nextSpec, {}).files
    const medusaSource = files['lib/medusa.js']
    expect(medusaSource).toBeTruthy()
    const workspace = mkdtempSync(join(tmpdir(), 'next-medusa-runtime-'))

    try {
      const modulePath = join(workspace, 'medusa.js')
      writeFileSync(modulePath, medusaSource)
      const entryPath = join(workspace, 'run-medusa.js')
      writeFileSync(
        entryPath,
        `import { createPaymentSessions } from "./medusa.js";

globalThis.__paymentResult = await createPaymentSessions("cart_123", "stripe");
`,
      )
      const bundled = await build({
        bundle: true,
        define: {
          'process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY':
            JSON.stringify('pk_test'),
          'process.env.MEDUSA_BACKEND_URL': JSON.stringify(
            'http://localhost:9000',
          ),
        },
        entryPoints: [entryPath],
        format: 'esm',
        logLevel: 'silent',
        platform: 'node',
        plugins: [
          {
            name: 'medusa-sdk-runtime-stub',
            setup(pluginBuild) {
              pluginBuild.onResolve({ filter: /^@medusajs\/js-sdk$/ }, () => ({
                namespace: 'medusa-sdk-runtime-stub',
                path: '@medusajs/js-sdk',
              }))
              pluginBuild.onLoad(
                {
                  filter: /^@medusajs\/js-sdk$/,
                  namespace: 'medusa-sdk-runtime-stub',
                },
                () => ({
                  contents: `export default class Medusa {
  constructor() {
    return globalThis.__medusaClient;
  }
}`,
                  loader: 'js',
                }),
              )
            },
          },
        ],
        write: false,
      })
      const bundlePath = join(workspace, 'run-medusa.mjs')
      writeFileSync(bundlePath, bundled.outputFiles[0]?.text ?? '')
      const retrievedCart = { id: 'cart_123', total: 4200 }
      const g = globalThis as Record<string, unknown>
      g.__medusaClient = {
        store: {
          cart: {
            retrieve: async (cartId: unknown) => {
              g.__retrievedCartId = cartId
              return { cart: retrievedCart }
            },
          },
          payment: {
            initiatePaymentSession: async (cart: unknown, options: Record<string, unknown>) => {
              g.__initiatedPaymentCart = cart
              g.__initiatedPaymentOptions = options
              return {
                payment_collection: { id: 'paycol_123' },
              }
            },
          },
        },
      }

      await import(`${bundlePath}?t=${Date.now()}`)

      expect(g.__retrievedCartId).toBe('cart_123')
      expect(g.__initiatedPaymentCart).toBe(retrievedCart)
      expect(g.__initiatedPaymentOptions).toEqual({
        provider_id: 'stripe',
      })
      expect(g.__paymentResult).toEqual({ id: 'paycol_123' })
    } finally {
      const g = globalThis as Record<string, unknown>
      delete g.__medusaClient
      delete g.__retrievedCartId
      delete g.__initiatedPaymentCart
      delete g.__initiatedPaymentOptions
      delete g.__paymentResult
      rmSync(workspace, { recursive: true, force: true })
    }
  })
})
