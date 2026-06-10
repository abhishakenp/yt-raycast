import { Bot, Trash2 } from 'lucide-react'

import { useAgentationController } from '../hooks/useAgentationController'
import styles from './AgentationPanel.module.css'

type AgentationPanelProps = {
  sessionId: string
}

export const AgentationPanel = ({ sessionId }: AgentationPanelProps) => {
  const { annotations, annotationError, isCreating, isDeleting, remove } = useAgentationController(sessionId)

  const handleDelete = async (annotationId: string) => {
    await remove(annotationId as any)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <Bot className="size-4 text-cyan-200" />
        <h2 className={styles.panelTitle}>Agentation</h2>
      </div>
      <div className={styles.annotationList}>
        {annotations?.map((ann) => (
          <div className={styles.annotationCard} key={ann.annotationId}>
            <div className={styles.annotationHeader}>
              <div className={styles.annotationContent}>
                <p className={styles.annotationLabel}>{ann.elementLabel}</p>
                <p className={styles.annotationComment}>{ann.comment}</p>
              </div>
              <button
                className={styles.deleteButton}
                disabled={isDeleting}
                onClick={() => void handleDelete(ann.annotationId)}
                type="button"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {annotations?.length === 0 && (
          <p className={styles.emptyText}>No annotations yet. Use AI agent to add annotations.</p>
        )}
      </div>
      {annotationError && <p className={styles.errorText}>{annotationError}</p>}
      {isCreating && <p className={styles.statusText}>Creating annotation...</p>}
    </div>
  )
}
