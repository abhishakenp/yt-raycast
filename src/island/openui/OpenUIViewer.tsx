import {
  ImageContextProvider,
  BrandLogoProvider,
  OpenUIIntegrationProviders,
  QueryClient,
  QueryClientProvider,
  Renderer,
  getOpenUIRuntimeLibraryCacheKey,
  loadOpenUIRuntimeLibrary,
  type AiCapsuleRecord,
  type BrandLogoSelection,
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
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
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
  if (message) {
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
        {message}
      </div>
    )
  }

  return (
    <div
      aria-busy="true"
      aria-label={isStreaming ? 'Preview composing' : 'Preview loading'}
      role="status"
      style={{
        minHeight: '100%',
        padding: 22,
        background:
          'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          height: '100%',
          minHeight: 260,
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          background:
            'radial-gradient(circle at 18% 18%, rgba(34,211,238,0.12), transparent 30%), radial-gradient(circle at 84% 16%, rgba(168,85,247,0.12), transparent 32%), rgba(255,255,255,0.035)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          padding: 22,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 28,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: 'rgba(248,113,113,0.42)',
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: 'rgba(251,191,36,0.4)',
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: 'rgba(34,197,94,0.4)',
            }}
          />
          <span
            style={{
              width: '34%',
              height: 11,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.1)',
              marginLeft: 12,
            }}
          />
        </div>
        <div
          style={{
            width: '54%',
            height: 34,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.14)',
            marginBottom: 14,
          }}
        />
        <div
          style={{
            width: '76%',
            height: 13,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.09)',
            marginBottom: 9,
          }}
        />
        <div
          style={{
            width: '62%',
            height: 13,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.075)',
            marginBottom: 26,
          }}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <span
              key={index}
              style={{
                height: 96,
                borderRadius: 14,
                background:
                  index === 0
                    ? 'rgba(34,211,238,0.12)'
                    : 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function OpenUIViewer({
  response,
  isStreaming,
  theme,
  locale,
  embed,
  sessionId,
  integrations,
  imageContext,
  selectedBrandLogo,
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
  /** Dashboard-selected logo that replaces generated brand marks in block previews. */
  selectedBrandLogo?: BrandLogoSelection | null
  /** Full-bleed session iframe: no rounded corners, no streaming border/dot overlay */
  embed?: boolean
  /** Session id used by integration providers (for storefront and CMS scope). */
  sessionId?: string
  integrations?: {
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
  // Map the merged site-spec + session theme colors (server keys: primary,
  // accent, background, …) to CSS custom properties on the viewer's root
  // element so generated components can consume them as design tokens.
  const themeVars = useMemo(() => {
    const vars: CSSProperties = {}
    if (theme) {
      for (const [key, value] of Object.entries(theme)) {
        if (value != null) {
          ;(vars as Record<string, string>)[`--${key}`] = String(value)
        }
      }
    }
    return vars
  }, [theme])
  const preparedResponse = useMemo(
    () => preprocessOpenUIRuntimeResponse(response),
    [response],
  )
  // Fetch AI capsules for this session (OpenUI section edits)
  const aiCapsulesQuery = useQuery(
    api.sessions.listAiCapsules,
    sessionId ? { sessionId: sessionId as Id<'sessions'> } : 'skip',
  )
  const aiCapsules: AiCapsuleRecord[] | undefined = useMemo(() => {
    if (!aiCapsulesQuery) return undefined
    return aiCapsulesQuery.map(
      (row: {
        capsuleName: string
        parentCapsule: string
        compiledJs: string
        description: string
      }) => ({
        capsuleName: row.capsuleName,
        parentCapsule: row.parentCapsule,
        compiledJs: row.compiledJs,
        description: row.description,
      }),
    )
  }, [aiCapsulesQuery])
  const runtimeLibraryKey = useMemo(
    () => getOpenUIRuntimeLibraryCacheKey(preparedResponse, aiCapsules),
    [preparedResponse, aiCapsules],
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
    // If the source references a custom AI capsule (AICustom_ prefix) but the
    // session's capsule rows haven't loaded yet, hold off loading the runtime
    // library — loading without the capsule bindings would render a broken
    // fallback. Once useQuery resolves, aiCapsules changes and this effect
    // re-runs with the full capsule set.
    if (
      aiCapsules === undefined &&
      typeof preparedResponse === 'string' &&
      preparedResponse.includes('AICustom_')
    ) {
      return
    }
    loadOpenUIRuntimeLibrary(preparedResponse, aiCapsules)
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
  }, [preparedResponse, runtimeLibraryKey, aiCapsules])

  const runtimeLibrary =
    runtimeLibraryState.key === runtimeLibraryKey
      ? runtimeLibraryState.library
      : null
  const medusaDeploymentSlug = useMemo(() => {
    const raw = integrations?.medusa?.config?.deploymentSlug
    return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined
  }, [integrations?.medusa?.config?.deploymentSlug])

  useEffect(() => {
    const productsPath =
      medusaDeploymentSlug !== undefined
        ? `/api/deployments/${encodeURIComponent(medusaDeploymentSlug)}/medusa-products`
        : sessionId
          ? `/api/sessions/${encodeURIComponent(sessionId)}/medusa-products`
          : undefined

    if (!productsPath || !runtimeLibrary || !renderHostRef.current) return

    const generatedProducts = extractGeneratedCommerceProducts({
      source: preparedResponse,
    })
    if (generatedProducts.length === 0) return

    let cancelled = false
    const syncPreviewProducts = async () => {
      try {
        const medusaProductsResponse = await fetch(productsPath, {
          headers: { Accept: 'application/json' },
        })
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
  }, [medusaDeploymentSlug, preparedResponse, runtimeLibrary, sessionId])

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
    <div style={{ height: '100%', width: '100%', ...rootStyle, ...themeVars }}>
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
              medusa={integrations?.medusa || { enabled: false }}
              sessionId={sessionId}
            >
              <I18nProvider locale={locale || 'en'}>
                <T>
                  <BrandLogoProvider value={selectedBrandLogo}>
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
                  </BrandLogoProvider>
                </T>
              </I18nProvider>
            </OpenUIIntegrationProviders>
          </QueryClientProvider>
        </RendererErrorBoundary>
      </div>
    </div>
  )
}
