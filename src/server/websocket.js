import { WebSocketServer } from 'ws'
import { getState, setBroadcaster } from './state.js'

let _wss = null

export function setupWebSocket(httpServer) {
  _wss = new WebSocketServer({ server: httpServer })

  _wss.on('connection', (ws) => {
    const { prompt, lastStatus, tasks, homepageReady } = getState()
    if (prompt) ws.send(JSON.stringify({ type: 'prompt', text: prompt }))
    if (lastStatus) ws.send(JSON.stringify(lastStatus))
    if (tasks.length > 0) ws.send(JSON.stringify({ type: 'tasks_loaded', tasks }))
    if (homepageReady) ws.send(JSON.stringify({ type: 'homepage_ready' }))
  })

  setBroadcaster((msg) => {
    if (!_wss) return
    const data = JSON.stringify(msg)
    for (const client of _wss.clients) {
      if (client.readyState === 1) client.send(data)
    }
  })

  return _wss
}
