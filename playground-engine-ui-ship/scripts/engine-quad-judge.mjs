#!/usr/bin/env bun
/**
 * Run four homepage engines on one brief; score each 0–100 with Kimi K2.5 judge.
 *
 * Engines: ship | kimi | forge | gpt
 *
 * Usage:
 *   bun playground-engine-ui-ship/scripts/engine-quad-judge.mjs "Homepage for …"
 *   bun playground-engine-ui-ship/scripts/engine-quad-judge.mjs --prompt "A blog about dogs…"
 *   bun playground-engine-ui-ship/scripts/engine-quad-judge.mjs --engines=ship,gpt --skip-judge
 *   bun playground-engine-ui-ship/scripts/engine-quad-judge.mjs --skip-shots
 *
 * Env: GROQ_API_KEY for generation. Judge requires OPENROUTER_API_KEY (Kimi moonshotai/kimi-k2) or SHIP_JUDGE_BACKEND=cursor.
 */
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateShipHomepage } from '../src/index.js'
import { generateKimiHomepage } from '../../playground-engine-ui-kimi/src/index.js'
import { generateGptHomepage } from '../../playground-engine-ui-gpt/src/engine.js'
import { judgeHomepage, SEVERE_JUDGE_PASS_SCORE } from '../src/quality/kimi-k2-judge.js'
import {
  parseBriefFromArgv,
  arg,
  hasFlag,
  ensureDir,
  screenshotHtmlPlaywright,
  buildPreflight,
  writeEngineArtifact,
  judgeModeForBrief,
} from './lib/judge-artifacts.mjs'

const ROOT = process.cwd()
const DEFAULT_BRIEF =
  'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.'

const brief = parseBriefFromArgv(DEFAULT_BRIEF)
if (!brief || brief.length < 12) {
  console.error('Usage: bun playground-engine-ui-ship/scripts/engine-quad-judge.mjs "Your brief…"')
  process.exit(2)
}

if (!process.env.GROQ_API_KEY) {
  console.error('[quad-judge] GROQ_API_KEY not set (needed for generation)')
  process.exit(2)
}

if (!hasFlag('skip-judge') && !process.env.OPENROUTER_API_KEY && process.env.SHIP_JUDGE_BACKEND !== 'cursor') {
  console.error('[quad-judge] OPENROUTER_API_KEY required for Kimi judge (or --skip-judge / SHIP_JUDGE_BACKEND=cursor)')
  process.exit(2)
}

const runId = arg('run-id', String(Date.now()))
const seed = arg('seed', runId)
const skipShots = hasFlag('skip-shots')
const skipJudge = hasFlag('skip-judge')
const judgeOnly = arg('judge-only', '')
const targetScore = Number(arg('target', '90'))
const engineFilter = arg('engines', 'ship,kimi,forge,gpt').split(',').map((s) => s.trim()).filter(Boolean)
const judgeMode = judgeModeForBrief(brief)
const outDir = ensureDir(join(ROOT, '.forge', 'engine-quad-judge', judgeOnly || runId))

const ENGINES = [
  {
    id: 'ship',
    label: 'playground-engine-ui-ship',
    subtitle: 'Unified ship engine (canonical)',
    run: () => generateShipHomepage(brief, { seed: `${seed}-ship` }),
    normalize: (r) => ({ html: r.html, metrics: r.metrics, route: r.route, plan: r.plan }),
  },
  {
    id: 'kimi',
    label: 'playground-engine-ui-kimi',
    subtitle: 'Kimi research fork · Gemini+Groq hybrid',
    run: () => generateKimiHomepage(brief, { seed: `${seed}-kimi` }),
    normalize: (r) => ({ html: r.html, metrics: r.metrics, route: r.route, plan: r.plan }),
  },
  {
    id: 'forge',
    label: 'forge-gemini-native',
    subtitle: 'Creative planner · parallel Gemini chunks',
    run: async () => {
      const { generateGeminiNativeHomepage } = await import('../../playground-engine-ui/scripts/forge-gemini-native.mjs')
      return generateGeminiNativeHomepage(brief)
    },
    normalize: (r) => ({
      html: r.html,
      metrics: { wall: r.wall, chars: r.chars, buildMode: r.layoutMode, grammarId: r.archetype },
      route: { siteHint: r.plan?.siteHint },
      plan: { pageKind: r.layoutMode },
    }),
  },
  {
    id: 'gpt',
    label: 'playground-engine-ui-gpt',
    subtitle: 'Groq single-pass full page',
    run: () => generateGptHomepage(brief, { seed: `${seed}-gpt` }),
    normalize: (r) => ({ html: r.html, metrics: r.metrics, route: r.route, plan: r.plan }),
  },
].filter((e) => engineFilter.includes(e.id))

async function runEngine(engine) {
  process.stdout.write(`[quad] generate ${engine.id} … `)
  const t0 = Date.now()
  try {
    const raw = await engine.run()
    const { html, metrics, route, plan } = engine.normalize(raw)
    const engineDir = ensureDir(join(outDir, engine.id))
    const preflight = buildPreflight(html, { brief, route, plan })
    const { htmlPath, pngPath } = writeEngineArtifact(engineDir, {
      engineId: engine.id,
      brief,
      html,
      metrics,
      preflight,
      seed,
    })
    if (!skipShots) {
      await screenshotHtmlPlaywright(htmlPath, pngPath)
    }
    const wall = metrics?.wall ?? Date.now() - t0
    console.log(`${wall}ms · heuristic ${preflight.heuristicScore}`)
    return {
      id: engine.id,
      label: engine.label,
      ok: true,
      engineDir,
      htmlPath,
      pngPath,
      html,
      metrics: { ...metrics, wall },
      preflight,
    }
  } catch (err) {
    console.log(`FAILED: ${String(err.message || err).slice(0, 100)}`)
    return { id: engine.id, label: engine.label, ok: false, error: String(err.message || err) }
  }
}

console.log(`[quad-judge] runId=${judgeOnly || runId} mode=${judgeMode} engines=${engineFilter.join(',')}`)
console.log(`[quad-judge] brief: ${brief.slice(0, 120)}${brief.length > 120 ? '…' : ''}`)

let generated
if (judgeOnly) {
  generated = engineFilter.map((id) => {
    const engineDir = join(outDir, id)
    const htmlPath = join(engineDir, `${id}.html`)
    if (!existsSync(htmlPath)) return { id, label: id, ok: false, error: `missing ${htmlPath}` }
    const html = readFileSync(htmlPath, 'utf8')
    const meta = existsSync(join(engineDir, 'meta.json'))
      ? JSON.parse(readFileSync(join(engineDir, 'meta.json'), 'utf8'))
      : {}
    const preflight = buildPreflight(html, { brief: meta.brief || brief, route: meta.route, plan: meta.plan })
    return {
      id,
      label: meta.label || id,
      ok: true,
      engineDir,
      htmlPath,
      pngPath: join(engineDir, `${id}.png`),
      html,
      metrics: meta.metrics || {},
      preflight,
    }
  })
} else {
  const genT0 = Date.now()
  generated = await Promise.all(ENGINES.map((e) => runEngine(e)))
  console.log(`[quad-judge] generation wall ${((Date.now() - genT0) / 1000).toFixed(1)}s`)
}

const scored = []
const judgeRows = generated.filter((r) => r.ok)
if (!skipJudge && judgeRows.length) {
  console.log(`[quad-judge] kimi judge × ${judgeRows.length} (parallel)…`)
  const judgeT0 = Date.now()
  const judged = await Promise.all(
    judgeRows.map(async (row) => {
      const judge = await judgeHomepage({
        brief,
        html: row.html,
        engineId: row.id,
        screenshotPath: existsSync(row.pngPath) ? row.pngPath : null,
        mode: judgeMode,
        preflight: {
          ok: row.preflight.publicationOk,
          score: row.preflight.heuristicScore,
          publicationOk: row.preflight.publicationOk,
          photoCount: row.preflight.photoCount,
          issues: [...row.preflight.publicationIssues, ...row.preflight.heuristicIssues],
        },
        heuristicScore: row.preflight.heuristicScore,
        passThreshold: targetScore,
        backend: process.env.SHIP_JUDGE_BACKEND || 'openrouter',
      })
      writeFileSync(join(row.engineDir, 'verdict.json'), JSON.stringify(judge, null, 2))
      if (judge.prompt) writeFileSync(join(row.engineDir, 'judge-prompt.txt'), judge.prompt)
      return { ...row, judge }
    }),
  )
  console.log(`[quad-judge] judging wall ${((Date.now() - judgeT0) / 1000).toFixed(1)}s`)
  for (const row of judged) {
    console.log(`  ${row.id}: ${row.judge.score}/100 (${row.judge.judgeModel})${row.judge.pass ? ' PASS' : ''}`)
    scored.push(row)
  }
}
for (const row of generated.filter((r) => !r.ok)) scored.push({ ...row, judge: null })
for (const row of generated.filter((r) => r.ok && skipJudge)) {
  scored.push({ ...row, judge: { score: row.preflight.heuristicScore, skipped: true, judgeModel: 'heuristic' } })
}

scored.sort((a, b) => (b.judge?.score ?? b.preflight?.heuristicScore ?? 0) - (a.judge?.score ?? a.preflight?.heuristicScore ?? 0))

const summary = {
  runId,
  brief,
  seed,
  judgeMode,
  targetScore,
  passThreshold: SEVERE_JUDGE_PASS_SCORE,
  generatedAt: new Date().toISOString(),
  results: scored.map((r) => ({
    id: r.id,
    label: r.label,
    ok: r.ok,
    error: r.error,
    wall: r.metrics?.wall,
    heuristicScore: r.preflight?.heuristicScore,
    kimiScore: r.judge?.score ?? null,
    judgeModel: r.judge?.judgeModel ?? null,
    judgeBackend: r.judge?.judgeBackend ?? null,
    briefFidelity: r.judge?.briefFidelity ?? null,
    pass: r.judge?.pass ?? false,
    production_distance: r.judge?.production_distance,
    critical_defects: r.judge?.critical_defects,
    issues: r.judge?.issues,
    feedback: r.judge?.feedback,
    dir: r.engineDir,
  })),
}

writeFileSync(join(outDir, 'results.json'), JSON.stringify(summary, null, 2))

console.log('\n[quad-judge] Kimi scores (ranked)')
console.log('─'.repeat(56))
for (const r of summary.results) {
  if (!r.ok) {
    console.log(`  ${r.id.padEnd(8)} FAILED — ${r.error?.slice(0, 60)}`)
    continue
  }
  const score = r.kimiScore ?? r.heuristicScore
  const mark = score >= targetScore ? '✓' : ' '
  console.log(`  ${mark} ${r.id.padEnd(8)} ${String(score).padStart(3)}/100  (${((r.wall || 0) / 1000).toFixed(1)}s)  heuristic=${r.heuristicScore}`)
}
console.log('─'.repeat(56))
console.log(`Artifacts: ${outDir}`)
console.log(`Target for ship improve loop: ≥${targetScore}/100`)

const shipRow = summary.results.find((r) => r.id === 'ship' && r.ok)
if (shipRow?.kimiScore != null && shipRow.kimiScore < targetScore) {
  console.log(`\nShip gap to target: ${targetScore - shipRow.kimiScore} points`)
  console.log(`Run improve loop: bun playground-engine-ui-ship/scripts/ship-improve-loop.mjs --target=${targetScore}`)
}

process.exit(summary.results.some((r) => r.id === 'ship' && r.kimiScore != null && r.kimiScore >= targetScore) ? 0 : 1)
