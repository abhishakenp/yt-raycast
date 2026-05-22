#!/usr/bin/env bun
/**
 * Autonomous blog-dogs loop: generate → audit → screenshot until publication blocks pass.
 *
 * Usage:
 *   bun playground-engine-ui-ship/scripts/ship-blog-loop.mjs
 *   bun playground-engine-ui-ship/scripts/ship-blog-loop.mjs --max=5
 *   SHIP_FAST=1 bun playground-engine-ui-ship/scripts/ship-blog-loop.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { generateShipHomepage } from '../src/index.js'
import { auditPublicationHomepage } from '../src/quality/publication-audit.js'
import { countPublicationPhotos } from '../src/media/publication-hydration.js'

const ROOT = process.cwd()
const BRIEF =
  'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.'
const OUT_ROOT = join(ROOT, '.forge/ship-blog-loop')
const maxAttempts = Number(process.argv.find((a) => a.startsWith('--max='))?.split('=')[1] || 5)
const minScore = Number(process.argv.find((a) => a.startsWith('--min-score='))?.split('=')[1] || 80)
const minPhotos = 4

mkdirSync(OUT_ROOT, { recursive: true })

function screenshot(htmlPath, pngPath) {
  const url = `file://${htmlPath}`
  const shot = spawnSync('agent-browser', ['open', url], { encoding: 'utf8' })
  if (shot.status !== 0) return false
  const cap = spawnSync('agent-browser', ['screenshot', pngPath, '--full'], { encoding: 'utf8' })
  return cap.status === 0
}

let best = null

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  const runId = `${Date.now()}-a${attempt}`
  const dir = join(OUT_ROOT, runId)
  mkdirSync(dir, { recursive: true })

  console.log(`\n[loop] attempt ${attempt}/${maxAttempts} runId=${runId}`)
  const result = await generateShipHomepage(BRIEF, { seed: runId })
  const htmlPath = join(dir, 'blog-dogs.html')
  writeFileSync(htmlPath, result.html)
  writeFileSync(join(dir, 'meta.json'), JSON.stringify({ brief: BRIEF, metrics: result.metrics, audits: result.audits }, null, 2))

  const audit = auditPublicationHomepage(result.html, { brief: BRIEF, route: result.route, plan: result.plan })
  const photos = countPublicationPhotos(result.html)
  const imgTotal = (result.html.match(/<img\b[^>]*\bsrc=["']https?:\/\//gi) || []).length
  const score = result.audits.kimi.score

  console.log(`  kimi=${score} publicationOk=${audit.ok} photos=${imgTotal} pexels=${photos}`)
  if (audit.issues.length) console.log(`  issues: ${audit.issues.join('; ')}`)

  const pngPath = join(dir, 'blog-dogs.png')
  if (screenshot(htmlPath, pngPath)) console.log(`  screenshot → ${pngPath}`)

  const pass = audit.ok && score >= minScore && imgTotal >= minPhotos
  const row = { runId, pass, score, audit, imgTotal, photos, wall: result.metrics.wall }
  if (!best || score > best.score) best = row

  if (pass) {
    console.log(`\n[loop] PASS on attempt ${attempt}`)
    console.log(`  html: ${htmlPath}`)
    process.exit(0)
  }
}

console.log(`\n[loop] did not pass after ${maxAttempts} attempts`)
if (best) {
  console.log(`  best score=${best.score} runId=${best.runId} issues=${(best.audit.issues || []).join('; ')}`)
}
process.exit(1)
