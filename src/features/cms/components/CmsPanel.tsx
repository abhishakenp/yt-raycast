import { Database, ExternalLink, RefreshCw, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useCmsController } from '../hooks/useCmsController'
import styles from './CmsPanel.module.css'

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
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <Database className="size-4 text-cyan-200" />
        <h2 className={styles.panelTitle}>Sanity CMS</h2>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Project ID</label>
        <input
          className={styles.input}
          disabled={isSaving}
          onChange={(e) => setProjectId(e.target.value)}
          placeholder="your-project-id"
          value={projectId}
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Dataset</label>
        <input
          className={styles.input}
          disabled={isSaving}
          onChange={(e) => setDataset(e.target.value)}
          placeholder="production"
          value={dataset}
        />
      </div>
      <button
        className={styles.primaryButton}
        disabled={isSaving}
        onClick={handleSave}
        type="button"
      >
        <Save className="size-4" />
        {isSaving ? 'Saving...' : 'Save Config'}
      </button>
      {cmsError && <p className={styles.errorText}>{cmsError}</p>}
      {config?.status === 'ready' && <p className={styles.successText}>CMS configured successfully</p>}

      <section className={styles.studioPanel} aria-label="Sanity Studio">
        <div className={styles.studioHeader}>
          <div>
            <h3>Studio</h3>
            <p>Open the embedded Sanity Studio for this session.</p>
          </div>
          <a className={styles.studioOpenLink} href={studioUrl} rel="noreferrer" target="_blank">
            <ExternalLink className="size-4" />
            Open
          </a>
        </div>

        {studioBuilt === false && (
          <div className={styles.studioUnbuilt}>
            <p className={styles.studioUnbuiltTitle}>Sanity Studio is not built yet.</p>
            <p className={styles.studioUnbuiltBody}>
              Run <code>bun run studio:build</code> from the project root, then reload this panel.
            </p>
          </div>
        )}

        {studioBuilt !== false && (
          <>
            <div className={styles.studioToolbar}>
              <button
                className={styles.studioSyncButton}
                onClick={() => setStudioRevision((value) => value + 1)}
                type="button"
              >
                <RefreshCw className="size-4" />
                Reload Studio
              </button>
              <span>{studioBuilt === null ? 'Checking Studio build...' : 'Studio ready'}</span>
            </div>
            <iframe
              className={styles.studioFrame}
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
