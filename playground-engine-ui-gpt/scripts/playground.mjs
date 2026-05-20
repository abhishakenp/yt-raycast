#!/usr/bin/env bun
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { generateGptHomepage } from '../src/engine.js'
import { collectBrowserVisualAudit } from '../src/visual-audit.js'

const BRIEFS = [
  { slug: 'saas', brief: 'Homepage for KubeMeter, an open-source Kubernetes cost-attribution platform that breaks down spend by pod, namespace, and team in real time. Self-hosted, alternative to Datadog Cost Management.' },
  { slug: 'ecommerce', brief: 'Homepage for Aerie Skincare, a plant-based DTC face oil line. Three products: Restore, Glow, Calm. Founded by herbalists. Subscribe and save, recyclable packaging, made in small batches in Vermont.' },
  { slug: 'restaurant', brief: 'Homepage for Sumida, a single-origin coffee roaster in Tokyo. Subscriptions, retail bags, wholesale to cafes. Family-run since 1987. Curated Ethiopian and Colombian beans, slow-roasted in small batches.' },
  { slug: 'portfolio', brief: 'Personal portfolio for Maya Chen, a freelance brand designer working with early-stage startups and indie creators. Based in Brooklyn. Past clients include Linear, Vercel, and Pitch.' },
  { slug: 'agency', brief: 'Homepage for Sutter Creative, a brand identity and digital design agency working with consumer startups. 12-person team in Portland. Clients include Olipop, Necessaire, Allbirds.' },
  { slug: 'fitness', brief: 'Homepage for Vertex Fitness, a HIIT and strength training studio in Brooklyn. Class packs, monthly memberships, drop-in rates. Six trainers, three classes per day, signature workout: VTX45.' },
  { slug: 'hotel', brief: 'Homepage for Stoneholm, a 24-room boutique hotel on the Oregon coast. Cliffside cedar architecture, ocean-view rooms, on-site restaurant focused on Pacific Northwest cuisine. Spa, fire pits, hiking trails.' },
  { slug: 'ops-console', brief: 'Helmsman, a fleet operations console for autonomous delivery robots. Operators watch a live city map, per-robot battery and route status, incident timeline, and can hand off to remote teleoperation.' },
]

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
const noOpen = process.argv.includes('--no-open')
const noScreenshots = process.argv.includes('--no-shots')
const selected = args.length ? BRIEFS.filter((item) => args.includes(item.slug)) : BRIEFS
const runId = String(Date.now())
const outDir = join(process.cwd(), 'playground-engine-ui-gpt', '.runs', 'playground', runId)
mkdirSync(outDir, { recursive: true })

if (!process.env.GROQ_API_KEY) {
  console.error('[gpt-playground] GROQ_API_KEY not set; real generation blocked. Run mocked tests instead.')
  process.exit(2)
}

async function buildOne(item, index) {
  const result = await generateGptHomepage(item.brief, {
    seed: `${runId}-${item.slug}-${index}`,
    useGeminiIdentity: process.env.GPT_ENGINE_USE_GEMINI_IDENTITY === '1',
  })
  const file = join(outDir, `${item.slug}.html`)
  writeFileSync(file, result.html)
  writeFileSync(join(outDir, `${item.slug}.plan.json`), JSON.stringify(result.plan, null, 2))
  writeFileSync(join(outDir, `${item.slug}.audits.json`), JSON.stringify(result.audits, null, 2))
  return {
    slug: item.slug,
    file,
    ...result.metrics,
    auditsOk: result.audits.ok,
    kimiScore: result.audits.kimi?.score,
    kimiIssues: result.audits.kimi?.issues || [],
    warnings: result.audits.mobbin.warnings,
  }
}

const concurrency = Math.max(1, Math.min(Number(process.env.CONCURRENCY || 4), selected.length))
const rows = new Array(selected.length)
let next = 0

async function worker() {
  while (next < selected.length) {
    const index = next++
    try {
      rows[index] = await buildOne(selected[index], index)
      console.log(`[gpt-playground] ${selected[index].slug}: ${rows[index].wall}ms ${rows[index].pageKind} ${rows[index].anchor}`)
    } catch (error) {
      rows[index] = { slug: selected[index].slug, error: error.message }
      console.log(`[gpt-playground] ${selected[index].slug}: FAILED ${error.message}`)
    }
  }
}

console.log(`[gpt-playground] run=${runId} count=${selected.length} concurrency=${concurrency}`)
await Promise.all(Array.from({ length: concurrency }, worker))

if (!noScreenshots) {
  try {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch()
    for (const row of rows) {
      if (!row.file) continue
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      await page.goto(`file://${row.file}`, { waitUntil: 'load', timeout: 25000 }).catch(() => {})
      await page.waitForTimeout(600)
      await page.screenshot({ path: row.file.replace(/\.html$/, '.png'), fullPage: true }).catch(() => {})
      row.visual = await collectBrowserVisualAudit(page).catch((error) => ({ ok: false, issues: [error.message] }))
      row.visualOk = row.visual.ok
      writeFileSync(row.file.replace(/\.html$/, '.visual.json'), JSON.stringify(row.visual, null, 2))
      await page.close()
    }
    await browser.close()
  } catch (error) {
    console.error(`[gpt-playground] screenshot pass failed: ${error.message}`)
  }
}

writeFileSync(join(outDir, 'results.json'), JSON.stringify(rows, null, 2))

console.log('\n[gpt-playground] results')
for (const row of rows) {
  if (row.error) {
    console.log(`${row.slug.padEnd(14)} ERROR ${row.error}`)
    continue
  }
  const status = row.wall < 20000 ? '<20s' : 'slow'
  const visualStatus = row.visualOk === undefined ? 'visual-skipped' : row.visualOk ? 'visual-ok' : 'visual-warn'
  const kimi = row.kimiScore == null ? 'kimi-n/a' : `kimi-${String(row.kimiScore).padStart(2, '0')}`
  console.log(`${row.slug.padEnd(14)} ${String(row.wall + 'ms').padStart(8)} ${status.padEnd(5)} ${row.pageKind.padEnd(12)} ${String(row.anchor).padEnd(12)} ${row.auditsOk ? 'audit-ok' : 'audit-warn'} ${kimi} ${visualStatus}`)
  if (row.kimiIssues?.length) console.log(`  kimi: ${row.kimiIssues.join('; ')}`)
  if (row.visual?.issues?.length) console.log(`  visual: ${row.visual.issues.join('; ')}`)
}
const ok = rows.filter((row) => row.wall)
if (ok.length) {
  const mean = Math.round(ok.reduce((sum, row) => sum + row.wall, 0) / ok.length)
  console.log(`mean ${mean}ms; slowest ${Math.max(...ok.map((row) => row.wall))}ms; under20 ${ok.filter((row) => row.wall < 20000).length}/${ok.length}`)
}
console.log(`[gpt-playground] artifacts: ${outDir}`)

if (!noOpen) {
  for (const row of rows) {
    if (!row.file) continue
    try {
      execSync(`open "${row.file}"`)
    } catch {}
  }
}
