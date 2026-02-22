import { createServer as createHttpServer } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { DASHBOARD_PORT, VALID_SITE_TYPES } from '../config.js'
import { createSession, getSession, getAllSessions, makeSessionState, initSessionDir } from './sessions.js'
import { setupWebSocket } from './websocket.js'
import { runAll, runEdit, generateAlternativeDesign } from '../pipeline/runner.js'
import { groqTemplate } from '../llm/groq.js'
import { existsSync, readFileSync } from 'node:fs'

const __dir = fileURLToPath(new URL('..', import.meta.url))
const publicDir = join(__dir, '..', 'public')
const assetsDir = join(__dir, '..', 'assets')

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

  // Serve public and assets statically
  app.use('/assets', express.static(assetsDir))
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
  app.post('/api/sessions', async (req, res) => {
    const { prompt } = req.body
    if (!prompt?.trim()) return res.status(400).json({ error: 'prompt is required' })

    const session = createSession(_sessionsDir, prompt.trim())
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
  app.get('/api/sessions', (_req, res) => {
    res.json(getAllSessions())
  })

  // ─── API: Session info ───────────────────────────────────
  app.get('/api/sessions/:id', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json({ id: session.id, prompt: session.prompt, createdAt: session.createdAt, homepageReady: session.homepageReady, taskCount: session.tasks.length, done: session.tasks.filter((t) => t.status === 'DONE').length })
  })

  // ─── API: Session tasks ───────────────────────────────────
  app.get('/api/sessions/:id/tasks', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session.tasks)
  })

  // ─── API: Session status ──────────────────────────────────
  app.post('/api/sessions/:id/status', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    const sessionCtx = makeSessionState(session)
    sessionCtx.broadcast({
      type: 'status',
      message: req.body.status ?? '',
      phase: req.body.phase ?? '',
    })
    res.json({ ok: true })
  })

  // ─── API: Generate alternative design (on-demand) ─────────
  app.post('/api/sessions/:id/generate-design', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

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

  // ─── API: Generate template for site type ──────────────────
  app.get('/api/templates/:siteType', async (req, res) => {
    const siteType = req.params.siteType?.toLowerCase()

    if (!siteType || !VALID_SITE_TYPES.includes(siteType)) {
      return res.status(400).json({
        error: `Invalid site type. Valid options: ${VALID_SITE_TYPES.join(', ')}`,
      })
    }

    try {
      const result = await groqTemplate(siteType)

      if (result.error) {
        return res.status(500).json({ error: result.error })
      }

      res.set('Content-Type', 'text/html; charset=utf-8')
      res.send(result.content)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ─── Preview: per-session workspace static files ──────────
  app.use('/preview/:sessionId', async (req, res, next) => {
    const session = getSession(req.params.sessionId)
    if (!session) return res.status(404).send('Session not found')
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
