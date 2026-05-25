#!/usr/bin/env bun
/**
 * One generation attempt for the severe judge loop.
 * Writes artifacts under .forge/ship-severe-judge/<runId>/a<N>/ and prints JSON to stdout.
 *
 * Usage:
 *   bun playground-engine-ui-ship/scripts/ship-judge-run.mjs --run-id=123 --attempt=1
 *   bun playground-engine-ui-ship/scripts/ship-judge-run.mjs --run-id=123 --attempt=2 --feedback="..."
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { generateShipHomepage } from '../src/index.js'
import { auditPublicationHomepage } from '../src/quality/publication-audit.js'
import { countPublicationPhotos } from '../src/media/publication-hydration.js'

const ROOT = process.cwd()
const DEFAULT_BRIEF =
  'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.'

function arg(name, fallback = '') {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const runId = arg('run-id', String(Date.now()))
const attempt = Number(arg('attempt', '1'))
const brief = arg('brief', DEFAULT_BRIEF)
const slug = arg('slug', 'blog-dogs')
const feedback = arg('feedback', '')
const outRoot = join(ROOT, '.forge/ship-severe-judge', runId)
const dir = join(outRoot, `a${attempt}`)
mkdirSync(dir, { recursive: true })

function screenshot(htmlPath, pngPath) {
  const url = `file://${htmlPath}`
  const open = spawnSync('agent-browser', ['open', url], { encoding: 'utf8' })
  if (open.status !== 0) return false
  const cap = spawnSync('agent-browser', ['screenshot', pngPath, '--full'], { encoding: 'utf8' })
  return cap.status === 0
}

const seed = feedback ? `${runId}-a${attempt}-${feedback.length}` : `${runId}-a${attempt}`
const effectiveBrief = feedback
  ? `${brief}\n\nQA feedback from Kimi K2.5 judge (must address):\n${feedback}`
  : brief
const result = await generateShipHomepage(effectiveBrief, { seed })

const htmlPath = join(dir, `${slug}.html`)
const pngPath = join(dir, `${slug}.png`)
writeFileSync(htmlPath, result.html)

const publication = auditPublicationHomepage(result.html, {
  brief,
  route: result.route,
  plan: result.plan,
})
const photoCount = (result.html.match(/<img\b[^>]*\bsrc=["']https?:\/\//gi) || []).length
const pexelsPhotos = countPublicationPhotos(result.html)
const heuristicScore = result.audits.kimi.score

const preflight = {
  ok: publication.ok && heuristicScore >= 72 && photoCount >= 4,
  publicationOk: publication.ok,
  heuristicScore,
  kimiIssues: result.audits.kimi.issues,
  publicationIssues: publication.issues,
  photoCount,
  pexelsPhotos,
  issues: [
    ...(publication.issues || []),
    ...(heuristicScore < 72 ? [`readiness score too low (${heuristicScore})`] : []),
    ...(photoCount < 4 ? [`photo thumbnails (${photoCount} < 4)`] : []),
  ],
  score: heuristicScore,
  checks: publication.checks,
}

writeFileSync(join(dir, 'meta.json'), JSON.stringify({
  brief,
  slug,
  attempt,
  runId,
  feedback,
  metrics: result.metrics,
  audits: result.audits,
  preflight,
}, null, 2))
writeFileSync(join(dir, 'preflight.json'), JSON.stringify(preflight, null, 2))

const shotOk = screenshot(htmlPath, pngPath)

const payload = {
  runId,
  attempt,
  dir,
  htmlPath,
  pngPath,
  screenshotOk: shotOk,
  brief,
  slug,
  preflight,
  metrics: result.metrics,
}

writeFileSync(join(dir, 'attempt.json'), JSON.stringify(payload, null, 2))
console.log(JSON.stringify(payload))
