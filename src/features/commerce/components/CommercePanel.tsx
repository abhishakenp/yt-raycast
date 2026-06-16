import { CheckCircle2, ShoppingCart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { EcommercifyTransformOverlay } from './EcommercifyTransformOverlay'
import { useCommerceController } from '../hooks/useCommerceController'

type CommercePanelProps = {
  sessionId: string
  onTransformingChange?: (isTransforming: boolean) => void
}

const minimumTransformMs = 1800

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms))

const readCommerceWarning = (
  configJson: string | undefined,
): string | undefined => {
  if (!configJson?.trim()) return undefined
  try {
    const parsed = JSON.parse(configJson) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return undefined
    const warning = (parsed as { warning?: unknown }).warning
    return typeof warning === 'string' && warning.trim()
      ? warning.trim()
      : undefined
  } catch {
    return undefined
  }
}

export const CommercePanel = ({
  sessionId,
  onTransformingChange,
}: CommercePanelProps) => {
  const {
    commerceError,
    commerceHandoff,
    config,
    isSaving,
    provisionCommerce,
  } = useCommerceController(sessionId)
  const [isTransforming, setIsTransforming] = useState(false)
  const isReady = config?.status === 'ready'
  const liveCheckoutWarning =
    config?.errorMessage ?? readCommerceWarning(config?.configJson)

  const handleSave = async () => {
    setIsTransforming(true)
    onTransformingChange?.(true)
    try {
      await Promise.all([provisionCommerce(), wait(minimumTransformMs)])
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
            {config?.productCount ?? 0}
          </span>
        </div>
      </div>
      <button
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[var(--bg-secondary)] px-4 py-3 font-sans text-sm font-semibold text-[var(--text-primary)] shadow-[0_0_0_1px_var(--ring),0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-[var(--dur)] ease-[var(--ease-out)] hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_0_0_1px_var(--ring-strong),0_0_24px_var(--glow),0_12px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] active:not-disabled:translate-y-0 active:not-disabled:duration-120 disabled:cursor-not-allowed disabled:opacity-30"
        disabled={isSaving}
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
          Commerce enabled. Live checkout needs Medusa Store API configuration.
        </p>
      )}
      {commerceHandoff !== undefined && (
        <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)]">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Medusa handoff
          </p>
          <div className="mt-3 grid gap-2">
            <a
              className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950"
              href={commerceHandoff.storefrontUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open storefront
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-[var(--text-primary)]"
              href={commerceHandoff.adminUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open admin
            </a>
          </div>
          {commerceHandoff.adminEmail !== undefined && (
            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Email</dt>
                <dd className="m-0 font-mono">{commerceHandoff.adminEmail}</dd>
              </div>
              {commerceHandoff.adminPassword !== undefined && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--text-muted)]">Password</dt>
                  <dd className="m-0 font-mono">
                    {commerceHandoff.adminPassword}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}
      {isReady && commerceHandoff === undefined && (
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
