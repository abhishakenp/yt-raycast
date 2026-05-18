#!/usr/bin/env bun
/**
 * Forge best-of-N: run N forge-once invocations and pick the highest
 * composite11. Lower latency than the full Ralph loop (no leaderboard
 * scaffolding, no winner-seed, no diagonal-aesthetic rotation) so it's the
 * right tool when you want "give me the best Mobbin-inherited gen for this
 * specific brief" and don't need 50 iters of exploration.
 *
 * Usage:
 *   bun scripts/forge-best-of.mjs "your brief" [--n 5] [--max 14000] [--effort low|medium] [--temp 0.6] [--port 9930]
 *
 * Required env (typical):
 *   FORGE_USE_MOBBIN=1
 *   FORGE_MOBBIN_DATA_FILE=scripts/forge-mobbin-fixture.json   # or live auth
 *   FORGE_MOBBIN_FIX=1
 *
 * Each iter runs in its own process so different temperatures + seeds
 * actually produce different outputs. Iters are serialised (Groq rate limits
 * concurrent gpt-oss-120b calls in practice on the free/standard plans). The
 * best run by composite11 is copied to .forge/best-of/<runId>/best/.
 */
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  copyFileSync,
  existsSync,
} from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

function arg(name, def) {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : def
}
const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const prompt = positional[0] || process.env.FORGE_PROMPT || 'A B2B issue-tracking and roadmap tool for engineering teams'
const N = parseInt(arg('--n', '5'), 10)
const maxTokens = arg('--max', '14000')
const effort = arg('--effort', 'medium')
const baseTemp = parseFloat(arg('--temp', '0.6'))
const portBase = parseInt(arg('--port', '9930'), 10)

const RUN_ID = String(Date.now())
const ROOT = process.cwd()
const RUN_DIR = join(ROOT, '.forge', 'best-of', RUN_ID)
mkdirSync(RUN_DIR, { recursive: true })

const TEMP_SCHEDULE = [baseTemp, baseTemp - 0.05, baseTemp + 0.05, baseTemp + 0.1, baseTemp - 0.1, baseTemp]

console.log(`[forge-best-of] run ${RUN_ID} — N=${N} max=${maxTokens} effort=${effort} basePrompt="${prompt}"`)

const runs = []
for (let i = 0; i < N; i++) {
  const temp = TEMP_SCHEDULE[i % TEMP_SCHEDULE.length].toFixed(2)
  const port = portBase + i
  const outDir = join(RUN_DIR, `iter-${String(i + 1).padStart(2, '0')}`)
  mkdirSync(outDir, { recursive: true })
  const t0 = Date.now()
  await new Promise((resolve, reject) => {
    const p = spawn(
      'bun',
      [
        'scripts/forge-once.mjs',
        prompt,
        '--max',
        String(maxTokens),
        '--effort',
        effort,
        '--temp',
        temp,
        '--port',
        String(port),
        '--out',
        outDir,
      ],
      {
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )
    let out = ''
    p.stdout.on('data', (d) => (out += d.toString()))
    p.stderr.on('data', (d) => (out += d.toString()))
    p.on('close', (code) => {
      writeFileSync(join(outDir, 'stdout.log'), out, 'utf8')
      const metaPath = join(outDir, 'meta.json')
      let meta = null
      try {
        if (existsSync(metaPath)) meta = JSON.parse(readFileSync(metaPath, 'utf8'))
      } catch {}
      const ms = Date.now() - t0
      runs.push({ i: i + 1, temp: Number(temp), code, ms, meta, outDir })
      console.log(
        `[forge-best-of] iter ${i + 1}/${N} T=${temp} code=${code} ms=${ms} composite11=${meta?.vision?.composite11 ?? '−'} fidelity=${meta?.vision?.mobbinFidelity ?? '−'} rubric=${meta?.vision?.score ?? '−'}`,
      )
      resolve()
    })
    p.on('error', reject)
  })
}

runs.sort((a, b) => (b.meta?.vision?.composite11 || 0) - (a.meta?.vision?.composite11 || 0))
writeFileSync(join(RUN_DIR, 'leaderboard.json'), JSON.stringify(runs, null, 2), 'utf8')

const top = runs[0]
if (top?.meta) {
  const bestDir = join(RUN_DIR, 'best')
  mkdirSync(bestDir, { recursive: true })
  for (const fname of ['index.html', 'meta.json', 'shot.png', 'mobbin.txt', 'prompt.txt']) {
    const src = join(top.outDir, fname)
    if (existsSync(src)) copyFileSync(src, join(bestDir, fname))
  }
  console.log(
    `\n[forge-best-of] BEST iter ${top.i} (T=${top.temp}) composite11=${top.meta.vision?.composite11} fidelity=${top.meta.vision?.mobbinFidelity} rubric=${top.meta.vision?.score} → ${bestDir}`,
  )
} else {
  console.log('\n[forge-best-of] no iter produced a meta.json — investigate stdout.log files')
}
console.log(`[forge-best-of] leaderboard: ${join(RUN_DIR, 'leaderboard.json')}`)
