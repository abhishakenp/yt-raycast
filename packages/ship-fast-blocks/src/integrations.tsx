import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { defineComponent } from '@openuidev/react-lang'
import { readJsonOrThrow } from './lib/safe-fetch'

export type OpenUIIntegrationConfig = Record<string, string | null>

export type OpenUIIntegrationPayload = {
  enabled: boolean
  config?: unknown
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

const medusaStoreApiUnavailableWarning = 'Medusa Store API is unavailable.'

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

type NormalizedIntegrationPayload = {
  enabled: boolean
  config: OpenUIIntegrationConfig
}

function normalizeOpenUIIntegrationPayload(
  raw: unknown,
): NormalizedIntegrationPayload {
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

function normalizeMedusaWarning(warning: unknown): string | null {
  if (typeof warning !== 'string') return null
  const normalized = warning.trim()
  if (!normalized) return null
  return /^Medusa Store API is unavailable:/i.test(normalized)
    ? medusaStoreApiUnavailableWarning
    : normalized
}

function readMedusaWarning(
  config?: OpenUIIntegrationConfig | null,
): string | null {
  const errorMessage = normalizeMedusaWarning(config?.errorMessage)
  if (errorMessage !== null) return errorMessage
  const configJson = config?.configJson
  if (typeof configJson !== 'string' || !configJson.trim()) return null
  try {
    const parsed = JSON.parse(configJson) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return null
    const warning = (parsed as { warning?: unknown }).warning
    return normalizeMedusaWarning(warning)
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

/**
 * Pick the Medusa storefront URL from an integration config, trimming
 * whitespace and returning null when no usable URL is present.
 */
export function pickMedusaStorefrontUrl(
  config?: OpenUIIntegrationConfig | null,
): string | null {
  if (!config) return null
  const storefront = config.storefrontUrl
  return typeof storefront === 'string' && storefront.trim().length > 0
    ? storefront.trim()
    : null
}

function pickDeploymentSlug(
  config?: OpenUIIntegrationConfig | null,
): string | null {
  if (!config) return null
  const deploymentSlug = config.deploymentSlug
  return typeof deploymentSlug === 'string' && deploymentSlug.trim().length > 0
    ? deploymentSlug.trim()
    : null
}

export type MedusaProvisionResult = {
  config: OpenUIIntegrationConfig
  backendUrl: string | null
  storefrontUrl: string | null
  ready: boolean
  status: 'ready' | 'disabled' | 'error'
  error: string | null
}

/**
 * Provision a Medusa integration for a session: fetch the session's Medusa
 * config from the server, merge it with the supplied base config, and return a
 * normalized result describing the resolved URLs / readiness / status. Network
 * failures are caught and surfaced as an `error` status.
 */
export async function provisionMedusaIntegration(
  sessionId: string,
  baseConfig: OpenUIIntegrationConfig,
): Promise<MedusaProvisionResult> {
  try {
    const deploymentSlug = pickDeploymentSlug(baseConfig)
    const configPath =
      deploymentSlug === null
        ? `/api/sessions/${encodeURIComponent(sessionId)}/medusa-config`
        : `/api/deployments/${encodeURIComponent(deploymentSlug)}/medusa-config`
    const r = await fetch(configPath, {
      headers: { Accept: 'application/json' },
    })
    if (!r.ok) {
      const body = await r.json().catch(() => null)
      return {
        config: baseConfig,
        backendUrl: pickMedusaBackendUrl(baseConfig),
        storefrontUrl: pickMedusaStorefrontUrl(baseConfig),
        ready: false,
        status: 'error',
        error: normalizeProvisionError(
          body,
          `Medusa provision failed: ${r.status}`,
        ),
      }
    }

    const payload = (await readJsonOrThrow<
      OpenUIProvisionPayload & {
        config?: OpenUIIntegrationConfig | null
      }
    >(r, 'Medusa config check failed')) as OpenUIProvisionPayload & {
      config?: OpenUIIntegrationConfig | null
    }
    const nextConfig = sanitizeOpenUIIntegrationConfig(payload.config)
    const merged = { ...baseConfig, ...nextConfig }
    const backendUrl = pickMedusaBackendUrl(merged)
    const storefrontUrl = pickMedusaStorefrontUrl(merged)
    const nextReady = Boolean(payload?.enabled || backendUrl || storefrontUrl)
    const warning = readMedusaWarning(merged)
    return {
      config: merged,
      backendUrl,
      storefrontUrl,
      ready: nextReady,
      status: nextReady ? 'ready' : 'disabled',
      error: nextReady
        ? warning
        : 'Medusa config returned without usable URLs.',
    }
  } catch (error) {
    return {
      config: baseConfig,
      backendUrl: pickMedusaBackendUrl(baseConfig),
      storefrontUrl: pickMedusaStorefrontUrl(baseConfig),
      ready: false,
      status: 'error',
      error:
        error instanceof Error ? error.message : 'Medusa config check failed',
    }
  }
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
  children?: ReactNode
  medusa?: unknown
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
    setMedusaStorefrontUrl(pickMedusaStorefrontUrl(normalizedMedusa.config))
  }, [
    normalizedMedusa.config?.backendUrl,
    normalizedMedusa.config?.adminBaseUrl,
    normalizedMedusa.config?.deploymentSlug,
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

    void (async () => {
      const result = await provisionMedusaIntegration(
        sessionId,
        normalizedMedusa.config || {},
      )
      if (!active) return
      setMedusaConfig(result.config)
      setMedusaBackendUrl(result.backendUrl)
      setMedusaStorefrontUrl(result.storefrontUrl)
      setMedusaReady(result.ready)
      setMedusaStatus(result.status)
      setMedusaError(result.error)
    })()

    return () => {
      active = false
    }
  }, [
    normalizedMedusa.enabled,
    sessionId,
    normalizedMedusa.config?.adminBaseUrl,
    normalizedMedusa.config?.backendUrl,
    normalizedMedusa.config?.deploymentSlug,
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
