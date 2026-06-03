import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { defineComponent } from "@openuidev/react-lang"

export type OpenUIIntegrationConfig = Record<string, string | null>

export type OpenUIIntegrationPayload = {
  enabled: boolean
  config?: OpenUIIntegrationConfig | null
}

export type OpenUILibraryComponent = ReturnType<typeof defineComponent>

export type OpenUISanityContextValue = {
  enabled: boolean
  ready: boolean
  status: "disabled" | "checking" | "ready" | "error"
  config: OpenUIIntegrationConfig
  error: string | null
}

export type OpenUIMedusaContextValue = {
  enabled: boolean
  ready: boolean
  status: "disabled" | "checking" | "ready" | "error"
  config: OpenUIIntegrationConfig
  backendUrl: string | null
  storefrontUrl: string | null
  error: string | null
}

export const OpenUISanityContext = createContext<OpenUISanityContextValue>({
  enabled: false,
  ready: false,
  status: "disabled",
  config: {},
  error: null,
})

export const OpenUIMedusaContext = createContext<OpenUIMedusaContextValue>({
  enabled: false,
  ready: false,
  status: "disabled",
  config: {},
  backendUrl: null,
  storefrontUrl: null,
  error: null,
})

function sanitizeOpenUIIntegrationConfig(raw: unknown): OpenUIIntegrationConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const output: OpenUIIntegrationConfig = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") output[key] = value.trim()
  }
  return output
}

function normalizeOpenUIIntegrationPayload(raw: unknown): OpenUIIntegrationPayload {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
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
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return fallback
  const candidate = (payload as { error?: unknown }).error
  if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
  const detail = (payload as { detail?: unknown }).detail
  if (typeof detail === "string" && detail.trim()) return detail.trim()
  return fallback
}

function pickMedusaBackendUrl(config?: OpenUIIntegrationConfig | null): string | null {
  if (!config) return null
  const backend = config.backendUrl || config.adminBaseUrl
  return typeof backend === "string" && backend.trim() ? backend.trim() : null
}

function hasSanityConfig(config?: OpenUIIntegrationConfig | null): boolean {
  if (!config) return false
  return Boolean(config.projectId || config.dataset)
}

function hasMedusaConfig(config?: OpenUIIntegrationConfig | null): boolean {
  if (!config) return false
  return Boolean(pickMedusaBackendUrl(config) || config.storefrontUrl)
}

function OpenUIMedusaBoundary({ children }: { children: ReactNode }) {
  const context = useContext(OpenUIMedusaContext)
  return <OpenUIMedusaContext.Provider value={context}>{children}</OpenUIMedusaContext.Provider>
}

function OpenUISanityBoundary({ children }: { children: ReactNode }) {
  const context = useContext(OpenUISanityContext)
  return <OpenUISanityContext.Provider value={context}>{children}</OpenUISanityContext.Provider>
}

export function withSanity(component: OpenUILibraryComponent): OpenUILibraryComponent {
  const Comp = component.component
  return {
    ...component,
    component: (renderProps: any) => {
      const sanity = useContext(OpenUISanityContext)
      if (!sanity.enabled) {
        return <Comp {...renderProps} />
      }
      return <OpenUISanityBoundary><Comp {...renderProps} /></OpenUISanityBoundary>
    },
  }
}

export function withMedusa(component: OpenUILibraryComponent): OpenUILibraryComponent {
  const Comp = component.component
  return {
    ...component,
    component: (renderProps: any) => {
      const medusa = useContext(OpenUIMedusaContext)
      if (!medusa.enabled) {
        return <Comp {...renderProps} />
      }
      return <OpenUIMedusaBoundary><Comp {...renderProps} /></OpenUIMedusaBoundary>
    },
  }
}

export function IntegrationProvider({
  children,
  sanity,
  medusa,
  sessionId,
}: {
  children: ReactNode
  sanity?: OpenUIIntegrationPayload | null
  medusa?: OpenUIIntegrationPayload | null
  sessionId?: string | null
}) {
  const normalizedSanity = normalizeOpenUIIntegrationPayload(sanity)
  const normalizedMedusa = normalizeOpenUIIntegrationPayload(medusa)

  const [sanityConfig, setSanityConfig] = useState<OpenUIIntegrationConfig>(normalizedSanity.config || {})
  const [sanityReady, setSanityReady] = useState<boolean>(hasSanityConfig(normalizedSanity.config))
  const [sanityStatus, setSanityStatus] = useState<OpenUISanityContextValue["status"]>(
    normalizedSanity.enabled && hasSanityConfig(normalizedSanity.config) ? "ready" : "disabled",
  )
  const [sanityError, setSanityError] = useState<string | null>(null)

  const [medusaConfig, setMedusaConfig] = useState<OpenUIIntegrationConfig>(
    normalizedMedusa.config || {},
  )
  const [medusaReady, setMedusaReady] = useState<boolean>(hasMedusaConfig(normalizedMedusa.config))
  const [medusaStatus, setMedusaStatus] = useState<OpenUIMedusaContextValue["status"]>(
    normalizedMedusa.enabled && hasMedusaConfig(normalizedMedusa.config) ? "ready" : "disabled",
  )
  const [medusaBackendUrl, setMedusaBackendUrl] = useState<string | null>(pickMedusaBackendUrl(normalizedMedusa.config))
  const [medusaStorefrontUrl, setMedusaStorefrontUrl] = useState<string | null>(normalizedMedusa.config?.storefrontUrl || null)
  const [medusaError, setMedusaError] = useState<string | null>(null)

  useEffect(() => {
    setSanityConfig(normalizedSanity.config || {})
  }, [
    normalizedSanity.config?.apiVersion,
    normalizedSanity.config?.dataset,
    normalizedSanity.config?.projectId,
  ])

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
    const configured = hasSanityConfig(normalizedSanity.config)

    if (!normalizedSanity.enabled || !sessionId) {
      setSanityReady(configured)
      setSanityStatus(configured ? "ready" : "disabled")
      setSanityError(null)
      return
    }

    setSanityReady(false)
    setSanityStatus("checking")
    setSanityError(null)

    const provisionSanity = async () => {
      try {
        const r = await fetch("/api/provision/sanity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })
        if (!active) return
        if (!r.ok) {
          const body = await r.json().catch(() => null)
          setSanityReady(false)
          setSanityStatus("error")
          setSanityError(normalizeProvisionError(body, `Sanity provision failed: ${r.status}`))
          return
        }

        const payload = (await r.json()) as OpenUIProvisionPayload
        const nextConfig = sanitizeOpenUIIntegrationConfig(payload.config)
        const merged = { ...normalizedSanity.config, ...nextConfig }
        const nextReady = hasSanityConfig(merged)
        setSanityConfig(merged)
        setSanityReady(nextReady)
        setSanityStatus(nextReady ? "ready" : "error")
        setSanityError(
          nextReady
            ? null
            : payload?.error
              ? String(payload.error)
              : "Sanity provisioned but returned without required fields.",
        )
      } catch (error) {
        if (!active) return
        setSanityReady(false)
        setSanityStatus("error")
        setSanityError(error instanceof Error ? error.message : "Sanity config check failed")
      }
    }
    void provisionSanity()

    return () => {
      active = false
    }
  }, [
    normalizedSanity.enabled,
    sessionId,
    normalizedSanity.config?.apiVersion,
    normalizedSanity.config?.dataset,
    normalizedSanity.config?.projectId,
  ])

  useEffect(() => {
    let active = true
    const configured = hasMedusaConfig(normalizedMedusa.config)

    if (!normalizedMedusa.enabled || !sessionId) {
      setMedusaReady(configured)
      setMedusaStatus(configured ? "ready" : "disabled")
      setMedusaError(null)
      return
    }

    setMedusaReady(false)
    setMedusaStatus("checking")
    setMedusaError(null)

    const provisionMedusa = async () => {
      try {
        const r = await fetch("/api/provision/medusa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })
        if (!active) return
        if (!r.ok) {
          const body = await r.json().catch(() => null)
          setMedusaReady(false)
          setMedusaStatus("error")
          setMedusaError(normalizeProvisionError(body, `Medusa provision failed: ${r.status}`))
          return
        }

        const payload = (await r.json()) as OpenUIProvisionPayload & {
          config?: OpenUIIntegrationConfig | null
        }
        const nextConfig = sanitizeOpenUIIntegrationConfig(payload.config)
        const merged = { ...normalizedMedusa.config, ...nextConfig }
        const backendUrl = pickMedusaBackendUrl(merged)
        const storefrontUrl =
          typeof merged.storefrontUrl === "string" && merged.storefrontUrl.trim().length > 0
            ? merged.storefrontUrl.trim()
            : null
        const nextReady = Boolean(payload?.enabled || backendUrl || storefrontUrl)
        setMedusaConfig(merged)
        setMedusaBackendUrl(backendUrl)
        setMedusaStorefrontUrl(storefrontUrl)
        setMedusaReady(nextReady)
        setMedusaStatus(nextReady ? "ready" : "disabled")
        setMedusaError(nextReady ? null : "Medusa provisioned but returned without usable URLs.")
      } catch (error) {
        if (!active) return
        setMedusaReady(false)
        setMedusaError(error instanceof Error ? error.message : "Medusa config check failed")
        setMedusaStatus("error")
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

  const sanityValue: OpenUISanityContextValue = useMemo(
    () => ({
      enabled: normalizedSanity.enabled,
      ready: sanityReady,
      status: sanityStatus,
      config: sanityConfig || {},
      error: sanityError,
    }),
    [normalizedSanity.enabled, sanityReady, sanityStatus, sanityConfig, sanityError],
  )

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
    <OpenUISanityContext.Provider value={sanityValue}>
      <OpenUIMedusaContext.Provider value={medusaValue}>
        {children}
      </OpenUIMedusaContext.Provider>
    </OpenUISanityContext.Provider>
  )
}

// Keep an alias for compatibility if needed
export const OpenUIIntegrationProviders = IntegrationProvider
