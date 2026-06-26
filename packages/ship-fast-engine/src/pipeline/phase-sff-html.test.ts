import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  SFF_HTML_SYSTEM_PROMPT,
  buildSffHtmlPrompt,
  isCompleteSffHtml,
  sanitizeSffHtml,
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
    expect(prompt).toContain('fr')
    expect(prompt).toContain('Verified Pexels media')
    expect(prompt).toContain(
      'https://images.pexels.com/photos/123/pexels-photo-123.jpeg',
    )
    expect(prompt).toContain('VERIFIED BRAND PROFILE')
    expect(prompt).toContain('https://cdn.brandfetch.io/launch/logo.svg')
  })

  it('keeps SFF generation aligned with Pexels, Brandfetch, and Lucide instead of long SVG pictograms', () => {
    expect(SFF_HTML_SYSTEM_PROMPT).toContain('verified Pexels media')
    expect(SFF_HTML_SYSTEM_PROMPT).toContain('Brandfetch/brand-profile')
    expect(SFF_HTML_SYSTEM_PROMPT).toContain('Lucide placeholders')
    expect(SFF_HTML_SYSTEM_PROMPT).toContain(
      'do not generate long inline SVG pictogram sets',
    )
    expect(SFF_HTML_SYSTEM_PROMPT).not.toContain(
      'images.unsplash.com or picsum.photos',
    )
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
})
