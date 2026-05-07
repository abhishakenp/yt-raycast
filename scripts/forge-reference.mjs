/**
 * Reference distillation — extract structural fingerprint from
 * public/designs/design-03-saas-homepage.html to inject into prompts as a
 * compact density target (NOT the full HTML, just measurable signals).
 */
import { readFileSync, existsSync } from 'node:fs'

const REF_PATH = '/Users/livio/Documents/ship-fast/.forge/_ref/design-03-saas-homepage.html'
const ALT_REF = '/Users/livio/Documents/ship-fast/public/designs/design-03-saas-homepage.html'

let CACHE = null

function distill(html) {
  const sections = (html.match(/<section\b[^>]*id=["']([^"']+)["']/gi) || [])
    .map((s) => s.match(/id=["']([^"']+)["']/i)?.[1])
    .filter(Boolean)
  const sectionCount = (html.match(/<section\b/gi) || []).length
  const articleCount = (html.match(/<article\b/gi) || []).length
  const hooks = [
    ...new Set(
      (html.match(/data-(mobile-nav|accordion|carousel|tab-group|counter|pricing-billing|reveal|magnet|bill|acc)\b/gi) || []).map((s) =>
        s.toLowerCase(),
      ),
    ),
  ]
  const radial = (html.match(/radial-gradient/gi) || []).length
  const blurs = (html.match(/blur-(3xl|\[\d+px\])/gi) || []).length
  const keyframes = (html.match(/keyframes\s*:\s*\{[\s\S]*?\}/i) || []).length
  const fonts = [
    ...new Set(
      (html.match(/family=([A-Z][A-Za-z+]+)/g) || []).map((s) => s.replace(/family=/, '')),
    ),
  ]
  const links = (html.match(/<a\s[^>]*href=/gi) || []).length
  const buttons = (html.match(/<button\b/gi) || []).length
  return {
    sections: sectionCount,
    sectionIds: sections.slice(0, 12),
    articles: articleCount,
    hooks,
    radial,
    blurs,
    keyframes,
    fonts: fonts.slice(0, 4),
    links,
    buttons,
    chars: html.length,
  }
}

export function loadReferenceFingerprint() {
  if (CACHE) return CACHE
  const path = existsSync(REF_PATH) ? REF_PATH : existsSync(ALT_REF) ? ALT_REF : null
  if (!path) {
    CACHE = null
    return null
  }
  const html = readFileSync(path, 'utf8')
  CACHE = distill(html)
  return CACHE
}

export function referencePromptBlock() {
  const f = loadReferenceFingerprint()
  if (!f) return ''
  return `
── REFERENCE TIER ──
Match design-03-saas-homepage density: section ids ≈ {${f.sectionIds.slice(0, 6).join(', ')}}, ${f.links}+ links, ${f.buttons}+ buttons, ${f.radial}+ radial-gradients. Don't copy — your own art direction at this density.`
}
