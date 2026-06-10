import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  renderPreviewToWorkspace,
  renderProject,
  writeStreamingShellToWorkspace,
} from './index'

const siteSpec = {
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
        description: 'Preview Brand helps teams launch polished SaaS homepages.',
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
            { title: 'What is Preview Brand?', body: 'Preview Brand generates SaaS homepages.' },
            { title: 'Who is it for?', body: 'Teams that need polished launch pages.' },
            { title: 'Why use it?', body: 'It creates a complete, structured preview quickly.' },
          ],
        },
      ],
    },
  ],
}

const expectNoTailwindCdn = (html: string) => {
  expect(html).not.toMatch(/cdn\.tailwindcss\.com/i)
  expect(html).toContain('tailwind-browser.js')
}

describe('renderer Tailwind preview CSS', () => {
  it('uses a local Tailwind CSS asset for static HTML exports', () => {
    const rendered = renderProject(siteSpec as any, 'html')
    expectNoTailwindCdn(rendered.files['index.html'])
    expect(rendered.files['scripts/tailwind-browser.js']).toContain('tailwind')
  })

  it('advertises AEO metadata assets for static HTML session renders', () => {
    const rendered = renderProject(siteSpec as any, 'html')
    const html = rendered.files['index.html']

    expect(html).toContain('<meta name="description"')
    expect(html).toContain('<meta name="robots" content="index, follow"')
    expect(html).toContain('application/ld+json')
    expect(html).toContain('href="/llms.txt"')
    expect(rendered.files['llms.txt']).toContain('# Preview Brand')
    expect(rendered.files['robots.txt']).toContain('Sitemap: https://preview.example/sitemap.xml')
    expect(rendered.files['sitemap.xml']).toContain('<loc>https://preview.example/</loc>')
  })

  it('uses a local Tailwind CSS asset for OpenUI preview shells', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-renderer-'))
    try {
      writeFileSync(join(workspace, 'site-spec.json'), JSON.stringify(siteSpec))
      writeFileSync(join(workspace, 'home.openui'), 'page Home { Text "Hello" }')
      renderPreviewToWorkspace(siteSpec as any, workspace)
      expectNoTailwindCdn(readFileSync(join(workspace, 'index.html'), 'utf8'))
      expect(readFileSync(join(workspace, 'scripts/tailwind-browser.js'), 'utf8')).toContain(
        'tailwind',
      )
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('advertises AEO metadata assets for completed OpenUI preview sessions', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-renderer-aeo-'))
    try {
      writeFileSync(join(workspace, 'site-spec.json'), JSON.stringify(siteSpec))
      writeFileSync(join(workspace, 'home.openui'), 'page Home { Text "Hello" }')
      renderPreviewToWorkspace(siteSpec as any, workspace)

      const html = readFileSync(join(workspace, 'index.html'), 'utf8')
      expect(html).toContain('<meta name="description"')
      expect(html).toContain('<meta name="robots" content="index, follow"')
      expect(html).toContain('application/ld+json')
      expect(html).toContain('href="/llms.txt"')
      expect(readFileSync(join(workspace, 'llms.txt'), 'utf8')).toContain('# Preview Brand')
      expect(readFileSync(join(workspace, 'robots.txt'), 'utf8')).toContain(
        'Sitemap: https://preview.example/sitemap.xml',
      )
      expect(readFileSync(join(workspace, 'sitemap.xml'), 'utf8')).toContain(
        '<loc>https://preview.example/</loc>',
      )
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('uses a local Tailwind CSS asset for streaming shells', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-streaming-shell-'))
    try {
      writeStreamingShellToWorkspace(workspace, 'Streaming Brand', null)
      expectNoTailwindCdn(readFileSync(join(workspace, 'index.html'), 'utf8'))
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('advertises AEO metadata assets for streaming preview shells', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-streaming-aeo-'))
    try {
      writeFileSync(join(workspace, 'site-spec.json'), JSON.stringify(siteSpec))
      writeStreamingShellToWorkspace(workspace, 'Preview Brand', null)

      const html = readFileSync(join(workspace, 'index.html'), 'utf8')
      expect(html).toContain('<meta name="description"')
      expect(html).toContain('<meta name="robots" content="index, follow"')
      expect(html).toContain('application/ld+json')
      expect(html).toContain('href="/llms.txt"')
      expect(readFileSync(join(workspace, 'llms.txt'), 'utf8')).toContain('# Preview Brand')
      expect(readFileSync(join(workspace, 'robots.txt'), 'utf8')).toContain(
        'Sitemap: https://preview.example/sitemap.xml',
      )
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })
})

describe('Next.js Medusa export', () => {
  it('initializes payment sessions from the retrieved cart object', () => {
    const source = readFileSync(join(import.meta.dirname, 'nextjs/index.js'), 'utf8')
    expect(source).toContain('const { cart } = await client.store.cart.retrieve(cartId)')
    expect(source).toContain('client.store.payment.initiatePaymentSession(cart, { provider_id: pid })')
    expect(source).not.toContain('initiatePaymentSession(cartId')
  })
})
