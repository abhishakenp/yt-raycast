import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  scoreRalphHomepage,
  passesHomepagePublicDesignVerification,
} from './ralph-homepage-score'

const TMP_DIR = join(tmpdir(), `ralph-test-${Date.now()}`)

beforeEach(() => {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })
})

afterEach(() => {
  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true })
})

/** Builds a good homepage that should score 100. */
function goodHomepage(): string {
  const sections = Array.from({ length: 8 }, (_, i) => {
    const items = Array.from(
      { length: 30 },
      (_n, j) =>
        `<div class="item-${j}"><p>item${i * 30 + j} value${j} desc${i}</p></div>`,
    ).join('\n')
    return `<section id="sec${i}"><h2>Section ${i}</h2>${items}</section>`
  }).join('\n')
  const nav = Array.from(
    { length: 10 },
    (_, i) => `<a href="/page${i}">Link ${i}</a>`,
  ).join('\n')
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="/scripts/tailwind-browser.js"></script>
<script>tailwind.config = { theme: { extend: { colors: { brand: '#000' } } } }</script>
</head><body>
<header><nav>${nav}</nav></header>
<main>
<h1>Welcome to the Homepage</h1>
${sections}
</main>
<footer>Footer with links and content for the page bottom section</footer>
<script>
document.querySelector('[data-mobile-nav-toggle]')?.addEventListener('click', function() { this.classList.toggle('open'); });
document.querySelector('[data-accordion]')?.addEventListener('click', function() { this.classList.toggle('expanded'); });
var navToggle = document.querySelector('[data-mobile-nav-toggle]');
if (navToggle) { navToggle.addEventListener('keydown', function(e) { if (e.key === 'Enter') { this.click(); } }); }
</script>
<button data-mobile-nav-toggle>Menu</button>
<div data-accordion>Accordion</div>
</body></html>`
}

describe('scoreRalphHomepage', () => {
  describe('empty html', () => {
    it('returns ok=false, score=0 for empty string', () => {
      const result = scoreRalphHomepage('')
      expect(result.ok).toBe(false)
      expect(result.score).toBe(0)
      expect(result.reasons).toContain('empty html')
    })

    it('returns ok=false, score=0 for null-ish html', () => {
      const result = scoreRalphHomepage(null as unknown as string)
      expect(result.ok).toBe(false)
      expect(result.score).toBe(0)
    })
  })

  describe('degenerate html', () => {
    it('returns ok=false for degenerate (short) html', () => {
      const result = scoreRalphHomepage('<html><body>hi</body></html>')
      expect(result.ok).toBe(false)
      expect(result.reasons).toContain('htmlLooksDegenerate')
    })

    it('returns ok=false for degenerate html with nova prompt', () => {
      const result = scoreRalphHomepage('<html><body>short</body></html>', {
        prompt: 'a saas landing page',
      })
      expect(result.ok).toBe(false)
    })
  })

  describe('good html', () => {
    it('returns ok=true, score=100 for good html with all checks passing', () => {
      const html = goodHomepage()
      expect(html.length).toBeGreaterThanOrEqual(10000)
      const result = scoreRalphHomepage(html)
      expect(result.score).toBe(100)
      expect(result.ok).toBe(true)
      expect(result.reasons).toEqual([])
    })
  })

  describe('missing tailwind', () => {
    it('reduces score when tailwind runtime missing', () => {
      const html = goodHomepage().replace(
        /<script src="\/scripts\/tailwind-browser\.js"><\/script>/,
        '',
      )
      const result = scoreRalphHomepage(html)
      expect(result.score).toBeLessThan(100)
      expect(result.ok).toBe(false)
      expect(
        result.reasons.some((r) => r.includes('missing Tailwind runtime')),
      ).toBe(true)
    })
  })

  describe('missing hooks', () => {
    it('reduces score when no data-* hooks present', () => {
      const html = goodHomepage()
        .replace(/data-mobile-nav-toggle/g, 'data-nothing')
        .replace(/data-accordion/g, 'data-nothing')
      const result = scoreRalphHomepage(html)
      expect(result.score).toBeLessThan(100)
      expect(result.ok).toBe(false)
      expect(
        result.reasons.some((r) => r.includes('missing wired data-* hooks')),
      ).toBe(true)
    })
  })

  describe('refPath with existing file', () => {
    it('applies ref-tight scoring when refPath exists and refTight=true', () => {
      const refHtml = goodHomepage()
      const refPath = join(TMP_DIR, 'ref.html')
      writeFileSync(refPath, refHtml)
      const html = goodHomepage()
      const result = scoreRalphHomepage(html, {
        refPath,
        refTight: true,
      })
      // With refTight, the score may be reduced if sections/length don't match
      // But a good homepage should still score reasonably
      expect(typeof result.score).toBe('number')
      expect(Array.isArray(result.reasons)).toBe(true)
    })

    it('applies non-tight scoring when refPath exists and refTight=false', () => {
      const refHtml = goodHomepage()
      const refPath = join(TMP_DIR, 'ref.html')
      writeFileSync(refPath, refHtml)
      const html = goodHomepage()
      const result = scoreRalphHomepage(html, {
        refPath,
        refTight: false,
      })
      expect(typeof result.score).toBe('number')
    })

    it('ignores refPath when file does not exist', () => {
      const html = goodHomepage()
      const result = scoreRalphHomepage(html, {
        refPath: '/nonexistent/path/ref.html',
      })
      expect(result.score).toBe(100)
      expect(result.ok).toBe(true)
    })
  })
})

describe('passesHomepagePublicDesignVerification', () => {
  it('returns ok=false for empty html without refPath', () => {
    const result = passesHomepagePublicDesignVerification('', '', '')
    expect(result.ok).toBe(false)
  })

  it('returns ok=true for good html without refPath', () => {
    const html = goodHomepage()
    const result = passesHomepagePublicDesignVerification(html, '', '')
    expect(result.ok).toBe(true)
    expect(result.feedback).toBe('')
  })

  it('returns ok=false for degenerate html without refPath', () => {
    const result = passesHomepagePublicDesignVerification(
      '<html><body>hi</body></html>',
      '',
      '',
    )
    expect(result.ok).toBe(false)
  })

  it('returns ok=true for good html with existing refPath', () => {
    const refHtml = goodHomepage()
    const refPath = join(TMP_DIR, 'ref.html')
    writeFileSync(refPath, refHtml)
    const html = goodHomepage()
    const result = passesHomepagePublicDesignVerification(html, '', refPath)
    expect(result.ok).toBe(true)
  })

  it('returns ok=false when quality audit finds issues', () => {
    // Good html but missing viewport meta will cause quality audit to fail
    const html = goodHomepage().replace(/<meta name="viewport"[^>]*>/, '')
    const result = passesHomepagePublicDesignVerification(html, '', '')
    expect(result.ok).toBe(false)
    expect(result.feedback).toContain('Quality audit')
  })

  it('ignores non-existent refPath', () => {
    const html = goodHomepage()
    const result = passesHomepagePublicDesignVerification(
      html,
      '',
      '/nonexistent/ref.html',
    )
    expect(result.ok).toBe(true)
  })
})
