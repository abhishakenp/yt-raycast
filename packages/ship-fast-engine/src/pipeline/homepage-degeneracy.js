function stripToVisibleText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const MEANINGFUL_DIV_MARKUP_RE =
  /<div\b[^>]*\b(?:hero|masthead|shell|layout|app-|dashboard|sidebar|rail|drawer|panel|stage|viewport|features?|pricing|testimonial|cta|footer|header|navbar|nav-bar|product|collection|catalog|shop|gallery|content-main|main-content|card|grid|bento|strip|band|section)\b/i
function bodyInner(html) {
  const m = String(html || '').match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return m ? m[1] : String(html || '')
}

export const promptExpectsNovaDenseMarketing = (prompt) => {
  const p = String(prompt || '').toLowerCase()
  if (!p.trim()) return false
  if (
    /\b(e-?commerce|online\s*store|shopping\s+cart|checkout\b|cart\b|retail\s+store|dtc\b|sell\s+online|merch\b)\b/.test(
      p,
    )
  )
    return false
  if (
    /\b(dashboard|admin\s+panel|internal\s+(tool|app)|analytics\s+(workspace|console))\b/.test(
      p,
    )
  )
    return false
  if (/\b(arcade|fps\b|playable\s+3d)\b/.test(p)) return false
  if (/\b(documentation\s+site|docs\s+for\s+dev|knowledge\s+base)\b/.test(p))
    return false
  if (/\b(government\s+portal|civic\s+portal|ministry\b.*\bportal)\b/.test(p))
    return false
  if (/\b(portfolio\s+for|photographer|wedding\s+photo)\b/.test(p)) return false
  return (
    /\b(saas|landing\s+page|marketing\s+page|marketing\s+site|b2b\s+software|devtools|developer\s+tools|workspace|homepage\s+for|product\s+marketing)\b/.test(
      p,
    ) ||
    /\bvague\s+saas\b/.test(p) ||
    (/\b(ai|llm|ml)\b/.test(p) && /\b(tool|platform|product|app)\b/.test(p))
  )
}

export const explainNovaMarketingBarFailures = (html) => {
  const raw = String(html || '')
  if (!/(?:cdn\.tailwindcss\.com|\/scripts\/tailwind-browser\.js)/i.test(raw))
    return []
  const failures = []
  const sections = (raw.match(/<section\b/gi) || []).length
  const text = stripToVisibleText(bodyInner(raw))
  const wc = text.split(/\s+/).filter(Boolean).length
  const hasPricing =
    /\bid\s*=\s*["']pricing["']/i.test(raw) ||
    /\bdata-pricing-billing\b/i.test(raw) ||
    /href=["']\/pricing\/?["']/i.test(raw) ||
    /href=["'][^"']*pricing\.html["']/i.test(raw) ||
    (/<h[12][^>]*>[^<]{0,48}pricing[^<]{0,48}<\/h[12]>/i.test(raw) &&
      /\$\s*\d|€\s*\d|£\s*\d|\/mo|per\s*month|\/year|free trial/i.test(raw))
  const hasFaq =
    /\bid\s*=\s*["']faq["']/i.test(raw) ||
    /\bdata-accordion\b/i.test(raw) ||
    /<section[^>]{0,160}faq/i.test(raw) ||
    /frequently\s+asked|faq\b/i.test(text.toLowerCase())
  const hasVisualHook =
    /\bblur-(?:2|3|4)xl\b/.test(raw) ||
    ((raw.match(/bg-gradient-to-/gi) || []).length >= 2 &&
      /bg-gradient-to-/i.test(raw)) ||
    /\bshadow-\[0_14px/i.test(raw) ||
    /\b(?:ring|border)-white\/(?:\[0\.0?[0-9]+\]|1[0-5])\b/.test(raw) ||
    /\bbackdrop-blur-(?:md|lg|xl|2xl|3xl)\b/i.test(raw)
  if (wc < 110) failures.push(`visible word count ${wc} (need >=110)`)
  if (sections < 5) failures.push(`<section> count ${sections} (need >=5)`)
  if (!hasPricing)
    failures.push(
      'missing pricing band (#pricing, data-pricing-billing, or /pricing link with prices)',
    )
  if (!hasFaq) failures.push('missing FAQ (#faq, data-accordion, or FAQ copy)')
  if (!hasVisualHook)
    failures.push(
      'missing visual depth (blur-3xl, stacked bg-gradient-to-*, shadow-[…], ring-white/…, or backdrop-blur)',
    )
  return failures
}

export const htmlFailsNovaMarketingBar = (html) =>
  explainNovaMarketingBarFailures(html).length > 0

function countStructuralTags(html) {
  const s = String(html || '')
  const semantic = s.match(
    /<\/?(?:section|article|header|footer|nav|main|aside)\b/gi,
  )
  const divLandmarks = s.match(
    new RegExp(MEANINGFUL_DIV_MARKUP_RE.source, 'gi'),
  )
  const nSem = semantic ? semantic.length : 0
  const nDiv = divLandmarks ? Math.min(divLandmarks.length, 24) : 0
  return nSem + nDiv
}

export function htmlLooksDegenerate(html, opts = {}) {
  const s = String(html || '').trim()
  if (s.length < 350) return true

  const low = s.toLowerCase()
  if (!low.includes('<html') && !low.includes('<!doctype')) return true
  if (!/<body[\s>]/i.test(s)) return true

  const noScripts = s.replace(/<script[\s\S]*?<\/script>/gi, '')
  const angleRatio =
    (noScripts.match(/</g) || []).length / Math.max(noScripts.length, 1)
  if (noScripts.length > 6000 && angleRatio < 0.012) return true

  const text = stripToVisibleText(s)
  if (text.length > 800) {
    const words = text.split(/\s+/).filter(Boolean)
    if (words.length > 400) {
      const uniq = new Set(words.map((w) => w.toLowerCase()))
      const ratio = uniq.size / words.length
      if (ratio < 0.06) return true
    }

    let run = 1
    let maxRun = 1
    const w = text.split(/\s+/).filter(Boolean)
    for (let i = 1; i < w.length; i++) {
      if (w[i] === w[i - 1]) {
        run++
        maxRun = Math.max(maxRun, run)
      } else {
        run = 1
      }
    }
    if (maxRun > 45) return true

    if (w.length > 80) {
      const bigrams = new Map()
      for (let i = 0; i < w.length - 1; i++) {
        const bg = `${w[i].toLowerCase()} ${w[i + 1].toLowerCase()}`
        bigrams.set(bg, (bigrams.get(bg) || 0) + 1)
      }
      for (const c of bigrams.values()) {
        if (c > 80) return true
      }
    }
  }

  if (text.length > 12000 && countStructuralTags(s) < 3) return true

  const prompt = opts.prompt
  if (
    prompt &&
    promptExpectsNovaDenseMarketing(prompt) &&
    htmlFailsNovaMarketingBar(s)
  )
    return true

  return false
}
