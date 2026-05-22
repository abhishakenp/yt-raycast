#!/usr/bin/env bun
/**
 * Verify blog/publication homepage artifacts (structure audit, no marketing hero drift).
 *
 * Usage:
 *   bun playground-engine-ui-ship/scripts/ship-verify-publication.mjs
 *   bun playground-engine-ui-ship/scripts/ship-verify-publication.mjs --run=1779413431734
 *   bun playground-engine-ui-ship/scripts/ship-verify-publication.mjs path/to/page.html
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { dirname, join, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditPublicationHomepage } from '../src/quality/publication-audit.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FORGE = join(__dirname, '../../.forge/ship-native')

function parseArgs(argv) {
  const out = { run: null, paths: [], slug: null }
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--run=')) out.run = arg.slice('--run='.length)
    else if (arg.startsWith('--slug=')) out.slug = arg.slice('--slug='.length)
    else out.paths.push(arg)
  }
  return out
}

function latestRunDir() {
  const entries = readdirSync(FORGE)
    .map((name) => ({ name, mtime: statSync(join(FORGE, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
  return entries[0]?.name ? join(FORGE, entries[0].name) : null
}

function collectHtmlFiles(runDir, slugFilter) {
  const files = []
  for (const name of readdirSync(runDir)) {
    if (!name.endsWith('.html')) continue
    if (slugFilter && !name.startsWith(`${slugFilter}.`)) continue
    files.push(join(runDir, name))
  }
  return files.sort()
}

function metaForFile(filePath) {
  const planPath = filePath.replace(/\.html$/, '.plan.json')
  if (existsSync(planPath)) {
    try {
      const planJson = JSON.parse(readFileSync(planPath, 'utf8'))
      return {
        brief: planJson.plan?.brief || '',
        route: planJson.route || { siteHint: planJson.plan?.siteHint },
        plan: planJson.plan,
      }
    } catch {
      /* fall through */
    }
  }
  const slug = basename(filePath, '.html')
  if (slug.startsWith('blog')) {
    return { brief: 'a blog about dogs', route: { siteHint: 'blog' } }
  }
  return { brief: '', route: { siteHint: 'software' } }
}

function verifyFile(filePath) {
  const html = readFileSync(filePath, 'utf8')
  const meta = metaForFile(filePath)
  const audit = auditPublicationHomepage(html, meta)
  return { filePath, audit, meta }
}

const args = parseArgs(process.argv)
let files = args.paths.map((p) => resolve(p))

if (!files.length) {
  const runDir = args.run ? join(FORGE, args.run) : latestRunDir()
  if (!runDir) {
    console.error('No .forge/ship-native runs found. Generate first with ship-native.mjs blog-dogs')
    process.exit(1)
  }
  files = collectHtmlFiles(runDir, args.slug)
  console.log(`Auditing run ${runDir} (${files.length} file(s))`)
}

let failed = 0
let skipped = 0
for (const file of files) {
  const { audit, meta } = verifyFile(file)
  if (audit.skipped) {
    skipped += 1
    console.log(`SKIP ${file} (siteHint=${meta.route?.siteHint || 'unknown'})`)
    continue
  }
  if (audit.ok) {
    console.log(`PASS ${file}`)
    console.log(`  checks: articles=${audit.checks.articleCount} grid=${audit.checks.gridCols} latest=${audit.checks.latestBand}`)
  } else {
    failed += 1
    console.log(`FAIL ${file}`)
    for (const issue of audit.issues) console.log(`  - ${issue}`)
  }
}

if (skipped && !failed && files.length === skipped) {
  console.log('No publication routes in this run — try --slug=blog-dogs')
}

process.exit(failed > 0 ? 1 : 0)
