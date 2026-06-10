import { ShoppingCart, Save } from 'lucide-react'
import { useState } from 'react'

import { useCommerceController } from '../hooks/useCommerceController'

type CommercePanelProps = {
  sessionId: string
}

export const CommercePanel = ({ sessionId }: CommercePanelProps) => {
  const { commerceError, config, isSaving, saveConfig } = useCommerceController(sessionId)
  const [backendUrl, setBackendUrl] = useState(config?.backendUrl ?? '')
  const [adminUrl, setAdminUrl] = useState(config?.adminUrl ?? '')
  const [storefrontUrl, setStorefrontUrl] = useState(config?.storefrontUrl ?? '')

  const handleSave = async () => {
    await saveConfig(
      backendUrl || undefined,
      adminUrl || undefined,
      storefrontUrl || undefined,
      undefined,
    )
  }

  return (
    <div className="rounded-[var(--radius-xl)] bg-[var(--glass-bg)] p-4 shadow-[var(--glass-shadow)] border border-[var(--glass-border)] backdrop-blur-[12px]">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-primary)] pb-2">
        <ShoppingCart className="size-4 text-cyan-200" />
        <h2 className="m-0 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)]">Medusa Commerce</h2>
      </div>
      <div className="mb-3 flex flex-col gap-1">
        <label className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Backend URL</label>
        <input
          className="rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-input)] px-3.5 py-2.5 font-sans text-sm text-[var(--text-primary)] outline-none transition-all duration-300 ease-[var(--ease-out)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)] focus:shadow-[0_0_0_3px_rgba(138,180,255,0.08),0_0_20px_rgba(138,180,255,0.06)]"
          disabled={isSaving}
          onChange={(e) => setBackendUrl(e.target.value)}
          placeholder="https://your-medusa-backend.com"
          value={backendUrl}
        />
      </div>
      <div className="mb-3 flex flex-col gap-1">
        <label className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Admin URL</label>
        <input
          className="rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-input)] px-3.5 py-2.5 font-sans text-sm text-[var(--text-primary)] outline-none transition-all duration-300 ease-[var(--ease-out)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)] focus:shadow-[0_0_0_3px_rgba(138,180,255,0.08),0_0_20px_rgba(138,180,255,0.06)]"
          disabled={isSaving}
          onChange={(e) => setAdminUrl(e.target.value)}
          placeholder="https://admin.medusa.com"
          value={adminUrl}
        />
      </div>
      <div className="mb-3 flex flex-col gap-1">
        <label className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Storefront URL</label>
        <input
          className="rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-input)] px-3.5 py-2.5 font-sans text-sm text-[var(--text-primary)] outline-none transition-all duration-300 ease-[var(--ease-out)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)] focus:shadow-[0_0_0_3px_rgba(138,180,255,0.08),0_0_20px_rgba(138,180,255,0.06)]"
          disabled={isSaving}
          onChange={(e) => setStorefrontUrl(e.target.value)}
          placeholder="https://store.medusa.com"
          value={storefrontUrl}
        />
      </div>
      <button
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[var(--bg-secondary)] px-4 py-3 font-sans text-sm font-semibold text-[var(--text-primary)] shadow-[0_0_0_1px_var(--ring),0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-[var(--dur)] ease-[var(--ease-out)] hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_0_0_1px_var(--ring-strong),0_0_24px_var(--glow),0_12px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] active:not-disabled:translate-y-0 active:not-disabled:duration-120 disabled:cursor-not-allowed disabled:opacity-30"
        disabled={isSaving}
        onClick={handleSave}
        type="button"
      >
        <Save className="size-4" />
        {isSaving ? 'Saving...' : 'Save Config'}
      </button>
      {commerceError && <p className="mt-3 rounded-[var(--radius-sm)] border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-400">{commerceError}</p>}
      {config?.status === 'ready' && <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-400">Commerce configured successfully</p>}
    </div>
  )
}
