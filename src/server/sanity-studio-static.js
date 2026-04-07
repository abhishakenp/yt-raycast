import { existsSync } from 'node:fs'
import { join } from 'node:path'
import express from 'express'

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
    app.use('/static', express.static(staticDir))
  }

  app.use((req, res, next) => {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || req.path !== '/studio') return next()
    res.redirect(302, '/studio/')
  })

  const router = express.Router()
  router.use(express.static(studioDist))
  router.use((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).end()
      return
    }
    res.sendFile(indexHtml)
  })
  app.use('/studio', router)
  return true
}
