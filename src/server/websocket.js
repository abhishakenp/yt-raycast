import { WebSocketServer } from 'ws'
import { getOpenUIStreamReplayMessages, getSession } from './sessions.js'

let _wss = null
const devReloadClients = new Set()

export const broadcastDevReload = (msg) => {
  const data = JSON.stringify(msg)
  for (const ws of devReloadClients) {
    if (ws.readyState === 1) ws.send(data)
  }
}

export function setupWebSocket(httpServer) {
  _wss = new WebSocketServer({ server: httpServer })

  _wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost')
    if (process.env.NODE_ENV !== 'production' && url.searchParams.get('devReload') === '1') {
      devReloadClients.add(ws)
      ws.on('close', () => devReloadClients.delete(ws))
      return
    }
    const sessionId = url.searchParams.get('session')
    const session = sessionId ? getSession(sessionId) : null

    if (!session) {
      ws.close(4001, 'Invalid session')
      return
    }

    ws.sessionId = sessionId
    session.wsClients.add(ws)

    // Send current state to newly connected client
    const {
      prompt,
      lastStatus,
      tasks,
      homepageReady,
      siteSpecReady,
      alternativeDesign,
      themeOverride,
      deployment,
    } = {
      prompt: session.prompt,
      lastStatus: session.lastStatus,
      tasks: session.tasks,
      homepageReady: session.homepageReady,
      siteSpecReady: session.siteSpecReady,
      alternativeDesign: session.alternativeDesign,
      themeOverride: session.themeOverride,
      deployment: session.deployment,
    }
    if (prompt) ws.send(JSON.stringify({ type: 'prompt', text: prompt }))
    if (lastStatus) ws.send(JSON.stringify(lastStatus))
    if (tasks.length > 0) ws.send(JSON.stringify({ type: 'tasks_loaded', tasks }))
    if (siteSpecReady) ws.send(JSON.stringify({ type: 'site_spec_ready', ready: true }))
    if (homepageReady) ws.send(JSON.stringify({ type: 'homepage_ready' }))
    for (const message of getOpenUIStreamReplayMessages(session, '/')) {
      ws.send(JSON.stringify(message))
    }
    if (alternativeDesign)
      ws.send(JSON.stringify({ type: 'alternative_design_ready', design: alternativeDesign }))
    if (themeOverride)
      ws.send(JSON.stringify({ type: 'theme_override_loaded', theme: themeOverride }))
    if (deployment?.url)
      ws.send(JSON.stringify({ type: 'deployed', slug: deployment.slug, url: deployment.url }))

    ws.on('close', () => {
      session.wsClients.delete(ws)
    })
  })

  return _wss
}
