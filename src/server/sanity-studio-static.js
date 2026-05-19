import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import express from 'express'
import { getSession } from './sessions.js'

const SCRIPT_OPEN_TAG_RE = /<head([^>]*)>/i

const extractSessionId = (req) => {
  const fromQuery = String(req?.query?.session || '').trim()
  if (fromQuery) return fromQuery
  const fromHeader = String(req?.headers?.['x-ship-fast-session'] || '').trim()
  return fromHeader
}

const resolveTenantConfig = (req) => {
  const sessionId = extractSessionId(req)
  if (!sessionId) return null
  try {
    const session = getSession(sessionId)
    const cfg = session?.sanityConfig
    if (!cfg?.projectId || !cfg?.dataset) return null
    return {
      sessionId,
      projectId: String(cfg.projectId),
      dataset: String(cfg.dataset),
      apiVersion: String(cfg.apiVersion || ''),
      writeToken: String(cfg.writeToken || cfg.token || ''),
    }
  } catch {
    return null
  }
}

const renderInjectedIndexHtml = (indexHtml, tenantConfig) => {
  const raw = readFileSync(indexHtml, 'utf8')
  if (!tenantConfig) return raw
  // Tenant Sanity projects are private and created by the operator's management
  // token — end users aren't members, so Studio's default Google/email login
  // returns "Not authorized." Inject the tenant's write token so the embedded
  // Studio auths as the token holder via createMockAuthStore and skips the
  // login wall entirely.
  const payload = JSON.stringify({
    sessionId: tenantConfig.sessionId,
    projectId: tenantConfig.projectId,
    dataset: tenantConfig.dataset,
    apiVersion: tenantConfig.apiVersion,
    token: tenantConfig.writeToken || undefined,
    writeToken: tenantConfig.writeToken || undefined,
  })
  const snippet = `<script>window.__SANITY_SESSION_CONFIG__=${payload};</script>`
  if (SCRIPT_OPEN_TAG_RE.test(raw)) {
    return raw.replace(SCRIPT_OPEN_TAG_RE, (_m, attrs) => `<head${attrs}>${snippet}`)
  }
  return raw.replace(/<html([^>]*)>/i, (_m, attrs) => `<html${attrs}>${snippet}`) || raw
}

const renderStubResponse = (req, res) => {
  const sessionId = extractSessionId(req)
  const session = sessionId ? getSession(sessionId) : null
  const projectId = String(session?.sanityConfig?.projectId || '').trim()
  // When the embedded build is missing but the tenant has its own Sanity project,
  // bounce them straight to the Sanity Manage UI for that project so the click
  // still lands somewhere useful instead of a build-tool error.
  if (projectId) {
    return res.redirect(
      302,
      `https://www.sanity.io/manage/project/${encodeURIComponent(projectId)}`,
    )
  }
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
<p>If you're opening this from a session that hasn't provisioned its own Sanity project yet, click <em>Edit content</em> on the dashboard to provision one — once it's ready you'll be redirected to Sanity Manage automatically.</p>
</body>
</html>`
  res.type('html').send(stub)
}

export function mountEmbeddedSanityStudio(app, studioDist) {
  const indexHtml = join(studioDist, 'index.html')
  if (!existsSync(indexHtml)) {
    app.get(/^\/studio(\/.*)?$/, renderStubResponse)
    return false
  }

  const staticDir = join(studioDist, 'static')
  if (existsSync(staticDir)) {
    app.use('/static', express.static(staticDir))
  }

  app.use((req, res, next) => {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || req.path !== '/studio') return next()
    const search = req.originalUrl.includes('?')
      ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
      : ''
    res.redirect(302, `/studio/${search}`)
  })

  const serveIndex = (req, res) => {
    const tenantConfig = resolveTenantConfig(req)
    try {
      const html = renderInjectedIndexHtml(indexHtml, tenantConfig)
      res.type('html').send(html)
    } catch {
      res.sendFile(indexHtml)
    }
  }

  const router = express.Router()
  // Serve real static assets (chunks, css, fonts) before the catch-all so the
  // SPA bootstrap can fetch its bundles. fallthrough:true lets non-existent
  // paths drop through to the SPA index handler below.
  router.use(
    express.static(studioDist, {
      fallthrough: true,
      index: false,
    }),
  )
  router.get('/', serveIndex)
  router.use((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).end()
      return
    }
    serveIndex(req, res)
  })
  app.use('/studio', router)
  return true
}
