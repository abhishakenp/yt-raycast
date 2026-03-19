import { WebSocketServer } from 'ws'
import { getSession } from './sessions.js'

let _wss = null

export function setupWebSocket(httpServer) {
  _wss = new WebSocketServer({ server: httpServer })

  _wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost')
    const sessionId = url.searchParams.get('session')
    const session = sessionId ? getSession(sessionId) : null

    if (!session) {
      ws.close(4001, 'Invalid session')
      return
    }

    ws.sessionId = sessionId
    session.wsClients.add(ws)

    // Send current state to newly connected client
    const { prompt, lastStatus, tasks, homepageReady, alternativeDesign } = {
      prompt: session.prompt,
      lastStatus: session.lastStatus,
      tasks: session.tasks,
      homepageReady: session.homepageReady,
      alternativeDesign: session.alternativeDesign,
    }
    if (prompt) ws.send(JSON.stringify({ type: 'prompt', text: prompt }))
    if (lastStatus) ws.send(JSON.stringify(lastStatus))
    if (tasks.length > 0) ws.send(JSON.stringify({ type: 'tasks_loaded', tasks }))
    if (homepageReady) ws.send(JSON.stringify({ type: 'homepage_ready' }))
    if (alternativeDesign)
      ws.send(JSON.stringify({ type: 'alternative_design_ready', design: alternativeDesign }))

    ws.on('close', () => {
      session.wsClients.delete(ws)
    })
  })

  return _wss
}
