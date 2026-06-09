import {
  OpenUIIntegrationProviders,
  QueryClient,
  QueryClientProvider,
  library as shipFastOpenUILibrary,
  Renderer,
} from '@ship-fast/blocks'
import { preprocessOpenUIResponse } from '../../../packages/ship-fast-engine/src/lib/openui-preprocess'
import { Component, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { I18nProvider, T } from './_providers/translation';

// NOTE: We use a plain QueryClientProvider here (not PersistQueryClientProvider).
// The persist provider from @tanstack/react-query-persist-client resolved a
// different @tanstack/react-query instance than the one the rendered library
// components call useQuery from, so its QueryClientContext never reached them —
// every <Image> (img.tsx usePexelsImage) threw "No QueryClient set" and the
// Renderer's error boundary blanked the page to white. A plain provider from the
// same @ship-fast/blocks react-query re-export shares one context. In-memory
// caching is retained for the session (idb persistence across reloads dropped).
const openUIQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
})

class RendererErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidUpdate(prev: { children: ReactNode }) {
    if (prev.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

export default function OpenUIViewer({
  response,
  isStreaming,
  theme: _theme,
  locale,
  embed,
  sessionId,
  integrations,
  onFirstPaint,
}: {
  response: string
  isStreaming?: boolean
  /** Merged site-spec + session theme colors (server keys: primary, accent, background, …) */
  theme?: Record<string, string> | null
  /** AI-detected locale (ISO 639-1 code) — drives translation provider. */
  locale?: string
  /** Full-bleed session iframe: no rounded corners, no streaming border/dot overlay */
  embed?: boolean
  /** Session id used by integration providers (for storefront and CMS scope). */
  sessionId?: string
  integrations?: {
    sanity?: {
      enabled: boolean
      config?: Record<string, string | null> | null
    } | null
    medusa?: {
      enabled: boolean
      config?: Record<string, string | null> | null
    } | null
  } | null
  /** Fires once when the render host has painted real layout structure (not the streaming fallback text). */
  onFirstPaint?: () => void
}) {
  const inEmbed = embed === true
  const renderHostRef = useRef<HTMLDivElement>(null)
  const firedRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const rafRef2 = useRef<number | null>(null)

  useEffect(() => {
    if (!onFirstPaint) return
    // Real content, not empty structural divs: the streamed program first paints
    // empty themed section containers (height but no text/images) ~1-2s before the
    // text and hero imagery land. Require actual visible text or an <img> so the
    // loader stays until the page genuinely looks built (not a blank themed frame).
    const isPainted = () => {
      const el = renderHostRef.current
      if (!el || el.scrollHeight <= 40) return false
      const textLen = (el.innerText || '').trim().length
      const hasImg = !!el.querySelector('img')
      return textLen > 80 || hasImg
    }
    const fire = () => {
      rafRef.current = requestAnimationFrame(() => {
        rafRef2.current = requestAnimationFrame(() => {
          if (firedRef.current) return
          firedRef.current = true
          onFirstPaint()
        })
      })
    }
    let observer: MutationObserver | null = null
    if (isPainted()) {
      fire()
    } else if (renderHostRef.current) {
      observer = new MutationObserver(() => {
        if (isPainted()) {
          observer?.disconnect()
          fire()
        }
      })
      observer.observe(renderHostRef.current, { childList: true, subtree: true })
    }
    return () => {
      observer?.disconnect()
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      if (rafRef2.current != null) cancelAnimationFrame(rafRef2.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const rootStyle: CSSProperties = inEmbed
    ? {
      flex: 1,
      alignSelf: 'stretch',
      width: '100%',
      minWidth: 0,
      minHeight: '100dvh',
      height: '100%',
      borderRadius: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'none',
    }
    : {
      height: '100%',
      minHeight: 0,
      borderRadius: '0 0 12px 12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: isStreaming
        ? '0 0 0 1px color-mix(in srgb, #22d3ee 55%, transparent) inset'
        : '0 0 0 1px rgba(255,255,255,0.08) inset',
    }
  return (
    <div style={{ height: '100%', width: '100%', ...rootStyle }}>
      {isStreaming && !inEmbed ? <div className="streaming-indicator" aria-hidden="true" /> : null}
      <div ref={renderHostRef} style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <RendererErrorBoundary
          fallback={
            isStreaming ? (
              <div
                style={{
                  padding: 24,
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                Composing the layout…
              </div>
            ) : null
          }
        >
          <QueryClientProvider client={openUIQueryClient}>
            <OpenUIIntegrationProviders
              sanity={integrations?.sanity || { enabled: false }}
              medusa={integrations?.medusa || { enabled: false }}
              sessionId={sessionId}
            >
              <I18nProvider locale={locale || "en"}>
                <T>
                  <Renderer
                    response={preprocessOpenUIResponse(response, { resolveRefs: false })}
                    library={shipFastOpenUILibrary}
                    isStreaming={isStreaming}
                  />
                </T>
              </I18nProvider>
            </OpenUIIntegrationProviders>
          </QueryClientProvider>
        </RendererErrorBoundary>
      </div>
    </div>
  )
}
