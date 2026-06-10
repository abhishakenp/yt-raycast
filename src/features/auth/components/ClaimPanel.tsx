import { User } from 'lucide-react'

import { useAuthController } from '../hooks/useAuthController'
import styles from './ClaimPanel.module.css'

type ClaimPanelProps = {
  sessionId: string
}

export const ClaimPanel = ({ sessionId }: ClaimPanelProps) => {
  const { canClaim, claimError, claimSession, isAnonymousOwner, isClaiming, isOwned, userId } =
    useAuthController(sessionId)

  if (!isAnonymousOwner && !isOwned) {
    return null
  }

  if (isOwned) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <User className="size-4 text-cyan-200" />
          <h2 className={styles.panelTitle}>Account</h2>
        </div>
        <div className={styles.successCard}>
          <p className="font-medium">Owned by you</p>
          <p className="mt-1 text-xs text-emerald-200/80">User ID: {userId?.slice(0, 8)}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <User className="size-4 text-cyan-200" />
        <h2 className={styles.panelTitle}>Claim Project</h2>
      </div>
      <p className={styles.panelText}>
        This is an anonymous session. Sign in to claim it and access it across devices.
      </p>
      <button
        className={styles.primaryButton}
        disabled={!canClaim}
        onClick={() => void claimSession()}
        type="button"
      >
        <User className="size-4" />
        {isClaiming ? 'Claiming...' : 'Claim this project'}
      </button>
      {claimError && <p className={styles.errorText}>{claimError}</p>}
    </div>
  )
}
