// scripts/forge-critic.mjs
// Heuristic critic + targeted repair pipeline for forge HTML output.
//
// Ported from oss120b-to-kimi (heuristic.ts + repair.ts), adapted for full
// HTML (vs JSX). The critic is zero-LLM (regex only). If any issues are
// found, a single repair LLM call (GPT-OSS-120B, reasoning_effort='low')
// rewrites the HTML with minimum changes.

import { forgeGenerate } from './forge-lib.mjs'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function classesOf(tag) {
  // HTML uses class="..."; we also accept className= for safety.
  const m = tag.match(/\bclass(?:Name)?=["']([^"']+)["']/)
  return m ? m[1].split(/\s+/).filter(Boolean) : []
}

function tagsOf(html) {
  const out = []
  const re = /<([a-zA-Z][^\s>/]*)\b[^>]*>/g
  let m
  while ((m = re.exec(html))) out.push({ open: m[0], name: m[1].toLowerCase(), index: m.index })
  return out
}

function stripFences(s) {
  return String(s ?? '')
    .replace(/^```(?:html|jsx|tsx)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
}

// ---------------------------------------------------------------------------
// critique
// ---------------------------------------------------------------------------

/**
 * Run all critic rules against `html`. `context` is the brief metadata —
 * { brief, siteType, palette, genome } — used by forge-specific rules.
 * Returns an array of Issue objects:
 *   { selector, kind, severity, message, suggestion }
 */
export function critique(html, context = {}) {
  const issues = []
  const tags = tagsOf(html)

  // ---- 1. dark mode counterparts -----------------------------------------
  let lightOnly = 0
  let withDark = 0
  for (const t of tags) {
    const cls = classesOf(t.open).join(' ')
    if (/\b(bg|text|border)-(white|black|neutral-\d+|slate-\d+|zinc-\d+)\b/.test(cls)) {
      if (/\bdark:/.test(cls)) withDark++
      else lightOnly++
    }
  }
  if (lightOnly > 6 && withDark / Math.max(1, lightOnly) < 0.3) {
    issues.push({
      selector: 'global',
      kind: 'contrast',
      severity: 'medium',
      message: `Many color utilities lack dark: counterparts (${lightOnly} light vs ${withDark} dark).`,
      suggestion:
        'Add dark: variants for backgrounds, text, and borders to keep visual consistency in both modes.',
    })
  }

  // ---- 2. very dense classNames ------------------------------------------
  for (const t of tags) {
    const c = classesOf(t.open)
    if (c.length > 28) {
      issues.push({
        selector: t.open.slice(0, 80),
        kind: 'density',
        severity: 'low',
        message: `Tag has ${c.length} classes — risk of conflicting utilities.`,
        suggestion: 'Group with grid/flex containers and lift shared utilities to a parent.',
      })
    }
  }

  // ---- 3. headings missing tracking-tight / font-semibold ----------------
  const headingRe = /<(h[1-3])\b[^>]*\bclass(?:Name)?=["']([^"']+)["'][^>]*>/g
  let h
  while ((h = headingRe.exec(html))) {
    const cls = h[2]
    if (!/tracking-(tight|tighter)/.test(cls) || !/font-(semibold|bold|medium)/.test(cls)) {
      issues.push({
        selector: `<${h[1]}>`,
        kind: 'hierarchy',
        severity: 'low',
        message: `${h[1]} lacks tight tracking or semantic weight.`,
        suggestion: 'Apply tracking-tight + font-semibold for premium typography rhythm.',
      })
    }
  }

  // ---- 4. sections missing responsive horizontal padding ------------------
  const sectionRe = /<section\b[^>]*\bclass(?:Name)?=["']([^"']+)["']/g
  let s
  while ((s = sectionRe.exec(html))) {
    const cls = s[1]
    if (!/\bpx-[2-8]\b|\bp-[4-8]\b|\bsm:px-/.test(cls) && !/mx-auto[^"']*max-w/.test(cls)) {
      issues.push({
        selector: '<section>',
        kind: 'responsive',
        severity: 'medium',
        message: 'Section lacks responsive horizontal padding.',
        suggestion: 'Wrap content with mx-auto max-w-6xl px-6 (or equivalent).',
      })
    }
  }

  // ---- 5. vertical rhythm -------------------------------------------------
  const sectionsCount = (html.match(/<section\b/g) || []).length
  if (sectionsCount >= 4) {
    const generous = (html.match(/\bpy-(20|24|28|32)\b/g) || []).length
    if (generous / sectionsCount < 0.4) {
      issues.push({
        selector: 'global',
        kind: 'spacing',
        severity: 'low',
        message: 'Vertical rhythm between sections looks tight.',
        suggestion: 'Use py-20 / py-24 on top-level sections for breathing room.',
      })
    }
  }

  // ---- 6. undersized CTAs -------------------------------------------------
  const ctaRe = /<a\b[^>]*\bclass(?:Name)?=["']([^"']+)["'][^>]*>([^<]*)<\/a>/g
  let c
  while ((c = ctaRe.exec(html))) {
    const cls = c[1]
    if (/\bh-[345]\b/.test(cls) && /\bbg-/.test(cls)) {
      issues.push({
        selector: 'CTA <a>',
        kind: 'hierarchy',
        severity: 'low',
        message: 'Primary CTA looks too short — small click target.',
        suggestion: 'Use h-10 (or h-11) with px-5 for primary CTAs.',
      })
    }
  }

  // ---- 7. palette drift (forge-specific) ---------------------------------
  // Two conflicting accent families used together = palette drift. We check
  // both Tailwind class usage (text-X / bg-X / border-X / from-X / to-X /
  // ring-X) and tailwind.config color keys.
  //
  // Skip-gate: when a genome is in context, the genome merge has already
  // re-skinned the body family deterministically. A small accent family
  // (e.g. 3 amber-* tokens on CTAs) coexisting with the genome's body family
  // (50+ emerald-* tokens) is a legitimate body+accent palette, NOT drift.
  // Trust the genome's choice and skip this rule. The brief's freeform
  // palette text ("warm terracotta + cream") is advisory at planner time
  // only — once Qwen picks a genome, that's the authoritative palette.
  if (context.genome) {
    // genome present → palette drift check disabled
  } else {
  const accentFamilies = [
    'violet', 'purple', 'indigo', 'blue', 'sky', 'cyan',          // cool-blue cluster
    'terracotta', 'orange', 'amber', 'red', 'rose', 'pink',       // warm cluster
    'emerald', 'green', 'teal', 'lime',                           // green cluster
    'fuchsia', 'magenta',                                         // hot-pink cluster
    'yellow', 'gold',                                             // yellow cluster
  ]
  const clusterOf = {
    violet: 'cool', purple: 'cool', indigo: 'cool', blue: 'cool', sky: 'cool', cyan: 'cool',
    terracotta: 'warm', orange: 'warm', amber: 'warm', red: 'warm', rose: 'warm', pink: 'warm',
    emerald: 'green', green: 'green', teal: 'green', lime: 'green',
    fuchsia: 'hotpink', magenta: 'hotpink',
    yellow: 'yellow', gold: 'yellow',
  }
  const familyCounts = {}
  for (const fam of accentFamilies) {
    // count class usages: e.g. text-violet-500, bg-violet, border-violet-300, from-violet-500
    const re = new RegExp(`\\b(?:text|bg|border|from|via|to|ring|fill|stroke|decoration|outline|shadow|accent)-${fam}(?:-\\d{2,3})?\\b`, 'g')
    const n = (html.match(re) || []).length
    if (n > 0) familyCounts[fam] = n
  }
  const clusters = {}
  for (const [fam, n] of Object.entries(familyCounts)) {
    const cl = clusterOf[fam]
    clusters[cl] = (clusters[cl] || 0) + n
  }
  const significant = Object.entries(clusters).filter(([, n]) => n >= 3)
  if (significant.length >= 2) {
    significant.sort((a, b) => b[1] - a[1])
    const list = significant.map(([cl, n]) => `${cl}=${n}`).join(', ')
    issues.push({
      selector: 'global',
      kind: 'palette-drift',
      severity: 'high',
      message: `Conflicting accent clusters in use (${list}).`,
      suggestion:
        context.palette
          ? `Brief specifies palette "${context.palette}". Pick ONE accent cluster and refactor all conflicting color utilities to match. Keep neutrals (slate/stone/zinc/neutral).`
          : 'Pick ONE accent cluster (cool OR warm OR green) and refactor conflicting color utilities to match. Keep neutrals (slate/stone/zinc/neutral).',
    })
  } else if (context.palette) {
    // If brief specifies a palette family and the dominant cluster doesn't
    // match it, flag drift even when there's only one cluster present.
    const briefFamily = String(context.palette).toLowerCase()
    const briefCluster =
      /violet|purple|indigo|blue|sky|cyan/.test(briefFamily) ? 'cool'
        : /terracotta|orange|amber|red|rose|pink/.test(briefFamily) ? 'warm'
          : /emerald|green|teal|lime/.test(briefFamily) ? 'green'
            : /fuchsia|magenta/.test(briefFamily) ? 'hotpink'
              : /yellow|gold/.test(briefFamily) ? 'yellow'
                : null
    if (briefCluster && significant.length === 1 && significant[0][0] !== briefCluster) {
      issues.push({
        selector: 'global',
        kind: 'palette-drift',
        severity: 'high',
        message: `Brief asks for "${context.palette}" (${briefCluster}) but page uses ${significant[0][0]} accents.`,
        suggestion: `Refactor all accent color utilities to the ${briefCluster} family (e.g. ${briefFamily}) — keep neutrals.`,
      })
    }
  }
  } // end !context.genome guard

  // ---- 8. SaaS-stats leak (forge-specific) -------------------------------
  // Stats labels like "uptime", "API requests", "developers" leaking into a
  // non-SaaS vertical (coffee, restaurant, retail, etc.).
  const briefStr = String(context.brief ?? '').toLowerCase()
  const siteType = String(context.siteType ?? '').toLowerCase()
  const saasKeywords = ['saas', 'api', 'platform', 'devtool', 'developer', 'b2b software']
  const isSaaS = saasKeywords.some((k) => briefStr.includes(k) || siteType.includes(k))
  if (!isSaaS && briefStr) {
    const leakPatterns = [
      /\buptime\b/i,
      /\bAPI requests?\b/i,
      /\bAPI calls?\b/i,
      /\bdeveloper(?:s)?\b/i,
      /\bSLA\b/i,
      /\b99\.9{1,3}%/i,
      /\brequests? per (second|day|month)\b/i,
      /\bdeployments?\b/i,
      /\bdaily active users\b/i,
      /\bMAU\b/,
      /\bDAU\b/,
    ]
    const hits = []
    for (const p of leakPatterns) {
      const m = html.match(p)
      if (m) hits.push(m[0])
    }
    if (hits.length >= 2) {
      issues.push({
        selector: 'stats labels',
        kind: 'saas-leak',
        severity: 'high',
        message: `Generic SaaS metrics leaked into non-SaaS brief: ${hits.slice(0, 5).join(', ')}.`,
        suggestion:
          `Replace stats with vertical-appropriate metrics for: "${context.brief.slice(0, 120)}". For coffee: bags shipped, origins sourced, years roasting, cafe partners. For restaurant: covers served, michelin years, seasonal menus. Keep numeric format.`,
      })
    }
  }

  return issues
}

// ---------------------------------------------------------------------------
// repair
// ---------------------------------------------------------------------------

const FALLBACK_SYSTEM = `You are a UI repair compiler. You receive HTML and a list of issues from a heuristic critic.
Return the FULL repaired HTML. Rules:
- Make the MINIMUM changes needed to address each issue.
- Preserve every text content (copy) EXACTLY verbatim, except where a "saas-leak" or "palette-drift" issue explicitly asks to rewrite specific labels or color tokens.
- Preserve overall structure and hierarchy (same sections, same order, same components).
- Only modify class attributes, color tokens in <style>/tailwind.config, or insert tiny structural wrappers (mx-auto max-w-6xl px-6) when strictly required.
- Keep <!DOCTYPE html>, <html>, <head> (with tailwind.config + Google Fonts + scripts), <body>, and the final IIFE intact.
- Never add markdown fences. Return raw HTML only, starting with <!DOCTYPE html>.`

function issuesUserMessage(html, issues, context) {
  const ctxLines = []
  if (context.brief) ctxLines.push(`Brief: ${context.brief}`)
  if (context.siteType) ctxLines.push(`Site type: ${context.siteType}`)
  if (context.palette) ctxLines.push(`Palette: ${context.palette}`)
  if (context.genome) ctxLines.push(`Genome: ${context.genome}`)
  const ctxBlock = ctxLines.length ? ctxLines.join('\n') + '\n\n' : ''
  return `${ctxBlock}Issues:
${issues.map((i, n) => `${n + 1}. [${i.kind}/${i.severity}] ${i.selector} — ${i.message} → ${i.suggestion}`).join('\n')}

HTML:
---
${html}
---`
}

/**
 * Single repair LLM call. Returns { html, repairMs, repairOk, model }.
 * On error, falls back to the original HTML with repairOk=false.
 *
 * Kind gate: repair is expensive (~35s on a 53K-char page — full doc
 * rewrite). We only pay that cost for issue kinds where a full rewrite is
 * justified AND where the regex critic has high confidence:
 *   - 'saas-leak'      — wrong copy on the wrong vertical; LLM must rewrite labels
 *   - 'palette-drift'  — conflicting accent families; LLM must reskin
 * Everything else (contrast, density, hierarchy, responsive, spacing) is
 * either false-positive prone (the responsive padding regex doesn't see
 * inner wrappers) or fixable by next-pass codegen, not by a costly rewrite.
 * Opt in via { force: true } to repair on every issue.
 */
const REPAIRABLE_KINDS = new Set(['saas-leak', 'palette-drift'])

export async function repair(html, issues, context = {}, options = {}) {
  if (!issues || issues.length === 0) {
    return { html, repairMs: 0, repairOk: true, model: null, skipped: true }
  }
  const repairableIssues = options.force
    ? issues
    : issues.filter((i) => REPAIRABLE_KINDS.has(i.kind))
  if (repairableIssues.length === 0) {
    return {
      html,
      repairMs: 0,
      repairOk: true,
      model: null,
      skipped: true,
      skipReason: `no repairable kinds (have: ${issues.map((i) => i.kind).join(', ')})`,
    }
  }
  issues = repairableIssues
  const t0 = Date.now()
  try {
    const result = await forgeGenerate({
      prompt: issuesUserMessage(html, issues, context),
      system: FALLBACK_SYSTEM,
      temperature: 0.2,
      maxTokens: 16000,
      reasoningEffort: 'low',
    })
    const repaired = stripFences(result.content)
    const repairMs = Date.now() - t0
    if (!repaired || repaired.length < Math.floor(html.length * 0.5)) {
      // Repair output is suspiciously short — likely truncated; reject.
      return { html, repairMs, repairOk: false, model: result.model, error: 'repair output too short' }
    }
    return { html: repaired, repairMs, repairOk: true, model: result.model }
  } catch (e) {
    return {
      html,
      repairMs: Date.now() - t0,
      repairOk: false,
      model: null,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

// ---------------------------------------------------------------------------
// criticAndRepair (convenience)
// ---------------------------------------------------------------------------

export async function criticAndRepair(html, context = {}) {
  const issues = critique(html, context)
  if (issues.length === 0) {
    return { finalHtml: html, issuesFound: [], repaired: false, repairMs: 0 }
  }
  const r = await repair(html, issues, context)
  return {
    finalHtml: r.html,
    issuesFound: issues,
    repaired: r.repairOk === true && r.html !== html,
    repairMs: r.repairMs,
    repairOk: r.repairOk,
    repairModel: r.model,
    repairError: r.error,
  }
}

// ---------------------------------------------------------------------------
// CLI
//   bun scripts/forge-critic.mjs <htmlPath> [briefPath]
// ---------------------------------------------------------------------------

if (import.meta.main) {
  const [htmlPath, briefPath] = process.argv.slice(2)
  if (!htmlPath) {
    console.error('Usage: bun scripts/forge-critic.mjs <htmlPath> [briefPath]')
    process.exit(2)
  }
  const fs = await import('node:fs')
  const html = fs.readFileSync(htmlPath, 'utf8')
  let brief = ''
  if (briefPath) {
    try { brief = fs.readFileSync(briefPath, 'utf8').trim() } catch { /* ignore */ }
  } else {
    // Convention: alongside index.html lives brief.txt
    const path = await import('node:path')
    const dir = path.dirname(htmlPath)
    const guess = path.join(dir, 'brief.txt')
    try { brief = fs.readFileSync(guess, 'utf8').trim() } catch { /* ignore */ }
  }
  const issues = critique(html, { brief })
  console.log(JSON.stringify({ count: issues.length, issues, brief: brief.slice(0, 200) }, null, 2))
}
