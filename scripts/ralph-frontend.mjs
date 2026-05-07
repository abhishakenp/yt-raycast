#!/usr/bin/env bun
/**
 * Outer Ralph loop — drives the LIVE product (POST /api/sessions) end-to-end,
 * audits the rendered homepage with the same 5 gates as forge-loop, and on
 * failure categorizes + emits a fix report so the outer driver (or a human/
 * agent) can patch code, then retries.
 *
 * Quality bar = forge best 1777980514602 / iter-39:
 *   - structuralOk, lucideOk, renderOk
 *   - vision >= FORGE_VISION_MIN (default 75)
 *   - underBudget vs RALPH_TIME_MS (default 25000ms — slower than forge because
 *     the live pipeline does more than just LLM call)
 *
 * Usage:
 *   bun scripts/ralph-frontend.mjs
 *   RALPH_ROUNDS=5 RALPH_PROMPT="luxury jewelry storefront" bun scripts/ralph-frontend.mjs
 *
 * Env knobs:
 *   RALPH_ROUNDS         (default 5)        rounds before stopping
 *   RALPH_PROMPT         (default brief)    prompt fed to /api/sessions
 *   RALPH_TIME_MS        (default 25000)    per-round budget
 *   RALPH_VISION_MIN     (default 75)
 *   RALPH_PORT           (default 7430)     ship-fast server port
 *   RALPH_AUTOSTART      (default 1)        boot bun src/index.js if port idle
 *   RALPH_KEEP_BEST      (default 1)        copy each round into .ralph/<run>/iter-NN/
 *   RALPH_STOP_ON_GREEN  (default 0)        stop after first all-gates-green round
 *
 * Outputs land in .ralph/<runId>/.
 */
import {
  mkdirSync,
  writeFileSync,
  existsSync,
  readFileSync,
  copyFileSync,
  statSync,
} from 'node:fs'
import { join, resolve, sep, normalize } from 'node:path'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { chromium } from 'playwright'
import {
  passesHomepagePublicDesignVerification,
  scoreRalphHomepage,
} from '@ship-fast/engine/pipeline/ralph-homepage-score.js'
import { renderAudit } from './forge-render-audit.mjs'
import { visionJudge } from './forge-vision.mjs'
import { validateLucideIcons, ensureLucideRegistry } from './forge-lucide-validate.mjs'

const ROUNDS = parseInt(process.env.RALPH_ROUNDS || '5', 10)
const TIME_BUDGET_MS = parseInt(process.env.RALPH_TIME_MS || '60000', 10)
const VISION_MIN = parseInt(process.env.RALPH_VISION_MIN || '75', 10)
const PORT = parseInt(process.env.RALPH_PORT || '7430', 10)
const AUTOSTART = process.env.RALPH_AUTOSTART !== '0'
const KEEP_BEST = process.env.RALPH_KEEP_BEST !== '0'
const STOP_ON_GREEN = process.env.RALPH_STOP_ON_GREEN === '1'
const PROMPT =
  process.env.RALPH_PROMPT ||
  'B2B SaaS — engineered intelligence platform for autonomous infrastructure ops, with audit trails and per-team policy controls.'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const RUN_DIR = join(ROOT, '.ralph', RUN_ID)
mkdirSync(RUN_DIR, { recursive: true })

const BASE = `http://localhost:${PORT}`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function isPortLive(port) {
  try {
    const r = await fetch(`http://localhost:${port}/`, { method: 'GET' })
    return r.ok || r.status > 0
  } catch {
    return false
  }
}

async function waitForServer(port, timeoutMs = 30000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    if (await isPortLive(port)) return true
    await sleep(400)
  }
  return false
}

let serverProc = null
async function ensureServer() {
  if (await isPortLive(PORT)) {
    console.log(`[ralph] server already live on :${PORT}`)
    return null
  }
  if (!AUTOSTART) {
    throw new Error(`server not running on :${PORT} and RALPH_AUTOSTART=0`)
  }
  console.log(`[ralph] starting bun src/index.js on :${PORT} ...`)
  serverProc = spawn('bun', ['src/index.js'], {
    cwd: ROOT,
    env: { ...process.env, DASHBOARD_PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  })
  serverProc.stdout.on('data', () => {})
  serverProc.stderr.on('data', () => {})
  const ok = await waitForServer(PORT, 30000)
  if (!ok) throw new Error('server failed to come up within 30s')
  console.log(`[ralph] server up`)
  return serverProc
}

async function createSession(prompt) {
  const t0 = Date.now()
  const r = await fetch(`${BASE}/api/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, preferredExportTarget: 'html' }),
  })
  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(`POST /api/sessions ${r.status}: ${text.slice(0, 200)}`)
  }
  const body = await r.json()
  return { ...body, _ms: Date.now() - t0 }
}

async function getSession(id) {
  const r = await fetch(`${BASE}/api/sessions/${encodeURIComponent(id)}`)
  if (!r.ok) return null
  return r.json().catch(() => null)
}

function sessionHtmlOnDisk(sessionId) {
  const ws = join(ROOT, 'sessions', sessionId)
  for (const fname of ['homepage.html', 'index.html']) {
    const p = join(ws, fname)
    if (existsSync(p)) return p
  }
  return null
}

async function pollUntilHomepageReady(sessionId, deadlineMs) {
  const t0 = Date.now()
  let last = null
  while (Date.now() - t0 < deadlineMs) {
    const s = await getSession(sessionId)
    if (s) {
      last = s
      if (s.homepageReady) {
        const p = sessionHtmlOnDisk(sessionId)
        if (p) return { session: s, htmlPath: p, ms: Date.now() - t0 }
      }
    }
    const onDisk = sessionHtmlOnDisk(sessionId)
    if (onDisk) {
      const stat = (await import('node:fs')).statSync(onDisk)
      if (Date.now() - stat.mtimeMs > 1500 && stat.size > 4000) {
        return { session: last, htmlPath: onDisk, ms: Date.now() - t0 }
      }
    }
    await sleep(800)
  }
  return { session: last, htmlPath: null, ms: Date.now() - t0 }
}

const SHOT_PORT = parseInt(process.env.RALPH_SHOT_PORT || '9890', 10)
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

let staticSrv = null
let browser = null

async function startStaticServer(port, rootDir) {
  return new Promise((res, rej) => {
    const srv = createServer((req, response) => {
      try {
        const u = new URL(req.url || '/', 'http://127.0.0.1')
        let p = decodeURIComponent(u.pathname)
        if (p.endsWith('/')) p += 'index.html'
        const abs = resolve(join(rootDir, normalize(p).replace(/^\/+/, '')))
        if (!abs.startsWith(rootDir + sep) || !existsSync(abs) || !statSync(abs).isFile()) {
          response.writeHead(404)
          return response.end('404')
        }
        const ext = '.' + abs.split('.').pop().toLowerCase()
        response.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
        response.end(readFileSync(abs))
      } catch (e) {
        response.writeHead(500)
        response.end(String(e?.message || e))
      }
    })
    srv.once('error', rej)
    srv.listen(port, '127.0.0.1', () => res(srv))
  })
}

async function ensureBrowser() {
  if (browser) return browser
  browser = await chromium.launch({ headless: true })
  return browser
}

async function ensureStaticServer() {
  if (staticSrv) return staticSrv
  staticSrv = await startStaticServer(SHOT_PORT, ROOT)
  return staticSrv
}

async function auditOne({ html, htmlPath, iterDir }) {
  const structural = scoreRalphHomepage(html)
  const verify = passesHomepagePublicDesignVerification(html)
  const lucideRegistry = await ensureLucideRegistry()
  const lucide = validateLucideIcons(html, lucideRegistry)

  await ensureStaticServer()
  const br = await ensureBrowser()
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const relUrl = htmlPath.startsWith(ROOT) ? htmlPath.slice(ROOT.length) : htmlPath
  const url = `http://127.0.0.1:${SHOT_PORT}${relUrl}`
  const shotPath = join(iterDir, 'shot.png')

  let render = { ok: true, issues: [], skipped: true }
  let vision = { ok: true, score: 100, skipped: true }
  try {
    render = await renderAudit({ url, shotPath, page, siteType: 'saas' })
  } catch (e) {
    render = { ok: false, issues: ['render-audit-error: ' + (e?.message || e)] }
  }
  try {
    if (existsSync(shotPath)) {
      vision = await visionJudge(shotPath)
    } else {
      vision = { ok: false, score: 0, reasons: ['no-screenshot'] }
    }
  } catch (e) {
    vision = { ok: false, score: 0, reasons: ['vision-error: ' + (e?.message || e)] }
  }
  await ctx.close()
  const visionOk = (vision.score || 0) >= VISION_MIN
  return {
    structural,
    verify,
    lucide,
    render,
    vision,
    structuralOk: structural.ok && verify.ok,
    lucideOk: lucide.ok,
    renderOk: render.ok !== false,
    visionOk,
  }
}

function categorizeFailure(audit, ms) {
  const reasons = []
  if (ms > TIME_BUDGET_MS) reasons.push(`time:${ms}ms>${TIME_BUDGET_MS}ms`)
  if (!audit.structuralOk) {
    if (!audit.structural.ok) reasons.push(`structural:${audit.structural.reasons.join(',')}`)
    if (!audit.verify.ok) reasons.push(`verify:${audit.verify.feedback || 'failed'}`)
  }
  if (!audit.lucideOk) reasons.push(`lucide:${(audit.lucide.unknown || []).join(',')}`)
  if (!audit.renderOk) reasons.push(`render:${(audit.render.issues || []).join(';')}`)
  if (!audit.visionOk) reasons.push(`vision:${audit.vision.score}`)
  return reasons
}

async function runRound(round) {
  const iterDir = join(RUN_DIR, `iter-${String(round).padStart(2, '0')}`)
  mkdirSync(iterDir, { recursive: true })
  console.log(`\n[ralph] round ${round} → POST /api/sessions`)
  const t0 = Date.now()
  let html = null
  let htmlPath = null
  let session = null
  let createMs = 0
  try {
    const created = await createSession(PROMPT)
    createMs = created._ms
    const sid = created.session?.id || created.id || created.sessionId
    if (!sid) throw new Error('no sessionId in /api/sessions response: ' + JSON.stringify(created).slice(0, 200))
    console.log(`[ralph]   session=${sid} create=${createMs}ms — polling for homepage…`)
    const polled = await pollUntilHomepageReady(sid, 90000)
    session = polled.session
    htmlPath = polled.htmlPath
    if (!htmlPath) {
      writeFileSync(join(iterDir, 'meta.json'), JSON.stringify({ round, error: 'homepage-not-produced', session, ms: Date.now() - t0 }, null, 2))
      console.log(`[ralph]   FAILED — homepage not produced after ${polled.ms}ms`)
      return { round, ok: false, reasons: ['homepage-missing'], ms: Date.now() - t0 }
    }
    html = readFileSync(htmlPath, 'utf8')
    if (KEEP_BEST) copyFileSync(htmlPath, join(iterDir, 'index.html'))
    console.log(`[ralph]   homepage ready @ ${htmlPath} (${html.length}B), poll=${polled.ms}ms`)
  } catch (e) {
    writeFileSync(join(iterDir, 'meta.json'), JSON.stringify({ round, error: String(e?.message || e), ms: Date.now() - t0 }, null, 2))
    console.log(`[ralph]   FAILED — ${e?.message || e}`)
    return { round, ok: false, reasons: ['session-error:' + (e?.message || e)], ms: Date.now() - t0 }
  }
  const ms = Date.now() - t0
  const audit = await auditOne({ html, htmlPath, iterDir })
  const reasons = categorizeFailure(audit, ms)
  const passed =
    audit.structuralOk && audit.lucideOk && audit.renderOk && audit.visionOk && ms <= TIME_BUDGET_MS
  const meta = {
    round,
    ms,
    createMs,
    passed,
    reasons,
    audit: {
      structuralOk: audit.structuralOk,
      lucideOk: audit.lucideOk,
      renderOk: audit.renderOk,
      visionOk: audit.visionOk,
      visionScore: audit.vision.score,
      lucideUnknown: audit.lucide.unknown,
      renderIssues: audit.render.issues,
    },
  }
  writeFileSync(join(iterDir, 'meta.json'), JSON.stringify(meta, null, 2))
  console.log(
    `[ralph]   ${passed ? 'GREEN' : 'RED'} ms=${ms} vision=${audit.vision.score} structural=${audit.structuralOk} lucide=${audit.lucideOk} render=${audit.renderOk}` +
      (reasons.length ? ` reasons=${reasons.join(' | ')}` : ''),
  )
  return { round, ok: passed, reasons, ms, audit, htmlPath }
}

;(async () => {
  await ensureServer()
  const summary = []
  let bestRound = null
  for (let r = 1; r <= ROUNDS; r++) {
    const result = await runRound(r)
    summary.push(result)
    if (
      result.ok &&
      (!bestRound || (result.audit?.vision?.score ?? 0) > (bestRound.audit?.vision?.score ?? 0))
    ) {
      bestRound = result
    }
    if (result.ok && STOP_ON_GREEN) {
      console.log(`[ralph] stop on green (round ${r})`)
      break
    }
  }
  writeFileSync(
    join(RUN_DIR, 'summary.json'),
    JSON.stringify({ runId: RUN_ID, rounds: summary, bestRound: bestRound?.round || null }, null, 2),
  )
  const greenCount = summary.filter((s) => s.ok).length
  console.log(`\n[ralph] done — ${greenCount}/${summary.length} rounds GREEN. summary=${join(RUN_DIR, 'summary.json')}`)
  if (browser) await browser.close().catch(() => {})
  if (staticSrv) staticSrv.close()
  if (serverProc) {
    serverProc.kill('SIGTERM')
    setTimeout(() => serverProc?.kill('SIGKILL'), 1500)
  }
})().catch(async (e) => {
  console.error('[ralph] fatal:', e)
  if (browser) await browser.close().catch(() => {})
  if (staticSrv) staticSrv.close()
  if (serverProc) serverProc.kill('SIGKILL')
  process.exit(1)
})
