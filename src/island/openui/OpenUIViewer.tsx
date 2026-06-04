import {
  OpenUIIntegrationProviders,
  QueryClient,
  PersistQueryClientProvider,
  library as shipFastOpenUILibrary,
  Renderer,
} from '@ship-fast/blocks'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { get, set, del } from 'idb-keyval'
import { preprocessOpenUIResponse } from '../../../packages/ship-fast-engine/src/lib/openui-preprocess'
import { Component, type CSSProperties, type ReactNode } from 'react'
import { I18nProvider, T } from './_providers/translation';

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

const idbPersister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get(key),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key),
  },
  key: 'ship-fast-openui-cache',
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
  theme,
  locale,
  embed,
  sessionId,
  integrations,
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
}) {
  const inEmbed = embed === true
  void theme
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
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
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
          <PersistQueryClientProvider
            client={openUIQueryClient}
            persistOptions={{
              persister: idbPersister,
              maxAge: Infinity,
            }}
          >
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
          </PersistQueryClientProvider>
        </RendererErrorBoundary>
      </div>
    </div>
  )
}
