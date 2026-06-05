import { readFileSync, existsSync } from 'node:fs'
import {
  explainNovaMarketingBarFailures,
  htmlLooksDegenerate,
  promptExpectsNovaDenseMarketing,
} from './homepage-degeneracy.js'
import { collectHomepageQualityIssues } from './homepage-quality-audit.js'

const hookRe =
  /data-mobile-nav|data-accordion|data-carousel|data-tab-group|data-counter|data-pricing-billing|data-bill|\bdata-acc\b|data-open-drawer|data-cart-count|data-add\b|data-magnet|data-reveal|popovertarget|data-docs-nav|data-copy\b/i

export const scoreRalphHomepage = (
  html,
  { prompt = '', refPath = '', minScore = 85, refTight = false, siteType = '' } = {},
) => {
  const s = String(html || '')
  const siteSt = String(siteType || '').toLowerCase()
  if (!s.trim()) {
    return {
      ok: false,
      score: 0,
      reasons: ['empty html'],
      feedback: 'Emit a full single-file homepage: <!DOCTYPE html>, <html>, <head> with Tailwind CDN + config, <body> with sections and one inline script for toggles.',
    }
  }

  if (htmlLooksDegenerate(s, { prompt })) {
    const nova = explainNovaMarketingBarFailures(s)
    const bits = []
    if (promptExpectsNovaDenseMarketing(prompt) && nova.length) bits.push(`Nova bar: ${nova.join('; ')}`)
    bits.push('Also satisfy valid HTML, no repetition walls, adequate structure tags.')
    return { ok: false, score: 0, reasons: ['htmlLooksDegenerate', ...nova], feedback: bits.join(' ') }
  }

  const reasons = []
  let score = 0
  if (s.length >= 10000) score += 20
  else reasons.push(`html length ${s.length} (target >= 10000)`)
  const sections = (s.match(/<section\b/gi) || []).length
  const articles = (s.match(/<article\b/gi) || []).length
  const semanticRegions = (s.match(/<(?:main|header|footer|aside)\b/gi) || []).length
  let bands = sections + Math.min(articles || 0, 4)
  if (siteSt === 'docs' && bands < 5 && semanticRegions >= 4) bands = semanticRegions
  const minBands = siteSt === 'docs' ? 5 : 6
  if (bands >= minBands) score += 30
  else reasons.push(`section bands ${bands} (target >= ${minBands})`)
  if (/(?:cdn\.tailwindcss\.com|\/scripts\/tailwind-browser\.js)/i.test(s)) score += 25
  else reasons.push('missing Tailwind runtime (/scripts/tailwind-browser.js)')
  if (hookRe.test(s)) score += 25
  else reasons.push('missing wired data-* hooks (nav, accordion, tabs, carousel, counter, pricing toggle, or storefront cart)')

  if (refPath && existsSync(refPath)) {
    const ref = readFileSync(refPath, 'utf8')
    const refSections = (ref.match(/<section\b/gi) || []).length
    if (refTight) {
      if (refSections > 0) {
        const needSec = Math.max(5, Math.floor(refSections * 0.72))
        const needSecCapped = Math.min(refSections, needSec)
        if (sections < needSecCapped) {
          score -= 40
          reasons.push(
            `need >=${needSecCapped} <section> (reference has ${refSections}); have ${sections}`,
          )
        }
      }
      const needLen = Math.max(12000, Math.floor(ref.length * 0.34))
      if (s.length < needLen) {
        score -= 35
        reasons.push(`need >=${needLen} chars (reference ${ref.length}); have ${s.length}`)
      }
    } else {
      const floor = Math.max(5, Math.floor(refSections * 0.55))
      if (sections < floor) {
        score -= 12
        reasons.push(`sections ${sections}; reference has ${refSections} (aim >= ${floor})`)
      }
      if (ref.length > 8000 && s.length < ref.length * 0.32) {
        score -= 8
        reasons.push(`shorter than reference output (${s.length} vs ${ref.length} chars)`)
      }
    }
  }

  const ok = score >= minScore && reasons.length === 0
  const feedback = reasons.length
    ? `Revise the next homepage: ${reasons.join('; ')}. Match the public design exemplar tier in the system prompt (same site type). Tailwind CDN + config only; working vanilla JS.`
    : ''
  return { ok, score, reasons, feedback }
}

export const passesHomepagePublicDesignVerification = (html, prompt, refPath, siteType = '') => {
  if (!refPath || !existsSync(refPath)) {
    const sc = scoreRalphHomepage(html, {
      prompt,
      refPath: '',
      minScore: 88,
      refTight: false,
      siteType,
    })
    if (!sc.ok) return { ok: false, feedback: sc.feedback }
    const audit = collectHomepageQualityIssues(html, { siteType, prompt })
    if (audit.length) return { ok: false, feedback: `Quality audit: ${audit.join('; ')}` }
    return { ok: true, feedback: '' }
  }
  const sc = scoreRalphHomepage(html, { prompt, refPath, minScore: 88, refTight: true, siteType })
  if (!sc.ok) return { ok: false, feedback: sc.feedback || sc.reasons.join('; ') }
  const audit = collectHomepageQualityIssues(html, { siteType, prompt })
  if (audit.length) return { ok: false, feedback: `Quality audit: ${audit.join('; ')}` }
  return { ok: true, feedback: '' }
}
