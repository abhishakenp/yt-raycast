import { spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { passesHomepagePublicDesignVerification } from '../src/pipeline/ralph-homepage-score.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const parseArgs = (argv) => {
  const out = { paths: [], flags: new Set(), kv: {} }
  for (const a of argv) {
    if (a.startsWith('--')) {
      const eq = a.indexOf('=')
      if (eq > -1) out.kv[a.slice(2, eq)] = a.slice(eq + 1)
      else out.flags.add(a.slice(2))
    } else out.paths.push(a)
  }
  return out
}

const serveFile = (absPath, port) => {
  const body = readFileSync(absPath)
  return new Promise((res) => {
    const srv = createServer((req, res) => {
      const ok = req.url === '/' || req.url === `/${basename(absPath)}`
      if (!ok) {
        res.writeHead(404)
        return res.end()
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(body)
    })
    srv.listen(port, '127.0.0.1', () => res(srv))
  })
}

const main = async () => {
  const { paths, flags, kv } = parseArgs(process.argv.slice(2))
  const htmlPath = paths[0] ? resolve(paths[0]) : ''
  if (!htmlPath || !existsSync(htmlPath)) {
    console.error(
      'usage: node scripts/homepage-quality-gate.mjs <index.html> [--ref=public/designs/...] [--site=saas] [--screenshot]  (screenshot → .ab-compare/quality-gate-last.png unless html is under .ab-compare/ or HOMEPAGE_GATE_SHOT_OUT is set)',
    )
    process.exit(2)
  }
  const refArg = kv.ref
    ? kv.ref.startsWith('/')
      ? resolve(kv.ref)
      : resolve(root, kv.ref)
    : ''
  const refPath = refArg && existsSync(refArg) ? refArg : ''
  const siteType = String(kv.site || 'landing').toLowerCase()
  const html = readFileSync(htmlPath, 'utf8')
  const prPath = join(dirname(htmlPath), 'prompt-round.txt')
  const prompt = existsSync(prPath) ? String(readFileSync(prPath, 'utf8') || '').trim() : ''
  const safePrompt = prompt || 'homepage'
  const v = passesHomepagePublicDesignVerification(html, safePrompt, refPath, siteType)
  const report = { ok: v.ok, feedback: v.feedback || '', htmlPath, refPath: refPath || null, siteType }
  console.log(JSON.stringify(report, null, 2))
  const rootNorm = root.replace(/\\/g, '/')
  const htmlDirNorm = dirname(htmlPath).replace(/\\/g, '/')
  const underAbCompare = htmlDirNorm.startsWith(`${rootNorm}/.ab-compare/`)
  if (underAbCompare) {
    writeFileSync(join(dirname(htmlPath), 'quality-gate.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  }
  if (flags.has('screenshot')) {
    const outPngEnv = process.env.HOMEPAGE_GATE_SHOT_OUT && resolve(process.env.HOMEPAGE_GATE_SHOT_OUT)
    const outPng =
      outPngEnv ||
      (underAbCompare ? join(dirname(htmlPath), 'quality-gate.png') : join(root, '.ab-compare', 'quality-gate-last.png'))
    if (!outPngEnv && !underAbCompare) {
      mkdirSync(join(root, '.ab-compare'), { recursive: true })
    }
    const port = Math.max(2048, Math.min(65000, parseInt(process.env.HOMEPAGE_GATE_PORT || '0', 10) || 9700 + Math.floor(Math.random() * 200)))
    const srv = await serveFile(htmlPath, port)
    const url = `http://127.0.0.1:${port}/${basename(htmlPath)}`
    const ok =
      spawnSync('agent-browser', ['set', 'viewport', '1440', '900'], { stdio: 'inherit' }).status === 0 &&
      spawnSync('agent-browser', ['open', url], { stdio: 'inherit' }).status === 0 &&
      spawnSync('agent-browser', ['wait', '--load', 'networkidle'], { stdio: 'inherit' }).status === 0 &&
      spawnSync('agent-browser', ['wait', '2000'], { stdio: 'inherit' }).status === 0 &&
      spawnSync('agent-browser', ['screenshot', '--full', outPng], { stdio: 'inherit' }).status === 0
    srv.close()
    if (!ok) console.error('agent-browser screenshot failed (install agent-browser or set RALPH_SKIP_BROWSER=1 for ralph script)')
    else console.error(`wrote ${outPng}`)
  }
  process.exit(v.ok ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
