import OpenUIViewer from './OpenUIViewer'
import { OpenUIPreviewLaunchLoading } from './OpenUIPreviewLaunchLoading'
import { openUIPreviewReadyToDisplay } from '@/lib/openui-preview-gate'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

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
function useParams(): { id: string; route: string[] } {
  const [params, setParams] = useState<{ id: string; route: string[] }>(() => parsePreviewPath())
  useEffect(() => {
    const onPop = () => setParams(parsePreviewPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return params
}

function parsePreviewPath(): { id: string; route: string[] } {
  if (typeof window === 'undefined') return { id: '', route: [] }
  const segs = window.location.pathname.split('/').filter(Boolean)
  if (segs[0] !== 'preview' || !segs[1]) return { id: '', route: [] }
  return { id: segs[1], route: segs.slice(2) }
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
   * One-way latch: once any OpenUI source has been shown (saved or streamed), the launch
   * loader is hidden permanently for the lifetime of this preview mount. Prevents the
   * loader from re-mounting on `openui_stream_start` (which would replay launch SFX),
   * and keeps the previous UI on screen while the next generation streams in.
   */
  const [revealed, setRevealed] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const settledRef = useRef(false)
  const artifactLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Site-spec palette for OpenUIViewer — stable across streaming; do not clear when stream text updates. */
  const viewerPaletteRef = useRef<Record<string, string>>({})
  const [viewerPalette, setViewerPalette] = useState<Record<string, string>>({})

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

    const finalizeFromOpenUIPayload = (j: { source?: string; theme?: unknown }): boolean => {
      if (settledRef.current) return true
      const source = typeof j.source === 'string' ? j.source : ''
      if (!source) return false
      const theme =
        j.theme && typeof j.theme === 'object' && j.theme ? (j.theme as Record<string, string>) : {}
      setFinal({ source, theme })
      commitViewerPalette(theme)
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
      )
      const sessionR = await artFetch(`/api/sessions/${encodeURIComponent(id)}`, id, {
        signal: ac.signal,
      })
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

      const got = await tryConsumeOpenUIResponse(await openuiInflight)
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
    if (!id || previewRoute !== '/') return
    let closed = false
    let ws: WebSocket | null = null
    const backendWs =
      typeof process !== 'undefined'
        ? process.env?.NEXT_PUBLIC_SF_BACKEND_WS_HOST?.trim() || ''
        : ''
    const host =
      typeof location !== 'undefined' && location.port === '3000' && backendWs
        ? backendWs
        : location.host
    const url = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${host}?session=${encodeURIComponent(id)}`
    try {
      ws = new WebSocket(url)
      ws.onmessage = (event) => {
        if (closed) return
        let message: {
          type?: string
          route?: string
          token?: string
          source?: string
          error?: string
        } | null = null
        try {
          message = JSON.parse(String(event.data))
        } catch {
          return
        }
        if (!message || message.route !== '/') return
        if (settledRef.current && message.type !== 'openui_stream_start') return
        if (message.type === 'openui_stream_start') {
          settledRef.current = false
          stopArtifactLoadWait()
          // Keep `final` so the previously rendered UI stays visible until the new
          // stream has enough source to take over (see `liveSource` derivation).
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
          if (source) setStreamText(source)
          else if (token) setStreamText((current) => current + token)
          setIsStreaming(true)
          setLoadingSavedPreview(false)
          return
        }
        if (message.type === 'openui_stream_done') {
          const source = typeof message.source === 'string' ? message.source : ''
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
              .then((payload: { theme?: unknown } | null) => {
                if (!payload?.theme || typeof payload.theme !== 'object' || !payload.theme) return
                const t = payload.theme as Record<string, string>
                commitViewerPalette(t)
                setFinal((prev) => (prev ? { ...prev, theme: t } : prev))
              })
              .catch((error) => {
                if (isAbortLike(error)) return
                console.warn('[openui-island] failed to refresh preview theme:', error)
              })
          }
          setIsStreaming(false)
        }
        if (message.type === 'openui-error') {
          const error = typeof message.error === 'string' ? message.error : 'OpenUI generation failed'
          setBootError(error)
          setLoadingSavedPreview(false)
          setIsStreaming(false)
          setStreamText('')
        }
      }
    } catch {
      return
    }

    return () => {
      closed = true
      try {
        ws?.close()
      } catch {
        void 0
      }
    }
  }, [id, previewRoute])

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

  // One-way latch: as soon as we have any source, hide the loader forever.
  // Done in an effect (never during render) so `revealed` is a real state edge.
  useEffect(() => {
    if (hasSource && !revealed) setRevealed(true)
  }, [hasSource, revealed])

  const showLoader = !revealed && !bootError
  const loaderPhase = loadingSavedPreview ? 'restore' : 'compose'

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
            isStreaming={liveIsStreaming}
            embed={true}
            sessionId={id}
            integrations={sessionIntegrations || undefined}
          />
        ) : null}
        {showLoader ? <OpenUIPreviewLaunchLoading phase={loaderPhase} /> : null}
      </div>
    </div>
  )
}
