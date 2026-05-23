/**
 * Shared artifact helpers for judge scripts.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { auditPublicationHomepage } from '../../src/quality/publication-audit.js'
import { scoreKimiReadiness } from '../../src/quality/kimi-score.js'
import { inferSiteHint } from '../../src/router.js'
import { countPublicationPhotos } from '../../src/media/publication-hydration.js'

export function parseBriefFromArgv(defaultBrief = '') {
  const promptFlag = process.argv.find((a) => a.startsWith('--prompt='))?.slice(9)
  if (promptFlag) return promptFlag.trim()
  const i = process.argv.indexOf('--prompt')
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    return process.argv[i + 1].trim()
  }
  const rest = []
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--')) continue
    rest.push(a)
  }
  const joined = rest.join(' ').trim()
  return joined || defaultBrief
}

export function arg(name, fallback = '') {
  const prefix = `--${name}=`
  const hit = process.argv.find((a) => a.startsWith(prefix))
  if (hit) return hit.slice(prefix.length)
  const i = process.argv.indexOf(`--${name}`)
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    return process.argv[i + 1]
  }
  return fallback
}

export function hasFlag(name) {
  return process.argv.includes(`--${name}`)
}

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true })
  return dir
}

export function screenshotHtml(htmlPath, pngPath) {
  const url = `file://${htmlPath}`
  const open = spawnSync('agent-browser', ['open', url], { encoding: 'utf8' })
  if (open.status !== 0) return false
  const cap = spawnSync('agent-browser', ['screenshot', pngPath, '--full'], { encoding: 'utf8' })
  return cap.status === 0
}

export async function screenshotHtmlPlaywright(htmlPath, pngPath, viewport = { width: 1440, height: 900 }) {
  let chromium
  try {
    ({ chromium } = await import('playwright'))
  } catch {
    return screenshotHtml(htmlPath, pngPath)
  }
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport })
  try {
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
    await page.waitForTimeout(600)
    await page.screenshot({ path: pngPath, fullPage: true }).catch(() => {})
    return existsSync(pngPath)
  } finally {
    await page.close()
    await browser.close()
  }
}

export function buildPreflight(html, { brief, route, plan } = {}) {
  const siteHint = route?.siteHint ?? inferSiteHint(brief)
  const publication = auditPublicationHomepage(html, { brief, route, plan })
  const heuristic = scoreKimiReadiness(html, { plan, route: route || { siteHint }, brief })
  const photoCount = (html.match(/<img\b[^>]*\bsrc=["']https?:\/\//gi) || []).length
  return {
    siteHint,
    publicationOk: publication.ok,
    publicationIssues: publication.issues,
    heuristicScore: heuristic.score,
    heuristicIssues: heuristic.issues,
    photoCount,
    pexelsPhotos: countPublicationPhotos(html),
    publication,
    heuristic,
  }
}

export function writeEngineArtifact(dir, { engineId, brief, html, metrics, preflight, seed }) {
  ensureDir(dir)
  const htmlPath = join(dir, `${engineId}.html`)
  const pngPath = join(dir, `${engineId}.png`)
  writeFileSync(htmlPath, html)
  const meta = { engineId, brief, seed, metrics, preflight }
  writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2))
  return { dir, htmlPath, pngPath, meta }
}

export function judgeModeForBrief(brief) {
  const siteHint = inferSiteHint(brief)
  return siteHint === 'blog' || (siteHint === 'editorial' && /\bblog\b/i.test(brief))
    ? 'publication'
    : 'general'
}

export function judgeMeetsTarget(judge, target = 90) {
  return Boolean(judge?.pass === true && Number(judge?.score ?? 0) >= Number(target))
}
