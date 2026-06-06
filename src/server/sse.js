// @ts-check
/**
 * SSE (Server-Sent Events) utility module
 * Provides helper functions for streaming events to clients via SSE
 */

/**
 * Send an SSE event to a response
 * @param {import('http').ServerResponse} res - HTTP response object
 * @param {string} event - Event name (e.g., 'status', 'tasks_loaded')
 * @param {object} data - Event data to send
 */
export function sendSSEEvent(res, event, data) {
  if (!res || res.writableEnded) return false
  try {
    const eventData = JSON.stringify(data)
    res.write(`event: ${event}\n`)
    res.write(`data: ${eventData}\n\n`)
    return true
  } catch (error) {
    console.warn('[SSE] Failed to send event', {
      event,
      message: error?.message || String(error),
    })
    return false
  }
}

/**
 * Initialize SSE response with proper headers
 * @param {import('http').ServerResponse} res - HTTP response object
 */
export function initSSEResponse(res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Disable nginx buffering
  res.flushHeaders()
}

/**
 * Send SSE keepalive comment to prevent connection timeout
 * @param {import('http').ServerResponse} res - HTTP response object
 */
export function sendSSEKeepalive(res) {
  if (!res || res.writableEnded) return false
  try {
    res.write(': keepalive\n\n')
    return true
  } catch (error) {
    return false
  }
}

/**
 * Close SSE connection gracefully
 * @param {import('http').ServerResponse} res - HTTP response object
 */
export function closeSSEConnection(res) {
  if (!res || res.writableEnded) return
  try {
    res.write('event: close\ndata: {}\n\n')
    res.end()
  } catch (error) {
    console.warn('[SSE] Failed to close connection', {
      message: error?.message || String(error),
    })
  }
}

/**
 * SSE client tracker - manages active SSE connections per session
 */
class SSEClientTracker {
  constructor() {
    /** @type {Map<string, Set<import('http').ServerResponse>>} */
    this.clients = new Map()
  }

  /**
   * Add a client to a session
   * @param {string} sessionId - Session ID
   * @param {import('http').ServerResponse} res - HTTP response object
   */
  add(sessionId, res) {
    if (!this.clients.has(sessionId)) {
      this.clients.set(sessionId, new Set())
    }
    this.clients.get(sessionId).add(res)
    console.log('[SSE] Client attached', {
      sessionId,
      totalClients: this.clients.get(sessionId).size,
    })

    // Cleanup on response close
    res.on('close', () => {
      this.remove(sessionId, res)
    })
  }

  /**
   * Remove a client from a session
   * @param {string} sessionId - Session ID
   * @param {import('http').ServerResponse} res - HTTP response object
   */
  remove(sessionId, res) {
    const sessionClients = this.clients.get(sessionId)
    if (sessionClients) {
      sessionClients.delete(res)
      console.log('[SSE] Client closed', {
        sessionId,
        totalClients: sessionClients.size,
      })
      if (sessionClients.size === 0) {
        this.clients.delete(sessionId)
      }
    }
  }

  /**
   * Get all clients for a session
   * @param {string} sessionId - Session ID
   * @returns {Set<import('http').ServerResponse>}
   */
  getClients(sessionId) {
    return this.clients.get(sessionId) || new Set()
  }

  /**
   * Broadcast an event to all clients in a session
   * @param {string} sessionId - Session ID
   * @param {string} event - Event name
   * @param {object} data - Event data
   */
  broadcast(sessionId, event, data) {
    const clients = this.getClients(sessionId)
    let successCount = 0
    for (const res of clients) {
      if (sendSSEEvent(res, event, data)) {
        successCount++
      } else {
        this.remove(sessionId, res)
      }
    }
    return successCount
  }

  /**
   * Close all connections for a session
   * @param {string} sessionId - Session ID
   */
  closeSession(sessionId) {
    const clients = this.getClients(sessionId)
    for (const res of clients) {
      closeSSEConnection(res)
    }
    this.clients.delete(sessionId)
  }
}

// Singleton instance
export const sseClients = new SSEClientTracker()
