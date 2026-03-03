import { createServer as createHttpServer } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { DASHBOARD_PORT } from '../config.js'
import { createSession, getSession, getAllSessions, deleteSession, makeSessionState, initSessionDir } from './sessions.js'
import { setupWebSocket } from './websocket.js'
import { runAll, runEdit, generateAlternativeDesign } from '../pipeline/runner.js'
import { existsSync, readFileSync } from 'node:fs'
import { verifyIdToken } from '../auth/firebase-admin.js'

const __dir = fileURLToPath(new URL('..', import.meta.url))
const publicDir = join(__dir, '..', 'public')

let _sessionsDir = null

export async function startServer(sessionsDir) {
  _sessionsDir = sessionsDir
  initSessionDir(sessionsDir)
  const app = express()
  app.use(express.json())

  // ─── Plausible Analytics Proxy ──────────────────────────
  const plausibleHost = 'https://plausible.liviogama.com'
  app.get('/js/script.js', async (_req, res) => {
    try {
      const r = await fetch(`${plausibleHost}/js/script.js`)
      res.set('Content-Type', 'application/javascript')
      res.set('Cache-Control', 'public, max-age=86400')
      res.send(Buffer.from(await r.arrayBuffer()))
    } catch { res.status(502).end() }
  })
  app.post('/api/event', express.text({ type: '*/*' }), async (req, res) => {
    try {
      const r = await fetch(`${plausibleHost}/api/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': req.headers['user-agent'] || '',
          'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip,
        },
        body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
      })
      res.status(r.status).end()
    } catch { res.status(502).end() }
  })

  // ─── Auth middleware ──────────────────────────────────────
  async function requireAuth(req, res, next) {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
    try {
      const decoded = await verifyIdToken(auth.slice(7))
      req.user = { uid: decoded.uid, email: decoded.email }
      next()
    } catch {
      res.status(401).json({ error: 'Unauthorized' })
    }
  }

  // ─── Public: Firebase client config ──────────────────────
  app.get('/api/config', (_req, res) => {
    res.json({
      apiKey: process.env.FIREBASE_API_KEY ?? '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? '',
      projectId: process.env.FIREBASE_PROJECT_ID ?? '',
      appId: process.env.FIREBASE_APP_ID ?? '',
    })
  })

  // Serve public statically
  app.use(express.static(publicDir))

  // ─── Prompt page (landing) ────────────────────────────────
  app.get('/', (_req, res) => {
    res.sendFile(join(publicDir, 'index.html'))
  })

  // ─── Dashboard (session-scoped) ───────────────────────────
  app.get('/session/:id', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).send('Session not found')
    res.sendFile(join(publicDir, 'dashboard.html'))
  })

  // ─── API: Create session + start generation ───────────────
  app.post('/api/sessions', requireAuth, async (req, res) => {
    const { prompt } = req.body
    if (!prompt?.trim()) return res.status(400).json({ error: 'prompt is required' })

    const session = createSession(_sessionsDir, prompt.trim(), req.user.uid)
    const sessionCtx = makeSessionState(session)

    // Slack notification in production
    if (process.env.NODE_ENV !== 'development' && process.env.SLACK_WEBHOOK_URL) {
      fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `🚀 New Ship Fast prompt:\n> ${prompt.trim().slice(0, 500)}` }),
      }).catch(() => {})
    }

    // Determine edit vs generate mode
    let editMode = false
    try {
      const tasksFile = join(session.workspace, 'tasks.json')
      const hasIndex = existsSync(join(session.workspace, 'index.html'))
      if (hasIndex && existsSync(tasksFile)) {
        const data = JSON.parse(readFileSync(tasksFile, 'utf-8'))
        const tasks = data.tasks ?? []
        editMode = tasks.length > 0 && tasks.every((t) => ['DONE', 'FAILED'].includes(t.status))
      }
    } catch {
      /* tasks.json may not exist */
    }

    // Fire and forget the generation
    const generation = editMode
      ? runEdit({ prompt: session.prompt, workspace: session.workspace, sessionCtx })
      : runAll({ prompt: session.prompt, workspace: session.workspace, sessionCtx })

    generation.catch((err) => {
      console.error(`  Session ${session.id} error:`, err?.message ?? err)
      sessionCtx.broadcast({ type: 'error', message: err?.message ?? 'Generation failed' })
    })

    res.json({ id: session.id, workspace: session.workspace })
  })

  // ─── API: List sessions ───────────────────────────────────
  app.get('/api/sessions', requireAuth, (req, res) => {
    res.json(getAllSessions(req.user.uid))
  })

  // ─── API: Delete session ─────────────────────────────────
  app.delete('/api/sessions/:id', requireAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' })
    deleteSession(req.params.id)
    res.json({ ok: true })
  })

  // ─── API: Delete all sessions ──────────────────────────
  app.delete('/api/sessions', requireAuth, (req, res) => {
    const all = getAllSessions(req.user.uid)
    for (const s of all) deleteSession(s.id)
    res.json({ ok: true, deleted: all.length })
  })

  // ─── API: Session info ───────────────────────────────────
  app.get('/api/sessions/:id', requireAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' })
    res.json({ id: session.id, prompt: session.prompt, createdAt: session.createdAt, homepageReady: session.homepageReady, taskCount: session.tasks.length, done: session.tasks.filter((t) => t.status === 'DONE').length })
  })

  // ─── API: Session tasks ───────────────────────────────────
  app.get('/api/sessions/:id/tasks', requireAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' })
    res.json(session.tasks)
  })

  // ─── API: Session status ──────────────────────────────────
  app.post('/api/sessions/:id/status', requireAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' })
    const sessionCtx = makeSessionState(session)
    sessionCtx.broadcast({
      type: 'status',
      message: req.body.status ?? '',
      phase: req.body.phase ?? '',
    })
    res.json({ ok: true })
  })

  // ─── API: Generate alternative design (on-demand) ─────────
  app.post('/api/sessions/:id/generate-design', requireAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' })

    const sessionCtx = makeSessionState(session)
    const _log = (msg) => {
      console.log(msg)
      sessionCtx.broadcast({ type: 'log', message: msg })
    }

    // Generate in background
    generateAlternativeDesign(session.prompt, session.workspace, sessionCtx, _log).catch((err) => {
      _log(`✗ Design generation error: ${err.message}`)
    })

    res.json({ ok: true, message: 'Generating alternative design...' })
  })

  // ─── Preview: per-session workspace static files ──────────
  app.use('/preview/:sessionId', requireAuth, async (req, res, next) => {
    const session = getSession(req.params.sessionId)
    if (!session) return res.status(404).send('Session not found')
    if (session.userId !== req.user.uid) return res.status(403).send('Forbidden')
    express.static(session.workspace, { extensions: ['html'] })(req, res, next)
  })

  const httpServer = createHttpServer(app)
  setupWebSocket(httpServer)

  await new Promise((resolve) => httpServer.listen(DASHBOARD_PORT, resolve))
  console.log(`  Server      → http://localhost:${DASHBOARD_PORT}`)
  console.log(`  Sessions dir: ${_sessionsDir}`)
}

/** Start a session from CLI (backward compat) */
export async function startCLISession(workspace, prompt) {
  const session = createSession(_sessionsDir || workspace, prompt)
  // Override workspace to the user-specified one
  session.workspace = workspace
  const sessionCtx = makeSessionState(session)

  let editMode = false
  try {
    const tasksFile = join(workspace, 'tasks.json')
    const hasIndex = existsSync(join(workspace, 'index.html'))
    if (hasIndex && existsSync(tasksFile)) {
      const data = JSON.parse(readFileSync(tasksFile, 'utf-8'))
      const tasks = data.tasks ?? []
      editMode = tasks.length > 0 && tasks.every((t) => ['DONE', 'FAILED'].includes(t.status))
    }
  } catch {
    /* tasks.json may not exist */
  }

  console.log(
    `  MODE: ${editMode ? 'edit (applying changes to existing site)' : 'generate (fresh build)'}`,
  )
  console.log(`  Session: ${session.id}\n`)

  const generation = editMode
    ? runEdit({ prompt, workspace, sessionCtx })
    : runAll({ prompt, workspace, sessionCtx })

  return { session, generation }
}
