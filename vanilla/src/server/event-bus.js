// @ts-check
/**
 * Typed WebSocket event bus.
 * Centralises all real-time broadcast logic so callers don't need to know
 * about the underlying WS connection map.
 */

/** @type {Map<string, import('ws').WebSocket[]>} */
const sessionSockets = new Map()

/** @type {import('ws').WebSocket[]} */
let devSockets = []

/**
 * Register a WebSocket for a specific session.
 * @param {string} sessionId
 * @param {import('ws').WebSocket} ws
 */
export function registerSessionSocket(sessionId, ws) {
  const list = sessionSockets.get(sessionId) ?? []
  list.push(ws)
  sessionSockets.set(sessionId, list)

  ws.on('close', () => {
    const updated = (sessionSockets.get(sessionId) ?? []).filter((s) => s !== ws)
    if (updated.length) sessionSockets.set(sessionId, updated)
    else sessionSockets.delete(sessionId)
  })
}

/**
 * Register a WebSocket for dev-reload broadcasts.
 * @param {import('ws').WebSocket} ws
 */
export function registerDevSocket(ws) {
  devSockets.push(ws)
  ws.on('close', () => {
    devSockets = devSockets.filter((s) => s !== ws)
  })
}

/**
 * Broadcast a typed event to all sockets for a session.
 * @param {string} sessionId
 * @param {Record<string, unknown>} payload
 */
export function emitToSession(sessionId, payload) {
  const sockets = sessionSockets.get(sessionId) ?? []
  const msg = JSON.stringify(payload)
  for (const ws of sockets) {
    try {
      if (ws.readyState === 1 /* OPEN */) ws.send(msg)
    } catch {
      // ignore send errors on closing sockets
    }
  }
}

/**
 * Broadcast to all connected sessions.
 * @param {Record<string, unknown>} payload
 */
export function emitToAll(payload) {
  const msg = JSON.stringify(payload)
  for (const [, sockets] of sessionSockets) {
    for (const ws of sockets) {
      try {
        if (ws.readyState === 1) ws.send(msg)
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Broadcast a dev-reload event to all dev sockets.
 * @param {Record<string, unknown>} payload
 */
export function emitDevReload(payload) {
  const msg = JSON.stringify(payload)
  for (const ws of devSockets) {
    try {
      if (ws.readyState === 1) ws.send(msg)
    } catch {
      // ignore
    }
  }
}

/**
 * Emit a session status update (shorthand).
 * @param {string} sessionId
 * @param {string} message
 * @param {string} [phase]
 */
export function emitStatus(sessionId, message, phase) {
  emitToSession(sessionId, { type: 'status', message, phase })
}

/**
 * Emit a log line for a session (shorthand).
 * @param {string} sessionId
 * @param {string} message
 */
export function emitLog(sessionId, message) {
  emitToSession(sessionId, { type: 'log', message })
}
