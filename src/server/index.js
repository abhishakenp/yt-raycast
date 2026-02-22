import { createServer as createHttpServer } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { DASHBOARD_PORT, PREVIEW_PORT } from '../config.js'
import { getState } from './state.js'
import { setupWebSocket } from './websocket.js'
import { broadcast } from './state.js'

const __dir = fileURLToPath(new URL('..', import.meta.url))
const publicDir = join(__dir, '..', 'public')

export async function startServer(workspace) {
  const app = express()
  app.use(express.json())

  app.get('/', (_req, res) => {
    res.sendFile(join(publicDir, 'dashboard.html'))
  })

  app.get('/api/tasks', (_req, res) => {
    const { tasks } = getState()
    res.json(tasks)
  })

  app.post('/api/status', (req, res) => {
    broadcast({ type: 'status', message: req.body.status ?? '', phase: req.body.phase ?? '' })
    res.json({ ok: true })
  })

  const httpServer = createHttpServer(app)
  setupWebSocket(httpServer)

  await new Promise((resolve) => httpServer.listen(DASHBOARD_PORT, resolve))
  console.log(`  Dashboard \u2192 http://localhost:${DASHBOARD_PORT}`)

  const previewApp = express()
  previewApp.use(express.static(workspace, { extensions: ['html'] }))
  await new Promise((resolve) => previewApp.listen(PREVIEW_PORT, resolve))
  console.log(`  Preview   \u2192 http://localhost:${PREVIEW_PORT}`)
}
