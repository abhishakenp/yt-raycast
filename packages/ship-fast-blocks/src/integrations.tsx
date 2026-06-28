import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { defineComponent } from '@openuidev/react-lang'

export type OpenUIIntegrationConfig = Record<string, string | null>

export type OpenUIIntegrationPayload = {
  enabled: boolean
  config?: OpenUIIntegrationConfig | null
}

export type OpenUILibraryComponent = ReturnType<typeof defineComponent>

export type OpenUIMedusaContextValue = {
  enabled: boolean
  ready: boolean
  status: 'disabled' | 'checking' | 'ready' | 'error'
  config: OpenUIIntegrationConfig
  backendUrl: string | null
  storefrontUrl: string | null
  error: string | null
}

export const OpenUIMedusaContext = createContext<OpenUIMedusaContextValue>({
  enabled: false,
  ready: false,
  status: 'disabled',
  config: {},
  backendUrl: null,
  storefrontUrl: null,
  error: null,
})

function sanitizeOpenUIIntegrationConfig(
  raw: unknown,
): OpenUIIntegrationConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const output: OpenUIIntegrationConfig = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') output[key] = value.trim()
  }
  return output
}

function normalizeOpenUIIntegrationPayload(
  raw: unknown,
): OpenUIIntegrationPayload {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { enabled: false, config: {} }
  }
  const payload = raw as { enabled?: unknown; config?: unknown }
  return {
    enabled: Boolean(payload.enabled),
    config: sanitizeOpenUIIntegrationConfig(payload.config),
  }
}

type OpenUIProvisionPayload = {
  config?: unknown
  enabled?: boolean
  error?: string
  detail?: string
}

function normalizeProvisionError(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    return fallback
  const candidate = (payload as { error?: unknown }).error
  if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  const detail = (payload as { detail?: unknown }).detail
  if (typeof detail === 'string' && detail.trim()) return detail.trim()
  return fallback
}

function readMedusaWarning(
  config?: OpenUIIntegrationConfig | null,
): string | null {
  const errorMessage = config?.errorMessage
  if (typeof errorMessage === 'string' && errorMessage.trim())
    return errorMessage.trim()
  const configJson = config?.configJson
  if (typeof configJson !== 'string' || !configJson.trim()) return null
  try {
    const parsed = JSON.parse(configJson) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return null
    const warning = (parsed as { warning?: unknown }).warning
    return typeof warning === 'string' && warning.trim() ? warning.trim() : null
  } catch {
    return null
  }
}

function pickMedusaBackendUrl(
  config?: OpenUIIntegrationConfig | null,
): string | null {
  if (!config) return null
  const backend = config.backendUrl || config.adminBaseUrl
  return typeof backend === 'string' && backend.trim() ? backend.trim() : null
}

function hasMedusaConfig(config?: OpenUIIntegrationConfig | null): boolean {
  if (!config) return false
  return Boolean(pickMedusaBackendUrl(config) || config.storefrontUrl)
}

function OpenUIMedusaBoundary({ children }: { children: ReactNode }) {
  const context = useContext(OpenUIMedusaContext)
  return (
    <OpenUIMedusaContext.Provider value={context}>
      {children}
    </OpenUIMedusaContext.Provider>
  )
}

export function withMedusa(
  component: OpenUILibraryComponent,
): OpenUILibraryComponent {
  const Comp = component.component
  return {
    ...component,
    component: (renderProps: any) => {
      const medusa = useContext(OpenUIMedusaContext)
      if (!medusa.enabled) {
        return <Comp {...renderProps} />
      }
      return (
        <OpenUIMedusaBoundary>
          <Comp {...renderProps} />
        </OpenUIMedusaBoundary>
      )
    },
  }
}

export function IntegrationProvider({
  children,
  medusa,
  sessionId,
}: {
  children: ReactNode
  medusa?: OpenUIIntegrationPayload | null
  sessionId?: string | null
}) {
  const normalizedMedusa = normalizeOpenUIIntegrationPayload(medusa)

  const [medusaConfig, setMedusaConfig] = useState<OpenUIIntegrationConfig>(
    normalizedMedusa.config || {},
  )
  const [medusaReady, setMedusaReady] = useState<boolean>(
    hasMedusaConfig(normalizedMedusa.config),
  )
  const [medusaStatus, setMedusaStatus] = useState<
    OpenUIMedusaContextValue['status']
  >(
    normalizedMedusa.enabled && hasMedusaConfig(normalizedMedusa.config)
      ? 'ready'
      : 'disabled',
  )
  const [medusaBackendUrl, setMedusaBackendUrl] = useState<string | null>(
    pickMedusaBackendUrl(normalizedMedusa.config),
  )
  const [medusaStorefrontUrl, setMedusaStorefrontUrl] = useState<string | null>(
    normalizedMedusa.config?.storefrontUrl || null,
  )
  const [medusaError, setMedusaError] = useState<string | null>(null)

  useEffect(() => {
    setMedusaConfig(normalizedMedusa.config || {})
    setMedusaBackendUrl(pickMedusaBackendUrl(normalizedMedusa.config))
    setMedusaStorefrontUrl(normalizedMedusa.config?.storefrontUrl || null)
  }, [
    normalizedMedusa.config?.backendUrl,
    normalizedMedusa.config?.adminBaseUrl,
    normalizedMedusa.config?.storefrontUrl,
  ])

  useEffect(() => {
    let active = true
    const configured = hasMedusaConfig(normalizedMedusa.config)

    if (!normalizedMedusa.enabled || !sessionId) {
      setMedusaReady(configured)
      setMedusaStatus(configured ? 'ready' : 'disabled')
      setMedusaError(null)
      return
    }

    setMedusaReady(false)
    setMedusaStatus('checking')
    setMedusaError(null)

    const provisionMedusa = async () => {
      try {
        const r = await fetch(
          `/api/sessions/${encodeURIComponent(sessionId)}/medusa-config`,
          {
            headers: { Accept: 'application/json' },
          },
        )
        if (!active) return
        if (!r.ok) {
          const body = await r.json().catch(() => null)
          setMedusaReady(false)
          setMedusaStatus('error')
          setMedusaError(
            normalizeProvisionError(
              body,
              `Medusa provision failed: ${r.status}`,
            ),
          )
          return
        }

        const payload = (await r.json()) as OpenUIProvisionPayload & {
          config?: OpenUIIntegrationConfig | null
        }
        const nextConfig = sanitizeOpenUIIntegrationConfig(payload.config)
        const merged = { ...normalizedMedusa.config, ...nextConfig }
        const backendUrl = pickMedusaBackendUrl(merged)
        const storefrontUrl =
          typeof merged.storefrontUrl === 'string' &&
          merged.storefrontUrl.trim().length > 0
            ? merged.storefrontUrl.trim()
            : null
        const nextReady = Boolean(
          payload?.enabled || backendUrl || storefrontUrl,
        )
        const warning = readMedusaWarning(merged)
        setMedusaConfig(merged)
        setMedusaBackendUrl(backendUrl)
        setMedusaStorefrontUrl(storefrontUrl)
        setMedusaReady(nextReady)
        setMedusaStatus(nextReady ? 'ready' : 'disabled')
        setMedusaError(
          nextReady ? warning : 'Medusa config returned without usable URLs.',
        )
      } catch (error) {
        if (!active) return
        setMedusaReady(false)
        setMedusaError(
          error instanceof Error ? error.message : 'Medusa config check failed',
        )
        setMedusaStatus('error')
      }
    }
    void provisionMedusa()

    return () => {
      active = false
    }
  }, [
    normalizedMedusa.enabled,
    sessionId,
    normalizedMedusa.config?.adminBaseUrl,
    normalizedMedusa.config?.backendUrl,
    normalizedMedusa.config?.storefrontUrl,
  ])

  const medusaValue: OpenUIMedusaContextValue = useMemo(
    () => ({
      enabled: normalizedMedusa.enabled,
      ready: medusaReady,
      status: medusaStatus,
      config: medusaConfig || {},
      backendUrl: medusaBackendUrl,
      storefrontUrl: medusaStorefrontUrl,
      error: medusaError,
    }),
    [
      normalizedMedusa.enabled,
      medusaReady,
      medusaStatus,
      medusaConfig,
      medusaBackendUrl,
      medusaStorefrontUrl,
      medusaError,
    ],
  )

  return (
    <OpenUIMedusaContext.Provider value={medusaValue}>
      {children}
    </OpenUIMedusaContext.Provider>
  )
}

// Keep an alias for compatibility if needed
export const OpenUIIntegrationProviders = IntegrationProvider
