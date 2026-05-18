#!/usr/bin/env bun
/**
 * VIBE_PALETTES freshness audit.
 *
 * Pulls live Mobbin Pro trending screens per vibe and reports drift between
 * the apps cited in `packages/ship-fast-engine/src/spec/theme-contrast.js`
 * comments and the apps Mobbin currently trends in that category. Output
 * is a human-readable report — DOES NOT auto-update palettes. Flags drift
 * for the maintainer to review (e.g. "Headspace dropped out of Wellness top
 * 10 trending, replaced by Insight Timer — consider re-validating warm yellow
 * palette against Insight Timer's deep purple").
 *
 * Usage:
 *   bun scripts/audit-vibe-palettes.mjs           → audit all vibes
 *   bun scripts/audit-vibe-palettes.mjs tech saas → audit listed vibes only
 *
 * Exit 0 always — drift is informational, not a build failure. Auth issues
 * exit 1 so CI can detect "audit didn't actually run."
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fetchMobbinReferences, preflightCheck, MOBBIN_STATUS, getMobbinStatus } from './forge-mobbin.mjs'

// Vibe → Mobbin app categories. Best-effort mapping derived from the
// references already cited in theme-contrast.js comments. Multiple categories
// per vibe because Mobbin's taxonomy doesn't always line up 1:1 (e.g. coffee
// brands aren't on Mobbin app categories — falls back to Food & Drink).
const VIBE_TO_MOBBIN = {
  coffee: ['Food & Drink', 'Shopping'],
  farmersmarket: ['Food & Drink', 'Shopping'],
  food: ['Food & Drink'],
  fashion: ['Shopping'],
  jewelry: ['Shopping'],
  wellness: ['Health & Fitness', 'Lifestyle'],
  fitness: ['Health & Fitness'],
  kids: ['Education', 'Kids'],
  realestate: ['Real Estate'],
  outdoors: ['Travel', 'Shopping'],
  tech: ['Developer Tools', 'AI'],
  saas: ['Productivity', 'Business'],
}

const PALETTES_PATH = join(process.cwd(), 'packages/ship-fast-engine/src/spec/theme-contrast.js')

// Extracts app names cited in the comment block above each vibe entry. The
// comments don't have a structured "REFS:" field, so we heuristic-match
// proper-noun tokens — but the heuristic must skip the many adjective /
// connective / color words that share capitalisation with real product
// names. Stoplist below was tuned against the actual comment corpus —
// generic descriptors like "Editorial", "Trust", "Bodoni" produce false
// drift if they pass through. A safer long-term fix is to add explicit
// `// REFS:` lines to theme-contrast.js — this parser is the fallback for
// the current free-form comments.
const STOPLIST = new Set([
  'Mobbin', 'Pro', 'Default', 'Saturated', 'Editorial', 'Dark', 'Trust',
  'Forest', 'Black', 'Bold', 'Clean', 'Modern', 'Real', 'Luxury', 'Bodoni',
  'Playwright', 'Cream', 'Warm', 'Cool', 'Light', 'Deep', 'Bright', 'Neon',
  'Pale', 'Soft', 'Hard', 'CTAs', 'CTA', 'DTC', 'API', 'AI', 'Productivity',
  'Geist', 'Inter', 'Manrope', 'Fraunces', 'Playfair', 'Display', 'Cormorant',
  'Garamond', 'Lora', 'Bebas', 'Neue', 'Fredoka', 'Nunito', 'Style',
  'Heritage', 'Healthcare', 'Architect', 'Channel', 'Web', 'App', 'Cite',
])

// Real-world multi-word app brands that should be matched even when the
// stoplist would otherwise drop a constituent word (e.g. "OpenAI Platform"
// contains the stoplisted token "AI"). Order: longest first so substrings
// don't preempt longer matches.
const KNOWN_BRANDS = [
  'OpenAI Platform', 'Blue Apron', 'NYT Cooking', 'Uber Eats',
  'Dollar Shave Club', 'Headspace', 'Calm', 'Tonal', 'OpenTable', 'HODINKEE',
  'Nike', 'Zillow', 'Realtor', 'Patagonia', 'REI', 'ClassDojo', 'Felt',
  'Confluence', 'Fireflies', 'Linear', 'Cloudflare', 'Databricks',
  'ElevenLabs', 'Hume', 'Clay', 'Base44', 'Sweetgreen', 'Misfits Market',
  'Imperfect Foods', 'Hungryroot', 'Good Eggs', 'Blue Bottle', 'Stumptown',
  'Verve', 'Onyx', 'Counter Culture',
]

function parseCitedApps(source) {
  const cited = {}
  const re = /\/\/\s*([a-z]+):\s*([\s\S]*?)\n\s+([a-z]+):\s*\{/g
  let m
  while ((m = re.exec(source))) {
    const vibe = m[1]
    const comment = m[2]
    if (!(vibe in VIBE_TO_MOBBIN)) continue
    const tokens = new Set()

    // Pass 1: longest known brands first, masking matched spans.
    let masked = comment
    for (const brand of KNOWN_BRANDS) {
      const re2 = new RegExp(`\\b${brand.replace(/\s+/g, '\\s+')}\\b`, 'gi')
      if (re2.test(masked)) {
        tokens.add(brand)
        masked = masked.replace(re2, ' '.repeat(brand.length))
      }
    }

    // Pass 2: capitalised tokens NOT in stoplist, single word only — multi-word
    // proper nouns we couldn't pre-list get dropped (false negative is safer
    // than the previous false positive flood).
    for (const w of masked.matchAll(/\b([A-Z][a-zA-Z0-9]{2,})\b/g)) {
      const t = w[1]
      if (STOPLIST.has(t)) continue
      tokens.add(t)
    }

    // Pass 3: dotted domains (covers DTC-style cited URLs).
    for (const w of comment.matchAll(/\b([a-z][a-z0-9]+\.com)\b/g)) tokens.add(w[1])

    cited[vibe] = [...tokens]
  }
  return cited
}

async function auditVibe(vibe, categories, citedApps) {
  // Mobbin's web taxonomy: 'Home' returns marketing/dashboard screens; that's
  // what the palettes were sourced from. Stick to it for consistency.
  const refs = await fetchMobbinReferences({
    platform: 'web',
    categories,
    patterns: ['Home'],
    limit: 10,
    sortBy: 'trending',
  })
  const status = getMobbinStatus()
  if (!status.ok && refs.length === 0) {
    return { vibe, error: `${status.reason}: ${status.detail || ''}` }
  }
  const trending = [...new Set(refs.map((r) => r.app).filter(Boolean))]
  const citedNorm = new Set((citedApps || []).map((a) => a.toLowerCase()))
  const trendingNorm = trending.map((a) => a.toLowerCase())
  const stillTrending = trending.filter((a) => citedNorm.has(a.toLowerCase()))
  const newlyTrending = trending.filter((a) => !citedNorm.has(a.toLowerCase()))
  const droppedOut = [...citedNorm].filter((a) => !trendingNorm.some((t) => t.includes(a) || a.includes(t)))
  return { vibe, trending, stillTrending, newlyTrending, droppedOut, categories }
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const vibes = args.length ? args : Object.keys(VIBE_TO_MOBBIN)
  for (const v of vibes) {
    if (!(v in VIBE_TO_MOBBIN)) {
      console.error(`unknown vibe: ${v} — valid: ${Object.keys(VIBE_TO_MOBBIN).join(', ')}`)
      process.exit(2)
    }
  }

  console.error('[audit-vibe-palettes] running preflight…')
  const passed = await preflightCheck()
  if (!passed) {
    console.error('[audit-vibe-palettes] preflight failed — cannot proceed')
    process.exit(1)
  }
  console.error('')

  const source = readFileSync(PALETTES_PATH, 'utf8')
  const cited = parseCitedApps(source)

  console.log('# VIBE_PALETTES freshness audit')
  console.log(`generated: ${new Date().toISOString()}`)
  console.log(`source:    ${PALETTES_PATH}`)
  console.log('')
  console.log('Drift = cited apps no longer in Mobbin Pro trending top-10 for the vibe.')
  console.log('New = currently trending but not cited in palette comments.')
  console.log('')

  const drifts = []
  for (const vibe of vibes) {
    const result = await auditVibe(vibe, VIBE_TO_MOBBIN[vibe], cited[vibe] || [])
    if (result.error) {
      console.log(`## ${vibe}  ERROR`)
      console.log(`  ${result.error}`)
      console.log('')
      continue
    }
    const driftPct =
      result.trending.length === 0
        ? 100
        : Math.round((result.droppedOut.length / Math.max(1, (cited[vibe] || []).length)) * 100)
    drifts.push({ vibe, driftPct })
    console.log(`## ${vibe}  (Mobbin categories: ${result.categories.join(', ')})  drift=${driftPct}%`)
    if (cited[vibe]?.length) {
      console.log(`  cited in palette comment:  ${(cited[vibe] || []).join(', ')}`)
    } else {
      console.log('  cited in palette comment:  (none parsed — comment format may not match)')
    }
    console.log(`  Mobbin trending top-10:    ${result.trending.join(', ') || '(none)'}`)
    if (result.stillTrending.length) {
      console.log(`  ✓ still trending:           ${result.stillTrending.join(', ')}`)
    }
    if (result.newlyTrending.length) {
      console.log(`  + newly trending:           ${result.newlyTrending.join(', ')}`)
    }
    if (result.droppedOut.length) {
      console.log(`  - dropped out:              ${result.droppedOut.join(', ')}`)
    }
    console.log('')
  }

  drifts.sort((a, b) => b.driftPct - a.driftPct)
  console.log('## summary (sorted by drift)')
  for (const d of drifts) {
    const flag = d.driftPct >= 60 ? '⚠ HIGH' : d.driftPct >= 30 ? '~ MED' : '✓ LOW'
    console.log(`  ${flag.padEnd(8)} ${d.vibe.padEnd(15)} ${d.driftPct}% drift`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main()
}
