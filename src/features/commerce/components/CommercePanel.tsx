import { CheckCircle2, ShoppingCart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { EcommercifyTransformOverlay } from './EcommercifyTransformOverlay'
import { useCommerceController } from '../hooks/useCommerceController'
import type { GeneratedCommerceProduct } from '../services/generated-commerce-products'

type CommercePanelProps = {
  sessionId: string
  onTransformingChange?: (isTransforming: boolean) => void
  visualProductCount?: number
  visualProducts?: Array<GeneratedCommerceProduct>
}

type CommerceConfig = {
  adminUrl?: string
  backendUrl?: string
  configJson?: string
  errorMessage?: string
  status?: string
  storefrontUrl?: string
}

type CommerceHandoff = {
  adminUrl: string
  backendUrl: string
  storefrontUrl: string
  tenantId: string
}

const minimumTransformMs = 1800

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

const medusaStoreApiUnavailableWarning = 'Medusa Store API is unavailable.'

function normalizeCommerceWarning(
  warning: string | undefined,
): string | undefined {
  const normalized = warning?.trim()
  if (!normalized) return undefined
  return /^Medusa Store API is unavailable:/i.test(normalized)
    ? medusaStoreApiUnavailableWarning
    : normalized
}

function readCommerceWarning(
  configJson: string | undefined,
): string | undefined {
  if (!configJson?.trim()) return undefined
  try {
    const parsed: unknown = JSON.parse(configJson)
    if (!isRecord(parsed)) return undefined
    const warning = parsed.warning
    return typeof warning === 'string'
      ? normalizeCommerceWarning(warning)
      : undefined
  } catch {
    return undefined
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeUrlForComparison(value: string | undefined): string {
  return value?.trim().replace(/\/+$/, '') ?? ''
}

function createGeneratedStorefrontUrl(sessionId: string): string {
  return `/generate/${encodeURIComponent(sessionId)}`
}

function resolveStorefrontUrl(
  sessionId: string,
  backendUrl: string | undefined,
  storefrontUrl: string,
): string {
  return normalizeUrlForComparison(backendUrl) ===
    normalizeUrlForComparison(storefrontUrl)
    ? createGeneratedStorefrontUrl(sessionId)
    : storefrontUrl
}

function createVisibleCommerceHandoff(
  sessionId: string,
  handoff: CommerceHandoff,
): CommerceHandoff {
  return {
    ...handoff,
    storefrontUrl: resolveStorefrontUrl(
      sessionId,
      handoff.backendUrl,
      handoff.storefrontUrl,
    ),
  }
}

function createPersistedCommerceHandoff(
  sessionId: string,
  config: CommerceConfig | null | undefined,
  warning?: string,
): CommerceHandoff | undefined {
  if (config?.status !== 'ready' || !config.adminUrl || !config.storefrontUrl) {
    return undefined
  }

  const isUnreachableDefaultHandoff =
    warning !== undefined &&
    config.adminUrl === 'http://localhost:7001' &&
    config.storefrontUrl === 'http://localhost:9000'

  if (isUnreachableDefaultHandoff) return undefined

  return {
    adminUrl: config.adminUrl,
    backendUrl: config.backendUrl ?? '',
    storefrontUrl: resolveStorefrontUrl(
      sessionId,
      config.backendUrl,
      config.storefrontUrl,
    ),
    tenantId: sessionId,
  }
}

export function CommercePanel({
  sessionId,
  onTransformingChange,
  visualProductCount,
  visualProducts = [],
}: CommercePanelProps) {
  const {
    commerceError,
    commerceHandoff,
    config,
    isSaving,
    provisionCommerce,
  } = useCommerceController(sessionId, visualProducts)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [isTransforming, setIsTransforming] = useState(false)
  const isReady = config?.status === 'ready'
  const hasConfiguredBackend = (config?.backendUrl?.trim().length ?? 0) > 0
  const requiresAdminCredentials = !hasConfiguredBackend
  const canSave =
    !isSaving &&
    (!requiresAdminCredentials ||
      (adminEmail.trim().length > 0 && adminPassword.length >= 8))
  const liveCheckoutWarning =
    normalizeCommerceWarning(config?.errorMessage) ??
    readCommerceWarning(config?.configJson)
  const visibleCommerceHandoff =
    commerceHandoff === undefined
      ? createPersistedCommerceHandoff(sessionId, config, liveCheckoutWarning)
      : createVisibleCommerceHandoff(sessionId, commerceHandoff)
  const liveProductCount = config?.productCount ?? 0
  const displayedProductCount =
    liveProductCount > 0
      ? liveProductCount
      : (visualProductCount ?? visualProducts.length)

  const handleSave = async () => {
    setIsTransforming(true)
    onTransformingChange?.(true)
    try {
      const credentials = requiresAdminCredentials
        ? { email: adminEmail, password: adminPassword }
        : undefined
      await Promise.all([
        provisionCommerce(credentials),
        wait(minimumTransformMs),
      ])
    } finally {
      setIsTransforming(false)
      onTransformingChange?.(false)
    }
  }

  return (
    <div className="rounded-[var(--radius-xl)] bg-[var(--glass-bg)] p-4 shadow-[var(--glass-shadow)] border border-[var(--glass-border)] backdrop-blur-[12px]">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-primary)] pb-2">
        <ShoppingCart className="size-4 text-cyan-200" />
        <h2 className="m-0 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)]">
          Medusa Commerce
        </h2>
      </div>
      <div className="mb-3 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--bg-input)] p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Tenant
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-100">
            {isReady ? (
              <CheckCircle2 className="size-3.5 text-emerald-300" />
            ) : (
              <Sparkles className="size-3.5 text-cyan-200" />
            )}
            {isReady
              ? liveCheckoutWarning === undefined
                ? 'Live ready'
                : 'Visual ready'
              : 'Setup needed'}
          </span>
        </div>
        <div className="mt-2 h-px bg-[var(--border-primary)]" />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Products
          </span>
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            {displayedProductCount}
          </span>
        </div>
      </div>
      {requiresAdminCredentials && (
        <div className="mb-3 grid gap-3 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--bg-input)] p-3">
          <p className="m-0 text-xs text-[var(--text-muted)]">
            Create your Medusa admin account. Ship Fast uses these credentials
            only during setup and does not store the password.
          </p>
          <label className="grid gap-1 text-xs font-semibold text-[var(--text-primary)]">
            Admin email
            <input
              autoComplete="email"
              className="rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
              onChange={(event) => setAdminEmail(event.target.value)}
              required
              type="email"
              value={adminEmail}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-[var(--text-primary)]">
            Admin password
            <input
              autoComplete="new-password"
              className="rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
              minLength={8}
              onChange={(event) => setAdminPassword(event.target.value)}
              required
              type="password"
              value={adminPassword}
            />
          </label>
        </div>
      )}
      <button
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[var(--bg-secondary)] px-4 py-3 font-sans text-sm font-semibold text-[var(--text-primary)] shadow-[0_0_0_1px_var(--ring),0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-[var(--dur)] ease-[var(--ease-out)] hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_0_0_1px_var(--ring-strong),0_0_24px_var(--glow),0_12px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] active:not-disabled:translate-y-0 active:not-disabled:duration-120 disabled:cursor-not-allowed disabled:opacity-30"
        disabled={!canSave}
        onClick={handleSave}
        type="button"
      >
        <Sparkles className="size-4" />
        {isSaving
          ? 'Enabling...'
          : isReady
            ? 'Refresh Commerce'
            : 'Enable Commerce'}
      </button>
      {commerceError && (
        <p className="mt-3 rounded-[var(--radius-sm)] border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-400">
          {commerceError}
        </p>
      )}
      {isReady && liveCheckoutWarning === undefined && (
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-400">
          Live commerce ready
        </p>
      )}
      {isReady && liveCheckoutWarning !== undefined && (
        <p className="mt-3 rounded-[var(--radius-sm)] border border-amber-400/30 bg-amber-400/12 p-3 text-sm text-amber-100">
          {liveCheckoutWarning}
        </p>
      )}
      {visibleCommerceHandoff !== undefined && (
        <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)]">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Medusa handoff
          </p>
          <div className="mt-3 grid gap-2">
            <a
              className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950"
              href={visibleCommerceHandoff.storefrontUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open storefront
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-[var(--text-primary)]"
              href={visibleCommerceHandoff.adminUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open admin
            </a>
          </div>
        </div>
      )}
      {isReady && visibleCommerceHandoff === undefined && (
        <p className="mt-3 rounded-[var(--radius-sm)] border border-white/10 bg-white/[0.04] p-3 text-xs text-[var(--text-muted)]">
          Set Medusa backend, admin, and storefront URLs to unlock links.
        </p>
      )}
      {isTransforming && typeof document !== 'undefined'
        ? createPortal(<EcommercifyTransformOverlay fixed />, document.body)
        : null}
    </div>
  )
}
