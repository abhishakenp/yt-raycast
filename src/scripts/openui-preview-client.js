/**
 * Vanilla JS client for OpenUI preview.
 * Receives HTML chunks via WebSocket and injects them into DOM.
 * No React runtime required for generated content.
 */

class OpenUIPreviewClient {
  constructor() {
    this.container = document.getElementById('openui-root')
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.sessionId = this.getSessionId()
    this.route = this.getRoute()
    
    if (!this.container) {
      console.error('[OpenUI Preview] Missing #openui-root container')
      return
    }
    
    this.connectWebSocket()
  }
  
  getSessionId() {
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    return pathParts[1] || null
  }
  
  getRoute() {
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    const route = pathParts.slice(2).join('/') || '/'
    return route
  }
  
  resolveWSHost() {
    const host = window.location.host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return host
  }
  
  connectWebSocket() {
    if (!this.sessionId) {
      console.error('[OpenUI Preview] No session ID in URL')
      return
    }
    
    const host = this.resolveWSHost()
    const url = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${host}?session=${encodeURIComponent(this.sessionId)}`
    
    console.log('[OpenUI Preview] Connecting to WebSocket:', url)
    
    try {
      this.ws = new WebSocket(url)
      
      this.ws.onopen = () => {
        console.log('[OpenUI Preview] WebSocket connected')
        this.reconnectAttempts = 0
      }
      
      this.ws.onerror = (error) => {
        console.error('[OpenUI Preview] WebSocket error:', error)
      }
      
      this.ws.onclose = (event) => {
        console.log('[OpenUI Preview] WebSocket closed:', event.code, event.reason)
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
          console.log(`[OpenUI Preview] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
          setTimeout(() => this.connectWebSocket(), delay)
        }
      }
      
      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }
    } catch (error) {
      console.error('[OpenUI Preview] Failed to create WebSocket:', error)
    }
  }
  
  handleMessage(data) {
    try {
      const message = JSON.parse(data)
      
      switch (message.type) {
        case 'openui_stream_start':
          this.handleStreamStart(message)
          break
        case 'openui_stream_chunk':
          this.handleStreamChunk(message)
          break
        case 'openui_stream_done':
          this.handleStreamDone(message)
          break
        case 'openui-error':
          this.handleError(message)
          break
        default:
          // Ignore other message types
          break
      }
    } catch (error) {
      console.error('[OpenUI Preview] Failed to parse message:', error)
    }
  }
  
  handleStreamStart(message) {
    console.log('[OpenUI Preview] Stream started for route:', message.route)
    // Clear previous content
    this.container.innerHTML = ''
    // Show loading state
    this.container.innerHTML = '<div class="openui-loading">Generating...</div>'
  }
  
  handleStreamChunk(message) {
    // If we have HTML in the message, use it directly
    if (message.html) {
      console.log('[OpenUI Preview] Received HTML chunk, length:', message.html.length)
      this.container.innerHTML = message.html
    }
  }
  
  handleStreamDone(message) {
    console.log('[OpenUI Preview] Stream completed')
    
    // Use the final HTML if available
    if (message.html) {
      this.container.innerHTML = message.html
    }
    
    // Apply CSS variables if provided
    if (message.cssVars) {
      this.applyThemeCSSVars(message.cssVars)
    }
    
    // Notify parent window if embedded
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'preview:first-paint',
          sessionId: this.sessionId,
          route: this.route
        }, window.location.origin)
      }
    } catch (error) {
      // Ignore cross-origin errors
    }
  }
  
  handleError(message) {
    console.error('[OpenUI Preview] Generation error:', message.error)
    this.container.innerHTML = `
      <div class="openui-error">
        <h3>Generation Failed</h3>
        <p>${message.error || 'Unknown error'}</p>
      </div>
    `
  }
  
  applyThemeCSSVars(cssVars) {
    // Apply CSS variables to the container
    if (typeof cssVars === 'string') {
      this.container.style.cssText = cssVars
    }
  }
  
  destroy() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.openUIPreviewClient = new OpenUIPreviewClient()
  })
} else {
  window.openUIPreviewClient = new OpenUIPreviewClient()
}