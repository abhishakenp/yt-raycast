#!/usr/bin/env bun
/**
 * Forge Mobbin snapshot scraper.
 *
 * Pulls the top-N trending Home-pattern screens for a broad set of Mobbin app
 * categories and writes the result to `data/mobbin-snapshot.json`. The snapshot
 * lets the forge pipeline run offline — set `FORGE_USE_MOBBIN_SNAPSHOT=1` and
 * forge-mobbin.mjs will read this file instead of calling Mobbin live.
 *
 * Trade-off: vendored snapshot = zero-dependency operation but goes stale.
 * `audit-vibe-palettes.mjs` flags drift between cited apps and live trends —
 * refresh this file when the audit shows drift.
 *
 * Auth chain is the same as the live path (reuses fetchMobbinReferences from
 * forge-mobbin.mjs). Run `mobbin-mcp auth` once if auth.json is missing.
 *
 * CLI:
 *   bun scripts/forge-mobbin-snapshot.mjs
 *
 * Exits 0 on success, 1 on auth/preflight failure.
 */
import { mkdirSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchMobbinReferences, preflightCheck } from './forge-mobbin.mjs'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_FILE = join(REPO_ROOT, 'data', 'mobbin-snapshot.json')

const SNAPSHOT_CATEGORIES = [
  'Developer Tools',
  'AI',
  'Productivity',
  'Business',
  'Shopping',
  'Food & Drink',
  'Health & Fitness',
  'Education',
  'Travel',
  'Real Estate',
  'Finance',
  'Lifestyle',
  'Social',
]

const SNAPSHOT_PATTERNS = ['Home']
const SNAPSHOT_LIMIT = 20
const SNAPSHOT_PLATFORM = 'web'

async function main() {
  console.error('[forge-mobbin-snapshot] running preflight...')
  const ok = await preflightCheck()
  if (!ok) {
    console.error('\n[forge-mobbin-snapshot] preflight FAILED — refusing to write a partial snapshot.')
    console.error('Fix the auth chain (re-run `mobbin-mcp auth` if needed) and retry.')
    process.exit(1)
  }

  console.error('')
  console.error(`[forge-mobbin-snapshot] fetching top-${SNAPSHOT_LIMIT} trending Home screens across ${SNAPSHOT_CATEGORIES.length} categories...`)
  const t0 = Date.now()

  const byCategory = {}
  const counts = []
  for (const cat of SNAPSHOT_CATEGORIES) {
    const tCat = Date.now()
    const refs = await fetchMobbinReferences({
      platform: SNAPSHOT_PLATFORM,
      categories: [cat],
      patterns: SNAPSHOT_PATTERNS,
      limit: SNAPSHOT_LIMIT,
      sortBy: 'trending',
    })
    byCategory[cat] = refs
    counts.push({ cat, n: refs.length, ms: Date.now() - tCat })
    console.error(`  ${cat.padEnd(20)} → ${String(refs.length).padStart(2)} screens (${Date.now() - tCat}ms)`)
  }

  const total = counts.reduce((n, c) => n + c.n, 0)
  const elapsed = Date.now() - t0

  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: 'mobbin.com /api/content/search-screens',
    platform: SNAPSHOT_PLATFORM,
    patterns: SNAPSHOT_PATTERNS,
    limitPerCategory: SNAPSHOT_LIMIT,
    byCategory,
  }

  mkdirSync(dirname(OUT_FILE), { recursive: true })
  writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2))

  const sz = statSync(OUT_FILE).size
  console.error('')
  console.error(`[forge-mobbin-snapshot] wrote ${OUT_FILE}`)
  console.error(`[forge-mobbin-snapshot] ${total} screens across ${SNAPSHOT_CATEGORIES.length} categories in ${elapsed}ms (${(sz / 1024).toFixed(1)} KB)`)

  const empty = counts.filter((c) => c.n === 0)
  if (empty.length) {
    console.error('')
    console.error(`[forge-mobbin-snapshot] ${empty.length} categories returned 0 results: ${empty.map((c) => c.cat).join(', ')}`)
    console.error('  → Likely Mobbin has no Home-pattern web tags for those categories. Snapshot is still usable; configure FORGE_MOBBIN_CATEGORIES to the populated ones.')
  }
}

main().catch((e) => {
  console.error(`[forge-mobbin-snapshot] fatal: ${e?.stack || e?.message || e}`)
  process.exit(1)
})
