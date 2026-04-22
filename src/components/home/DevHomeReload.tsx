'use client'

import { useEffect } from 'react'

const RELOAD_STORAGE_KEY = 'sf_dev_last_ws_reload'
const DEBOUNCE_MS = 750
const COOLDOWN_MS = 8000

export const DevHomeReload = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    if (process.env.NEXT_PUBLIC_SF_HOME_WS_RELOAD === '0') return
    const backendWs = process.env.NEXT_PUBLIC_SF_BACKEND_WS_HOST?.trim() || '127.0.0.1:7420'
    const wsHost =
      typeof location !== 'undefined' && location.port === '3000' ? backendWs : location.host
    const u =
      (typeof location !== 'undefined' && location.protocol === 'https:' ? 'wss:' : 'ws:') +
      '//' +
      wsHost +
      '?devReload=1'
    let ws: WebSocket | null = null
    let closed = false
    let reloadTimer: ReturnType<typeof setTimeout> | undefined
    const withinCooldown = () => {
      try {
        const t = Number(sessionStorage.getItem(RELOAD_STORAGE_KEY))
        return Boolean(t) && Date.now() - t < COOLDOWN_MS
      } catch {
        return false
      }
    }
    const scheduleReload = () => {
      if (withinCooldown()) return
      if (reloadTimer) clearTimeout(reloadTimer)
      reloadTimer = setTimeout(() => {
        reloadTimer = undefined
        if (withinCooldown()) return
        try {
          sessionStorage.setItem(RELOAD_STORAGE_KEY, String(Date.now()))
        } catch {
          void 0
        }
        location.reload()
      }, DEBOUNCE_MS)
    }
    const connect = () => {
      if (closed) return
      try {
        ws = new WebSocket(u)
        ws.onmessage = (e) => {
          try {
            const d = JSON.parse(e.data as string)
            if (d && d.type === 'client_reload') scheduleReload()
          } catch {
            void 0
          }
        }
        ws.onclose = () => {
          setTimeout(connect, 1500)
        }
      } catch {
        setTimeout(connect, 1500)
      }
    }
    connect()
    return () => {
      closed = true
      if (reloadTimer) clearTimeout(reloadTimer)
      ws?.close()
    }
  }, [])
  return null
}
