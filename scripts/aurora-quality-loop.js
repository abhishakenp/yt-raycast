import { spawnSync } from 'node:child_process'
import { mkdirSync, existsSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = (process.env.SHIP_FAST_URL || 'http://localhost:7420').replace(/\/+$/, '')
const outDir = process.env.AURORA_OUT || join(root, '.aurora-quality-tmp')
const rounds = Math.max(1, Math.min(20, parseInt(process.env.AURORA_ROUNDS || '1', 10) || 1))
const prompt =
  process.env.AURORA_PROMPT ||
  [
    'Aurora design system. Kerala government ASHA Workers Portal — Malayalam civic dashboard.',
    'Midnight Canvas hero with liquid aurora + grid + particle feel, stats 26000+ 14 districts 1.2Cr 24x7,',
    'six role-colored service cards, news updates with status pills, top chrome route pill + export stack + Live.',
    'Premium legibility; match aurora.md tokens.',
  ].join(' ')

const baselineHtml = join(root, 'src/prompts/design-refs/aurora/preview-dark.html')
const baselineUrl = pathToFileURL(baselineHtml).href

function ab(args) {
  const r = spawnSync('agent-browser', args, { stdio: 'inherit', shell: false })
  if (r.status !== 0 && r.status !== null) process.exit(r.status)
  if (r.error) throw r.error
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitHomepage(sessionId) {
  const deadline = Date.now() + 20 * 60 * 1000
  while (Date.now() < deadline) {
    const res = await fetch(`${base}/api/sessions/${sessionId}`)
    if (!res.ok) throw new Error(`session poll ${res.status}`)
    const j = await res.json()
    if (j.homepageReady) return
    await sleep(4000)
  }
  throw new Error('homepageReady timeout')
}

async function createSession() {
  const res = await fetch(`${base}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      preferredLanguage: 'ml',
      preferredExportTarget: 'html',
    }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`POST /api/sessions ${res.status}: ${text}`)
  const j = JSON.parse(text)
  if (!j.id) throw new Error('no session id in response')
  return j.id
}

async function main() {
  if (!existsSync(baselineHtml)) {
    console.error('missing baseline:', baselineHtml)
    process.exit(1)
  }
  mkdirSync(outDir, { recursive: true })

  for (let round = 1; round <= rounds; round++) {
    console.error(`\n--- aurora QA round ${round}/${rounds} ---\n`)
    const id = await createSession()
    console.error('session', id)
    await waitHomepage(id)
    const genUrl = `${base}/preview/${id}`
    const dashboardUrl = `${base}/session/${id}`
    const urlLog = join(outDir, 'preview-urls.txt')
    appendFileSync(
      urlLog,
      `${new Date().toISOString()}\t${genUrl}\t${dashboardUrl}\n`,
      'utf8',
    )
    console.error('preview', genUrl)
    console.error('dashboard', dashboardUrl)
    const baselinePng = join(outDir, `baseline-r${round}.png`)
    const genPng = join(outDir, `generated-r${round}.png`)

    ab(['set', 'viewport', '1440', '900'])
    ab(['open', baselineUrl])
    ab(['wait', '3000'])
    ab(['screenshot', '--full', baselinePng])
    ab(['open', genUrl])
    ab(['wait', '--load', 'networkidle'])
    ab(['wait', '4000'])
    ab(['screenshot', '--full', genPng])
    ab(['diff', 'screenshot', '--baseline', baselinePng])
    console.error(`round ${round} diff complete (see agent-browser output above)`)
  }
  console.error(`\nartifacts: ${outDir}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
