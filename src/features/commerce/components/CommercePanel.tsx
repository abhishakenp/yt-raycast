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

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const CommercePanel = ({ sessionId, onTransformingChange }: CommercePanelProps) => {
  const { commerceError, config, isSaving, provisionCommerce } = useCommerceController(sessionId)
  const [isTransforming, setIsTransforming] = useState(false)
  const isReady = config?.status === 'ready'

  const handleSave = async () => {
    setIsTransforming(true)
    onTransformingChange?.(true)
    try {
      await Promise.all([
        provisionCommerce(),
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
        <h2 className="m-0 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)]">Medusa Commerce</h2>
      </div>
      <div className="mb-3 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--bg-input)] p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Tenant</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-100">
            {isReady ? <CheckCircle2 className="size-3.5 text-emerald-300" /> : <Sparkles className="size-3.5 text-cyan-200" />}
            {isReady ? 'Ready' : 'Automatic'}
          </span>
        </div>
        <div className="mt-2 h-px bg-[var(--border-primary)]" />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Products</span>
          <span className="text-xs font-semibold text-[var(--text-primary)]">{config?.productCount ?? 0}</span>
        </div>
      </div>
      <button
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[var(--bg-secondary)] px-4 py-3 font-sans text-sm font-semibold text-[var(--text-primary)] shadow-[0_0_0_1px_var(--ring),0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-[var(--dur)] ease-[var(--ease-out)] hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_0_0_1px_var(--ring-strong),0_0_24px_var(--glow),0_12px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] active:not-disabled:translate-y-0 active:not-disabled:duration-120 disabled:cursor-not-allowed disabled:opacity-30"
        disabled={isSaving}
        onClick={handleSave}
        type="button"
      >
        <Sparkles className="size-4" />
        {isSaving ? 'Enabling...' : isReady ? 'Refresh Commerce' : 'Enable Commerce'}
      </button>
      {commerceError && <p className="mt-3 rounded-[var(--radius-sm)] border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-400">{commerceError}</p>}
      {isReady && <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-400">Commerce ready</p>}
      {isTransforming && typeof document !== 'undefined'
        ? createPortal(<EcommercifyTransformOverlay fixed />, document.body)
        : null}
    </div>
  )
}
