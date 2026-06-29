import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks: Groq LLM calls return controlled responses
// ---------------------------------------------------------------------------

const groqMock = vi.hoisted(() => vi.fn())
const groqParallelMock = vi.hoisted(() => vi.fn())
const groqStreamMock = vi.hoisted(() => vi.fn())

vi.mock('../llm/groq.js', () => ({
  groq: groqMock,
  groqParallel: groqParallelMock,
  groqStream: groqStreamMock,
}))

// Mock brandfetch so brand-profile tests don't hit the network
const brandfetchMock = vi.hoisted(() => ({
  resolveBrandfetchBrandProfile: vi.fn(),
  materializeBrandfetchLogoToWorkspace: vi.fn(),
}))

vi.mock('../brandfetch.js', () => ({
  resolveBrandfetchBrandProfile: brandfetchMock.resolveBrandfetchBrandProfile,
  materializeBrandfetchLogoToWorkspace:
    brandfetchMock.materializeBrandfetchLogoToWorkspace,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mkWorkspace = () => mkdtempSync(join(tmpdir(), 'ship-fast-engine-edge-'))

const htmlResponse = (url: string, html: string) =>
  ({
    ok: true,
    url,
    headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
    text: async () => html,
  }) as Response

const missingResponse = (url: string) =>
  ({
    ok: false,
    url,
    headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
    text: async () => '',
  }) as Response

const completeHtml = (body = '<main><h1>Test</h1></main>') =>
  `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head>
<body>${body}</body>
</html>`

// ---------------------------------------------------------------------------
// SFF HTML phase
// ---------------------------------------------------------------------------

describe('SFF HTML phase', () => {
  describe('sanitizeSffHtml', () => {
    it('strips markdown fences and trims to doctype/html boundaries', async () => {
      const { sanitizeSffHtml } = await import('./phase-sff-html.ts')
      const html = completeHtml()

      const fenced = `Here is the file:\n\`\`\`html\n${html}\n\`\`\`\nextra junk`
      const sanitized = sanitizeSffHtml(fenced)

      expect(sanitized).toBe(html)
      expect(sanitized.startsWith('<!DOCTYPE html>')).toBe(true)
      expect(sanitized.endsWith('</html>')).toBe(true)
      expect(sanitized).not.toContain('```')
      expect(sanitized).not.toContain('Here is the file')
    })

    it('handles preamble before doctype and trailing content after </html>', async () => {
      const { sanitizeSffHtml } = await import('./phase-sff-html.ts')
      const html = completeHtml()
      const withPreamble = `Sure, here you go:\n${html}\n\nLet me know if you need changes.`
      const sanitized = sanitizeSffHtml(withPreamble)

      expect(sanitized).toBe(html)
    })

    // -----------------------------------------------------------------
    // EXPECTED behavior: sanitizeSffHtml MUST remove dangerous content.
    // If the implementation does not strip these, the test fails —
    // signaling a security gap, not pinning current (buggy) behavior.
    // -----------------------------------------------------------------
    it('removes <script> tags (inline and external)', async () => {
      const { sanitizeSffHtml } = await import('./phase-sff-html.ts')
      const malicious = completeHtml(
        '<main><h1>Hi</h1></main>' +
          '<script>alert("xss")</script>' +
          '<script src="https://evil.test/steal.js"></script>',
      )
      const sanitized = sanitizeSffHtml(malicious)

      expect(sanitized).not.toContain('<script>alert')
      expect(sanitized).not.toContain('evil.test')
      expect(sanitized).not.toMatch(/<script[^>]*>alert/)
    })

    it('removes inline event handlers (onclick, onload, onerror, etc.)', async () => {
      const { sanitizeSffHtml } = await import('./phase-sff-html.ts')
      const malicious = completeHtml(
        '<main>' +
          '<div onclick="alert(1)">Click me</div>' +
          '<img src="x" onerror="alert(2)">' +
          '<body onload="alert(3)">' +
          '</main>',
      )
      const sanitized = sanitizeSffHtml(malicious)

      expect(sanitized).not.toContain('onclick=')
      expect(sanitized).not.toContain('onerror=')
      expect(sanitized).not.toContain('onload=')
    })

    it('removes javascript: URLs from href attributes', async () => {
      const { sanitizeSffHtml } = await import('./phase-sff-html.ts')
      const malicious = completeHtml(
        '<main><a href="javascript:alert(1)">Click</a></main>',
      )
      const sanitized = sanitizeSffHtml(malicious)

      expect(sanitized).not.toContain('javascript:')
      expect(sanitized).not.toMatch(/href=["']javascript:/i)
    })

    it('preserves legitimate HTML (div, p, img, a with https)', async () => {
      const { sanitizeSffHtml } = await import('./phase-sff-html.ts')
      const body = `
<div class="hero">
  <p>Welcome to our site</p>
  <img src="https://images.pexels.com/photos/123/photo.jpeg" alt="Hero">
  <a href="https://example.com">Visit</a>
</div>`
      const html = completeHtml(body)
      const sanitized = sanitizeSffHtml(html)

      expect(sanitized).toContain('<div class="hero">')
      expect(sanitized).toContain('<p>Welcome to our site</p>')
      expect(sanitized).toContain(
        'https://images.pexels.com/photos/123/photo.jpeg',
      )
      expect(sanitized).toContain('href="https://example.com"')
    })
  })

  describe('isCompleteSffHtml', () => {
    it('returns true for complete HTML (has <html>, <body>, <head>, ends with </html>)', async () => {
      const { isCompleteSffHtml } = await import('./phase-sff-html.ts')
      expect(isCompleteSffHtml(completeHtml())).toBe(true)
    })

    it('returns false for partial HTML missing doctype', async () => {
      const { isCompleteSffHtml } = await import('./phase-sff-html.ts')
      expect(
        isCompleteSffHtml('<html><head></head><body><h1>Hi</h1></body></html>'),
      ).toBe(false)
    })

    it('returns false for partial HTML missing body', async () => {
      const { isCompleteSffHtml } = await import('./phase-sff-html.ts')
      expect(
        isCompleteSffHtml('<!DOCTYPE html><html><head></head></html>'),
      ).toBe(false)
    })

    it('returns false for HTML not ending with </html>', async () => {
      const { isCompleteSffHtml } = await import('./phase-sff-html.ts')
      expect(
        isCompleteSffHtml(
          '<!DOCTYPE html><html><head></head><body><h1>Hi</h1></body>',
        ),
      ).toBe(false)
    })
  })

  describe('buildSffHtmlPrompt', () => {
    it('includes site spec summary with brand, tagline, site type, and pages', async () => {
      const { buildSffHtmlPrompt } = await import('./phase-sff-html.ts')
      const prompt = buildSffHtmlPrompt({
        prompt: 'A website for a billing analytics product',
        siteSpec: {
          projectName: 'Launch Ledger',
          tagline: 'Finance clarity before lunch',
          siteType: 'saas',
          pages: [{ name: 'Home' }, { name: 'Pricing' }, { name: 'About' }],
        },
      })

      expect(prompt).toContain('A website for a billing analytics product')
      expect(prompt).toContain('Brand: Launch Ledger')
      expect(prompt).toContain('Tagline: Finance clarity before lunch')
      expect(prompt).toContain('Site type: saas')
      expect(prompt).toContain('Home, Pricing, About')
    })

    it('includes media prompt block with verified Pexels photos and videos', async () => {
      const { buildSffHtmlPrompt } = await import('./phase-sff-html.ts')
      const prompt = buildSffHtmlPrompt({
        prompt: 'A travel landing page',
        imageHints: {
          photos: [
            {
              query: 'cinematic travel destination',
              alt: 'Mountain landscape at sunset',
              url: 'https://images.pexels.com/photos/999/pexels-photo-999.jpeg',
            },
          ],
          videos: [
            {
              query: 'travel video',
              alt: 'Aerial coastal flyover',
              url: 'https://videos.pexels.com/video-files/555/555-hd.mp4',
              posterUrl: 'https://images.pexels.com/videos/555/poster.jpeg',
            },
          ],
        },
      })

      expect(prompt).toContain('Verified Pexels media')
      expect(prompt).toContain(
        'https://images.pexels.com/photos/999/pexels-photo-999.jpeg',
      )
      expect(prompt).toContain('Mountain landscape at sunset')
      expect(prompt).toContain(
        'https://videos.pexels.com/video-files/555/555-hd.mp4',
      )
      expect(prompt).toContain(
        'poster: https://images.pexels.com/videos/555/poster.jpeg',
      )
    })

    it('includes fallback media instructions when no verified media is supplied', async () => {
      const { buildSffHtmlPrompt } = await import('./phase-sff-html.ts')
      const prompt = buildSffHtmlPrompt({
        prompt: 'A simple landing page',
      })

      expect(prompt).toContain('Verified media:')
      expect(prompt).toContain('No verified Pexels URLs were preloaded')
      expect(prompt).toContain('/api/pexels')
    })

    it('includes brand profile block when a verified brand profile is supplied', async () => {
      const { buildSffHtmlPrompt } = await import('./phase-sff-html.ts')
      const prompt = buildSffHtmlPrompt({
        prompt: 'A site for Acme Corp',
        brandProfile: {
          verified: true,
          requestedName: 'Acme Corp',
          officialName: 'Acme Corporation',
          officialUrl: 'https://acme.test',
          logoUrl: 'https://cdn.brandfetch.io/acme/logo.svg',
          description: 'We make things.',
          emails: ['hello@acme.test'],
          phones: [],
          addresses: [],
          socials: [],
          sourceUrls: ['https://acme.test'],
        },
      })

      expect(prompt).toContain('VERIFIED BRAND PROFILE')
      expect(prompt).toContain('Acme Corporation')
      expect(prompt).toContain('https://acme.test')
      expect(prompt).toContain('https://cdn.brandfetch.io/acme/logo.svg')
    })
  })

  describe('Lucide icon injection', () => {
    it('injects Lucide CDN + bootstrap runtime when HTML has data-lucide icons', async () => {
      const { writeSffHtmlHome } = await import('./phase-sff-html.ts')
      const workspace = mkWorkspace()
      const lucideHtml = completeHtml(
        '<main><i data-lucide="sparkles" class="w-5 h-5"></i></main>',
      )

      try {
        await writeSffHtmlHome({
          workspace,
          prompt: 'A landing page with icons',
          generateHtml: async () => ({ content: lucideHtml, cost: 0.001 }),
        })

        const written = readFileSync(join(workspace, 'index.html'), 'utf8')
        expect(written).toContain('unpkg.com/lucide@latest')
        expect(written).toContain('sf-lucide-bootstrap')
        expect(written).toContain('data-lucide="sparkles"')
      } finally {
        rmSync(workspace, { recursive: true, force: true })
      }
    })

    it('does not inject Lucide runtime when HTML has no icon placeholders', async () => {
      const { writeSffHtmlHome } = await import('./phase-sff-html.ts')
      const workspace = mkWorkspace()
      const plainHtml = completeHtml('<main><h1>No icons here</h1></main>')

      try {
        await writeSffHtmlHome({
          workspace,
          prompt: 'A plain landing page',
          generateHtml: async () => ({ content: plainHtml, cost: 0 }),
        })

        const written = readFileSync(join(workspace, 'index.html'), 'utf8')
        expect(written).not.toContain('unpkg.com/lucide@latest')
        expect(written).not.toContain('sf-lucide-bootstrap')
      } finally {
        rmSync(workspace, { recursive: true, force: true })
      }
    })

    it('throws when generated HTML is not a complete document', async () => {
      const { writeSffHtmlHome } = await import('./phase-sff-html.ts')
      const workspace = mkWorkspace()

      try {
        await expect(
          writeSffHtmlHome({
            workspace,
            prompt: 'A broken page',
            generateHtml: async () => ({
              content: '<div>partial</div>',
              cost: 0,
            }),
          }),
        ).rejects.toThrow('complete HTML document')
      } finally {
        rmSync(workspace, { recursive: true, force: true })
      }
    })
  })
})

// ---------------------------------------------------------------------------
// Image hints
// ---------------------------------------------------------------------------

type PexelsImageHintsInput = {
  prompt: string
  hydrationPrompt?: string
  ctx?: unknown
}
type PexelsProgressEvent = {
  done: boolean
  photos: unknown[]
  videos: unknown[]
}
type PexelsImageHintsResult = {
  photos: unknown[]
  videos: unknown[]
  promptBlock: string
  prompt: string
  hydrationPrompt: string
}
type PexelsImageHintsFn = (
  input: PexelsImageHintsInput | null,
  options?: { onProgress?: (event: PexelsProgressEvent) => void } | null,
) => Promise<PexelsImageHintsResult>

describe('Image hints', () => {
  const originalPexelsKey = process.env.PEXELS_API_KEY
  const originalUnsplashKey = process.env.UNSPLASH_ACCESS_KEY

  beforeEach(() => {
    vi.resetModules()
    process.env.PEXELS_API_KEY = 'pexels-test-key'
    process.env.UNSPLASH_ACCESS_KEY = ''
  })

  afterEach(() => {
    if (originalPexelsKey === undefined) delete process.env.PEXELS_API_KEY
    else process.env.PEXELS_API_KEY = originalPexelsKey
    if (originalUnsplashKey === undefined)
      delete process.env.UNSPLASH_ACCESS_KEY
    else process.env.UNSPLASH_ACCESS_KEY = originalUnsplashKey
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  /**
   * Mock fetch that captures Pexels photo search queries and returns
   * controlled photo results.
   */
  const mockPexelsFetch = (capturedQueries: string[]) =>
    vi.fn(async (input: URL | string) => {
      const url = new URL(String(input))
      if (url.hostname === 'api.pexels.com' && url.pathname === '/v1/search') {
        const query = url.searchParams.get('query') ?? ''
        capturedQueries.push(query)
        return {
          json: async () => ({
            photos: [
              {
                id: Number.parseInt(
                  query.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + '',
                ),
                alt: query,
                src: {
                  large2x: `https://images.pexels.com/photos/${query.length}/photo.jpeg`,
                },
              },
            ],
          }),
          ok: true,
        } as Response
      }
      if (
        url.hostname === 'api.pexels.com' &&
        url.pathname === '/v1/videos/search'
      ) {
        return { json: async () => ({ videos: [] }), ok: true } as Response
      }
      if (url.hostname === 'images.pexels.com') {
        return {
          headers: new Headers({ 'content-type': 'image/jpeg' }),
          ok: true,
        } as Response
      }
      return {
        headers: new Headers(),
        json: async () => ({}),
        ok: false,
      } as Response
    })

  it('commerce site → product-related hints (includes product query)', async () => {
    const capturedQueries: string[] = []
    vi.stubGlobal('fetch', mockPexelsFetch(capturedQueries))

    const { resolvePexelsImageHints } = (await import('./image-hints.js')) as {
      resolvePexelsImageHints: PexelsImageHintsFn
    }
    const result = await resolvePexelsImageHints({
      prompt:
        'Online store for healthy snacks with product cards, shop by category, and checkout',
    })

    expect(capturedQueries.length).toBeGreaterThan(0)
    // Commerce sites get a "product on white background minimal" extra query
    expect(capturedQueries.some((q) => q.includes('product'))).toBe(true)
    expect(result.photos.length).toBeGreaterThan(0)
    expect(result.promptBlock).toContain('Approved still images')
  })

  it('blog site → article/reading hints (editorial queries, no product extras)', async () => {
    const capturedQueries: string[] = []
    vi.stubGlobal('fetch', mockPexelsFetch(capturedQueries))

    const { resolvePexelsImageHints } = (await import('./image-hints.js')) as {
      resolvePexelsImageHints: PexelsImageHintsFn
    }
    await resolvePexelsImageHints({
      prompt:
        'A blog about travel stories and editorial articles with reading sections',
    })

    expect(capturedQueries.length).toBeGreaterThan(0)
    // Blog sites should NOT get the ecommerce "product on white background" query
    expect(
      capturedQueries.some((q) => q === 'product on white background minimal'),
    ).toBe(false)
    // Blog/travel prompts trigger travel-themed queries
    expect(
      capturedQueries.some((q) =>
        /travel|destination|cinematic|editorial|story/i.test(q),
      ),
    ).toBe(true)
  })

  it('empty/minimal site spec → generic or empty hints', async () => {
    const capturedQueries: string[] = []
    vi.stubGlobal('fetch', mockPexelsFetch(capturedQueries))

    const { resolvePexelsImageHints } = (await import('./image-hints.js')) as {
      resolvePexelsImageHints: PexelsImageHintsFn
    }
    const result = await resolvePexelsImageHints({
      prompt: '',
    })

    // No visual phrases → no queries → empty result
    expect(result.photos).toEqual([])
    expect(result.videos).toEqual([])
    expect(result.promptBlock).toBe('')
  })

  it('onProgress: streaming progress events fired (partial then done)', async () => {
    const capturedQueries: string[] = []
    vi.stubGlobal('fetch', mockPexelsFetch(capturedQueries))

    const { resolvePexelsImageHints } = (await import('./image-hints.js')) as {
      resolvePexelsImageHints: PexelsImageHintsFn
    }
    const events: Array<{
      done: boolean
      photos: unknown[]
      videos: unknown[]
    }> = []

    await resolvePexelsImageHints(
      {
        prompt:
          'Online store for healthy snacks with product cards and lifestyle panels',
      },
      { onProgress: (event: PexelsProgressEvent) => events.push(event) },
    )

    // At least one partial (done=false) event and a final done=true event
    expect(events.length).toBeGreaterThanOrEqual(2)
    expect(events.some((e) => e.done === false)).toBe(true)
    expect(events.at(-1)?.done).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Navfix
// ---------------------------------------------------------------------------

describe('Navfix', () => {
  describe('wireHomepageNavLinks (normalizeLinkText + buildNavTargets + LINK_ALIASES)', () => {
    it('normalizes link text: "About Us" → about page, "Contact" → contact page, "FAQ" → faq page', async () => {
      const { wireHomepageNavLinks } = await import('./phase-navfix.js')
      const html = `<!DOCTYPE html>
<html><head></head><body>
<nav>
  <a href="/">Home</a>
  <a href="#">About Us</a>
  <a href="#">Contact</a>
  <a href="#">FAQ</a>
</nav>
</body></html>`

      const tasks = [
        { filename: 'about.html', title: 'About Us' },
        { filename: 'contact.html', title: 'Contact' },
        { filename: 'faq.html', title: 'FAQ' },
      ]

      const wired = wireHomepageNavLinks(html, tasks)
      expect(wired).toContain('href="about.html"')
      expect(wired).toContain('href="contact.html"')
      expect(wired).toContain('href="faq.html"')
    })

    it('buildNavTargets: creates target map from nav tasks with slugs and tokens', async () => {
      const { wireHomepageNavLinks } = await import('./phase-navfix.js')
      const html = `<nav><a href="#">Shop Products</a><a href="#">Blog Articles</a></nav>`
      const tasks = [
        { filename: 'shop.html', title: 'Shop Products' },
        { filename: 'blog.html', title: 'Blog Articles' },
      ]

      const wired = wireHomepageNavLinks(html, tasks)
      // "Shop Products" normalizes and matches "shop" slug → shop.html
      expect(wired).toContain('href="shop.html"')
      // "Blog Articles" matches blog alias → blog.html
      expect(wired).toContain('href="blog.html"')
    })

    it('LINK_ALIASES: "home" maps to index.html; "about us" maps to about.html', async () => {
      const { wireHomepageNavLinks } = await import('./phase-navfix.js')
      const html = `<nav>
        <a href="#">Home</a>
        <a href="#">About Us</a>
        <a href="#">Our Story</a>
      </nav>`

      const tasks = [{ filename: 'about.html', title: 'About Us' }]

      const wired = wireHomepageNavLinks(html, tasks)
      // "Home" / "Homepage" → index.html (special-cased in resolveNavFilename)
      expect(wired).toContain('href="index.html"')
      // "About Us" exact-matches the about page
      expect(wired).toContain('href="about.html"')
      // "Our Story" matches the about alias (about|story|company)
      expect(wired).toContain('href="about.html"')
    })

    it('skips index.html in buildNavTargets (home is not a nav target)', async () => {
      const { wireHomepageNavLinks } = await import('./phase-navfix.js')
      const html = `<nav><a href="#">Pricing</a></nav>`
      const tasks = [
        { filename: 'index.html', title: 'Home' },
        { filename: 'pricing.html', title: 'Pricing' },
      ]

      const wired = wireHomepageNavLinks(html, tasks)
      expect(wired).toContain('href="pricing.html"')
    })

    it('maps absolute-ish paths like /shop to shop.html', async () => {
      const { wireHomepageNavLinks } = await import('./phase-navfix.js')
      const html = `<nav>
        <a href="/shop">Shop</a>
        <a href="/blog">Blog</a>
      </nav>`
      const tasks = [
        { filename: 'shop.html', title: 'Shop' },
        { filename: 'blog.html', title: 'Blog' },
      ]

      const wired = wireHomepageNavLinks(html, tasks)
      expect(wired).toContain('href="shop.html"')
      expect(wired).toContain('href="blog.html"')
    })

    it('preserves external http/mailto/tel links', async () => {
      const { wireHomepageNavLinks } = await import('./phase-navfix.js')
      const html = `<nav>
        <a href="https://example.com">External</a>
        <a href="mailto:hi@test.com">Email</a>
        <a href="tel:+1234567890">Call</a>
      </nav>`

      const wired = wireHomepageNavLinks(html, [
        { filename: 'about.html', title: 'About' },
      ])
      expect(wired).toContain('href="https://example.com"')
      expect(wired).toContain('href="mailto:hi@test.com"')
      expect(wired).toContain('href="tel:+1234567890"')
    })
  })

  describe('groqParallel: batch processes multiple nav items', () => {
    it('processes multiple calls in parallel via Promise.all', async () => {
      // groqParallel calls groqFetch → fetch. Mock fetch to capture each call.
      // Use vi.importActual to bypass the top-level groq mock and test the
      // real Promise.all batching logic.
      const calls: string[] = []
      vi.stubGlobal(
        'fetch',
        vi.fn(async (_url: string | URL, init?: RequestInit) => {
          const body = JSON.parse(String(init?.body ?? '{}'))
          const userMsg = body.messages?.find(
            (m: { role: string }) => m.role === 'user',
          )
          calls.push(userMsg?.content ?? '')
          return {
            ok: true,
            json: async () => ({
              choices: [{ message: { content: 'result' } }],
              usage: {
                prompt_tokens: 10,
                completion_tokens: 5,
                total_time: 0.5,
              },
            }),
          } as Response
        }),
      )

      const originalKey = process.env.GROQ_API_KEY
      process.env.GROQ_API_KEY = 'test-key'
      try {
        const actual = (await vi.importActual('../llm/groq.js')) as {
          groqParallel: (
            calls: Array<{
              prompt: string
              system?: string
              temperature?: number
              maxTokens?: number
            }>,
          ) => Promise<Array<{ content: string }>>
        }
        const results = await actual.groqParallel([
          {
            prompt: 'fix nav item 1',
            system: 'sys1',
            temperature: 0.2,
            maxTokens: 100,
          },
          {
            prompt: 'fix nav item 2',
            system: 'sys2',
            temperature: 0.2,
            maxTokens: 100,
          },
          {
            prompt: 'fix nav item 3',
            system: 'sys3',
            temperature: 0.2,
            maxTokens: 100,
          },
        ])

        expect(calls).toHaveLength(3)
        expect(calls).toContain('fix nav item 1')
        expect(calls).toContain('fix nav item 2')
        expect(calls).toContain('fix nav item 3')
        expect(results).toHaveLength(3)
        results.forEach((r) => {
          expect(r.content).toBe('result')
        })
      } finally {
        if (originalKey === undefined) delete process.env.GROQ_API_KEY
        else process.env.GROQ_API_KEY = originalKey
        vi.unstubAllGlobals()
      }
    })
  })

  describe('fixHomepageNav (programmatic wiring)', () => {
    it('wires nav links without LLM when programmatic wiring succeeds', async () => {
      const { fixHomepageNav } = await import('./phase-navfix.js')
      const workspace = mkWorkspace()
      const html = `<!DOCTYPE html>
<html><head></head><body>
<nav><a href="#">About</a><a href="#">Contact</a></nav>
</body></html>`

      writeFileSync(join(workspace, 'index.html'), html)
      const logs: string[] = []
      const result = await fixHomepageNav(
        'About, Contact',
        workspace,
        (msg: string) => logs.push(msg),
        [
          { filename: 'about.html', title: 'About' },
          { filename: 'contact.html', title: 'Contact' },
        ],
      )

      const written = readFileSync(join(workspace, 'index.html'), 'utf8')
      expect(written).toContain('href="about.html"')
      expect(written).toContain('href="contact.html"')
      expect(logs.join('\n')).toContain('nav links wired')
      expect(result.count).toBe(1)
      expect(result.cost).toBe(0)
      rmSync(workspace, { recursive: true, force: true })
    })
  })
})

// ---------------------------------------------------------------------------
// Brand profile
// ---------------------------------------------------------------------------

describe('Brand profile', () => {
  beforeEach(() => {
    vi.resetModules()
    brandfetchMock.resolveBrandfetchBrandProfile.mockReset()
    brandfetchMock.materializeBrandfetchLogoToWorkspace.mockReset()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('enrichBrandProfile: Brandfetch data → enriched profile with facts', async () => {
    const { enrichBrandProfile } = await import('./brand-profile.js')
    const workspace = mkWorkspace()

    brandfetchMock.resolveBrandfetchBrandProfile.mockResolvedValue({
      ok: true,
      match: {
        name: 'Linear',
        domain: 'linear.app',
        officialUrl: 'https://linear.app',
      },
      logo: {
        kind: 'remote',
        src: 'https://cdn.brandfetch.io/linear/logo.svg',
        provider: 'brandfetch',
        confidence: 0.95,
        alt: 'Linear',
      },
      palette: {
        primary: '#5e6ad2',
        secondary: '#111111',
        accent: '#ffffff',
        provider: 'brandfetch',
      },
    })

    const profile = await enrichBrandProfile(
      'Build a landing page for the company Linear.',
      workspace,
    )

    expect(profile).not.toBeNull()
    expect(profile!.verified).toBe(true)
    expect(profile!.officialName).toBe('Linear')
    expect(profile!.officialUrl).toBe('https://linear.app')
    expect(profile!.logoUrl).toBe('https://cdn.brandfetch.io/linear/logo.svg')
    expect(
      (profile as { palette?: { primary?: string } | null } | null)?.palette
        ?.primary,
    ).toBe('#5e6ad2')
    expect(profile!.confidence).toBeGreaterThan(0.25)

    // Profile is persisted to workspace
    const persisted = JSON.parse(
      readFileSync(join(workspace, 'brand-profile.json'), 'utf8'),
    )
    expect(persisted.officialName).toBe('Linear')
    rmSync(workspace, { recursive: true, force: true })
  })

  it('brandProfilePromptBlock: profile → prompt text with brand context', async () => {
    const { brandProfilePromptBlock } =
      (await import('../prompts/brand-profile.js')) as {
        brandProfilePromptBlock: (
          brandProfile: Record<string, unknown> | null,
        ) => string
      }
    const block = brandProfilePromptBlock({
      verified: true,
      requestedName: 'Acme',
      officialName: 'Acme Corporation',
      officialUrl: 'https://acme.test',
      logoUrl: 'https://cdn.brandfetch.io/acme/logo.svg',
      description: 'We build tools.',
      emails: ['hello@acme.test'],
      phones: ['+1-555-0100'],
      addresses: ['123 Main St'],
      socials: [{ network: 'twitter', url: 'https://x.com/acme' }],
      sourceUrls: ['https://acme.test'],
    })

    expect(block).toContain('VERIFIED BRAND PROFILE')
    expect(block).toContain('Acme Corporation')
    expect(block).toContain('https://acme.test')
    expect(block).toContain('https://cdn.brandfetch.io/acme/logo.svg')
    expect(block).toContain('We build tools.')
    expect(block).toContain('hello@acme.test')
    expect(block).toContain('+1-555-0100')
    expect(block).toContain('123 Main St')
    expect(block).toContain('twitter: https://x.com/acme')
    expect(block).toContain('Brand rules:')
  })

  it('brandProfilePromptBlock: returns empty for unverified profiles', async () => {
    const { brandProfilePromptBlock } =
      (await import('../prompts/brand-profile.js')) as {
        brandProfilePromptBlock: (
          brandProfile: Record<string, unknown> | null,
        ) => string
      }
    expect(brandProfilePromptBlock(null)).toBe('')
    expect(brandProfilePromptBlock({ verified: false })).toBe('')
  })

  it('Brave search integration: brand facts extracted from search results + scraped pages', async () => {
    const { enrichBrandProfile } = await import('./brand-profile.js')
    const workspace = mkWorkspace()

    // Brandfetch fails → falls back to Brave search + page scraping
    brandfetchMock.resolveBrandfetchBrandProfile.mockResolvedValue({
      ok: false,
      error: 'No match',
      status: 404,
    })

    const homepage = `<!doctype html>
<html>
  <head>
    <title>Kaveri Silks | Handloom Sarees</title>
    <meta name="description" content="Handloom sarees and bridal silks.">
    <meta property="og:site_name" content="Kaveri Silks">
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "ClothingStore",
        "name": "Kaveri Silks",
        "description": "Handloom sarees and bridal silks.",
        "email": "hello@kaverisilks.test",
        "telephone": "+91 98765 43210",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "12 Silk Road",
          "addressLocality": "Bengaluru",
          "addressRegion": "KA",
          "postalCode": "560001",
          "addressCountry": "IN"
        },
        "sameAs": ["https://instagram.com/kaverisilks/reels/123"],
        "logo": "/assets/logo.svg"
      }
    </script>
  </head>
  <body>
    <img src="/assets/header-logo.svg" alt="Kaveri Silks logo" class="site-logo">
    <p>Handloom sarees and bridal silks made with artisan weaving partners.</p>
    <a href="https://instagram.com/kaverisilks/stories/latest">Instagram</a>
    <a href="/about">About Kaveri</a>
  </body>
</html>`

    const about = `<!doctype html><html><body>
      <p>Kaveri Silks has served wedding families for three generations.</p>
    </body></html>`

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const href = String(url)
        // Brave search results page
        if (href.startsWith('https://search.brave.com/search')) {
          return htmlResponse(
            'https://search.brave.com/search',
            `<script>title:"Kaveri Silks | Handloom Sarees",url:"https://kaverisilks.test/" description:"Official Kaveri Silks store for handloom sarees",type:"search_result"</script>`,
          )
        }
        if (
          href === 'https://kaverisilks.test' ||
          href === 'https://kaverisilks.test/'
        )
          return htmlResponse('https://kaverisilks.test/', homepage)
        if (href === 'https://kaverisilks.test/about')
          return htmlResponse(href, about)
        return missingResponse(href)
      }),
    )

    const profile = await enrichBrandProfile(
      'Create a website for Kaveri Silks https://kaverisilks.test',
      workspace,
    )

    expect(profile).not.toBeNull()
    expect(profile!.verified).toBe(true)
    expect(profile!.officialName).toBe('Kaveri Silks')
    expect(profile!.description).toContain('Handloom sarees')
    expect(profile!.emails).toContain('hello@kaverisilks.test')
    expect(profile!.phones).toContain('+91 98765 43210')
    expect(profile!.addresses[0]).toContain('12 Silk Road')
    expect(profile!.socials.map((s: { url: string }) => s.url)).toContain(
      'https://instagram.com/kaverisilks/',
    )
    rmSync(workspace, { recursive: true, force: true })
  })

  it('enrichBrandProfile: returns null for non-brand-driven prompts', async () => {
    const { enrichBrandProfile } = await import('./brand-profile.js')
    const workspace = mkWorkspace()

    // Set up brandfetch mock just in case (shouldn't be called)
    brandfetchMock.resolveBrandfetchBrandProfile.mockResolvedValue({
      ok: false,
      error: 'No match',
      status: 404,
    })

    // Long prompt with no brand name, no URL, no quoted strings, > 8 words
    // so the single-line fallback in extractOrganizationCandidate doesn't fire
    const profile = await enrichBrandProfile(
      'Build a modern dark landing page with a hero section, three feature cards, a pricing table, and a footer with links',
      workspace,
    )
    expect(profile).toBeNull()
    rmSync(workspace, { recursive: true, force: true })
  })
})

// ---------------------------------------------------------------------------
// Context phase
// ---------------------------------------------------------------------------

describe('Context phase', () => {
  beforeEach(() => {
    groqMock.mockReset()
  })

  it('generateContext: prompt → context with project name, tagline, site type', async () => {
    groqMock.mockResolvedValue({
      content: JSON.stringify({
        project_name: 'TaskFlow',
        slug: 'taskflow',
        tagline: 'Tasks done right',
        site_url: 'https://taskflow.app',
        site_type: 'saas',
        pages: ['Home', 'Features', 'Pricing'],
        entities: ['User', 'Task', 'Project'],
        features: ['auth', 'realtime', 'search'],
        mood: 'modern dark',
        color_direction: 'dark with blue accents',
        typography: 'Inter + Open Sans',
        style_keywords: 'glassmorphism, gradient',
      }),
      inputTokens: 100,
      outputTokens: 200,
      cost: 0.001,
    })

    const { generateContext } = await import('./phase-context.js')
    const workspace = mkWorkspace()
    const logs: string[] = []

    const result = await generateContext(
      'A SaaS task management app called TaskFlow',
      'Design brief with dark theme',
      'saas',
      workspace,
      (msg: string) => logs.push(msg),
    )

    expect(result.ctx.project_name).toBe('TaskFlow')
    expect(result.ctx.tagline).toBe('Tasks done right')
    expect(result.ctx.site_type).toBe('saas')
    expect(result.ctx.pages).toContain('Home')
    expect(result.ctx.entities).toContain('Task')
    expect(result.ctx.features).toContain('auth')
    expect(result.cost).toBe(0.001)

    // Persisted to workspace
    const persisted = JSON.parse(
      readFileSync(join(workspace, 'project-context.json'), 'utf8'),
    )
    expect(persisted.project_name).toBe('TaskFlow')
    expect(logs.join('\n')).toContain('successfully parsed')
    rmSync(workspace, { recursive: true, force: true })
  })

  it('entity/feature extraction: "booking system" → feature entity; "restaurant" → business entity', async () => {
    groqMock.mockResolvedValue({
      content: JSON.stringify({
        project_name: 'BistroBook',
        slug: 'bistrobook',
        tagline: 'Reserve your table',
        site_url: '',
        site_type: 'landing',
        pages: ['Home', 'Menu', 'Reserve'],
        entities: ['Restaurant', 'Reservation', 'Table'],
        features: ['booking system', 'calendar sync', 'sms reminders'],
        mood: 'warm elegant',
        color_direction: 'warm earthy tones',
      }),
      inputTokens: 80,
      outputTokens: 150,
      cost: 0.0008,
    })

    const { generateContext } = await import('./phase-context.js')
    const workspace = mkWorkspace()

    const result = await generateContext(
      'A restaurant booking system with table reservations',
      '',
      'landing',
      workspace,
      () => {},
    )

    expect(result.ctx.entities).toContain('Restaurant')
    expect(result.ctx.entities).toContain('Reservation')
    expect(result.ctx.features).toContain('booking system')
    expect(result.ctx.features).toContain('calendar sync')
    rmSync(workspace, { recursive: true, force: true })
  })

  it('mood/color inference: "luxury" → elegant mood; "playful" → vibrant mood', async () => {
    groqMock.mockResolvedValue({
      content: JSON.stringify({
        project_name: 'Luxe',
        slug: 'luxe',
        tagline: 'Timeless elegance',
        site_url: '',
        site_type: 'landing',
        pages: ['Home'],
        entities: [],
        features: [],
        mood: 'elegant luxury',
        color_direction: 'black and gold',
      }),
      inputTokens: 50,
      outputTokens: 100,
      cost: 0.0005,
    })

    const { generateContext } = await import('./phase-context.js')
    const workspace = mkWorkspace()

    const result = await generateContext(
      'A luxury brand landing page with elegant typography',
      'Design brief: black and gold, elegant serif headings',
      'landing',
      workspace,
      () => {},
    )

    expect(result.ctx.mood).toMatch(/elegant|luxury/)
    expect(result.ctx.color_direction).toMatch(/black|gold/)
    rmSync(workspace, { recursive: true, force: true })
  })

  it('falls back to default context when JSON parsing fails', async () => {
    groqMock.mockResolvedValue({
      content: 'This is not JSON at all',
      inputTokens: 10,
      outputTokens: 5,
      cost: 0.0001,
    })

    const { generateContext } = await import('./phase-context.js')
    const workspace = mkWorkspace()
    const logs: string[] = []

    const result = await generateContext(
      'A project called TestApp with dark theme',
      '',
      'landing',
      workspace,
      (msg: string) => logs.push(msg),
    )

    // Fallback uses promptSnippet for project_name (first 40 chars of prompt)
    expect(result.ctx.project_name).toBe(
      'A project called TestApp with dark theme',
    )
    expect(result.ctx.site_type).toBe('landing')
    expect(result.ctx.pages).toEqual(['Home'])
    expect(result.ctx.mood).toBe('modern dark')
    expect(logs.join('\n')).toContain('fallback')
    rmSync(workspace, { recursive: true, force: true })
  })

  it('strips stats markers that would break JSON parsing', async () => {
    groqMock.mockResolvedValue({
      content: `<|stats|>tokens: 123<|/stats|>{"project_name":"Clean","slug":"clean","tagline":"","site_url":"","site_type":"landing","pages":["Home"],"entities":[],"features":[],"mood":"modern","color_direction":"dark"}`,
      inputTokens: 10,
      outputTokens: 5,
      cost: 0.0001,
    })

    const { generateContext } = await import('./phase-context.js')
    const workspace = mkWorkspace()

    const result = await generateContext(
      'Clean app',
      '',
      'landing',
      workspace,
      () => {},
    )
    expect(result.ctx.project_name).toBe('Clean')
    rmSync(workspace, { recursive: true, force: true })
  })
})

// ---------------------------------------------------------------------------
// Design brief
// ---------------------------------------------------------------------------

describe('Design brief', () => {
  beforeEach(() => {
    groqMock.mockReset()
  })

  it('generateDesignBrief: prompt → brief with colors, typography, sections', async () => {
    const briefMarkdown = `### Colors
- Background: #0a0a0a
- Accent: #ff6b35

### Typography
- Heading: Syne
- Body: Inter

### Sections (homepage order)
1. Nav
2. Hero
3. Features
4. CTA`

    groqMock.mockResolvedValue({
      content: briefMarkdown,
      inputTokens: 200,
      outputTokens: 500,
      cost: 0.002,
    })

    const { generateDesignBrief } = await import('./phase-design.js')
    const workspace = mkWorkspace()
    const logs: string[] = []

    const result = await generateDesignBrief(
      'A bold SaaS landing page for a developer tool',
      workspace,
      (msg: string) => logs.push(msg),
    )

    expect(result.brief).toContain('### Colors')
    expect(result.brief).toContain('#ff6b35')
    expect(result.brief).toContain('### Typography')
    expect(result.brief).toContain('### Sections')
    expect(result.cost).toBe(0.002)

    // Persisted to workspace
    const persisted = readFileSync(join(workspace, 'design.md'), 'utf8')
    expect(persisted).toBe(briefMarkdown)
    expect(logs.join('\n')).toContain('design.md')
    rmSync(workspace, { recursive: true, force: true })
  })

  it('strips trailing markdown fences from the brief', async () => {
    groqMock.mockResolvedValue({
      content: '### Colors\n- Accent: blue\n```',
      inputTokens: 10,
      outputTokens: 20,
      cost: 0.001,
    })

    const { generateDesignBrief } = await import('./phase-design.js')
    const workspace = mkWorkspace()

    const result = await generateDesignBrief(
      'A simple page',
      workspace,
      () => {},
    )
    expect(result.brief).not.toContain('```')
    expect(result.brief).toContain('### Colors')
    rmSync(workspace, { recursive: true, force: true })
  })

  it('India mode: design brief generated successfully with indiaMode flag', async () => {
    groqMock.mockResolvedValue({
      content:
        '### Colors\n- Accent: saffron #FF9933\n\n### Typography\n- Heading: Cabinet Grotesk',
      inputTokens: 100,
      outputTokens: 300,
      cost: 0.0015,
    })

    const { generateDesignBrief } = (await import('./phase-design.js')) as {
      generateDesignBrief: (
        prompt: string,
        workspace: string,
        log: (msg: string) => void,
        indiaMode?: boolean | null,
      ) => Promise<{ brief: string }>
    }
    const workspace = mkWorkspace()

    const result = await generateDesignBrief(
      'An Indian ecommerce store for ethnic wear',
      workspace,
      () => {},
      true, // indiaMode
    )

    expect(result.brief).toContain('### Colors')
    // The groq call should have been made (indiaMode is passed through)
    expect(groqMock).toHaveBeenCalledTimes(1)
    rmSync(workspace, { recursive: true, force: true })
  })

  it('ecommerce site type → brief includes DTC retail depth sections', async () => {
    groqMock.mockResolvedValue({
      content:
        '### Sections (homepage order) — DTC retail depth\n1. Top promo strip\n2. Nav\n3. Hero',
      inputTokens: 100,
      outputTokens: 300,
      cost: 0.0015,
    })

    const { generateDesignBrief } = await import('./phase-design.js')
    const workspace = mkWorkspace()

    await generateDesignBrief(
      'An online store for healthy snacks with product cards',
      workspace,
      () => {},
    )

    // Verify the prompt sent to groq includes ecommerce-specific guidance
    const callArgs = groqMock.mock.calls[0]
    const userPrompt = String(callArgs?.[0] ?? '')
    expect(userPrompt).toContain('DTC retail depth')
    expect(userPrompt).toContain('Product card')
    rmSync(workspace, { recursive: true, force: true })
  })
})

// ---------------------------------------------------------------------------
// Site type detection
// ---------------------------------------------------------------------------

describe('Site type detection', () => {
  describe('detectSiteType (LLM-backed with heuristic shortcut)', () => {
    beforeEach(() => {
      groqMock.mockReset()
    })

    it('"online store" → commerce (heuristic shortcut, no LLM call)', async () => {
      const { detectSiteType } = await import('./phase-detect.js')
      const logs: string[] = []

      const result = await detectSiteType(
        'An online store for healthy snacks with checkout',
        (msg: string) => logs.push(msg),
      )

      expect(result.siteType).toBe('ecommerce')
      expect(result.cost).toBe(0)
      expect(groqMock).not.toHaveBeenCalled()
      expect(logs.join('\n')).toContain('heuristic')
    })

    it('"blog" → blog (heuristic shortcut)', async () => {
      const { detectSiteType } = await import('./phase-detect.js')
      const result = await detectSiteType(
        'A blog about travel stories',
        () => {},
      )
      expect(result.siteType).toBe('blog')
      expect(groqMock).not.toHaveBeenCalled()
    })

    it('"saas tool" → saas (heuristic shortcut)', async () => {
      const { detectSiteType } = await import('./phase-detect.js')
      const result = await detectSiteType(
        'A saas tool for project management',
        () => {},
      )
      expect(result.siteType).toBe('saas')
      expect(groqMock).not.toHaveBeenCalled()
    })

    it('"portfolio" → portfolio (heuristic shortcut)', async () => {
      const { detectSiteType } = await import('./phase-detect.js')
      const result = await detectSiteType(
        'A portfolio for a freelance designer',
        () => {},
      )
      expect(result.siteType).toBe('portfolio')
      expect(groqMock).not.toHaveBeenCalled()
    })

    it('falls back to LLM when heuristic cannot detect, then parses response', async () => {
      groqMock.mockResolvedValue({
        content: '"marketplace"',
        inputTokens: 10,
        outputTokens: 3,
        cost: 0.0001,
      })

      const { detectSiteType } = await import('./phase-detect.js')
      const result = await detectSiteType(
        'A platform connecting freelancers with clients',
        () => {},
      )

      expect(groqMock).toHaveBeenCalledTimes(1)
      expect(result.siteType).toBe('marketplace')
    })

    it('unknown type → generic landing fallback', async () => {
      groqMock.mockResolvedValue({
        content: 'something-unknown',
        inputTokens: 10,
        outputTokens: 3,
        cost: 0.0001,
      })

      const { detectSiteType } = await import('./phase-detect.js')
      const result = await detectSiteType('A weird thing', () => {})
      expect(result.siteType).toBe('landing')
    })

    it('strips quotes and whitespace from LLM response', async () => {
      groqMock.mockResolvedValue({
        content: '"  blog  "',
        inputTokens: 10,
        outputTokens: 3,
        cost: 0.0001,
      })

      const { detectSiteType } = await import('./phase-detect.js')
      const result = await detectSiteType(
        'A thing that is not heuristic',
        () => {},
      )
      expect(result.siteType).toBe('blog')
    })
  })

  describe('inferSiteTypeHint (heuristic detection from prompt keywords)', () => {
    it('detects ecommerce from "online store"', async () => {
      const { inferSiteTypeHint } = await import('../lib/infer-site-type.js')
      expect(inferSiteTypeHint('An online store for snacks')).toBe('ecommerce')
    })

    it('detects ecommerce from "shop"', async () => {
      const { inferSiteTypeHint } = await import('../lib/infer-site-type.js')
      expect(inferSiteTypeHint('A shop for handmade goods')).toBe('ecommerce')
    })

    it('detects blog from "blog"', async () => {
      const { inferSiteTypeHint } = await import('../lib/infer-site-type.js')
      expect(inferSiteTypeHint('A blog about cooking')).toBe('blog')
    })

    it('detects blog from "magazine"', async () => {
      const { inferSiteTypeHint } = await import('../lib/infer-site-type.js')
      expect(inferSiteTypeHint('An online magazine')).toBe('blog')
    })

    it('detects saas from "saas"', async () => {
      const { inferSiteTypeHint } = await import('../lib/infer-site-type.js')
      expect(inferSiteTypeHint('A saas platform')).toBe('saas')
    })

    it('detects portfolio from "portfolio"', async () => {
      const { inferSiteTypeHint } = await import('../lib/infer-site-type.js')
      expect(inferSiteTypeHint('A photographer portfolio')).toBe('portfolio')
    })

    it('detects dashboard from "dashboard"', async () => {
      const { inferSiteTypeHint } = await import('../lib/infer-site-type.js')
      expect(inferSiteTypeHint('An analytics dashboard')).toBe('dashboard')
    })

    it('detects institutional from "government"', async () => {
      const { inferSiteTypeHint } = await import('../lib/infer-site-type.js')
      expect(inferSiteTypeHint('A government portal')).toBe('institutional')
    })

    it('detects game from "game"', async () => {
      const { inferSiteTypeHint } = await import('../lib/infer-site-type.js')
      expect(inferSiteTypeHint('A 3d game arcade')).toBe('game')
    })

    it('returns null for unknown/generic prompts', async () => {
      const { inferSiteTypeHint } = await import('../lib/infer-site-type.js')
      expect(inferSiteTypeHint('A simple website')).toBeNull()
      expect(inferSiteTypeHint('')).toBeNull()
    })

    it('returns null for ambiguous prompts without clear keywords', async () => {
      const { inferSiteTypeHint } = await import('../lib/infer-site-type.js')
      expect(
        inferSiteTypeHint('A landing page for a consulting firm'),
      ).toBeNull()
    })
  })
})
