import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  SFF_HTML_SYSTEM_PROMPT,
  buildSffHtmlPrompt,
  ensureImagePreloadAsAttribute,
  isCompleteSffHtml,
  sanitizeSffHtml,
  stripDangerousScripts,
  stripInlineEventHandlers,
  stripJavascriptUrls,
  writeSffHtmlHome,
} from './phase-sff-html.ts'

const htmlFixture = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head>
<body><main><h1>Launch Ledger</h1></main></body>
</html>`

describe('phase-sff-html', () => {
  it('sanitizes fenced model output down to a complete document', () => {
    const html = sanitizeSffHtml(
      `Here is the file:\n\`\`\`html\n${htmlFixture}\n\`\`\`\nextra`,
    )

    expect(html).toBe(htmlFixture)
    expect(isCompleteSffHtml(html)).toBe(true)
  })

  it('builds the SFF-style brief with site planning context', () => {
    const prompt = buildSffHtmlPrompt({
      prompt: 'A website for a billing analytics product',
      siteSpec: {
        projectName: 'Launch Ledger',
        tagline: 'Finance clarity before lunch',
        siteType: 'saas',
        pages: [{ name: 'Home' }, { name: 'Pricing' }],
      },
      preferredLanguage: 'fr',
      imageHints: {
        photos: [
          {
            query: 'billing dashboard team',
            alt: 'Analysts reviewing billing metrics',
            url: 'https://images.pexels.com/photos/123/pexels-photo-123.jpeg',
          },
        ],
      },
      brandProfile: {
        verified: true,
        requestedName: 'Launch Ledger',
        officialName: 'Launch Ledger',
        logoUrl: 'https://cdn.brandfetch.io/launch/logo.svg',
        socials: [],
        sourceUrls: ['https://launchledger.test'],
      },
    })

    expect(prompt).toContain('A website for a billing analytics product')
    expect(prompt).toContain('Brand: Launch Ledger')
    expect(prompt).toContain('Tagline: Finance clarity before lunch')
    expect(prompt).toContain('Home, Pricing')
    expect(prompt).toContain('English only')
    expect(prompt).toContain('post-processing step')
    expect(prompt).not.toContain('Language:\nfr')
    expect(prompt).toContain('Verified Pexels media')
    expect(prompt).toContain(
      'https://images.pexels.com/photos/123/pexels-photo-123.jpeg',
    )
    expect(prompt).toContain('VERIFIED BRAND PROFILE')
    expect(prompt).toContain('https://cdn.brandfetch.io/launch/logo.svg')
  })

  // Regression: non-English locales caused the LLM to write image alt text and
  // /api/pexels query params in the locale (e.g. Malayalam), which made Pexels
  // return irrelevant images. The system prompt must force alt text + pexels
  // queries to English regardless of page content language.
  it('system prompt forces image alt text and pexels queries to English', () => {
    expect(SFF_HTML_SYSTEM_PROMPT).toMatch(/alt text.*English/i)
    expect(SFF_HTML_SYSTEM_PROMPT).toMatch(/pexels.*English/i)
  })

  it('system prompt forces visible copy to English even for non-English briefs', () => {
    expect(SFF_HTML_SYSTEM_PROMPT).toContain('ALL user-visible site copy')
    expect(SFF_HTML_SYSTEM_PROMPT).toContain('English only')
    expect(SFF_HTML_SYSTEM_PROMPT).toContain(
      'closest natural English equivalents',
    )
    expect(SFF_HTML_SYSTEM_PROMPT).toContain('post-processing')
  })

  it('passes the system prompt to the generator and injects the Lucide runtime when the model emits icon placeholders', async () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-sff-lucide-'))
    let capturedSystem: string | undefined
    const lucideHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head>
<body><main><i data-lucide="sparkles" class="w-5 h-5"></i></main></body>
</html>`

    try {
      await writeSffHtmlHome({
        workspace,
        prompt: 'A landing page with icons',
        siteSpec: { projectName: 'Icon Co' },
        sessionCtx: { broadcast: () => {} },
        generateHtml: async ({ system, onToken }) => {
          capturedSystem = system
          onToken?.('<!DOCTYPE html>', '<!DOCTYPE html>')
          onToken?.(lucideHtml.slice('<!DOCTYPE html>'.length), lucideHtml)
          return { content: lucideHtml, cost: 0.001 }
        },
      })

      // The system prompt must be wired through to the model call — if someone
      // forgets to pass it, generation runs without the SFF rules.
      expect(capturedSystem).toBe(SFF_HTML_SYSTEM_PROMPT)

      // The Lucide runtime must be injected into the persisted file so the
      // placeholder actually renders. Catches breakage in the
      // ensureLucideIconRuntime integration.
      const written = readFileSync(join(workspace, 'index.html'), 'utf8')
      expect(written).toContain('unpkg.com/lucide@latest')
      expect(written).toContain('sf-lucide-bootstrap')
      expect(written).toContain('data-lucide="sparkles"')
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('writes index.html and the persisted module source as raw SFF HTML', async () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-sff-html-'))
    const events: unknown[] = []

    const stats = await writeSffHtmlHome({
      workspace,
      prompt: 'A landing page for Launch Ledger',
      siteSpec: { projectName: 'Launch Ledger' },
      sessionCtx: { broadcast: (event) => events.push(event) },
      generateHtml: async ({ onToken }) => {
        onToken?.('<!DOCTYPE html>', '<!DOCTYPE html>')
        onToken?.(htmlFixture.slice('<!DOCTYPE html>'.length), htmlFixture)
        return { content: htmlFixture, cost: 0.001 }
      },
    })

    expect(readFileSync(join(workspace, 'index.html'), 'utf8')).toBe(
      htmlFixture,
    )
    expect(readFileSync(join(workspace, 'home.openui'), 'utf8')).toBe(
      htmlFixture,
    )
    expect(stats).toEqual({ chars: htmlFixture.length, cost: 0.001 })
    expect(events).toHaveLength(2)
  })

  it('translates persisted SFF HTML after English generation when locale needs translation', async () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-sff-translated-'))
    const translatedHtml = htmlFixture.replace('Launch Ledger', 'लन्च लेजर')
    const logs: string[] = []
    let translatedInput = ''

    try {
      const stats = await writeSffHtmlHome({
        workspace,
        prompt: 'मेरो कुकुर ब्लगको लागि वेबसाइट बनाउनुहोस्',
        siteSpec: { projectName: 'Dog Blog' },
        languageMode: {
          code: 'ne',
          name: 'Nepali',
          nativeName: 'नेपाली',
          script: 'Devanagari',
          needsTranslation: true,
        },
        log: (message) => logs.push(message),
        sessionCtx: { broadcast: () => {} },
        generateHtml: async ({ onToken }) => {
          onToken?.('<!DOCTYPE html>', '<!DOCTYPE html>')
          onToken?.(htmlFixture.slice('<!DOCTYPE html>'.length), htmlFixture)
          return { content: htmlFixture, cost: 0.001 }
        },
        translateHtmlContent: async (html, languageMode) => {
          translatedInput = html
          if (!languageMode) throw new Error('Expected language mode')
          expect(languageMode.code).toBe('ne')
          return { content: translatedHtml, translatedCount: 1 }
        },
      })

      expect(translatedInput).toBe(htmlFixture)
      expect(readFileSync(join(workspace, 'index.html'), 'utf8')).toBe(
        translatedHtml,
      )
      expect(readFileSync(join(workspace, 'home.openui'), 'utf8')).toBe(
        translatedHtml,
      )
      expect(stats).toEqual({ chars: translatedHtml.length, cost: 0.001 })
      expect(
        logs.some((message) => message.includes('translated preview to ne')),
      ).toBe(true)
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('stripDangerousScripts removes inline script tags', () => {
    const html = `<div><script>alert('xss')</script></div>`
    expect(stripDangerousScripts(html)).toBe('<div></div>')
  })

  it('stripDangerousScripts removes external script tags', () => {
    const html = `<div><script src="https://evil.com/attack.js"></script></div>`
    expect(stripDangerousScripts(html)).toBe('<div></div>')
  })

  it('stripDangerousScripts preserves CDN scripts from trusted domains', () => {
    const html = `<head><script src="https://cdn.tailwindcss.com"></script></head>`
    expect(stripDangerousScripts(html)).toBe(html)
  })

  it('stripInlineEventHandlers removes onclick', () => {
    const html = `<div onclick="alert(1)">Click</div>`
    expect(stripInlineEventHandlers(html)).toBe('<div>Click</div>')
  })

  it('stripInlineEventHandlers removes onload, onerror, onmouseover', () => {
    const html = `<img src="x" onload="alert(1)" onerror="alert(2)" onmouseover="alert(3)">`
    const result = stripInlineEventHandlers(html)
    expect(result).not.toContain('onload')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('onmouseover')
    expect(result).toContain('<img src="x">')
  })

  it('stripJavascriptUrls neutralizes javascript: in href', () => {
    const html = `<a href="javascript:alert(1)">link</a>`
    const result = stripJavascriptUrls(html)
    expect(result).not.toContain('javascript:')
    expect(result).toContain('href="#"')
  })

  it('stripJavascriptUrls neutralizes javascript: in src', () => {
    const html = `<img src="javascript:alert(1)">`
    const result = stripJavascriptUrls(html)
    expect(result).not.toContain('javascript:')
    expect(result).toContain('src="#"')
  })

  it('sanitizeSffHtml end-to-end: strips scripts + handlers + js: URLs', () => {
    const raw = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><script>alert('xss')</script></head>
<body><div onclick="alert(1)"><a href="javascript:alert(1)">link</a></div></body>
</html>`
    const result = sanitizeSffHtml(raw)
    expect(result).not.toContain('<script')
    expect(result).not.toContain('onclick')
    expect(result).not.toContain('javascript:')
    expect(isCompleteSffHtml(result)).toBe(true)
  })

  it('sanitizeSffHtml preserves safe content', () => {
    const raw = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head>
<body><div class="hero"><span>Launch Ledger</span></div></body>
</html>`
    const result = sanitizeSffHtml(raw)
    expect(result).toContain('<div class="hero">')
    expect(result).toContain('<span>Launch Ledger</span>')
    expect(result).toContain(
      '<script src="https://cdn.tailwindcss.com"></script>',
    )
    expect(isCompleteSffHtml(result)).toBe(true)
  })

  it('ensureImagePreloadAsAttribute adds as="image" to pexels preload links missing it', () => {
    const html = `<head><link rel="preload" href="/api/pexels?query=portrait+photography&w=100&h=100&seed=test"></head>`
    const result = ensureImagePreloadAsAttribute(html)
    expect(result).toContain('as="image"')
    expect(result).toContain('/api/pexels?query=portrait+photography')
  })

  it('ensureImagePreloadAsAttribute adds as="image" to image file extension preload links', () => {
    const html = `<head><link rel="preload" href="https://example.com/photo.jpg"></head>`
    const result = ensureImagePreloadAsAttribute(html)
    expect(result).toContain('as="image"')
  })

  it('ensureImagePreloadAsAttribute preserves existing as attribute', () => {
    const html = `<head><link rel="preload" as="image" href="/api/pexels?query=test&w=100&h=100&seed=test"></head>`
    const result = ensureImagePreloadAsAttribute(html)
    // Should not duplicate the as attribute
    const asCount = (result.match(/\bas\s*=\s*["']image["']/gi) || []).length
    expect(asCount).toBe(1)
  })

  it('ensureImagePreloadAsAttribute does not modify non-image preload links', () => {
    const html = `<head><link rel="preload" href="https://example.com/style.css"></head>`
    const result = ensureImagePreloadAsAttribute(html)
    expect(result).not.toContain('as="image"')
  })

  it('ensureImagePreloadAsAttribute does not modify non-preload links', () => {
    const html = `<head><link rel="stylesheet" href="/api/pexels?query=test&w=100&h=100&seed=test"></head>`
    const result = ensureImagePreloadAsAttribute(html)
    expect(result).not.toContain('as="image"')
  })

  it('ensureImagePreloadAsAttribute handles self-closing and spaced link tags', () => {
    const html = `<link rel="preload" href="/api/pexels?query=test&w=100&h=100&seed=test" />`
    const result = ensureImagePreloadAsAttribute(html)
    expect(result).toContain('as="image"')
  })

  it('sanitizeSffHtml adds as="image" to pexels preload links end-to-end', () => {
    const raw = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script><link rel="preload" href="/api/pexels?query=portrait+photography+confident+businessman+laptop&w=100&h=100&seed=Portrait+of+confident+businessman+with+laptop"></head>
<body><main><h1>Test</h1></main></body>
</html>`
    const result = sanitizeSffHtml(raw)
    expect(result).toContain('as="image"')
    expect(isCompleteSffHtml(result)).toBe(true)
  })
})
