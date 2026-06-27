import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
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
})
