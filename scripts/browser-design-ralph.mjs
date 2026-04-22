import { spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, resolve, sep, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runAll } from '../src/pipeline/runner.js'
import { passesHomepagePublicDesignVerification, scoreRalphHomepage } from '../src/pipeline/ralph-homepage-score.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const CASE_SITE = {
  'design-01-gov': 'institutional',
  'design-02-admin': 'dashboard',
  'design-03-saas': 'saas',
  'design-04-docs': 'docs',
  'design-05-ecom': 'ecommerce',
}
const outBase = join(root, '.ab-compare', 'browser-gen-ralph')
const refBase = join(root, 'public', 'designs')

const CASES = [
  {
    id: 'design-01-gov',
    refHtml: 'design-01-government-portal.html',
    prompts: [
      'Institutional citizen portal (not a store): municipal services, tenders, schemes, accessibility; formal public-sector UI.',
      'Stronger: match reference-tier depth — notices strip, service grid, news, multi-column footer, data-mobile-nav and data-accordion.',
    ],
  },
  {
    id: 'design-02-admin',
    refHtml: 'design-02-admin-panel.html',
    prompts: [
      'INTERNAL DASHBOARD APPLICATION (not ecommerce, not a shop): analytics workspace with left sidebar, KPI tiles, chart region, recent activity table, dark shell — avoid storefront or catalog language.',
      'INTERNAL DASHBOARD APPLICATION (same): at least six <section> regions, sidebar + main + chart band + table band + activity + settings; wire data-mobile-nav, data-tab-group, and data-accordion; KPI tiles row; dense admin analytics UI — not a marketing landing.',
      'INTERNAL DASHBOARD APPLICATION (same): six or more named sections (Overview, Metrics, Charts, Activity, Alerts, Integrations), each as <section>; include data-carousel for metrics strip if needed; dark dashboard only.',
    ],
  },
  {
    id: 'design-03-saas',
    refHtml: 'design-03-saas-homepage.html',
    prompts: [
      'B2B SaaS marketing site: hero, proof, feature grid, pricing band, docs CTA, footer; trust-oriented developer aesthetic.',
      'Eight major bands minimum; display + mono pairing; layered cards; dynamic UI hooks (nav, accordion, pricing toggle).',
      'Vague SaaS: AI-first workflow product for teams — dense dark landing: aurora-style hero layers, split terminal or demo panel, proof metrics grid, pricing with monthly/yearly toggle (data-bill or data-pricing-billing), FAQ accordion (data-acc or data-accordion), penultimate CTA band, rich footer. Tailwind CDN + theme.extend only; vanilla JS for interactions.',
    ],
  },
  {
    id: 'design-04-docs',
    refHtml: 'design-04-docs-site.html',
    prompts: [
      'Developer documentation hub: global search, version pill, quickstart code sample, topic grid; calm technical look.',
      'Increase density: multiple nav bands, secondary links, FAQ or guides strip; keep keyboard-friendly and readable.',
    ],
  },
  {
    id: 'design-05-ecom',
    refHtml: 'design-05-ecommerce.html',
    prompts: [
      'Luxury editorial ecommerce storefront: promo strip, shop header with cart, hero, collections, featured tiles with prices, reviews, newsletter.',
      'Retail bar: six or more SKU-style cards, merchandising depth, id=cart-toggle on bag control, dense footer.',
    ],
  },
]

const sessionCtx = {
  broadcast: () => {},
  setPrompt: () => {},
  setTasks: () => {},
  setSiteSpec: () => {},
  updateTask: () => {},
  signalHomepageReady: () => {},
  setElapsed: () => {},
  setCost: () => {},
  setAlternativeDesign: () => {},
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

function startStaticServer(port) {
  const handler = (req, res) => {
    try {
      const u = new URL(req.url || '/', 'http://127.0.0.1')
      let pathname = decodeURIComponent(u.pathname)
      if (pathname.endsWith('/')) pathname += 'index.html'
      const abs = resolve(join(root, normalize(pathname).replace(/^\/+/, '')))
      if (!abs.startsWith(root + sep) && abs !== root) {
        res.writeHead(403)
        return res.end('forbidden')
      }
      if (!existsSync(abs) || !statSync(abs).isFile()) {
        res.writeHead(404)
        return res.end('not found')
      }
      const ext = abs.includes('.') ? `.${abs.split('.').pop().toLowerCase()}` : ''
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
      res.end(readFileSync(abs))
    } catch {
      res.writeHead(500)
      res.end('error')
    }
  }
  return new Promise((resolveSrv) => {
    const srv = createServer(handler)
    srv.listen(port, '127.0.0.1', () => resolveSrv(srv))
  })
}

function ab(args) {
  const r = spawnSync('agent-browser', args, { stdio: 'inherit', shell: false })
  return r.status === 0
}

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY required')
    process.exit(1)
  }
  const port = Math.max(1024, Math.min(65535, parseInt(process.env.RALPH_PORT || '9888', 10) || 9888))
  const maxRound = Math.max(1, Math.min(12, parseInt(process.env.RALPH_MAX_ROUNDS || '5', 10) || 5))
  const minScore = Math.max(50, Math.min(100, parseInt(process.env.RALPH_MIN_SCORE || '88', 10) || 88))
  const skipGen = process.env.RALPH_SKIP_GEN === '1'
  const forceGen = process.env.RALPH_FORCE === '1'
  const skipBrowser = process.env.RALPH_SKIP_BROWSER === '1'

  mkdirSync(outBase, { recursive: true })
  const srv = await startStaticServer(port)
  const base = `http://127.0.0.1:${port}`
  const only = (process.env.RALPH_ONLY || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const cases = only.length ? CASES.filter((c) => only.includes(c.id)) : CASES

  const lines = []
  const push = (s) => {
    lines.push(s)
    console.error(s)
  }

  push(`RALPH static root: ${root}`)
  push(`RALPH base URL: ${base}`)
  if (only.length) push(`RALPH_ONLY: ${only.join(', ')}`)

  for (const c of cases) {
    const ws = join(outBase, c.id)
    mkdirSync(ws, { recursive: true })
    const refAbs = join(refBase, c.refHtml)
    const siteType = CASE_SITE[c.id] || 'landing'
    let passed = false
    let priorFeedback = ''
    for (let round = 0; round < maxRound && !passed; round++) {
      const basePrompt = c.prompts[Math.min(round, c.prompts.length - 1)]
      const prompt = priorFeedback
        ? `${basePrompt}\n\n── Ralph evaluation (previous homepage — fix all items) ──\n${priorFeedback}\n── End evaluation ──`
        : basePrompt
      const idxPath = join(ws, 'index.html')
      const shouldRun =
        !skipGen && (forceGen || !existsSync(idxPath) || (round > 0 && !passed))
      if (shouldRun) {
        writeFileSync(join(ws, 'prompt-round.txt'), prompt, 'utf8')
        push(`\n── generate ${c.id} round ${round + 1}/${maxRound} (minScore=${minScore}) ──`)
        try {
          await runAll({
            prompt,
            workspace: ws,
            sessionCtx,
            preferredLanguage: 'en',
          })
        } catch (e) {
          push(`FAILED runAll: ${e?.message || e}`)
        }
      }
      const html = existsSync(idxPath) ? readFileSync(idxPath, 'utf8') : ''
      const ver = passesHomepagePublicDesignVerification(html, prompt, refAbs, siteType)
      const sc = scoreRalphHomepage(html, {
        prompt,
        refPath: refAbs,
        minScore,
        refTight: true,
        siteType,
      })
      priorFeedback = ver.ok ? '' : ver.feedback || sc.feedback || sc.reasons?.join('; ') || 'Improve depth and interactivity.'
      writeFileSync(
        join(ws, `score-r${round + 1}.json`),
        JSON.stringify({ ...sc, minScore, verificationOk: ver.ok, verificationFeedback: ver.feedback }, null, 2),
        'utf8',
      )
      if (!ver.ok) writeFileSync(join(ws, `feedback-r${round + 1}.txt`), priorFeedback, 'utf8')
      push(
        `score ${c.id} r${round + 1}: ${sc.score}/100 verify=${ver.ok} ${ver.ok ? sc.reasons?.join('; ') || '' : priorFeedback}`,
      )
      const genUrl = `${base}/.ab-compare/browser-gen-ralph/${c.id}/index.html`
      if (!ver.ok && !skipBrowser) {
        ab(['set', 'viewport', '1440', '900'])
        ab(['open', genUrl])
        ab(['wait', '--load', 'networkidle'])
        ab(['wait', '2000'])
        ab(['screenshot', '--full', join(ws, `fail-r${round + 1}.png`)])
      }
      if (ver.ok) passed = true
    }

    const genUrl = `${base}/.ab-compare/browser-gen-ralph/${c.id}/index.html`
    const refUrl = `${base}/public/designs/${c.refHtml}`
    const shotGen = join(ws, 'full-page-gen.png')
    const shotRef = join(ws, 'full-page-ref.png')

    if (!skipBrowser) {
      ab(['set', 'viewport', '1440', '900'])
      ab(['open', refUrl])
      ab(['wait', '3000'])
      ab(['screenshot', '--full', shotRef])
      ab(['open', genUrl])
      ab(['wait', '--load', 'networkidle'])
      ab(['wait', '2500'])
      ab(['screenshot', '--full', shotGen])
    }

    push(`reference preview: ${refUrl}`)
    push(`generated preview: ${genUrl}`)
    if (!skipBrowser) {
      push(`screens ref: ${shotRef}`)
      push(`screens gen: ${shotGen}`)
    }
  }

  srv.close()
  const reportPath = join(outBase, 'ralph-report.txt')
  writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8')
  console.error(`\nWrote ${reportPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
