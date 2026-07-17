import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const scriptPath = new URL('./homepage-quality-gate.mjs', import.meta.url)

type RunResult = {
  code: number | null
  stderr: string
  stdout: string
}

type QualityCheck = {
  name: string
  pass: boolean
  points: number
  failureLeaks?: string[]
  placeholderLeaks?: string[]
  [key: string]: unknown
}

const tempDirs: string[] = []

function createWorkspace(html: string) {
  const dir = mkdtempSync(join(tmpdir(), 'ship-fast-homepage-gate-'))
  tempDirs.push(dir)
  writeFileSync(join(dir, 'index.html'), html)
  return dir
}

function runGate(args: string[]) {
  return new Promise<RunResult>((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath.pathname, ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => resolve({ code, stderr, stdout }))
  })
}

const passingHtml = () => `
<!doctype html>
<html>
  <head>
    <title>Acme Robotics Fleet Platform</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="Acme Robotics helps operations teams supervise warehouse fleets, prioritize incidents, and improve daily throughput with reliable controls."
    />
  </head>
  <body>
    <header><h1>Warehouse robotics command center</h1></header>
    <main>
      <section><h2>Fleet health</h2><p>${'Battery levels, incident routing, dispatch queues, and shift handoff details keep every supervisor aligned. '.repeat(6)}</p></section>
      <section><h2>Incident response</h2><p>${'Teams can inspect blocked aisles, assign owners, notify technicians, and keep fulfillment flowing during peak hours. '.repeat(5)}</p></section>
      <article><h2>Operational analytics</h2><p>${'Daily productivity trends highlight cycle time, travel distance, downtime, maintenance windows, and utilization by zone. '.repeat(5)}</p></article>
      <section><h2>Controls</h2><a href="/demo">Book a demo</a><button type="button">Review fleet</button></section>
      <section><h2>Visual map</h2><img alt="Warehouse map" src="/map.png" /></section>
    </main>
    <footer><a href="/contact">Contact operations</a></footer>
  </body>
</html>
`

describe('homepage-quality-gate script', () => {
  afterEach(() => {
    while (tempDirs.length) {
      rmSync(tempDirs.pop()!, { force: true, recursive: true })
    }
  })

  it('fails fast with structured JSON when no homepage path is provided', async () => {
    const result = await runGate([])

    expect(result.code).toBe(1)
    const payload = JSON.parse(result.stderr)
    expect(payload).toEqual({
      ok: false,
      errors: [
        'Missing --html=<index.html> or --workspace=<generated workspace>.',
      ],
    })
  })

  it('passes a complete generated homepage and writes a quality report beside the artifact', async () => {
    const workspace = createWorkspace(passingHtml())

    const result = await runGate([
      `--workspace=${workspace}`,
      '--min-score=80',
      '--write-report=1',
    ])

    expect(result.code).toBe(0)
    const payload = JSON.parse(result.stdout)
    expect(payload.ok).toBe(true)
    expect(payload.summary.sectionCount).toBeGreaterThanOrEqual(4)
    expect(payload.summary.words).toBeGreaterThanOrEqual(120)
    const report = JSON.parse(
      readFileSync(join(workspace, 'homepage-quality-gate.json'), 'utf8'),
    )
    expect(report.score).toBe(payload.score)
    expect(report.errors).toEqual([])
  })

  it('fails generated homepages that leak deployed runtime errors or placeholders', async () => {
    const workspace = createWorkspace(`
<!doctype html>
<html>
  <head><title>Broken preview</title></head>
  <body>
    <main>
      <section><h1>Waiting for generated module</h1></section>
      <section><p>Uncaught error: TypeError: Cannot read properties of undefined (reading 'find')</p></section>
    </main>
  </body>
</html>
`)

    const result = await runGate([
      `--html=${join(workspace, 'index.html')}`,
      '--min-score=80',
    ])

    expect(result.code).toBe(1)
    const payload = JSON.parse(result.stderr)
    expect(payload.ok).toBe(false)
    expect(payload.errors).toContain('quality.no_runtime_failures failed')
    const runtimeCheck = payload.checks.find(
      (check: QualityCheck) => check.name === 'quality.no_runtime_failures',
    )
    expect(runtimeCheck.failureLeaks).toEqual(
      expect.arrayContaining(['cannot read properties', 'typeerror:']),
    )
    const placeholderCheck = payload.checks.find(
      (check: QualityCheck) => check.name === 'quality.no_placeholder_leaks',
    )
    expect(placeholderCheck.placeholderLeaks).toContain(
      'waiting for generated module',
    )
  })
})
