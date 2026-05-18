/**
 * Render audit — Playwright pass that catches "structurally valid but visually
 * broken" pages: empty bands, low-contrast body text, console errors,
 * missing fonts.
 *
 * Returns { ok, issues[], shotPath }.
 *
 * Caller hands a static URL (forge-loop already runs an http server on the
 * iter directory). We screenshot inside this audit so callers don't need a
 * separate shot pass.
 */
import { existsSync } from 'node:fs'

function relLuminance({ r, g, b }) {
  const toLin = (c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
}

function contrast(a, b) {
  const la = relLuminance(a)
  const lb = relLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

function parseRgb(str) {
  const m = String(str || '').match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const parts = m[1].split(',').map((s) => parseFloat(s.trim()))
  if (parts.length < 3) return null
  const [r, g, b, a = 1] = parts
  return { r, g, b, a }
}

export async function renderAudit({ url, shotPath, page, siteType = 'saas' }) {
  const issues = []
  const consoleErrors = []
  let ownPage = false
  if (!page) throw new Error('renderAudit requires a Playwright page')

  // Ignore CDN/font network errors — those are network conditions, not author bugs.
  const isNetworkNoise = (s) =>
    /ERR_CONNECTION_CLOSED|ERR_NAME_NOT_RESOLVED|net::ERR_|Failed to load resource|fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.tailwindcss\.com|unpkg\.com\/lucide|cdnjs\.cloudflare\.com/i.test(
      s || '',
    )
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (isNetworkNoise(text)) return
    consoleErrors.push(text.slice(0, 200))
  })
  page.on('pageerror', (err) => {
    if (isNetworkNoise(err.message)) return
    consoleErrors.push(`pageerror: ${err.message?.slice(0, 200)}`)
  })

  // Use 'load' rather than 'networkidle' — homepages with Tailwind CDN +
  // Lucide + Google Fonts often have lingering background fetches that
  // never reach networkidle within 20s but don't block visual readiness.
  await page.goto(url, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(2200)
  // Force reveal-ready state and trigger any IntersectionObserver-based reveals so we measure
  // post-reveal heights (otherwise data-reveal blocks may carry opacity-0 / translate-y-8 and
  // the audit incorrectly thinks the page has empty bands).
  await page.evaluate(() => {
    document.documentElement.classList.add('reveal-ready')
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.classList.add('is-visible')
      el.classList.remove('opacity-0', 'translate-y-8', 'translate-y-4', 'translate-y-2')
      el.style.opacity = '1'
      el.style.transform = 'none'
    })
    // Auto-scroll once to trigger any custom IntersectionObserver wiring.
    window.scrollTo(0, document.body.scrollHeight)
  })
  await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)

  const { sectionHeights, lowContrastSamples, viewportH, fontList } = await page.evaluate(() => {
    const sectionEls = Array.from(document.querySelectorAll('section, header, footer, main > div'))
    const heights = sectionEls.map((el) => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      const id = el.id || el.getAttribute('data-section') || el.tagName.toLowerCase()
      const text = (el.innerText || '').trim().length
      return { id, h: Math.round(r.height), text, bg: cs.backgroundColor }
    })

    const samples = []
    const candidates = Array.from(document.querySelectorAll('p, li, span, h1, h2, h3, h4, button, a'))
    for (const el of candidates.slice(0, 200)) {
      const cs = getComputedStyle(el)
      const txt = (el.innerText || '').trim()
      if (!txt) continue
      const fs = parseFloat(cs.fontSize) || 16
      let parent = el.parentElement
      let parentBg = cs.backgroundColor
      while (parent && parentBg && parentBg.includes('rgba(0, 0, 0, 0)')) {
        parentBg = getComputedStyle(parent).backgroundColor
        parent = parent.parentElement
      }
      samples.push({
        text: txt.slice(0, 60),
        color: cs.color,
        bg: parentBg || 'rgb(0,0,0)',
        fontSize: fs,
        bold: parseInt(cs.fontWeight, 10) >= 600,
      })
    }

    const fonts = [...new Set(Array.from(document.fonts).map((f) => `${f.family} ${f.weight} ${f.style}`))]
    return {
      sectionHeights: heights,
      lowContrastSamples: samples,
      viewportH: window.innerHeight,
      fontList: fonts.slice(0, 12),
    }
  })

  // 1. Empty / collapsed bands
  const emptyBands = sectionHeights.filter(
    (s) => s.h >= 60 && s.h <= 180 && s.text < 20,
  )
  const tinyBands = sectionHeights.filter((s) => s.h < 60 && s.text < 5)
  if (emptyBands.length) {
    issues.push(
      `${emptyBands.length} bands look empty (>=60px, <20 chars text): ${emptyBands.map((b) => `${b.id}@${b.h}px`).slice(0, 4).join(', ')}`,
    )
  }
  if (tinyBands.length > 3) {
    issues.push(`${tinyBands.length} bands collapsed below 60px`)
  }
  // 2. Total page height sanity. v8: lowered 3.0 → 2.5 viewports because dense
  // Mobbin Pro anchors (Linear / Cursor / Sentry / Stripe) routinely ship
  // marketing pages that are ~2.5 viewports tall — the original 3-viewport
  // bar was authored for aurora-tier exemplars and incorrectly flagged
  // well-composed dense pages. Also count distinct content-bearing sections
  // as a secondary heuristic so a 2200px page with 9 dense sections passes
  // while a 2200px page with 4 sparse sections still fails.
  const totalH = sectionHeights.reduce((a, b) => a + b.h, 0)
  const contentSections = sectionHeights.filter((s) => s.h >= 200 && s.text >= 80).length
  const heightFloor = viewportH * 2.5
  if (totalH < heightFloor && contentSections < 8) {
    issues.push(
      `page total height ${totalH}px < 2.5 viewports (${Math.round(heightFloor)}px) AND only ${contentSections} content-bearing sections — likely missing sections`,
    )
  }
  // 3. Contrast: at least 80% of body text samples >= AA (4.5:1)
  const audit = lowContrastSamples
    .map((s) => {
      const c1 = parseRgb(s.color)
      const c2 = parseRgb(s.bg)
      if (!c1 || !c2) return null
      const ratio = contrast(c1, c2)
      const required = s.fontSize >= 18 || (s.fontSize >= 14 && s.bold) ? 3 : 4.5
      return { ...s, ratio, required, ok: ratio >= required }
    })
    .filter(Boolean)
  const failContrast = audit.filter((a) => !a.ok)
  const failRatio = audit.length ? failContrast.length / audit.length : 0
  if (failRatio > 0.2) {
    issues.push(
      `${failContrast.length}/${audit.length} text samples fail contrast (>20%): worst "${failContrast[0]?.text}" ratio ${failContrast[0]?.ratio.toFixed(2)}`,
    )
  }
  // 4. Console errors
  if (consoleErrors.length > 2) {
    issues.push(`${consoleErrors.length} console errors: ${consoleErrors[0]}`)
  }
  // 5. Fonts loaded
  const hasDisplayFont = fontList.some((f) =>
    /Fraunces|Syne|Outfit|DM Serif|Playfair|Space Grotesk|Bricolage|Instrument Serif|Manrope|Sora|Crimson|Plus Jakarta/i.test(f),
  )
  if (!hasDisplayFont) {
    issues.push(`no display font loaded (got ${fontList.length} families: ${fontList.slice(0, 3).join(' / ')})`)
  }

  if (shotPath) {
    await page.screenshot({ path: shotPath, fullPage: true })
  }

  return {
    ok: issues.length === 0,
    issues,
    sectionHeights,
    consoleErrors: consoleErrors.slice(0, 5),
    fontList,
    contrast: { audited: audit.length, fails: failContrast.length },
  }
}
