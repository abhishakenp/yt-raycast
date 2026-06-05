import { WebSocketServer } from 'ws'
import { getOpenUIStreamReplayMessages, getSession } from './sessions.js'

let _wss = null
const devReloadClients = new Set()

const safeSendData = (ws, data) => {
  if (ws.readyState !== 1) return false
  try {
    ws.send(data)
    return true
  } catch (error) {
    console.warn('[WebSocket] Failed to send message', {
      sessionId: ws.sessionId || null,
      message: error?.message || String(error),
    })
    try {
      ws.terminate?.()
    } catch {}
    return false
  }
}

const safeSendJson = (ws, msg) => safeSendData(ws, JSON.stringify(msg))

export const broadcastDevReload = (msg) => {
  const data = JSON.stringify(msg)
  for (const ws of devReloadClients) {
    safeSendData(ws, data)
  }
}

export function setupWebSocket(httpServer) {
  _wss = new WebSocketServer({ server: httpServer })

  _wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost')
    const sessionId = url.searchParams.get('session')
    console.log('[WebSocket] Incoming connection', {
      rawUrl: req.url,
      sessionId,
      remoteAddress: req.socket?.remoteAddress || null,
      headers: {
        host: req.headers?.host,
      },
    })
    if (process.env.NODE_ENV !== 'production' && url.searchParams.get('devReload') === '1') {
      devReloadClients.add(ws)
      ws.on('error', (error) => {
        console.warn('[WebSocket] Dev reload socket error', {
          message: error?.message || String(error),
        })
      })
      ws.on('close', () => devReloadClients.delete(ws))
      return
    }
    const session = sessionId ? getSession(sessionId) : null

    if (!session) {
      console.warn('[WebSocket] Rejected connection: invalid or missing session', sessionId)
      ws.close(4001, 'Invalid session')
      return
    }

    ws.sessionId = sessionId
    session.wsClients.add(ws)
    console.log('[WebSocket] Client attached', {
      sessionId,
      totalClients: session.wsClients.size,
    })

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
    if (prompt) safeSendJson(ws, { type: 'prompt', text: prompt })
    if (lastStatus) safeSendJson(ws, lastStatus)
    if (tasks.length > 0) safeSendJson(ws, { type: 'tasks_loaded', tasks })
    if (siteSpecReady) safeSendJson(ws, { type: 'site_spec_ready', ready: true })
    if (homepageReady) safeSendJson(ws, { type: 'homepage_ready' })
    for (const message of getOpenUIStreamReplayMessages(session, '/')) {
      safeSendJson(ws, message)
    }
    if (alternativeDesign)
      safeSendJson(ws, { type: 'alternative_design_ready', design: alternativeDesign })
    if (themeOverride)
      safeSendJson(ws, { type: 'theme_override_loaded', theme: themeOverride })
    if (deployment?.url)
      safeSendJson(ws, { type: 'deployed', slug: deployment.slug, url: deployment.url })

    ws.on('error', (error) => {
      console.warn('[WebSocket] Client socket error', {
        sessionId,
        message: error?.message || String(error),
      })
      session.wsClients.delete(ws)
    })

    ws.on('close', () => {
      session.wsClients.delete(ws)
      console.log('[WebSocket] Client closed', { sessionId, totalClients: session.wsClients.size })
    })
  })

  return _wss
}
