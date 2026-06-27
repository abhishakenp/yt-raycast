import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseHTML } from 'linkedom'
import ts from 'typescript'

import type { SiteSpecProject } from '../spec/index.ts'
import {
  renderPreviewToWorkspace,
  renderProject,
  writeStreamingShellToWorkspace,
} from './index'
// @ts-ignore -- JS module without type declarations.
import { renderNextProject } from './nextjs/index.js'

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

const getDocument = (html: string) => parseHTML(html).document

/** Assert no Tailwind CDN script is referenced and the local asset is. */
const expectNoTailwindCdn = (document: Document) => {
  const scripts = [...document.querySelectorAll('script[src]')]
  const srcs = scripts.map((s) => s.getAttribute('src') ?? '')
  expect(srcs.some((src) => /cdn\.tailwindcss\.com/i.test(src))).toBe(false)
  expect(srcs).toContain('/scripts/tailwind-browser.js')
}

/** Assert AEO metadata tags are present in the document head. */
const expectAeoMetadata = (document: Document) => {
  expect(document.querySelector('meta[name="description"]')).toBeTruthy()
  const robots = document.querySelector('meta[name="robots"]')
  expect(robots?.getAttribute('content')).toBe('index, follow')
  expect(document.querySelector('script[type="application/ld+json"]')).toBeTruthy()
  expect(document.querySelector('link[href="/llms.txt"]')).toBeTruthy()
}

/** Assert llms.txt starts with the brand heading. */
const expectLlmsTxtHasBrand = (content: string) => {
  expect(content.split('\n')[0]).toBe('# Preview Brand')
}

/** Assert robots.txt declares the sitemap URL. */
const expectRobotsHasSitemap = (content: string) => {
  expect(content.split('\n').some((l) => l === 'Sitemap: https://preview.example/sitemap.xml')).toBe(true)
}

/** Assert sitemap.xml contains the home URL in a <loc> element. */
const expectSitemapHasHomeUrl = (content: string) => {
  const { document } = parseHTML(content)
  const locs = [...document.querySelectorAll('loc')].map((el) => el.textContent)
  expect(locs.some((loc) => loc === 'https://preview.example/')).toBe(true)
}

describe('renderer Tailwind preview CSS', () => {
  it('uses a local Tailwind CSS asset for static HTML exports', () => {
    const rendered = renderProject(siteSpec, 'html')
    expectNoTailwindCdn(getDocument(rendered.files['index.html']))
    expect(rendered.files['scripts/tailwind-browser.js']?.length).toBeGreaterThan(0)
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
      expectNoTailwindCdn(getDocument(readFileSync(join(workspace, 'index.html'), 'utf8')))
      expect(
        readFileSync(join(workspace, 'scripts/tailwind-browser.js'), 'utf8').length,
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

      const document = getDocument(readFileSync(join(workspace, 'index.html'), 'utf8'))
      expectAeoMetadata(document)
      expectLlmsTxtHasBrand(readFileSync(join(workspace, 'llms.txt'), 'utf8'))
      expectRobotsHasSitemap(readFileSync(join(workspace, 'robots.txt'), 'utf8'))
      expectSitemapHasHomeUrl(readFileSync(join(workspace, 'sitemap.xml'), 'utf8'))
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('uses a local Tailwind CSS asset for streaming shells', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-streaming-shell-'))
    try {
      writeStreamingShellToWorkspace(workspace, 'Streaming Brand', null)
      expectNoTailwindCdn(getDocument(readFileSync(join(workspace, 'index.html'), 'utf8')))
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('advertises AEO metadata assets for streaming preview shells', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-streaming-aeo-'))
    try {
      writeFileSync(join(workspace, 'site-spec.json'), JSON.stringify(siteSpec))
      writeStreamingShellToWorkspace(workspace, 'Preview Brand', null)

      const document = getDocument(readFileSync(join(workspace, 'index.html'), 'utf8'))
      expectAeoMetadata(document)
      expectLlmsTxtHasBrand(readFileSync(join(workspace, 'llms.txt'), 'utf8'))
      expectRobotsHasSitemap(readFileSync(join(workspace, 'robots.txt'), 'utf8'))
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })
})

/**
 * Behavioral + AST test: call the Next.js project generator with an ecommerce
 * spec, then parse the generated lib/medusa.js with a TypeScript AST to verify
 * createPaymentSessions retrieves the cart object and passes IT (not cartId)
 * to initiatePaymentSession — the regression that broke Medusa checkout.
 */
describe('Next.js Medusa export', () => {
  it('initializes payment sessions from the retrieved cart object', () => {
    const files: Record<string, string> = renderNextProject(
      { ...siteSpec, siteType: 'ecommerce' },
      {},
    ).files
    const medusaSource = files['lib/medusa.js']
    expect(medusaSource).toBeTruthy()

    const sourceFile = ts.createSourceFile(
      'medusa.js',
      medusaSource,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    )

    let foundRetrieve = false
    let initiateFirstArg: string | null = null

    const walkFunction = (fn: ts.FunctionDeclaration) => {
      const walk = (node: ts.Node) => {
        // Detect: const { cart } = await client.store.cart.retrieve(cartId)
        if (
          ts.isVariableStatement(node) &&
          node.declarationList.declarations.some((decl) => {
            if (!decl.initializer || !ts.isAwaitExpression(decl.initializer))
              return false
            const call = decl.initializer.expression
            return (
              ts.isCallExpression(call) &&
              ts.isPropertyAccessExpression(call.expression) &&
              call.expression.getText(sourceFile).includes('cart.retrieve')
            )
          })
        ) {
          foundRetrieve = true
        }
        // Detect: await client.store.payment.initiatePaymentSession(<firstArg>, ...)
        if (ts.isAwaitExpression(node)) {
          const call = node.expression
          if (
            ts.isCallExpression(call) &&
            ts.isPropertyAccessExpression(call.expression) &&
            call.expression.getText(sourceFile).includes('initiatePaymentSession') &&
            call.arguments.length > 0
          ) {
            const firstArg = call.arguments[0]
            if (ts.isIdentifier(firstArg)) initiateFirstArg = firstArg.text
          }
        }
        ts.forEachChild(node, walk)
      }
      ts.forEachChild(fn, walk)
    }

    const visit = (node: ts.Node) => {
      if (
        ts.isFunctionDeclaration(node) &&
        node.name?.text === 'createPaymentSessions'
      ) {
        walkFunction(node)
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)

    expect(foundRetrieve).toBe(true)
    expect(initiateFirstArg).toBe('cart')
    expect(initiateFirstArg).not.toBe('cartId')
  })
})
