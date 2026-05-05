#!/usr/bin/env bun
/**
 * Take Playwright screenshots for top-K kept iterations of a forge-loop run.
 *
 * Usage:
 *   bun vanilla/scripts/forge-shots.mjs <runId|latest> [K]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, resolve, sep, normalize } from 'node:path'
import { createServer } from 'node:http'
import { chromium } from 'playwright'

const ROOT = process.cwd()
const LOOP_DIR = join(ROOT, 'vanilla', '.forge', 'loop')
const arg0 = process.argv[2] || 'latest'
const K = Math.max(1, parseInt(process.argv[3] || '5', 10))
const PORT = parseInt(process.env.FORGE_PORT || '9889', 10)

let runId = arg0
if (runId === 'latest') runId = readdirSync(LOOP_DIR).sort().pop()
const RUN_DIR = join(LOOP_DIR, runId)
if (!existsSync(RUN_DIR)) {
  console.error(`run not found: ${RUN_DIR}`)
  process.exit(1)
}

const board = JSON.parse(readFileSync(join(RUN_DIR, 'leaderboard.json'), 'utf8'))
const top = board.filter((b) => b.kept).slice(0, K)
console.log(`run ${runId}  top=${top.length}/${board.length}`)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const srv = await new Promise((res) => {
  const s = createServer((req, resp) => {
    try {
      const u = new URL(req.url, 'http://127.0.0.1')
      let p = decodeURIComponent(u.pathname)
      if (p.endsWith('/')) p += 'index.html'
      const abs = resolve(join(ROOT, normalize(p).replace(/^\/+/, '')))
      if (!abs.startsWith(ROOT + sep) || !existsSync(abs) || !statSync(abs).isFile()) {
        resp.writeHead(404)
        return resp.end('404')
      }
      const ext = '.' + abs.split('.').pop().toLowerCase()
      resp.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
      resp.end(readFileSync(abs))
    } catch (e) {
      resp.writeHead(500)
      resp.end(String(e?.message || e))
    }
  })
  s.listen(PORT, '127.0.0.1', () => res(s))
})

const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  for (const t of top) {
    const rel = t.dir.slice(ROOT.length).replace(/^\/+/, '')
    const url = `http://127.0.0.1:${PORT}/${rel}/index.html`
    const shot = join(t.dir, 'shot.png')
    const page = await ctx.newPage()
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
      await page.waitForTimeout(1500)
      await page.screenshot({ path: shot, fullPage: true })
      console.log(`iter ${String(t.iter).padStart(2, '0')}  ms=${t.ms}  shot OK  ${shot}`)
    } catch (e) {
      console.log(`iter ${String(t.iter).padStart(2, '0')}  shot FAIL  ${e?.message || e}`)
    } finally {
      await page.close()
    }
  }
  await ctx.close()
} finally {
  await browser.close()
  srv.close()
}
