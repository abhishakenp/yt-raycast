import { auditMobbinCoverage } from './mobbin-score.js'
import { auditVisualSnapshot } from './visual-audit.js'
import { scoreKimiReadiness } from './kimi-score.js'

function classAttr(tag) {
  return tag.match(/\bclass=["']([^"']+)["']/i)?.[1] || ''
}

export function validateFullWidthSections(html, { minSections = 6, maxSections = 11 } = {}) {
  const issues = []
  const sections = [...String(html ?? '').matchAll(/<section\b[^>]*>/gi)].map((match) => match[0])
  const narrow = []
  const missingInner = []
  for (const [index, tag] of sections.entries()) {
    const cls = classAttr(tag)
    if (!/\bw-full\b|\bmin-h-screen\b|\bcontainer\b/.test(cls)) {
      narrow.push({ index, className: cls.slice(0, 120) })
    }
    const start = String(html).indexOf(tag)
    const next = String(html).indexOf('<section', start + tag.length)
    const slice = String(html).slice(start, next === -1 ? start + 4000 : Math.min(next, start + 4000))
    const intentionalFullBleed = /\bdata-img=/.test(slice) && (/\baspect-\[/.test(slice) || /\bh-\[/.test(slice) || /\bmin-h-screen\b/.test(slice))
    if (!intentionalFullBleed && !/mx-auto[^"']*(max-w-|max-w-screen)/i.test(slice)) {
      missingInner.push(index)
    }
  }
  if (sections.length < minSections) issues.push(`only ${sections.length} sections; expected at least ${minSections} substantial bands`)
  if (sections.length > maxSections) issues.push(`${sections.length} sections; expected a tight homepage`)
  if (narrow.length) issues.push(`${narrow.length} sections missing w-full/min-h-screen/container class`)
  if (missingInner.length) issues.push(`${missingInner.length} sections missing mx-auto max-width inner wrapper`)
  if (/\b(?:fixed|absolute)\b[^"']*(?:sidebar|side|rail|frame|panel|shell)/i.test(html)) {
    issues.push('fixed/absolute frame language detected; app shell should use deterministic normal-flow grid')
  }
  if (/<style\b/i.test(html)) issues.push('custom <style> block detected')
  if (/\sstyle=["']/i.test(html)) issues.push('style attributes detected; use Tailwind utilities')
  if (/<svg\b/i.test(html)) issues.push('inline SVG detected; use data-lucide or data-img placeholders')
  if (/<img\b/i.test(html)) issues.push('img tag detected; use data-img placeholders')
  return {
    ok: issues.length === 0,
    issues,
    sectionCount: sections.length,
    narrow,
    missingInner,
  }
}

export function detectVisualSignature(html, { plan, route, seed } = {}) {
  const text = String(html ?? '')
  const classTokens = [...text.matchAll(/\b(?:grid-cols-[^\s"']+|rounded-[^\s"']+|bg-\[[^\]]+\]|font-[a-zA-Z0-9_-]+|max-w-[^\s"']+)/g)]
    .map((match) => match[0])
  return {
    seed,
    anchor: route?.primary?.app || null,
    secondary: route?.secondary?.app || null,
    pageKind: plan?.pageKind || null,
    archetype: plan?.archetype || null,
    palette: plan?.visualWorld
      ? [plan.visualWorld.bg, plan.visualWorld.surface, plan.visualWorld.accent, plan.visualWorld.accent2].filter(Boolean)
      : [],
    fonts: plan?.visualWorld ? [plan.visualWorld.fontDisplay, plan.visualWorld.fontBody].filter(Boolean) : [],
    layoutGrammar: plan?.visualWorld?.layoutGrammar || null,
    signatureMoves: plan?.signatureMoves || [],
    sectionCount: (text.match(/<section\b/gi) || []).length,
    tokenSample: [...new Set(classTokens)].slice(0, 24),
  }
}

export function compareSignatures(a, b) {
  const diffs = []
  if (a.anchor !== b.anchor) diffs.push('anchor')
  if (a.secondary !== b.secondary) diffs.push('secondary')
  if (a.layoutGrammar !== b.layoutGrammar) diffs.push('layoutGrammar')
  if (JSON.stringify(a.palette) !== JSON.stringify(b.palette)) diffs.push('palette')
  if (JSON.stringify(a.fonts) !== JSON.stringify(b.fonts)) diffs.push('fonts')
  if (a.pageKind !== b.pageKind) diffs.push('pageKind')
  const sharedTokens = a.tokenSample.filter((token) => b.tokenSample.includes(token)).length
  return {
    ok: diffs.length >= 3 || sharedTokens < Math.min(a.tokenSample.length, b.tokenSample.length) * 0.45,
    diffs,
    sharedTokens,
  }
}

export function runDeterministicAudits(html, { plan, route, seed } = {}) {
  const structure = validateFullWidthSections(html, {
    minSections: plan?.pageKind === 'app-shell' ? 4 : 6,
    maxSections: plan?.pageKind === 'app-shell' ? 8 : 11,
  })
  const mobbin = auditMobbinCoverage(html, route?.primary, { plan, route })
  const signature = detectVisualSignature(html, { plan, route, seed })
  const visual = auditVisualSnapshot({
    text: String(html ?? '').replace(/<[^>]+>/g, ' '),
    dataImgs: [...String(html ?? '').matchAll(/<div\b([^>]*\bdata-img=["'][^"']*["'][^>]*)>([\s\S]*?)<\/div>/gi)].map((match) => ({
      className: match[1].match(/\bclass=["']([^"']*)["']/i)?.[1] || '',
      text: match[2].replace(/<[^>]+>/g, ' '),
      childElementCount: (match[2].match(/<\w+/g) || []).length,
      outerHTML: match[0].slice(0, 240),
    })),
    overflowCount: 0,
  })
  const kimi = scoreKimiReadiness(html, { plan, route })
  return {
    ok: structure.ok && mobbin.ok && visual.ok && kimi.ok,
    structure,
    mobbin,
    signature,
    visual,
    kimi,
  }
}
