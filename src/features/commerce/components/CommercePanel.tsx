import { ShoppingCart, Save } from 'lucide-react'
import { useState } from 'react'

import { useCommerceController } from '../hooks/useCommerceController'
import styles from './CommercePanel.module.css'

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
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <ShoppingCart className="size-4 text-cyan-200" />
        <h2 className={styles.panelTitle}>Medusa Commerce</h2>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Backend URL</label>
        <input
          className={styles.input}
          disabled={isSaving}
          onChange={(e) => setBackendUrl(e.target.value)}
          placeholder="https://your-medusa-backend.com"
          value={backendUrl}
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Admin URL</label>
        <input
          className={styles.input}
          disabled={isSaving}
          onChange={(e) => setAdminUrl(e.target.value)}
          placeholder="https://admin.medusa.com"
          value={adminUrl}
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Storefront URL</label>
        <input
          className={styles.input}
          disabled={isSaving}
          onChange={(e) => setStorefrontUrl(e.target.value)}
          placeholder="https://store.medusa.com"
          value={storefrontUrl}
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
      {commerceError && <p className={styles.errorText}>{commerceError}</p>}
      {config?.status === 'ready' && <p className={styles.successText}>Commerce configured successfully</p>}
    </div>
  )
}
