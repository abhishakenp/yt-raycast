import { execFileSync, spawn } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { request } from 'node:http'
import { join } from 'node:path'
import { loadSiteSpec } from '@ship-fast/engine/spec/index.js'
import { getSession } from './sessions.js'

const previewState = {
  sessionId: null,
  child: null,
  port: Number(process.env.SHIP_FAST_NEXT_PREVIEW_PORT || 7421),
}

const nextAppPath = (workspace) => join(workspace, 'next-app')

export const hasNextApp = (workspace) => existsSync(join(nextAppPath(workspace), 'package.json'))

export const isNextPreviewFeatureEnabled = () => {
  if (process.env.SHIP_FAST_NEXT_PREVIEW === '0') return false
  if (process.env.NODE_ENV === 'production' && process.env.SHIP_FAST_NEXT_PREVIEW !== '1')
    return false
  return true
}

export const isNextPreviewAutostartEnabled = () =>
  String(process.env.SHIP_FAST_NEXT_PREVIEW_AUTOSTART || '').trim() === '1'

const writeSessionEnvLocal = (workspace, sessionId) => {
  const root = nextAppPath(workspace)
  const session = getSession(sessionId)
  const backend = String(
    process.env.MEDUSA_BACKEND_URL ||
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      'http://localhost:9000',
  ).trim()
  const pub = String(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || backend).trim()
  const pk = String(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '').trim()
  const lines = [`MEDUSA_BACKEND_URL=${backend}`, `NEXT_PUBLIC_MEDUSA_BACKEND_URL=${pub}`]
  if (pk) lines.push(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${pk}`)

  if (session?.medusaConfig) {
    const publishableKey = String(session.medusaConfig.publishableKey || '').trim()
    const medusaBackendUrl = String(session.medusaConfig.backendUrl || '').trim()
    if (publishableKey) lines.push(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey}`)
    if (medusaBackendUrl) lines.push(`NEXT_PUBLIC_MEDUSA_BACKEND_URL=${medusaBackendUrl}`)
  }

  if (session?.sanityConfig) {
    const projectId = String(session.sanityConfig.projectId || '').trim()
    const dataset = String(session.sanityConfig.dataset || '').trim()
    if (projectId) lines.push(`NEXT_PUBLIC_SANITY_PROJECT_ID=${projectId}`)
    if (dataset) lines.push(`NEXT_PUBLIC_SANITY_DATASET=${dataset}`)
  }

  writeFileSync(join(root, '.env.local'), `${lines.join('\n')}\n`, 'utf8')
}

const freePort = (port) => {
  try {
    execFileSync('sh', ['-c', `kill $(lsof -t -i:${port}) 2>/dev/null || true`], {
      stdio: 'ignore',
    })
  } catch {
    void 0
  }
}

const waitForHttp = (port, timeoutMs) =>
  new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs
    const ping = () => {
      const req = request(
        { hostname: '127.0.0.1', port, path: '/', method: 'GET', timeout: 2500 },
        (res) => {
          res.resume()
          resolve()
        },
      )
      req.on('error', () => {
        if (Date.now() > deadline) reject(new Error('Next dev server did not become ready in time'))
        else setTimeout(ping, 400)
      })
      req.on('timeout', () => {
        req.destroy()
        if (Date.now() > deadline) reject(new Error('Next dev server did not become ready in time'))
        else setTimeout(ping, 400)
      })
      req.end()
    }
    ping()
  })

const runBunInstall = (cwd) =>
  new Promise((resolve, reject) => {
    const p = spawn('bun', ['install'], { cwd, stdio: 'ignore', env: { ...process.env } })
    p.on('error', reject)
    p.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error('bun install failed in next-app')),
    )
  })

export const getNextPreviewSnapshot = (session) => {
  if (!isNextPreviewFeatureEnabled()) {
    return { enabled: false, reason: 'disabled' }
  }
  if (!session?.workspace || !hasNextApp(session.workspace)) {
    return { enabled: false, reason: 'no_next_app' }
  }
  const spec = loadSiteSpec(session.workspace)
  const ecommerce = String(spec?.siteType || '').toLowerCase() === 'ecommerce'
  const port = previewState.port
  const url = `http://127.0.0.1:${port}`
  const running =
    previewState.sessionId === session.id &&
    previewState.child &&
    previewState.child.exitCode === null
  return {
    enabled: true,
    ecommerce,
    autostart: isNextPreviewAutostartEnabled(),
    running,
    url: running ? url : null,
    port,
  }
}

const waitUntilReadyAndBroadcast = async (session, broadcast) => {
  try {
    await waitForHttp(previewState.port, 180000)
    const url = `http://127.0.0.1:${previewState.port}`
    broadcast({
      type: 'next_preview_ready',
      url,
      autostart: isNextPreviewAutostartEnabled(),
    })
  } catch (e) {
    broadcast({ type: 'error', message: e?.message || 'Next preview failed to start' })
  }
}

export const startNextPreview = async (session, broadcast) => {
  if (!isNextPreviewFeatureEnabled()) throw new Error('Next preview is disabled')
  if (!session?.workspace) throw new Error('Invalid session')
  if (!hasNextApp(session.workspace)) throw new Error('No Next.js app in workspace')
  const root = nextAppPath(session.workspace)
  if (previewState.child && previewState.sessionId && previewState.sessionId !== session.id) {
    try {
      previewState.child.kill('SIGTERM')
    } catch {
      void 0
    }
    previewState.child = null
    previewState.sessionId = null
    freePort(previewState.port)
  }
  if (
    previewState.sessionId === session.id &&
    previewState.child &&
    previewState.child.exitCode === null
  ) {
    const url = `http://127.0.0.1:${previewState.port}`
    return { ok: true, running: true, url }
  }
  freePort(previewState.port)
  writeSessionEnvLocal(session.workspace, session.id)
  if (!existsSync(join(root, 'node_modules'))) {
    await runBunInstall(root)
  }
  const port = previewState.port
  const child = spawn('bun', ['run', 'dev', '--', '-H', '127.0.0.1', '-p', String(port)], {
    cwd: root,
    stdio: 'ignore',
    env: { ...process.env },
    detached: false,
  })
  child.on('exit', () => {
    if (previewState.child === child) {
      previewState.child = null
      previewState.sessionId = null
    }
  })
  child.on('error', () => {
    if (previewState.child === child) {
      previewState.child = null
      previewState.sessionId = null
    }
  })
  previewState.child = child
  previewState.sessionId = session.id
  void waitUntilReadyAndBroadcast(session, broadcast)
  return { ok: true, starting: true, port }
}

export const stopNextPreview = (sessionId) => {
  if (!previewState.child || previewState.sessionId !== sessionId)
    return { ok: true, stopped: false }
  try {
    previewState.child.kill('SIGTERM')
  } catch {
    void 0
  }
  previewState.child = null
  previewState.sessionId = null
  freePort(previewState.port)
  return { ok: true, stopped: true }
}

export const shutdownNextPreview = () => {
  if (previewState.child) {
    try {
      previewState.child.kill('SIGTERM')
    } catch {
      void 0
    }
    previewState.child = null
    previewState.sessionId = null
  }
}
