import { Database, ExternalLink, RefreshCw, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useCmsController } from '../hooks/useCmsController'

type CmsPanelProps = {
  sessionId: string
}

export const CmsPanel = ({ sessionId }: CmsPanelProps) => {
  const { cmsError, config, isSaving, saveConfig } = useCmsController(sessionId)
  const [projectId, setProjectId] = useState(config?.projectId ?? '')
  const [dataset, setDataset] = useState(config?.dataset ?? '')
  const [studioBuilt, setStudioBuilt] = useState<boolean | null>(null)
  const [studioRevision, setStudioRevision] = useState(0)
  const studioUrl = useMemo(() => `/studio?session=${encodeURIComponent(sessionId)}`, [sessionId])
  const studioFrameUrl = `${studioUrl}&embed=1&rev=${studioRevision}`

  useEffect(() => {
    let cancelled = false
    void fetch('/api/studio-embed-ready')
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setStudioBuilt(data?.built === true)
      })
      .catch(() => {
        if (!cancelled) setStudioBuilt(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    await saveConfig(projectId || undefined, dataset || undefined, undefined)
  }

  return (
    <div className="rounded-[var(--radius-xl)] bg-[var(--glass-bg)] p-4 shadow-[var(--glass-shadow)] border border-[var(--glass-border)] backdrop-blur-[12px]">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-primary)] pb-2">
        <Database className="size-4 text-cyan-200" />
        <h2 className="m-0 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)]">Sanity CMS</h2>
      </div>
      <div className="mb-3 flex flex-col gap-1">
        <label className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Project ID</label>
        <input
          className="rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-input)] px-3.5 py-2.5 font-sans text-sm text-[var(--text-primary)] outline-none transition-all duration-300 ease-[var(--ease-out)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)] focus:shadow-[0_0_0_3px_rgba(138,180,255,0.08),0_0_20px_rgba(138,180,255,0.06)]"
          disabled={isSaving}
          onChange={(e) => setProjectId(e.target.value)}
          placeholder="your-project-id"
          value={projectId}
        />
      </div>
      <div className="mb-3 flex flex-col gap-1">
        <label className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Dataset</label>
        <input
          className="rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-input)] px-3.5 py-2.5 font-sans text-sm text-[var(--text-primary)] outline-none transition-all duration-300 ease-[var(--ease-out)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)] focus:shadow-[0_0_0_3px_rgba(138,180,255,0.08),0_0_20px_rgba(138,180,255,0.06)]"
          disabled={isSaving}
          onChange={(e) => setDataset(e.target.value)}
          placeholder="production"
          value={dataset}
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
      {cmsError && <p className="mt-3 rounded-[var(--radius-sm)] border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-400">{cmsError}</p>}
      {config?.status === 'ready' && <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-400">CMS configured successfully</p>}

      <section className="mt-4 grid gap-3 border-t border-[var(--border-primary)] pt-4" aria-label="Sanity Studio">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="m-0 text-[0.82rem] uppercase tracking-[0.12em] text-[var(--text-primary)]">Studio</h3>
            <p className="m-0 text-xs leading-[1.45] text-[var(--text-muted)]">Open the embedded Sanity Studio for this session.</p>
          </div>
          <a className="inline-flex min-h-8 cursor-pointer items-center justify-center gap-[0.45rem] rounded-full border border-[var(--ring)] bg-white/[0.055] px-3 py-[0.45rem] text-xs font-bold text-[var(--text-primary)] no-underline" href={studioUrl} rel="noreferrer" target="_blank">
            <ExternalLink className="size-4" />
            Open
          </a>
        </div>

        {studioBuilt === false && (
          <div className="rounded-[var(--radius-sm)] border border-amber-400/25 bg-amber-400/10 p-3">
            <p className="m-0 mb-[0.35rem] text-[0.76rem] font-extrabold uppercase tracking-[0.08em] text-amber-200">Sanity Studio is not built yet.</p>
            <p className="m-0 text-xs leading-[1.45] text-[var(--text-muted)] [&_code]:text-cyan-200">
              Run <code>bun run studio:build</code> from the project root, then reload this panel.
            </p>
          </div>
        )}

        {studioBuilt !== false && (
          <>
            <div className="flex items-center justify-between gap-3">
              <button
                className="inline-flex min-h-8 cursor-pointer items-center justify-center gap-[0.45rem] rounded-full border border-[var(--ring)] bg-white/[0.055] px-3 py-[0.45rem] text-xs font-bold text-[var(--text-primary)]"
                onClick={() => setStudioRevision((value) => value + 1)}
                type="button"
              >
                <RefreshCw className="size-4" />
                Reload Studio
              </button>
              <span className="m-0 text-xs leading-[1.45] text-[var(--text-muted)]">{studioBuilt === null ? 'Checking Studio build...' : 'Studio ready'}</span>
            </div>
            <iframe
              className="min-h-[360px] w-full rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[#070a12]"
              key={studioFrameUrl}
              src={studioFrameUrl}
              title="Sanity Studio"
            />
          </>
        )}
      </section>
    </div>
  )
}
