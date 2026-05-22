#!/usr/bin/env bun
/**
 * Compare unified ship engine vs production groqHomepage on blog stress briefs.
 *
 * Usage:
 *   bun playground-engine-ui-ship/scripts/ship-vs-production.mjs [slug...]
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { groqHomepage } from '../../packages/ship-fast-engine/src/llm/groq.js'
import { stripFences } from '../../packages/ship-fast-engine/src/llm/utils.js'
import { generateShipHomepage, scoreKimiReadiness } from '../src/index.js'
import { inferSiteHint } from '../src/router.js'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const OUT_DIR = join(ROOT, '.forge', 'ship-compare', RUN_ID)
mkdirSync(OUT_DIR, { recursive: true })

const BRIEFS = [
  { slug: 'blog-dogs', brief: 'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.' },
  { slug: 'blog-generic', brief: 'Newsletter and blog home for independent journalists covering technology policy and civic infrastructure.' },
]

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const briefs = args.length ? BRIEFS.filter((b) => args.includes(b.slug)) : BRIEFS

function scoreHtml(html, brief) {
  const siteHint = inferSiteHint(brief)
  return scoreKimiReadiness(html, { plan: { pageKind: 'vertical-doc' }, route: { siteHint }, brief })
}

for (const { slug, brief } of briefs) {
  console.log(`[compare] ${slug}`)
  const siteHint = inferSiteHint(brief)

  const ship = await generateShipHomepage(brief, { seed: `${RUN_ID}-${slug}-ship` })
  writeFileSync(join(OUT_DIR, `${slug}.ship.html`), ship.html)
  const shipScore = scoreHtml(ship.html, brief)

  const t0 = Date.now()
  const legacy = await groqHomepage(brief, null, null, null, false, null, null, null, JSON.stringify({ siteType: 'blog' }))
  const legacyWall = Date.now() - t0
  const legacyHtml = stripFences(legacy.content || '')
  writeFileSync(join(OUT_DIR, `${slug}.legacy.html`), legacyHtml)
  const legacyScore = scoreHtml(legacyHtml, brief)

  const row = {
    slug,
    siteHint,
    ship: { wall: ship.metrics.wall, score: shipScore.score, issues: shipScore.issues, chars: ship.html.length },
    legacy: { wall: legacyWall, score: legacyScore.score, issues: legacyScore.issues, chars: legacyHtml.length },
  }
  writeFileSync(join(OUT_DIR, `${slug}.json`), JSON.stringify(row, null, 2))
  console.log(`  ship   ${row.ship.wall}ms score=${row.ship.score} issues=${row.ship.issues.length}`)
  console.log(`  legacy ${row.legacy.wall}ms score=${row.legacy.score} issues=${row.legacy.issues.length}`)
}

console.log(`[compare] done → ${OUT_DIR}`)
