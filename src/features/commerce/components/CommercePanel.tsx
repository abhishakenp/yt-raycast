import { CheckCircle2, Lock, ShoppingCart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { EcommercifyTransformOverlay } from './EcommercifyTransformOverlay'
import { useCommerceAccess } from '../hooks/useCommerceAccess'
import type { GeneratedCommerceProduct } from '../services/generated-commerce-products'
import { requestClerkSignIn } from '@/shared/auth/use-optional-auth'

type CommercePanelProps = {
  sessionId: string
  onTransformingChange?: (isTransforming: boolean) => void
  visualProductCount?: number
  visualProducts?: Array<GeneratedCommerceProduct>
}

const minimumTransformMs = 1800

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

const provisioningInstanceStatuses = new Set(['provisioning', 'resuming'])
const provisioningStoreStatuses = new Set([
  'not_enabled',
  'provisioning',
  'syncing_products',
])

function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-xl)] bg-[var(--glass-bg)] p-4 shadow-[var(--glass-shadow)] border border-[var(--glass-border)] backdrop-blur-[12px]">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-primary)] pb-2">
        <ShoppingCart className="size-4 text-cyan-200" />
        <h2 className="m-0 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)]">
          Medusa Commerce
        </h2>
      </div>
      {children}
    </div>
  )
}

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[var(--bg-secondary)] px-4 py-3 font-sans text-sm font-semibold text-[var(--text-primary)] shadow-[0_0_0_1px_var(--ring),0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-[var(--dur)] ease-[var(--ease-out)] hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_0_0_1px_var(--ring-strong),0_0_24px_var(--glow),0_12px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] active:not-disabled:translate-y-0 active:not-disabled:duration-120 disabled:cursor-not-allowed disabled:opacity-30"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

export function CommercePanel({
  sessionId,
  onTransformingChange,
  visualProductCount,
  visualProducts = [],
}: CommercePanelProps) {
  const {
    access,
    adminError,
    enableCommerce,
    enableError,
    isEnabling,
    isOpeningAdmin,
    openAdmin,
  } = useCommerceAccess(sessionId)
  const [isTransforming, setIsTransforming] = useState(false)
  const displayedProductCount = visualProductCount ?? visualProducts.length

  const handleEnable = async () => {
    setIsTransforming(true)
    onTransformingChange?.(true)
    try {
      await Promise.all([enableCommerce(), wait(minimumTransformMs)])
    } finally {
      setIsTransforming(false)
      onTransformingChange?.(false)
    }
  }

  const transformOverlay =
    isTransforming && typeof document !== 'undefined'
      ? createPortal(<EcommercifyTransformOverlay fixed />, document.body)
      : null

  if (access === undefined) {
    return (
      <PanelShell>
        <p className="m-0 text-xs text-[var(--text-muted)]">
          Loading commerce status...
        </p>
      </PanelShell>
    )
  }

  if (access.authState === 'signed-out') {
    return (
      <PanelShell>
        <p className="m-0 mb-3 text-xs text-[var(--text-muted)]">
          Sign in to enable commerce for this site.
        </p>
        <PrimaryButton onClick={() => requestClerkSignIn()}>
          <Lock className="size-4" />
          Sign in
        </PrimaryButton>
      </PanelShell>
    )
  }

  if (access.authState === 'unpaid') {
    return (
      <PanelShell>
        <p className="m-0 mb-3 text-xs text-[var(--text-muted)]">
          Commerce is available on a paid plan. Upgrade to enable a dedicated
          Medusa store for this site.
        </p>
        <a
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border-0 bg-[var(--bg-secondary)] px-4 py-3 text-center font-sans text-sm font-semibold text-[var(--text-primary)] shadow-[0_0_0_1px_var(--ring),0_8px_20px_rgba(0,0,0,0.25)]"
          href="/pricing"
        >
          <Sparkles className="size-4" />
          Upgrade
        </a>
      </PanelShell>
    )
  }

  const isProvisioning =
    (access.instanceStatus !== null &&
      provisioningInstanceStatuses.has(access.instanceStatus)) ||
    (access.storeStatus !== null &&
      provisioningStoreStatuses.has(access.storeStatus))
  const isReady =
    access.enabled &&
    access.instanceStatus === 'ready' &&
    access.storeStatus === 'ready'

  return (
    <PanelShell>
      <div className="mb-3 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--bg-input)] p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Store
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-100">
            {isReady ? (
              <CheckCircle2 className="size-3.5 text-emerald-300" />
            ) : (
              <Sparkles className="size-3.5 text-cyan-200" />
            )}
            {isReady
              ? 'Live ready'
              : isProvisioning
                ? 'Provisioning...'
                : access.enabled
                  ? access.instanceStatus === 'degraded'
                    ? 'Degraded'
                    : 'Setting up'
                  : 'Not enabled'}
          </span>
        </div>
        <div className="mt-2 h-px bg-[var(--border-primary)]" />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Products
          </span>
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            {access.productCount && access.productCount > 0
              ? access.productCount
              : displayedProductCount}
          </span>
        </div>
      </div>

      {!access.enabled && (
        <PrimaryButton disabled={isEnabling} onClick={handleEnable}>
          <Sparkles className="size-4" />
          {isEnabling ? 'Enabling...' : 'Enable Commerce'}
        </PrimaryButton>
      )}

      {enableError && (
        <p className="mt-3 rounded-[var(--radius-sm)] border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-400">
          {enableError}
        </p>
      )}

      {access.enabled && isProvisioning && (
        <p className="mt-3 rounded-[var(--radius-sm)] border border-white/10 bg-white/[0.04] p-3 text-xs text-[var(--text-muted)]">
          Setting up your dedicated commerce stack. This page updates
          automatically — no need to refresh.
        </p>
      )}

      {access.enabled && access.instanceStatus === 'degraded' && (
        <p className="mt-3 rounded-[var(--radius-sm)] border border-amber-400/30 bg-amber-400/12 p-3 text-sm text-amber-100">
          Commerce is degraded. Storefront checkout may be temporarily
          unavailable.
        </p>
      )}

      {isReady && (
        <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)]">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Medusa handoff
          </p>
          <div className="mt-3 grid gap-2">
            {access.storefrontUrl && (
              <a
                className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950"
                href={access.storefrontUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open storefront
              </a>
            )}
            <button
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-[var(--text-primary)]"
              disabled={isOpeningAdmin}
              onClick={() => void openAdmin()}
              type="button"
            >
              {isOpeningAdmin ? 'Opening admin...' : 'Open admin'}
            </button>
          </div>
          {adminError && (
            <p className="m-0 mt-2 text-xs text-rose-400">{adminError}</p>
          )}
        </div>
      )}

      {transformOverlay}
    </PanelShell>
  )
}
