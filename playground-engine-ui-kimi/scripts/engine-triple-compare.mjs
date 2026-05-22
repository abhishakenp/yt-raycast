#!/usr/bin/env bun
/**
 * Run one brief through all three homepage engines and open a 3-column compare page.
 *
 * Usage:
 *   bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs "Homepage for …"
 *   bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs --prompt "…" --vision
 *   bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs --vision --vision-compare "…"
 *   bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs --prompt "…" --port 7421 --serve
 *   bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs --skip-shots --no-open
 *
 * Requires: GROQ_API_KEY, GEMINI_API_KEY (or GOOGLE_API_KEY)
 * Optional: playwright (for PNG screenshots), --vision (Groq Llama-4 Scout judge)
 */
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { runTripleCompare, printTripleSummary } from './lib/triple-compare-run.mjs'

const ROOT = process.cwd()

function arg(name, fallback) {
  const prefix = `--${name}=`
  const hit = process.argv.find((a) => a.startsWith(prefix))
  if (hit) return hit.slice(prefix.length)
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

function parseBrief() {
  const promptFlag = arg('prompt', null)
  if (promptFlag) return promptFlag.trim()
  const rest = []
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      if (['--prompt', '--port', '--seed', '--vision-min'].includes(a) && argv[i + 1] && !argv[i + 1].startsWith('--')) i++
      continue
    }
    rest.push(a)
  }
  return rest.join(' ').trim()
}

const brief = parseBrief()
if (!brief || brief.length < 12) {
  console.error(`Usage: bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs "Your homepage brief…"`)
  console.error('   or: bun …/engine-triple-compare.mjs --prompt "Your brief…" [--vision]')
  process.exit(2)
}

if (!process.env.GROQ_API_KEY) {
  console.error('[triple] GROQ_API_KEY not set')
  process.exit(2)
}
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.error('[triple] GEMINI_API_KEY or GOOGLE_API_KEY not set (forge + kimi quality path)')
  process.exit(2)
}

const runId = String(Date.now())
const outDir = join(ROOT, '.forge', 'engine-triple', runId)
const skipShots = process.argv.includes('--skip-shots')
const shouldServe = process.argv.includes('--serve')
const shouldOpen = !process.argv.includes('--no-open')
const withVision = process.argv.includes('--vision')
const visionCompare = process.argv.includes('--vision-compare')
const port = Number(arg('port', '7421')) || 7421
const seed = arg('seed', runId)
const visionMin = Number(arg('vision-min', process.env.FORGE_VISION_MIN || '75')) || 75

const run = await runTripleCompare({
  brief,
  outDir,
  seed,
  skipShots,
  withVision,
  visionCompare,
  visionMin,
  port,
  writeServe: shouldServe,
})

printTripleSummary(run)

async function openUrl(url) {
  return new Promise((resolve) => {
    const cmd =
      process.platform === 'darwin' ? ['open', url]
      : process.platform === 'win32' ? ['cmd', '/c', 'start', '', url]
      : ['xdg-open', url]
    const child = spawn(cmd[0], cmd.slice(1), { detached: true, stdio: 'ignore' })
    child.on('error', () => resolve(false))
    child.unref()
    setTimeout(() => resolve(true), 200)
  })
}

if (shouldServe) {
  console.log(`Compare: http://localhost:${port}/ (Ctrl+C to stop)`)
  if (shouldOpen) {
    setTimeout(() => {
      openUrl(`http://localhost:${port}/`).then(() => {
        console.log('Opened in browser.')
      })
    }, 400)
  }
  await import(join(outDir, 'serve.mjs'))
} else {
  const fileUrl = `file://${run.indexPath}`
  console.log(`Compare: ${fileUrl}`)
  if (shouldOpen) {
    await openUrl(fileUrl)
    console.log('Opened in browser.')
  } else {
    console.log(`Serve: bun ${join(outDir, 'serve.mjs')}`)
  }
}
