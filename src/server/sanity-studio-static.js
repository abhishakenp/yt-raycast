import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import express from 'express'
import { getSession } from './sessions.js'

function injectSessionConfig(html, sessionId) {
  const session = sessionId ? getSession(sessionId) : null
  const projectId = String(session?.sanityConfig?.projectId || '').trim()
  const dataset = String(session?.sanityConfig?.dataset || '').trim()
  const script = `<script>window.__SANITY_SESSION_CONFIG__ = ${JSON.stringify({
    projectId,
    dataset,
  })};</script>`
  return html.includes('</head>')
    ? html.replace('</head>', `${script}\n</head>`)
    : `${html}\n${script}`
}

export function mountEmbeddedSanityStudio(app, studioDist) {
  const indexHtml = join(studioDist, 'index.html')
  if (!existsSync(indexHtml)) {
    const stub = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Sanity Studio not built</title>
<style>
body{font-family:system-ui,sans-serif;background:#111;color:#e4e4e7;padding:2rem;max-width:40rem;margin:0 auto;line-height:1.5}
code{background:#27272a;padding:2px 6px;border-radius:4px}
</style>
</head>
<body>
<h1>Sanity Studio is not built yet</h1>
<p>Run <code>bun run studio:build</code> from the Ship Fast repo root, then restart the server. The dashboard Site content panel embeds Studio at this URL.</p>
</body>
</html>`
    app.get(/^\/studio(\/.*)?$/, (_req, res) => {
      res.type('html').send(stub)
    })
    return false
  }

  const staticDir = join(studioDist, 'static')
  if (existsSync(staticDir)) {
    // Sanity build uses basePath=/studio so assets are referenced as /studio/static/...
    app.use('/studio/static', express.static(staticDir))
    // Also serve at /static for backwards compat
    app.use('/static', express.static(staticDir))
  }

  const studioHtml = readFileSync(indexHtml, 'utf8')

  app.get('/api/sessions/:id/studio-config', (req, res) => {
    const session = getSession(req.params.id)
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    res.json({
      projectId: String(session?.sanityConfig?.projectId || '').trim(),
      dataset: String(session?.sanityConfig?.dataset || '').trim(),
    })
  })

  // Redirect /studio -> /studio/
  app.use((req, res, next) => {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || req.path !== '/studio') return next()
    res.redirect(302, '/studio/')
  })

  // Studio is served at /studio/ (matching basePath in sanity.cli.ts).
  // Session is identified via ?session=<sessionId> query param so the URL stays
  // at /studio/* and doesn't break Sanity's internal router.
  const router = express.Router()

  // index.html — inject session config from ?session= query param
  router.get(['/', '/index.html'], (req, res) => {
    const sessionId = String(req.query.session || '')
    res.type('html').send(injectSessionConfig(studioHtml, sessionId))
  })

  // Static assets (JS, CSS, images) — served directly, no injection
  router.use(express.static(studioDist))

  // SPA fallback — all other paths get index.html with session injection
  router.use((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).end()
      return
    }
    const sessionId = String(req.query.session || '')
    res.type('html').send(injectSessionConfig(studioHtml, sessionId))
  })

  app.use('/studio', router)
  return true
}
