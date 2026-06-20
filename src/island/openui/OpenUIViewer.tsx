import {
  ImageContextProvider,
  OpenUIIntegrationProviders,
  QueryClient,
  QueryClientProvider,
  Renderer,
  getOpenUIRuntimeLibraryCacheKey,
  loadOpenUIRuntimeLibrary,
  type ImageContext,
  type Library,
} from '@ship-fast/blocks/runtime'
import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { I18nProvider, T } from './_providers/translation'
import { preprocessOpenUIRuntimeResponse } from './openui-runtime-preprocess'
import {
  applyMedusaProductsToPreviewDom,
  type MedusaPreviewProduct,
} from './medusa-preview-sync'
import { extractGeneratedCommerceProducts } from '@/features/commerce/services/generated-commerce-products'

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

function OpenUIRenderFallback({
  isStreaming,
  message,
}: {
  isStreaming?: boolean
  message?: string
}) {
  const displayMessage =
    message ?? (isStreaming ? 'Composing the layout…' : 'Loading preview…')

  return (
    <div
      style={{
        minHeight: '100%',
        padding: 24,
        color: 'rgba(255,255,255,0.45)',
        fontSize: 13,
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
      }}
    >
      {displayMessage}
    </div>
  )
}

export default function OpenUIViewer({
  response,
  isStreaming,
  theme: _theme,
  locale,
  embed,
  sessionId,
  integrations,
  imageContext,
  onFirstPaint,
}: {
  response: string
  isStreaming?: boolean
  /** Merged site-spec + session theme colors (server keys: primary, accent, background, …) */
  theme?: Record<string, string> | null
  /** AI-detected locale (ISO 639-1 code) — drives translation provider. */
  locale?: string
  /** Page-level prompt/brand context so generated <Image>s pick relevant stock photos. */
  imageContext?: ImageContext | null
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
  const preparedResponse = useMemo(
    () => preprocessOpenUIRuntimeResponse(response),
    [response],
  )
  const runtimeLibraryKey = useMemo(
    () => getOpenUIRuntimeLibraryCacheKey(preparedResponse),
    [preparedResponse],
  )
  const [runtimeLibraryState, setRuntimeLibraryState] = useState<{
    key: string | null
    library: Library | null
    error: Error | null
  }>({ key: null, library: null, error: null })

  useEffect(() => {
    let cancelled = false
    setRuntimeLibraryState((current) =>
      current.key === runtimeLibraryKey && current.library
        ? current
        : { ...current, error: null },
    )
    loadOpenUIRuntimeLibrary(preparedResponse)
      .then((library) => {
        if (cancelled) return
        setRuntimeLibraryState({ key: runtimeLibraryKey, library, error: null })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setRuntimeLibraryState({
          key: runtimeLibraryKey,
          library: null,
          error: error instanceof Error ? error : new Error(String(error)),
        })
      })

    return () => {
      cancelled = true
    }
  }, [preparedResponse, runtimeLibraryKey])

  const runtimeLibrary =
    runtimeLibraryState.key === runtimeLibraryKey
      ? runtimeLibraryState.library
      : null

  useEffect(() => {
    if (!sessionId || !runtimeLibrary || !renderHostRef.current) return

    const generatedProducts = extractGeneratedCommerceProducts({
      source: preparedResponse,
    })
    if (generatedProducts.length === 0) return

    let cancelled = false
    const syncPreviewProducts = async () => {
      try {
        const medusaProductsResponse = await fetch(
          `/api/sessions/${encodeURIComponent(sessionId)}/medusa-products`,
          { headers: { Accept: 'application/json' } },
        )
        if (!medusaProductsResponse.ok || cancelled) return

        const payload = (await medusaProductsResponse.json()) as {
          products?: Array<MedusaPreviewProduct>
        }
        if (cancelled || !Array.isArray(payload.products)) return

        requestAnimationFrame(() => {
          if (cancelled || !renderHostRef.current) return
          applyMedusaProductsToPreviewDom(renderHostRef.current, {
            generatedProducts,
            medusaProducts: payload.products ?? [],
          })
        })
      } catch {
        // The generated preview remains usable when Medusa is unavailable.
      }
    }

    void syncPreviewProducts()
    const interval = window.setInterval(syncPreviewProducts, 5000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [preparedResponse, runtimeLibrary, sessionId])

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
      observer.observe(renderHostRef.current, {
        childList: true,
        subtree: true,
      })
    }
    return () => {
      observer?.disconnect()
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      if (rafRef2.current != null) cancelAnimationFrame(rafRef2.current)
    }
  }, [])
  const rootStyle: CSSProperties = inEmbed
    ? {
        flex: 1,
        alignSelf: 'stretch',
        width: '100%',
        minWidth: 0,
        minHeight: 0,
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
      {isStreaming && !inEmbed ? (
        <div className="streaming-indicator" aria-hidden="true" />
      ) : null}
      <div
        ref={renderHostRef}
        style={{ flex: 1, overflow: 'auto', minHeight: 0 }}
      >
        <RendererErrorBoundary
          fallback={<OpenUIRenderFallback isStreaming={isStreaming} />}
        >
          <QueryClientProvider client={openUIQueryClient}>
            <OpenUIIntegrationProviders
              sanity={integrations?.sanity || { enabled: false }}
              medusa={integrations?.medusa || { enabled: false }}
              sessionId={sessionId}
            >
              <I18nProvider locale={locale || 'en'}>
                <T>
                  <ImageContextProvider value={imageContext}>
                    {runtimeLibrary ? (
                      <Renderer
                        response={preparedResponse}
                        library={runtimeLibrary}
                        isStreaming={isStreaming}
                      />
                    ) : (
                      <OpenUIRenderFallback
                        isStreaming={isStreaming}
                        message={
                          runtimeLibraryState.error
                            ? 'Unable to load preview components.'
                            : undefined
                        }
                      />
                    )}
                  </ImageContextProvider>
                </T>
              </I18nProvider>
            </OpenUIIntegrationProviders>
          </QueryClientProvider>
        </RendererErrorBoundary>
      </div>
    </div>
  )
}
