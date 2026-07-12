import { describe, expect, it } from 'vitest'
import { collectHomepageQualityIssues } from './homepage-quality-audit'

/**
 * Builds a minimal valid SaaS homepage that passes most quality checks,
 * then lets tests selectively remove/alter pieces.
 */
function buildGoodHomepage(
  opts: {
    siteType?: string
    prompt?: string
    extraBody?: string
    withNovaVisual?: boolean
  } = {},
): string {
  const {
    siteType = 'saas',
    prompt = '',
    extraBody = '',
    withNovaVisual = false,
  } = opts

  const novaVisual = withNovaVisual
    ? `
    <canvas id="hero-canvas"></canvas>
    <div class="blur-3xl"></div>
    <div style="background:radial-gradient(...)"></div>
    <div style="background:radial-gradient(...)"></div>
    <div style="background:radial-gradient(...)"></div>
    <div data-reveal></div>
    <div data-reveal></div>
    <div data-reveal></div>
    <div data-reveal></div>
    <button data-magnet>Get Started</button>
    <button data-magnet>Learn More</button>
    <div class="animate-liquid" style="animation:liquid 8s ease-in-out infinite"></div>
    <script>
    tailwind.config = { theme: { extend: { keyframes: { liquid: {} } } } }
    </script>
    <div class="skew-x-12"></div>
    `
    : ''

  const links = Array.from(
    { length: 10 },
    (_, i) => `<a href="/page${i}">Link ${i}</a>`,
  ).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="/scripts/tailwind-browser.js"></script>
  <script>
  tailwind.config = { theme: { extend: { colors: {}, fontFamily: {} } } }
  </script>
</head>
<body>
  <h1>Welcome to Acme</h1>
  <button>Sign Up</button>
  <button>Log In</button>
  <button>Contact</button>
  ${links}
  <script>
  document.querySelector('button').addEventListener('click', () => { console.log('clicked'); });
  </script>
  ${novaVisual}
  ${extraBody}
</body>
</html>`
}

describe('collectHomepageQualityIssues', () => {
  describe('empty / null html', () => {
    it('returns issues for empty string html', () => {
      const issues = collectHomepageQualityIssues('', { siteType: 'saas' })
      expect(issues.length).toBeGreaterThan(0)
      expect(issues).toContain('missing viewport meta in head')
    })

    it('returns issues for null-ish html (coerced to empty)', () => {
      const issues = collectHomepageQualityIssues(null as unknown as string, {
        siteType: 'saas',
      })
      expect(issues.length).toBeGreaterThan(0)
    })

    it('returns issues for undefined html (coerced to empty)', () => {
      const issues = collectHomepageQualityIssues(
        undefined as unknown as string,
        { siteType: 'saas' },
      )
      expect(issues.length).toBeGreaterThan(0)
    })
  })

  describe('viewport meta', () => {
    it('detects missing viewport meta', () => {
      const html = `<!DOCTYPE html><html><head></head><body><h1>Hi</h1><button>a</button><button>b</button><button>c</button><a href="/x">x</a><script src="/scripts/tailwind-browser.js"></script><script>tailwind.config={theme:{extend:{colors:{}}}}</script><script>var x=1;var y=2;var z=3;</script></body></html>`
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(issues).toContain('missing viewport meta in head')
    })
  })

  describe('h1 elements', () => {
    it('detects missing h1', () => {
      const html = buildGoodHomepage()
      const noH1 = html.replace(/<h1>.*?<\/h1>/, '')
      const issues = collectHomepageQualityIssues(noH1, { siteType: 'saas' })
      expect(issues).toContain('missing <h1>')
    })

    it('detects too many h1 for non-dashboard site', () => {
      const html = buildGoodHomepage().replace(
        '<h1>Welcome to Acme</h1>',
        '<h1>H1</h1><h1>H2</h1><h1>H3</h1>',
      )
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(issues).toContain('too many <h1> elements (want 1 primary)')
    })

    it('allows more h1 for dashboard site type', () => {
      const h1s = Array.from({ length: 10 }, () => '<h1>Title</h1>').join('')
      const html = buildGoodHomepage({ siteType: 'dashboard' }).replace(
        '<h1>Welcome to Acme</h1>',
        h1s,
      )
      const issues = collectHomepageQualityIssues(html, {
        siteType: 'dashboard',
      })
      expect(issues).not.toContain('too many <h1> elements (want 1 primary)')
    })

    it('allows more h1 for docs site type', () => {
      const h1s = Array.from({ length: 10 }, () => '<h1>Title</h1>').join('')
      const html = buildGoodHomepage({ siteType: 'docs' }).replace(
        '<h1>Welcome to Acme</h1>',
        h1s,
      )
      const issues = collectHomepageQualityIssues(html, { siteType: 'docs' })
      expect(issues).not.toContain('too many <h1> elements (want 1 primary)')
    })

    it('still caps h1 for dashboard at 24', () => {
      const h1s = Array.from({ length: 25 }, () => '<h1>Title</h1>').join('')
      const html = buildGoodHomepage({ siteType: 'dashboard' }).replace(
        '<h1>Welcome to Acme</h1>',
        h1s,
      )
      const issues = collectHomepageQualityIssues(html, {
        siteType: 'dashboard',
      })
      expect(issues).toContain('too many <h1> elements (cap for sanity)')
    })
  })

  describe('game site type', () => {
    it('returns no issues for game site type', () => {
      const issues = collectHomepageQualityIssues('', { siteType: 'game' })
      expect(issues).toEqual([])
    })
  })

  describe('tailwind runtime', () => {
    it('detects missing Tailwind runtime', () => {
      const html = buildGoodHomepage().replace(
        /<script src="\/scripts\/tailwind-browser\.js"><\/script>/,
        '',
      )
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(issues).toContain(
        'missing Tailwind runtime (/scripts/tailwind-browser.js)',
      )
    })

    it('detects missing theme.extend when tailwind runtime present', () => {
      const html = buildGoodHomepage().replace(
        /tailwind\.config = \{ theme: \{ extend: \{ colors: \{\}, fontFamily: \{\} \} \} \}/,
        'tailwind.config = { theme: { colors: {} } }',
      )
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(issues).toContain(
        'tailwind.config missing theme.extend (colors/fonts/shadows)',
      )
    })
  })

  describe('href="#" placeholders', () => {
    it('detects too many href="#" placeholders (>55)', () => {
      const anchors = Array.from(
        { length: 60 },
        () => '<a href="#">link</a>',
      ).join('\n')
      const html = buildGoodHomepage().replace(
        /<a href="\/page\d">Link \d<\/a>/g,
        '',
      )
      const withAnchors = html.replace('</body>', `${anchors}</body>`)
      const issues = collectHomepageQualityIssues(withAnchors, {
        siteType: 'saas',
      })
      expect(
        issues.some((i) => i.startsWith('too many href="#" placeholders')),
      ).toBe(true)
    })
  })

  describe('inline scripts', () => {
    it('detects insufficient inline scripts (<280 chars)', () => {
      const html = buildGoodHomepage().replace(
        /<script>\s*document\.querySelector.*?\)\;\s*<\/script>/s,
        '<script>var a=1;</script>',
      )
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(issues).toContain(
        'homepage needs a substantive inline <script> (vanilla JS for nav/pricing/FAQ/carousel)',
      )
    })
  })

  describe('buttons', () => {
    it('detects too few buttons for saas (needs 3)', () => {
      const html = buildGoodHomepage().replace(
        /<button>Sign Up<\/button>\s*<button>Log In<\/button>\s*<button>Contact<\/button>/,
        '<button>Sign Up</button>',
      )
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(issues.some((i) => i.startsWith('too few <button>'))).toBe(true)
    })

    it('detects too few buttons for docs (needs 2)', () => {
      const html = buildGoodHomepage({ siteType: 'docs' }).replace(
        /<button>Sign Up<\/button>\s*<button>Log In<\/button>\s*<button>Contact<\/button>/,
        '<button>Docs</button>',
      )
      const issues = collectHomepageQualityIssues(html, { siteType: 'docs' })
      expect(issues.some((i) => i.startsWith('too few <button>'))).toBe(true)
    })
  })

  describe('links', () => {
    it('detects too few links for saas (needs 8)', () => {
      const html = buildGoodHomepage().replace(
        /<a href="\/page\d">Link \d<\/a>/g,
        '',
      )
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(
        issues.some((i) => i.startsWith('too few navigational links')),
      ).toBe(true)
    })

    it('detects too few links for dashboard (needs 2)', () => {
      const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width"><script src="/scripts/tailwind-browser.js"></script><script>tailwind.config={theme:{extend:{colors:{}}}}</script></head><body><h1>Dashboard</h1><button>a</button><button>b</button><button>c</button><script>var x=1;var y=2;var z=3;var w=4;</script></body></html>`
      const issues = collectHomepageQualityIssues(html, {
        siteType: 'dashboard',
      })
      expect(
        issues.some((i) => i.startsWith('too few navigational links')),
      ).toBe(true)
    })
  })

  describe('placeholder text', () => {
    it('detects lorem ipsum', () => {
      const html = buildGoodHomepage().replace(
        '</body>',
        '<p>Lorem ipsum dolor sit amet consectetur adipiscing elit</p></body>',
      )
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(issues).toContain('remove lorem ipsum placeholder copy')
    })

    it('detects generic placeholder text', () => {
      const html = buildGoodHomepage().replace(
        '</body>',
        '<p>This is placeholder text for the page</p></body>',
      )
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(issues).toContain('remove generic placeholder copy')
    })
  })

  describe('ecommerce cart wiring', () => {
    it('detects missing cart wiring when prompt mentions ecommerce', () => {
      const html = buildGoodHomepage({ siteType: 'saas' })
      const issues = collectHomepageQualityIssues(html, {
        siteType: 'saas',
        prompt: 'an ecommerce store with shopping cart',
      })
      expect(issues.some((i) => i.startsWith('ecommerce:'))).toBe(true)
    })

    it('detects missing cart wiring when siteType is ecommerce', () => {
      const html = buildGoodHomepage({ siteType: 'ecommerce' })
      const issues = collectHomepageQualityIssues(html, {
        siteType: 'ecommerce',
      })
      expect(issues.some((i) => i.startsWith('ecommerce:'))).toBe(true)
    })

    it('does not flag cart wiring when data-cart present', () => {
      const html = buildGoodHomepage({ siteType: 'ecommerce' }).replace(
        '</body>',
        '<button data-open-drawer>Cart</button></body>',
      )
      const issues = collectHomepageQualityIssues(html, {
        siteType: 'ecommerce',
      })
      expect(issues.some((i) => i.startsWith('ecommerce:'))).toBe(false)
    })
  })

  describe('nova visual craft issues', () => {
    it('returns nova issues for saas site type', () => {
      const html = buildGoodHomepage({ siteType: 'saas' })
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(issues.some((i) => i.includes('Nova-tier'))).toBe(true)
    })

    it('returns nova issues for landing site type', () => {
      const html = buildGoodHomepage({ siteType: 'landing' })
      const issues = collectHomepageQualityIssues(html, { siteType: 'landing' })
      expect(issues.some((i) => i.includes('Nova-tier'))).toBe(true)
    })

    it('returns nova issues for portfolio site type', () => {
      const html = buildGoodHomepage({ siteType: 'portfolio' })
      const issues = collectHomepageQualityIssues(html, {
        siteType: 'portfolio',
      })
      expect(issues.some((i) => i.includes('Nova-tier'))).toBe(true)
    })

    it('returns nova issues for blog site type', () => {
      const html = buildGoodHomepage({ siteType: 'blog' })
      const issues = collectHomepageQualityIssues(html, { siteType: 'blog' })
      expect(issues.some((i) => i.includes('Nova-tier'))).toBe(true)
    })

    it('returns nova issues for marketplace site type', () => {
      const html = buildGoodHomepage({ siteType: 'marketplace' })
      const issues = collectHomepageQualityIssues(html, {
        siteType: 'marketplace',
      })
      expect(issues.some((i) => i.includes('Nova-tier'))).toBe(true)
    })

    it('returns nova issues for community site type', () => {
      const html = buildGoodHomepage({ siteType: 'community' })
      const issues = collectHomepageQualityIssues(html, {
        siteType: 'community',
      })
      expect(issues.some((i) => i.includes('Nova-tier'))).toBe(true)
    })

    it('detects missing canvas', () => {
      const html = buildGoodHomepage({ siteType: 'saas' })
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(
        issues.some((i) => i.includes('Nova-tier marketing: add a <canvas>')),
      ).toBe(true)
    })

    it('detects missing blur layers', () => {
      const html = buildGoodHomepage({ siteType: 'saas' })
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(
        issues.some((i) => i.includes('Nova-tier: stack multiple blurred')),
      ).toBe(true)
    })

    it('detects insufficient radial-gradient stacks', () => {
      const html = buildGoodHomepage({ siteType: 'saas' })
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(
        issues.some((i) => i.includes('Nova-tier: need >=3 radial-gradient')),
      ).toBe(true)
    })

    it('detects insufficient data-reveal blocks', () => {
      const html = buildGoodHomepage({ siteType: 'saas' })
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(
        issues.some((i) => i.includes('Nova-tier: need >=4 scroll-reveal')),
      ).toBe(true)
    })

    it('detects insufficient data-magnet blocks', () => {
      const html = buildGoodHomepage({ siteType: 'saas' })
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(
        issues.some((i) => i.includes('Nova-tier: wire data-magnet')),
      ).toBe(true)
    })

    it('detects missing liquid motion', () => {
      const html = buildGoodHomepage({ siteType: 'saas' })
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(
        issues.some((i) =>
          i.includes('Nova-tier: theme.extend.keyframes + slow ambient'),
        ),
      ).toBe(true)
    })

    it('detects missing diagonal energy', () => {
      const html = buildGoodHomepage({ siteType: 'saas' })
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(
        issues.some((i) => i.includes('Nova-tier: add diagonal energy')),
      ).toBe(true)
    })

    it('detects contrast issue with text-slate-500 on marketing paragraphs', () => {
      const html = buildGoodHomepage({ siteType: 'saas' }).replace(
        '</body>',
        '<p class="text-lg text-slate-500">Some marketing copy here</p></body>',
      )
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(issues.some((i) => i.startsWith('contrast:'))).toBe(true)
    })

    it('does not return nova issues for non-nova site types (ecommerce)', () => {
      const html = buildGoodHomepage({ siteType: 'ecommerce' })
      const issues = collectHomepageQualityIssues(html, {
        siteType: 'ecommerce',
      })
      expect(issues.some((i) => i.includes('Nova-tier'))).toBe(false)
    })

    it('does not return nova issues for dashboard site type', () => {
      const html = buildGoodHomepage({ siteType: 'dashboard' })
      const issues = collectHomepageQualityIssues(html, {
        siteType: 'dashboard',
      })
      expect(issues.some((i) => i.includes('Nova-tier'))).toBe(false)
    })

    it('does not return nova issues for docs site type', () => {
      const html = buildGoodHomepage({ siteType: 'docs' })
      const issues = collectHomepageQualityIssues(html, { siteType: 'docs' })
      expect(issues.some((i) => i.includes('Nova-tier'))).toBe(false)
    })

    it('passes all nova visual checks when fully satisfied', () => {
      const html = buildGoodHomepage({
        siteType: 'saas',
        withNovaVisual: true,
      })
      const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
      expect(issues.some((i) => i.includes('Nova-tier'))).toBe(false)
    })
  })
})
