import OpenUIViewer from './OpenUIViewer'
import { OpenUIPreviewLaunchLoading } from './OpenUIPreviewLaunchLoading'
import { openUIPreviewReadyToDisplay } from '@/lib/openui-preview-gate'
import { isTranslatableLocale } from '../../config/languages.js'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

type OpenUIProviderConfig = Record<string, string | null>

type OpenUIIntegrationPayload = {
  enabled: boolean
  config?: OpenUIProviderConfig | null
}

type OpenUISessionIntegrations = {
  sanity?: OpenUIIntegrationPayload | null
  medusa?: OpenUIIntegrationPayload | null
}

/**
 * Vanilla replacement for `useParams()` from next/navigation.
 * Express serves /preview/:id and /preview/:id/(.*) — parse them off pathname.
 */
function useParams(): { id: string; route: string[]; isGallery: boolean } {
  const [params, setParams] = useState<{ id: string; route: string[]; isGallery: boolean }>(() => {
    const parsed = parsePreviewPath()
    return { id: parsed.id, route: parsed.route, isGallery: parsed.isGallery }
  })
  useEffect(() => {
    const onPop = () => {
      const parsed = parsePreviewPath()
      setParams({ id: parsed.id, route: parsed.route, isGallery: parsed.isGallery })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return params
}

function parsePreviewPath(): { id: string; route: string[]; isGallery: boolean } {
  if (typeof window === 'undefined') return { id: '', route: [], isGallery: false }
  const segs = window.location.pathname.split('/').filter(Boolean)
  if (segs[0] !== 'preview' || !segs[1]) return { id: '', route: [], isGallery: false }
  const urlParams = new URLSearchParams(window.location.search)
  const isGallery = urlParams.get('gallery') === '1'
  return { id: segs[1], route: segs.slice(2), isGallery }
}

declare global {
  interface Window {
    /** Set by `ShipFastHomeAuthProvider` — adds `Authorization: Bearer` for owned sessions. */
    __sfAuthFetch?: (url: string, options?: RequestInit) => Promise<Response>
  }
}

function getAnonOwnerHeader(sessionId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem('sf_anon_sessions')
    if (!raw) return {}
    const list = JSON.parse(raw) as { id: string; secret?: string }[]
    if (!Array.isArray(list)) return {}
    const hit = list.find((s) => s && s.id === sessionId)
    const secret = hit?.secret
    if (!secret) return {}
    return { 'X-Ship-Fast-Anon-Owner': String(secret) }
  } catch {
    return {}
  }
}

function normalizeOpenUIIntegrationConfig(raw: unknown): OpenUIProviderConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const result: OpenUIProviderConfig = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') {
      result[key] = value.trim() || null
    }
  }
  return result
}

function normalizeOpenUISessionIntegrations(raw: unknown): OpenUISessionIntegrations {
  const normalized: OpenUISessionIntegrations = {
    sanity: { enabled: false, config: {} },
    medusa: { enabled: false, config: {} },
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return normalized
  const payload = raw as Record<string, unknown>

  const sanity = payload.sanity
  if (sanity && typeof sanity === 'object' && !Array.isArray(sanity)) {
    const input = sanity as { enabled?: unknown; config?: unknown }
    normalized.sanity = {
      enabled: Boolean(input.enabled),
      config: normalizeOpenUIIntegrationConfig(input.config),
    }
  }

  const medusa = payload.medusa
  if (medusa && typeof medusa === 'object' && !Array.isArray(medusa)) {
    const input = medusa as { enabled?: unknown; config?: unknown }
    normalized.medusa = {
      enabled: Boolean(input.enabled),
      config: normalizeOpenUIIntegrationConfig(input.config),
    }
  }

  return normalized
}

function artFetch(path: string, sessionId: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  for (const [k, v] of Object.entries(getAnonOwnerHeader(sessionId))) {
    headers.set(k, v)
  }
  const transport =
    typeof window !== 'undefined' && typeof window.__sfAuthFetch === 'function'
      ? window.__sfAuthFetch
      : fetch
  return transport(path, {
    ...init,
    credentials: 'include',
    headers,
  })
}

function isAbortLike(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const name = 'name' in error ? String((error as { name?: unknown }).name || '') : ''
  return name === 'AbortError'
}

/**
 * `/preview/:id/` — stream or load the OpenUI artifact for the session.
 */
export function OpenUIPreviewClient() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const isGallery = Boolean(params?.isGallery)
  const routeParam = Array.isArray(params?.route)
    ? params.route.join('/')
    : typeof params?.route === 'string'
      ? params.route
      : ''
  const previewRoute = routeParam ? `/${routeParam.replace(/^\/+/, '')}` : '/'
  const [final, setFinal] = useState<{
    source: string
    theme: Record<string, string>
  } | null>(null)
  const [streamText, setStreamText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [bootError, setBootError] = useState<string | null>(null)
  const [sessionIntegrations, setSessionIntegrations] = useState<OpenUISessionIntegrations | null>(
    null,
  )
  /** True while we know home.openui exists and are fetching it (no LLM stream). */
  const [loadingSavedPreview, setLoadingSavedPreview] = useState(false)
  /**
   * One-way latch: the launch loader hides on the first real PAINT of the rendered UI
   * (DOM layout actually visible), not merely when source is received. This prevents the
   * white-screen gap between source-received and the Renderer painting. The loader stays
   * mounted (cross-faded via opacity) for the lifetime of this preview mount so its launch
   * SFX plays at most once and the previous UI stays on screen while regen streams in.
   */
  const [painted, setPainted] = useState(false)
  const paintedRef = useRef(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const settledRef = useRef(false)
  const artifactLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Site-spec palette for OpenUIViewer — stable across streaming; do not clear when stream text updates. */
  const viewerPaletteRef = useRef<Record<string, string>>({})
  const [viewerPalette, setViewerPalette] = useState<Record<string, string>>({})
  const [locale, setLocale] = useState('en')

  const stopArtifactLoadWait = () => {
    if (artifactLoadTimeoutRef.current != null) {
      clearTimeout(artifactLoadTimeoutRef.current)
      artifactLoadTimeoutRef.current = null
    }
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const commitViewerPalette = (theme: Record<string, string>) => {
    if (!theme || typeof theme !== 'object' || Object.keys(theme).length === 0) return
    viewerPaletteRef.current = theme
    setViewerPalette(theme)
  }

  /**
   * Idempotent reveal: hides the launch loader on first real paint. Notifies the parent
   * window (dashboard) via postMessage so the outer shell can coordinate. Safe to call
   * multiple times — only the first call has any effect.
   */
  const markPainted = useCallback(() => {
    if (paintedRef.current) return
    paintedRef.current = true
    setPainted(true)
    try {
      if (!isGallery && window.parent && window.parent !== window) {
        window.parent.postMessage(
          { type: 'preview:first-paint', sessionId: id, route: previewRoute },
          window.location.origin,
        )
      }
    } catch {
      void 0
    }
  }, [id, previewRoute, isGallery])

  // Stable ref so the long-lived WebSocket effect can call the latest markPainted
  // without listing it as a dependency (which would tear down/reconnect the socket).
  const markPaintedRef = useRef(markPainted)
  markPaintedRef.current = markPainted

  useLayoutEffect(() => {
    document.body.classList.add('sf-openui-preview-embed')
    return () => {
      document.body.classList.remove('sf-openui-preview-embed')
    }
  }, [])

  useEffect(() => {
    if (!id) return
    settledRef.current = false
    const ac = new AbortController()

    const finalizeFromOpenUIPayload = (j: { source?: string; theme?: unknown; locale?: unknown }): boolean => {
      if (settledRef.current) return true
      const source = typeof j.source === 'string' ? j.source : ''
      if (!source) return false
      const theme =
        j.theme && typeof j.theme === 'object' && j.theme ? (j.theme as Record<string, string>) : {}
      setFinal({ source, theme })
      commitViewerPalette(theme)
      if (typeof j.locale === 'string' && isTranslatableLocale(j.locale)) {
        setLocale(j.locale.trim().toLowerCase())
      }
      setBootError(null)
      setLoadingSavedPreview(false)
      settledRef.current = true
      setIsStreaming(false)
      return true
    }

    const tryConsumeOpenUIResponse = async (r: Response): Promise<boolean> => {
      if (settledRef.current) return true
      if (!r.ok) return false
      const j = (await r.json()) as { source?: string; theme?: unknown }
      return finalizeFromOpenUIPayload(j)
    }

    const tryLoadFinal = async () => {
      if (settledRef.current) return true
      const r = await artFetch(
        `/api/sessions/${encodeURIComponent(id)}/openui?route=${encodeURIComponent(previewRoute)}`,
        id,
        { signal: ac.signal },
      )
      return tryConsumeOpenUIResponse(r)
    }

    const tick = async () => {
      try {
        const got = await tryLoadFinal()
        if (got) {
          stopArtifactLoadWait()
          return
        }
      } catch (error) {
        if (ac.signal.aborted || isAbortLike(error)) return
        setLoadingSavedPreview(false)
        setIsStreaming(false)
        setBootError('Could not load saved preview. Try refreshing this page.')
      }
    }

    ;(async () => {
      // Start OpenUI fetch immediately so it overlaps session metadata (cuts reload latency).
      const openuiInflight = artFetch(
        `/api/sessions/${encodeURIComponent(id)}/openui?route=${encodeURIComponent(previewRoute)}`,
        id,
        { signal: ac.signal },
      ).catch((error) => {
        if (ac.signal.aborted || isAbortLike(error)) return null
        throw error
      })
      const sessionR = await artFetch(`/api/sessions/${encodeURIComponent(id)}`, id, {
        signal: ac.signal,
      }).catch((error) => {
        if (ac.signal.aborted || isAbortLike(error)) return null
        throw error
      })
      if (!sessionR) return
      if (!sessionR.ok) {
        if (!ac.signal.aborted) {
          setBootError('Session not found.')
        }
        return
      }
      const session = (await sessionR.json()) as {
        openuiReady?: boolean
        integrations?: OpenUISessionIntegrations
      }
      setSessionIntegrations(
        normalizeOpenUISessionIntegrations(session?.integrations ?? session),
      )

      const artifactOnDisk = Boolean(session.openuiReady)

      if (artifactOnDisk && !ac.signal.aborted) {
        setLoadingSavedPreview(true)
      }

      const openuiResponse = await openuiInflight
      if (!openuiResponse) return
      const got = await tryConsumeOpenUIResponse(openuiResponse)
      if (got) return

      // Saved OpenUI exists: never call /api/stream-openui on reload — only poll until GET succeeds
      // (transient errors, iframe race, or strict auth timing).
      if (artifactOnDisk) {
        stopArtifactLoadWait()
        // Check if there's a saved index.html with manual edits - load that instead of OpenUI source
        try {
          const htmlResponse = await artFetch(
            `/api/sessions/${encodeURIComponent(id)}/preview-html?route=${encodeURIComponent(previewRoute)}`,
            id,
            { signal: ac.signal },
          )
          if (htmlResponse.ok) {
            const htmlData = await htmlResponse.json() as { html?: string }
            if (htmlData.html && htmlData.html.length > 100) {
              setFinal({ source: htmlData.html, theme: {} })
              setBootError(null)
              setLoadingSavedPreview(false)
              settledRef.current = true
              setIsStreaming(false)
              return
            }
          }
        } catch {
          // If HTML fetch fails, fall back to OpenUI polling
        }
        artifactLoadTimeoutRef.current = setTimeout(() => {
          artifactLoadTimeoutRef.current = null
          if (settledRef.current || ac.signal.aborted) return
          setLoadingSavedPreview(false)
          setBootError('Could not load saved preview. Try refreshing this page.')
          if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
          }
        }, 45_000)
        if (!pollRef.current) {
          pollRef.current = setInterval(tick, 550)
        }
        void tick()
        return
      }

      if (!pollRef.current) {
        pollRef.current = setInterval(tick, 1200)
      }
      void tick()
    })().catch((error) => {
      if (ac.signal.aborted || isAbortLike(error)) return
      setLoadingSavedPreview(false)
      setIsStreaming(false)
      setBootError('Could not load saved preview. Try refreshing this page.')
    })

    return () => {
      ac.abort()
      stopArtifactLoadWait()
      setLoadingSavedPreview(false)
    }
  }, [id, previewRoute])

  useEffect(() => {
    // Skip WebSocket connection in gallery mode - thumbnails should be static
    if (isGallery) return
    if (!id || previewRoute !== '/') return

    let closed = false
    let ws: WebSocket | null = null
    let reconnectAttempts = 0
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    const MAX_RECONNECT_ATTEMPTS = 5
    const BASE_RECONNECT_DELAY_MS = 1000

    const resolveWSHost = () => {
      const backendWs =
        typeof process !== 'undefined'
          ? process.env?.NEXT_PUBLIC_SF_BACKEND_WS_HOST?.trim() || ''
          : ''
      if (backendWs) return backendWs
      if (typeof location === 'undefined') return ''
      if (location.port === '3000' || location.port === '3001' || location.port === '') {
        return `${location.hostname}:7420`
      }
      return location.host
    }

    const connect = () => {
      if (closed) return
      const host = resolveWSHost()
      if (!host) {
        console.error('[WebSocket] Missing WS host')
        return
      }
      const url = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${host}?session=${encodeURIComponent(id)}`
      console.log('[WebSocket] Connecting to:', url)
      try {
        ws = new WebSocket(url)
        ws.onopen = () => {
          console.log('[WebSocket] Connected')
          reconnectAttempts = 0
        }
        ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error)
        }
        ws.onclose = (event) => {
          console.log('[WebSocket] Closed:', { code: event.code, reason: event.reason, wasClean: event.wasClean })
          if (closed) return

          // Generation already settled (stream_done / saved artifact shown): the close
          // is expected — do NOT reconnect, or we trigger a post-completion reconnect
          // storm that the message handler then ignores anyway. We gate purely on the
          // settled latch: once settled, every reconnect would be wasted regardless of
          // whether the socket reported wasClean.
          if (settledRef.current) {
            console.log('[WebSocket] Close after settle — not reconnecting')
            return
          }

          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++
            const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts - 1)
            console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
            reconnectTimer = setTimeout(connect, delay)
          } else {
            console.error('[WebSocket] Max reconnection attempts reached. Giving up.')
          }
        }
        ws.onmessage = (event) => {
          console.log('[WebSocket] Message:', event.data.substring(0, 100))
          if (closed) return
          let message: {
            type?: string
            route?: string
            token?: string
            source?: string
            locale?: string
            error?: string
          } | null = null
          try {
            message = JSON.parse(String(event.data))
          } catch {
            console.warn('[WebSocket] Non-JSON message:', event.data)
            return
          }
          if (!message) return
          const messageRoute =
            typeof message.route === 'string' && message.route.trim() ? message.route.trim() : '/'
          if (messageRoute !== previewRoute) {
            console.log('[WebSocket] Ignored route mismatch', {
              expected: previewRoute,
              received: messageRoute,
              type: message.type,
            })
            return
          }
          if (settledRef.current && message.type !== 'openui_stream_start') return
          if (message.type === 'openui_stream_start') {
            console.log('[WebSocket] Stream start')
            settledRef.current = false
            stopArtifactLoadWait()
            setStreamText('')
            setIsStreaming(true)
            setBootError(null)
            setLoadingSavedPreview(false)
            return
          }
          if (message.type === 'openui_stream_chunk') {
            const source = typeof message.source === 'string' ? message.source : ''
            const token = typeof message.token === 'string' ? message.token : ''
            settledRef.current = false
            stopArtifactLoadWait()
            if (source) {
              console.log('[WebSocket] Chunk, source length:', source.length)
              setStreamText(source)
            }
            else if (token) setStreamText((current) => current + token)
            setIsStreaming(true)
            setLoadingSavedPreview(false)
            return
          }
          if (message.type === 'openui_stream_done') {
            console.log('[WebSocket] Stream done')
            const source = typeof message.source === 'string' ? message.source : ''
            if (typeof message.locale === 'string' && isTranslatableLocale(message.locale)) {
              setLocale(message.locale.trim().toLowerCase())
            }
            if (source) {
              settledRef.current = true
              const palette =
                Object.keys(viewerPaletteRef.current).length > 0
                  ? { ...viewerPaletteRef.current }
                  : {}
              setFinal((prev) => ({
                source,
                theme:
                  Object.keys(palette).length > 0
                    ? palette
                    : prev && Object.keys(prev.theme).length > 0
                      ? prev.theme
                      : {},
              }))
              setStreamText('')
              void artFetch(
                `/api/sessions/${encodeURIComponent(id)}/openui?route=${encodeURIComponent(previewRoute)}`,
                id,
              )
                .then((r) => (r.ok ? r.json() : null))
                .then((payload: { theme?: unknown; locale?: unknown } | null) => {
                  if (payload?.theme && typeof payload.theme === 'object' && payload.theme) {
                    const t = payload.theme as Record<string, string>
                    commitViewerPalette(t)
                    setFinal((prev) => (prev ? { ...prev, theme: t } : prev))
                  }
                  if (typeof payload?.locale === 'string' && isTranslatableLocale(payload.locale)) {
                    setLocale(payload.locale.trim().toLowerCase())
                  }
                })
                .catch((error) => {
                  if (isAbortLike(error)) return
                  console.warn('[openui-island] failed to refresh preview theme:', error)
                })
            }
            setIsStreaming(false)
            // Fallback: if first-paint never fired (e.g. observer missed), reveal now.
            // Idempotent — no-op if markPainted already ran on real paint.
            markPaintedRef.current()
          }
          if (message.type === 'openui-error') {
            console.error('[WebSocket] Error:', message.error)
            const error = typeof message.error === 'string' ? message.error : 'OpenUI generation failed'
            setBootError(error)
            setLoadingSavedPreview(false)
            setIsStreaming(false)
            setStreamText('')
          }
        }
      } catch {
        console.error('[WebSocket] Connection error')
        return
      }
    }

    // Initial connection
    connect()

    return () => {
      closed = true
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      try {
        ws?.close()
      } catch {
        void 0
      }
    }
  }, [id, previewRoute, isGallery])

  const shell: CSSProperties = {
    minHeight: '100dvh',
    width: '100%',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'transparent',
    color: '#e4e4e7',
    fontFamily: 'var(--font-sans, system-ui, sans-serif)',
  }

  const streamUiReady = useMemo(
    () => openUIPreviewReadyToDisplay(streamText),
    [streamText],
  )

  // Choose the live source once it has enough structure to render meaningfully.
  // Until the new stream passes the gate, keep showing the saved/previous `final`
  // so regen never blanks the screen back to a loader.
  const liveSource = streamUiReady ? streamText : final?.source ?? ''
  const liveTheme = viewerPalette
  const liveIsStreaming = streamUiReady && isStreaming
  const hasSource = liveSource.length > 0

  const loaderVisible = !painted && !bootError
  const loaderPhase = loadingSavedPreview ? 'restore' : 'compose'
  // When embedded in the dashboard (nested iframe), the dashboard's own intro
  // launch loader (warp + SFX) covers the whole generation until first paint, so
  // rendering a second launch loader here would double the SFX and flicker at the
  // handoff. Suppress our own loader in that case (we still fire first-paint to the
  // parent). Standalone /preview and gallery thumbnails keep their own loader.
  const embedded = typeof window !== 'undefined' && window.parent !== window
  const useOwnLoader = !embedded || isGallery

  if (bootError) {
    return (
      <div
        style={{
          ...shell,
          background: 'linear-gradient(195deg, #040915 0%, #0a0a0b 45%, #060a14 100%)',
        }}
      >
        <p
          style={{
            margin: 0,
            padding: 32,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 14,
          }}
        >
          {bootError}
        </p>
      </div>
    )
  }

  // Single stable shell. The viewer (slot 0) and loader (slot 1) keep their
  // React positions across every state transition, so the launch loader mounts
  // exactly once per page lifetime — its launch SFX plays at most once.
  return (
    <div style={shell}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {hasSource ? (
          <OpenUIViewer
            response={liveSource}
            theme={liveTheme}
            locale={locale}
            isStreaming={liveIsStreaming}
            embed={true}
            sessionId={id}
            integrations={sessionIntegrations || undefined}
            onFirstPaint={markPainted}
          />
        ) : null}
        {!bootError && useOwnLoader ? (
          <div className={`sf-openui-launch-reveal${loaderVisible ? '' : ' is-revealed'}`}>
            <OpenUIPreviewLaunchLoading phase={loaderPhase} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
